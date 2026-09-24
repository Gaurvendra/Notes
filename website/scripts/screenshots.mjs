#!/usr/bin/env node
// Takes light/dark/mobile screenshots of pages from a running preview server (QA helper), and reports page errors
// and anything that makes a page wider than a phone screen.
// Usage: node scripts/screenshots.mjs <outDir> <path> [<path>...]   (BASE_URL defaults to http://localhost:4321)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [outDir, ...paths] = process.argv.slice(2);
const base = process.env.BASE_URL ?? 'http://localhost:4321';
const exe = fs.existsSync('/opt/pw-browsers')
	? fs.readdirSync('/opt/pw-browsers').filter((d) => /^chromium-\d+$/.test(d)).map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`).find((p) => fs.existsSync(p))
	: undefined;
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
fs.mkdirSync(outDir, { recursive: true });
const variants = [
	{ name: 'dark', theme: 'dark', viewport: { width: 1280, height: 900 } },
	{ name: 'light', theme: 'light', viewport: { width: 1280, height: 900 } },
	{ name: 'mobile', theme: 'light', viewport: { width: 390, height: 844 } },
];
const errors = [];
for (const p of paths) {
	for (const v of variants) {
		const ctx = await browser.newContext({ viewport: v.viewport, colorScheme: v.theme });
		await ctx.addInitScript((t) => localStorage.setItem('starlight-theme', t), v.theme);
		const page = await ctx.newPage();
		page.on('pageerror', (e) => errors.push(`${p} [${v.name}] pageerror: ${e.message}`));
		page.on('console', (m) => m.type() === 'error' && errors.push(`${p} [${v.name}] console: ${m.text()}`));
		const res = await page.goto(base + p, { waitUntil: 'networkidle' });
		if (!res || res.status() >= 400) errors.push(`${p}: HTTP ${res?.status()}`);
		await page.waitForTimeout(600);
		if (v.name === 'mobile') {
			// Anything that widens the page beyond the phone viewport (ignoring content inside scroll containers)
			const overflow = await page.evaluate(() => {
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
			for (const o of overflow) errors.push(`${p} [mobile] wider than the screen: ${o}`);
		}
		const file = path.join(outDir, `${p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'}-${v.name}.png`);
		await page.screenshot({ path: file, fullPage: true });
		console.log(file);
		await ctx.close();
	}
}
await browser.close();
if (errors.length) {
	console.error('ERRORS:\n' + errors.join('\n'));
	process.exitCode = 1;
}
