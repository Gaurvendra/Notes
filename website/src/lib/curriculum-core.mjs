// Loads and validates project-plan/curriculum.yaml (the single source of truth for the learning DAG).
// Plain ESM so it can be used both by astro.config.mjs (sidebar) and by components at build time.
import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';

/** Repo root: the website is built from `website/`, so the repo root is one level up (override with JMT_REPO_ROOT). */
export const REPO_ROOT = process.env.JMT_REPO_ROOT
	? path.resolve(process.env.JMT_REPO_ROOT)
	: path.resolve(process.cwd(), '..');
export const CURRICULUM_PATH = path.join(REPO_ROOT, 'project-plan', 'curriculum.yaml');
export const JAVA_TRACK_ROOT = path.join(REPO_ROOT, 'java-track');

export const LEVEL_STYLE = {
	Beginner: { key: 'beginner', emoji: '🟢' },
	Intermediate: { key: 'intermediate', emoji: '🔵' },
	Advanced: { key: 'advanced', emoji: '🟣' },
	Expert: { key: 'expert', emoji: '🟠' },
};

let cached;

/** Returns the validated curriculum (cached per process). Throws with a clear message on an invalid graph. */
export function loadCurriculum() {
	if (cached) return cached;
	if (!fs.existsSync(CURRICULUM_PATH)) {
		throw new Error(`curriculum.yaml not found at ${CURRICULUM_PATH}. Build from website/ or set JMT_REPO_ROOT.`);
	}
	const raw = loadYaml(fs.readFileSync(CURRICULUM_PATH, 'utf8'));
	const levelOfTier = new Map();
	for (const level of raw.levels) for (const t of level.tiers) levelOfTier.set(t, level.name);
	const tiers = Object.entries(raw.tiers)
		.map(([n, name]) => ({ n: Number(n), name, level: levelOfTier.get(Number(n)) }))
		.sort((a, b) => a.n - b.n);
	const errors = [];
	const byId = new Map();
	raw.lessons.forEach((l, index) => {
		if (byId.has(l.id)) errors.push(`duplicate lesson id ${l.id}`);
		byId.set(l.id, {
			...l,
			status: l.status ?? 'todo',
			level: levelOfTier.get(l.tier),
			index,
			unlocks: [],
			url: `/lessons/${l.id}/`,
		});
	});
	for (const l of byId.values()) {
		if (!levelOfTier.has(l.tier)) errors.push(`${l.id}: unknown tier ${l.tier}`);
		for (const p of l.prereqs) {
			const pre = byId.get(p);
			if (!pre) errors.push(`${l.id}: unknown prerequisite ${p}`);
			else {
				if (pre.tier > l.tier) errors.push(`${l.id} depends on later-tier ${p}`);
				pre.unlocks.push(l.id);
			}
		}
	}
	// Kahn's algorithm, stable by (tier, file order): the build order and the prev/next order of the site.
	const indeg = new Map([...byId.keys()].map((id) => [id, 0]));
	for (const l of byId.values()) for (const p of l.prereqs) if (byId.has(p)) indeg.set(l.id, indeg.get(l.id) + 1);
	const key = (id) => [byId.get(id).tier, byId.get(id).index];
	const cmp = (a, b) => key(a)[0] - key(b)[0] || key(a)[1] - key(b)[1];
	const ready = [...indeg].filter(([, d]) => d === 0).map(([id]) => id).sort(cmp);
	const topo = [];
	while (ready.length) {
		const id = ready.shift();
		topo.push(id);
		for (const c of byId.get(id).unlocks) {
			indeg.set(c, indeg.get(c) - 1);
			if (indeg.get(c) === 0) {
				ready.push(c);
				ready.sort(cmp);
			}
		}
	}
	if (topo.length !== byId.size) errors.push(`cycle among: ${[...byId.keys()].filter((id) => !topo.includes(id)).join(', ')}`);
	if (errors.length) throw new Error(`Invalid curriculum.yaml:\n  - ${errors.join('\n  - ')}`);
	topo.forEach((id, i) => (byId.get(id).order = i));
	const lessons = topo.map((id) => byId.get(id));
	cached = { version: raw.version, levels: raw.levels, tiers, lessons, byId };
	return cached;
}

/** Lesson id for a Starlight entry id like `lessons/floating-point`, else undefined. */
export function lessonIdFromEntry(entryId) {
	const m = /^lessons\/([a-z0-9-]+)$/.exec(entryId ?? '');
	return m ? m[1] : undefined;
}

/** Tier number for a checkpoint entry id like `checkpoints/tier-3`, else undefined. */
export function checkpointTierFromEntry(entryId) {
	const m = /^checkpoints\/tier-(\d+)$/.exec(entryId ?? '');
	return m ? Number(m[1]) : undefined;
}

/** All lesson ids that must be completed before `id` (transitive closure of prerequisites). */
export function ancestorsOf(id) {
	const { byId } = loadCurriculum();
	const seen = new Set();
	const stack = [...byId.get(id).prereqs];
	while (stack.length) {
		const p = stack.pop();
		if (!seen.has(p)) {
			seen.add(p);
			stack.push(...byId.get(p).prereqs);
		}
	}
	return seen;
}

/** Starlight sidebar generated from the curriculum: Start here → levels → tiers → lessons + checkpoint → hubs. */
export function buildSidebar() {
	const { levels, tiers, lessons } = loadCurriculum();
	return [
		{
			label: 'Start here',
			items: [
				{ label: 'Welcome', link: '/' },
				{ slug: 'start-here' },
				{ slug: 'roadmap' },
			],
		},
		...levels.map((level) => ({
			label: `${LEVEL_STYLE[level.name].emoji} ${level.name}`,
			collapsed: false,
			items: tiers
				.filter((t) => level.tiers.includes(t.n))
				.map((t) => ({
					label: `T${t.n} · ${t.name}`,
					collapsed: true,
					items: [
						...lessons
							.filter((l) => l.tier === t.n)
							.map((l) => ({ label: l.label, slug: `lessons/${l.id}` })),
						{ label: `✓ Checkpoint ${t.n}`, slug: `checkpoints/tier-${t.n}` },
					],
				})),
		})),
		{
			label: 'Hubs',
			items: [
				{ slug: 'interview' },
				{ slug: 'practice' },
				{ slug: 'cheatsheets' },
				{ slug: 'glossary' },
				{ slug: 'java-versions' },
				{ slug: 'notes-audit' },
			],
		},
	];
}

/** Human names for the user's source-note keys used in curriculum.yaml. */
export const NOTE_NAMES = {
	'01': 'OOPS Concepts',
	'02': 'JDK, JRE, JVM',
	'04': 'Primitive Variables',
	'06': 'Non-Primitive Variables',
	'07': 'Methods',
	'08': 'Constructors',
	'09': 'Memory Management',
	'12-13': 'POJO, Enum, Singleton Classes',
	'14-15': 'Interfaces',
	'16': 'Functional Interfaces & Lambdas',
	'17': 'Reflection',
	'18': 'Annotations',
	'19': 'Exception Handling',
	'20': 'Operators',
	'21': 'Control Flow',
	'28': 'Streams',
	'40': 'Sequenced Collections',
	'41': 'Sealed Classes',
	Optional: 'Optional',
	gap: 'Gap-fill (related topic not in the notes)',
};

/** Compact graph data for client-side progress features (roadmap colouring, "next up"). */
export function clientGraph() {
	const { lessons, tiers } = loadCurriculum();
	return {
		tiers: tiers.map((t) => ({ n: t.n, name: t.name, level: t.level })),
		lessons: lessons.map((l) => ({ id: l.id, label: l.label, tier: l.tier, prereqs: l.prereqs, url: l.url, status: l.status })),
	};
}
