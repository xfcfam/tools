import { StatelessBusiness } from '@xfcfam/xf'
import type { Artefact } from '../transfers/Artefact.js'
import type { LanguageId } from '../transfers/Language.js'
import type { Rule } from '../transfers/Rule.js'
import type { Violation, RuleScope, Verifiability } from '../transfers/Violation.js'

/**
 * Generalization for every XF rule. Each concrete rule in
 * `/business/logic/rules/` extends this class and implements `check`.
 *
 * Rules are Business Layer Logicals (stateless). They are registered
 * statically in `B.rules` and consumed by `B.ruleEngine`. Every rule
 * mirrors one entry of the normative catalog (`xfa-en.tex` § 11.3),
 * carrying its canonical `id`, thematic `group` (1–9), `verifiability`
 * and `specRef`.
 *
 * A rule may declare itself as **language-aware** by overriding
 * `appliesTo` with the set of languages where the underlying construct
 * exists. `undefined` (the default) means the rule applies universally
 * — the rule is path-based and doesn't depend on language-specific
 * syntax.
 *
 * **Semantic rules** (`verifiability === 'semantic'`) cannot be decided
 * by a static analyzer; they extend {@link SemanticRuleBusiness} and
 * always return `[]`, but remain declared so the catalog is complete
 * and the conformance algorithm can cap the static result at level 3.
 */
export abstract class RuleBusiness extends StatelessBusiness implements Rule {
  abstract readonly id: string
  abstract readonly group: number
  abstract readonly verifiability: Verifiability
  abstract readonly description: string
  abstract readonly scope: RuleScope
  abstract readonly specRef: string
  /**
   * Languages the rule applies to. `undefined` (default) means the
   * rule is language-agnostic and runs on every artefact.
   */
  readonly appliesTo: readonly LanguageId[] | undefined = undefined

  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  abstract check(artefact: Artefact): Violation[]
}
