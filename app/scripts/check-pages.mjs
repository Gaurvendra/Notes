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
        const wide = await page.evaluate(() => {
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
        for (const w of wide) problems.push(`${route} [mobile] wider than the screen: ${w}`)
      }
      await ctx.close()
    }
  }
  await browser.close()
  if (problems.length) {
    console.error(problems.join('\n'))
    console.error(`FAILED: ${problems.length} problem(s) on ${routes.length} routes`)
    process.exitCode = 1
  } else {
    console.log(`OK: ${routes.length} routes load without errors and fit a 390 px screen`)
  }
} finally {
  try {
    process.kill(-server.pid)
  } catch {}
}
