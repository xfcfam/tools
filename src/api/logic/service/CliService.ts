import { StatelessView } from '@xfcfam/xf'
import { resolve } from 'node:path'
import { R } from '../../../repository/R.js'
import { B } from '../../../business/B.js'
import { A } from '../../A.js'

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
    R.console.println('xftools — XF Architecture Model toolkit')
    R.console.println('')
    R.console.println('Usage:')
    R.console.println('  xftools validate <path> [--json]')
    R.console.println('')
    R.console.println('Validates that the artefact at <path> follows the XF specification.')
    R.console.println('Looks for <path>/src; errors if not found.')
    R.console.println('')
    R.console.println('Flags:')
    R.console.println('  --json    Emit the report as JSON to stdout.')
    R.console.println('  -h, --help    Show this help.')
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
