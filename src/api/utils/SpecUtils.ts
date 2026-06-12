/**
 * Interaction-Layer Utility — static metadata about the normative
 * specification this toolkit validates against. Pure, immutable
 * constants: no state, no I/O. Centralises the catalog edition so the
 * reporter and the `--version` command stay in sync.
 */
export class SpecUtils {
  private constructor() {}

  /** Catalog edition this build of xftools implements (`xfa-en.tex § 11.3`). */
  static readonly edition = 'XF-CFAM-001:2026'
  /** Number of rules in the catalog. */
  static readonly ruleCount = 71
  /** Number of thematic groups the rules are organised into. */
  static readonly groupCount = 9
  /** Canonical home of the normative specification document. */
  static readonly documentUrl = 'https://xfcfam.org'
}
