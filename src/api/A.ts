import { CliService } from './logic/service/CliService.js'
import { ConsoleReporterService } from './logic/service/ConsoleReporterService.js'

/**
 * Interaction Layer Injection — canonical XF singleton.
 *
 * Exposes the CLI service and the console reporter.
 */
export class A {
  private constructor() {}

  static readonly cliService = new CliService()
  static readonly consoleReporter = new ConsoleReporterService()

  static async init(): Promise<void> {
    await A.cliService.init()
    await A.consoleReporter.init()
  }

  static async terminate(): Promise<void> {
    await A.consoleReporter.terminate()
    await A.cliService.terminate()
  }
}
