import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `lifecycle-logic-terminate` (G9, structural) — § 8.2.
 *
 * A component of the artifact other than the injection component of the
 * layer of the logical component invokes `terminate()` on a logical.
 * Reported on the invoking component. Sister rule of
 * `lifecycle-logic-init` — same whitelist of legitimate receiver roots.
 */
export class LifecycleLogicTerminateBusiness extends RuleBusiness {
  readonly id = 'lifecycle-logic-terminate'
  readonly group = 9
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A component other than the layer injection invokes terminate() on a logical component.'
  readonly scope: RuleScope = 'artefact'
  readonly specRef = '§8.2'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  private static readonly CALL_RE = /((?:[A-Za-z_$][\w$]*\.)*[A-Za-z_$][\w$]*)\.terminate\s*\(/g
  private static readonly ALLOWED_ROOTS = new Set(['super', 'this', 'R', 'B', 'A', 'XF'])

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type === 'injection') continue
      if (c.layer === 'architecture') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      const re = new RegExp(LifecycleLogicTerminateBusiness.CALL_RE.source, 'g')
      let m: RegExpExecArray | null
      while ((m = re.exec(sf.text)) !== null) {
        const receiver = m[1]!
        const root = receiver.split('.')[0]!
        if (LifecycleLogicTerminateBusiness.ALLOWED_ROOTS.has(root)) continue
        if (RuleUtils.appearsInLiteral(sf.text, m.index)) continue
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `${c.name} invokes ${receiver}.terminate(). terminate() on a logical is reserved to its layer injection (R / B / A).`,
          location: { path: c.relativePath, line: RuleUtils.lineAt(sf.text, m.index) },
        })
      }
    }
    return violations
  }
}
