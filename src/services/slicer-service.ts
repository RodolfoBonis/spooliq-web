import api from '@/lib/api/client'
import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import type { SliceAnalysis } from '@/types/slicer'

export interface AnalyzeSliceOptions {
  /** Upload progress as an integer percentage (0–100). */
  onProgress?: (percent: number) => void
  /** Abort signal so an in-flight upload can be cancelled (e.g. dialog closed). */
  signal?: GenericAbortSignal
}

export const slicerService = {
  /**
   * Analyze a sliced file (`.gcode`, `.3mf`, `.gcode.3mf`) via multipart upload.
   * Returns the parsed plates/filaments with catalog suggestions. Errors surface
   * the standard `{error, message, code}` envelope (handle with getApiErrorMessage).
   */
  async analyze(file: File, options?: AnalyzeSliceOptions): Promise<SliceAnalysis> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post<SliceAnalysis>('/slicer/analyze', formData, {
      signal: options?.signal,
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (!options?.onProgress || !event.total) return
        options.onProgress(Math.round((event.loaded / event.total) * 100))
      },
    })
    return data
  },

  /**
   * Fetch a 3D model's stored slice analysis WITH catalog suggestions.
   * Returns 404 `slice_analysis_not_found` when the model was never analyzed.
   */
  async getModelAnalysis(modelId: string): Promise<SliceAnalysis> {
    const { data } = await api.get<SliceAnalysis>(`/models3d/${modelId}/slice-analysis`)
    return data
  },
}

export default slicerService
