'use client'

import { useProfiles } from '@/lib/hooks/use-profiles'
import { PresetSelectBase, type PresetSelectProps } from './preset-select-base'

export function ProfileSelect({
  label = 'Perfil de impressão',
  placeholder = 'Selecione um perfil',
  ...props
}: PresetSelectProps) {
  const { data: profiles, isLoading } = useProfiles()

  return (
    <PresetSelectBase
      {...props}
      label={label}
      placeholder={placeholder}
      isLoading={isLoading}
      options={profiles?.map((profile) => ({
        id: profile.id,
        label: profile.name,
        isDefault: profile.is_default,
      }))}
      emptyHint="Nenhum perfil cadastrado. Crie um em Presets → Perfis de impressão."
    />
  )
}
