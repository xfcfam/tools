import { StatelessView } from '@xfcfam/xf'
import { resolve } from 'node:path'
import { R } from '../../../repository/R.js'
import { B } from '../../../business/B.js'
import { A } from '../../A.js'
import { SpecUtils } from '../../utils/SpecUtils.js'

/**
 * Interaction Layer Logical — CLI entry point.
 *
 * Parses argv, dispatches to the right subcommand, and writes output
 * via `R.console`. Stateless.
 *
 * Subcommands implemented in v0:
 *   - `xftools validate <path> [--json]`  — validate an XF artefact.
 *
 * Exit codes:
 *   - `0` if structurally conformant or better (Λ ≥ 3): no structural
 *     violations. Λ=4 cannot be certified statically, so Λ=3 (static
 *     ceiling) is treated as success.
 *   - `1` if Λ < 3 (a structural violation, or the totality condition
 *     is unsatisfied).
 *   - `2` on usage / runtime errors.
 */
export class CliService extends StatelessView {
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  async run(argv: readonly string[]): Promise<number> {
    const [command, ...rest] = argv
    if (command === '-v' || command === '--version') {
      await this.printVersion()
      return 0
    }
    if (command === undefined || command === '-h' || command === '--help') {
      this.printUsage()
      return command === undefined ? 2 : 0
    }
    switch (command) {
      case 'validate':
        return this.runValidate(rest)
      default:
        R.console.error(`Unknown command: ${command}`)
        this.printUsage()
        return 2
    }
  }

  private printUsage(): void {
    R.console.println('xftools — XF Architecture Model (CFAM) toolkit')
    R.console.println('')
    R.console.println('Usage:')
    R.console.println('  xftools <command> [options]')
    R.console.println('  xftools [-v | -h]')
    R.console.println('')
    R.console.println('Commands:')
    R.console.println('  validate <path> [--json]   Validate that the XF artefact at <path>')
    R.console.println('                             conforms to the model. Looks for <path>/src')
    R.console.println('                             and reports a conformance level Λ ∈ {0..4}.')
    R.console.println('                             Use --json for a structured report.')
    R.console.println('')
    R.console.println('Options:')
    R.console.println('  -v, --version   Print the xftools version and the rule-catalog edition.')
    R.console.println('  -h, --help      Show this help.')
    R.console.println('')
    R.console.println('More tools will appear here as the toolkit grows.')
  }

  private async printVersion(): Promise<void> {
    const version = await R.fileSystem.toolVersion()
    R.console.println(`xftools ${version}`)
    R.console.println(`Rule catalog: ${SpecUtils.edition} (${SpecUtils.ruleCount} rules / ${SpecUtils.groupCount} groups)`)
    R.console.println(`Specification: ${SpecUtils.documentUrl}`)
  }

  private async runValidate(args: readonly string[]): Promise<number> {
    const positional: string[] = []
    let jsonOutput = false
    for (const arg of args) {
      if (arg === '--json') jsonOutput = true
      else if (arg === '-h' || arg === '--help') { this.printUsage(); return 0 }
      else positional.push(arg)
    }
    const rawPath = positional[0]
    if (rawPath === undefined) {
      R.console.error('Usage: xftools validate <path> [--json]')
      return 2
    }
    const rootPath = resolve(rawPath)
    try {
      const report = await B.artefact.validate(rootPath)
      if (jsonOutput) {
        A.consoleReporter.renderJson(report)
      } else {
        A.consoleReporter.render(report)
      }
      return report.level >= 3 ? 0 : 1
    } catch (err) {
      R.console.error(`Error: ${(err as Error).message}`)
      return 2
    }
  }
}
