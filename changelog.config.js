// Changelog preset for flowin_design_system.
//
// Mirrors flutter_flowin's config — same preset, same section names — with one
// difference: `docs` leads the order instead of trailing it. This repository's
// product IS documentation, so a release made up entirely of `docs` commits is
// a release full of contract changes, and burying it under Features would
// misrepresent what shipped.
//
// Anything marked `hidden: true` is still parsed but kept out of the output.
module.exports = {
  options: {
    preset: {
      name: 'conventionalcommits',
      types: [
        { type: 'docs', section: 'Documentation' },
        { type: 'feat', section: 'Features' },
        { type: 'fix', section: 'Bug Fixes' },
        { type: 'revert', section: 'Reverts' },
        { type: 'refactor', section: 'Refactors' },
        { type: 'test', section: 'Tests' },
        { type: 'build', section: 'Build & Dependencies' },
        { type: 'ci', section: 'CI' },
        { type: 'chore', section: 'Chores' },
        // Formatting-only changes carry no information for a consumer.
        { type: 'style', hidden: true },
        // No runtime here, so nothing to measure.
        { type: 'perf', hidden: true },
      ],
    },
  },
};
