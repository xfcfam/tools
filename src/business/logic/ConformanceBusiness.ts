import { StatelessBusiness } from '@xfcfam/xf'
import type { Artefact } from '../transfers/Artefact.js'
import type { Component } from '../transfers/Component.js'
import type { ConformanceLevel, ConformanceReport } from '../transfers/ConformanceReport.js'
import type { Violation } from '../transfers/Violation.js'

/**
 * Business Layer Logical that runs the 4-stage conformance-level
 * determination algorithm (xfa-en.tex § 11.4) and assembles the final
 * report.
 *
 * Stages:
 *
 *  S1 — Inventory + classification (performed upstream by
 *       `ArtefactBusiness`/`ClassificationBusiness`; the classified
 *       components arrive on `artefact.components`).
 *
 *  S2 — Totality of components (§ 11.1.3): every component is classified
 *       in the L × T matrix. The `XF` start-point element is excluded
 *       (it is not a component). If totality fails: level 1 when ≥1
 *       component is classified, else level 0 — and the algorithm stops.
 *
 *  S3 — Catalog evaluation (§ 11.3): the rule engine has already
 *       produced the violation set (passed in as `violations`),
 *       respecting applicability — a rule with no applicable element
 *       yields no violation.
 *
 *  S4 — Level determination (§ 11.2): ≥1 structural violation → 2; else
 *       ≥1 semantic violation → 3; else 4.
 *
 * STATIC CEILING: this is a static tool. It cannot decide the 10
 * semantic rules — they always contribute zero violations here. So when
 * there are no structural violations, the algorithm cannot distinguish
 * level 3 from level 4. The tool therefore reports **at most level 3
 * (structurally conformant)** and flags `staticCeiling = true`,
 * signalling that level 4 requires human review of the semantic rules.
 */
export class ConformanceBusiness extends StatelessBusiness {
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  /** Component types that count as classified in the L × T matrix. */
  private static readonly CLASSIFIED_TYPES = new Set<Component['type']>([
    'logical', 'generalization', 'injection', 'utility', 'transfer', 'exception',
  ])

  /**
   * Build the conformance report. `pendingSemanticRules` is the number
   * of semantic rules in the catalog (declared but not statically
   * decidable); it is reported so callers can communicate the
   * human-review gap between level 3 and level 4.
   */
  buildReport(artefact: Artefact, violations: Violation[], pendingSemanticRules: number): ConformanceReport {
    const { level, staticCeiling } = ConformanceBusiness.determine(artefact, violations)
    return {
      artefactPath: artefact.rootPath,
      level,
      staticCeiling,
      pendingSemanticRules: staticCeiling ? pendingSemanticRules : 0,
      violations,
      components: artefact.components,
    }
  }

  /** Run the §11.4 algorithm; returns the level and whether it is the static ceiling. */
  private static determine(artefact: Artefact, violations: Violation[]): { level: ConformanceLevel; staticCeiling: boolean } {
    // The XF start-point element is excluded from the totality predicate.
    const components = artefact.components.filter(c => c.type !== 'architecture')

    // ── Stage 2: totality of components ──
    const classified = components.filter(c => ConformanceBusiness.CLASSIFIED_TYPES.has(c.type))
    const unclassified = components.filter(c => !ConformanceBusiness.CLASSIFIED_TYPES.has(c.type))

    if (unclassified.length > 0) {
      // Totality not satisfied.
      return { level: classified.length > 0 ? 1 : 0, staticCeiling: false }
    }
    if (classified.length === 0) {
      // No component at all to classify → non-conformant.
      return { level: 0, staticCeiling: false }
    }

    // ── Stage 4: level from violations partitioned by verifiability ──
    const hasStructural = violations.some(v => v.verifiability === 'structural')
    if (hasStructural) return { level: 2, staticCeiling: false }

    const hasSemantic = violations.some(v => v.verifiability === 'semantic')
    if (hasSemantic) return { level: 3, staticCeiling: false }

    // No structural and no (decided) semantic violation. A static tool
    // cannot certify level 4, so it caps the result at level 3.
    return { level: 3, staticCeiling: true }
  }
}
