import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'
import { ImportResolutionUtils } from '../../../utils/ImportResolutionUtils.js'

/**
 * `transfer-dependency` (G7, structural) — § 7.3.5.
 *
 * A transfer component references an injection, logical, generalization
 * or utility component. Transfers are self-contained data — they may
 * reference only other transfers/exceptions.
 *
 * Detection: each in-artefact runtime import of a transfer resolves to
 * a component; if that component's type is injection / logical /
 * generalization / utility, the dependency is forbidden. Imports of the
 * injection symbols `R`/`B`/`A` from `@xfcfam/*` are also flagged.
 */
export class TransferDependencyBusiness extends RuleBusiness {
  readonly id = 'transfer-dependency'
  readonly group = 7
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A transfer component references an injection, logical, generalization or utility component.'
  readonly scope: RuleScope = 'artefact'
  readonly specRef = '§7.3.5'

  private static readonly FORBIDDEN_TYPES = new Set(['injection', 'logical', 'generalization', 'utility'])

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    for (const c of artefact.components) {
      if (c.type !== 'transfer' && c.type !== 'exception') continue
      const sf = RuleUtils.sourceOf(c)
      if (sf === undefined) continue
      for (const imp of sf.imports) {
        // Named injection import from an @xfcfam package.
        if (imp.specifier.startsWith('@xfcfam/')) {
          for (const name of imp.names) {
            if (ImportResolutionUtils.injectionLayer(name) !== null) {
              violations.push({
                ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
                message: `Transfer ${c.name} imports injection ${name}. Transfers are self-contained and may not reference injections.`,
                location: { path: c.relativePath, line: imp.line },
              })
            }
          }
          continue
        }
        const target = ImportResolutionUtils.resolveComponent(c, imp, artefact)
        if (target === null) continue
        if (!TransferDependencyBusiness.FORBIDDEN_TYPES.has(target.type)) continue
        violations.push({
          ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
          message: `Transfer ${c.name} references ${target.name} (a ${target.type} component). Transfers may reference only other transfers.`,
          location: { path: c.relativePath, line: imp.line },
        })
      }
    }
    return violations
  }
}
