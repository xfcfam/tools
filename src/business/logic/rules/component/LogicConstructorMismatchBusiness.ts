import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `logic-constructor-mismatch` (G3, structural) — § 8.2.
 *
 * A logical component implements non-trivial initialization logic
 * within its constructor instead of in a separate `init()` operation.
 *
 * Detection: extract the primary class constructor body and flag it
 * when it invokes another component through an injection (`R.x` / `B.y`
 * / `A.z`) — the structurally-decidable part of §8.2 (see
 * {@link RuleUtils.constructorIsNonTrivial}). Computing `super(...)`
 * arguments and initialising the component's own attributes are
 * permitted; dependence on environment resources is a semantic property
 * left to human review (Λ=4).
 */
export class LogicConstructorMismatchBusiness extends RuleBusiness {
  readonly id = 'logic-constructor-mismatch'
  readonly group = 3
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A logical component performs non-trivial initialization in its constructor instead of in init().'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§8.2'
  // Body-text scan tuned to brace languages.
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'logical') continue
      const sf = RuleUtils.sourceOf(c)
      const klass = RuleUtils.primaryClass(c)
      if (sf === undefined || klass === undefined) continue
      if (!klass.hasPublicConstructor && !klass.hasPrivateConstructor) continue
      const body = RuleUtils.constructorBody(sf.text)
      if (body === null) continue
      if (!RuleUtils.constructorIsNonTrivial(body.text)) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Logical ${c.name} invokes another component through an injection (R/B/A) in its constructor. Constructors must not invoke other components; defer this to the init() operation.`,
        location: { path: c.relativePath, line: body.line },
      })
    }
    return violations
  }
}
