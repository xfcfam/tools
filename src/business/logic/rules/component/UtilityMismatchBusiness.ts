import { SemanticRuleBusiness } from '../../../general/SemanticRuleBusiness.js'

/**
 * `utility-mismatch` (G6, semantic) — § 7.3.4.
 *
 * A utility component implements rules of the domain modeling of the
 * artifact, invokes logical components through the injection
 * components, or produces observable side effects. Whether a helper
 * "models the domain" or "produces side effects" is a semantic
 * judgement — not decided statically. (The structural surface — no
 * injection imports, no instance state — is covered by
 * `utility-member-instance` and `utility-mutable-state`.)
 */
export class UtilityMismatchBusiness extends SemanticRuleBusiness {
  readonly id = 'utility-mismatch'
  readonly group = 6
  readonly description = 'A utility component models the domain, calls logicals via injections, or causes observable side effects.'
  readonly specRef = '§7.3.4'
}
