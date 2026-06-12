import { SemanticRuleBusiness } from '../../../general/SemanticRuleBusiness.js'

/**
 * `transfer-business-logic` (G7, semantic) — § 7.3.5.
 *
 * An operation of a transfer component models a business process of the
 * domain. A transfer may carry self-contained operations on its own
 * data; whether an operation crosses into modeling a business process
 * is a semantic judgement — not decided statically.
 */
export class TransferBusinessLogicBusiness extends SemanticRuleBusiness {
  readonly id = 'transfer-business-logic'
  readonly group = 7
  readonly description = 'An operation of a transfer component models a business process of the domain.'
  readonly specRef = '§7.3.5'
}
