import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `injection-lifecycle-symmetry` (G5, structural) — § 8.2.
 *
 * There exists a slot `s` of an injection component such that
 * `s.init()` is invoked in the body of `init()` and `s.terminate()` is
 * not invoked in the body of `terminate()`, or vice versa. The two slot
 * sets must coincide.
 */
export class InjectionLifecycleSymmetryBusiness extends RuleBusiness {
  readonly id = 'injection-lifecycle-symmetry'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'Every slot initialized in an injection init() must be terminated in terminate(), and vice versa.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§8.2'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      const initBody = RuleUtils.staticMethodBody(sf.text, 'init')
      const termBody = RuleUtils.staticMethodBody(sf.text, 'terminate')
      if (initBody === null || termBody === null) continue
      const inited = RuleUtils.lifecycleSlotReceivers(initBody.text, 'init')
      const terminated = RuleUtils.lifecycleSlotReceivers(termBody.text, 'terminate')

      for (const s of inited) {
        if (terminated.has(s)) continue
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Injection ${c.name} initializes slot '${s}.init()' but never terminates it in terminate().`,
          location: { path: c.relativePath, line: termBody.line },
        })
      }
      for (const s of terminated) {
        if (inited.has(s)) continue
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Injection ${c.name} terminates slot '${s}.terminate()' but never initializes it in init().`,
          location: { path: c.relativePath, line: initBody.line },
        })
      }
    }
    return violations
  }
}
