import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `xf-init-mismatch` (G8, structural) — § 8.3.
 *
 * The body of the `init()` operation of the `XF` element contains
 * statements other than the invocations `R.init()`, `B.init()`,
 * `A.init()` in that order.
 *
 * Verified by checking (a) the ordered sequence of `<X>.init()` roots
 * is exactly `R, B, A`, and (b) no non-lifecycle statement is present.
 */
export class XfInitMismatchBusiness extends RuleBusiness {
  readonly id = 'xf-init-mismatch'
  readonly group = 8
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The XF.init() body must be exactly R.init(); B.init(); A.init() in that order.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§8.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  private static readonly EXPECTED = ['R', 'B', 'A']

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'architecture' || c.name !== 'XF') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      const body = RuleUtils.staticMethodBody(sf.text, 'init')
      if (body === null) continue // missing init → covered by xf-init-missing

      const offending = RuleUtils.nonLifecycleStatements(body.text, 'init')
      for (const stmt of offending) {
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `XF.init() contains a non-canonical statement: "${stmt}". Only R.init(); B.init(); A.init() are allowed.`,
          location: { path: c.relativePath, line: body.line },
        })
      }
      const order = RuleUtils.orderedLifecycleRoots(body.text, 'init')
      if (order.join(',') !== XfInitMismatchBusiness.EXPECTED.join(',')) {
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `XF.init() invokes injections in order [${order.join(', ')}]; canonical order is R.init(); B.init(); A.init().`,
          location: { path: c.relativePath, line: body.line },
        })
      }
    }
    return violations
  }
}
