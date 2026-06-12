import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'
import { ImportResolutionUtils } from '../../../utils/ImportResolutionUtils.js'

/**
 * `layer-skip` (G2, structural) — § 6.2.2.
 *
 * A component references another component of a lower abstraction level
 * skipping the intermediate layer (rank difference ≥ 2 downward, i.e.
 * Interaction → Access bypassing Business). Excepted:
 *
 *  • transfer components (§ 9.5 — transfers flow across layers freely);
 *  • utility components over primitive types defined in
 *    /src/repository/utils (§ 7.3.4);
 *  • injection components (`R`/`B`/`A`) — the injection is the
 *    sanctioned descending-access conduit between layers (§ 7.3.3), so
 *    referencing a lower-layer injection is never a "skip".
 *
 * Verified on the importing component over in-artefact relative imports.
 */
export class LayerSkipBusiness extends RuleBusiness {
  readonly id = 'layer-skip'
  readonly group = 2
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A component references a lower-abstraction component skipping the intermediate layer (transfers and Access primitive utils excepted).'
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
        const target = ImportResolutionUtils.resolveComponent(c, imp, artefact)
        if (target === null || target.layer === 'architecture') continue
        const targetRank = RuleUtils.RANK[target.layer]
        if (myRank - targetRank < 2) continue // not skipping (or upward — covered by layer-reference)
        // Exceptions: transfers flow freely; Access utils over
        // primitives are global; injections are the descending-access
        // conduit between layers.
        if (target.type === 'transfer' || target.type === 'exception') continue
        if (target.type === 'utility' && target.layer === 'repository') continue
        if (target.type === 'injection') continue
        const key = `${imp.specifier}@${imp.line}`
        if (seen.has(key)) continue
        seen.add(key)
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `${c.name} (/${c.layer}) references ${target.name} (/${target.layer}) skipping the intermediate layer. Route through the adjacent layer instead.`,
          location: { path: c.relativePath, line: imp.line },
        })
      }
    }
    return violations
  }
}
