'use client';

import { useState } from 'react';
import { PeriodFilter } from '@/components/dashboard/period-filter';
import { ExportButton } from '@/components/dashboard/export-button';
import { OverviewMetrics } from '@/components/dashboard/overview-metrics';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ConversionFunnel } from '@/components/dashboard/conversion-funnel';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { TopCustomersTable } from '@/components/dashboard/top-customers-table';
import { OperationalInsights } from '@/components/dashboard/operational-insights';
import { TopFilamentsChart } from '@/components/dashboard/top-filaments-chart';
import { TopMaterialsChart } from '@/components/dashboard/top-materials-chart';
import { GoalsSection } from '@/components/dashboard/goals-section';
import { exportDashboardToPDF, exportDashboardToPNG } from '@/lib/dashboard/export-pdf';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportDashboardToPDF();
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      await exportDashboardToPNG();
    } catch (error) {
      console.error('Error exporting PNG:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6" id="dashboard-content">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral completa do desempenho do seu negócio
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <PeriodFilter />
          <ExportButton onExportPDF={handleExportPDF} onExportPNG={handleExportPNG} />
        </div>
      </div>

      <Separator />

      {/* TIER 1: Overview Metrics */}
      <section>
        <OverviewMetrics />
      </section>

      {/* TIER 1: Revenue Chart */}
      <section>
        <RevenueChart />
      </section>

      {/* TIER 1: Conversion Funnel & Recent Activity */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ConversionFunnel />
        <RecentActivityFeed />
      </section>

      {/* TIER 2: Top Customers */}
      <section>
        <TopCustomersTable />
      </section>

      {/* TIER 2: Operational Insights */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Insights Operacionais</h2>
        <OperationalInsights />
      </section>

      {/* TIER 3: Top Filaments & Materials */}
      <section className="grid gap-6 lg:grid-cols-2">
        <TopFilamentsChart />
        <TopMaterialsChart />
      </section>

      {/* TIER 3: Goals & Alerts */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Metas e Alertas</h2>
        <GoalsSection />
      </section>
    </div>
  );
}
