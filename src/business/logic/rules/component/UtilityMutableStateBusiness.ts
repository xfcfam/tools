import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `utility-mutable-state` (G6, structural) — § 7.3.4.
 *
 * A utility component declares mutable attributes. A utility is a pure
 * stateless helper; any non-`readonly` attribute (instance or static)
 * is mutable state that does not belong in a utility.
 *
 * Detection: a declared instance field (always mutable as far as the
 * projection is concerned) or a static field whose declaration line
 * lacks `readonly`.
 */
export class UtilityMutableStateBusiness extends RuleBusiness {
  readonly id = 'utility-mutable-state'
  readonly group = 6
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A utility component declares mutable attributes.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.4'
  // `readonly` detection on static fields is TS-specific here.
  override readonly appliesTo = ['typescript'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'utility') continue
      const sf = RuleUtils.sourceOf(c)
      const klass = RuleUtils.primaryClass(c)
      if (sf === undefined || klass === undefined) continue
      for (const field of klass.staticFields) {
        const re = new RegExp(`^[^\\n]*\\bstatic\\b[^\\n]*\\b${field}\\b[^\\n]*$`, 'm')
        const m = sf.text.match(re)
        if (m === null) continue
        if (/\breadonly\b/.test(m[0])) continue
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Utility ${c.name} declares mutable static attribute '${field}'. Utility attributes must be readonly.`,
          location: { path: c.relativePath, line: RuleUtils.lineAt(sf.text, m.index ?? 0) },
        })
      }
    }
    return violations
  }
}
