# `@xfcfam/tools`

## 0.1.2

### Patch Changes

- CLI: add `-v` / `--version` (prints the xftools version, the rule-catalog
  edition `XF-CFAM-001:2026`, and the specification URL) and expand
  `-h` / `--help` into a commands listing. Catalog metadata is now centralised
  in `SpecUtils`, and the tool version is read from the package manifest via
  the Access layer. Documented the command set in the README.

## 0.1.1

### Patch Changes

- Bump `java-parser` to 3.0.1. Verified compatible — the Java CST parser's
  17 tests pass against 3.x; the lazy-loaded parser path is unchanged.

## Unreleased — Catalog alignment with XF-CFAM-001:2026

- Rule catalog rebuilt to match `xfa-en.tex § 11.3` **exactly**: 71
  rules across 9 thematic groups, each by canonical kebab-case `id`,
  carrying `group` (1–9), `verifiability` (`structural`|`semantic`) and
  `specRef`. 61 structural rules have real static checks; the 10
  semantic rules are declared but never failed (human review required).
- `Violation` now carries `verifiability`; `Rule` / `RuleBusiness` carry
  `id`, `group`, `verifiability`, `specRef`, `scope`, `appliesTo`.
- Conformance reworked to the § 11.4 four-stage algorithm returning
  `Λ ∈ {0,1,2,3,4}` (was `N ∈ {0..3}`). The static tool caps its result
  at `Λ=3` ("structurally conformant") and reports the human-review gap
  to `Λ=4`. The XF start-point element is excluded from the totality
  predicate.
- Retired non-catalog rules (the old folder-presence, component
  classification and integration rules); component classification and
  code-totality now live in the conformance algorithm's Stages 1–2.
- Java parser loads `java-parser` lazily so non-Java artefacts (e.g. the
  TypeScript dogfood) do not require the optional dependency.

## 0.1.0 — Initial release

- CLI: `xftools validate <path> [--json]`
- Catalogue of 28 algorithmically-verifiable XF rules
  (structural / component / artefact).
- Conformance levels 0..3 derived per XF spec § 7.
- Built as a canonical XF artefact (dogfood acceptance test).
- TypeScript adapter: parses `.ts` files via the TypeScript Compiler
  API. Other languages will be added as Business Logicals under
  `business/logic/adapters/`.
