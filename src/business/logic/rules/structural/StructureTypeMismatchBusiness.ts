import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'

/**
 * `structure-type-mismatch` (G1, structural) — § 7.4.
 *
 * An element exists directly under a layer folder whose name is not
 * canonical for that layer. The canonical elements directly under a
 * layer are the four type subfolders (`general`, `logic`, `transfers`,
 * `utils`) and the layer's injection component file (`R`/`B`/`A`).
 */
export class StructureTypeMismatchBusiness extends RuleBusiness {
  readonly id = 'structure-type-mismatch'
  readonly group = 1
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'An element directly under a layer folder is not a canonical type subfolder or the layer injection.'
  readonly scope: RuleScope = 'structural'
  readonly specRef = '§7.4'

  private static readonly LAYERS = new Set(['repository', 'business', 'api'])
  private static readonly SUBFOLDERS = new Set(['general', 'logic', 'transfers', 'utils'])
  private static readonly INJECTION: Record<string, string> = { repository: 'R', business: 'B', api: 'A' }

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    const seen = new Set<string>()
    for (const c of artefact.components) {
      const segs = c.relativePath.split('/').filter(s => s.length > 0)
      const layer = segs[0]
      if (layer === undefined || !StructureTypeMismatchBusiness.LAYERS.has(layer)) continue
      if (segs.length < 2) continue
      const second = segs[1]!
      // File directly at the layer root (e.g. repository/R.ts).
      if (segs.length === 2) {
        const expected = StructureTypeMismatchBusiness.INJECTION[layer]
        const baseName = second.replace(/\.[^.]+$/, '')
        if (baseName === expected) continue
        const key = `${layer}/${second}`
        if (seen.has(key)) continue
        seen.add(key)
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Element '${key}' directly under /${layer} is not canonical. Allowed: /general, /logic, /transfers, /utils, or the injection ${expected}.`,
          location: { path: `src/${key}` },
        })
        continue
      }
      // Deeper: the second segment is a subfolder, must be canonical.
      if (StructureTypeMismatchBusiness.SUBFOLDERS.has(second)) continue
      const key = `${layer}/${second}`
      if (seen.has(key)) continue
      seen.add(key)
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Subfolder '${key}' under /${layer} is not a canonical type folder. Allowed: /general, /logic, /transfers, /utils.`,
        location: { path: `src/${key}` },
      })
    }
    return violations
  }
}
