import { StatelessRepository } from '@xfcfam/xf'
import { promises as fs } from 'node:fs'
import { join, relative, sep, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { FileSystemEntry } from '../transfers/FileSystemEntry.js'

/**
 * Access Layer Logical for filesystem operations.
 *
 * Walks directories, reads files, checks existence. Encapsulates
 * `node:fs` so that no Business component imports it directly.
 */
export class FileSystemRepository extends StatelessRepository {
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  /** Whether the given absolute path exists and is a directory. */
  async isDirectory(path: string): Promise<boolean> {
    try {
      const st = await fs.stat(path)
      return st.isDirectory()
    } catch {
      return false
    }
  }

  /** Read a file as UTF-8 text. */
  async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8')
  }

  /**
   * Read the version of xftools itself, from the package manifest that
   * sits above this compiled module. Walks up from the module location
   * until a `package.json` carrying a `version` is found; returns
   * `'unknown'` if none is reachable.
   */
  async toolVersion(): Promise<string> {
    let dir = dirname(fileURLToPath(import.meta.url))
    for (let depth = 0; depth < 6; depth++) {
      try {
        const text = await fs.readFile(join(dir, 'package.json'), 'utf-8')
        const version = (JSON.parse(text) as { version?: unknown }).version
        if (typeof version === 'string') return version
      } catch {
        // No manifest at this level — keep walking up.
      }
      const parent = dirname(dir)
      if (parent === dir) break
      dir = parent
    }
    return 'unknown'
  }

  /**
   * Walk `root` recursively, yielding every regular file matching the
   * optional extension filter. `extensions` accepts a single string or
   * an array (without the dot, e.g. `'ts'` or `['ts','tsx']`).
   *
   * Excludes any segment named `node_modules`, `dist`, or starting
   * with `.` (hidden files / directories).
   */
  async walk(root: string, extensions?: string | readonly string[]): Promise<FileSystemEntry[]> {
    const exts = extensions === undefined
      ? undefined
      : (typeof extensions === 'string' ? [extensions] : extensions)
    const out: FileSystemEntry[] = []
    await FileSystemRepository.walkInto(root, root, exts, out)
    out.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
    return out
  }

  private static async walkInto(
    current: string,
    root: string,
    extensions: readonly string[] | undefined,
    out: FileSystemEntry[],
  ): Promise<void> {
    let entries
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue
      if (e.name === 'node_modules' || e.name === 'dist') continue
      const full = join(current, e.name)
      if (e.isDirectory()) {
        await FileSystemRepository.walkInto(full, root, extensions, out)
      } else if (e.isFile()) {
        if (extensions !== undefined && !extensions.some(x => e.name.endsWith(`.${x}`))) continue
        const rel = relative(root, full).split(sep).join('/')
        out.push({ path: full, relativePath: rel })
      }
    }
  }

  /** List immediate subdirectories of `dir`. */
  async listSubdirectories(dir: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      return entries.filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== 'dist').map(e => e.name).sort()
    } catch {
      return []
    }
  }

  /** List immediate filenames (not directories) of `dir`. */
  async listFiles(dir: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      return entries.filter(e => e.isFile() && !e.name.startsWith('.')).map(e => e.name).sort()
    } catch {
      return []
    }
  }
}
