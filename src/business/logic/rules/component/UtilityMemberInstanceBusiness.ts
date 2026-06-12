import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `utility-member-instance` (G6, structural) — § 7.3.4.
 *
 * A utility component declares instance members (non-static attributes
 * or methods). Utilities expose only static members.
 */
export class UtilityMemberInstanceBusiness extends RuleBusiness {
  readonly id = 'utility-member-instance'
  readonly group = 6
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A utility component declares instance members (non-static attributes or methods).'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.4'

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'utility') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined) continue
      const members = [...klass.instanceFields, ...klass.instanceMethods]
      if (members.length === 0) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Utility ${c.name} declares instance member(s) (${members.join(', ')}). Utilities expose only static members.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
