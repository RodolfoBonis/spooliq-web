export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-2">
          Bem-vindo ao SpoolIQ! Aqui você terá uma visão geral dos seus orçamentos.
        </p>
      </div>

      {/* Placeholder content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Métrica {i}
                </p>
                <p className="text-2xl font-bold text-neutral-900 mt-2">--</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Atividade Recente
        </h2>
        <p className="text-neutral-600 text-sm">
          Nenhuma atividade recente. Comece criando seu primeiro orçamento!
        </p>
      </div>
    </div>
  )
}

