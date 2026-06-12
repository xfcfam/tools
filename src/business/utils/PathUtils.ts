import type { Component, Layer } from '../transfers/Component.js'

/**
 * Static utility component for canonical XF path operations. Pure
 * functions, no I/O.
 */
export class PathUtils {
  private constructor() {}

  /** Canonical top-level folder names per XF spec section 5. */
  static readonly LAYER_FOLDERS: Record<Layer, string> = {
    repository: 'repository',
    business: 'business',
    api: 'api',
    architecture: '',
  }

  /** Canonical subdivisions of each layer. */
  static readonly LAYER_SUBFOLDERS: readonly string[] = ['general', 'logic', 'transfers', 'utils']

  /** Canonical injection filenames (without extension). */
  static readonly INJECTION_NAMES: Record<Layer, string | null> = {
    repository: 'R',
    business: 'B',
    api: 'A',
    architecture: 'XF',
  }

  /** Filter components in a given layer. */
  static inLayer(components: readonly Component[], layer: Layer): Component[] {
    return components.filter(c => c.layer === layer)
  }

  /** Filter components of a given type. */
  static ofType(components: readonly Component[], type: Component['type']): Component[] {
    return components.filter(c => c.type === type)
  }

  /**
   * Build the canonical relative path under `/src` for a component
   * given its layer + subdivision.
   */
  static canonicalPath(layer: Layer, subdivision?: string): string {
    const top = PathUtils.LAYER_FOLDERS[layer]
    if (top === '') return ''
    return subdivision !== undefined ? `${top}/${subdivision}` : top
  }

  /**
   * Strip a file extension if present. `'Foo.ts'` → `'Foo'`.
   */
  static stripExtension(filename: string): string {
    const dot = filename.lastIndexOf('.')
    return dot >= 0 ? filename.substring(0, dot) : filename
  }
}
