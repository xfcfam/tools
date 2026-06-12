import ts from 'typescript'
import { LanguageParserBusiness } from '../../general/LanguageParserBusiness.js'
import type { LanguageId } from '../../transfers/Language.js'
import type { SourceFile, ParsedClass, ParsedImport, ParsedThrow } from '../../../repository/transfers/SourceFile.js'

/**
 * Business Layer Logical that parses TypeScript source into a small
 * AST-derived projection the XF rules consume.
 *
 * Encapsulates the TypeScript Compiler API. Rules never
 * import `typescript` directly.
 */
export class TypeScriptParserBusiness extends LanguageParserBusiness {
  override readonly language: LanguageId = 'typescript'
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  /**
   * Parse `text` (the content of `path`) into a {@link SourceFile}.
   * Errors during parsing produce a SourceFile with empty arrays,
   * never throw — rules tolerate empty inputs gracefully.
   */
  override parse(path: string, text: string): SourceFile {
    const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ES2022, /* setParentNodes */ true, ts.ScriptKind.TS)

    const classes: ParsedClass[] = []
    const imports: ParsedImport[] = []
    const throws: ParsedThrow[] = []
    let hasExports = false

    const lineOf = (node: ts.Node): number => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1

    sf.forEachChild((node) => {
      if (ts.isImportDeclaration(node)) {
        imports.push(TypeScriptParserBusiness.parseImport(node, lineOf(node)))
        return
      }
      if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
        hasExports = true
        return
      }
      if (ts.isClassDeclaration(node)) {
        if (TypeScriptParserBusiness.hasExportModifier(node)) hasExports = true
        classes.push(TypeScriptParserBusiness.parseClass(node, lineOf(node)))
        return
      }
      // Other top-level exports (interface, type, const, function)
      const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined
      if (mods?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
        hasExports = true
      }
    })

    // Visit every nested node to collect throw statements.
    const collectThrows = (node: ts.Node): void => {
      if (ts.isThrowStatement(node)) {
        const expr = node.expression
        let typeName: string | null = null
        if (expr !== undefined && ts.isNewExpression(expr)) {
          typeName = TypeScriptParserBusiness.expressionName(expr.expression)
          if (typeName === '') typeName = null
        }
        throws.push({ typeName, line: lineOf(node) })
      }
      ts.forEachChild(node, collectThrows)
    }
    sf.forEachChild(collectThrows)

    return { path, text, classes, imports, throws, hasExports }
  }

  private static hasExportModifier(node: ts.ClassDeclaration): boolean {
    const mods = ts.getModifiers(node)
    return mods?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) ?? false
  }

  private static parseImport(node: ts.ImportDeclaration, line: number): ParsedImport {
    const specifier = ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : ''
    const isTypeOnly = node.importClause?.isTypeOnly ?? false
    const names: string[] = []
    const clause = node.importClause
    if (clause !== undefined) {
      if (clause.name !== undefined) names.push(clause.name.text)
      const bindings = clause.namedBindings
      if (bindings !== undefined && ts.isNamedImports(bindings)) {
        for (const el of bindings.elements) names.push(el.name.text)
      } else if (bindings !== undefined && ts.isNamespaceImport(bindings)) {
        names.push(bindings.name.text)
      }
    }
    return { specifier, names, isTypeOnly, line }
  }

  private static parseClass(node: ts.ClassDeclaration, line: number): ParsedClass {
    const name = node.name?.text ?? '<anonymous>'
    const mods = ts.getModifiers(node) ?? []
    const isAbstract = mods.some(m => m.kind === ts.SyntaxKind.AbstractKeyword)

    let extendsName: string | null = null
    const heritage = node.heritageClauses ?? []
    for (const clause of heritage) {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        const first = clause.types[0]
        if (first !== undefined) {
          extendsName = TypeScriptParserBusiness.expressionName(first.expression)
        }
      }
    }

    let hasPrivateConstructor = false
    let hasPublicConstructor = false
    const instanceFields: string[] = []
    const staticFields: string[] = []
    const instanceMethods: string[] = []
    const staticMethods: string[] = []

    for (const member of node.members) {
      if (ts.isConstructorDeclaration(member)) {
        const memMods = ts.getModifiers(member) ?? []
        const isPrivate = memMods.some(m => m.kind === ts.SyntaxKind.PrivateKeyword)
        if (isPrivate) hasPrivateConstructor = true
        else hasPublicConstructor = true
        continue
      }
      const memMods = ts.canHaveModifiers(member) ? ts.getModifiers(member) ?? [] : []
      const isStatic = memMods.some(m => m.kind === ts.SyntaxKind.StaticKeyword)
      const isPrivate = memMods.some(m => m.kind === ts.SyntaxKind.PrivateKeyword)
      const memberName = TypeScriptParserBusiness.memberName(member)
      if (memberName === null) continue
      if (isPrivate) continue   // we don't catalogue private members
      if (ts.isPropertyDeclaration(member)) {
        if (isStatic) staticFields.push(memberName)
        else instanceFields.push(memberName)
      } else if (ts.isMethodDeclaration(member) || ts.isGetAccessorDeclaration(member) || ts.isSetAccessorDeclaration(member)) {
        if (isStatic) staticMethods.push(memberName)
        else instanceMethods.push(memberName)
      }
    }

    return {
      name, isAbstract, hasPrivateConstructor, hasPublicConstructor,
      extendsName, instanceFields, staticFields, instanceMethods, staticMethods, line,
    }
  }

  private static expressionName(expr: ts.Expression): string {
    if (ts.isIdentifier(expr)) return expr.text
    if (ts.isPropertyAccessExpression(expr)) return expr.name.text
    if (ts.isCallExpression(expr)) return TypeScriptParserBusiness.expressionName(expr.expression)
    return ''
  }

  private static memberName(member: ts.ClassElement): string | null {
    const n = member.name
    if (n === undefined) return null
    if (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n)) return n.text
    return null
  }
}
