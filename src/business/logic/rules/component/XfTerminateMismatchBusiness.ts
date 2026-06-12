import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `xf-terminate-mismatch` (G8, structural) — § 8.3.
 *
 * The body of the `terminate()` operation of the `XF` element contains
 * statements other than the invocations `A.terminate()`,
 * `B.terminate()`, `R.terminate()` in that reverse order.
 */
export class XfTerminateMismatchBusiness extends RuleBusiness {
  readonly id = 'xf-terminate-mismatch'
  readonly group = 8
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The XF.terminate() body must be exactly A.terminate(); B.terminate(); R.terminate() in that order.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§8.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  private static readonly EXPECTED = ['A', 'B', 'R']

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'architecture' || c.name !== 'XF') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      const body = RuleUtils.staticMethodBody(sf.text, 'terminate')
      if (body === null) continue

      const offending = RuleUtils.nonLifecycleStatements(body.text, 'terminate')
      for (const stmt of offending) {
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `XF.terminate() contains a non-canonical statement: "${stmt}". Only A.terminate(); B.terminate(); R.terminate() are allowed.`,
          location: { path: c.relativePath, line: body.line },
        })
      }
      const order = RuleUtils.orderedLifecycleRoots(body.text, 'terminate')
      if (order.join(',') !== XfTerminateMismatchBusiness.EXPECTED.join(',')) {
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `XF.terminate() invokes injections in order [${order.join(', ')}]; canonical reverse order is A.terminate(); B.terminate(); R.terminate().`,
          location: { path: c.relativePath, line: body.line },
        })
      }
    }
    return violations
  }
}
