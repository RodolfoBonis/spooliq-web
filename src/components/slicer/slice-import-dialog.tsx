'use client'

import { useCallback, useRef, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { isAxiosError } from 'axios'
import { AlertCircle, File as FileIcon, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getApiErrorMessage } from '@/lib/api/errors'
import { useAnalyzeSlice, useModelSliceAnalysis } from '@/lib/hooks/use-slicer'
import {
  MAX_SLICE_FILE_SIZE,
  SLICE_ACCEPTED_FILE_TYPES,
  SLICE_FORMATS_LABEL,
  validateSliceFile,
} from '@/lib/validations/slicer'
import { SliceResultView, type SliceApplyPayload } from './slice-result-view'

interface SliceImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * When set, the dialog preloads the analysis from this 3D model
   * (`GET /models3d/:id/slice-analysis`) and skips the upload step.
   */
  modelId?: string
  /** Called with the ready-to-apply payload when the user confirms. */
  onApply: (payload: SliceApplyPayload) => void
}

/** Reads the backend machine-readable error `code` from an axios error. */
function getErrorCode(error: unknown): string | undefined {
  if (isAxiosError<{ code?: string | number }>(error)) {
    const code = error.response?.data?.code
    return code !== undefined ? String(code) : undefined
  }
  return undefined
}

export function SliceImportDialog({
  open,
  onOpenChange,
  modelId,
  onApply,
}: SliceImportDialogProps) {
  // The user can fall back to uploading a file when the model has no analysis.
  const [uploadInstead, setUploadInstead] = useState(false)
  const isModelMode = !!modelId && !uploadInstead

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [payload, setPayload] = useState<SliceApplyPayload | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const analyzeMutation = useAnalyzeSlice()
  const modelQuery = useModelSliceAnalysis(open && isModelMode ? modelId : undefined)

  const analysis = isModelMode ? modelQuery.data : analyzeMutation.data
  const error = isModelMode ? modelQuery.error : analyzeMutation.error
  const isLoading = isModelMode ? modelQuery.isLoading : analyzeMutation.isPending

  const resetState = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setSelectedFile(null)
    setFileError(null)
    setProgress(0)
    setPayload(null)
    setUploadInstead(false)
    analyzeMutation.reset()
  }, [analyzeMutation])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetState()
      onOpenChange(next)
    },
    [onOpenChange, resetState]
  )

  const startAnalyze = useCallback(
    (file: File) => {
      const controller = new AbortController()
      abortRef.current = controller
      setProgress(0)
      setPayload(null)
      analyzeMutation.reset()
      analyzeMutation.mutate({
        file,
        options: { onProgress: setProgress, signal: controller.signal },
      })
    },
    [analyzeMutation]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      const validationError = validateSliceFile(file)
      if (validationError) {
        setFileError(validationError)
        return
      }
      setFileError(null)
      setSelectedFile(file)
      startAnalyze(file)
    },
    [startAnalyze]
  )

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const code = rejections[0]?.errors[0]?.code
    if (code === 'file-too-large') {
      toast.error('Arquivo muito grande. O tamanho máximo é 95MB.')
    } else if (code === 'file-invalid-type') {
      toast.error(`Formato inválido. Envie um arquivo ${SLICE_FORMATS_LABEL}.`)
    } else {
      toast.error('Não foi possível adicionar o arquivo.')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: SLICE_ACCEPTED_FILE_TYPES,
    maxSize: MAX_SLICE_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
  })

  const handleApply = () => {
    if (!payload) return
    onApply(payload)
    handleOpenChange(false)
  }

  const errorCode = error ? getErrorCode(error) : undefined
  const isNotSliced = errorCode === 'file_not_sliced'
  const errorMessage = error
    ? getApiErrorMessage(error, 'Não foi possível analisar o arquivo.', {
        byCode: {
          slice_analysis_not_found:
            'Este modelo não possui dados de fatiamento. Envie o arquivo fatiado para preencher o item.',
        },
      })
    : null

  const showDropzone = !isModelMode && !analysis && !isLoading && !error
  const showProgress = !isModelMode && isLoading
  const showAnalysis = !!analysis && !isLoading && !error

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar arquivo fatiado</DialogTitle>
          <DialogDescription>
            {isModelMode
              ? 'Preencha o item com os dados de fatiamento deste modelo.'
              : `Envie um arquivo ${SLICE_FORMATS_LABEL} exportado do seu fatiador.`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
          {/* Dropzone (upload mode, idle) */}
          {showDropzone && (
            <div>
              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mb-2 h-8 w-8 text-neutral-400" />
                <p className="text-sm text-neutral-600">
                  {isDragActive ? 'Solte aqui...' : 'Arraste ou clique para selecionar'}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {SLICE_FORMATS_LABEL} — máximo 95MB
                </p>
              </div>
              {fileError && <p className="mt-2 text-xs text-red-600">{fileError}</p>}
            </div>
          )}

          {/* Upload / analysis progress */}
          {showProgress && (
            <div className="space-y-3 py-6" aria-live="polite">
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <FileIcon className="h-4 w-4 text-neutral-500" />
                <span className="truncate font-medium">{selectedFile?.name}</span>
              </div>
              {progress < 100 ? (
                <>
                  <Progress value={progress} aria-label="Progresso do envio" />
                  <p className="text-xs text-neutral-500">Enviando… {progress}%</p>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando arquivo…
                </div>
              )}
            </div>
          )}

          {/* Model-mode loading */}
          {isModelMode && isLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando análise…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="space-y-3 py-4" role="alert">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                    {isNotSliced && (
                      <p className="mt-1 text-xs text-red-700">
                        Dica: exporte o arquivo já fatiado (G-code ou 3MF) do seu
                        fatiador — por exemplo Bambu Studio, OrcaSlicer, PrusaSlicer
                        ou Cura. Arquivos apenas de modelo (STL/3MF não fatiado) não
                        contêm tempo e peso.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {isModelMode ? (
                <Button variant="outline" onClick={() => setUploadInstead(true)}>
                  Enviar arquivo fatiado
                </Button>
              ) : (
                <Button variant="outline" onClick={resetState}>
                  Escolher outro arquivo
                </Button>
              )}
            </div>
          )}

          {/* Result */}
          {showAnalysis && analysis && (
            <SliceResultView analysis={analysis} onPayloadChange={setPayload} />
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApply} disabled={!payload}>
            Aplicar ao item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
