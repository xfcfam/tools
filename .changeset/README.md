# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

`@xfcfam/tools` is maintained solo and published straight from `main` — there
is **no PR flow**. To cut a release:

```bash
pnpm changeset          # (optional) describe the change for the CHANGELOG
pnpm changeset version  # apply pending changesets → bump + CHANGELOG
git commit -am "release" && git push   # push to main → CI publishes via OIDC
```

The `release` workflow runs `changeset publish` on every push to `main` and
publishes the package only when its local version is ahead of npm — token-free
(OIDC trusted publishing). It shares the toolchain and OIDC setup with the
`xfcfam/lib-npm` monorepo, but not its collaborative Version-Packages PR flow.
