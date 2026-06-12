import { RuleBusiness } from '../../../general/RuleBusiness.js'
import type { Artefact } from '../../../transfers/Artefact.js'
import type { Violation, RuleScope, Verifiability } from '../../../transfers/Violation.js'
import type { Component } from '../../../transfers/Component.js'
import { RuleUtils } from '../../../utils/RuleUtils.js'

/**
 * `transfer-inheritance` (G7, structural) — § 7.3.5.
 *
 * A transfer component inherits from a component that is not a transfer
 * component. Exception transfers extend the language error type
 * (`Error` / `Exception`), which is the propagation channel, not an XF
 * component — that case is out of scope. Only an in-artefact parent
 * that is not a transfer (or exception) is flagged.
 */
export class TransferInheritanceBusiness extends RuleBusiness {
  readonly id = 'transfer-inheritance'
  readonly group = 7
  readonly verifiability: Verifiability = 'structural'
  readonly description = 'A transfer component inherits from a component that is not a transfer component.'
  readonly scope: RuleScope = 'component'
  readonly specRef = '§7.3.5'
  override readonly appliesTo = ['typescript', 'javascript', 'java', 'kotlin', 'csharp', 'cpp'] as const

  private static readonly CHANNEL_BASES = new Set(['Error', 'Exception', 'RuntimeException', 'Throwable'])

  override check(artefact: Artefact): Violation[] {
    const violations: Violation[] = []
    const byName = new Map<string, Component>()
    for (const c of artefact.components) byName.set(c.name, c)

    for (const c of artefact.components) {
      if (c.type !== 'transfer' && c.type !== 'exception') continue
      const klass = RuleUtils.primaryClass(c)
      if (klass === undefined || klass.extendsName === null) continue
      const parent = klass.extendsName
      if (TransferInheritanceBusiness.CHANNEL_BASES.has(parent)) continue // error propagation channel
      const local = byName.get(parent)
      if (local === undefined) continue // external base class → out of scope
      if (local.type === 'transfer' || local.type === 'exception') continue
      violations.push({
        ruleId: this.id, scope: this.scope, verifiability: this.verifiability,
        message: `Transfer ${c.name} inherits from ${parent} (a ${local.type} component). A transfer may only inherit from a transfer.`,
        location: { path: c.relativePath, line: klass.line },
      })
    }
    return violations
  }
}
