/** Execution scope of an XF rule — controls how it is reported and how its check executes. */
export type RuleScope = 'structural' | 'component' | 'artefact'

/**
 * Verifiability class of a rule and of the violation it emits
 * (xfa-en.tex § 11.1.4):
 *
 *  - `structural` — decidable by static analysis; degrades the
 *    conformance level to 2 when violated.
 *  - `semantic` — requires human architectural review; a static tool
 *    cannot decide it and therefore never emits a failing semantic
 *    violation. Declared in the catalog for completeness.
 */
export type Verifiability = 'structural' | 'semantic'

/**
 * Transfer object representing a single rule violation detected by the
 * RuleEngine.
 */
export interface Violation {
  /** Canonical kebab-case rule id from the catalog (xfa-en.tex § 11.3). */
  ruleId: string
  /** Execution scope of the originating rule. */
  scope: RuleScope
  /**
   * Verifiability of the originating rule. The conformance algorithm
   * (§ 11.4) partitions violations by this field to derive the level.
   */
  verifiability: Verifiability
  /** Short human-readable summary. */
  message: string
  /** Where the violation was found — file + optional line. */
  location: {
    path?: string
    line?: number
  }
  /** Optional structured details for machine consumers. */
  details?: Record<string, unknown>
}
