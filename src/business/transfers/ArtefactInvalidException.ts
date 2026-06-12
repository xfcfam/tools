/**
 * Business-layer Exception — the given path is not a valid XF
 * artefact: `/src` is missing, or its language cannot be determined.
 *
 * Thrown by `ArtefactBusiness.validate()` before any rule runs. The
 * CLI layer (`A`) catches it and renders a human-readable error.
 */
export class ArtefactInvalidException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ArtefactInvalidException'
  }
}
