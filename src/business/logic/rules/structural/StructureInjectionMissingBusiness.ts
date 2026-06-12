import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `structure-injection-missing` (G1, structural) — § 7.3.3.
 *
 * A layer folder does not contain the canonical file of the injection
 * component that corresponds to it (`R` for /repository, `B` for
 * /business, `A` for /api). The rule fires per present-but-incomplete
 * layer: a layer that materialises at all (has any element) must
 * declare its injection file at its root.
 */
export class StructureInjectionMissingBusiness extends RuleBusiness {
  readonly id = 'structure-injection-missing'
  readonly group = 1
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A present layer folder lacks its canonical injection file (R / B / A).'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.3'

  private static readonly INJECTION: Record<string, string> = { repository: 'R', business: 'B', api: 'A' }

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    const present = new Set<string>()
    const hasInjection = new Set<string>()
    for (const c of artefact.components) {
      if (c.layer === 'repository' || c.layer === 'business' || c.layer === 'api') {
        present.add(c.layer)
        if (c.type === 'injection' && c.name === StructureInjectionMissingBusiness.INJECTION[c.layer]) {
          hasInjection.add(c.layer)
        }
      }
    }
    for (const layer of present) {
      if (hasInjection.has(layer)) continue
      const name = StructureInjectionMissingBusiness.INJECTION[layer]!
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Layer /${layer} does not declare its canonical injection file ${name} at its root.`,
        location: { path: `src/${layer}/${name}` },
      })
    }
    return violations
  }
}
