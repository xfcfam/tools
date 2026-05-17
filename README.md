# `@xfarch/xftools`

CLI toolkit for the **XF Architecture Model**. Built **as an XF
artefact itself** — `xftools validate ./.` runs the validator over
its own source. Dogfood as acceptance test.

## Install (dev)

The tool depends on `@xfarch/xf` from the sibling repo. From inside
this folder:

```bash
pnpm install
pnpm build
node dist/main.js validate ../lib-typescript/packages/xf
```

For development without building:

```bash
pnpm run validate ../lib-typescript/packages/xf
```

## Commands

```
xftools validate <path> [--json]
```

`<path>` must point to an XF artefact: a directory that contains
`./src/`. The validator walks `./src`, classifies every file by the
XF L × T matrix, runs every rule of the catalogue, and emits a
conformance report.

`--json` switches the output to a structured JSON document instead of
the human-readable console format.

## Output

```
─────────────────────────────────────────────────────
XF Validation — /path/to/artefact
─────────────────────────────────────────────────────
Conformance level:   N=3    (fully conformant, zero violations)
Components scanned:  29
Violations found:    0

✓ No violations. Artefact is XF-conformant.
```

If there are violations, they are grouped by **scope** (`structural`,
`component`, `artefact`) and printed under their own headers. The
exit code is `0` if `N=3`, `1` if `N<3`, `2` on usage / runtime
errors.

## Conformance levels (XF spec § 7)

| Level | Meaning |
|---|---|
| `0` | No XF elements detected (no `/src` or no canonical layer folders). |
| `1` | Some components classified, others unclassifiable. |
| `2` | All components classified, with violations present. |
| `3` | Fully conformant — zero violations. |

In v0, mandatory-violation exemptions (XF spec § 7, N=2 case) are not
implemented; every violation counts toward `N=2`.

## Architecture

xftools follows the XF canonical structure:

```
src/
├── repository/                              (Access — I/O)
│   ├── R.ts
│   ├── logic/
│   │   ├── FileSystemRepository.ts          ← walks /src, reads files
│   │   ├── ConsoleRepository.ts             ← stdout / stderr
│   │   └── TypeScriptParserRepository.ts    ← TS compiler API
│   └── structs/
├── business/                                (Business — XF semantics)
│   ├── B.ts
│   ├── base/AbstractRule.ts                 ← Generalization for every rule
│   ├── logic/
│   │   ├── ClassificationBusiness.ts
│   │   ├── RuleEngineBusiness.ts
│   │   ├── ConformanceBusiness.ts
│   │   ├── ArtefactBusiness.ts              ← walk → classify → run rules → report
│   │   └── rules/                           ← each rule = one Logical
│   │       ├── structural/                  (filesystem & naming)
│   │       ├── component/                   (class-level via AST)
│   │       └── artefact/                    (cross-file via AST + text)
│   ├── structs/                             (Transfer objects)
│   └── utils/                               (Classification/Path Utils)
├── api/                                     (Interaction — CLI)
│   ├── A.ts
│   └── logic/service/
│       ├── CliService.ts
│       └── ConsoleReporter.ts
├── XF.ts                                    ← lifecycle orchestrator
└── main.ts                                  ← entry point (bin)
```

Every rule lives in its own file under `business/logic/rules/`. The
inventory in `B.rules` is the source of truth; a future
`extract-rules-doc.ts` will regenerate the rule table for
`xfa-es.tex` from it.

## Catalogue

v0 implements the catalogue extracted from `XFA-RULES.md` (sections
1, 2, 4, 5, 6, 7, 8, 9, 11), split by scope:

| Scope | Rules implemented |
|---|---|
| Structural | R1.1, R1.2, R1.3, R2.1, R2.2, R2.3, R2.4, R2.5, R2.6, R4.1, R7.1, R8.2, R9.2, R11.1 |
| Component | R4.2, R4.3, R4.5, R6.1, R6.8, R7.2, R8.4, R8.5, R9.3, R11.2 |
| Artefact | R5.2, R5.3, R8.6, R9.4 |

Rules R3.4, R6.5, R7.5, R10.2, R10.3 and R4.7 are documented in the
spec but **not algorithmically verifiable** in v0; they are marked
advisory and left out of the catalogue until a more sophisticated
analysis path is added.

## License

MIT.
