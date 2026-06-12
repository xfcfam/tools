import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `general-instantiable` (G4, structural) — § 7.3.2.
 *
 * A generalization component does not explicitly prevent its direct
 * instantiation by means of the mechanisms of the programming language
 * (an `abstract class`, or a private constructor).
 */
export class GeneralInstantiableBusiness extends RuleBusiness {
  readonly id = 'general-instantiable'
  readonly group = 4
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A generalization component must prevent its direct instantiation (abstract class or private constructor).'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.2'
  // Requires native `abstract class` / `private constructor` syntax.
  override readonly appliesTo = ['typescript', 'java', 'kotlin', 'csharp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'generalization') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined) continue
      if (RuleUtils.isNonInstantiable(klass)) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Generalization ${c.name} is directly instantiable. Declare it 'abstract' or give it a private constructor.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
