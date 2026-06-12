import { SemanticRuleBusiness } from '../../../general/SemanticRuleBusiness.js'

/**
 * `general-mismatch-business` (G4, semantic) — § 7.3.2, § 7.2.2.
 *
 * A generalization component classified in the Business Layer contains
 * logic that does not correspond to the functional responsibility of
 * that layer. Semantic — not decided statically.
 */
export class GeneralMismatchBusinessBusiness extends SemanticRuleBusiness {
  readonly id = 'general-mismatch-business'
  readonly group = 4
  readonly description = 'A Business Layer generalization contains logic outside the responsibility of that layer.'
  readonly specRef = '§7.3.2, §7.2.2'
}
