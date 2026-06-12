import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `logic-naming-view` (G3, structural) — § 7.3.1, § 7.2.3.
 *
 * A logical component of the Interaction Layer that implements a
 * graphical interaction point does not bear the canonical suffix
 * `View`. Graphical points are recognised structurally by a `/gui` or
 * `/view` area in the path.
 */
export class LogicNamingViewBusiness extends RuleBusiness {
  readonly id = 'logic-naming-view'
  readonly group = 3
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An Interaction Layer logical implementing a graphical interaction point must bear the suffix View.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.1, §7.2.3'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'logical' || c.layer !== 'api') continue
      if (!RuleUtils.apiIsGraphical(c.relativePath)) continue
      if (c.name.endsWith('View')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `${c.name} is a graphical Interaction Layer logical but does not end with 'View'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
