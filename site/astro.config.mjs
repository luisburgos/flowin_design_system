import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { slugs as contractSlugs } from './src/lib/contracts.mjs';

// The site is a *reader* of the spec, never a source of truth for it. Token
// pages resolve `../tokens/**` at build time and component pages read
// `../design/components/*.md`, so the site cannot drift from the spec — it can
// only fail to build, which is the failure mode we want.
export default defineConfig({
  // No `site`/`base` yet: nothing hosts this. Setting them would bake a host
  // and a path prefix into every generated link for a URL that does not serve
  // the site, and `base` in particular rewrites local paths too. Add both when
  // a hosting target exists — the sitemap warning on build is that absence,
  // not a defect.
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
