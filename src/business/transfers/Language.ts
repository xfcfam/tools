/**
 * Transfer describing a programming language supported by xftools.
 *
 * The validator is artefact-language-agnostic at the macro level (every
 * artefact follows the same `/src/<layer>/<type>/Name.ext` structure),
 * but a handful of semantic rules apply only to languages where the
 * underlying construct exists (e.g. `injection-mutable-references`
 * targets TS `readonly` / Java `final` / Kotlin `val` / Swift `let` /
 * C# `readonly` / C++ `const`, but is meaningless in Python or JS).
 *
 * `LanguageId` is the canonical identifier; `LanguageDescriptor`
 * carries the metadata the validator needs to detect and parse a
 * given artefact.
 */
export type LanguageId =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'kotlin'
  | 'swift'
  | 'csharp'
  | 'cpp'
  | 'unknown'

export interface LanguageDescriptor {
  /** Canonical id used across the validator. */
  id: LanguageId
  /** Human-readable label for reporting. */
  label: string
  /**
   * File extensions (without leading dot) considered source files for
   * this language. The walker uses these to enumerate `/src`.
   */
  extensions: readonly string[]
  /**
   * Filenames (relative to the artefact root) whose presence indicates
   * the artefact is written in this language. Detection prefers
   * higher-precision signals (e.g. `tsconfig.json` for TS).
   */
  manifestFiles: readonly string[]
  /**
   * Detection priority — higher wins when multiple manifests match.
   * E.g. `tsconfig.json` (priority 10) beats `package.json` (priority 5)
   * so a TS project with both lands on `typescript`, not `javascript`.
   */
  detectionPriority: number
}
