import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `logic-naming-business` (G3, structural) — § 7.3.1, § 7.2.2.
 *
 * A logical component of the Business Layer does not bear the canonical
 * suffix `Business`.
 */
export class LogicNamingBusinessBusiness extends RuleBusiness {
  readonly id = 'logic-naming-business'
  readonly group = 3
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A Business Layer logical component must bear the suffix Business.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.1, §7.2.2'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'logical' || c.layer !== 'business') continue
      if (c.name.endsWith('Business')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `${c.name} is a logical component of the Business Layer but does not end with 'Business'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
