'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Calendar } from 'lucide-react';
import type { PeriodFilter as PeriodFilterType } from '@/types/dashboard';

const PERIOD_OPTIONS: { value: PeriodFilterType; label: string }[] = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último ano' },
  { value: 'all', label: 'Tudo' },
];

export function PeriodFilter() {
  const { period, setPeriod } = useDashboardStore();

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Select
        value={period}
        onValueChange={(value) => setPeriod(value as PeriodFilterType)}
      >
        <SelectTrigger
          className="w-[180px]"
          aria-label="Selecionar período de análise"
        >
          <SelectValue placeholder="Selecionar período" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
