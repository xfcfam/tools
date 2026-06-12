import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `lifecycle-logic-instantiation` (G9, structural) — § 7.3.3.
 *
 * A component of the artifact other than the injection components
 * instantiates a logical component by means of `new`. Reported on the
 * invoking component.
 *
 * Detection: for each logical name, search every other component's
 * source for `new <LogicalName>(`. The injection of the logical's own
 * layer is the only legitimate creator and is excepted.
 */
export class LifecycleLogicInstantiationBusiness extends RuleBusiness {
  readonly id = 'lifecycle-logic-instantiation'
  readonly group = 9
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A component other than the injection instantiates a logical component via new.'
  readonly scope: RuleScope = 'artefact'
  readonly specRef = '§7.3.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    const logicals = artefact.components.filter(c => c.type === 'logical')
    if (logicals.length === 0) return []
    const injectionName: Record<string, string> = { repository: 'R', business: 'B', api: 'A' }

    for (const c of artefact.components) {
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      for (const logical of logicals) {
        // The injection of the logical's layer is the legitimate creator.
        if (c.type === 'injection' && c.name === injectionName[logical.layer] && c.layer === logical.layer) continue
        const re = new RegExp(`new\\s+${logical.name}\\s*\\(`, 'g')
        let m: RegExpExecArray | null
        while ((m = re.exec(sf.text)) !== null) {
          if (RuleUtils.appearsInLiteral(sf.text, m.index)) continue
          violations.push({
            ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
            message: `${c.name} instantiates logical ${logical.name} via new. Instantiation of logicals is reserved to the layer injection (${injectionName[logical.layer] ?? '?'}).`,
            location: { path: c.relativePath, line: RuleUtils.lineAt(sf.text, m.index) },
          })
        }
      }
    }
    return violations
  }
}
