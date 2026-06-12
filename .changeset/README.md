# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

Add a changeset for any change that alters the published `@xfcfam/xftools`
package:

```bash
pnpm changeset
```

Pick the bump type (`patch` / `minor` / `major`) and write a one-line summary
for users. Commit the generated `.changeset/*.md` with your PR. Merging a PR
that carries a changeset opens the **Version Packages** PR; merging that
publishes to npm via OIDC. See `RELEASING.md` for the full flow (identical to
the `xfcfam/lib-npm` monorepo).
