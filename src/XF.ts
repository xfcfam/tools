import { R } from './repository/R.js'
import { B } from './business/B.js'
import { A } from './api/A.js'

/**
 * Architecture-level orchestrator. Not part of any layer.
 *
 * Boot order: R → B → A. Teardown order: A → B → R.
 */
export class XF {
  private constructor() {}

  static async init(): Promise<void> {
    await R.init()
    await B.init()
    await A.init()
  }

  static async terminate(): Promise<void> {
    await A.terminate()
    await B.terminate()
    await R.terminate()
  }
}
