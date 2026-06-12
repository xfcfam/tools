import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import type { Component } from '../../../transfers/Component.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `utility-inheritance` (G6, structural) — § 7.3.4.
 *
 * A utility component inherits from a component that is not a utility
 * component of its same layer. Inheritance from an external base class
 * (whose classification cannot be recovered) is out of scope here; only
 * an in-artefact parent that is not a same-layer utility is flagged.
 */
export class UtilityInheritanceBusiness extends RuleBusiness {
  readonly id = 'utility-inheritance'
  readonly group = 6
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A utility component inherits from something other than a utility of its same layer.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.4'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    const byName = new Map<string, Component>()
    for (const c of artefact.components) byName.set(c.name, c)

    for (const c of artefact.components) {
      if (c.type !== 'utility') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined || klass.extendsName === null) continue
      const parent = byName.get(klass.extendsName)
      if (parent === undefined) continue // external base class → out of scope
      if (parent.type === 'utility' && parent.layer === c.layer) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Utility ${c.name} (/${c.layer}) inherits from ${parent.name} (${parent.type}, /${parent.layer}). A utility may only inherit from a utility of its own layer.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
