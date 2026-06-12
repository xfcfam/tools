import { SemanticRuleBusiness } from '../../../general/SemanticRuleBusiness.js'

/**
 * `general-mismatch-api` (G4, semantic) — § 7.3.2, § 7.2.3.
 *
 * A generalization component classified in the Interaction Layer
 * contains logic that does not correspond to the functional
 * responsibility of that layer. Semantic — not decided statically.
 */
export class GeneralMismatchApiBusiness extends SemanticRuleBusiness {
  readonly id = 'general-mismatch-api'
  readonly group = 4
  readonly description = 'An Interaction Layer generalization contains logic outside the responsibility of that layer.'
  readonly specRef = '§7.3.2, §7.2.3'
}
