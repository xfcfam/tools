import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import type { Component, ComponentType, Layer } from '../../../transfers/Component.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `logic-inheritance` (G3, structural) — § 7.3.1, § 7.3.2.
 *
 * A logical component inherits from a component that is neither a
 * logical component nor a generalization component of its same layer.
 *
 * Parent resolution: an in-artefact parent is looked up by name to get
 * its exact layer + type; an `@xfcfam/*` base class is resolved to a
 * generalization of the layer implied by its canonical suffix (e.g.
 * `StatelessBusiness` → Business generalization). Parents whose layer
 * cannot be decided (e.g. a foreign framework class without a canonical
 * suffix) are not flagged here.
 */
export class LogicInheritanceBusiness extends RuleBusiness {
  readonly id = 'logic-inheritance'
  readonly group = 3
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A logical inherits from something other than a logical or generalization of its own layer.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.1, §7.3.2'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    const byName = new Map<string, Component>()
    for (const c of artefact.components) byName.set(c.name, c)

    for (const c of artefact.components) {
      if (c.type !== 'logical') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined || klass.extendsName === null) continue
      const parent = klass.extendsName

      let parentLayer: Layer | null
      let parentType: ComponentType | 'generalization-presumed'
      const local = byName.get(parent)
      if (local !== undefined) {
        parentLayer = local.layer
        parentType = local.type
      } else {
        parentLayer = RuleUtils.layerFromSuffix(parent)
        parentType = 'generalization-presumed' // external @xfcfam base classes are generalizations
      }
      if (parentLayer === null) continue // undecidable → not flagged

      const sameLayer = parentLayer === c.layer
      const okType = parentType === 'logical' || parentType === 'generalization' || parentType === 'generalization-presumed'
      if (sameLayer && okType) continue

      const desc = !sameLayer ? `of a different layer (/${parentLayer})` : `which is a ${parentType} component`
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Logical ${c.name} (/${c.layer}) inherits from ${parent} ${desc}. A logical may only inherit from a logical or generalization of its own layer.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
