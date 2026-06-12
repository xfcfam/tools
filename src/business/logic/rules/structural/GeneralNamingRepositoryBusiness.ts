import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `general-naming-repository` (G4, structural) — § 7.3.2, § 7.2.1.
 *
 * A generalization component of the Access Layer does not end with the
 * canonical suffix `Repository`.
 */
export class GeneralNamingRepositoryBusiness extends RuleBusiness {
  readonly id = 'general-naming-repository'
  readonly group = 4
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An Access Layer generalization component must end with the suffix Repository.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.2, §7.2.1'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'generalization' || c.layer !== 'repository') continue
      if (c.name.endsWith('Repository')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Generalization ${c.name} (/repository/general) does not end with 'Repository'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
