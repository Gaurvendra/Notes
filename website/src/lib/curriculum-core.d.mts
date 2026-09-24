// Types for curriculum-core.mjs (plain JS so astro.config.mjs can import it without a build step).

export type LevelName = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Level {
	name: LevelName;
	tiers: number[];
}

export interface Tier {
	n: number;
	name: string;
	level: LevelName;
}

export interface Lesson {
	id: string;
	label: string;
	title: string;
	tier: number;
	prereqs: string[];
	sources: string[];
	audit: string[];
	status: 'todo' | 'drafting' | 'review' | 'done';
	level: LevelName;
	/** Position in curriculum.yaml. */
	index: number;
	/** Position in the topological build order. */
	order: number;
	unlocks: string[];
	url: string;
}

export interface Curriculum {
	version: number;
	levels: Level[];
	tiers: Tier[];
	/** Lessons in topological (build) order. */
	lessons: Lesson[];
	byId: Map<string, Lesson>;
}

export const REPO_ROOT: string;
export const CURRICULUM_PATH: string;
export const JAVA_TRACK_ROOT: string;
export const LEVEL_STYLE: Record<LevelName, { key: 'beginner' | 'intermediate' | 'advanced' | 'expert'; emoji: string }>;
export const NOTE_NAMES: Record<string, string>;

export function loadCurriculum(): Curriculum;
export function lessonIdFromEntry(entryId: string | undefined): string | undefined;
export function checkpointTierFromEntry(entryId: string | undefined): number | undefined;
export function ancestorsOf(id: string): Set<string>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Starlight's sidebar config type
export function buildSidebar(): any[];
export function clientGraph(): {
	tiers: { n: number; name: string; level: LevelName }[];
	lessons: Pick<Lesson, 'id' | 'label' | 'tier' | 'prereqs' | 'url' | 'status'>[];
};
