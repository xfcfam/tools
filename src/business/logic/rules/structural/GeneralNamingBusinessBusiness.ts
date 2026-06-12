import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `general-naming-business` (G4, structural) — § 7.3.2, § 7.2.2.
 *
 * A generalization component of the Business Layer does not end with
 * the canonical suffix `Business`.
 */
export class GeneralNamingBusinessBusiness extends RuleBusiness {
  readonly id = 'general-naming-business'
  readonly group = 4
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A Business Layer generalization component must end with the suffix Business.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.2, §7.2.2'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'generalization' || c.layer !== 'business') continue
      if (c.name.endsWith('Business')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Generalization ${c.name} (/business/general) does not end with 'Business'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
