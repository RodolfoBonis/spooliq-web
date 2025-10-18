# 🔍 Validação de Contratos Backend vs Frontend

**Data:** 18/10/2024  
**Status:** ⚠️ DIVERGÊNCIAS CRÍTICAS ENCONTRADAS

---

## ❌ PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **Presets - Estrutura Completamente Diferente**

#### Backend Real (Go):
Os presets no backend têm estruturas **MUITO MAIS COMPLEXAS** do que o frontend implementou:

**MachinePresetEntity:**
```go
type MachinePresetEntity struct {
    ID                     uuid.UUID
    OrganizationID         string
    Brand                  string  // ❌ Frontend não tem
    Model                  string  // ❌ Frontend não tem
    BuildVolumeX           float32 // ❌ Frontend não tem
    BuildVolumeY           float32 // ❌ Frontend não tem
    BuildVolumeZ           float32 // ❌ Frontend não tem
    NozzleDiameter         float32 // ❌ Frontend não tem
    LayerHeightMin         float32 // ❌ Frontend não tem
    LayerHeightMax         float32 // ❌ Frontend não tem
    PrintSpeedMax          float32 // ❌ Frontend não tem
    PowerConsumption       float32 // ❌ Frontend não tem
    BedTemperatureMax      float32 // ❌ Frontend não tem
    ExtruderTemperatureMax float32 // ❌ Frontend não tem
    FilamentDiameter       float32 // ❌ Frontend não tem
    CostPerHour            float32 // ❌ Frontend não tem
}
```

**Frontend Implementado (ERRADO):**
```typescript
interface CreateMachinePresetDTO {
  name: string                // ❌ Backend não tem "name"
  description?: string        // ❌ Backend não tem "description"
  waste_percentage: number    // ❌ Backend não tem "waste_percentage"
  is_default?: boolean        // ❌ Backend não tem "is_default"
}
```

**EnergyPresetEntity:**
```go
type EnergyPresetEntity struct {
    ID                    uuid.UUID
    OrganizationID        string
    Country               string  // ❌ Frontend não tem
    State                 string  // ❌ Frontend não tem
    City                  string  // ❌ Frontend não tem
    EnergyCostPerKwh      float32 // ✅ Frontend tem (mas nome diferente)
    Currency              string  // ❌ Frontend não tem
    Provider              string  // ❌ Frontend não tem
    TariffType            string  // ❌ Frontend não tem
    PeakHourMultiplier    float32 // ❌ Frontend não tem
    OffPeakHourMultiplier float32 // ❌ Frontend não tem
}
```

**Frontend Implementado (ERRADO):**
```typescript
interface CreateEnergyPresetDTO {
  name: string              // ❌ Backend não tem "name"
  kwh_cost: number          // ✅ Equivale a EnergyCostPerKwh
  printer_power: number     // ❌ Backend não tem "printer_power"
  is_default?: boolean      // ❌ Backend não tem "is_default"
}
```

**CostPresetEntity:**
```go
type CostPresetEntity struct {
    ID                        uuid.UUID
    OrganizationID            string
    LaborCostPerHour          float32 // ✅ Frontend tem
    PackagingCostPerItem      float32 // ❌ Frontend não tem
    ShippingCostBase          float32 // ❌ Frontend não tem
    ShippingCostPerGram       float32 // ❌ Frontend não tem
    OverheadPercentage        float32 // ❌ Frontend não tem
    ProfitMarginPercentage    float32 // ✅ Frontend tem
    PostProcessingCostPerHour float32 // ❌ Frontend não tem
    SupportRemovalCostPerHour float32 // ❌ Frontend não tem
    QualityControlCostPerItem float32 // ❌ Frontend não tem
}
```

**Frontend Implementado (PARCIALMENTE ERRADO):**
```typescript
interface CreateCostPresetDTO {
  name: string                    // ❌ Backend não tem "name"
  labor_cost_per_hour: number     // ✅ Correto
  profit_margin?: number          // ✅ Correto (mas nome diferente)
  is_default?: boolean            // ❌ Backend não tem "is_default"
}
```

---

### 2. **Resposta da API de Presets**

**Backend Retorna:**
```go
// GET /presets/machines
c.JSON(http.StatusOK, presets)  // Array direto de PresetEntity
```

**Frontend Espera:**
```typescript
const { data } = await api.get<{ data: MachinePreset[] }>('/presets/machines')
return { presets: data.data }  // ❌ Esperando { data: [...] }
```

**Problema:** O backend retorna o array diretamente, não wrapped em `{ data: [...] }`

---

### 3. **Budget - Estrutura CORRETA** ✅

A estrutura de Budget no frontend está **CORRETA** e alinhada com o backend:

```typescript
// ✅ Frontend correto
interface CreateBudgetItemFilamentDTO {
  filament_id: string
  quantity: number  // gramas
  order: number
}

// ✅ Backend correspondente
type BudgetItemFilamentRequest struct {
    FilamentID uuid.UUID `json:"filament_id"`
    Quantity   float64   `json:"quantity"`  // gramas TOTAL
    Order      int       `json:"order"`
}
```

```typescript
// ✅ Frontend correto
interface CreateBudgetItemDTO {
  product_name: string
  product_description?: string
  product_quantity: number
  product_dimensions?: string
  print_time_hours: number
  print_time_minutes: number
  cost_preset_id?: string
  additional_labor_cost?: number  // cents
  additional_notes?: string
  filaments: CreateBudgetItemFilamentDTO[]
  order: number
}

// ✅ Backend correspondente
type BudgetItemRequest struct {
    ProductName        string
    ProductDescription *string
    ProductQuantity    int
    ProductDimensions  *string
    PrintTimeHours     int
    PrintTimeMinutes   int
    Filaments          []BudgetItemFilamentRequest
    CostPresetID       *uuid.UUID
    AdditionalLaborCost *int64
    AdditionalNotes    *string
    Order              int
}
```

**Status Update:**
```typescript
// ✅ Frontend correto
interface UpdateBudgetStatusDTO {
  status: 'sent' | 'approved' | 'rejected' | 'printing' | 'completed'
  notes?: string
}

// ✅ Backend correspondente
type UpdateStatusRequest struct {
    NewStatus BudgetStatus `json:"new_status"`
    Notes     string       `json:"notes,omitempty"`
}
```

---

### 4. **Budget Response - Estrutura Correta** ✅

```typescript
// ✅ Frontend types corretos
interface BudgetWithDetails extends Budget {
  customer: Customer
  items: Array<BudgetItem & { filaments: BudgetItemFilament[] }>
  total_print_time_hours: number
  total_print_time_minutes: number
  total_print_time_display: string
}

// ✅ Backend correspondente
type BudgetResponse struct {
    Budget                *BudgetEntity
    Customer              *CustomerInfo
    Items                 []BudgetItemResponse
    TotalPrintTimeHours   int
    TotalPrintTimeMinutes int
    TotalPrintTimeDisplay string
}
```

---

## 🔧 CORREÇÕES NECESSÁRIAS

### Prioridade CRÍTICA

#### 1. Reescrever completamente os Presets no Frontend

**Arquivos a modificar:**
- `src/types/models.ts` - Atualizar interfaces
- `src/services/preset-service.ts` - Atualizar DTOs
- `src/lib/validations/preset.ts` - Atualizar schemas
- `src/app/(platform)/presets/machines/page.tsx` - Reescrever form
- Criar páginas de energy e cost presets com campos corretos

**Machine Preset - Campos Corretos:**
```typescript
interface CreateMachinePresetDTO {
  brand?: string
  model?: string
  build_volume_x: number          // mm
  build_volume_y: number          // mm
  build_volume_z: number          // mm
  nozzle_diameter: number         // mm
  layer_height_min: number        // mm
  layer_height_max: number        // mm
  print_speed_max: number         // mm/s
  power_consumption: number       // Watts
  bed_temperature_max: number     // °C
  extruder_temperature_max: number // °C
  filament_diameter: number       // mm (1.75 ou 2.85)
  cost_per_hour: number           // cents
}
```

**Energy Preset - Campos Corretos:**
```typescript
interface CreateEnergyPresetDTO {
  country?: string
  state?: string
  city?: string
  energy_cost_per_kwh: number      // cents
  currency: string                 // "BRL", "USD", etc
  provider?: string
  tariff_type?: string
  peak_hour_multiplier: number
  off_peak_hour_multiplier: number
}
```

**Cost Preset - Campos Corretos:**
```typescript
interface CreateCostPresetDTO {
  labor_cost_per_hour: number
  packaging_cost_per_item: number
  shipping_cost_base: number
  shipping_cost_per_gram: number
  overhead_percentage: number           // 0-100
  profit_margin_percentage: number      // 0-100
  post_processing_cost_per_hour: number
  support_removal_cost_per_hour: number
  quality_control_cost_per_item: number
}
```

#### 2. Corrigir parsing de resposta dos Presets

```typescript
// ANTES (ERRADO):
const { data } = await api.get<{ data: MachinePreset[] }>('/presets/machines')
return { presets: data.data }

// DEPOIS (CORRETO):
const { data } = await api.get<MachinePreset[]>('/presets/machines')
return { presets: data }
```

---

## ✅ O QUE ESTÁ CORRETO

1. **Budget System** - Completamente alinhado ✅
2. **Budget Items** - Estrutura correta ✅
3. **Budget Filaments** - Multi-filament support correto ✅
4. **Budget Status** - Enum e update corretos ✅
5. **Customer, Brand, Material, Filament** - Estruturas corretas ✅

---

## 📋 CHECKLIST DE CORREÇÃO

- [ ] Atualizar `src/types/models.ts` com interfaces corretas de presets
- [ ] Reescrever `src/services/preset-service.ts` com DTOs corretos
- [ ] Atualizar `src/lib/validations/preset.ts` com validações corretas
- [ ] Reescrever `src/app/(platform)/presets/machines/page.tsx`
- [ ] Criar `src/app/(platform)/presets/energy/page.tsx` com campos corretos
- [ ] Criar `src/app/(platform)/presets/costs/page.tsx` com campos corretos
- [ ] Corrigir parsing de resposta em todos os serviços de preset
- [ ] Testar integração com backend real

---

## 🚨 IMPACTO

**Alto Impacto:**
- Sistema de presets completamente não funcional com backend real
- Formulários precisam ser reescritos do zero
- Validações precisam ser refeitas

**Sem Impacto:**
- Sistema de budgets está correto e funcional ✅
- Sistema de catálogo (brands, materials, filaments) está correto ✅
- Sistema de clientes está correto ✅

---

**Próximos Passos:**
1. Deletar implementação atual de presets
2. Reimplementar baseado nas entidades reais do backend
3. Criar forms complexos com todos os campos necessários
4. Adicionar validações apropriadas
5. Testar com backend real

**Tempo Estimado:** 4-6 horas de retrabalho

