import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `structure-injection-multiplicity` (G1, structural) — § 7.3.3.
 *
 * More than one file exists with the canonical name of an injection
 * component under the root of the corresponding layer. There must be
 * exactly one `R`/`B`/`A` per layer.
 */
export class StructureInjectionMultiplicityBusiness extends RuleBusiness {
  readonly id = 'structure-injection-multiplicity'
  readonly group = 1
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A layer declares more than one canonical injection file.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.3'

  private static readonly INJECTION: Record<string, string> = { repository: 'R', business: 'B', api: 'A' }

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    const counts = new Map<string, number>()
    for (const c of artefact.components) {
      if (c.type !== 'injection') continue
      const expected = StructureInjectionMultiplicityBusiness.INJECTION[c.layer]
      if (expected === undefined || c.name !== expected) continue
      counts.set(c.layer, (counts.get(c.layer) ?? 0) + 1)
    }
    for (const [layer, n] of counts) {
      if (n <= 1) continue
      const name = StructureInjectionMultiplicityBusiness.INJECTION[layer]!
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Layer /${layer} declares ${n} files named ${name}; exactly one injection per layer is allowed.`,
        location: { path: `src/${layer}/${name}` },
      })
    }
    return violations
  }
}
