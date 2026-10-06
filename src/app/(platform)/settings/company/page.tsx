'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, Building2 } from 'lucide-react'
import { CDNImage } from '@/components/ui/cdn-image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { companySchema, type CompanyFormData } from '@/lib/validations/company'
import { useCompanyStore } from '@/stores/company-store'
import { LoadingSkeleton } from '@/components/common/loading-skeleton'

export default function CompanySettingsPage() {
  const { company, isLoading, fetchCompany, updateCompany, uploadLogo } = useCompanyStore()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      trade_name: '',
      email: '',
      phone: '',
      whatsapp: '',
      instagram: '',
      website: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      default_tax_rate: undefined,
    },
  })

  useEffect(() => {
    fetchCompany()
  }, [fetchCompany])

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || '',
        trade_name: company.trade_name || '',
        email: company.email || '',
        phone: company.phone || '',
        whatsapp: company.whatsapp || '',
        instagram: company.instagram || '',
        website: company.website || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip_code: company.zip_code || '',
        default_tax_rate: company.default_tax_rate ?? undefined,
      })
      if (company.logo_url) {
        setLogoPreview(company.logo_url)
      }
    }
  }, [company, form])

  const onSubmit = async (data: CompanyFormData) => {
    await updateCompany(data)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return

    try {
      setIsUploadingLogo(true)
      await uploadLogo(logoFile)
      setLogoFile(null)
    } catch (error) {
      // Error already handled by store
    } finally {
      setIsUploadingLogo(false)
    }
  }

  if (isLoading && !company) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Configurações da Empresa</h1>
        </div>
        <LoadingSkeleton count={3} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Configurações da Empresa</h1>
        <p className="text-neutral-600 mt-2">
          Gerencie as informações da sua empresa
        </p>
      </div>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Logo da Empresa</CardTitle>
          <CardDescription>
            Faça upload do logo da sua empresa (PNG, JPG - máx 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50">
              {logoPreview ? (
                logoFile ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-full w-full object-contain rounded-lg"
                  />
                ) : (
                  <CDNImage
                    key={`logo-preview-${logoPreview}-${Date.now()}`}
                    src={logoPreview}
                    alt="Logo"
                    width={96}
                    height={96}
                    className="h-full w-full object-contain rounded-lg"
                    fallback={<Building2 className="h-12 w-12 text-neutral-400" />}
                  />
                )
              ) : (
                <Building2 className="h-12 w-12 text-neutral-400" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoChange}
                disabled={isUploadingLogo}
              />
              {logoFile && (
                <Button
                  onClick={handleLogoUpload}
                  disabled={isUploadingLogo}
                  size="sm"
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {isUploadingLogo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Upload className="mr-2 h-4 w-4" />
                  Fazer Upload
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Atualize os dados cadastrais da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trade_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-neutral-900">Contatos</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Número com DDD (ex: 11999999999)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="@empresa" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-neutral-900">Endereço</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado (UF)</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={2} placeholder="SP" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Fiscal */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-neutral-900">Fiscal</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="default_tax_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alíquota padrão de imposto (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="99.99"
                            placeholder="Ex: 6"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === '' ? 0 : Number(e.target.value)
                              )
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          Aplicada por dentro do preço; ex.: Simples Nacional 6%. Usada nos
                          orçamentos quando nenhuma alíquota específica é informada.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

