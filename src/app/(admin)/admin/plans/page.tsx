'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus,
  Crown,
  Star,
  Zap,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  useAllPlans, 
  useCreatePlan, 
  useUpdatePlan, 
  useDeletePlan 
} from '@/lib/hooks/use-subscription-plans'
import type { CreatePlanRequest, UpdatePlanRequest } from '@/services/subscription-plans-service'
import type { SubscriptionPlanModel } from '@/types/models'
import Link from 'next/link'

const planSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  cycle: z.enum(['MONTHLY', 'YEARLY', 'CUSTOM']),
  features: z.array(z.object({
    name: z.string(),
    description: z.string()
  })).min(1, 'Adicione pelo menos um recurso'),
  is_active: z.boolean().default(true),
})

export default function AdminPlansPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanModel | null>(null)
  const [newFeature, setNewFeature] = useState('')

  const { data: plansData, isLoading } = useAllPlans()
  const createPlanMutation = useCreatePlan()
  const updatePlanMutation = useUpdatePlan()
  const deletePlanMutation = useDeletePlan()

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      cycle: 'MONTHLY',
      features: [],
      is_active: true,
    },
  })

  const formatCurrency = (reais: number) => {
    return `R$ ${reais.toFixed(2).replace('.', ',')}`
  }

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('enterprise')) return <Crown className="h-5 w-5 text-yellow-600" />
    if (name.includes('pro')) return <Star className="h-5 w-5 text-blue-600" />
    return <Zap className="h-5 w-5 text-green-600" />
  }

  const onSubmit = async (values: z.infer<typeof planSchema>) => {
    try {
      if (editingPlan) {
        await updatePlanMutation.mutateAsync({
          id: editingPlan.id,
          updates: values as UpdatePlanRequest,
        })
      } else {
        await createPlanMutation.mutateAsync(values as CreatePlanRequest)
      }
      
      setShowCreateModal(false)
      setEditingPlan(null)
      form.reset()
    } catch (error) {
      // Error handled by mutations
    }
  }

  const handleEdit = (plan: SubscriptionPlanModel) => {
    setEditingPlan(plan)
    form.reset({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      cycle: plan.cycle,
      features: plan.features.map(f => ({ name: f.name, description: f.description })),
      is_active: plan.is_active,
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (planId: string) => {
    if (confirm('Tem certeza que deseja deletar este plano?')) {
      await deletePlanMutation.mutateAsync(planId)
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = form.getValues('features')
      const name = newFeature.toLowerCase().replace(/\s+/g, '_')
      form.setValue('features', [...currentFeatures, { name, description: newFeature.trim() }])
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues('features')
    form.setValue('features', currentFeatures.filter((_, i) => i !== index))
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingPlan(null)
    form.reset()
  }

  const plans = plansData?.plans || []

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary-500" />
            Gerenciar Planos
          </h1>
          <p className="text-neutral-600 mt-1">
            Crie e gerencie os planos de assinatura disponíveis
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-primary-500 hover:bg-primary-600">
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
              </DialogTitle>
              <DialogDescription>
                {editingPlan 
                  ? 'Atualize as informações do plano de assinatura'
                  : 'Configure um novo plano de assinatura para seus clientes'
                }
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Plano</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Profissional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cycle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciclo de Cobrança</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o plano..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Math.round(parseFloat(e.target.value || '0') * 100))}
                            value={field.value ? (field.value / 100).toFixed(2) : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                </div>

                {/* Features */}
                <div>
                  <FormLabel>Recursos do Plano</FormLabel>
                  <div className="space-y-2 mt-2">
                    {form.watch('features').map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-neutral-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{feature.description}</p>
                          <p className="text-xs text-neutral-500">{feature.name}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicionar recurso..."
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <Button type="button" onClick={addFeature} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Plano Ativo</FormLabel>
                        <p className="text-sm text-neutral-600">
                          Planos inativos não aparecem para novos clientes
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    {(createPlanMutation.isPending || updatePlanMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingPlan ? 'Atualizando...' : 'Criando...'}
                      </>
                    ) : (
                      editingPlan ? 'Atualizar Plano' : 'Criar Plano'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os planos disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : plans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trial</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <Link href={`/admin/plans/${plan.id}`} className="block hover:bg-neutral-50 -m-2 p-2 rounded">
                        <div className="flex items-center gap-3">
                          {getPlanIcon(plan.name)}
                          <div>
                            <p className="font-medium text-blue-600 hover:text-blue-700">{plan.name}</p>
                            <p className="text-sm text-neutral-500">
                              {plan.description || 'Sem descrição'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      {plan.price === 0 ? 'Gratuito' : formatCurrency(plan.price)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {plan.cycle === 'MONTHLY' ? 'Mensal' : plan.cycle === 'YEARLY' ? 'Anual' : 'Customizado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const maxUsersFeature = plan.features.find(f => f.name === 'max_users')
                        if (maxUsersFeature) {
                          const match = maxUsersFeature.description.match(/\d+/)
                          return match ? `${match[0]} usuários` : 'Limitado'
                        }
                        const unlimitedUsersFeature = plan.features.find(f => f.name === 'unlimited_users')
                        return unlimitedUsersFeature ? 'Ilimitado' : '—'
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge className={plan.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {plan.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const trialFeature = plan.features.find(f => f.name === 'trial_period')
                        if (trialFeature) {
                          const match = trialFeature.description.match(/\d+/)
                          return match ? `${match[0]} dias` : 'Trial'
                        }
                        return '—'
                      })()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(plan)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(plan.id)}
                            disabled={deletePlanMutation.isPending}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <DollarSign className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
              <p className="font-medium">Nenhum plano cadastrado</p>
              <p className="text-sm mt-1">
                Crie seu primeiro plano de assinatura
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}