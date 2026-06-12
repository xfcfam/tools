import type { LanguageDescriptor, LanguageId } from '../transfers/Language.js'

/**
 * Static utility — canonical metadata for every language supported (or
 * stubbed) by xftools. Pure data, no I/O. Consumed by
 * `LanguageBusiness` (detection) and `ArtefactBusiness` (walker
 * extension + parser pick).
 *
 * Extensions and manifest signals follow each ecosystem's conventions:
 *
 *   typescript  → .ts/.tsx        tsconfig.json
 *   javascript  → .js/.mjs/.cjs   package.json
 *   python      → .py             pyproject.toml | setup.py
 *   java        → .java           pom.xml | build.gradle | build.gradle.kts
 *   kotlin      → .kt/.kts        build.gradle.kts | settings.gradle.kts
 *   swift       → .swift          Package.swift
 *   csharp      → .cs             *.csproj | *.sln  (handled via wildcard)
 *   cpp         → .cpp/.cc/.cxx/.hpp/.h
 *                                CMakeLists.txt | conanfile.txt
 */
export class LanguageCatalogueUtils {
  private constructor() {}

  static readonly DESCRIPTORS: readonly LanguageDescriptor[] = [
    {
      id: 'typescript',
      label: 'TypeScript',
      extensions: ['ts', 'tsx', 'mts', 'cts'],
      manifestFiles: ['tsconfig.json'],
      detectionPriority: 10,
    },
    {
      id: 'javascript',
      label: 'JavaScript',
      extensions: ['js', 'mjs', 'cjs', 'jsx'],
      manifestFiles: ['package.json', 'jsconfig.json'],
      detectionPriority: 5,
    },
    {
      id: 'python',
      label: 'Python',
      extensions: ['py'],
      manifestFiles: ['pyproject.toml', 'setup.py', 'setup.cfg', 'requirements.txt'],
      detectionPriority: 10,
    },
    {
      id: 'java',
      label: 'Java',
      extensions: ['java'],
      manifestFiles: ['pom.xml', 'build.gradle'],
      detectionPriority: 10,
    },
    {
      id: 'kotlin',
      label: 'Kotlin',
      extensions: ['kt', 'kts'],
      manifestFiles: ['build.gradle.kts', 'settings.gradle.kts'],
      detectionPriority: 11,
    },
    {
      id: 'swift',
      label: 'Swift',
      extensions: ['swift'],
      manifestFiles: ['Package.swift'],
      detectionPriority: 10,
    },
    {
      id: 'csharp',
      label: 'C#',
      extensions: ['cs'],
      // .csproj / .sln are wildcarded — detection handles them
      // separately via the `wildcardManifests` lookup below.
      manifestFiles: [],
      detectionPriority: 10,
    },
    {
      id: 'cpp',
      label: 'C++',
      extensions: ['cpp', 'cc', 'cxx', 'hpp', 'h'],
      manifestFiles: ['CMakeLists.txt', 'conanfile.txt'],
      detectionPriority: 10,
    },
  ]

  /**
   * Wildcard manifest signals — these are checked via directory listing
   * rather than fixed-name presence (used by detection).
   */
  static readonly WILDCARD_MANIFESTS: ReadonlyArray<{ id: LanguageId; suffix: string; priority: number }> = [
    { id: 'csharp', suffix: '.csproj', priority: 10 },
    { id: 'csharp', suffix: '.sln',    priority:  9 },
  ]

  /** Look up a descriptor by id; returns null for `'unknown'`. */
  static byId(id: LanguageId): LanguageDescriptor | null {
    return LanguageCatalogueUtils.DESCRIPTORS.find(d => d.id === id) ?? null
  }
}
