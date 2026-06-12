import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `structure-component-naming` (G1, structural) — § 7.4.
 *
 * A file declares an XF component whose canonical name does not match
 * the name of the file without extension. The file/class correspondence
 * is verified on the primary class of each component file.
 */
export class StructureComponentNamingBusiness extends RuleBusiness {
  readonly id = 'structure-component-naming'
  readonly group = 1
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A component class name does not match its file name (without extension).'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.4'
  // Requires a parsed class declaration to compare names.
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type === 'unknown') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined || sf.classes.length === 0) continue
      // The file declares a component when it has a primary exported class.
      const match = sf.classes.find(k => k.name === c.name)
      if (match !== undefined) continue
      // Some files legitimately host helper classes only when there is
      // no class matching the filename AND no single dominant class.
      const primary = sf.classes[0]!
      if (sf.classes.length === 1) {
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `File ${c.name} declares component '${primary.name}', which does not match the file name.`,
          location: { path: c.relativePath, line: primary.line },
        })
      }
    }
    return violations
  }
}
