import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PeriodFilter, DashboardFilters } from '@/types/dashboard';

interface DashboardState {
  // Period filter
  period: PeriodFilter;
  setPeriod: (period: PeriodFilter) => void;

  // Custom date range (when period is 'custom')
  startDate: string | null;
  endDate: string | null;
  setDateRange: (startDate: string, endDate: string) => void;

  // View preferences
  showCharts: boolean;
  showTables: boolean;
  toggleCharts: () => void;
  toggleTables: () => void;

  // Export preferences
  exportFormat: 'pdf' | 'png';
  setExportFormat: (format: 'pdf' | 'png') => void;

  // Get current filters
  getFilters: () => DashboardFilters;

  // Reset to defaults
  reset: () => void;
}

const DEFAULT_PERIOD: PeriodFilter = '30d';

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Default state
      period: DEFAULT_PERIOD,
      startDate: null,
      endDate: null,
      showCharts: true,
      showTables: true,
      exportFormat: 'pdf',

      // Actions
      setPeriod: (period) => set({ period }),

      setDateRange: (startDate, endDate) =>
        set({
          startDate,
          endDate,
          period: 'all', // When custom dates are set, period becomes 'all'
        }),

      toggleCharts: () => set((state) => ({ showCharts: !state.showCharts })),

      toggleTables: () => set((state) => ({ showTables: !state.showTables })),

      setExportFormat: (format) => set({ exportFormat: format }),

      getFilters: () => {
        const state = get();
        return {
          period: state.period,
          start_date: state.startDate || undefined,
          end_date: state.endDate || undefined,
        };
      },

      reset: () =>
        set({
          period: DEFAULT_PERIOD,
          startDate: null,
          endDate: null,
          showCharts: true,
          showTables: true,
          exportFormat: 'pdf',
        }),
    }),
    {
      name: 'spooliq-dashboard-storage',
      // Only persist user preferences, not temporary state
      partialize: (state) => ({
        period: state.period,
        exportFormat: state.exportFormat,
        showCharts: state.showCharts,
        showTables: state.showTables,
      }),
    }
  )
);
