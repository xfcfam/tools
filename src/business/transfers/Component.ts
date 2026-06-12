import type { LanguageId } from './Language.js'

/** XF layer of a component (Section 2.1 of the spec). */
export type Layer = 'repository' | 'business' | 'api' | 'architecture'

/** XF type of a component (Section 2.2 of the spec). */
export type ComponentType =
  | 'logical'
  | 'generalization'
  | 'injection'
  | 'utility'
  | 'transfer'
  | 'exception'
  | 'architecture'   // XF.ts itself
  | 'unknown'

/**
 * Transfer object representing a single file classified within the XF
 * matrix. Built by `ClassificationBusiness` from a path; consumed by
 * every rule. The `content` field is loaded lazily on demand.
 */
export interface Component {
  /** Absolute filesystem path. */
  path: string
  /** Path relative to the artefact root. */
  relativePath: string
  /** Layer (or `'architecture'` for XF). */
  layer: Layer
  /** Type within the layer. */
  type: ComponentType
  /**
   * Logical name derived from the filename (without extension).
   * E.g. `UserBusiness`, `Repository`, `R`, `XF`.
   */
  name: string
  /**
   * Programming language of the file. Inherited from the artefact's
   * detected language; rules consult it to apply or skip per-language
   * checks (`injection-mutable-references` etc.).
   */
  language: LanguageId
}
