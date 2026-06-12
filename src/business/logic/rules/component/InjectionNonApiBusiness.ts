import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `injection-non-api` (G5, structural) — § 7.3.3.
 *
 * The injection component `A` declares as a static attribute a
 * component that is not a logical component of the Interaction Layer.
 * A non-type import naming a `*Repository` / `*Business` signals a
 * wrong slot type. (`A` aggregates Service and View logicals.)
 */
export class InjectionNonApiBusiness extends RuleBusiness {
  readonly id = 'injection-non-api'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The A injection declares a static slot that is not an Interaction Layer logical (Service / View).'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  private static readonly FOREIGN_SUFFIXES = ['Repository', 'Business'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection' || c.layer !== 'api' || c.name !== 'A') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      for (const imp of sf.imports) {
        if (imp.isTypeOnly) continue
        if (imp.specifier.startsWith('@xfcfam/')) continue
        for (const name of imp.names) {
          const foreign = InjectionNonApiBusiness.FOREIGN_SUFFIXES.find(s => name !== s && name.endsWith(s))
          if (foreign === undefined) continue
          violations.push({
            ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
            message: `Injection A declares slot ${name} (a *${foreign}), which is not an Interaction Layer logical. A may only aggregate Service / View logicals.`,
            location: { path: c.relativePath, line: imp.line },
          })
        }
      }
    }
    return violations
  }
}
