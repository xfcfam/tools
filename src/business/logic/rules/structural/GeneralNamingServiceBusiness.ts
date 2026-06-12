import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `general-naming-service` (G4, structural) — § 7.3.2, § 7.2.3.
 *
 * A generalization component of the Interaction Layer that abstracts
 * behavior for systemic interaction points does not end with the
 * canonical suffix `Service`. Systemic vs graphical is split
 * structurally by the interaction-point area in the path.
 */
export class GeneralNamingServiceBusiness extends RuleBusiness {
  readonly id = 'general-naming-service'
  readonly group = 4
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An Interaction Layer generalization for systemic interaction points must end with the suffix Service.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.2, §7.2.3'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'generalization' || c.layer !== 'api') continue
      if (RuleUtils.apiIsGraphical(c.relativePath)) continue
      if (c.name.endsWith('View')) continue
      if (c.name.endsWith('Service')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Generalization ${c.name} (/api/general, systemic) does not end with 'Service'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
