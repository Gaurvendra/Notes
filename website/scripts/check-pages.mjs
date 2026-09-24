#!/usr/bin/env node
// Opens every finished page (not the generated stubs) of the built site in a real browser and fails on:
// JavaScript errors, console errors, or anything that makes the page wider than a phone screen (390 px).
// Runs in CI after `npm run build`; starts its own `astro preview`. Locally: `npm run build && npm run check:pages`.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DOCS = 'src/content/docs';
const PORT = 4329;
const base = `http://localhost:${PORT}`;

function routes() {
	const out = [];
	const walk = (dir) => {
		for (const f of fs.readdirSync(dir)) {
			const p = path.join(dir, f);
			if (fs.statSync(p).isDirectory()) walk(p);
			else if (/\.mdx?$/.test(f) && !f.startsWith('404')) {
				if (/^stub:\s*true\s*$/m.test(fs.readFileSync(p, 'utf8'))) continue;
				const rel = path.relative(DOCS, p).replace(/\\/g, '/').replace(/\.mdx?$/, '');
				out.push(rel === 'index' ? '/' : `/${rel.replace(/\/index$/, '')}/`);
			}
		}
	};
	walk(DOCS);
	return out.sort();
}

async function waitForServer() {
	for (let i = 0; i < 60; i++) {
		try {
			if ((await fetch(base)).ok) return;
		} catch {}
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error('astro preview did not start');
}

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore', detached: true });
const problems = [];
try {
	await waitForServer();
	const local = fs.existsSync('/opt/pw-browsers')
		? fs.readdirSync('/opt/pw-browsers').filter((d) => /^chromium-\d+$/.test(d)).map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`).find((p) => fs.existsSync(p))
		: undefined;
	const browser = await chromium.launch({ executablePath: local, args: ['--no-sandbox'] });
	const pages = routes();
	for (const route of pages) {
		for (const v of [
			{ name: 'mobile', width: 390, height: 844, theme: 'light' },
			{ name: 'desktop', width: 1280, height: 900, theme: 'dark' },
		]) {
			const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, colorScheme: v.theme });
			await ctx.addInitScript((t) => localStorage.setItem('starlight-theme', t), v.theme);
			const page = await ctx.newPage();
			page.on('pageerror', (e) => problems.push(`${route} [${v.name}] JavaScript error: ${e.message}`));
			page.on('console', (m) => m.type() === 'error' && problems.push(`${route} [${v.name}] console error: ${m.text()}`));
			const res = await page.goto(base + route, { waitUntil: 'networkidle' });
			if (!res || res.status() >= 400) problems.push(`${route}: HTTP ${res?.status()}`);
			await page.waitForTimeout(400);
			if (v.name === 'mobile') {
				const wide = await page.evaluate(() => {
					const vw = document.documentElement.clientWidth;
					const clipped = (el) => {
						for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
							if (getComputedStyle(a).overflowX !== 'visible' && a.getBoundingClientRect().right <= vw + 1) return true;
						}
						return false;
					};
					return [...document.querySelectorAll('body *')]
						.filter((el) => el.getBoundingClientRect().right > vw + 1 && el.getBoundingClientRect().width > 0 && !clipped(el))
						.slice(0, 3)
						.map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}: "${(el.textContent || '').trim().slice(0, 40)}"`);
				});
				for (const w of wide) problems.push(`${route} [mobile] wider than the screen: ${w}`);
			}
			await ctx.close();
		}
	}
	await browser.close();
	if (problems.length) {
		console.error(problems.join('\n'));
		console.error(`FAILED: ${problems.length} problem(s) on ${pages.length} pages`);
		process.exitCode = 1;
	} else {
		console.log(`OK: ${pages.length} finished pages load without errors and fit a 390 px screen`);
	}
} finally {
	try {
		process.kill(-server.pid);
	} catch {}
}
