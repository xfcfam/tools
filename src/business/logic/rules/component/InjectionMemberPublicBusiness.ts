import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `injection-member-public` (G5, structural) — § 7.3.3.
 *
 * The static references to the logical components in the injection
 * component do not have public visibility. Detected by scanning for
 * `private static` / `protected static` declarations inside the
 * injection class (the consumers in the upper layers must be able to
 * read the slots).
 */
export class InjectionMemberPublicBusiness extends RuleBusiness {
  readonly id = 'injection-member-public'
  readonly group = 5
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'The static logical references of an injection component must have public visibility.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.3'
  override readonly appliesTo = ['typescript', 'java', 'kotlin', 'csharp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'injection') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      const re = /^[ \t]*(?:private|protected)\s+(?:readonly\s+)?static\b[^\n]*$|^[ \t]*static\s+(?:private|protected)\b[^\n]*$/gm
      let m: RegExpExecArray | null
      while ((m = re.exec(sf.text)) !== null) {
        // Skip non-field (method) declarations and init/terminate.
        const line = m[0]
        if (/\b(init|terminate)\s*\(/.test(line)) continue
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Injection ${c.name} declares a non-public static member: "${line.trim()}". Logical references must be public.`,
          location: { path: c.relativePath, line: RuleUtils.lineAt(sf.text, m.index) },
        })
      }
    }
    return violations
  }
}
