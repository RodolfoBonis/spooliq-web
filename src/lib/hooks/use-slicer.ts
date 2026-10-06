import { useMutation, useQuery } from '@tanstack/react-query'
import { slicerService, type AnalyzeSliceOptions } from '@/services/slicer-service'

interface AnalyzeSliceVariables {
  file: File
  options?: AnalyzeSliceOptions
}

/**
 * Mutation that uploads a sliced file and returns its analysis. Kept unopinionated
 * about toasts/errors so callers (the import dialog) can map codes via getApiErrorMessage.
 */
export function useAnalyzeSlice() {
  return useMutation({
    mutationFn: ({ file, options }: AnalyzeSliceVariables) =>
      slicerService.analyze(file, options),
  })
}

/**
 * Query for a 3D model's stored slice analysis (with suggestions). Disabled until an
 * id is provided so the import dialog can gate it behind `open`.
 */
export function useModelSliceAnalysis(modelId?: string) {
  return useQuery({
    queryKey: ['slice-analysis', modelId],
    queryFn: () => slicerService.getModelAnalysis(modelId!),
    enabled: !!modelId,
    // The analysis is immutable for a given model; avoid refetch churn.
    staleTime: 5 * 60 * 1000,
  })
}
