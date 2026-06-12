import type { Component } from './Component.js'
import type { Violation } from './Violation.js'

/**
 * Conformance level Λ(𝔄) ∈ {0,1,2,3,4} as defined in xfa-en.tex
 * § 11.2 / § 11.4 (edition XF-CFAM-001:2026).
 *
 * - `0` — Non-conformant: no classified component.
 * - `1` — Partially conformant: totality condition unsatisfied, ≥1
 *         classified component.
 * - `2` — Imperfectly conformant: totality satisfied, ≥1 structural
 *         violation.
 * - `3` — Structurally conformant: 0 structural violations, ≥1 semantic
 *         violation pending human review.
 * - `4` — Perfectly conformant: no violation of any kind.
 *
 * NOTE: a static tool cannot decide the 10 semantic rules, so it reports
 * at most level 3 ("structurally conformant") and flags the semantic
 * rules as pending human review. See {@link ConformanceReport.staticCeiling}.
 */
export type ConformanceLevel = 0 | 1 | 2 | 3 | 4

/**
 * Transfer object: the full output of running the validator against an
 * artefact. Includes the derived conformance level, every violation
 * grouped by scope, and the component classification.
 */
export interface ConformanceReport {
  /** Absolute path of the artefact root. */
  artefactPath: string
  /** Derived conformance level Λ(𝔄) ∈ {0,1,2,3,4} (§ 11.4). */
  level: ConformanceLevel
  /**
   * `true` when the level is the static-analysis ceiling rather than a
   * fully decided result: 0 structural violations leave the artefact at
   * level 3 because reaching level 4 requires human review of the
   * semantic rules. `false` for levels 0–2, which are fully decided.
   */
  staticCeiling: boolean
  /** Number of semantic rules that remain pending human review. */
  pendingSemanticRules: number
  /** All violations, in deterministic order (by ruleId then path). */
  violations: Violation[]
  /** Every file under `/src` after classification. */
  components: Component[]
}
