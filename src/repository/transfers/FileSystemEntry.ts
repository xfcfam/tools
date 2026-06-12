/**
 * Transfer object: one entry returned by the FileSystemRepository
 * when walking a directory.
 */
export interface FileSystemEntry {
  /** Absolute path to the file. */
  path: string
  /** Path relative to the walk root (forward slashes). */
  relativePath: string
}
