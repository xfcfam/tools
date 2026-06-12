import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `lifecycle-injection-init` (G9, structural) — § 7.3.3, § 8.3.
 *
 * A component of the artifact other than the `XF` element invokes
 * `init()` on an injection component (`R.init()`, `B.init()`,
 * `A.init()`). Reported on the invoking component.
 */
export class LifecycleInjectionInitBusiness extends RuleBusiness {
  readonly id = 'lifecycle-injection-init'
  readonly group = 9
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A component other than the XF element invokes init() on an injection component.'
  readonly scope: RuleScope = 'artefact'
  readonly specRef = '§7.3.3, §8.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  private static readonly INJECTIONS = ['R', 'B', 'A'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      // The XF element is the legitimate orchestrator of injection init().
      if (c.type === 'architecture' && c.name === 'XF') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      for (const inj of LifecycleInjectionInitBusiness.INJECTIONS) {
        const re = new RegExp(`\\b${inj}\\.init\\s*\\(`, 'g')
        let m: RegExpExecArray | null
        while ((m = re.exec(sf.text)) !== null) {
          if (RuleUtils.appearsInLiteral(sf.text, m.index)) continue
          violations.push({
            ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
            message: `${c.name} invokes ${inj}.init(). init() on an injection is reserved to the XF element.`,
            location: { path: c.relativePath, line: RuleUtils.lineAt(sf.text, m.index) },
          })
        }
      }
    }
    return violations
  }
}
