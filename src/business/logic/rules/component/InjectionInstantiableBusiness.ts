import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `injection-instantiable` (G5, structural) — § 7.3.3.
 *
 * An injection component does not explicitly prevent its instantiation
 * by means of the mechanisms of the programming language (a private
 * constructor or an `abstract class`).
 */
export class InjectionInstantiableBusiness extends RuleBusiness {
  readonly id = 'injection-instantiable'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An injection component must prevent its instantiation (private constructor or abstract class).'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.3'
  override readonly appliesTo = ['typescript', 'java', 'kotlin', 'csharp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined) continue
      if (RuleUtils.isNonInstantiable(klass)) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Injection ${c.name} is instantiable. Give it a private constructor (or declare it abstract).`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
