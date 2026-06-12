import { StatelessBusiness } from '@xfcfam/xf'
import type { Component } from '../transfers/Component.js'
import type { LanguageId } from '../transfers/Language.js'
import { ClassificationUtils } from '../utils/ClassificationUtils.js'

/**
 * Business Layer Logical that classifies every file under `/src`
 * according to the XF L × T matrix. Stateless — calls into the
 * pure {@link ClassificationUtils}.
 */
export class ClassificationBusiness extends StatelessBusiness {
  override async init(): Promise<void> {}
  override async terminate(): Promise<void> {}

  /** Classify a single file. */
  classify(absolutePath: string, relativeToSrc: string, language: LanguageId): Component {
    return ClassificationUtils.classify(absolutePath, relativeToSrc, language)
  }
}
