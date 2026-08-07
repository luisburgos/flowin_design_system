// Changelog preset for flowin_design_system.
//
// The sibling Flutter apps use the stock `angular` preset, which renders only
// feat / fix / perf / revert and silently drops everything else. That suits an
// app, where the changelog is read as release notes by people who only care
// what visibly changed.
//
// A spec repository is the opposite case. Its product IS documentation, so
// `docs` is the primary type rather than an afterthought: a release made up
// entirely of `docs` commits is a release full of contract changes, and the
// angular preset would render it as though nothing happened. `docs` therefore
// leads the section order here, ahead of `feat` and `fix`.
//
// Mirrors flutter_flowin's config, which extends
// `conventional-changelog-conventionalcommits` for the same reason. Anything
// marked `hidden: true` is still parsed but kept out of the output.
module.exports = {
  options: {
    preset: {
      name: 'conventionalcommits',
      types: [
        { type: 'docs', section: 'Specification' },
        { type: 'feat', section: 'Features' },
        { type: 'fix', section: 'Corrections' },
        { type: 'revert', section: 'Reverts' },
        { type: 'refactor', section: 'Refactors' },
        { type: 'test', section: 'Validation' },
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
