import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `injection-naming-r` (G5, structural) — § 7.3.3.
 *
 * The injection component of the Access Layer does not bear the
 * canonical name `R`. An Access-layer-root file that occupies the
 * injection slot but is not named `R` is flagged.
 */
export class InjectionNamingRBusiness extends RuleBusiness {
  readonly id = 'injection-naming-r'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The Access Layer injection component must be named R.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.3'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection' || c.layer !== 'repository') continue
      if (c.name === 'R') continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Access Layer injection at /${c.relativePath} is named '${c.name}', expected 'R'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
