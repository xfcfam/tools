import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `lifecycle-injection-terminate` (G9, structural) — § 8.3.
 *
 * A component of the artifact other than the `XF` element invokes
 * `terminate()` on an injection component (`R.terminate()`,
 * `B.terminate()`, `A.terminate()`). Reported on the invoking
 * component.
 */
export class LifecycleInjectionTerminateBusiness extends RuleBusiness {
  readonly id = 'lifecycle-injection-terminate'
  readonly group = 9
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A component other than the XF element invokes terminate() on an injection component.'
  readonly scope: RuleScope = 'artefact'
  readonly specRef = '§8.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  private static readonly INJECTIONS = ['R', 'B', 'A'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type === 'architecture' && c.name === 'XF') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      for (const inj of LifecycleInjectionTerminateBusiness.INJECTIONS) {
        const re = new RegExp(`\\b${inj}\\.terminate\\s*\\(`, 'g')
        let m: RegExpExecArray | null
        while ((m = re.exec(sf.text)) !== null) {
          if (RuleUtils.appearsInLiteral(sf.text, m.index)) continue
          violations.push({
            ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
            message: `${c.name} invokes ${inj}.terminate(). terminate() on an injection is reserved to the XF element.`,
            location: { path: c.relativePath, line: RuleUtils.lineAt(sf.text, m.index) },
          })
        }
      }
    }
    return violations
  }
}
