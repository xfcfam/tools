import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import type { Component, Layer } from '../../../transfers/Component.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `layer-inheritance` (G2, structural) — § 6.2.2.
 *
 * A component inherits from another component classified in a layer
 * different from its own, in either direction. The parent's layer is
 * resolved from (a) an in-artefact component of the same `extendsName`
 * or (b) the canonical suffix of the parent name (covers `@xfcfam/*`
 * base classes such as `Repository`, `Business`, `View`). Parents whose
 * layer cannot be decided are ignored (e.g. language `Error`).
 */
export class LayerInheritanceBusiness extends RuleBusiness {
  readonly id = 'layer-inheritance'
  readonly group = 2
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A component inherits from a component classified in a different layer (either direction).'
  readonly scope: RuleScope = 'artefact'
  readonly specRef = '§6.2.2'
  // Needs a parsed superclass name.
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    const layerByName = new Map<string, Layer>()
    for (const c of artefact.components) {
      if (c.layer !== 'architecture') layerByName.set(c.name, c.layer)
    }
    for (const c of artefact.components) {
      if (c.layer === 'architecture') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined || klass.extendsName === null) continue
      const parent = klass.extendsName
      const parentLayer = layerByName.get(parent) ?? RuleUtils.layerFromSuffix(parent)
      if (parentLayer === null) continue
      if (parentLayer === c.layer) continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `${c.name} (/${c.layer}) inherits from ${parent} (/${parentLayer}). Inheritance may not cross layers.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
