#!/usr/bin/env node
// Ensures every lesson in curriculum.yaml and every tier checkpoint has a page, creating "being written" stubs for the
// missing ones. Never touches a page without `stub: true` in its front-matter (i.e. a real, authored page).
// Usage: node scripts/sync-stubs.mjs [--check]   (--check: exit 1 if anything is missing or orphaned; writes nothing)
import fs from 'node:fs';
import path from 'node:path';
import { loadCurriculum } from '../src/lib/curriculum-core.mjs';

const DOCS = path.resolve('src/content/docs');
const check = process.argv.includes('--check');
const { lessons, tiers } = loadCurriculum();
const problems = [];
let created = 0;

function ensure(file, content) {
	if (fs.existsSync(file)) return;
	if (check) {
		problems.push(`missing page: ${path.relative(process.cwd(), file)}`);
		return;
	}
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
	created++;
}

const yamlString = (s) => JSON.stringify(s); // JSON strings are valid YAML scalars

for (const l of lessons) {
	ensure(
		path.join(DOCS, 'lessons', `${l.id}.mdx`),
		`---
title: ${yamlString(l.label)}
description: ${yamlString(l.title)}
stub: true
---
import LessonStub from '../../../components/LessonStub.astro';

<LessonStub />
`,
	);
}

for (const t of tiers) {
	ensure(
		path.join(DOCS, 'checkpoints', `tier-${t.n}.mdx`),
		`---
title: ${yamlString(`Checkpoint ${t.n}: ${t.name}`)}
description: ${yamlString(`Level-up checkpoint for tier ${t.n} (${t.name}): quiz, coding challenge and mock-interview round.`)}
stub: true
---
import CheckpointStub from '../../../components/CheckpointStub.astro';

<CheckpointStub tier={${t.n}} />
`,
	);
}

// Orphans: lesson pages whose id is no longer in the curriculum.
const lessonDir = path.join(DOCS, 'lessons');
if (fs.existsSync(lessonDir)) {
	const ids = new Set(lessons.map((l) => l.id));
	for (const f of fs.readdirSync(lessonDir)) {
		const id = f.replace(/\.mdx?$/, '');
		if (!ids.has(id)) problems.push(`orphan lesson page (not in curriculum.yaml): lessons/${f}`);
	}
}

if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log(check ? `OK: all ${lessons.length} lessons and ${tiers.length} checkpoints have pages` : `created ${created} stub page(s)`);
