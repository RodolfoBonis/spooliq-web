'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Package, Edit, Trash2, Eye, Palette, Weight, DollarSign, ShoppingCart, ChevronDown, Check, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { Button, Card, Input, Badge, AnimatedContainer, StaggerContainer, StaggerItem } from '@/components/ui'
import { FilamentService } from '@/services/filament.service'
import {Filament, FilamentFilters, PaginatedResponse} from '@/types/api'
import { generateColorPreview } from '@/lib/color-utils'
import { formatCurrency } from '@/lib/utils'
import { useBrandNames } from '@/hooks/useBrands'
import { useMaterialNames } from '@/hooks/useMaterials'

export default function FilamentsPage() {
  const [filters, setFilters] = useState<FilamentFilters>({})
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'brand'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [urlFilter, setUrlFilter] = useState<'all' | 'with-url' | 'without-url'>('all')
  const [brandSearchTerm, setBrandSearchTerm] = useState('')
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const brandDropdownRef = useRef<HTMLDivElement>(null)
  const materialDropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Fetch dynamic brands and materials
  const { data: dynamicBrands = [], isLoading: brandsLoading } = useBrandNames()
  const { data: dynamicMaterials = [], isLoading: materialsLoading } = useMaterialNames()

  // State for material dropdown
  const [materialSearchTerm, setMaterialSearchTerm] = useState('')
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['filaments', filters, page],
    queryFn: () => FilamentService.getFilaments(filters, page, 12),
  })

  // Log data when it changes (replaces onSuccess)
  useEffect(() => {
    if (data) {
      console.log('Filaments data received:', data)
    }
  }, [data])

  // Log errors when they occur (replaces onError)
  useEffect(() => {
    if (error) {
      console.error('Filaments error:', error)
    }
  }, [error])

  const deleteMutation = useMutation({
    mutationFn: FilamentService.deleteFilament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filaments'] })
      toast.success('Filamento excluído com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir filamento')
    },
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o filamento "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleSearch = (search: string) => {
    setSearchTerm(search)
  }

  // Use dynamic brands from API instead of extracting from filaments
  const allBrands = useMemo(() => {
    return dynamicBrands.sort()
  }, [dynamicBrands])

  // Use dynamic materials from API
  const allMaterials = useMemo(() => {
    return dynamicMaterials.sort()
  }, [dynamicMaterials])

  // Filter brands for autocomplete
  const filteredBrands = useMemo(() => {
    if (!brandSearchTerm) return allBrands
    return allBrands.filter(brand =>
      brand.toLowerCase().includes(brandSearchTerm.toLowerCase())
    )
  }, [allBrands, brandSearchTerm])

  // Filter materials for autocomplete
  const filteredMaterials = useMemo(() => {
    if (!materialSearchTerm) return allMaterials
    return allMaterials.filter(material =>
      material.toLowerCase().includes(materialSearchTerm.toLowerCase())
    )
  }, [allMaterials, materialSearchTerm])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false)
      }
      if (materialDropdownRef.current && !materialDropdownRef.current.contains(event.target as Node)) {
        setShowMaterialDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Função para filtrar filamentos localmente
  const filteredFilaments = useMemo(() => {
    let filtered = data?.data?.filter((filament) => {
      // Filtro de busca por texto
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          filament.brand.toLowerCase().includes(searchLower) ||
          filament.name.toLowerCase().includes(searchLower) ||
          filament.material.toLowerCase().includes(searchLower) ||
          (filament.color && filament.color.toLowerCase().includes(searchLower))

        if (!matchesSearch) return false
      }

      // Filtro por materiais selecionados
      if (selectedMaterials.length > 0 && !selectedMaterials.includes(filament.material)) {
        return false
      }

      // Filtro por marcas selecionadas
      if (selectedBrands.length > 0 && !selectedBrands.includes(filament.brand)) {
        return false
      }

      // Filtro por preço
      if (minPrice && filament.price_per_kg < parseFloat(minPrice)) {
        return false
      }

      if (maxPrice && filament.price_per_kg > parseFloat(maxPrice)) {
        return false
      }

      // Filtro por URL
      if (urlFilter === 'with-url' && !filament.url) {
        return false
      }

      if (urlFilter === 'without-url' && filament.url) {
        return false
      }

      return true
    }) || []

    // Aplicar ordenação
    filtered = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'brand':
          aValue = a.brand.toLowerCase()
          bValue = b.brand.toLowerCase()
          break
        case 'price':
          aValue = a.price_per_kg
          bValue = b.price_per_kg
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [data?.data, searchTerm, selectedMaterials, selectedBrands, minPrice, maxPrice, urlFilter, sortBy, sortOrder])

  const handleMaterialFilter = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    )
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedMaterials([])
    setSelectedBrands([])
    setMinPrice('')
    setMaxPrice('')
    setBrandSearchTerm('')
    setMaterialSearchTerm('')
    setShowBrandDropdown(false)
    setShowMaterialDropdown(false)
    setUrlFilter('all')
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card variant="elevated" className="max-w-md mx-auto text-center">
          <div className="p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Erro ao carregar filamentos
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Não foi possível conectar com o servidor. Verifique sua conexão e tente novamente.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </Card>
      </div>
    )
  }


  // Helper function to generate color from string (fallback)
  const generateColorFromString = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }

    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 65%, 55%)`
  }

  // Helper function to get filament color display
  const getFilamentColorDisplay = (filament: Filament) => {
    // Priority: color_data (advanced), then color_hex (simple), then color_preview (backend), then generated
    if (filament.color_data && (filament.color_data.type || filament.color_type)) {
      // Se color_data não tem type, usar o color_type do nível superior
      const colorDataWithType = filament.color_data.type
        ? filament.color_data
        : { ...filament.color_data, type: filament.color_type }

      const isAdvanced = colorDataWithType.type && ['gradient', 'duo', 'rainbow'].includes(colorDataWithType.type)
      return {
        hasColor: true,
        background: generateColorPreview(colorDataWithType),
        isAdvanced: isAdvanced,
        type: colorDataWithType.type
      }
    } else if (filament.color_hex) {
      return {
        hasColor: true,
        background: filament.color_hex,
        isAdvanced: false,
        type: 'solid'
      }
    } else if (filament.color_preview) {
      const isAdvanced = filament.color_type && filament.color_type !== 'solid'
      return {
        hasColor: true,
        background: filament.color_preview,
        isAdvanced: isAdvanced,
        type: filament.color_type || 'solid'
      }
    } else {
      // Generate a color from the filament name/color if available
      const colorSource = filament.color || filament.name || 'default'
      return {
        hasColor: true,
        background: generateColorFromString(colorSource),
        isAdvanced: false,
        type: 'generated'
      }
    }
  }

  return (
    <AnimatedContainer animation="fadeIn" className="space-y-8">
      {/* Header Section */}
      <AnimatedContainer animation="slideUp" delay={0.1} className="relative">
        {/* Background decoration */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-500/10 dark:to-red-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-500/10 dark:to-blue-500/5 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Filamentos
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {searchTerm || selectedMaterials.length > 0 || selectedBrands.length > 0 || minPrice || maxPrice || urlFilter !== 'all'
                      ? `${filteredFilaments.length} de ${data?.data?.length || 0} filamentos`
                      : `${data?.data?.length || 0} filamentos cadastrados`
                    }
                  </span>
                  {(searchTerm || selectedMaterials.length > 0 || selectedBrands.length > 0 || minPrice || maxPrice || urlFilter !== 'all') && filteredFilaments.length > 0 && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      Filtrado
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Gerencie seu catálogo completo de materiais para impressão 3D
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 min-w-0">
            <Button
              variant="outline"
              size="lg"
              className="group border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 bg-white dark:bg-slate-800"
              onClick={() => {
                // Futura funcionalidade: alternar entre vista em grid/lista ou abrir modal de preview
                toast.success('Funcionalidade de visualização em desenvolvimento!')
              }}
            >
              <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
              Visualizar
            </Button>
            <Link href="/filaments/new">
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                Novo Filamento
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedContainer>

      {/* Search and Filters */}
      <AnimatedContainer animation="slideUp" delay={0.2}>
        <Card variant="elevated">
          <div className="p-6">
            <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar filamentos por marca, nome, material ou cor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Brand Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Marcas {selectedBrands.length > 0 && (
                    <span className="ml-1 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">
                      {selectedBrands.length}
                    </span>
                  )}
                </label>
                <div className="relative" ref={brandDropdownRef}>
                  <button
                    onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-sm">
                      {selectedBrands.length === 0 ? 'Todas as marcas' :
                       selectedBrands.length === 1 ? selectedBrands[0] :
                       `${selectedBrands.length} marcas selecionadas`}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showBrandDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showBrandDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                        <input
                          type="text"
                          placeholder="Buscar marcas..."
                          value={brandSearchTerm}
                          onChange={(e) => setBrandSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {filteredBrands.map(brand => {
                          const isSelected = selectedBrands.includes(brand)
                          return (
                            <button
                              key={brand}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedBrands(prev => prev.filter(b => b !== brand))
                                } else {
                                  setSelectedBrands(prev => [...prev, brand])
                                }
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                            >
                              <span>{brand}</span>
                              {isSelected && <Check className="w-4 h-4 text-red-500" />}
                            </button>
                          )
                        })}
                        {filteredBrands.length === 0 && !brandsLoading && (
                          <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                            Nenhuma marca encontrada
                          </div>
                        )}
                        {brandsLoading && (
                          <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                            Carregando marcas...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Material Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Materiais {selectedMaterials.length > 0 && (
                    <span className="ml-1 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">
                      {selectedMaterials.length}
                    </span>
                  )}
                </label>
                <div className="relative" ref={materialDropdownRef}>
                  <button
                    onClick={() => setShowMaterialDropdown(!showMaterialDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-sm">
                      {selectedMaterials.length === 0 ? 'Todos os materiais' :
                       selectedMaterials.length === 1 ? selectedMaterials[0] :
                       `${selectedMaterials.length} materiais selecionados`}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMaterialDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showMaterialDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                        <input
                          type="text"
                          placeholder="Buscar materiais..."
                          value={materialSearchTerm}
                          onChange={(e) => setMaterialSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {filteredMaterials.map(material => {
                          const isSelected = selectedMaterials.includes(material)
                          return (
                            <button
                              key={material}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedMaterials(prev => prev.filter(m => m !== material))
                                } else {
                                  setSelectedMaterials(prev => [...prev, material])
                                }
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                            >
                              <span>{material}</span>
                              {isSelected && <Check className="w-4 h-4 text-red-500" />}
                            </button>
                          )
                        })}
                        {filteredMaterials.length === 0 && !materialsLoading && (
                          <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                            Nenhum material encontrado
                          </div>
                        )}
                        {materialsLoading && (
                          <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                            Carregando materiais...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Avançado</span>
                  {showAdvancedFilters ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {(selectedMaterials.length > 0 || selectedBrands.length > 0 || searchTerm || minPrice || maxPrice || urlFilter !== 'all') && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ordenar por</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="name">Nome</option>
                      <option value="brand">Marca</option>
                      <option value="price">Preço</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ordem</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="asc">Crescente</option>
                      <option value="desc">Decrescente</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preço Mín (R$)</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preço Máx (R$)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="1000"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* URL Filter with Toggle Switches */}
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Link de Compra</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Todos</span>
                      <div className="relative">
                        <input
                          type="radio"
                          name="urlFilter"
                          checked={urlFilter === 'all'}
                          onChange={() => setUrlFilter('all')}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          urlFilter === 'all'
                            ? 'bg-red-500 border-red-500'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {urlFilter === 'all' && (
                            <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1" />
                          )}
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Com link</span>
                      <div className="relative">
                        <input
                          type="radio"
                          name="urlFilter"
                          checked={urlFilter === 'with-url'}
                          onChange={() => setUrlFilter('with-url')}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          urlFilter === 'with-url'
                            ? 'bg-red-500 border-red-500'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {urlFilter === 'with-url' && (
                            <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1" />
                          )}
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Sem link</span>
                      <div className="relative">
                        <input
                          type="radio"
                          name="urlFilter"
                          checked={urlFilter === 'without-url'}
                          onChange={() => setUrlFilter('without-url')}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          urlFilter === 'without-url'
                            ? 'bg-red-500 border-red-500'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {urlFilter === 'without-url' && (
                            <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1" />
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </Card>
      </AnimatedContainer>

      {/* Results */}
      {isLoading ? (
        <AnimatedContainer animation="fadeIn" delay={0.3}>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <StaggerItem key={i} animation="slideUp">
                <Card variant="elevated" className="h-full flex flex-col overflow-hidden animate-pulse">
                  {/* Header skeleton */}
                  <div className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="h-6 bg-white/30 rounded-lg w-2/3 mb-2"></div>
                        <div className="h-4 bg-white/20 rounded-lg w-1/2"></div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
                    </div>
                    <div className="w-16 h-6 bg-white/30 rounded-full"></div>
                  </div>

                  {/* Content skeleton */}
                  <div className="flex-1 p-6 bg-white dark:bg-slate-900">
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1"></div>
                          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-2/3"></div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1"></div>
                          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                        </div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedContainer>
      ) : !filteredFilaments || filteredFilaments.length === 0 ? (
        <AnimatedContainer animation="scale" delay={0.3}>
          <Card variant="elevated" className="text-center border border-slate-200 dark:border-slate-700">
            <div className="p-16">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto">
                  <Package className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {searchTerm || selectedMaterials.length > 0 || selectedBrands.length > 0 || minPrice || maxPrice || urlFilter !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhum filamento cadastrado'}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto text-lg">
                {searchTerm || selectedMaterials.length > 0 || selectedBrands.length > 0 || minPrice || maxPrice || urlFilter !== 'all'
                  ? (
                    <>
                      Não encontramos filamentos que correspondam aos filtros aplicados.
                      {searchTerm && (
                        <>
                          <br />Busca: <span className="font-semibold text-slate-900 dark:text-slate-100">"{searchTerm}"</span>
                        </>
                      )}
                      {selectedMaterials.length > 0 && (
                        <>
                          <br />Materiais: <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedMaterials.join(', ')}</span>
                        </>
                      )}
                      {selectedBrands.length > 0 && (
                        <>
                          <br />Marcas: <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedBrands.join(', ')}</span>
                        </>
                      )}
                    </>
                  )
                  : 'Comece sua jornada na impressão 3D adicionando seu primeiro filamento ao catálogo. Organize todos seus materiais em um só lugar!'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {searchTerm || selectedMaterials.length > 0 || selectedBrands.length > 0 || minPrice || maxPrice || urlFilter !== 'all' ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={clearAllFilters}
                    className="group"
                  >
                    <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Limpar Filtros
                  </Button>
                ) : (
                  <Link href="/filaments/new">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl group"
                    >
                      <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                      Adicionar Primeiro Filamento
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      ) : (
        <>
          {/* Results Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFilaments.map((filament, index) => (
              <StaggerItem key={filament.id} animation="slideUp" className="h-full">
                <Card
                  variant="elevated"
                  className="h-full flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-slate-900/50"
                >
                  {/* Header with uniform background */}
                  <div className="relative bg-gradient-to-br from-slate-600 to-slate-700 p-6 text-white">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-white truncate">
                              {filament.brand}
                            </h3>
                            {filament.is_global && (
                              <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                                <span className="text-xs font-semibold text-white">Global</span>
                              </div>
                            )}
                          </div>
                          <p className="text-white/90 text-sm font-medium truncate">
                            {filament.name}
                          </p>
                        </div>

                        {/* Advanced Color indicator */}
                        {(() => {
                          const colorDisplay = getFilamentColorDisplay(filament)
                          if (!colorDisplay.hasColor) return null

                          return (
                            <div className="relative">
                              <div
                                className="w-12 h-12 rounded-xl border-3 border-white/30 shadow-lg backdrop-blur-sm"
                                style={{ background: colorDisplay.background }}
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                {colorDisplay.isAdvanced ? (
                                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                ) : (
                                  <Palette className="w-2.5 h-2.5 text-slate-600" />
                                )}
                              </div>
                              {colorDisplay.isAdvanced && (
                                <div className="absolute -top-1 -left-1 px-1 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                                  {colorDisplay.type === 'gradient' && 'G'}
                                  {colorDisplay.type === 'duo' && 'D'}
                                  {colorDisplay.type === 'rainbow' && 'R'}
                                  {colorDisplay.type === 'solid' && 'S'}
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </div>

                      {/* Material badge */}
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-sm font-semibold text-white">{filament.material}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 bg-white dark:bg-slate-900">
                    {/* Specifications */}
                    <div className="space-y-4 mb-6">
                      {(() => {
                        const colorDisplay = getFilamentColorDisplay(filament)
                        // Sempre mostrar se há cor definida ou se pode gerar uma cor
                        if (!colorDisplay.hasColor && !filament.color) return null

                        return (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Cor</span>
                            <div className="flex items-center gap-2">
                              {filament.color && (
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                  {filament.color}
                                </span>
                              )}
                              {colorDisplay.hasColor && (
                                <div className="flex items-center gap-1">
                                  <div
                                    className="w-4 h-4 rounded-sm border border-slate-300 dark:border-slate-600"
                                    style={{ background: colorDisplay.background }}
                                  />
                                  {colorDisplay.isAdvanced && (
                                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                                      {colorDisplay.type === 'gradient' && 'Gradiente'}
                                      {colorDisplay.type === 'duo' && 'Duo Color'}
                                      {colorDisplay.type === 'rainbow' && 'Rainbow'}
                                      {colorDisplay.type === 'solid' && 'Avançada'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Diâmetro</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {filament.diameter}mm
                          </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Weight className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Peso</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {filament.weight}g
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price section */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Preço por kg</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(filament.price_per_kg)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">por quilograma</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 items-center">
                      <Link href={`/filaments/${filament.id}/edit`}>
                        <button className="w-12 h-12 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-slate-800 rounded-lg transition-all duration-200">
                          <Edit className="w-4 h-4 hover:scale-110 transition-transform text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" />
                        </button>
                      </Link>

                      {filament.url && (
                        <a
                          href={filament.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <button className="w-full h-12 flex items-center justify-center gap-2 border-2 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-800 dark:hover:text-green-200 bg-white dark:bg-slate-800 rounded-lg transition-all duration-200">
                            <ShoppingCart className="w-4 h-4 hover:scale-110 transition-transform text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300" />
                            Comprar
                          </button>
                        </a>
                      )}

                      <button
                        onClick={() => handleDelete(filament.id, `${filament.brand} ${filament.name}`)}
                        disabled={deleteMutation.isPending}
                        className="w-12 h-12 flex items-center justify-center border-2 border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 bg-white dark:bg-slate-800 rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 hover:scale-110 transition-transform text-red-600 hover:text-red-700" />
                      </button>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Pagination */}
          {data && data.last_page > 1 && (
            <AnimatedContainer animation="slideUp" delay={0.4}>
              <Card variant="elevated" className="overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{page}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Página {page} de {data.last_page}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {data.total || 0} filamentos no total
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="group border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                      >
                        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                        <span className="ml-2">Anterior</span>
                      </Button>

                      {/* Page numbers */}
                      <div className="hidden sm:flex items-center gap-1 mx-4">
                        {Array.from({ length: Math.min(5, data.last_page) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(data.last_page - 4, Math.max(1, page - 2))) + i
                          if (pageNum > data.last_page) return null

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                                pageNum === page
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setPage(page + 1)}
                        disabled={page === data.last_page}
                        className="group border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                      >
                        <span className="mr-2">Próxima</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </AnimatedContainer>
          )}
        </>
      )}
    </AnimatedContainer>
  )
}