import { SemanticRuleBusiness } from '../../../general/SemanticRuleBusiness.js'

/**
 * `transfer-naming` (G7, semantic) — § 7.3.5.
 *
 * A transfer component bears a suffix added to the domain concept it
 * models (e.g. `UserDTO`, `UserEntity`). Whether a token is a domain
 * concept or a gratuitous technical suffix is a semantic judgement —
 * the catalog classifies this rule as semantic, so the static tool does
 * not fail it.
 */
export class TransferNamingBusiness extends SemanticRuleBusiness {
  readonly id = 'transfer-naming'
  readonly group = 7
  readonly description = 'A transfer component bears a suffix added to the domain concept it models.'
  readonly specRef = '§7.3.5'
}
