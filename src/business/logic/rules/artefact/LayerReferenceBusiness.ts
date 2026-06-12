import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import type { Component, Layer } from '../../../transfers/Component.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'
import { ImportResolutionUtils } from '../../../utils/ImportResolutionUtils.js'

/**
 * `layer-reference` (G2, structural) — § 6.2.2.
 *
 * A component references another component of a layer of higher
 * abstraction level than its own (an upward reference). Verified on the
 * importing component: for each in-artefact runtime import, resolve the
 * imported file's layer; if its abstraction rank is strictly greater
 * than the importer's, the reference is inadmissible.
 *
 * The XF start-point element is allowed to reference every layer (it
 * orchestrates them) and is excluded.
 */
export class LayerReferenceBusiness extends RuleBusiness {
  readonly id = 'layer-reference'
  readonly group = 2
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A component references another component of a higher abstraction layer (upward reference).'
  readonly scope: RuleScope = 'artefact'
  readonly specRef = '§6.2.2'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.layer === 'architecture') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      const myRank = RuleUtils.RANK[c.layer]
      const seen = new Set<string>()
      for (const imp of sf.imports) {
        const targetLayer = ImportResolutionUtils.referencedLayer(c, imp, artefact)
        if (targetLayer === null) continue
        if (RuleUtils.RANK[targetLayer] <= myRank) continue
        const key = `${imp.specifier}@${imp.line}`
        if (seen.has(key)) continue
        seen.add(key)
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `${c.name} (/${c.layer}) references a component of the higher-abstraction layer /${targetLayer} via ${imp.specifier}. References must flow downward.`,
          location: { path: c.relativePath, line: imp.line },
        })
      }
    }
    return violations
  }

  /** Exposed for tests / readers: the rank ordering used. */
  static rankOf(layer: Layer): number {
    return RuleUtils.RANK[layer]
  }
}
