import type { Component, ComponentType, Layer } from '../transfers/Component.js'
import type { LanguageId } from '../transfers/Language.js'
import { PathUtils } from './PathUtils.js'

/**
 * Static utility component for classifying a single file path into the
 * XF L×T matrix.
 *
 * Pure (no I/O): the classification looks only at the relative path
 * and the filename. The rule "this file in `business/logic/` MUST
 * actually be a `*Business`" is verified by a separate structural
 * rule, not here.
 */
export class ClassificationUtils {
  private constructor() {}

  /**
   * Classify a single file under `/src`. Returns the {@link Component}
   * describing its layer + type + name.
   *
   * Files outside the canonical structure get layer `'unknown'` (via
   * `'architecture'` only for the XF.* file at /src root) and type
   * `'unknown'`.
   *
   * @param relativePath  Path relative to the artefact's `/src`
   *                      directory, normalised with `/` separators.
   */
  static classify(absolutePath: string, relativePath: string, language: LanguageId): Component {
    const segments = relativePath.split('/').filter(s => s.length > 0)
    const filename = segments[segments.length - 1] ?? ''
    const name = PathUtils.stripExtension(filename)

    // Architecture-level XF.* file at the root of /src (the XF
    // start-point element — excluded from the totality predicate by
    // §11.4 stage 2 since it is not a component).
    if (segments.length === 1 && name === 'XF') {
      return { path: absolutePath, relativePath, layer: 'architecture', type: 'architecture', name, language }
    }

    const top = segments[0]
    const layer: Layer | null =
      top === 'repository' ? 'repository' :
      top === 'business'   ? 'business'   :
      top === 'api'        ? 'api'        :
      null

    if (layer === null) {
      return { path: absolutePath, relativePath, layer: 'architecture', type: 'unknown', name, language }
    }

    // Injection file at layer root: e.g. repository/R.ts
    if (segments.length === 2) {
      const expected = PathUtils.INJECTION_NAMES[layer]
      if (expected !== null && name === expected) {
        return { path: absolutePath, relativePath, layer, type: 'injection', name, language }
      }
      // Any other file at the layer root is unclassifiable
      return { path: absolutePath, relativePath, layer, type: 'unknown', name, language }
    }

    const subdivision = segments[1]
    const isException = name.endsWith('Exception')

    const type: ComponentType =
      subdivision === 'general'    ? 'generalization' :
      subdivision === 'logic'   ? 'logical' :
      subdivision === 'utils'   ? 'utility' :
      subdivision === 'transfers' ? (isException ? 'exception' : 'transfer') :
      'unknown'

    return { path: absolutePath, relativePath, layer, type, name, language }
  }
}
