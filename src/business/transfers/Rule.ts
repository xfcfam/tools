import type { Artefact } from './Artefact.js'
import type { Violation, RuleScope, Verifiability } from './Violation.js'
import type { LanguageId } from './Language.js'

/**
 * Public surface that every XF rule must expose. Implemented by
 * `RuleBusiness` and inherited by every concrete rule in
 * `/business/logic/rules/`.
 *
 * Each rule corresponds one-to-one with an entry in the normative
 * catalog of `xfa-en.tex` § 11.3 (edition XF-CFAM-001:2026).
 */
export interface Rule {
  /** Canonical kebab-case rule id from the catalog (§ 11.3), e.g. `logic-naming-repository`. */
  readonly id: string
  /** Thematic group number (1–9) of the rule in the catalog. */
  readonly group: number
  /**
   * Verifiability class (§ 11.1.4). `structural` rules are decided by
   * static analysis; `semantic` rules require human review and are
   * declared but never made to fail by this tool.
   */
  readonly verifiability: Verifiability
  /** One-line human-readable description of what the rule checks. */
  readonly description: string
  /**
   * Execution scope — how the check runs and how its violations are
   * grouped in reports (`structural` = path-only, `component` =
   * single-file AST, `artefact` = cross-file).
   */
  readonly scope: RuleScope
  /** Pointer to the normative section(s) that justify the rule. */
  readonly specRef: string
  /**
   * Languages the rule applies to. `undefined` (default) means the
   * rule is language-agnostic and runs on every artefact.
   */
  readonly appliesTo: readonly LanguageId[] | undefined
  /**
   * Run the check against an artefact. Returns zero or more violations.
   * MUST be pure with respect to the input artefact (no I/O).
   * Semantic rules return `[]` (a static tool cannot decide them).
   */
  check(artefact: Artefact): Violation[]
}
