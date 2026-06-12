import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `general-injection-reference` (G4, structural) — § 7.3.2.
 *
 * A generalization component invokes operations of logical components
 * through an injection component. A generalization is an abstract base;
 * it must not orchestrate logicals via any injection (`R`/`B`/`A`).
 *
 * Detection: scan each generalization for (a) an import of `R`/`B`/`A`
 * (relative path or `@xfcfam/*` named import) and (b) inline member
 * access of the form `R.x`, `B.x`, `A.x` outside string/regex literals.
 */
export class GeneralInjectionReferenceBusiness extends RuleBusiness {
  readonly id = 'general-injection-reference'
  readonly group = 4
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A generalization component invokes logical components through an injection (R / B / A).'
  readonly scope: RuleScope = 'artefact'
  readonly specRef = '§7.3.2'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  private static readonly INJECTIONS = ['R', 'B', 'A'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'generalization') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue

      // (a) Direct import of an injection symbol.
      for (const imp of sf.imports) {
        for (const name of imp.names) {
          if ((GeneralInjectionReferenceBusiness.INJECTIONS as readonly string[]).includes(name)) {
            violations.push({
              ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
              message: `Generalization ${c.name} (/${c.layer}/general) imports injection ${name}. Generalizations must not orchestrate logicals through an injection.`,
              location: { path: c.relativePath, line: imp.line },
            })
          }
        }
      }

      // (b) Inline `R.x` / `B.x` / `A.x` access — scanned over a
      // comment/string-masked view, so matches inside JSDoc `@example`
      // blocks or string literals are not counted.
      const code = RuleUtils.maskCommentsAndStrings(sf.text)
      for (const inj of GeneralInjectionReferenceBusiness.INJECTIONS) {
        const re = new RegExp(`\\b${inj}\\.[A-Za-z_$][\\w$]*`, 'g')
        let m: RegExpExecArray | null
        while ((m = re.exec(code)) !== null) {
          violations.push({
            ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
            message: `Generalization ${c.name} (/${c.layer}/general) references ${m[0]}. Generalizations must not invoke logicals through an injection.`,
            location: { path: c.relativePath, line: RuleUtils.lineAt(code, m.index) },
          })
        }
      }
    }
    return violations
  }
}
