// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import preact from '@astrojs/preact';
import mermaid from 'astro-mermaid';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { buildSidebar } from './src/lib/curriculum-core.mjs';

export default defineConfig({
	site: 'https://java-mastery-track.local',
	trailingSlash: 'always',
	markdown: {
		// unified() keeps the remark/rehype ecosystem (math → KaTeX). MDX inherits this processor.
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [[rehypeKatex, { strict: 'ignore', output: 'htmlAndMathml' }]],
		}),
	},
	integrations: [
		mermaid({ theme: 'default', autoTheme: true }), // must come before Starlight
		starlight({
			title: 'Java Mastery Track',
			description:
				'Learn Java from scratch to expert: a level-up roadmap with verified explanations, diagrams, tested examples, practice and interview prep. Java 25 LTS.',
			logo: { src: './src/assets/logo.svg', replacesTitle: false },
			favicon: '/favicon.svg',
			lastUpdated: false,
			pagination: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			customCss: [
				'@fontsource-variable/inter',
				'@fontsource-variable/jetbrains-mono',
				'katex/dist/katex.min.css',
				'./src/styles/theme.css',
				'./src/styles/components.css',
			],
			expressiveCode: {
				themes: ['github-dark-default', 'github-light-default'],
				// Long lines wrap (keeping indentation) instead of hiding behind a scrollbar, which matters on phones.
				defaultProps: { wrap: true, preserveIndent: true },
				styleOverrides: {
					codeFontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace",
					borderRadius: '0.5rem',
				},
			},
			components: {
				PageTitle: './src/components/overrides/PageTitle.astro',
				Footer: './src/components/overrides/Footer.astro',
			},
			sidebar: buildSidebar(),
		}),
		preact(),
	],
});
