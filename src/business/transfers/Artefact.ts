import type { Component } from './Component.js'
import type { LanguageId } from './Language.js'

/**
 * Transfer object: the result of walking and classifying an XF
 * artefact's `/src` tree.
 */
export interface Artefact {
  /** Absolute path of the artefact root (the directory that contains `/src`). */
  rootPath: string
  /** Absolute path of the `/src` directory. */
  srcPath: string
  /**
   * Programming language detected for the artefact (TypeScript,
   * Python, Java, …). Drives parser selection and which language-aware
   * rules apply.
   */
  language: LanguageId
  /** Every file under `/src` after classification. */
  components: Component[]
}
