import { SemanticRuleBusiness } from '../../../general/SemanticRuleBusiness.js'

/**
 * `structure-domain-subdivision` (G1, semantic) — § 7.2.1, § 7.2.3.
 *
 * The internal subdivision of /repository/logic or /api/logic groups
 * logical components by functional domain of the artefact, instead of
 * by the legitimate subdivision criterion of its layer (transport for
 * Access, interaction-point type for Interaction). Deciding whether a
 * subfolder name denotes a domain or a legitimate criterion is a
 * semantic judgement — not decided by the static tool.
 */
export class StructureDomainSubdivisionBusiness extends SemanticRuleBusiness {
  readonly id = 'structure-domain-subdivision'
  readonly group = 1
  readonly description = 'The /repository/logic or /api/logic subdivision groups by domain instead of by the legitimate layer criterion.'
  readonly specRef = '§7.2.1, §7.2.3'
}
