import { SemanticRuleBusiness } from '../../../general/SemanticRuleBusiness.js'

/**
 * `logic-mismatch-business` (G3, semantic) — § 7.2.2.
 *
 * A logical component classified in the Business Layer contains logic
 * that does not correspond to the functional responsibility of that
 * layer. Semantic — not decided statically.
 */
export class LogicMismatchBusinessBusiness extends SemanticRuleBusiness {
  readonly id = 'logic-mismatch-business'
  readonly group = 3
  readonly description = 'A Business Layer logical contains logic outside the responsibility of that layer.'
  readonly specRef = '§7.2.2'
}
