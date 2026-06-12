import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `injection-naming-a` (G5, structural) — § 7.3.3.
 *
 * The injection component of the Interaction Layer does not bear the
 * canonical name `A`.
 */
export class InjectionNamingABusiness extends RuleBusiness {
  readonly id = 'injection-naming-a'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The Interaction Layer injection component must be named A.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.3'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection' || c.layer !== 'api') continue
      if (c.name === 'A') continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Interaction Layer injection at /${c.relativePath} is named '${c.name}', expected 'A'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
