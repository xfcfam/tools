import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `general-naming-view` (G4, structural) — § 7.3.2, § 7.2.3.
 *
 * A generalization component of the Interaction Layer that abstracts
 * behavior for graphical interaction points does not end with the
 * canonical suffix `View`.
 */
export class GeneralNamingViewBusiness extends RuleBusiness {
  readonly id = 'general-naming-view'
  readonly group = 4
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An Interaction Layer generalization for graphical interaction points must end with the suffix View.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.2, §7.2.3'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'generalization' || c.layer !== 'api') continue
      if (!RuleUtils.apiIsGraphical(c.relativePath)) continue
      if (c.name.endsWith('View')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Generalization ${c.name} (/api/general, graphical) does not end with 'View'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
