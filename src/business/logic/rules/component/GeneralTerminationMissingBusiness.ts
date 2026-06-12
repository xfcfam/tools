import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `general-termination-missing` (G4, structural) — § 7.3.2, § 8.2.
 *
 * A generalization component does not declare or inherit an invocable
 * `terminate()` operation. Same inheritance presumption as
 * `general-initialization-missing`.
 */
export class GeneralTerminationMissingBusiness extends RuleBusiness {
  readonly id = 'general-termination-missing'
  readonly group = 4
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A generalization component does not declare or inherit an invocable terminate() operation.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.2, §8.2'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'generalization') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined) continue
      if (klass.extendsName !== null) continue
      if (RuleUtils.declaresMethod(klass, 'terminate')) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Generalization ${c.name} declares no superclass and no invocable terminate() operation.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
