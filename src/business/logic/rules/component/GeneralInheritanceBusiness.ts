import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import type { Component } from '../../../transfers/Component.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `general-inheritance` (G4, structural) — § 7.3.2.
 *
 * A generalization component inherits from an XF component internal to
 * the artifact that is not a generalization component of its same
 * layer. Inheritance from external (`@xfcfam/*` or framework) base
 * classes is outside this rule's scope (it speaks of components
 * *internal to the artifact*).
 */
export class GeneralInheritanceBusiness extends RuleBusiness {
  readonly id = 'general-inheritance'
  readonly group = 4
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A generalization inherits from an internal XF component that is not a same-layer generalization.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.2'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    const byName = new Map<string, Component>()
    for (const c of artefact.components) byName.set(c.name, c)

    for (const c of artefact.components) {
      if (c.type !== 'generalization') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined || klass.extendsName === null) continue
      const parent = byName.get(klass.extendsName)
      if (parent === undefined) continue // external base class → out of scope
      const ok = parent.type === 'generalization' && parent.layer === c.layer
      if (ok) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Generalization ${c.name} (/${c.layer}) inherits from internal component ${parent.name} (${parent.type}, /${parent.layer}). A generalization may only inherit from a generalization of its own layer.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
