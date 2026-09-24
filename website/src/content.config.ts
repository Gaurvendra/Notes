import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const docs = defineCollection({
	loader: docsLoader(),
	schema: docsSchema({
		extend: z.object({
			/** Generated placeholder page for a lesson/checkpoint that hasn't been written yet. */
			stub: z.boolean().default(false),
			/** Minutes for the full path and for the fast-track (TL;DR + myths + senior lens + interview). */
			estimatedMinutes: z.number().int().positive().optional(),
			fastTrackMinutes: z.number().int().positive().optional(),
			/** Traceability to the user's notes, e.g. ["04 p7-10"]. */
			sourcePages: z.array(z.string()).default([]),
			/** Java version all code on the page was verified with. */
			javaBaseline: z.number().int().default(25),
			lastVerified: z.coerce.date().optional(),
		}),
	}),
});

const markdownText = z.string().min(1);

/** Per-lesson structured data (quiz, interview questions, flashcards), aggregated by the hubs. */
const lessonData = defineCollection({
	loader: glob({ pattern: '*.yaml', base: './src/content/lesson-data' }),
	schema: z.object({
		quiz: z
			.array(
				z.object({
					q: markdownText,
					options: z
						.array(z.object({ text: markdownText, correct: z.boolean().default(false), why: markdownText }))
						.min(2)
						.refine((opts) => opts.some((o) => o.correct), 'at least one option must be correct'),
				}),
			)
			.default([]),
		interview: z
			.array(
				z.object({
					level: z.enum(['fresher', 'mid', 'senior', 'staff']),
					type: z.enum(['concept', 'code', 'predict-output', 'design', 'behavioural']).default('concept'),
					q: markdownText,
					answer: markdownText,
					followUps: z.array(markdownText).default([]),
					redFlags: z.array(markdownText).default([]),
					tests: z.string().optional(),
				}),
			)
			.default([]),
		flashcards: z.array(z.object({ front: markdownText, back: markdownText })).default([]),
	}),
});

export const collections = { docs, lessonData };
