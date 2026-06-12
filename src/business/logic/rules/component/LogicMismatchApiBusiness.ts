import { SemanticRuleBusiness } from '../../../general/SemanticRuleBusiness.js'

/**
 * `logic-mismatch-api` (G3, semantic) — § 7.2.3.
 *
 * A logical component classified in the Interaction Layer contains
 * logic that does not correspond to the functional responsibility of
 * that layer. Semantic — not decided statically.
 */
export class LogicMismatchApiBusiness extends SemanticRuleBusiness {
  readonly id = 'logic-mismatch-api'
  readonly group = 3
  readonly description = 'An Interaction Layer logical contains logic outside the responsibility of that layer.'
  readonly specRef = '§7.2.3'
}
