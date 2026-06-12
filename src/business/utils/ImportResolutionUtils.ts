import type { Component, Layer, ComponentType } from '../transfers/Component.js'
import type { Artefact } from '../transfers/Artefact.js'
import type { ParsedImport } from '../../repository/transfers/SourceFile.js'
import { RuleUtils } from './RuleUtils.js'

/**
 * Static utility component that resolves the target of an import to a
 * classified XF element. Pure (no I/O) — works over the artefact's
 * already-classified component set and the parsed import descriptors.
 *
 * Two resolution channels:
 *
 *  • In-artefact relative imports — the importer's relative path plus
 *    the `../`/`./` specifier resolve to a concrete file; that file is
 *    matched against the artefact's component inventory to recover its
 *    layer and type exactly.
 *
 *  • External `@xfcfam/*` imports — the imported *name*'s canonical
 *    suffix decides the layer (e.g. `Repository` → Access). Type is
 *    inferred coarsely (injection names `R`/`B`/`A`, suffix `Utils`,
 *    else logical/generalization indistinguishable → reported as the
 *    layer only).
 */
export class ImportResolutionUtils {
  private constructor() {}

  /** Resolve a relative import specifier against the importer's relative path → resolved relative path (no extension normalisation). */
  static resolveRelative(fromRelativePath: string, specifier: string): string | null {
    if (!specifier.startsWith('.')) return null
    const fromSegs = fromRelativePath.split('/')
    fromSegs.pop() // drop importer filename
    const toSegs = specifier.split('/')
    for (const seg of toSegs) {
      if (seg === '..') fromSegs.pop()
      else if (seg === '.' || seg === '') continue
      else fromSegs.push(seg)
    }
    return fromSegs.join('/').replace(/\.[^./]+$/, '')
  }

  /** Find the component an in-artefact relative import points to (by resolved path stem). */
  static resolveComponent(importer: Component, imp: ParsedImport, artefact: Artefact): Component | null {
    const resolved = ImportResolutionUtils.resolveRelative(importer.relativePath, imp.specifier)
    if (resolved === null) return null
    for (const c of artefact.components) {
      if (c.relativePath.replace(/\.[^./]+$/, '') === resolved) return c
    }
    return null
  }

  /**
   * The layer of the component referenced by `imp`, or `null` when it
   * cannot be decided (e.g. a third-party non-XF import). Considers
   * runtime AND type-only imports — callers filter as needed.
   */
  static referencedLayer(importer: Component, imp: ParsedImport, artefact: Artefact): Layer | null {
    if (imp.specifier.startsWith('.')) {
      const target = ImportResolutionUtils.resolveComponent(importer, imp, artefact)
      return target !== null && target.layer !== 'architecture' ? target.layer : null
    }
    if (imp.specifier.startsWith('@xfcfam/')) {
      for (const name of imp.names) {
        const inj = ImportResolutionUtils.injectionLayer(name)
        if (inj !== null) return inj
        const lay = RuleUtils.layerFromSuffix(name)
        if (lay !== null) return lay
      }
    }
    return null
  }

  /** The type of the component referenced by an in-artefact relative import, or `null`. */
  static referencedType(importer: Component, imp: ParsedImport, artefact: Artefact): ComponentType | null {
    if (!imp.specifier.startsWith('.')) return null
    const target = ImportResolutionUtils.resolveComponent(importer, imp, artefact)
    return target !== null ? target.type : null
  }

  /** Map an injection canonical name to its layer. */
  static injectionLayer(name: string): Layer | null {
    if (name === 'R') return 'repository'
    if (name === 'B') return 'business'
    if (name === 'A') return 'api'
    return null
  }
}
