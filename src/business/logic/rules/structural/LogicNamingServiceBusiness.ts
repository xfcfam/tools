import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `logic-naming-service` (G3, structural) — § 7.3.1, § 7.2.3.
 *
 * A logical component of the Interaction Layer that implements a
 * systemic interaction point does not bear the canonical suffix
 * `Service`. Systemic vs graphical is distinguished structurally by the
 * interaction-point area in the path (`/gui` or `/view` ⇒ graphical).
 */
export class LogicNamingServiceBusiness extends RuleBusiness {
  readonly id = 'logic-naming-service'
  readonly group = 3
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An Interaction Layer logical implementing a systemic interaction point must bear the suffix Service.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.1, §7.2.3'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'logical' || c.layer !== 'api') continue
      if (RuleUtils.apiIsGraphical(c.relativePath)) continue // graphical → View, see logic-naming-view
      // A logical already named *View is graphical by name even outside a /gui area.
      if (c.name.endsWith('View')) continue
      if (c.name.endsWith('Service')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `${c.name} is a systemic Interaction Layer logical but does not end with 'Service'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
