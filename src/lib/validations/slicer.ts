/** Max sliced-file size accepted by the backend (200MB). */
export const MAX_SLICE_FILE_SIZE = 200 * 1024 * 1024

/** Accepted extensions, longest-first so `.gcode.3mf` wins over `.3mf`. */
const ALLOWED_SLICE_EXTENSIONS = ['.gcode.3mf', '.gcode', '.3mf'] as const

/**
 * react-dropzone `accept` map. Slicer exports carry inconsistent MIME types across
 * OSes, so we also accept `application/octet-stream` and `text/plain` and rely on
 * the extension check in {@link validateSliceFile}.
 */
export const SLICE_ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  'model/3mf': ['.3mf', '.gcode.3mf'],
  'application/vnd.ms-package.3dmanufacturing-3dmodel+xml': ['.3mf', '.gcode.3mf'],
  'text/x.gcode': ['.gcode'],
  'text/plain': ['.gcode'],
  'application/octet-stream': ['.gcode', '.3mf', '.gcode.3mf'],
}

/** Human-readable list of accepted formats for UI copy. */
export const SLICE_FORMATS_LABEL = '.gcode, .3mf ou .gcode.3mf'

function hasAllowedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase()
  return ALLOWED_SLICE_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

/**
 * Validate a sliced file by size and extension. Returns a pt-BR error message or
 * `null` when the file is acceptable.
 */
export function validateSliceFile(file: File): string | null {
  if (!hasAllowedExtension(file.name)) {
    return `Formato inválido. Envie um arquivo ${SLICE_FORMATS_LABEL}.`
  }
  if (file.size > MAX_SLICE_FILE_SIZE) {
    return 'Arquivo muito grande. O tamanho máximo é 200MB.'
  }
  return null
}
