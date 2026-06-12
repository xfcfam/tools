import { StatelessBusiness } from '@xfcfam/xf'
import { join } from 'node:path'
import { R } from '../../repository/R.js'
import type { LanguageDescriptor, LanguageId } from '../transfers/Language.js'
import { LanguageCatalogueUtils } from '../utils/LanguageCatalogueUtils.js'

/**
 * Business Layer Logical that detects the language of an artefact from
 * filesystem signals at its root (manifest files like `tsconfig.json`,
 * `pyproject.toml`, `pom.xml`, `*.csproj`, …) and resolves canonical
 * language descriptors.
 *
 * Detection is delegated to `R.fileSystem` for the actual listing —
 * Business never reads the disk directly. The scoring algorithm
 * itself is pure logic and stays in Business:
 *
 *  1. List the immediate files at the artefact root via `R.fileSystem`.
 *  2. For each descriptor in {@link LanguageCatalogueUtils}, count
 *     manifest matches (fixed names or wildcards) weighted by
 *     `detectionPriority`.
 *  3. Pick the language with the highest score. Ties are broken by
 *     priority, then by descriptor order.
 *  4. If no signal matches, fall back to extension-frequency analysis
 *     under `/src`. If that also fails, return `'unknown'` and let the
 *     caller surface a clear error.
 */
export class LanguageBusiness extends StatelessBusiness {
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  /** Detect the language of an artefact at `rootPath`. */
  async detect(rootPath: string): Promise<LanguageId> {
    const rootFiles = await R.fileSystem.listFiles(rootPath)

    let best: { id: LanguageId; score: number } | null = null
    for (const descriptor of LanguageCatalogueUtils.DESCRIPTORS) {
      let score = 0
      for (const manifest of descriptor.manifestFiles) {
        if (rootFiles.includes(manifest)) score += descriptor.detectionPriority
      }
      if (score > 0) {
        if (best === null || score > best.score) best = { id: descriptor.id, score }
      }
    }
    for (const wild of LanguageCatalogueUtils.WILDCARD_MANIFESTS) {
      const matched = rootFiles.some(f => f.endsWith(wild.suffix))
      if (matched) {
        const score = wild.priority
        if (best === null || score > best.score) best = { id: wild.id, score }
      }
    }

    if (best !== null) return best.id

    // Fallback: guess from the most frequent extension under /src.
    return this.guessFromSrcExtensions(join(rootPath, 'src'))
  }

  /** Resolve a descriptor for `id`, or `null` for `'unknown'`. */
  descriptor(id: LanguageId): LanguageDescriptor | null {
    return LanguageCatalogueUtils.byId(id)
  }

  /**
   * Resolve the **layer root** of an artefact — the directory under
   * which the three canonical layer folders (`repository`, `business`,
   * `api`) should be sought. For most languages this is simply
   * `<rootPath>/src` (the artefact's source tree).
   *
   * JVM ecosystems (Java/Kotlin) impose a build-system-prescribed
   * source root (`src/main/java`, `src/main/kotlin`) and frequently
   * nest the three layer folders inside a corporate-package prefix
   * (`com.example.artefact.repository.*`). Both arrangements are
   * recognised — see xfa-es § 6.5 "Acomodación a ecosistemas con
   * raíz de fuentes prescrita".
   *
   * Algorithm for JVM artefacts:
   *
   *  1. Start at `<rootPath>/src/main/<java|kotlin>` if it exists,
   *     otherwise at `<rootPath>/src`.
   *  2. From that starting directory, descend the tree breadth-first
   *     up to a bounded depth, looking for the first directory that
   *     contains at least one of `repository`, `business`, or `api`
   *     as immediate child. That directory is the layer root.
   *  3. If no layer folder is found anywhere, fall back to the
   *     starting directory and let downstream rules (notably the
   *     "no-*-folder" structural rules) surface the missing layers
   *     as conformance violations.
   */
  async resolveLayerRoot(rootPath: string, language: LanguageId): Promise<string> {
    if (language === 'java' || language === 'kotlin') {
      const sub = language === 'java' ? 'java' : 'kotlin'
      const ecosystemRoot = join(rootPath, 'src', 'main', sub)
      const startRoot = (await R.fileSystem.isDirectory(ecosystemRoot))
        ? ecosystemRoot
        : join(rootPath, 'src')
      const layerRoot = await this.findLayerRootByBfs(startRoot)
      return layerRoot ?? startRoot
    }
    return join(rootPath, 'src')
  }

  /**
   * BFS for the first directory under `start` whose immediate
   * children contain at least one of the canonical layer folder
   * names (`repository`, `business`, `api`). Bounded depth of 12
   * to avoid pathological descents under deeply nested package
   * trees.
   */
  private async findLayerRootByBfs(start: string): Promise<string | null> {
    const LAYER_FOLDERS = ['repository', 'business', 'api']
    const MAX_DEPTH = 12
    const queue: Array<{ path: string; depth: number }> = [{ path: start, depth: 0 }]
    while (queue.length > 0) {
      const { path, depth } = queue.shift()!
      const subs = await R.fileSystem.listSubdirectories(path)
      if (subs.some(s => LAYER_FOLDERS.includes(s))) return path
      if (depth >= MAX_DEPTH) continue
      for (const sub of subs) queue.push({ path: join(path, sub), depth: depth + 1 })
    }
    return null
  }

  private async guessFromSrcExtensions(srcPath: string): Promise<LanguageId> {
    if (!(await R.fileSystem.isDirectory(srcPath))) return 'unknown'
    // Walk /src with no extension filter; bucket by language.
    const counts = new Map<LanguageId, number>()
    const files = await R.fileSystem.walk(srcPath)
    for (const f of files) {
      const dot = f.relativePath.lastIndexOf('.')
      if (dot < 0) continue
      const ext = f.relativePath.slice(dot + 1)
      for (const d of LanguageCatalogueUtils.DESCRIPTORS) {
        if (d.extensions.includes(ext)) {
          counts.set(d.id, (counts.get(d.id) ?? 0) + 1)
          break
        }
      }
    }
    let winner: LanguageId = 'unknown'
    let max = 0
    for (const [id, n] of counts) {
      if (n > max) { max = n; winner = id }
    }
    return winner
  }
}
