import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `logic-initialization-missing` (G3, structural) — § 7.3.1, § 8.2.
 *
 * A logical component does not declare or inherit an invocable `init()`
 * operation. A component that extends a superclass is presumed to
 * inherit `init()` (the canonical XF base logicals provide it); only a
 * root logical (no superclass) that omits `init()` is flagged.
 */
export class LogicInitializationMissingBusiness extends RuleBusiness {
  readonly id = 'logic-initialization-missing'
  readonly group = 3
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A logical component does not declare or inherit an invocable init() operation.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.1, §8.2'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'logical') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined) continue
      if (klass.extendsName !== null) continue // inherits init() from its base
      if (RuleUtils.declaresMethod(klass, 'init')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Logical ${c.name} declares no superclass and no invocable init() operation.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
