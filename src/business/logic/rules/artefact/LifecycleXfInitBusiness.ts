import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `lifecycle-xf-init` (G9, structural) — § 8.3.
 *
 * A component of the artifact other than `XF` itself invokes `init()`
 * on the `XF` element. Reported on the invoking component. The external
 * execution start point (outside `/src`) is also permitted, but the
 * tool never inspects outside `/src`, so only in-artefact components are
 * checked here.
 */
export class LifecycleXfInitBusiness extends RuleBusiness {
  readonly id = 'lifecycle-xf-init'
  readonly group = 9
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A component other than XF itself invokes init() on the XF element.'
  readonly scope: RuleScope = 'artefact'
  readonly specRef = '§8.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type === 'architecture' && c.name === 'XF') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      const re = /\bXF\.init\s*\(/g
      let m: RegExpExecArray | null
      while ((m = re.exec(sf.text)) !== null) {
        if (RuleUtils.appearsInLiteral(sf.text, m.index)) continue
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `${c.name} invokes XF.init(). init() on the XF element is reserved to XF itself or the external start point.`,
          location: { path: c.relativePath, line: RuleUtils.lineAt(sf.text, m.index) },
        })
      }
    }
    return violations
  }
}
