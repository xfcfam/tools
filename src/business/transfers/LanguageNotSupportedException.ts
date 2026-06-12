/**
 * Business-layer Exception — the artefact's detected language has no
 * descriptor or no parser registered. Distinct from "language detected
 * but parser is a stub": that case warns and continues; this case is
 * unrecoverable.
 *
 * Thrown by `ArtefactBusiness.validate()` after detection succeeds
 * but registry lookup fails — usually a programmer error in the
 * Language catalogue.
 */
export class LanguageNotSupportedException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LanguageNotSupportedException'
  }
}
