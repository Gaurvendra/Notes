#!/usr/bin/env node
// Opens every route of the built app (home, hubs, every lesson with a guide, one outline lesson, every written
// checkpoint and one without content) in a real browser, on a phone (390 px, light) and a desktop (1280 px, dark), and
// fails on JavaScript errors, console errors, or anything wider than the phone screen. Runs after `npm run build`;
// starts its own `vite preview`.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const PORT = 4329
const base = `http://localhost:${PORT}`
const lessons = fs.readdirSync('src/content/lessons').filter((f) => f.endsWith('.mdx')).map((f) => `/lessons/${f.replace(/\.mdx$/, '')}/`)
const checkpoints = fs.readdirSync('src/content/checkpoints').filter((f) => /^tier-\d+\.mdx$/.test(f)).map((f) => `/checkpoints/${f.match(/\d+/)[0]}`)
const routes = ['/', '/start', '/path', '/revision', '/practice', '/interview', '/cheatsheets', '/glossary', '/java-versions', '/notes-audit', '/profile', '/settings', '/checkpoints/2', '/lessons/java-landscape/', '/no-such-page', ...checkpoints, ...lessons]

/** Elements sticking out of the viewport (unless a scrolling ancestor clips them). */
function wideElements(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const clipped = (el) => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflowX !== 'visible' && a.getBoundingClientRect().right <= vw + 1) return true
      }
      return false
    }
    return [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > vw + 1 && el.getBoundingClientRect().width > 0 && !clipped(el))
      .slice(0, 3)
      .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join('.')}: "${(el.textContent || '').trim().slice(0, 40)}"`)
  })
}

/** Focus mode and the lesson timer, driven the way a learner would: keys F, T and Esc, then leaving the lesson. */
async function checkFocusAndTimer(browser) {
  const lessonId = 'loops-and-branching'
  for (const v of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1280, height: 900 },
  ]) {
    const where = `focus mode and timer [${v.name}]`
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => problems.push(`${where} JavaScript error: ${e.message}`))
    await page.goto(`${base}/lessons/${lessonId}/`, { waitUntil: 'networkidle' })
    const clock = page.locator('.jx-timer .jx-timer__clock')
    const t0 = await clock.textContent()
    await page.waitForTimeout(2200)
    const t1 = await clock.textContent()
    if (!t0 || t0 === t1) problems.push(`${where}: the timer did not start by itself (${t0} → ${t1})`)

    await page.keyboard.press('f')
    await page.waitForTimeout(400)
    const on = await page.evaluate(() => ({
      attr: document.documentElement.dataset.focus,
      header: Boolean(document.querySelector('header.sticky')),
      bar: Boolean(document.querySelector('.jx-focusbar')),
      card: Boolean(document.querySelector('.jx-timer')),
    }))
    if (on.attr !== 'on' || on.header || !on.bar || on.card) problems.push(`${where}: F did not switch focus mode on (${JSON.stringify(on)})`)
    if (v.name === 'mobile') for (const w of await wideElements(page)) problems.push(`${where}: wider than the screen: ${w}`)

    await page.keyboard.press('t')
    await page.waitForTimeout(300)
    const saved = await page.evaluate((id) => JSON.parse(localStorage.getItem('jmt:progress:v2') || '{}').time?.[id] ?? 0, lessonId)
    if (saved < 2) problems.push(`${where}: pausing with T did not save the time (${saved} s)`)
    const focusClock = page.locator('.jx-focusbar .jx-timer__clock')
    const p0 = await focusClock.textContent()
    await page.waitForTimeout(1300)
    if ((await focusClock.textContent()) !== p0) problems.push(`${where}: the timer kept running after T`)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    const off = await page.evaluate(() => ({ attr: document.documentElement.dataset.focus ?? null, header: Boolean(document.querySelector('header.sticky')) }))
    if (off.attr !== null || !off.header) problems.push(`${where}: Esc did not leave focus mode (${JSON.stringify(off)})`)

    await page.keyboard.press('f')
    await page.waitForTimeout(300)
    await page.evaluate(() => {
      history.pushState({}, '', '/path')
      dispatchEvent(new PopStateEvent('popstate'))
    })
    await page.waitForTimeout(400)
    const left = await page.evaluate(() => document.documentElement.dataset.focus ?? null)
    if (left !== null) problems.push(`${where}: focus mode stayed on after leaving the lesson`)
    await ctx.close()
  }
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('vite preview did not start')
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', detached: true })
const problems = []
try {
  await waitForServer()
  const local = fs.existsSync('/opt/pw-browsers')
    ? fs.readdirSync('/opt/pw-browsers').filter((d) => /^chromium-\d+$/.test(d)).map((d) => path.join('/opt/pw-browsers', d, 'chrome-linux/chrome')).find((p) => fs.existsSync(p))
    : undefined
  const browser = await chromium.launch({ executablePath: local, args: ['--no-sandbox'] })
  for (const route of routes) {
    for (const v of [
      { name: 'mobile', width: 390, height: 844, mode: 'light' },
      { name: 'desktop', width: 1280, height: 900, mode: 'dark' },
    ]) {
      const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } })
      await ctx.addInitScript((mode) => localStorage.setItem('jmt:theme:v1', JSON.stringify({ theme: 'cyber', mode })), v.mode)
      const page = await ctx.newPage()
      page.on('pageerror', (e) => problems.push(`${route} [${v.name}] JavaScript error: ${e.message}`))
      page.on('console', (m) => m.type() === 'error' && problems.push(`${route} [${v.name}] console error: ${m.text()}`))
      const res = await page.goto(base + route, { waitUntil: 'networkidle' })
      if (!res || res.status() >= 400) problems.push(`${route}: HTTP ${res?.status()}`)
      await page.waitForTimeout(500)
      if (route.startsWith('/lessons/') && lessons.includes(route)) {
        const words = await page.evaluate(() => document.querySelector('article')?.innerText.split(/\s+/).length ?? 0)
        if (words < 1000) problems.push(`${route} [${v.name}] lesson content did not render (${words} words)`)
      }
      if (v.name === 'mobile') {
        for (const w of await wideElements(page)) problems.push(`${route} [mobile] wider than the screen: ${w}`)
      }
      await ctx.close()
    }
  }
  await checkFocusAndTimer(browser)
  await browser.close()
  if (problems.length) {
    console.error(problems.join('\n'))
    console.error(`FAILED: ${problems.length} problem(s) on ${routes.length} routes`)
    process.exitCode = 1
  } else {
    console.log(`OK: ${routes.length} routes load without errors and fit a 390 px screen; focus mode and the lesson timer work`)
  }
} finally {
  try {
    process.kill(-server.pid)
  } catch {}
}
