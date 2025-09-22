'use client'

import { useState } from 'react'
import { Settings, Save, User, Bell, Shield, Palette, Zap, Battery, Cog, DollarSign, TrendingUp } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const isAdmin = user?.role === "admin"

  const handleSave = () => {
    setIsLoading(true)
    // Simulate save
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Categorias
              </h3>
              <nav className="space-y-2">
                <a href="#profile" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200">
                  <User className="w-4 h-4 mr-3" />
                  Perfil
                </a>
                <a href="#notifications" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                  <Bell className="w-4 h-4 mr-3" />
                  Notificações
                </a>
                <a href="#security" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                  <Shield className="w-4 h-4 mr-3" />
                  Segurança
                </a>
                <a href="#appearance" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                  <Palette className="w-4 h-4 mr-3" />
                  Aparência
                </a>
                <a href="#api" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                  <Zap className="w-4 h-4 mr-3" />
                  API
                </a>
                {isAdmin && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Administração
                      </p>
                    </div>
                    <Link href="/settings/energy" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                      <Battery className="w-4 h-4 mr-3" />
                      Presets de Energia
                    </Link>
                    <Link href="/settings/machines" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                      <Cog className="w-4 h-4 mr-3" />
                      Presets de Máquina
                    </Link>
                    <Link href="/settings/cost" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                      <DollarSign className="w-4 h-4 mr-3" />
                      Presets de Custo
                    </Link>
                    <Link href="/settings/margin" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                      <TrendingUp className="w-4 h-4 mr-3" />
                      Presets de Margem
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card id="profile">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Perfil
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    defaultValue={user?.name || ''}
                    placeholder="Seu nome completo"
                  />
                  <Input
                    label="Email"
                    type="email"
                    defaultValue={user?.email || ''}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Input
                    label="Empresa (opcional)"
                    placeholder="Nome da sua empresa"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card id="notifications">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Bell className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Notificações
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Notificações por email
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receba atualizações importantes por email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Relatórios semanais
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Resumo semanal da sua atividade
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card id="security">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Shield className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Segurança
                </h3>
              </div>

              <div className="space-y-4">
                <Button variant="outline" fullWidth className="justify-start">
                  Alterar senha
                </Button>
                <Button variant="outline" fullWidth className="justify-start">
                  Gerenciar sessões ativas
                </Button>
                <Button variant="outline" fullWidth className="justify-start">
                  Configurar autenticação em duas etapas
                </Button>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              isLoading={isLoading}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}