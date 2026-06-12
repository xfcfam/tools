/**
 * Transfer object: the projection of a parsed `.ts` file used by the
 * component / artefact rules. Only the surface the rules need.
 */
export interface SourceFile {
  /** Absolute path of the file. */
  path: string
  /** Raw text content. */
  text: string
  /** Top-level class declarations in the file. */
  classes: ParsedClass[]
  /** Every `import` declaration. */
  imports: ParsedImport[]
  /** Every `throw new …()` site in the file. */
  throws: ParsedThrow[]
  /** Whether the file has at least one export (class, type, const, default, etc.). */
  hasExports: boolean
}

export interface ParsedImport {
  /** Module specifier string (`'./Foo'`, `'@xfcfam/xf'`, `'kysely'`, …). */
  specifier: string
  /** Names imported from the module (or namespace name for namespace imports). */
  names: string[]
  /** Whether the entire import is type-only (`import type { Foo }`). */
  isTypeOnly: boolean
  /** 1-based line number where the import sits. */
  line: number
}

export interface ParsedThrow {
  /**
   * Constructor name when the throw is `throw new Foo(...)`; null
   * when it's a re-throw (`throw err`) or any other expression.
   */
  typeName: string | null
  /** 1-based line of the `throw` keyword. */
  line: number
}

export interface ParsedClass {
  /** Declared class name. */
  name: string
  /** Whether declared `abstract class`. */
  isAbstract: boolean
  /** Whether the class declares a `private constructor()`. */
  hasPrivateConstructor: boolean
  /** Whether the class declares a non-private constructor (public / protected / unmarked). */
  hasPublicConstructor: boolean
  /** Name of the superclass (single inheritance), or null. */
  extendsName: string | null
  /** Non-private instance property names. */
  instanceFields: string[]
  /** Static property names. */
  staticFields: string[]
  /** Non-private instance method names (including get/set accessors). */
  instanceMethods: string[]
  /** Static method names. */
  staticMethods: string[]
  /** 1-based line number where the class is declared. */
  line: number
}
