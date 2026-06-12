import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `xf-init-missing` (G8, structural) — § 8.3.
 *
 * The `XF` element does not declare an invocable static `init()`
 * operation.
 */
export class XfInitMissingBusiness extends RuleBusiness {
  readonly id = 'xf-init-missing'
  readonly group = 8
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The XF element does not declare an invocable static init() operation.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§8.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'architecture' || c.name !== 'XF') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined) continue
      if (RuleUtils.declaresStaticMethod(klass, 'init')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `The XF element does not declare a static init() operation.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
