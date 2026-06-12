import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `injection-mismatch` (G5, structural) — § 7.3.3.
 *
 * An injection component declares any member that is not a typed static
 * reference to a logical component of its layer or the static
 * operations `init()` or `terminate()`.
 *
 * Structural surface verified: no instance fields, no instance methods,
 * and static methods restricted to `init` / `terminate`. (The
 * type-correctness of each static slot is verified by the
 * `injection-non-*` rules.)
 */
export class InjectionMismatchBusiness extends RuleBusiness {
  readonly id = 'injection-mismatch'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An injection declares a member other than a static logical reference or static init() / terminate().'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.3'

  private static readonly ALLOWED_STATIC_METHODS = new Set(['init', 'terminate'])

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined) continue
      if (klass.instanceFields.length > 0) {
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Injection ${c.name} declares instance field(s) (${klass.instanceFields.join(', ')}). Injections expose only static members.`,
          location: { path: c.relativePath, line: klass.line },
        })
      }
      if (klass.instanceMethods.length > 0) {
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Injection ${c.name} declares instance method(s) (${klass.instanceMethods.join(', ')}). Injections expose only static members.`,
          location: { path: c.relativePath, line: klass.line },
        })
      }
      for (const m of klass.staticMethods) {
        if (InjectionMismatchBusiness.ALLOWED_STATIC_METHODS.has(m)) continue
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Injection ${c.name} declares static method '${m}'. Only static init() / terminate() and static logical references are allowed.`,
          location: { path: c.relativePath, line: klass.line },
        })
      }
    }
    return violations
  }
}
