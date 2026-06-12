import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `utility-naming` (G6, structural) — § 7.3.4.
 *
 * A utility component does not bear the suffix `Utils`.
 */
export class UtilityNamingBusiness extends RuleBusiness {
  readonly id = 'utility-naming'
  readonly group = 6
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A utility component must bear the suffix Utils.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.3.4'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'utility') continue
      if (c.name.endsWith('Utils')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `${c.name} is a utility component but does not end with 'Utils'.`,
        location: { path: c.relativePath },
      })
    }
    return violations
  }
}
