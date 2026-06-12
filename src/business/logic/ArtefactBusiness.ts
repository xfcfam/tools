import { StatelessBusiness } from '@xfcfam/xf'
import { join } from 'node:path'
import { R } from '../../repository/R.js'
import { B } from '../B.js'
import type { Artefact } from '../transfers/Artefact.js'
import type { Component } from '../transfers/Component.js'
import type { ConformanceReport } from '../transfers/ConformanceReport.js'
import { ArtefactInvalidException } from '../transfers/ArtefactInvalidException.js'
import { LanguageNotSupportedException } from '../transfers/LanguageNotSupportedException.js'

/**
 * Business Layer Logical that orchestrates the full validation
 * pipeline:
 *
 *  1. Verify `<path>/src` exists.
 *  2. Detect the artefact's language (delegates to `B.language`).
 *  3. Resolve the layer root — for most languages `<path>/src`, but
 *     JVM artefacts (Java/Kotlin) accommodate `src/main/java/...` and
 *     intermediate corporate package prefixes per xfa-es § 6.5.
 *  4. Pick the per-language parser from `B.parsers`.
 *  5. Walk the layer root for every file matching the language's
 *     extensions.
 *  6. Classify each file (delegates to `B.classification`).
 *  7. Attach parsed source files via the language-specific parser.
 *  8. Run all registered rules (delegates to `B.ruleEngine`).
 *  9. Derive conformance level + assemble report (delegates to
 *     `B.conformance`).
 *
 * Returns the `ConformanceReport` for the artefact, or throws if the
 * input path does not contain `/src`, the language cannot be detected,
 * or the detected language has no implemented parser.
 */
export class ArtefactBusiness extends StatelessBusiness {
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  async validate(rootPath: string): Promise<ConformanceReport> {
    const srcPath = join(rootPath, 'src')
    if (!(await R.fileSystem.isDirectory(srcPath))) {
      throw new ArtefactInvalidException(`Not an XF artefact: ${rootPath} (no /src directory found).`)
    }

    const language = await B.language.detect(rootPath)
    if (language === 'unknown') {
      throw new ArtefactInvalidException(`Cannot detect artefact language at ${rootPath}. Add a manifest file (tsconfig.json, pyproject.toml, pom.xml, …) at the artefact root.`)
    }
    const descriptor = B.language.descriptor(language)
    if (descriptor === null) {
      throw new LanguageNotSupportedException(`No descriptor for language ${language}.`)
    }
    const parser = B.parsers.get(language)
    if (parser === undefined) {
      throw new LanguageNotSupportedException(`No parser registered for language ${language}.`)
    }
    // Per-language layer-root resolution. TS/JS/Python/Swift/C#/C++ →
    // <rootPath>/src. JVM artefacts (Java/Kotlin) → autodetected
    // layer root under src/main/{java|kotlin} per xfa-es § 6.5.
    const layerRoot = await B.language.resolveLayerRoot(rootPath, language)
    // Fase 1 → Fase 2: TypeScript and Java carry real parsers;
    // other non-TS parsers still return empty SourceFiles. Surface a
    // clear warning for those so users aren't misled about coverage.
    if (language !== 'typescript' && language !== 'java') {
      R.console.warn(`xftools: ${descriptor.label} artefacts have limited rule coverage in this release (parser not yet implemented).`)
    }

    const files = await R.fileSystem.walk(layerRoot, descriptor.extensions)
    const components: Component[] = []
    for (const f of files) {
      const c = B.classification.classify(f.path, f.relativePath, language)
      try {
        const text = await R.fileSystem.readFile(f.path)
        const sourceFile = parser.parse(f.path, text)
        ;(c as Component & { sourceFile?: typeof sourceFile }).sourceFile = sourceFile
      } catch {
        // Tolerate unreadable files — they appear unclassified.
      }
      components.push(c)
    }

    const artefact: Artefact = { rootPath, srcPath: layerRoot, language, components }
    const violations = B.ruleEngine.run(artefact)
    const pendingSemanticRules = B.ruleEngine
      .registeredRules()
      .filter(r => r.verifiability === 'semantic').length
    return B.conformance.buildReport(artefact, violations, pendingSemanticRules)
  }
}
