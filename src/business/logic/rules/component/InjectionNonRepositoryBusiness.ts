import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `injection-non-repository` (G5, structural) — § 7.3.3.
 *
 * The injection component `R` declares as a static attribute a
 * component that is not a logical component of the Access Layer.
 *
 * Detection: each runtime import the `R` file pulls in for a slot must
 * name a logical of the Access Layer (suffix `Repository`). A non-type
 * import naming a `*Business` / `*Service` / `*View` (i.e. a logical of
 * another layer) signals a wrong slot type.
 */
export class InjectionNonRepositoryBusiness extends RuleBusiness {
  readonly id = 'injection-non-repository'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The R injection declares a static slot that is not an Access Layer logical (Repository).'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.3'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  private static readonly FOREIGN_SUFFIXES = ['Business', 'Service', 'View'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection' || c.layer !== 'repository' || c.name !== 'R') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      for (const imp of sf.imports) {
        if (imp.isTypeOnly) continue
        if (imp.specifier.startsWith('@xfcfam/')) continue // base generalizations
        for (const name of imp.names) {
          const foreign = InjectionNonRepositoryBusiness.FOREIGN_SUFFIXES.find(s => name !== s && name.endsWith(s))
          if (foreign === undefined) continue
          violations.push({
            ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
            message: `Injection R declares slot ${name} (a *${foreign}), which is not an Access Layer logical. R may only aggregate Repository logicals.`,
            location: { path: c.relativePath, line: imp.line },
          })
        }
      }
    }
    return violations
  }
}
