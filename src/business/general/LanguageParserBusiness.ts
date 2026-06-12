import { StatelessBusiness } from '@xfcfam/xf'
import type { LanguageId } from '../transfers/Language.js'
import type { SourceFile } from '../../repository/transfers/SourceFile.js'

/**
 * Business Layer Generalization — abstract base for every per-language
 * source parser.
 *
 * Parsers live in the Business layer because they perform domain
 * transformation (raw source → normalised `SourceFile` projection);
 * the Access layer is reserved for I/O and external-resource
 * encapsulation. Concrete parsers may import their language's own
 * library (the TypeScript Compiler API, Python's `ast`, JavaParser, …)
 * because those are pure transformers, not I/O channels.
 *
 * The projection deliberately stays close to TypeScript's surface
 * (`classes`, `imports`, `extendsName`, modifier flags) because that
 * captures the structural invariants the XF model verifies. Language-
 * specific concepts that don't map cleanly (e.g. Python's
 * `__init_subclass__`, C++ templates) are normalised by each concrete
 * parser before being emitted.
 *
 * Stub parsers (everything except TypeScript in Fase 1) return an
 * empty {@link SourceFile}; the validator surfaces a clear "language
 * not yet supported" warning at validate-time.
 */
export abstract class LanguageParserBusiness extends StatelessBusiness {
  /** Canonical id of the language this parser handles. */
  abstract readonly language: LanguageId

  /**
   * Parse `text` (the content of `path`) into a {@link SourceFile}.
   * Concrete parsers must never throw on malformed source — they emit
   * a SourceFile with empty `classes` / `imports` arrays instead.
   */
  abstract parse(path: string, text: string): SourceFile
}
