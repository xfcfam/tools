import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `logic-naming-repository` (G3, structural) — § 7.3.1, § 7.2.1.
 *
 * A logical component of the Access Layer does not bear the canonical
 * suffix `Repository`.
 */
export class LogicNamingRepositoryBusiness extends RuleBusiness {
  readonly id = 'logic-naming-repository'
  readonly group = 3
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An Access Layer logical component must bear the suffix Repository.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.1, §7.2.1'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'logical' || c.layer !== 'repository') continue
      if (c.name.endsWith('Repository')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `${c.name} is a logical component of the Access Layer but does not end with 'Repository'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
