import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// The site is a *reader* of the spec, never a source of truth for it. Token
// pages resolve `../tokens/**` at build time and component pages read
// `../design/components/*.md`, so the site cannot drift from the spec — it can
// only fail to build, which is the failure mode we want.
export default defineConfig({
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
          autogenerate: { directory: 'components' },
        },
      ],
      customCss: ['./src/styles/spec.css'],
    }),
  ],
});
