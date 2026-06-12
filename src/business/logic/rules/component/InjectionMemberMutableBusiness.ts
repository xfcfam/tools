import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import type { LanguageId } from '../../../transfers/Language.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `injection-member-mutable` (G5, structural) — § 7.3.3.
 *
 * The static references to the logical components in the injection
 * component are not immutable. Verified by checking that each static
 * field declaration carries the language's native immutable-reference
 * modifier (`readonly` / `final` / `val` / `const`).
 */
export class InjectionMemberMutableBusiness extends RuleBusiness {
  readonly id = 'injection-member-mutable'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The static logical references of an injection component must be immutable (readonly / final / val / const).'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.3'
  override readonly appliesTo = ['typescript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  private static readonly MODIFIER: Partial<Record<LanguageId, string>> = {
    typescript: 'readonly',
    java: 'final',
    kotlin: 'val',
    csharp: 'readonly',
    cpp: 'const',
  }

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection') continue
      const sf = RuleUtils.sourceOf(c)
      const klass = RuleUtils.primaryClass(c)
      if (sf === undefined || klass === undefined) continue
      const modifier = InjectionMemberMutableBusiness.MODIFIER[c.language]
      if (modifier === undefined) continue
      for (const field of klass.staticFields) {
        const line = InjectionMemberMutableBusiness.staticFieldLine(sf.text, field)
        if (line === null) continue
        if (line.includes(modifier)) continue
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Injection ${c.name} declares static slot '${field}' without '${modifier}'. Logical references must be immutable.`,
          location: { path: c.relativePath, line: RuleUtils.lineAt(sf.text, sf.text.indexOf(line)) },
        })
      }
    }
    return violations
  }

  /** Return the source line that declares `static … <field>`, or null. */
  private static staticFieldLine(text: string, field: string): string | null {
    const re = new RegExp(`^[^\\n]*\\bstatic\\b[^\\n]*\\b${field}\\b[^\\n]*$`, 'm')
    const m = text.match(re)
    return m === null ? null : m[0]
  }
}
