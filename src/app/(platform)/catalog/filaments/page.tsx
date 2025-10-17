'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useFilaments, useCreateFilament, useUpdateFilament, useDeleteFilament } from '@/lib/hooks/use-filaments';
import { useBrands } from '@/lib/hooks/use-brands';
import { useMaterials } from '@/lib/hooks/use-materials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from '@/components/common/loading-skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { useConfirmation } from '@/lib/hooks/use-confirmation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFilamentSchema, updateFilamentSchema } from '@/lib/validations/catalog';
import type { Filament, ColorType, ColorData } from '@/types/models';
import { z } from 'zod';
import { toast } from 'sonner';
import { ColorPicker } from '@/components/form/color-picker';
import { getColorPreviewStyle } from '@/lib/utils/format';

type CreateFilamentForm = z.infer<typeof createFilamentSchema>;
type UpdateFilamentForm = z.infer<typeof updateFilamentSchema>;

export default function FilamentsPage() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);

  const { data: filamentsData, isLoading } = useFilaments({ pageSize: 50 });
  const { data: brandsData } = useBrands({ pageSize: 100 });
  const { data: materialsData } = useMaterials({ pageSize: 100 });
  const { mutate: createFilament, isPending: isCreating } = useCreateFilament();
  const { mutate: updateFilament, isPending: isUpdating } = useUpdateFilament();
  const { mutate: deleteFilament, isPending: isDeleting } = useDeleteFilament();

  const { isOpen, confirm, handleConfirm, handleCancel } = useConfirmation();

  const filaments = filamentsData?.data || [];
  const brands = brandsData?.data || [];
  const materials = materialsData?.data || [];

  // Filter filaments based on search
  const filteredFilaments = filaments.filter((filament) =>
    filament.name.toLowerCase().includes(search.toLowerCase()) ||
    filament.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
    filament.material_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Create form
  const createForm = useForm<CreateFilamentForm>({
    resolver: zodResolver(createFilamentSchema),
    defaultValues: {
      name: '',
      brand_id: '',
      material_id: '',
      color_type: 'solid',
      color_data: { color: '#000000' },
      diameter: 1.75,
      price_per_kg: 0,
      description: '',
    },
  });

  // Edit form
  const editForm = useForm<UpdateFilamentForm>({
    resolver: zodResolver(updateFilamentSchema),
  });

  // Handle create
  const handleCreate = (data: CreateFilamentForm) => {
    createFilament(data, {
      onSuccess: () => {
        toast.success('Filamento criado com sucesso!');
        setIsCreateOpen(false);
        createForm.reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao criar filamento');
      },
    });
  };

  // Handle edit
  const handleEdit = (data: UpdateFilamentForm) => {
    if (!editingFilament) return;

    updateFilament(
      { id: editingFilament.id, data },
      {
        onSuccess: () => {
          toast.success('Filamento atualizado com sucesso!');
          setIsEditOpen(false);
          setEditingFilament(null);
          editForm.reset();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error || 'Erro ao atualizar filamento');
        },
      }
    );
  };

  // Handle delete
  const handleDelete = (id: string) => {
    confirm(() => {
      deleteFilament(id, {
        onSuccess: () => {
          toast.success('Filamento deletado com sucesso!');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error || 'Erro ao deletar filamento');
        },
      });
    });
  };

  // Open edit dialog
  const openEditDialog = (filament: Filament) => {
    setEditingFilament(filament);
    editForm.reset({
      name: filament.name,
      brand_id: filament.brand_id,
      material_id: filament.material_id,
      color_type: filament.color_type,
      color_data: filament.color_data,
      diameter: filament.diameter,
      price_per_kg: filament.price_per_kg,
      description: filament.description || '',
    });
    setIsEditOpen(true);
  };

  // Format price
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Filamentos</h1>
          <p className="text-neutral-600 mt-2">Gerencie seu catálogo de filamentos</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary-500 hover:bg-primary-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Filamento
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Buscar filamentos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : filteredFilaments.length === 0 ? (
        <EmptyState
          title="Nenhum filamento encontrado"
          description={search ? 'Tente buscar por outro termo' : 'Comece criando seu primeiro filamento'}
          action={
            !search ? (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Filamento
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cor</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Diâmetro</TableHead>
                <TableHead>Preço/kg</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFilaments.map((filament) => (
                <TableRow key={filament.id}>
                  <TableCell>
                    <div
                      className="w-10 h-10 rounded-md border border-neutral-200"
                      style={getColorPreviewStyle(filament.color_type, filament.color_data)}
                      title={`Tipo: ${filament.color_type}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{filament.name}</TableCell>
                  <TableCell>{filament.brand_name || '-'}</TableCell>
                  <TableCell>{filament.material_name || '-'}</TableCell>
                  <TableCell>{filament.diameter}mm</TableCell>
                  <TableCell>{formatPrice(filament.price_per_kg)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(filament)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(filament.id)}
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Filamento</DialogTitle>
            <DialogDescription>
              Adicione um novo filamento ao seu catálogo
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="create-name">Nome *</Label>
              <Input
                id="create-name"
                {...createForm.register('name')}
                placeholder="Ex: PLA+ Rosa Translúcido"
              />
              {createForm.formState.errors.name && (
                <p className="text-sm text-error">{createForm.formState.errors.name.message}</p>
              )}
            </div>

            {/* Marca e Material */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-brand">Marca *</Label>
                <Select
                  value={createForm.watch('brand_id')}
                  onValueChange={(value) => createForm.setValue('brand_id', value)}
                >
                  <SelectTrigger id="create-brand">
                    <SelectValue placeholder="Selecione uma marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createForm.formState.errors.brand_id && (
                  <p className="text-sm text-error">{createForm.formState.errors.brand_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-material">Material *</Label>
                <Select
                  value={createForm.watch('material_id')}
                  onValueChange={(value) => createForm.setValue('material_id', value)}
                >
                  <SelectTrigger id="create-material">
                    <SelectValue placeholder="Selecione um material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createForm.formState.errors.material_id && (
                  <p className="text-sm text-error">{createForm.formState.errors.material_id.message}</p>
                )}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Cor *</Label>
              <ColorPicker
                colorType={createForm.watch('color_type') as ColorType}
                colorData={createForm.watch('color_data') as ColorData}
                onColorTypeChange={(type) => createForm.setValue('color_type', type)}
                onColorDataChange={(data) => createForm.setValue('color_data', data)}
              />
            </div>

            {/* Diâmetro e Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-diameter">Diâmetro *</Label>
                <Select
                  value={String(createForm.watch('diameter'))}
                  onValueChange={(value) => createForm.setValue('diameter', Number(value) as 1.75 | 2.85)}
                >
                  <SelectTrigger id="create-diameter">
                    <SelectValue placeholder="Selecione o diâmetro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.75">1.75mm</SelectItem>
                    <SelectItem value="2.85">2.85mm</SelectItem>
                  </SelectContent>
                </Select>
                {createForm.formState.errors.diameter && (
                  <p className="text-sm text-error">{createForm.formState.errors.diameter.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-price">Preço por kg (R$) *</Label>
                <Input
                  id="create-price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...createForm.register('price_per_kg', { valueAsNumber: true })}
                  placeholder="Ex: 75.00"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    createForm.setValue('price_per_kg', Math.round(value * 100));
                  }}
                  value={createForm.watch('price_per_kg') ? (createForm.watch('price_per_kg') / 100).toFixed(2) : ''}
                />
                {createForm.formState.errors.price_per_kg && (
                  <p className="text-sm text-error">{createForm.formState.errors.price_per_kg.message}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="create-description">Descrição</Label>
              <Input
                id="create-description"
                {...createForm.register('description')}
                placeholder="Opcional"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  createForm.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Criando...' : 'Criar Filamento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Filamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do filamento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                {...editForm.register('name')}
                placeholder="Ex: PLA+ Rosa Translúcido"
              />
              {editForm.formState.errors.name && (
                <p className="text-sm text-error">{editForm.formState.errors.name.message}</p>
              )}
            </div>

            {/* Marca e Material */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Marca *</Label>
                <Select
                  value={editForm.watch('brand_id')}
                  onValueChange={(value) => editForm.setValue('brand_id', value)}
                >
                  <SelectTrigger id="edit-brand">
                    <SelectValue placeholder="Selecione uma marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editForm.formState.errors.brand_id && (
                  <p className="text-sm text-error">{editForm.formState.errors.brand_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-material">Material *</Label>
                <Select
                  value={editForm.watch('material_id')}
                  onValueChange={(value) => editForm.setValue('material_id', value)}
                >
                  <SelectTrigger id="edit-material">
                    <SelectValue placeholder="Selecione um material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editForm.formState.errors.material_id && (
                  <p className="text-sm text-error">{editForm.formState.errors.material_id.message}</p>
                )}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Cor *</Label>
              <ColorPicker
                colorType={editForm.watch('color_type') as ColorType}
                colorData={editForm.watch('color_data') as ColorData}
                onColorTypeChange={(type) => editForm.setValue('color_type', type)}
                onColorDataChange={(data) => editForm.setValue('color_data', data)}
              />
            </div>

            {/* Diâmetro e Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-diameter">Diâmetro *</Label>
                <Select
                  value={String(editForm.watch('diameter'))}
                  onValueChange={(value) => editForm.setValue('diameter', Number(value) as 1.75 | 2.85)}
                >
                  <SelectTrigger id="edit-diameter">
                    <SelectValue placeholder="Selecione o diâmetro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.75">1.75mm</SelectItem>
                    <SelectItem value="2.85">2.85mm</SelectItem>
                  </SelectContent>
                </Select>
                {editForm.formState.errors.diameter && (
                  <p className="text-sm text-error">{editForm.formState.errors.diameter.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Preço por kg (R$) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...editForm.register('price_per_kg', { valueAsNumber: true })}
                  placeholder="Ex: 75.00"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    editForm.setValue('price_per_kg', Math.round(value * 100));
                  }}
                  value={editForm.watch('price_per_kg') ? (editForm.watch('price_per_kg') / 100).toFixed(2) : ''}
                />
                {editForm.formState.errors.price_per_kg && (
                  <p className="text-sm text-error">{editForm.formState.errors.price_per_kg.message}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                {...editForm.register('description')}
                placeholder="Opcional"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingFilament(null);
                  editForm.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Deletar Filamento"
        description="Tem certeza que deseja deletar este filamento? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

