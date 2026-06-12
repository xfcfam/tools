import { RuleBusiness } from './RuleBusiness.js'
import type { Artefact } from '../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../transfers/Violation.js'

/**
 * Business Layer Generalization — base for every **semantic** rule of
 * the catalog (xfa-en.tex § 11.1.4).
 *
 * Semantic rules describe an architectural intent that a static
 * analyzer cannot decide (e.g. "the logic in this Business component
 * actually belongs to the Business layer"). They are part of the
 * normative catalog and are declared here so the catalog is complete
 * and the conformance algorithm (§ 11.4) can cap the static result at
 * level 3 ("structurally conformant") — reaching level 4 requires human
 * review of these rules.
 *
 * `check` therefore always returns `[]`: the tool never fails a
 * semantic rule. Scope is fixed to `component` for reporting purposes.
 */
export abstract class SemanticRuleBusiness extends RuleBusiness {
  abstract override readonly id: string
  abstract override readonly group: number
  abstract override readonly description: string
  abstract override readonly specRef: string
  override readonly verifiability: Verifiability = 'semantic'
  override readonly scope: RuleScope = 'component'

  override check(_artefact: Artefact): Violation[] {
    // Semantic rules are not decidable statically — never fail them.
    return []
  }
}
