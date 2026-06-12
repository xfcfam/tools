import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `general-constructor-mismatch` (G4, structural) — § 8.2.
 *
 * A generalization component implements non-trivial logic within its
 * constructor instead of in a separate `init()` operation. Same
 * detection as `logic-constructor-mismatch`: flagged when the
 * constructor invokes another component through an injection (`R`/`B`/
 * `A`); computing `super(...)` arguments and initialising own attributes
 * are permitted (see {@link RuleUtils.constructorIsNonTrivial}).
 */
export class GeneralConstructorMismatchBusiness extends RuleBusiness {
  readonly id = 'general-constructor-mismatch'
  readonly group = 4
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A generalization component performs non-trivial initialization in its constructor instead of in init().'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§8.2'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'generalization') continue
      const sf = RuleUtils.sourceOf(c)
      const klass = RuleUtils.primaryClass(c)
      if (sf === undefined || klass === undefined) continue
      if (!klass.hasPublicConstructor && !klass.hasPrivateConstructor) continue
      const body = RuleUtils.constructorBody(sf.text)
      if (body === null) continue
      if (!RuleUtils.constructorIsNonTrivial(body.text)) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Generalization ${c.name} invokes another component through an injection (R/B/A) in its constructor. Constructors must not invoke other components; defer this to the init() operation.`,
        location: { path: c.relativePath, line: body.line },
      })
    }
    return violations
  }
}
