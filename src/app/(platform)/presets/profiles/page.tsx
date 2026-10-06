'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Layers, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { DefaultBadge } from '@/components/presets/default-badge'
import { PresetNameField } from '@/components/presets/preset-name-field'
import { PresetRowActions } from '@/components/presets/preset-row-actions'
import { MachinePresetSelect } from '@/components/presets/machine-preset-select'
import { EnergyPresetSelect } from '@/components/presets/energy-preset-select'
import { CostPresetSelect } from '@/components/presets/cost-preset-select'
import {
  useProfiles,
  useCreateProfile,
  useUpdateProfile,
  useDeleteProfile,
  useSetDefaultProfile,
  useDuplicateProfile,
} from '@/lib/hooks/use-profiles'
import { useCanManageDefaults } from '@/lib/hooks/use-can-manage-defaults'
import {
  normalizeOptionalName,
  profileSchema,
  type ProfileFormData,
} from '@/lib/validations/preset'
import type { PrintProfile } from '@/types/models'

const EMPTY_FORM: ProfileFormData = {
  name: '',
  description: '',
  machine_preset_id: '',
  energy_preset_id: '',
  cost_preset_id: undefined,
  is_default: false,
}

export default function PrintProfilesPage() {
  const { data: profiles, isLoading } = useProfiles()
  const { mutate: createProfile, isPending: isCreating } = useCreateProfile()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const { mutate: deleteProfile } = useDeleteProfile()
  const { mutate: setDefaultProfile, isPending: isSettingDefault } = useSetDefaultProfile()
  const { mutate: duplicateProfile, isPending: isDuplicating } = useDuplicateProfile()
  const canManageDefaults = useCanManageDefaults()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<PrintProfile | null>(null)
  const [deletingProfile, setDeletingProfile] = useState<PrintProfile | null>(null)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: EMPTY_FORM,
  })

  const handleOpenCreate = () => {
    setEditingProfile(null)
    // Suggest making the very first profile the default.
    form.reset({ ...EMPTY_FORM, is_default: canManageDefaults && (profiles?.length ?? 0) === 0 })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (profile: PrintProfile) => {
    setEditingProfile(profile)
    form.reset({
      name: profile.name,
      description: profile.description ?? '',
      machine_preset_id: profile.machine_preset.id,
      energy_preset_id: profile.energy_preset.id,
      cost_preset_id: profile.cost_preset?.id ?? undefined,
      is_default: profile.is_default,
    })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    form.reset(EMPTY_FORM)
  }

  const handleSubmit = (formData: ProfileFormData) => {
    const data = {
      ...formData,
      name: normalizeOptionalName(formData.name),
      description: formData.description?.trim() || undefined,
      // Only Owner/OrgAdmin may change the default; never send it otherwise.
      is_default: canManageDefaults ? formData.is_default : undefined,
    }

    if (editingProfile) {
      // Unchecking "padrão" on the current default is a no-op: pick another default instead.
      if (editingProfile.is_default && data.is_default === false) data.is_default = undefined
      updateProfile({ id: editingProfile.id, data }, { onSuccess: closeDialog })
    } else {
      createProfile(data, { onSuccess: closeDialog })
    }
  }

  const handleDelete = () => {
    if (deletingProfile) {
      deleteProfile(deletingProfile.id)
      setDeletingProfile(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Card>
          <CardContent className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const isSaving = isCreating || isUpdating

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Perfis de impressão</h1>
          <p className="text-neutral-600 mt-1">
            Combine máquina, energia e custos em um perfil para usar nos orçamentos
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary-500 hover:bg-primary-600">
          <Plus className="mr-2 h-4 w-4" />
          Novo Perfil
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {!profiles || profiles.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Layers}
                title="Nenhum perfil encontrado"
                description="Crie um perfil para preencher automaticamente os presets ao montar orçamentos"
                action={
                  <Button
                    onClick={handleOpenCreate}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Perfil
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Energia</TableHead>
                  <TableHead>Custos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{profile.name}</p>
                        {profile.is_default && <DefaultBadge />}
                      </div>
                      {profile.description && (
                        <p className="text-xs text-neutral-500">{profile.description}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {profile.machine_preset.name || '—'}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {profile.energy_preset.name || '—'}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {profile.cost_preset?.name || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <PresetRowActions
                        noun="perfil"
                        itemLabel={profile.name}
                        isDefault={profile.is_default}
                        canManageDefaults={canManageDefaults}
                        onEdit={() => handleOpenEdit(profile)}
                        onDuplicate={() => duplicateProfile(profile.id)}
                        onSetDefault={() => setDefaultProfile(profile.id)}
                        onDelete={() => setDeletingProfile(profile)}
                        isBusy={isSettingDefault || isDuplicating}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProfile ? 'Editar Perfil' : 'Novo Perfil'}</DialogTitle>
            <DialogDescription>
              Os presets do perfil são aplicados automaticamente nos novos orçamentos
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <PresetNameField
                  id="profile-name"
                  label="Nome do Perfil"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  fallbackPlaceholder="Ex: Bambu X1 · Tarifa residencial"
                />
              )}
            />

            <div>
              <Label htmlFor="profile-description">Descrição</Label>
              <Textarea
                id="profile-description"
                rows={2}
                placeholder="Ex: Perfil para peças grandes em PETG"
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="machine_preset_id"
                render={({ field, fieldState }) => (
                  <MachinePresetSelect
                    id="profile-machine-preset"
                    label="Máquina *"
                    placeholder="Selecione a máquina"
                    noneLabel={null}
                    value={field.value || undefined}
                    onChange={(value) => field.onChange(value ?? '')}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="energy_preset_id"
                render={({ field, fieldState }) => (
                  <EnergyPresetSelect
                    id="profile-energy-preset"
                    label="Energia *"
                    placeholder="Selecione o preset de energia"
                    noneLabel={null}
                    value={field.value || undefined}
                    onChange={(value) => field.onChange(value ?? '')}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="cost_preset_id"
              render={({ field }) => (
                <CostPresetSelect
                  id="profile-cost-preset"
                  label="Custos (opcional)"
                  placeholder="Selecione o preset de custo"
                  noneLabel={editingProfile?.cost_preset ? null : 'Nenhum'}
                  value={field.value}
                  onChange={field.onChange}
                  description="Usado para overhead e margem de lucro dos orçamentos"
                />
              )}
            />

            {canManageDefaults && (
              <Controller
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="profile-is-default"
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      disabled={editingProfile?.is_default}
                      aria-describedby="profile-is-default-help"
                    />
                    <div className="grid gap-1">
                      <label htmlFor="profile-is-default" className="text-sm font-medium leading-none">
                        Perfil padrão
                      </label>
                      <p id="profile-is-default-help" className="text-xs text-neutral-500">
                        {editingProfile?.is_default
                          ? 'Este já é o perfil padrão. Para trocar, defina outro perfil como padrão.'
                          : 'Pré-selecionado ao criar novos orçamentos.'}
                      </p>
                    </div>
                  </div>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingProfile}
        onOpenChange={(open) => !open && setDeletingProfile(null)}
        title="Excluir perfil"
        description={
          deletingProfile
            ? `Tem certeza que deseja excluir o perfil "${deletingProfile.name}"? Orçamentos existentes não são afetados.`
            : 'Tem certeza que deseja excluir este perfil?'
        }
        onConfirm={handleDelete}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  )
}
