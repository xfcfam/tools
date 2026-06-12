import { FileSystemRepository } from './logic/FileSystemRepository.js'
import { ConsoleRepository } from './logic/ConsoleRepository.js'

/**
 * Access Layer Injection — canonical XF singleton.
 *
 * Holds every Access Logical of the tool. By design the Access layer
 * is reserved for I/O and external-resource encapsulation: filesystem
 * walks and stdout/stderr output. Anything that performs domain
 * transformation on data (source parsing, language detection scoring,
 * conformance reporting…) lives in the Business layer.
 */
export class R {
  private constructor() {}

  static readonly fileSystem = new FileSystemRepository()
  static readonly console    = new ConsoleRepository()

  static async init(): Promise<void> {
    await R.fileSystem.init()
    await R.console.init()
  }

  static async terminate(): Promise<void> {
    await R.console.terminate()
    await R.fileSystem.terminate()
  }
}
