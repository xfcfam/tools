/**
 * Access Layer Transfer — normalized shape of the Concrete Syntax Tree
 * (CST) produced by the external `java-parser` package (a Chevrotain
 * port). It models the external Java data that crosses the artefact's
 * boundary; `JavaParserBusiness` consumes it and maps it onto the
 * tool's own IR. CST node names follow the JLS rule names; token leaves
 * carry an `image` (literal text) and 1-based positions.
 */

/** A Chevrotain CST token (leaf node). */
export interface CstToken {
  /** Literal text the lexer captured. */
  image: string
  /** 1-based line number where the token starts. */
  startLine?: number
  /** 1-based column number. */
  startColumn?: number
  /** Chevrotain attaches the matched token type here. */
  tokenType?: { name: string }
}

/** A Chevrotain CST node (internal rule). */
export interface CstNode {
  /** The grammar rule name (e.g. `'classDeclaration'`). */
  name: string
  /** Children indexed by sub-rule or token name (arrays — rules may repeat). */
  children: Record<string, Array<CstNode | CstToken> | undefined>
  /** Source-range location, present on every node in current builds. */
  location?: { startLine: number; startColumn?: number; endLine?: number }
}
