'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  onExportPDF?: () => Promise<void>;
  onExportPNG?: () => Promise<void>;
}

export function ExportButton({ onExportPDF, onExportPNG }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'pdf' | 'png') => {
    setIsExporting(true);
    try {
      if (type === 'pdf' && onExportPDF) {
        await onExportPDF();
      } else if (type === 'png' && onExportPNG) {
        await onExportPNG();
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('png')}>
          Exportar como Imagem
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
