'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText, Image } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ExportButtonProps {
  onExportPDF?: () => Promise<void>;
  onExportPNG?: () => Promise<void>;
}

export function ExportButton({ onExportPDF, onExportPNG }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'pdf' | 'png') => {
    setIsExporting(true);
    const formatLabel = type === 'pdf' ? 'PDF' : 'imagem';

    try {
      if (type === 'pdf' && onExportPDF) {
        await onExportPDF();
        toast.success('Dashboard exportado com sucesso!', {
          description: `O arquivo ${formatLabel} foi baixado para seu computador.`,
        });
      } else if (type === 'png' && onExportPNG) {
        await onExportPNG();
        toast.success('Dashboard exportado com sucesso!', {
          description: `A ${formatLabel} foi baixada para seu computador.`,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar dashboard', {
        description: `Não foi possível gerar o ${formatLabel}. Tente novamente.`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isExporting}
          aria-label="Exportar dashboard"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
        >
          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('png')}
          disabled={isExporting}
        >
          <Image className="mr-2 h-4 w-4" aria-hidden="true" />
          Exportar como Imagem
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
