import { SemanticRuleBusiness } from '../../../general/SemanticRuleBusiness.js'

/**
 * `logic-mismatch-repository` (G3, semantic) — § 7.2.1.
 *
 * A logical component classified in the Access Layer contains logic
 * that does not correspond to the functional responsibility of that
 * layer. Whether code matches a layer's responsibility is a semantic
 * judgement — not decided by the static tool.
 */
export class LogicMismatchRepositoryBusiness extends SemanticRuleBusiness {
  readonly id = 'logic-mismatch-repository'
  readonly group = 3
  readonly description = 'An Access Layer logical contains logic outside the responsibility of that layer.'
  readonly specRef = '§7.2.1'
}
