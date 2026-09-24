// Reads code from ../java-track at build time. Snippet rules mirror track.testkit.Snippets exactly:
// marker lines `// @snippet:start name` / `// @snippet:end name` are removed; a region is de-indented by its common
// leading whitespace; regions may nest.
import fs from 'node:fs';
import path from 'node:path';
import { JAVA_TRACK_ROOT } from './curriculum-core.mjs';

const MARKER = /^\s*\/\/ @snippet:(start|end) ([a-z0-9][a-z0-9-]*)\s*$/;

/** Absolute path of a file inside java-track (throws a helpful error if missing). */
export function javaTrackPath(rel) {
	const abs = path.resolve(JAVA_TRACK_ROOT, rel);
	if (!abs.startsWith(JAVA_TRACK_ROOT)) throw new Error(`Path escapes java-track: ${rel}`);
	if (!fs.existsSync(abs)) throw new Error(`java-track file not found: ${rel} (looked in ${abs})`);
	return abs;
}

export function readJavaTrackFile(rel) {
	return fs.readFileSync(javaTrackPath(rel), 'utf8').replace(/\r\n/g, '\n');
}

/** Whole file without snippet markers and without trailing blank lines. */
export function stripMarkers(text) {
	return text
		.split('\n')
		.filter((l) => !MARKER.test(l))
		.join('\n')
		.replace(/\s+$/, '');
}

export function dedent(lines) {
	const indents = lines.filter((l) => l.trim() !== '').map((l) => l.length - l.trimStart().length);
	const indent = indents.length ? Math.min(...indents) : 0;
	return lines.map((l) => (l.trim() === '' ? '' : l.slice(indent))).join('\n');
}

/** Text of region `name` (markers of any nested regions removed), de-indented. */
export function extractSnippet(text, name, fileForErrors = 'file') {
	const out = [];
	let inside = false;
	let found = false;
	for (const line of text.split('\n')) {
		const m = MARKER.exec(line);
		if (m) {
			if (m[2] === name) {
				inside = m[1] === 'start';
				found = true;
			}
			continue;
		}
		if (inside) out.push(line);
	}
	if (!found) throw new Error(`No snippet region '${name}' in ${fileForErrors}`);
	return dedent(out);
}

/** Golden output file for an examples main class: examples/src/main/java/a/b/C.java → examples/src/test/resources/outputs/a/b/C.txt */
export function goldenPathFor(rel) {
	const m = /^examples\/src\/main\/java\/(.+)\.java$/.exec(rel);
	if (!m) throw new Error(`Output is only available for examples/src/main/java files, got ${rel}`);
	return `examples/src/test/resources/outputs/${m[1]}.txt`;
}

/** Test class conventionally paired with a source file: .../main/java/a/B.java → .../test/java/a/BTest.java */
export function testPathFor(rel) {
	return rel.replace('/src/main/java/', '/src/test/java/').replace(/\.java$/, 'Test.java');
}

/** All files of a compile-result case: examples/src/test/resources/compile-errors/<case>/ */
export function readCompileCase(caseId) {
	const dir = javaTrackPath(`examples/src/test/resources/compile-errors/${caseId}`);
	const files = [];
	const walk = (d) => {
		for (const f of fs.readdirSync(d).sort()) {
			const p = path.join(d, f);
			if (fs.statSync(p).isDirectory()) walk(p);
			else if (f.endsWith('.java')) files.push({ name: path.relative(dir, p), code: fs.readFileSync(p, 'utf8').trimEnd() });
		}
	};
	walk(dir);
	const expected = fs.readFileSync(path.join(dir, 'expected.txt'), 'utf8').trim();
	return { files, expected, compiles: expected === 'COMPILES OK' };
}
