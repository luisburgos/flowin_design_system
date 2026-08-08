import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { slugs as contractSlugs } from './src/lib/contracts.mjs';

// The site is a *reader* of the spec, never a source of truth for it. Token
// pages resolve `../tokens/**` at build time and component pages read
// `../design/components/*.md`, so the site cannot drift from the spec — it can
// only fail to build, which is the failure mode we want.
export default defineConfig({
  // GitHub Pages serves a project site under `/<repo>/`, so `base` is required
  // — without it every generated link resolves against the domain root and
  // 404s. `npm run dev` honours both, so local review matches production.
  site: 'https://luisburgos.github.io',
  base: '/flowin_design_system',
  srcDir: './src',
  outDir: './dist',
  integrations: [
    starlight({
      title: 'Flowin Design System',
      description:
        'The technology-agnostic specification: tokens, component contracts, and the theme-first model.',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/luisburgos/flowin_design_system',
        },
      ],
      sidebar: [
        { label: 'Start here', slug: 'index' },
        {
          label: 'Guides',
          items: [
            { label: 'Reading a component contract', slug: 'guides/reading-a-contract' },
            { label: 'How the spec becomes a UI kit', slug: 'guides/transforms' },
          ],
        },
        {
          label: 'Tokens',
          items: [
            { label: 'Colour', slug: 'tokens/colour' },
            { label: 'Dimensions', slug: 'tokens/dimensions' },
            { label: 'Typography', slug: 'tokens/typography' },
          ],
        },
        {
          label: 'Components',
          // Built by the `[slug]` route from `design/components/*.md`, so there
          // are no content files for `autogenerate` to scan — the list is
          // derived from the same source the pages are.
          items: contractSlugs().map((slug) => ({ label: slug, link: `/components/${slug}/` })),
        },
      ],
      customCss: ['./src/styles/spec.css'],
    }),
  ],
});
