#!/usr/bin/env node
// Checks every internal link (and #anchor) in the built site (dist/). No network access needed.
// Usage: node scripts/check-links.mjs [distDir]
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
const pages = new Map(); // url path -> { ids:Set, hrefs:string[] }
const walk = (dir) => {
	for (const f of fs.readdirSync(dir)) {
		const p = path.join(dir, f);
		if (fs.statSync(p).isDirectory()) walk(p);
		else if (f.endsWith('.html')) {
			const html = fs.readFileSync(p, 'utf8');
			let url = '/' + path.relative(dist, p).replace(/\\/g, '/');
			url = url.endsWith('/index.html') ? url.slice(0, -'index.html'.length) : url;
			const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
			const hrefs = [...html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]);
			pages.set(url, { ids, hrefs });
		}
	}
};
walk(dist);

const problems = [];
const exists = (p) => pages.has(p) || fs.existsSync(path.join(dist, decodeURIComponent(p)));
for (const [from, { hrefs }] of pages) {
	for (const raw of hrefs) {
		if (/^(https?:|mailto:|tel:|javascript:)/.test(raw) || raw.startsWith('//')) continue;
		const url = new URL(raw, 'http://site' + from);
		if (url.host !== 'site') continue;
		const target = url.pathname;
		if (!exists(target)) {
			problems.push(`${from} → ${raw}: page not found`);
			continue;
		}
		if (url.hash && pages.has(target)) {
			const id = decodeURIComponent(url.hash.slice(1));
			if (id && !pages.get(target).ids.has(id)) problems.push(`${from} → ${raw}: anchor #${id} not found`);
		}
	}
}
if (problems.length) {
	console.error(`${problems.length} broken link(s):\n` + [...new Set(problems)].join('\n'));
	process.exit(1);
}
console.log(`OK: ${pages.size} pages, all internal links and anchors resolve`);
