'use client';

import { PeriodFilter } from '@/components/dashboard/period-filter';
import { ExportButton } from '@/components/dashboard/export-button';
import { HeroRevenue } from '@/components/dashboard/hero-revenue';
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
  const handleExportPDF = async () => {
    await exportDashboardToPDF();
  };

  const handleExportPNG = async () => {
    await exportDashboardToPNG();
  };

  return (
    <div className="space-y-8" id="dashboard-content">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral completa do desempenho do seu negócio
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <PeriodFilter />
          <ExportButton onExportPDF={handleExportPDF} onExportPNG={handleExportPNG} />
        </div>
      </header>

      <Separator />

      {/* HERO SECTION: Revenue spotlight */}
      <section aria-labelledby="hero-revenue-heading">
        <h2 id="hero-revenue-heading" className="sr-only">Receita Total</h2>
        <HeroRevenue />
      </section>

      {/* PRIMARY METRICS + REVENUE CHART */}
      <section className="grid gap-6 lg:grid-cols-5" aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">Métricas Financeiras</h2>

        {/* Financial Metrics - Left column */}
        <div className="lg:col-span-2 space-y-6">
          <OverviewMetrics />
        </div>

        {/* Revenue Chart - Right column (expanded) */}
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
      </section>

      {/* CONVERSION FUNNEL (more compact) */}
      <section aria-labelledby="funnel-heading">
        <h2 id="funnel-heading" className="sr-only">Funil de Conversão</h2>
        <ConversionFunnel />
      </section>

      {/* TOP CUSTOMERS + ACTIVITY SIDE BY SIDE */}
      <section className="grid gap-6 lg:grid-cols-2" aria-labelledby="customers-activity-heading">
        <h2 id="customers-activity-heading" className="sr-only">Clientes e Atividades</h2>
        <TopCustomersTable />
        <RecentActivityFeed />
      </section>

      <Separator />

      {/* OPERATIONAL INSIGHTS */}
      <section aria-labelledby="insights-heading">
        <h2 id="insights-heading" className="text-2xl font-bold tracking-tight mb-4">
          Insights Operacionais
        </h2>
        <OperationalInsights />
      </section>

      {/* TOP FILAMENTS & MATERIALS */}
      <section className="grid gap-6 lg:grid-cols-2" aria-labelledby="catalog-heading">
        <h2 id="catalog-heading" className="sr-only">Catálogo mais utilizado</h2>
        <TopFilamentsChart />
        <TopMaterialsChart />
      </section>

      <Separator />

      {/* GOALS & ALERTS */}
      <section aria-labelledby="goals-heading">
        <h2 id="goals-heading" className="text-2xl font-bold tracking-tight mb-4">
          Metas e Alertas
        </h2>
        <GoalsSection />
      </section>
    </div>
  );
}
