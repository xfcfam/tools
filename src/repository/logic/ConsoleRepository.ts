import { StatelessRepository } from '@xfcfam/xf'

/**
 * Access Layer Logical for writing to stdout / stderr.
 *
 * Encapsulates `process.stdout` / `process.stderr` so no Business or
 * Interaction component imports them directly. Makes the CLI testable
 * by stubbing this Repository.
 */
export class ConsoleRepository extends StatelessRepository {
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  /** Write to stdout, no trailing newline. */
  print(text: string): void {
    process.stdout.write(text)
  }

  /** Write to stdout with a trailing newline. */
  println(text: string = ''): void {
    process.stdout.write(text + '\n')
  }

  /** Write to stderr with a trailing newline. */
  error(text: string): void {
    process.stderr.write(text + '\n')
  }

  /** Write to stderr with a trailing newline (semantic alias for warnings). */
  warn(text: string): void {
    process.stderr.write(text + '\n')
  }
}
