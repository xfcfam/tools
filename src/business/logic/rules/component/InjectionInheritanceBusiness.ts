import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `injection-inheritance` (G5, structural) — § 7.3.3.
 *
 * An injection component inherits from any component, internal or
 * external to the artifact. Injections are leaf singletons — they must
 * not extend anything.
 */
export class InjectionInheritanceBusiness extends RuleBusiness {
  readonly id = 'injection-inheritance'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An injection component must not inherit from any component (internal or external).'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined || klass.extendsName === null) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Injection ${c.name} inherits from ${klass.extendsName}. Injection components must not inherit from anything.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
