#!/usr/bin/env node
import { XF } from './src/XF.js'
import { A } from './src/api/A.js'

/**
 * Bootstrap of the xftools artefact.
 *
 * Initialises R → B → A, dispatches the CLI command, then tears down
 * A → B → R. Exit code propagated from the CLI service.
 */
async function main(): Promise<void> {
  await XF.init()
  const code = await A.cliService.run(process.argv.slice(2))
  await XF.terminate()
  process.exit(code)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(2)
})
