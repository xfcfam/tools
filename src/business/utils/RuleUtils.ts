import type { Component, Layer } from '../transfers/Component.js'
import type { SourceFile, ParsedClass } from '../../repository/transfers/SourceFile.js'

/**
 * Static utility component shared by the rule catalog. Pure helpers for
 * reaching the parsed source projection attached to a {@link Component}
 * and for the layer/suffix arithmetic the rules repeat.
 *
 * No I/O — operates only on already-classified components and the
 * `sourceFile` projection `ArtefactBusiness` attaches to each.
 */
export class RuleUtils {
  private constructor() {}

  /** Canonical injection name of each layer. */
  static readonly INJECTION_NAME: Record<Layer, string | null> = {
    repository: 'R',
    business: 'B',
    api: 'A',
    architecture: 'XF',
  }

  /** Canonical logical/generalization suffix(es) of each layer. */
  static readonly LAYER_SUFFIXES: Record<Layer, readonly string[]> = {
    repository: ['Repository'],
    business: ['Business'],
    api: ['Service', 'View'],
    architecture: [],
  }

  /** Abstraction rank — lower number = more concrete layer. */
  static readonly RANK: Record<Layer, number> = {
    repository: 0,
    business: 1,
    api: 2,
    architecture: 3,
  }

  /** Retrieve the parsed source projection of a component, if attached. */
  static sourceOf(c: Component): SourceFile | undefined {
    return (c as Component & { sourceFile?: SourceFile }).sourceFile
  }

  /** Find the class declaration matching the component's canonical name. */
  static primaryClass(c: Component): ParsedClass | undefined {
    const sf = RuleUtils.sourceOf(c)
    if (sf === undefined) return undefined
    return sf.classes.find(k => k.name === c.name) ?? sf.classes[0]
  }

  /** Derive a layer from a canonical name suffix, or `null` if none matches. */
  static layerFromSuffix(name: string): Layer | null {
    if (name.endsWith('Repository')) return 'repository'
    if (name.endsWith('Business')) return 'business'
    if (name.endsWith('Service') || name.endsWith('View')) return 'api'
    return null
  }

  /**
   * Whether a parsed class declares a non-instantiable surface: an
   * `abstract class` (which the language forbids `new`-ing regardless of
   * its constructor's visibility) or a private constructor.
   */
  static isNonInstantiable(klass: ParsedClass): boolean {
    return klass.isAbstract || klass.hasPrivateConstructor
  }

  /**
   * Return a copy of `text` with the content of line and block comments
   * and of single / double / backtick string literals replaced by spaces,
   * preserving length and newlines so a match index maps back to `text`.
   * Lets a rule scan real code only — never comments (e.g. JSDoc
   * `@example` blocks) or string literals.
   */
  static maskCommentsAndStrings(text: string): string {
    const out = text.split('')
    const n = text.length
    const blank = (a: number, b: number): void => {
      for (let k = a; k < b; k++) if (out[k] !== '\n') out[k] = ' '
    }
    let i = 0
    while (i < n) {
      const ch = text[i]
      const nx = text[i + 1]
      if (ch === '/' && nx === '/') {
        let j = i + 2
        while (j < n && text[j] !== '\n') j++
        blank(i, j); i = j; continue
      }
      if (ch === '/' && nx === '*') {
        let j = i + 2
        while (j < n && !(text[j] === '*' && text[j + 1] === '/')) j++
        j = Math.min(n, j + 2); blank(i, j); i = j; continue
      }
      if (ch === "'" || ch === '"' || ch === '`') {
        let j = i + 1
        while (j < n) {
          if (text[j] === '\\') { j += 2; continue }
          if (text[j] === ch) { j++; break }
          j++
        }
        blank(i + 1, j - 1); i = j; continue
      }
      i++
    }
    return out.join('')
  }

  /** Whether a class declares or inherits-presence of an invocable method `name`. */
  static declaresMethod(klass: ParsedClass, name: string): boolean {
    return klass.instanceMethods.includes(name) || klass.staticMethods.includes(name)
  }

  /** Whether a class declares a static method `name`. */
  static declaresStaticMethod(klass: ParsedClass, name: string): boolean {
    return klass.staticMethods.includes(name)
  }

  /**
   * Heuristic Interaction-Layer split used by the naming rules: a
   * logical/generalization under `/api` that sits in a `/gui` or
   * `/view` area implements a graphical interaction point (→ `View`),
   * anything else a systemic one (→ `Service`).
   */
  static apiIsGraphical(relativePath: string): boolean {
    return relativePath.includes('/gui/') || relativePath.includes('/view/')
  }

  /**
   * Extract the body text of a `static [async] <method>(...) { ... }`
   * declaration from raw source. Naive brace matching, adequate for the
   * short lifecycle methods the catalog inspects. Returns `null` when
   * the method is absent.
   */
  static staticMethodBody(text: string, methodName: string): { text: string; line: number } | null {
    const masked = RuleUtils.maskCommentsAndStrings(text)
    const headerRe = new RegExp(`^[ \\t]*static\\s+(?:async\\s+)?${methodName}\\s*\\(`, 'm')
    const headerMatch = masked.match(headerRe)
    if (headerMatch === null || headerMatch.index === undefined) return null
    const lineStart = headerMatch.index
    const line = masked.substring(0, lineStart).split('\n').length
    // Skip the parameter list (it may contain `{ }` in default values)
    // before locating the body's opening brace.
    const parenOpen = masked.indexOf('(', lineStart)
    if (parenOpen < 0) return null
    let pdepth = 0
    let j = parenOpen
    for (; j < masked.length; j++) {
      const ch = masked[j]
      if (ch === '(') pdepth++
      else if (ch === ')') { pdepth--; if (pdepth === 0) { j++; break } }
    }
    if (j >= masked.length) return null
    const openBrace = masked.indexOf('{', j)
    if (openBrace < 0) return null
    let depth = 0
    let i = openBrace
    for (; i < masked.length; i++) {
      const ch = masked[i]
      if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) break
      }
    }
    if (i >= masked.length) return null
    return { text: masked.substring(openBrace + 1, i), line }
  }

  /**
   * Cheap textual check: is `index` inside a string / template / regex
   * literal or a line comment on its own line? Used to suppress the
   * validator's own self-detection when its rule sources mention a
   * dotted call inside an error message or a regex pattern.
   */
  static appearsInLiteral(text: string, index: number): boolean {
    const lineStart = text.lastIndexOf('\n', index - 1) + 1
    const lineEnd = text.indexOf('\n', index)
    const line = text.substring(lineStart, lineEnd < 0 ? text.length : lineEnd)
    const colInLine = index - lineStart
    let single = 0, double = 0, back = 0, slash = 0
    let i = 0
    while (i < colInLine) {
      const ch = line[i]
      if (ch === '\\') { i += 2; continue }
      if (ch === '/' && line[i + 1] === '/') break
      if (ch === "'") single++
      else if (ch === '"') double++
      else if (ch === '`') back++
      else if (ch === '/') slash++
      i++
    }
    return (single % 2 === 1) || (double % 2 === 1) || (back % 2 === 1) || (slash % 2 === 1)
  }

  /** 1-based line number of a string offset. */
  static lineAt(text: string, index: number): number {
    return text.substring(0, index).split('\n').length
  }

  /**
   * Extract the body text of a `constructor(...) { ... }` declaration
   * from raw source. Returns `null` when no constructor body is found.
   * Naive brace matching, adequate for the short constructors XF
   * components are expected to carry.
   */
  static constructorBody(text: string): { text: string; line: number } | null {
    // Search over a comment/string-masked view so a `constructor(...)` shown
    // inside a JSDoc `@example` block is never mistaken for the real one.
    const masked = RuleUtils.maskCommentsAndStrings(text)
    const headerRe = /(?:^|\s)constructor\s*\(/m
    const headerMatch = masked.match(headerRe)
    if (headerMatch === null || headerMatch.index === undefined) return null
    const lineStart = headerMatch.index
    const line = masked.substring(0, lineStart).split('\n').length
    // Skip the parameter list first: it may itself contain `{ }` in a
    // default value or destructuring (e.g. `constructor(o: Opts = {})`),
    // which must not be mistaken for the body's opening brace.
    const parenOpen = masked.indexOf('(', lineStart)
    if (parenOpen < 0) return null
    let pdepth = 0
    let j = parenOpen
    for (; j < masked.length; j++) {
      const ch = masked[j]
      if (ch === '(') pdepth++
      else if (ch === ')') { pdepth--; if (pdepth === 0) { j++; break } }
    }
    if (j >= masked.length) return null
    const openBrace = masked.indexOf('{', j)
    if (openBrace < 0) return null
    let depth = 0
    let i = openBrace
    for (; i < masked.length; i++) {
      const ch = masked[i]
      if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) break
      }
    }
    if (i >= masked.length) return null
    return { text: masked.substring(openBrace + 1, i), line }
  }

  /**
   * Whether a constructor body performs work prohibited by §8.2. The
   * structurally-decidable prohibition is **invoking another component
   * through an injection** (`R.x` / `B.y` / `A.z`) anywhere in the
   * constructor — including inside `super(...)`'s arguments, since the
   * injection statics may not be resolved yet (§8.2).
   *
   * Everything else is permitted: initialising the component's own
   * attributes, `new X()`, and computing the arguments passed to
   * `super(...)`. Dependence on environment resources is a *semantic*
   * property (e.g. `process.env`, file or network access) evaluated in
   * human review (Λ=4), not decided here. Comments and string literals
   * are masked first so an injection reference inside a JSDoc `@example`
   * or a string literal is not counted.
   */
  static constructorIsNonTrivial(body: string): boolean {
    const code = RuleUtils.maskCommentsAndStrings(body)
    return /\b[RBA]\.[A-Za-z_$]/.test(code)
  }

  /**
   * Return the statements of a lifecycle-method body that are NOT a
   * `<receiver>.<method>(...)` invocation of the expected lifecycle
   * `method` (`init` | `terminate`). `await` and `return` prefixes are
   * tolerated. Blank lines, comments and braces are ignored. Used by
   * the injection / XF `*-mismatch` rules.
   */
  static nonLifecycleStatements(body: string, method: 'init' | 'terminate'): string[] {
    const offending: string[] = []
    // A direct slot lifecycle call: `[return] [await] <receiver>.<method>()`.
    const callRe = new RegExp(`^(?:return\\s+)?(?:await\\s+)?[A-Za-z_$][\\w$.[\\]]*\\.${method}\\s*\\(\\s*\\)\\s*;?$`)
    // The canonical "iterate over a collection slot" idiom:
    // `for (const x of <slotExpr>) [await] x.<method>()`. This is still
    // an invocation of <method>() on aggregated slots, just iterated.
    const loopRe = new RegExp(`^for\\s*\\(.*\\bof\\b.*\\)\\s*(?:await\\s+)?[A-Za-z_$][\\w$.]*\\.${method}\\s*\\(\\s*\\)\\s*;?$`)
    for (const raw of RuleUtils.maskCommentsAndStrings(body).split('\n')) {
      const s = raw.trim()
      if (s.length === 0) continue
      if (s.startsWith('//') || s.startsWith('*') || s.startsWith('/*')) continue
      if (s === '{' || s === '}') continue
      if (callRe.test(s)) continue
      if (loopRe.test(s)) continue
      offending.push(s)
    }
    return offending
  }

  /**
   * Ordered sequence of dotted-receiver roots `X` such that
   * `X.<method>(...)` appears in `body`, in source order. E.g. for an
   * `init()` body with `await R.init(); await B.init();` and method
   * `init`, returns `['R', 'B']`.
   */
  static orderedLifecycleRoots(body: string, method: 'init' | 'terminate'): string[] {
    const out: string[] = []
    const re = new RegExp(`([A-Za-z_$][\\w$]*)\\.${method}\\s*\\(`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(body)) !== null) {
      if (RuleUtils.appearsInLiteral(body, m.index)) continue
      out.push(m[1]!)
    }
    return out
  }

  /**
   * Receivers `r` such that `r.<method>()` is invoked in `body`.
   * The receiver is the dotted-path root + member, e.g. `R.fileSystem`
   * collapses to `fileSystem`; bare `R.init()` yields `R`.
   */
  static lifecycleSlotReceivers(body: string, method: 'init' | 'terminate'): Set<string> {
    const out = new Set<string>()
    const re = new RegExp(`([A-Za-z_$][\\w$.]*)\\.${method}\\s*\\(`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(body)) !== null) {
      const receiver = m[1]!
      const parts = receiver.split('.')
      out.add(parts[parts.length - 1]!)
    }
    return out
  }
}
