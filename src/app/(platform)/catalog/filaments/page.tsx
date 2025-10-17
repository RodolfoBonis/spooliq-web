'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Grid3x3, List, Filter } from 'lucide-react';
import { useFilaments, useCreateFilament, useUpdateFilament, useDeleteFilament } from '@/lib/hooks/use-filaments';
import { useBrands } from '@/lib/hooks/use-brands';
import { useMaterials } from '@/lib/hooks/use-materials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
type ViewMode = 'list' | 'grid';

export default function FilamentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [diameterFilter, setDiameterFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);
  const [createColorName, setCreateColorName] = useState('');
  const [editColorName, setEditColorName] = useState('');
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const [showFab, setShowFab] = useState(false);
  
  const filterRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const { data: filamentsData, isLoading } = useFilaments({ 
    search,
    brand_id: brandFilter && brandFilter !== 'all' ? brandFilter : undefined,
    material_id: materialFilter && materialFilter !== 'all' ? materialFilter : undefined,
    pageSize: 50 
  });
  const { data: brandsData } = useBrands({ pageSize: 100 });
  const { data: materialsData } = useMaterials({ pageSize: 100 });
  const { mutate: createFilament, isPending: isCreating } = useCreateFilament();
  const { mutate: updateFilament, isPending: isUpdating } = useUpdateFilament();
  const { mutate: deleteFilament, isPending: isDeleting } = useDeleteFilament();

  const { isOpen, confirm, handleConfirm, handleCancel } = useConfirmation();

  const filaments = filamentsData?.data || [];
  const brands = brandsData?.data || [];
  const materials = materialsData?.data || [];

  // Handle sticky filter and FAB on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        const rect = filterRef.current.getBoundingClientRect();
        setIsFilterSticky(rect.top <= 0);
      }
      
      if (headerRef.current) {
        const headerRect = headerRef.current.getBoundingClientRect();
        // Show FAB when header button is out of view
        setShowFab(headerRect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter by diameter locally
  const filteredFilaments = diameterFilter && diameterFilter !== 'all'
    ? filaments.filter(f => f.diameter === parseFloat(diameterFilter))
    : filaments;

  // Create form
  const createForm = useForm<CreateFilamentForm>({
    resolver: zodResolver(createFilamentSchema),
    defaultValues: {
      name: '',
      brand_id: '',
      material_id: '',
      color: '',
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
        setCreateColorName('');
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
          setEditColorName('');
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
    setEditColorName(filament.color); // Initialize color name
    editForm.reset({
      name: filament.name,
      brand_id: filament.brand_id,
      material_id: filament.material_id,
      color: filament.color,
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

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setBrandFilter('');
    setMaterialFilter('');
    setDiameterFilter('');
  };

  const hasActiveFilters = search || (brandFilter && brandFilter !== 'all') || (materialFilter && materialFilter !== 'all') || (diameterFilter && diameterFilter !== 'all');

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Filamentos</h1>
          <p className="text-neutral-600">Gerencie seu catálogo de filamentos</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-primary-500 hover:bg-primary-600">
          <Plus className="mr-2 h-4 w-4" />
          Novo Filamento
        </Button>
      </div>

      {/* Filters */}
      <div 
        ref={filterRef}
        className={`sticky top-0 z-10 transition-all ${
          isFilterSticky 
            ? 'shadow-md -mx-6 px-6 bg-white' 
            : ''
        }`}
      >
        <Card className={isFilterSticky ? 'border-0 rounded-none' : ''}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Filtros</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="search"
                  placeholder="Nome do filamento..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-filter">Marca</Label>
              <Select value={brandFilter || undefined} onValueChange={setBrandFilter}>
                <SelectTrigger id="brand-filter">
                  <SelectValue placeholder="Todas as marcas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="material-filter">Material</Label>
              <Select value={materialFilter || undefined} onValueChange={setMaterialFilter}>
                <SelectTrigger id="material-filter">
                  <SelectValue placeholder="Todos os materiais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os materiais</SelectItem>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diameter-filter">Diâmetro</Label>
              <Select value={diameterFilter || undefined} onValueChange={setDiameterFilter}>
                <SelectTrigger id="diameter-filter">
                  <SelectValue placeholder="Todos os diâmetros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os diâmetros</SelectItem>
                  <SelectItem value="1.75">1.75mm</SelectItem>
                  <SelectItem value="2.85">2.85mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          {filteredFilaments.length} {filteredFilaments.length === 1 ? 'filamento encontrado' : 'filamentos encontrados'}
        </p>
        <div className="flex gap-1 border rounded-lg p-1 bg-neutral-100">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Grade
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <TableSkeleton />
      ) : filteredFilaments.length === 0 ? (
        <EmptyState
          title="Nenhum filamento encontrado"
          description={hasActiveFilters ? "Tente ajustar os filtros de busca" : "Adicione seu primeiro filamento ao catálogo"}
          icon={Search}
          action={
            !hasActiveFilters ? (
              <Button onClick={() => setIsCreateOpen(true)} className="bg-primary-500 hover:bg-primary-600">
                <Plus className="mr-2 h-4 w-4" />
                Novo Filamento
              </Button>
            ) : undefined
          }
        />
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFilaments.map((filament) => (
            <Card key={filament.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-md border border-neutral-200 flex-shrink-0"
                    style={getColorPreviewStyle(filament.color_type, filament.color_data)}
                    title={`${filament.color} - ${filament.color_type}`}
                  />
                  <div className="flex gap-1">
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
                </div>
                <div className="space-y-1 mt-2">
                  <h3 className="font-semibold text-lg">{filament.name}</h3>
                  <p className="text-sm text-neutral-600">{filament.color}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Marca:</span>
                  <span className="font-medium">{filament.brand_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Material:</span>
                  <span className="font-medium">{filament.material_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Diâmetro:</span>
                  <span className="font-medium">{filament.diameter}mm</span>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {formatPrice(filament.price_per_kg)}
                    <span className="text-sm font-normal text-neutral-600">/kg</span>
                  </p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cor</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cor (Nome)</TableHead>
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
                      title={`${filament.color} - ${filament.color_type}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{filament.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      {filament.color}
                      <span className="text-xs text-neutral-500">({filament.color_type})</span>
                    </span>
                  </TableCell>
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={isOpen}
        onOpenChange={(open) => !open && handleCancel()}
        onConfirm={handleConfirm}
        title="Deletar filamento"
        description="Tem certeza que deseja deletar este filamento? Esta ação não pode ser desfeita."
        variant="danger"
        confirmText="Deletar"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />

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
                colorName={createColorName}
                onColorTypeChange={(type) => createForm.setValue('color_type', type)}
                onColorDataChange={(data) => createForm.setValue('color_data', data)}
                onColorNameChange={(name) => {
                  setCreateColorName(name);
                  createForm.setValue('color', name); // Sync with form
                }}
              />
              {createForm.formState.errors.color && (
                <p className="text-sm text-error">{createForm.formState.errors.color.message}</p>
              )}
            </div>

            {/* Diâmetro e Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-diameter">Diâmetro *</Label>
                <Select
                  value={String(createForm.watch('diameter'))}
                  onValueChange={(value) => createForm.setValue('diameter', parseFloat(value) as 1.75 | 2.85)}
                >
                  <SelectTrigger id="create-diameter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.75">1.75mm</SelectItem>
                    <SelectItem value="2.85">2.85mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-price">Preço por kg (R$) *</Label>
                <Input
                  id="create-price"
                  type="number"
                  step="0.01"
                  {...createForm.register('price_per_kg', { 
                    valueAsNumber: true,
                    setValueAs: (v) => Math.round(parseFloat(v) * 100) // Convert to cents
                  })}
                  placeholder="120.00"
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

      {/* Edit Dialog - Similar structure to Create Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Filamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do filamento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            {/* Same form fields as Create Dialog */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input id="edit-name" {...editForm.register('name')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Marca *</Label>
                <Select
                  value={editForm.watch('brand_id')}
                  onValueChange={(value) => editForm.setValue('brand_id', value)}
                >
                  <SelectTrigger id="edit-brand">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-material">Material *</Label>
                <Select
                  value={editForm.watch('material_id')}
                  onValueChange={(value) => editForm.setValue('material_id', value)}
                >
                  <SelectTrigger id="edit-material">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor *</Label>
              <ColorPicker
                colorType={editForm.watch('color_type') as ColorType}
                colorData={editForm.watch('color_data') as ColorData}
                colorName={editColorName}
                onColorTypeChange={(type) => editForm.setValue('color_type', type)}
                onColorDataChange={(data) => editForm.setValue('color_data', data)}
                onColorNameChange={(name) => {
                  setEditColorName(name);
                  editForm.setValue('color', name);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-diameter">Diâmetro *</Label>
                <Select
                  value={String(editForm.watch('diameter'))}
                  onValueChange={(value) => editForm.setValue('diameter', parseFloat(value) as 1.75 | 2.85)}
                >
                  <SelectTrigger id="edit-diameter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.75">1.75mm</SelectItem>
                    <SelectItem value="2.85">2.85mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Preço por kg (R$) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  {...editForm.register('price_per_kg', { 
                    valueAsNumber: true,
                    setValueAs: (v) => Math.round(parseFloat(v) * 100)
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input id="edit-description" {...editForm.register('description')} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsCreateOpen(true)}
        className={`fixed bottom-8 right-8 z-50 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 ${
          showFab 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-16 scale-0 pointer-events-none'
        }`}
        aria-label="Adicionar novo filamento"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
