import { Button } from '@/components/ui'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Bem-vindo ao <span className="text-brand-500">SpoolIQ</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Sistema completo de gestão e cálculo de custos para impressão 3D.
              Gerencie filamentos, crie orçamentos precisos e calcule custos detalhados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-airbnb-lg shadow-airbnb-md border border-gray-100 dark:border-gray-700 hover:shadow-airbnb-lg hover:border-brand-200 dark:hover:border-brand-600 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Gestão de Filamentos
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Catálogo global e pessoal de filamentos com preços atualizados
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-airbnb-lg shadow-airbnb-md border border-gray-100 dark:border-gray-700 hover:shadow-airbnb-lg hover:border-accent-200 dark:hover:border-accent-600 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Orçamentos Precisos
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Crie orçamentos detalhados considerando todos os fatores de custo
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-airbnb-lg shadow-airbnb-md border border-gray-100 dark:border-gray-700 hover:shadow-airbnb-lg hover:border-success-200 dark:hover:border-success-600 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path d="M1 3a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3a1 1 0 000 2H1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Cálculos Avançados
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Engine de cálculo considerando material, energia, desgaste e mão de obra
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="min-w-[200px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                Fazer Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="min-w-[200px] border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
