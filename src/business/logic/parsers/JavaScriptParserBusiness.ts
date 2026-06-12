import { LanguageParserBusiness } from '../../general/LanguageParserBusiness.js'
import type { LanguageId } from '../../transfers/Language.js'
import type { SourceFile } from '../../../repository/transfers/SourceFile.js'

/**
 * Business Layer Logical — stub JavaScript parser. Fase 1
 * placeholder: returns an empty JavaScript SourceFile and lets the
 * caller decide what to do (`ArtefactBusiness` surfaces a clear "JavaScript
 * artefacts are not yet supported by xftools" error in the CLI when
 * detection lands here).
 *
 * Roadmap: replace `parse()` with a real JavaScript parser (TODO:
 * see RULES.md "Language applicability").
 */
export class JavaScriptParserBusiness extends LanguageParserBusiness {
  override readonly language: LanguageId = 'javascript'
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  override parse(path: string, text: string): SourceFile {
    return { path, text, classes: [], imports: [], throws: [], hasExports: false }
  }
}
