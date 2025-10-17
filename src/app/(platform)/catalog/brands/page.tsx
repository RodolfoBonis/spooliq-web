'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, AlertTriangle, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/common/confirmation-dialog'
import { TableSkeleton } from '@/components/common/loading-skeleton'
import { EmptyState } from '@/components/common/empty-state'

import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/lib/hooks/use-brands'
import { brandSchema, type BrandFormData } from '@/lib/validations/catalog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Brand } from '@/types/models'

export default function BrandsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useBrands({ search, page: 1, pageSize: 50 })
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand()
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand()
  const { mutate: deleteBrand, isPending: isDeleting } = useDeleteBrand()

  const [showDialog, setShowDialog] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const handleOpenCreate = () => {
    setEditingBrand(null)
    form.reset({
      name: '',
      description: '',
    })
    setShowDialog(true)
  }

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand)
    form.reset({
      name: brand.name,
      description: brand.description || '',
    })
    setShowDialog(true)
  }

  const onSubmit = (data: BrandFormData) => {
    if (editingBrand) {
      updateBrand(
        { id: editingBrand.id, data },
        {
          onSuccess: () => {
            setShowDialog(false)
            form.reset()
          },
        }
      )
    } else {
      createBrand(data, {
        onSuccess: () => {
          setShowDialog(false)
          form.reset()
        },
      })
    }
  }

  const handleDelete = () => {
    if (!brandToDelete) return
    deleteBrand(brandToDelete.id)
    setBrandToDelete(null)
  }

  const brands = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Marcas</h1>
          <p className="text-neutral-600 mt-2">
            Gerencie as marcas de filamentos disponíveis
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-primary-500 hover:bg-primary-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Marca
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar marcas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} columns={4} />
      ) : brands.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhuma marca encontrada"
          description="Comece adicionando marcas de filamentos para organizar seu catálogo"
          action={
            <Button
              onClick={handleOpenCreate}
              className="bg-primary-500 hover:bg-primary-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Marca
            </Button>
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {brand.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(brand)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBrandToDelete(brand)}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? 'Editar Marca' : 'Nova Marca'}
            </DialogTitle>
            <DialogDescription>
              {editingBrand
                ? 'Atualize as informações da marca'
                : 'Adicione uma nova marca de filamentos'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Bambu Lab, Creality, eSun"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Breve descrição da marca"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={isCreating || isUpdating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {isCreating || isUpdating ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!brandToDelete}
        onOpenChange={(open) => !open && setBrandToDelete(null)}
        onConfirm={handleDelete}
        title="Deletar Marca"
        description={`Tem certeza que deseja deletar a marca "${brandToDelete?.name}"? Esta ação não pode ser desfeita e todos os filamentos desta marca serão afetados.`}
        confirmText="Sim, deletar"
        cancelText="Cancelar"
        variant="danger"
        icon={AlertTriangle}
        isLoading={isDeleting}
      />
    </div>
  )
}

