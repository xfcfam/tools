import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `injection-naming-b` (G5, structural) — § 7.3.3.
 *
 * The injection component of the Business Layer does not bear the
 * canonical name `B`.
 */
export class InjectionNamingBBusiness extends RuleBusiness {
  readonly id = 'injection-naming-b'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The Business Layer injection component must be named B.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.3'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection' || c.layer !== 'business') continue
      if (c.name === 'B') continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Business Layer injection at /${c.relativePath} is named '${c.name}', expected 'B'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
