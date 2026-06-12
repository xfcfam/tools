import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `structure-layer-mismatch` (G1, structural) — § 7.4, § 8.1.
 *
 * An element (file or folder) exists directly under the artefact root
 * `/src` whose name is not canonical for that level. The canonical
 * top-level elements are the three layer folders (`repository`,
 * `business`, `api`) and the optional `XF` start-point element file.
 */
export class StructureLayerMismatchBusiness extends RuleBusiness {
  readonly id = 'structure-layer-mismatch'
  readonly group = 1
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An element directly under /src is not a canonical layer folder or the XF element.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.4, §8.1'

  private static readonly CANONICAL_TOP = new Set(['repository', 'business', 'api'])

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    const seen = new Set<string>()
    for (const c of artefact.components) {
      const segments = c.relativePath.split('/').filter(s => s.length > 0)
      const top = segments[0]
      if (top === undefined) continue
      // A single-segment element at /src root: only the XF element is canonical.
      if (segments.length === 1) {
        if (c.name === 'XF') continue
        if (seen.has(c.relativePath)) continue
        seen.add(c.relativePath)
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Element '${c.relativePath}' under /src is not canonical at that level. Allowed: /repository, /business, /api, or the XF element.`,
          location: { path: `src/${c.relativePath}` },
        })
        continue
      }
      // Nested elements imply a top-level folder; flag a non-canonical one once.
      if (StructureLayerMismatchBusiness.CANONICAL_TOP.has(top)) continue
      if (seen.has(top)) continue
      seen.add(top)
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Top-level folder '${top}' under /src is not a canonical layer. Allowed: /repository, /business, /api.`,
        location: { path: `src/${top}` },
      })
    }
    return violations
  }
}
