import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `general-domain-state` (G4, structural) — § 7.3.1, § 7.3.2.
 *
 * A generalization component declares mutable attributes that model
 * concepts of the domain of the artifact. A generalization abstracts
 * behavior, not state; mutable instance attributes signal domain state
 * that belongs in a logical component instead.
 *
 * Structural proxy: the presence of a non-`readonly` instance field on
 * the generalization class. (Whether the field "models a domain
 * concept" is not separately decidable statically; a mutable instance
 * attribute on an abstract base is the structural witness the spec
 * targets.)
 */
export class GeneralDomainStateBusiness extends RuleBusiness {
  readonly id = 'general-domain-state'
  readonly group = 4
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A generalization component declares mutable instance attributes (domain state).'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.1, §7.3.2'
  // Needs field-modifier inspection in the class body text.
  override readonly appliesTo = ['typescript'] as const

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'generalization') continue
      const sf = RuleUtils.sourceOf(c)
      const klass = RuleUtils.primaryClass(c)
      if (sf === undefined || klass === undefined) continue
      const lines = sf.text.split('\n')
      // Class type parameters (e.g. `T` in `Business<T>`). A field whose
      // declared type is exactly a type parameter is a PARAMETRIC state slot
      // for subclasses, not an attribute modelling a concrete domain concept
      // — so it is not domain state held by the generalization itself.
      const tpMatch = sf.text.match(new RegExp(`\\bclass\\s+${klass.name}\\s*<([^>]*)>`))
      const typeParams = tpMatch === null
        ? []
        : tpMatch[1]!.split(',').map(p => (p.trim().split(/[\s=]/)[0] ?? '')).filter(s => s.length > 0)
      for (const field of klass.instanceFields) {
        // Find the member declaration line for `field` and decide its
        // mutability from the modifiers ON THAT LINE.
        const declRe = new RegExp(`^\\s*(?:public\\s+|protected\\s+|private\\s+|abstract\\s+|override\\s+|declare\\s+)*(readonly\\s+|get\\s+)?${field}\\b\\s*[:=?(]`)
        let mutable = false
        let lineNo = klass.line
        let declLine = ''
        for (let i = 0; i < lines.length; i++) {
          const m = lines[i]!.match(declRe)
          if (m === null) continue
          lineNo = i + 1
          declLine = lines[i]!
          // `readonly` or a getter accessor → immutable; otherwise mutable.
          mutable = m[1] === undefined
          break
        }
        if (!mutable) continue
        // Exempt a field whose declared type is exactly a class type parameter.
        const typeMatch = declLine.match(new RegExp(`\\b${field}\\b\\s*\\??\\s*:\\s*([^=;]+)`))
        if (typeMatch !== null && typeParams.includes(typeMatch[1]!.trim())) continue
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Generalization ${c.name} declares mutable instance attribute '${field}'. Generalizations must not hold mutable domain state.`,
          location: { path: c.relativePath, line: lineNo },
        })
      }
    }
    return violations
  }
}
