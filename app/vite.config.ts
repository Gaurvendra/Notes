import mdx from '@mdx-js/rollup'
import rehypeShiki from '@shikijs/rehype'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import rehypeKatex from 'rehype-katex'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeSlug from 'rehype-slug'
import type { ShikiTransformer } from 'shiki'
import { defineConfig } from 'vite'

/**
 * Fence meta → data attributes read by the CodeBlock component, e.g.
 * ```java title="Hello.java" · ```text output · ```shellsession captured="JDK 25.0.4.1 (Ubuntu build, Linux x64)"
 * `verified="…"` records where code and output were checked.
 */
const fenceMeta: ShikiTransformer = {
  name: 'jmt-fence-meta',
  pre(node) {
    const raw = (this.options.meta as { __raw?: string } | undefined)?.__raw ?? ''
    node.properties['data-lang'] = this.options.lang
    for (const m of raw.matchAll(/(\w+)="([^"]*)"/g)) {
      if (['title', 'captured', 'verified'].includes(m[1])) node.properties[`data-${m[1]}`] = m[2]
    }
    const flags = raw.replace(/\w+="[^"]*"/g, ' ').split(/\s+/)
    if (flags.includes('output')) node.properties['data-kind'] = 'output'
    if (flags.includes('terminal')) node.properties['data-kind'] = 'terminal'
  },
}

// Lessons are MDX (src/content/lessons). Code is highlighted at build time for both light and dark mode; the page
// switches between the two with CSS variables (see index.css), so no highlighter ships to the browser.
export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        include: /\.mdx$/,
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: 'frontmatter' }], remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeSlug,
          [rehypeKatex, { strict: 'ignore', output: 'htmlAndMathml' }],
          [rehypeShiki, { themes: { light: 'github-light-default', dark: 'github-dark-default' }, defaultColor: false, transformers: [fenceMeta] }],
        ],
      }),
    },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    tailwindcss(),
  ],
  // The learning DAG lives in ../project-plan/curriculum.yaml (single source of truth, also used by the Python tool).
  server: { fs: { allow: ['..'] } },
})
