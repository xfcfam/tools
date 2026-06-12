import { createRequire } from 'node:module'
import type { CstNode, CstToken } from '../../../repository/transfers/JavaCst.js'
import { LanguageParserBusiness } from '../../general/LanguageParserBusiness.js'
import type { LanguageId } from '../../transfers/Language.js'
import type { SourceFile, ParsedClass, ParsedImport, ParsedThrow } from '../../../repository/transfers/SourceFile.js'

/**
 * Business Layer Logical that parses Java source into the
 * normalised {@link SourceFile} projection consumed by XF rules.
 *
 * Backed by the `java-parser` npm package — a JavaScript port of the
 * JLS grammar built on Chevrotain. The parser produces a Concrete
 * Syntax Tree; this class navigates the CST defensively (every access
 * tolerates missing rules so that grammar variations across
 * java-parser versions degrade gracefully into empty arrays instead
 * of throwing).
 *
 * Mapping highlights:
 *
 *  · `imports[]` — every `import` (static and wildcard variants
 *    included). `isTypeOnly` is always `false` in Java; the field is
 *    preserved for cross-language uniformity.
 *  · `classes[]` — every top-level class declaration (interfaces,
 *    enums and records are skipped to mirror the TypeScript parser's
 *    projection, which only emits class declarations).
 *  · `throws[]` — every `throw new X(...)` statement in the file.
 *    Java's `throws E1, E2` clauses on method signatures are NOT
 *    collected here (they advertise possible exceptions, they do not
 *    raise them); rules that inspect throw points are concerned with
 *    raising sites only.
 *  · `hasExports` — Java has no module-level export keyword. We use
 *    "the file declares at least one non-private top-level class"
 *    as the closest semantic equivalent.
 *
 * Errors during parsing produce a {@link SourceFile} with empty
 * arrays; the parser must never throw — rules tolerate empty inputs
 * gracefully.
 */
export class JavaParserBusiness extends LanguageParserBusiness {
  override readonly language: LanguageId = 'java'
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  /**
   * Lazily-loaded `java-parser` `parse` function. The dependency is
   * optional: it is loaded on first use via `createRequire` rather than
   * a top-level import, so an artefact written in another language (e.g.
   * the TypeScript dogfood) does not require `java-parser` to be present
   * to load this module. `null` means "not loaded yet"; `false` means
   * "load attempted and failed" (the dep is absent) — in that case Java
   * files degrade to empty SourceFiles, the parser's documented
   * never-throw contract.
   */
  private static parseFn: ((text: string) => CstNode) | false | null = null

  private static loadParse(): ((text: string) => CstNode) | null {
    if (JavaParserBusiness.parseFn === null) {
      try {
        const require = createRequire(import.meta.url)
        const mod = require('java-parser') as { parse: (text: string) => CstNode }
        JavaParserBusiness.parseFn = mod.parse
      } catch {
        JavaParserBusiness.parseFn = false
      }
    }
    return JavaParserBusiness.parseFn === false ? null : JavaParserBusiness.parseFn
  }

  override parse(path: string, text: string): SourceFile {
    const parse = JavaParserBusiness.loadParse()
    if (parse === null) {
      return { path, text, classes: [], imports: [], throws: [], hasExports: false }
    }
    let cst: CstNode
    try {
      cst = parse(text)
    } catch {
      return { path, text, classes: [], imports: [], throws: [], hasExports: false }
    }
    try {
      const root = JavaParserBusiness.firstChildNode(cst, ['ordinaryCompilationUnit', 'compilationUnit']) ?? cst
      const imports = JavaParserBusiness.collectImports(root)
      const { classes, hasExports } = JavaParserBusiness.collectClasses(root)
      const throws = JavaParserBusiness.collectThrowStatements(cst)
      return { path, text, classes, imports, throws, hasExports }
    } catch {
      return { path, text, classes: [], imports: [], throws: [], hasExports: false }
    }
  }

  // ───────────────────────────────────────────────────────────────
  //  Imports
  // ───────────────────────────────────────────────────────────────

  private static collectImports(root: CstNode): ParsedImport[] {
    const out: ParsedImport[] = []
    const importNodes = JavaParserBusiness.childNodes(root, 'importDeclaration')
    for (const imp of importNodes) {
      const isStatic = JavaParserBusiness.hasTokenDeep(imp, 'Static')
      const hasStar = JavaParserBusiness.hasTokenDeep(imp, 'Star')
      // packageOrTypeName carries a dot-separated list of Identifier tokens.
      const nameNode = JavaParserBusiness.firstChildNode(imp, ['packageOrTypeName', 'typeName'])
      const segments = nameNode === null ? [] : JavaParserBusiness.identifierImagesDeep(nameNode)
      if (segments.length === 0) continue
      const baseSpecifier = segments.join('.')
      const specifier = hasStar ? `${baseSpecifier}.*` : baseSpecifier
      const lastSegment = segments[segments.length - 1] ?? ''
      // The "imported name" in TS-projection terms is the last segment
      // (the simple type name), or '*' for wildcard imports. For
      // `import static`, the name is the static member identifier
      // (last segment) — same shape, different semantics.
      const names = hasStar ? ['*'] : (lastSegment.length > 0 ? [lastSegment] : [])
      // Preserve the leading "static" marker via the specifier when
      // it matters to downstream rules; otherwise consumers ignore it.
      const finalSpecifier = isStatic ? `static ${specifier}` : specifier
      const line = JavaParserBusiness.lineOf(imp)
      out.push({ specifier: finalSpecifier, names, isTypeOnly: false, line })
    }
    return out
  }

  // ───────────────────────────────────────────────────────────────
  //  Classes (top-level only)
  // ───────────────────────────────────────────────────────────────

  private static collectClasses(root: CstNode): { classes: ParsedClass[]; hasExports: boolean } {
    const classes: ParsedClass[] = []
    let hasExports = false
    const typeDecls = JavaParserBusiness.childNodes(root, 'typeDeclaration')
    for (const td of typeDecls) {
      // typeDeclaration → classDeclaration → normalClassDeclaration
      // (we skip enumDeclaration / recordDeclaration / interfaceDeclaration
      // to mirror the TypeScript parser's class-only projection).
      const classDecl = JavaParserBusiness.firstChildNode(td, ['classDeclaration'])
      if (classDecl === null) continue
      const normal = JavaParserBusiness.firstChildNode(classDecl, [
        'normalClassDeclaration',
      ])
      if (normal === null) continue
      const parsed = JavaParserBusiness.parseClass(normal, classDecl, td)
      if (parsed === null) continue
      classes.push(parsed)
      // Closest semantic to TS `export`: any non-private top-level class.
      if (!JavaParserBusiness.hasClassModifier(td, classDecl, normal, 'Private')) {
        hasExports = true
      }
    }
    return { classes, hasExports }
  }

  private static parseClass(normal: CstNode, classDecl: CstNode, td: CstNode): ParsedClass | null {
    // Name — `typeIdentifier` for classes, falling back to a direct
    // Identifier token if present.
    const nameNode = JavaParserBusiness.firstChildNode(normal, ['typeIdentifier'])
    let name = '<anonymous>'
    if (nameNode !== null) {
      const ids = JavaParserBusiness.identifierImagesDeep(nameNode)
      if (ids.length > 0) name = ids[0] ?? '<anonymous>'
    } else {
      const direct = JavaParserBusiness.firstTokenImage(normal, 'Identifier')
      if (direct !== null) name = direct
    }

    const isAbstract = JavaParserBusiness.hasClassModifier(td, classDecl, normal, 'Abstract')

    // extends — superclass | classExtends
    const ext = JavaParserBusiness.firstChildNode(normal, ['superclass', 'classExtends'])
    let extendsName: string | null = null
    if (ext !== null) {
      const ids = JavaParserBusiness.identifierImagesDeep(ext)
      if (ids.length > 0) extendsName = ids[ids.length - 1] ?? null
    }

    // body — classBody
    const body = JavaParserBusiness.firstChildNode(normal, ['classBody'])
    let hasPrivateConstructor = false
    let hasPublicConstructor = false
    const instanceFields: string[] = []
    const staticFields: string[] = []
    const instanceMethods: string[] = []
    const staticMethods: string[] = []
    if (body !== null) {
      const decls = JavaParserBusiness.childNodes(body, 'classBodyDeclaration')
      for (const d of decls) {
        // Constructor?
        const ctor = JavaParserBusiness.deepFirst(d, 'constructorDeclaration')
        if (ctor !== null) {
          const isPrivate = JavaParserBusiness.hasModifierUnder(ctor, 'Private', 'constructorModifier')
          if (isPrivate) hasPrivateConstructor = true
          else hasPublicConstructor = true
          continue
        }
        // Member declaration (field or method or nested type)?
        const member = JavaParserBusiness.firstChildNode(d, ['classMemberDeclaration'])
        if (member === null) continue
        const field = JavaParserBusiness.firstChildNode(member, ['fieldDeclaration'])
        if (field !== null) {
          const isStatic = JavaParserBusiness.hasModifierUnder(field, 'Static', 'fieldModifier')
          const isPrivate = JavaParserBusiness.hasModifierUnder(field, 'Private', 'fieldModifier')
          if (isPrivate) continue
          const names = JavaParserBusiness.fieldNames(field)
          if (isStatic) staticFields.push(...names)
          else instanceFields.push(...names)
          continue
        }
        const method = JavaParserBusiness.firstChildNode(member, ['methodDeclaration'])
        if (method !== null) {
          const isStatic = JavaParserBusiness.hasModifierUnder(method, 'Static', 'methodModifier')
          const isPrivate = JavaParserBusiness.hasModifierUnder(method, 'Private', 'methodModifier')
          if (isPrivate) continue
          const mname = JavaParserBusiness.methodName(method)
          if (mname === null) continue
          if (isStatic) staticMethods.push(mname)
          else instanceMethods.push(mname)
        }
      }
    }

    return {
      name, isAbstract,
      hasPrivateConstructor, hasPublicConstructor,
      extendsName, instanceFields, staticFields, instanceMethods, staticMethods,
      line: JavaParserBusiness.lineOf(td) || JavaParserBusiness.lineOf(classDecl) || JavaParserBusiness.lineOf(normal) || 1,
    }
  }

  /** Field names from a `fieldDeclaration` — supports `int a, b, c;`. */
  private static fieldNames(field: CstNode): string[] {
    const list = JavaParserBusiness.firstChildNode(field, ['variableDeclaratorList'])
    if (list === null) return []
    const declarators = JavaParserBusiness.childNodes(list, 'variableDeclarator')
    const out: string[] = []
    for (const d of declarators) {
      const id = JavaParserBusiness.firstChildNode(d, ['variableDeclaratorId'])
      if (id === null) continue
      const name = JavaParserBusiness.firstTokenImage(id, 'Identifier')
      if (name !== null) out.push(name)
    }
    return out
  }

  /** Method name from a `methodDeclaration` — Identifier in the methodDeclarator. */
  private static methodName(method: CstNode): string | null {
    const header = JavaParserBusiness.firstChildNode(method, ['methodHeader'])
    if (header === null) return null
    const declarator = JavaParserBusiness.firstChildNode(header, ['methodDeclarator'])
    if (declarator === null) return null
    return JavaParserBusiness.firstTokenImage(declarator, 'Identifier')
  }

  // ───────────────────────────────────────────────────────────────
  //  Throw statements (deeply nested in expression trees)
  // ───────────────────────────────────────────────────────────────

  private static collectThrowStatements(root: CstNode): ParsedThrow[] {
    const out: ParsedThrow[] = []
    JavaParserBusiness.walk(root, (n) => {
      if (n.name !== 'throwStatement') return
      const expr = JavaParserBusiness.firstChildNode(n, ['expression'])
      const typeName = expr === null ? null : JavaParserBusiness.extractInstantiatedTypeName(expr)
      const line = JavaParserBusiness.lineOf(n) || JavaParserBusiness.lineOf(expr) || 1
      out.push({ typeName, line })
    })
    return out
  }

  /**
   * Try to extract the class name from a `new X(...)` expression
   * nested anywhere inside `expr`. Returns null for re-throws or
   * other non-constructor throw expressions.
   */
  private static extractInstantiatedTypeName(expr: CstNode): string | null {
    let foundName: string | null = null
    JavaParserBusiness.walk(expr, (n) => {
      if (foundName !== null) return
      if (n.name === 'unqualifiedClassInstanceCreationExpression' || n.name === 'classInstanceCreationExpression') {
        // Look for a classOrInterfaceTypeToInstantiate / classType / typeIdentifier child
        const typeNode = JavaParserBusiness.firstChildNode(n, [
          'classOrInterfaceTypeToInstantiate', 'classType', 'typeIdentifier',
        ])
        if (typeNode !== null) {
          const ids = JavaParserBusiness.identifierImagesDeep(typeNode)
          if (ids.length > 0) foundName = ids[ids.length - 1] ?? null
        }
      }
    })
    return foundName
  }

  // ───────────────────────────────────────────────────────────────
  //  Defensive CST navigation primitives
  // ───────────────────────────────────────────────────────────────

  /**
   * Return all child CstNodes under `node.children[key]`, filtering
   * tokens out. Empty array if absent.
   */
  private static childNodes(node: CstNode, key: string): CstNode[] {
    const arr = node.children[key]
    if (arr === undefined) return []
    const out: CstNode[] = []
    for (const item of arr) {
      if (JavaParserBusiness.isCstNode(item)) out.push(item)
    }
    return out
  }

  /**
   * First child CstNode under any of the given keys. Returns null
   * if none of the keys are present or if all are tokens.
   */
  private static firstChildNode(node: CstNode, keys: readonly string[]): CstNode | null {
    for (const key of keys) {
      const arr = node.children[key]
      if (arr === undefined) continue
      for (const item of arr) {
        if (JavaParserBusiness.isCstNode(item)) return item
      }
    }
    return null
  }

  /** Whether any descendant token (within depth bound) carries the given name. */
  private static hasTokenDeep(node: CstNode, tokenName: string): boolean {
    let found = false
    JavaParserBusiness.walk(node, (n) => {
      if (found) return
      const arr = n.children[tokenName]
      if (arr === undefined) return
      for (const item of arr) {
        if (!JavaParserBusiness.isCstNode(item)) { found = true; return }
      }
    })
    return found
  }

  /** Image of the first token directly under `node.children[key]`, or null. */
  private static firstTokenImage(node: CstNode, key: string): string | null {
    const arr = node.children[key]
    if (arr === undefined) return null
    for (const item of arr) {
      if (!JavaParserBusiness.isCstNode(item)) {
        const im = (item as CstToken).image
        if (typeof im === 'string') return im
      }
    }
    return null
  }

  /** 1-based start line, walking children to find any token if `location` is missing. */
  private static lineOf(node: CstNode | null): number {
    if (node === null) return 0
    if (node.location !== undefined && typeof node.location.startLine === 'number') {
      return node.location.startLine
    }
    for (const key of Object.keys(node.children)) {
      const arr = node.children[key]
      if (arr === undefined) continue
      for (const item of arr) {
        if (JavaParserBusiness.isCstNode(item)) {
          const inner = JavaParserBusiness.lineOf(item)
          if (inner > 0) return inner
        } else {
          const tok = item as CstToken
          if (typeof tok.startLine === 'number') return tok.startLine
        }
      }
    }
    return 0
  }

  /**
   * Recursively collect every `Identifier` token's `image` under
   * `node`, in tree order. Used to flatten qualified names like
   * `com.example.Foo` and to retrieve the simple name of a class
   * reference embedded several levels deep in the type grammar.
   */
  private static identifierImagesDeep(node: CstNode): string[] {
    const out: string[] = []
    JavaParserBusiness.walk(node, (n) => {
      const ids = n.children['Identifier']
      if (ids === undefined) return
      for (const t of ids) {
        if (!JavaParserBusiness.isCstNode(t)) {
          const im = (t as CstToken).image
          if (typeof im === 'string' && im.length > 0) out.push(im)
        }
      }
    })
    return out
  }

  /** DFS walker. Visits every CstNode in the subtree including root. */
  private static walk(node: CstNode, visit: (n: CstNode) => void): void {
    const stack: CstNode[] = [node]
    while (stack.length > 0) {
      const n = stack.pop()!
      visit(n)
      for (const key of Object.keys(n.children)) {
        const arr = n.children[key]
        if (arr === undefined) continue
        for (const child of arr) {
          if (JavaParserBusiness.isCstNode(child)) stack.push(child)
        }
      }
    }
  }

  /** First descendant CstNode with the given rule name (DFS). */
  private static deepFirst(node: CstNode, name: string): CstNode | null {
    let found: CstNode | null = null
    JavaParserBusiness.walk(node, (n) => { if (found === null && n.name === name) found = n })
    return found
  }

  /**
   * Does any modifier node directly under `host.children[modifierKey]`
   * carry a token named `tokenName`? Captures patterns like
   *   fieldModifier: [ { children: { Static: [Token] } } ]
   *   methodModifier: [ { children: { Private: [Token] } } ]
   */
  private static hasModifierUnder(host: CstNode, tokenName: string, modifierKey: string): boolean {
    const arr = JavaParserBusiness.childNodes(host, modifierKey)
    for (const m of arr) {
      if (JavaParserBusiness.hasTokenDeep(m, tokenName)) return true
    }
    return false
  }

  /**
   * Whether the class declaration carries a given modifier token,
   * searched across the three CST levels where java-parser may
   * attach `classModifier` (typeDeclaration / classDeclaration /
   * normalClassDeclaration) depending on grammar version.
   */
  private static hasClassModifier(td: CstNode, classDecl: CstNode, normal: CstNode, tokenName: string): boolean {
    return JavaParserBusiness.hasModifierUnder(td, tokenName, 'classModifier')
        || JavaParserBusiness.hasModifierUnder(classDecl, tokenName, 'classModifier')
        || JavaParserBusiness.hasModifierUnder(normal, tokenName, 'classModifier')
  }

  /** Type guard distinguishing CstNode (has `.children`) from CstToken (has `.image`). */
  private static isCstNode(x: CstNode | CstToken): x is CstNode {
    return typeof (x as CstNode).children === 'object' && (x as CstNode).children !== null
  }
}
