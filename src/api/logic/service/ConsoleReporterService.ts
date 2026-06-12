import { StatelessView } from '@xfcfam/xf'
import { R } from '../../../repository/R.js'
import { SpecUtils } from '../../utils/SpecUtils.js'
import type { ConformanceReport } from '../../../business/transfers/ConformanceReport.js'
import type { Violation, RuleScope } from '../../../business/transfers/Violation.js'

const HR = '─'.repeat(72)

/**
 * Interaction Layer Logical: formats a {@link ConformanceReport} for
 * the terminal. Groups violations by scope, includes the conformance
 * level header, counts of components, and a one-line summary.
 */
export class ConsoleReporterService extends StatelessView {
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  render(report: ConformanceReport): void {
    R.console.println(HR)
    R.console.println(`XF Validation — ${report.artefactPath}`)
    R.console.println(`Catalog: ${SpecUtils.edition} — ${SpecUtils.ruleCount} rules / ${SpecUtils.groupCount} groups`)
    R.console.println(HR)
    const ceiling = report.staticCeiling ? ' [static ceiling]' : ''
    R.console.println(`Conformance level:   Λ=${report.level}${ceiling}    (${ConsoleReporterService.describeLevel(report.level)})`)
    R.console.println(`Components scanned:  ${report.components.length}`)
    R.console.println(`Structural violations: ${report.violations.filter(v => v.verifiability === 'structural').length}`)
    R.console.println(`Semantic violations:   ${report.violations.filter(v => v.verifiability === 'semantic').length}`)
    R.console.println()

    if (report.violations.length === 0) {
      if (report.staticCeiling) {
        R.console.println('✓ No structural violations. Artefact is structurally conformant (Λ=3).')
        R.console.println(`  Reaching Λ=4 (perfectly conformant) requires human review of the`)
        R.console.println(`  ${report.pendingSemanticRules} semantic rules — a static tool cannot certify them.`)
      } else {
        R.console.println('✓ No violations. Artefact is XF-conformant.')
      }
      R.console.println(HR)
      return
    }

    const scopes: RuleScope[] = ['structural', 'component', 'artefact']
    for (const scope of scopes) {
      const subset = report.violations.filter(v => v.scope === scope)
      if (subset.length === 0) continue
      R.console.println(`── ${scope.toUpperCase()} (${subset.length}) ${HR.substring(scope.length + 6)}`)
      for (const v of subset) ConsoleReporterService.renderViolation(v)
      R.console.println()
    }
    if (report.staticCeiling) {
      R.console.println(`Note: Λ capped at 3 — ${report.pendingSemanticRules} semantic rules need human review for Λ=4.`)
    }
    R.console.println(HR)
  }

  renderJson(report: ConformanceReport): void {
    // Strip the parsed source files from each component (too verbose for output).
    const components = report.components.map(({ ...rest }) => {
      const copy = { ...rest } as { sourceFile?: unknown }
      delete copy.sourceFile
      return copy
    })
    R.console.println(JSON.stringify({ ...report, components }, null, 2))
  }

  private static renderViolation(v: Violation): void {
    const loc = v.location.path !== undefined
      ? (v.location.line !== undefined ? `${v.location.path}:${v.location.line}` : v.location.path)
      : '(artefact-wide)'
    R.console.println(`  [${v.ruleId}] ${loc}`)
    R.console.println(`         ${v.message}`)
  }

  private static describeLevel(level: number): string {
    switch (level) {
      case 0: return 'non-conformant — no classified component'
      case 1: return 'partially conformant — totality condition unsatisfied'
      case 2: return 'imperfectly conformant — structural violations present'
      case 3: return 'structurally conformant — zero structural violations'
      case 4: return 'perfectly conformant — zero violations'
      default: return 'unknown'
    }
  }
}
