# Security Policy

## Supported versions

This repository publishes the `@xfcfam/tools` (alias **xftools**) CLI
to npm. Only the latest major version receives security fixes.

| Package          | Supported version |
| ---------------- | ----------------- |
| `@xfcfam/tools`  | latest major      |

## Reporting a vulnerability

`xftools` is a developer tool that reads source files from the
filesystem. The classes of issues we particularly care about:

- **Path-traversal** — input paths that read outside the intended
  artefact root.
- **Arbitrary code execution** — anything that causes the validator to
  evaluate or transitively load untrusted code.
- **Denial of service** — crafted inputs that cause unbounded memory
  or CPU consumption.
- **Supply-chain issues** with the publish workflow that could yield a
  malicious npm release.

**Please do not file a public GitHub issue, discussion, or PR for
security reports.**

Use one of:

1. **GitHub private vulnerability reporting** (preferred) — repository
   **Security** tab → **"Report a vulnerability"**.
2. **Email** — `security@xfcfam.org` (PGP key on request).

Please include:

- The version of `xftools` and your Node version.
- A minimal reproduction (an artefact or input that triggers the
  issue).
- The impact you've observed or believe to be possible.

We aim to:

- **Acknowledge** within **72 hours**.
- Provide an **initial assessment** within **7 days**.
- Coordinate a **disclosure date** before publishing the fix.
- **Credit you** in the advisory and changelog unless you ask to
  remain anonymous.

## Scope

In scope:

- The published `@xfcfam/tools` package and its CLI entrypoint.
- The GitHub Actions workflows (`ci.yml`, `release.yml`).
- The `changesets` configuration and release tooling.

Out of scope:

- Bugs that are not security-relevant — file those as normal issues.
- False positives or false negatives of validator rules — those are
  spec or rule-implementation issues, not security.

## Hardening checklist (maintainer-side)

For transparency, the project applies the following baseline:

- All releases are produced by GitHub Actions; no manual `npm publish`.
- The `NPM_TOKEN` secret is restricted to the **release** workflow.
- Dependabot is enabled (`.github/dependabot.yml`).
- `main` is protected: squash-only merges, linear history, required
  status checks.
- CODEOWNERS auto-requests review on every PR.
