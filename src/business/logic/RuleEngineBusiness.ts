import { StatelessBusiness } from '@xfcfam/xf'
import type { RuleBusiness } from '../general/RuleBusiness.js'
import type { Artefact } from '../transfers/Artefact.js'
import type { Violation } from '../transfers/Violation.js'

/**
 * Business Layer Logical that runs every registered rule against an
 * artefact and aggregates the violations.
 *
 * Rules are passed in once at construction (from `B`); the engine
 * is stateless beyond holding that registry.
 */
export class RuleEngineBusiness extends StatelessBusiness {
  private readonly rules: readonly RuleBusiness[]

  constructor(rules: readonly RuleBusiness[]) {
    super()
    this.rules = rules
  }

  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  /**
   * Run every rule against `artefact`, return the union of violations.
   * Language-aware rules (those that override `appliesTo`) are skipped
   * when the artefact's language is outside their applicability set.
   */
  run(artefact: Artefact): Violation[] {
    const out: Violation[] = []
    for (const rule of this.rules) {
      if (rule.appliesTo !== undefined && !rule.appliesTo.includes(artefact.language)) continue
      try {
        out.push(...rule.check(artefact))
      } catch (err) {
        out.push({
          ruleId: rule.id, scope: rule.scope, verifiability: rule.verifiability,
          message: `Rule ${rule.id} threw while checking the artefact: ${(err as Error).message}`,
          location: {},
        })
      }
    }
    return RuleEngineBusiness.sort(out)
  }

  /** Read-only view of the registered rules. */
  registeredRules(): readonly RuleBusiness[] {
    return this.rules
  }

  private static sort(violations: Violation[]): Violation[] {
    return [...violations].sort((a, b) => {
      const byRule = a.ruleId.localeCompare(b.ruleId)
      if (byRule !== 0) return byRule
      const pa = a.location.path ?? ''
      const pb = b.location.path ?? ''
      return pa.localeCompare(pb)
    })
  }
}
