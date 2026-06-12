import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `injection-terminate-missing` (G5, structural) — § 7.3.3, § 8.2.
 *
 * An injection component does not declare an invocable static
 * `terminate()` operation.
 */
export class InjectionTerminateMissingBusiness extends RuleBusiness {
  readonly id = 'injection-terminate-missing'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An injection component does not declare an invocable static terminate() operation.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.3, §8.2'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined) continue
      if (RuleUtils.declaresStaticMethod(klass, 'terminate')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Injection ${c.name} does not declare a static terminate() operation.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
