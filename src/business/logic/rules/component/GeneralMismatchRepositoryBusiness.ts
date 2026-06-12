import { SemanticRuleBusiness } from '../../../general/SemanticRuleBusiness.js'

/**
 * `general-mismatch-repository` (G4, semantic) — § 7.3.2, § 7.2.1.
 *
 * A generalization component classified in the Access Layer contains
 * logic that does not correspond to the functional responsibility of
 * that layer. Semantic — not decided statically.
 */
export class GeneralMismatchRepositoryBusiness extends SemanticRuleBusiness {
  readonly id = 'general-mismatch-repository'
  readonly group = 4
  readonly description = 'An Access Layer generalization contains logic outside the responsibility of that layer.'
  readonly specRef = '§7.3.2, §7.2.1'
}
