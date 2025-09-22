import Link from 'next/link'
import {
  FileText,
  Package,
  DollarSign,
  Calendar,
  Plus,
  TrendingUp,
  Activity,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Card, AnimatedContainer, StaggerContainer, StaggerItem } from '@/components/ui'

export default function DashboardPage() {
  return (
    <AnimatedContainer animation="fadeIn" className="space-y-8">
      {/* Header */}
      <AnimatedContainer animation="slideUp" delay={0.1} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Bem-vindo ao SpoolIQ - Sua gestão de impressão 3D
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/filaments/new">
            <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Filamento
            </button>
          </Link>
          <Link href="/quotes/new">
            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Novo Orçamento
            </button>
          </Link>
        </div>
      </AnimatedContainer>

      {/* Stats Cards */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StaggerItem>
          <Card variant="elevated" hover className="group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total de Orçamentos
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    12
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">+23% este mês</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card variant="elevated" hover className="group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Filamentos Cadastrados
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    47
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">+8% este mês</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card variant="elevated" hover className="group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Receita Total
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    R$ 8.450
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">+15% este mês</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card variant="elevated" hover className="group">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Este Mês
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    3
                  </p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-slate-500 mr-1" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">2 pendentes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Content Grid */}
      <AnimatedContainer animation="slideUp" delay={0.4} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Quotes */}
        <div className="lg:col-span-2">
          <Card variant="elevated" className="h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Orçamentos Recentes
                </h3>
                <Link
                  href="/quotes"
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  Ver todos
                </Link>
              </div>

              <div className="space-y-4">
                {/* Sample recent quotes */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Peça Técnica #001</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Cliente: João Silva</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">R$ 245,00</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Aprovado</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Miniatura Dragon #002</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Cliente: Maria Costa</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">R$ 85,00</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">Pendente</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Protótipo Industrial #003</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Cliente: TechCorp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">R$ 1.250,00</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Em produção</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <Link href="/quotes/new">
                  <button className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/10 dark:hover:border-red-600 transition-all duration-200 hover:shadow-md group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3 shadow group-hover:shadow-lg transition-shadow">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Novo Orçamento
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Criar um novo orçamento
                        </p>
                      </div>
                    </div>
                  </button>
                </Link>

                <Link href="/filaments/new">
                  <button className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/10 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow group-hover:shadow-lg transition-shadow">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Novo Filamento
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Adicionar ao catálogo
                        </p>
                      </div>
                    </div>
                  </button>
                </Link>
              </div>
            </div>
          </Card>

          {/* System Status */}
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Status do Sistema
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      API Status
                    </span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Online
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Banco de Dados
                    </span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Conectado
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Backup
                    </span>
                  </div>
                  <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    12h atrás
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </AnimatedContainer>
    </AnimatedContainer>
  )
}