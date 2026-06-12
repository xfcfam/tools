import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `injection-init-mismatch` (G5, structural) — § 7.3.3.
 *
 * The body of the `init()` operation of an injection component contains
 * statements other than invocations to `init()` of the logical
 * components aggregated as slots in that injection.
 *
 * Verified by extracting the static `init()` body and checking that
 * every non-trivial statement is a `<receiver>.init(...)` call (await /
 * `super.init()` permitted). Anything else (assignments, logging, other
 * method calls) is a violation.
 */
export class InjectionInitMismatchBusiness extends RuleBusiness {
  readonly id = 'injection-init-mismatch'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The init() body of an injection contains statements other than slot init() invocations.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      const body = RuleUtils.staticMethodBody(sf.text, 'init')
      if (body === null) continue
      const offending = RuleUtils.nonLifecycleStatements(body.text, 'init')
      for (const stmt of offending) {
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Injection ${c.name}.init() contains a non-canonical statement: "${stmt}". Only slot init() invocations are allowed.`,
          location: { path: c.relativePath, line: body.line },
        })
      }
    }
    return violations
  }
}
