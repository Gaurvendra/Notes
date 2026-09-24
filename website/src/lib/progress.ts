// Per-browser learning progress. Stored in localStorage; every access is guarded because storage can be unavailable
// (private windows, blocked site data). Progress is a convenience: pages work fully without it.
const KEY = 'jmt-progress-v1';
export const PROGRESS_EVENT = 'jmt-progress-change';

export function getCompleted(): Set<string> {
	try {
		const raw = localStorage.getItem(KEY);
		const ids: unknown = raw ? JSON.parse(raw) : [];
		return new Set(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string') : []);
	} catch {
		return new Set();
	}
}

export function setCompleted(id: string, done: boolean): void {
	const set = getCompleted();
	if (done) set.add(id);
	else set.delete(id);
	try {
		localStorage.setItem(KEY, JSON.stringify([...set]));
	} catch {
		/* storage unavailable: keep working without persistence */
	}
	window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

export interface GraphLesson {
	id: string;
	label: string;
	tier: number;
	prereqs: string[];
	url: string;
	status: string;
}

/** Lessons whose prerequisites are all completed and that aren't completed yet, in build order. */
export function unlocked(lessons: GraphLesson[], done: Set<string>): GraphLesson[] {
	return lessons.filter((l) => !done.has(l.id) && l.prereqs.every((p) => done.has(p)));
}

export function readGraph(): { tiers: { n: number; name: string; level: string }[]; lessons: GraphLesson[] } | undefined {
	const el = document.querySelector('script[data-jmt-graph]');
	if (!el?.textContent) return undefined;
	try {
		return JSON.parse(el.textContent);
	} catch {
		return undefined;
	}
}
