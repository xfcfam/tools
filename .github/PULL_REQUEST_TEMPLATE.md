<!-- Thanks for contributing to xftools. -->

## Summary

<!-- What changed and why. -->

## Type of change

- [ ] New rule
- [ ] Rule refinement (predicate change, message change)
- [ ] Bug fix
- [ ] Tooling / CI
- [ ] Refactor

## Checklist

- [ ] `pnpm typecheck && pnpm test && pnpm build` is green locally.
- [ ] If adding or changing a rule:
  - [ ] The rule has a unique id matching its section in `xfarch/docs` (`R<n>.<m>` or `R-IMPLIED-<n>` for newly introduced ones).
  - [ ] `specRef` points to the right section of `XFA-RULES.md` or `xfa-es.tex`.
  - [ ] Tests cover at least one passing and one failing artefact snippet.
- [ ] If the rule catalogue changed: regenerated the rule table in `xfarch/docs` (or opened a PR there).
- [ ] Added a changeset (`pnpm changeset`) describing the change.
- [ ] Validated this PR against itself: `xftools validate .` reports the expected N level.
