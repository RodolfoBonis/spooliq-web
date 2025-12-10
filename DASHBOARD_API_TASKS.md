# Dashboard Analytics API - Tarefas de Implementação Backend

**Projeto:** SpoolIQ - Dashboard Analytics
**Data de Criação:** 2025-01-20
**Responsável:** Backend Team
**Tecnologia:** Go + Gin + GORM + PostgreSQL + Keycloak

---

## 📋 Resumo do Projeto

Implementar 8 endpoints REST para alimentar o dashboard analytics do frontend. O frontend já está 100% pronto e aguardando integração com dados reais do backend.

**Frontend Mock → Backend Real**

Atualmente o frontend usa dados mockados. Cada endpoint abaixo substituirá uma função mock por dados reais do banco.

---

## 🏗️ Setup Inicial

### Task #0: Estrutura Base do Dashboard

**Tipo:** Setup
**Prioridade:** Alta
**Estimativa:** P (2-3h)
**Dependências:** Nenhuma

#### Descrição
Criar a estrutura de feature modules seguindo o padrão Clean Architecture do projeto para os endpoints do dashboard.

#### Acceptance Criteria
- [ ] Feature `dashboard` criada seguindo padrão existente
- [ ] Estrutura de pastas domain/data/di criada
- [ ] Entities e interfaces de repositório definidas
- [ ] Usecases implementados (atuam como handlers)
- [ ] Módulo FX configurado

#### Estrutura Sugerida
```
features/
└── dashboard/
    ├── domain/
    │   ├── entities/
    │   │   ├── overview.go
    │   │   ├── revenue_trend.go
    │   │   ├── conversion_funnel.go
    │   │   ├── recent_activity.go
    │   │   ├── top_customers.go
    │   │   ├── operational_insights.go
    │   │   ├── top_filaments.go
    │   │   ├── top_materials.go
    │   │   └── goals_alerts.go
    │   ├── repositories/
    │   │   └── dashboard_repository.go
    │   └── usecases/
    │       ├── get_overview_usecase.go
    │       ├── get_revenue_trend_usecase.go
    │       ├── get_conversion_funnel_usecase.go
    │       ├── get_recent_activity_usecase.go
    │       ├── get_top_customers_usecase.go
    │       ├── get_operational_insights_usecase.go
    │       ├── get_top_filaments_usecase.go
    │       ├── get_top_materials_usecase.go
    │       └── get_goals_alerts_usecase.go
    ├── data/
    │   ├── models/
    │   │   └── dashboard_models.go
    │   └── repositories/
    │       └── dashboard_repository_impl.go
    └── di/
        └── dashboard_module.go
```

#### Entities Base (Go Structs)
```go
// features/dashboard/domain/entities/overview.go
package entities

type PeriodFilter string

const (
	Period7d  PeriodFilter = "7d"
	Period30d PeriodFilter = "30d"
	Period3m  PeriodFilter = "3m"
	Period6m  PeriodFilter = "6m"
	Period1y  PeriodFilter = "1y"
	PeriodAll PeriodFilter = "all"
)

type BudgetStatus string

const (
	StatusDraft     BudgetStatus = "draft"
	StatusSent      BudgetStatus = "sent"
	StatusApproved  BudgetStatus = "approved"
	StatusRejected  BudgetStatus = "rejected"
	StatusPrinting  BudgetStatus = "printing"
	StatusCompleted BudgetStatus = "completed"
)

type DashboardOverview struct {
	CurrentMonthRevenue      int64                   `json:"current_month_revenue"`
	RevenueChangePercentage  float64                 `json:"revenue_change_percentage"`
	ConversionRate           float64                 `json:"conversion_rate"`
	ConversionRateChange     float64                 `json:"conversion_rate_change"`
	BudgetsByStatus          map[BudgetStatus]int    `json:"budgets_by_status"`
	NewCustomersCount        int                     `json:"new_customers_count"`
	NewCustomersChange       float64                 `json:"new_customers_change"`
}

type RevenueTrendDataPoint struct {
	Month    string `json:"month"`    // "2025-01" ou "2025-01-15"
	Revenue  int64  `json:"revenue"`  // em centavos
	Pipeline int64  `json:"pipeline"` // em centavos
	Count    int    `json:"count"`
}

type RevenueTrendData struct {
	Data          []RevenueTrendDataPoint `json:"data"`
	TotalRevenue  int64                   `json:"total_revenue"`
	TotalPipeline int64                   `json:"total_pipeline"`
	Period        PeriodFilter            `json:"period"`
}

// ... demais entities nos respectivos arquivos
```

#### Repository Interface
```go
// features/dashboard/domain/repositories/dashboard_repository.go
package repositories

import (
	"context"
	"time"
	"spooliq/features/dashboard/domain/entities"
)

type DashboardRepository interface {
	// Overview
	GetCurrentMonthRevenue(ctx context.Context, organizationID string, startDate, endDate time.Time) (int64, error)
	GetConversionRate(ctx context.Context, organizationID string, startDate, endDate time.Time) (float64, error)
	GetBudgetsByStatus(ctx context.Context, organizationID string) (map[entities.BudgetStatus]int, error)
	GetNewCustomersCount(ctx context.Context, organizationID string, startDate, endDate time.Time) (int, error)

	// Revenue Trend
	GetRevenueTrendDaily(ctx context.Context, organizationID string, startDate, endDate time.Time) ([]entities.RevenueTrendDataPoint, error)
	GetRevenueTrendMonthly(ctx context.Context, organizationID string, startDate, endDate time.Time) ([]entities.RevenueTrendDataPoint, error)

	// ... demais métodos para outros endpoints
}
```

#### Usecase Example (atua como handler)
```go
// features/dashboard/domain/usecases/get_overview_usecase.go
package usecases

import (
	"context"
	"spooliq/core/errors"
	"spooliq/core/helpers"
	"spooliq/core/logger"
	"spooliq/features/dashboard/domain/entities"
	"spooliq/features/dashboard/domain/repositories"
	"time"

	"github.com/gin-gonic/gin"
)

type GetOverviewUsecase struct {
	repo   repositories.DashboardRepository
	logger logger.Logger
}

func NewGetOverviewUsecase(
	repo repositories.DashboardRepository,
	logger logger.Logger,
) *GetOverviewUsecase {
	return &GetOverviewUsecase{
		repo:   repo,
		logger: logger,
	}
}

// Handle é o método HTTP handler (usecases atuam como handlers)
func (uc *GetOverviewUsecase) Handle(c *gin.Context) {
	ctx := c.Request.Context()

	// Extrair organization_id do JWT (via middleware Keycloak)
	organizationID := helpers.GetOrganizationID(c)
	if organizationID == "" {
		appError := errors.UnauthorizedError("Organization ID not found in token")
		c.JSON(appError.HTTPStatus(), gin.H{"error": appError.Message()})
		return
	}

	uc.logger.Info(ctx, "Getting dashboard overview", map[string]interface{}{
		"organization_id": organizationID,
	})

	// Executar lógica de negócio
	overview, err := uc.Execute(ctx, organizationID)
	if err != nil {
		appError := errors.UsecaseError("failed to get dashboard overview", err)
		uc.logger.Error(ctx, "Failed to get overview", map[string]interface{}{
			"organization_id": organizationID,
			"error":           err.Error(),
		})
		c.JSON(appError.HTTPStatus(), gin.H{"error": appError.Message()})
		return
	}

	c.JSON(200, gin.H{"data": overview})
}

func (uc *GetOverviewUsecase) Execute(ctx context.Context, organizationID string) (*entities.DashboardOverview, error) {
	// Calcular períodos
	now := time.Now()
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	currentMonthEnd := currentMonthStart.AddDate(0, 1, 0)

	lastMonthStart := currentMonthStart.AddDate(0, -1, 0)
	lastMonthEnd := currentMonthStart

	// Buscar dados em paralelo usando goroutines
	type result struct {
		currentRevenue     int64
		lastRevenue        int64
		currentConversion  float64
		lastConversion     float64
		budgetsByStatus    map[entities.BudgetStatus]int
		newCustomers       int
		lastMonthCustomers int
		err                error
	}

	// ... implementação com goroutines e channels

	return &entities.DashboardOverview{
		CurrentMonthRevenue:     currentRevenue,
		RevenueChangePercentage: calculateChange(float64(currentRevenue), float64(lastRevenue)),
		ConversionRate:          currentConversion,
		ConversionRateChange:    calculateChange(currentConversion, lastConversion),
		BudgetsByStatus:         budgetsByStatus,
		NewCustomersCount:       newCustomers,
		NewCustomersChange:      calculateChange(float64(newCustomers), float64(lastMonthCustomers)),
	}, nil
}

func calculateChange(current, previous float64) float64 {
	if previous == 0 {
		if current > 0 {
			return 100.0
		}
		return 0.0
	}
	return ((current - previous) / previous) * 100
}
```

#### DI Module (Uber FX)
```go
// features/dashboard/di/dashboard_module.go
package di

import (
	"spooliq/features/dashboard/data/repositories"
	domainRepos "spooliq/features/dashboard/domain/repositories"
	"spooliq/features/dashboard/domain/usecases"

	"go.uber.org/fx"
)

var DashboardModule = fx.Module(
	"dashboard",
	fx.Provide(
		// Repository
		fx.Annotate(
			repositories.NewDashboardRepositoryImpl,
			fx.As(new(domainRepos.DashboardRepository)),
		),

		// Usecases
		usecases.NewGetOverviewUsecase,
		usecases.NewGetRevenueTrendUsecase,
		usecases.NewGetConversionFunnelUsecase,
		usecases.NewGetRecentActivityUsecase,
		usecases.NewGetTopCustomersUsecase,
		usecases.NewGetOperationalInsightsUsecase,
		usecases.NewGetTopFilamentsUsecase,
		usecases.NewGetTopMaterialsUsecase,
		usecases.NewGetGoalsAlertsUsecase,
	),
)
```

#### Registrar Rotas
```go
// core/http/router.go (adicionar no arquivo existente)

// No método que registra rotas protegidas:
dashboardGroup := protected.Group("/dashboard")
{
	dashboardGroup.GET("/overview", getOverviewUsecase.Handle)
	dashboardGroup.GET("/revenue-trend", getRevenueTrendUsecase.Handle)
	dashboardGroup.GET("/conversion-funnel", getConversionFunnelUsecase.Handle)
	dashboardGroup.GET("/recent-activity", getRecentActivityUsecase.Handle)
	dashboardGroup.GET("/top-customers", getTopCustomersUsecase.Handle)
	dashboardGroup.GET("/operational-insights", getOperationalInsightsUsecase.Handle)
	dashboardGroup.GET("/top-filaments", getTopFilamentsUsecase.Handle)
	dashboardGroup.GET("/top-materials", getTopMaterialsUsecase.Handle)
	dashboardGroup.GET("/goals-alerts", getGoalsAlertsUsecase.Handle)
}
```

#### Notas Técnicas
- Todos os endpoints já protegidos pelo middleware de autenticação Keycloak existente
- Sempre usar `helpers.GetOrganizationID(c)` para extrair organization_id do JWT
- Retornar valores monetários **sempre em centavos** (int64)
- Usar UTC para todas as datas (time.UTC)
- Response format: `{"data": {...}}` para sucesso, `{"error": "message"}` para erro
- Logging com OpenTelemetry trace context

---

## 📊 Endpoints de Implementação

### Task #1: GET /api/dashboard/overview

**Tipo:** Backend API
**Prioridade:** Alta (TIER 1)
**Estimativa:** M (1 dia)
**Dependências:** Task #0

#### Descrição
Endpoint que retorna os KPIs principais do dashboard: receita do mês, taxa de conversão, contagem de orçamentos por status e novos clientes.

Este endpoint alimenta os 4 cards principais no topo do dashboard.

#### Acceptance Criteria
- [ ] Endpoint responde com status 200
- [ ] Calcula receita do mês atual (budgets approved/completed/printing)
- [ ] Calcula % de mudança vs mês anterior
- [ ] Calcula taxa de conversão atual (approved / sent * 100)
- [ ] Retorna contagem de budgets por cada status
- [ ] Retorna contagem de novos clientes do mês
- [ ] Filtra por organization_id do usuário autenticado
- [ ] Performance < 500ms
- [ ] Trata caso de divisão por zero (mês sem budgets)

#### Response Format
```json
{
  "data": {
    "current_month_revenue": 4523000,
    "revenue_change_percentage": 23.5,
    "conversion_rate": 68.2,
    "conversion_rate_change": 5.1,
    "budgets_by_status": {
      "draft": 8,
      "sent": 12,
      "approved": 15,
      "rejected": 3,
      "printing": 5,
      "completed": 28
    },
    "new_customers_count": 7,
    "new_customers_change": 12.5
  }
}
```

#### Queries GORM Necessárias

```go
// features/dashboard/data/repositories/dashboard_repository_impl.go

// 1. Receita do mês atual
func (r *DashboardRepositoryImpl) GetCurrentMonthRevenue(
	ctx context.Context,
	organizationID string,
	startDate, endDate time.Time,
) (int64, error) {
	var result struct {
		TotalRevenue int64
	}

	err := r.db.WithContext(ctx).
		Model(&models.Budget{}).
		Select("COALESCE(SUM(total_cost), 0) as total_revenue").
		Where("organization_id = ?", organizationID).
		Where("status IN ?", []string{"approved", "completed", "printing"}).
		Where("created_at >= ? AND created_at < ?", startDate, endDate).
		Scan(&result).Error

	return result.TotalRevenue, err
}

// 2. Taxa de conversão
func (r *DashboardRepositoryImpl) GetConversionRate(
	ctx context.Context,
	organizationID string,
	startDate, endDate time.Time,
) (float64, error) {
	var result struct {
		ApprovedCount int64
		SentCount     int64
	}

	err := r.db.WithContext(ctx).
		Model(&models.Budget{}).
		Select(`
			COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
			COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count
		`).
		Where("organization_id = ?", organizationID).
		Where("created_at >= ? AND created_at < ?", startDate, endDate).
		Scan(&result).Error

	if err != nil {
		return 0, err
	}

	if result.SentCount == 0 {
		return 0, nil
	}

	rate := (float64(result.ApprovedCount) / float64(result.SentCount)) * 100
	return rate, nil
}

// 3. Budgets por status
func (r *DashboardRepositoryImpl) GetBudgetsByStatus(
	ctx context.Context,
	organizationID string,
) (map[entities.BudgetStatus]int, error) {
	type StatusCount struct {
		Status string
		Count  int
	}

	var results []StatusCount
	err := r.db.WithContext(ctx).
		Model(&models.Budget{}).
		Select("status, COUNT(*) as count").
		Where("organization_id = ?", organizationID).
		Group("status").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	// Converter para map
	statusMap := make(map[entities.BudgetStatus]int)
	for _, r := range results {
		statusMap[entities.BudgetStatus(r.Status)] = r.Count
	}

	// Garantir que todos os status existam no map (mesmo com 0)
	allStatuses := []entities.BudgetStatus{
		entities.StatusDraft,
		entities.StatusSent,
		entities.StatusApproved,
		entities.StatusRejected,
		entities.StatusPrinting,
		entities.StatusCompleted,
	}
	for _, status := range allStatuses {
		if _, exists := statusMap[status]; !exists {
			statusMap[status] = 0
		}
	}

	return statusMap, nil
}

// 4. Novos clientes
func (r *DashboardRepositoryImpl) GetNewCustomersCount(
	ctx context.Context,
	organizationID string,
	startDate, endDate time.Time,
) (int, error) {
	var count int64

	err := r.db.WithContext(ctx).
		Model(&models.Customer{}).
		Where("organization_id = ?", organizationID).
		Where("created_at >= ? AND created_at < ?", startDate, endDate).
		Count(&count).Error

	return int(count), err
}
```

#### Implementação Sugerida (Repository)
```go
// features/dashboard/data/repositories/dashboard_repository_impl.go
package repositories

import (
	"context"
	"spooliq/core/logger"
	"spooliq/features/dashboard/data/models"
	"spooliq/features/dashboard/domain/entities"
	"time"

	"gorm.io/gorm"
)

type DashboardRepositoryImpl struct {
	db     *gorm.DB
	logger logger.Logger
}

func NewDashboardRepositoryImpl(
	db *gorm.DB,
	logger logger.Logger,
) *DashboardRepositoryImpl {
	return &DashboardRepositoryImpl{
		db:     db,
		logger: logger,
	}
}

// Implementar todos os métodos da interface DashboardRepository aqui
// (GetCurrentMonthRevenue, GetConversionRate, GetBudgetsByStatus, GetNewCustomersCount, etc)
```

#### Testes
```go
// features/dashboard/domain/usecases/get_overview_usecase_test.go
package usecases_test

import (
	"context"
	"testing"
	"spooliq/features/dashboard/domain/entities"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestGetOverviewUsecase_Execute(t *testing.T) {
	t.Run("should return overview with data", func(t *testing.T) {
		// Setup mock repository
		mockRepo := new(MockDashboardRepository)
		mockLogger := new(MockLogger)

		usecase := usecases.NewGetOverviewUsecase(mockRepo, mockLogger)

		// Configure mocks
		mockRepo.On("GetCurrentMonthRevenue", mock.Anything, "org-123", mock.Anything, mock.Anything).
			Return(int64(4523000), nil)
		// ... outros mocks

		result, err := usecase.Execute(context.Background(), "org-123")

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, int64(4523000), result.CurrentMonthRevenue)
	})

	t.Run("should handle organization with no budgets", func(t *testing.T) {
		// Testar retorno de zeros quando não há dados
	})

	t.Run("should handle division by zero in conversion rate", func(t *testing.T) {
		// Testar cálculo quando sent_count = 0
	})
}
```

#### Notas Técnicas
- **IMPORTANTE:** Sempre usar `helpers.GetOrganizationID(c)` para extrair organization_id
- GORM automaticamente parametriza queries (proteção contra SQL injection)
- Considerar apenas budgets com status que indicam receita: `approved`, `completed`, `printing`
- Para taxa de conversão, considerar apenas `sent` → `approved` (não contar drafts)
- Cache recomendado: 5 minutos via middleware ou decorator pattern
- Usar goroutines para queries paralelas (channels ou sync.WaitGroup)

---

### Task #2: GET /api/dashboard/revenue-trend

**Tipo:** Backend API
**Prioridade:** Alta (TIER 1)
**Estimativa:** M (1 dia)
**Dependências:** Task #0

#### Descrição
Endpoint que retorna histórico de receita ao longo do tempo, permitindo visualizar tendências e crescimento. Suporta diferentes períodos de agregação (diário para curto prazo, mensal para longo prazo).

Alimenta o gráfico de área "Receita e Pipeline".

#### Acceptance Criteria
- [ ] Endpoint aceita query param `period` (7d, 30d, 3m, 6m, 1y, all)
- [ ] Retorna array de pontos de dados ordenados por data
- [ ] Agrupa por dia para períodos curtos (7d, 30d)
- [ ] Agrupa por mês para períodos longos (3m, 6m, 1y)
- [ ] Calcula receita (approved/completed/printing)
- [ ] Calcula pipeline (sent, aguardando aprovação)
- [ ] Preenche gaps com zeros (meses sem dados aparecem com 0)
- [ ] Retorna totais agregados
- [ ] Performance < 1s

#### Response Format
```typescript
{
  data: [
    {
      month: "2024-10",  // ou "2025-01-15" para períodos diários
      revenue: 3240000,   // R$ 32.400 em centavos
      pipeline: 1520000,  // R$ 15.200 em centavos
      count: 18           // número de budgets
    },
    {
      month: "2024-11",
      revenue: 4100000,
      pipeline: 1800000,
      count: 22
    },
    // ... mais pontos
  ],
  total_revenue: 15680000,
  total_pipeline: 5200000,
  period: "6m"
}
```

#### Queries SQL Necessárias

```sql
-- Para períodos MENSAIS (3m, 6m, 1y):
SELECT
  to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
  SUM(CASE WHEN status IN ('approved', 'completed', 'printing') THEN total_cost ELSE 0 END) as revenue,
  SUM(CASE WHEN status = 'sent' THEN total_cost ELSE 0 END) as pipeline,
  COUNT(*) as count
FROM budgets
WHERE organization_id = $1
  AND created_at >= $2  -- data início do período
  AND created_at < $3   -- data fim
GROUP BY date_trunc('month', created_at)
ORDER BY date_trunc('month', created_at) ASC;

-- Para períodos DIÁRIOS (7d, 30d):
SELECT
  to_char(DATE(created_at), 'YYYY-MM-DD') as date,
  SUM(CASE WHEN status IN ('approved', 'completed', 'printing') THEN total_cost ELSE 0 END) as revenue,
  SUM(CASE WHEN status = 'sent' THEN total_cost ELSE 0 END) as pipeline,
  COUNT(*) as count
FROM budgets
WHERE organization_id = $1
  AND created_at >= $2
  AND created_at < $3
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) ASC;
```

#### Implementação Sugerida
```typescript
// src/services/dashboard/revenue.service.ts

export class RevenueService {
  async getRevenueTrend(
    organizationId: string,
    period: PeriodFilter
  ): Promise<RevenueTrendData> {
    const { startDate, endDate, groupBy } = this.getPeriodConfig(period);

    const rawData = await this.queryRevenueTrend(
      organizationId,
      startDate,
      endDate,
      groupBy
    );

    // Preencher gaps (datas sem dados)
    const filledData = this.fillGaps(rawData, startDate, endDate, groupBy);

    const totalRevenue = filledData.reduce((sum, d) => sum + d.revenue, 0);
    const totalPipeline = filledData.reduce((sum, d) => sum + d.pipeline, 0);

    return {
      data: filledData,
      total_revenue: totalRevenue,
      total_pipeline: totalPipeline,
      period,
    };
  }

  private getPeriodConfig(period: PeriodFilter) {
    const now = new Date();

    switch (period) {
      case '7d':
        return {
          startDate: subDays(now, 7),
          endDate: now,
          groupBy: 'day' as const,
        };
      case '30d':
        return {
          startDate: subDays(now, 30),
          endDate: now,
          groupBy: 'day' as const,
        };
      case '3m':
        return {
          startDate: subMonths(now, 3),
          endDate: now,
          groupBy: 'month' as const,
        };
      case '6m':
        return {
          startDate: subMonths(now, 6),
          endDate: now,
          groupBy: 'month' as const,
        };
      case '1y':
        return {
          startDate: subYears(now, 1),
          endDate: now,
          groupBy: 'month' as const,
        };
      default:
        return {
          startDate: null,
          endDate: now,
          groupBy: 'month' as const,
        };
    }
  }

  private fillGaps(
    data: RevenueTrendDataPoint[],
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'month'
  ): RevenueTrendDataPoint[] {
    // Gerar todas as datas do período
    const allDates = this.generateDateRange(startDate, endDate, groupBy);

    // Merge com dados reais, preenchendo gaps com 0
    return allDates.map(date => {
      const existing = data.find(d => d.month === date);
      return existing || {
        month: date,
        revenue: 0,
        pipeline: 0,
        count: 0,
      };
    });
  }
}
```

#### Testes
- [ ] Testar período 7d (agrupamento diário)
- [ ] Testar período 1y (agrupamento mensal)
- [ ] Testar com período sem dados (retornar array de zeros)
- [ ] Verificar preenchimento de gaps
- [ ] Testar ordenação cronológica

#### Notas Técnicas
- Frontend espera formato `"YYYY-MM"` para meses e `"YYYY-MM-DD"` para dias
- Preencher gaps é essencial para o gráfico ficar visualmente correto
- Considerar timezone da organização (ou UTC padrão)
- Cache: 10 minutos para períodos longos, 5 min para curtos

---

### Task #3: GET /api/dashboard/conversion-funnel

**Tipo:** Backend API
**Prioridade:** Média (TIER 1)
**Estimativa:** M (6-8h)
**Dependências:** Task #0

#### Descrição
Endpoint que retorna dados do funil de conversão, mostrando quantos budgets existem em cada estágio do processo e a taxa de conversão entre eles.

Alimenta o componente visual de funil no dashboard.

#### Acceptance Criteria
- [ ] Retorna array de stages na ordem correta do funil
- [ ] Calcula count e total_value para cada status
- [ ] Calcula conversion_rate entre estágios consecutivos
- [ ] Calcula average_time_in_stage (opcional, pode retornar 0 se não tiver histórico)
- [ ] Calcula overall_conversion_rate (draft → completed)
- [ ] Ordem fixa: draft → sent → approved → printing → completed (rejected separado)

#### Response Format
```typescript
{
  stages: [
    {
      status: "draft",
      count: 45,
      total_value: 8500000,  // R$ 85.000
      conversion_rate: 75.5, // % que vão para "sent"
      average_time_in_stage: 24.5 // horas (opcional)
    },
    {
      status: "sent",
      count: 34,
      total_value: 7200000,
      conversion_rate: 70.6, // % que vão para "approved"
      average_time_in_stage: 48.2
    },
    {
      status: "approved",
      count: 24,
      total_value: 5800000,
      conversion_rate: 91.7, // % que vão para "printing"
      average_time_in_stage: 12.0
    },
    {
      status: "printing",
      count: 22,
      total_value: 5300000,
      conversion_rate: 95.5, // % que vão para "completed"
      average_time_in_stage: 96.3
    },
    {
      status: "completed",
      count: 21,
      total_value: 5100000,
      conversion_rate: 0,
      average_time_in_stage: 0
    }
  ],
  overall_conversion_rate: 46.7 // 21/45 * 100
}
```

#### Queries SQL Necessárias

```sql
-- 1. Count e valor por status
SELECT
  status,
  COUNT(*) as count,
  COALESCE(SUM(total_cost), 0) as total_value
FROM budgets
WHERE organization_id = $1
  AND status IN ('draft', 'sent', 'approved', 'printing', 'completed')
GROUP BY status;

-- 2. (OPCIONAL) Tempo médio em cada estágio
-- Requer tabela de histórico de mudanças de status ou usar created_at/updated_at
-- Se não tiver, retornar 0 ou estimar baseado em created_at
SELECT
  status,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_hours
FROM budgets
WHERE organization_id = $1
GROUP BY status;
```

#### Implementação Sugerida
```typescript
// src/services/dashboard/funnel.service.ts

export class FunnelService {
  async getConversionFunnel(organizationId: string): Promise<ConversionFunnelData> {
    // Ordem fixa do funil
    const statusOrder: BudgetStatus[] = ['draft', 'sent', 'approved', 'printing', 'completed'];

    // Buscar contagens do banco
    const statusCounts = await this.getStatusCounts(organizationId);

    // Montar stages com conversion rates
    const stages = statusOrder.map((status, index) => {
      const current = statusCounts[status] || { count: 0, total_value: 0 };
      const next = index < statusOrder.length - 1
        ? statusCounts[statusOrder[index + 1]]
        : null;

      const conversionRate = next && current.count > 0
        ? (next.count / current.count) * 100
        : 0;

      return {
        status,
        count: current.count,
        total_value: current.total_value,
        conversion_rate: Number(conversionRate.toFixed(1)),
        average_time_in_stage: 0, // TODO: implementar se tiver histórico
      };
    });

    // Overall conversion: primeiro → último
    const firstStage = stages[0];
    const lastStage = stages[stages.length - 1];
    const overallConversion = firstStage.count > 0
      ? (lastStage.count / firstStage.count) * 100
      : 0;

    return {
      stages,
      overall_conversion_rate: Number(overallConversion.toFixed(1)),
    };
  }
}
```

#### Testes
- [ ] Testar com organização sem budgets
- [ ] Testar com budgets apenas em draft (conversão = 0)
- [ ] Verificar divisão por zero
- [ ] Testar cálculo de overall_conversion_rate

#### Notas Técnicas
- Status "rejected" pode ser incluído ou não (decisão de produto)
- Se não tiver tabela de histórico, `average_time_in_stage` pode ser sempre 0
- Conversion rate do último estágio sempre será 0 (não tem próximo)
- Frontend espera valores entre 0-100 (não 0-1)

---

### Task #4: GET /api/dashboard/recent-activity

**Tipo:** Backend API
**Prioridade:** Média (TIER 1)
**Estimativa:** M (6-8h)
**Dependências:** Task #0

#### Descrição
Endpoint que retorna feed de atividades recentes (últimas 10-15 ações), como criação de budgets, envio para clientes, aprovações, novos clientes, etc.

Alimenta o componente de timeline "Atividade Recente".

#### Acceptance Criteria
- [ ] Retorna últimas 10-15 atividades
- [ ] Ordenado por timestamp (mais recente primeiro)
- [ ] Inclui diferentes tipos de eventos
- [ ] Monta descrição legível em português
- [ ] Inclui link para entidade relacionada
- [ ] Performance < 500ms

#### Response Format
```typescript
{
  activities: [
    {
      id: "activity-1",
      type: "budget_approved",
      description: "Orçamento 'Peças para Drone' aprovado por João Silva",
      timestamp: "2025-01-20T15:30:00Z",
      related_entity_id: "budget-uuid-123",
      related_entity_name: "Peças para Drone",
      value: 245000 // R$ 2.450 (opcional)
    },
    {
      id: "activity-2",
      type: "budget_sent",
      description: "Orçamento 'Protótipo Mecânico' enviado para Maria Santos",
      timestamp: "2025-01-20T14:15:00Z",
      related_entity_id: "budget-uuid-456",
      related_entity_name: "Protótipo Mecânico",
      value: 180000
    },
    {
      id: "activity-3",
      type: "customer_created",
      description: "Novo cliente cadastrado: Tech Solutions Brasil",
      timestamp: "2025-01-20T10:00:00Z",
      related_entity_id: "customer-uuid-789",
      related_entity_name: "Tech Solutions Brasil",
      value: null
    }
    // ... mais atividades
  ]
}
```

#### Queries SQL Necessárias

**Opção A: Se você tem tabela de eventos/audit log**
```sql
SELECT
  id,
  event_type as type,
  description,
  created_at as timestamp,
  entity_id as related_entity_id,
  entity_name as related_entity_name,
  metadata->>'value' as value
FROM audit_logs
WHERE organization_id = $1
  AND event_type IN (
    'budget_created', 'budget_sent', 'budget_approved',
    'budget_rejected', 'budget_printing', 'budget_completed',
    'customer_created'
  )
ORDER BY created_at DESC
LIMIT 10;
```

**Opção B: Se NÃO tem tabela de eventos (união de queries)**
```sql
-- Combinar múltiplas queries com UNION ALL
(
  -- Budgets criados
  SELECT
    b.id,
    'budget_created' as type,
    b.created_at as timestamp,
    b.id as related_entity_id,
    b.title as related_entity_name,
    b.total_cost as value,
    c.name as customer_name
  FROM budgets b
  LEFT JOIN customers c ON c.id = b.customer_id
  WHERE b.organization_id = $1
  ORDER BY b.created_at DESC
  LIMIT 5
)
UNION ALL
(
  -- Clientes criados
  SELECT
    c.id,
    'customer_created' as type,
    c.created_at as timestamp,
    c.id as related_entity_id,
    c.name as related_entity_name,
    NULL as value,
    NULL as customer_name
  FROM customers c
  WHERE c.organization_id = $1
  ORDER BY c.created_at DESC
  LIMIT 5
)
ORDER BY timestamp DESC
LIMIT 10;
```

#### Implementação Sugerida
```typescript
// src/services/dashboard/activity.service.ts

export class ActivityService {
  async getRecentActivity(organizationId: string): Promise<RecentActivityData> {
    // Se tiver tabela de eventos
    const events = await this.getAuditLogs(organizationId, 10);

    // Mapear para formato do frontend
    const activities = events.map(event => ({
      id: event.id,
      type: event.type,
      description: this.buildDescription(event),
      timestamp: event.timestamp.toISOString(),
      related_entity_id: event.related_entity_id,
      related_entity_name: event.related_entity_name,
      value: event.value,
    }));

    return { activities };
  }

  private buildDescription(event: AuditLogEvent): string {
    switch (event.type) {
      case 'budget_created':
        return `Orçamento "${event.budget_title}" criado`;

      case 'budget_sent':
        return `Orçamento "${event.budget_title}" enviado para ${event.customer_name}`;

      case 'budget_approved':
        return `Orçamento "${event.budget_title}" aprovado por ${event.customer_name}`;

      case 'budget_rejected':
        return `Orçamento "${event.budget_title}" rejeitado por ${event.customer_name}`;

      case 'budget_printing':
        return `Impressão iniciada: "${event.budget_title}"`;

      case 'budget_completed':
        return `Orçamento "${event.budget_title}" concluído`;

      case 'customer_created':
        return `Novo cliente cadastrado: ${event.customer_name}`;

      default:
        return 'Atividade registrada';
    }
  }
}
```

#### Testes
- [ ] Testar com organização sem atividades
- [ ] Verificar ordenação (mais recente primeiro)
- [ ] Testar formatação de descrições
- [ ] Verificar links para entidades

#### Notas Técnicas
- Se não tiver tabela de eventos, considerar criar uma (melhor prática)
- Descrições devem ser em português e amigáveis
- `value` é opcional (clientes não têm valor)
- Considerar adicionar mais tipos de eventos no futuro
- Cache: 2-5 minutos

---

### Task #5: GET /api/dashboard/top-customers

**Tipo:** Backend API
**Prioridade:** Média (TIER 2)
**Estimativa:** P (4-6h)
**Dependências:** Task #0

#### Descrição
Endpoint que retorna os top 5 clientes por receita total, incluindo estatísticas como ticket médio, número de orçamentos e status de atividade.

Alimenta a tabela "Top Clientes" no dashboard.

#### Acceptance Criteria
- [ ] Retorna top 5 clientes por receita
- [ ] Calcula receita total (budgets approved/completed)
- [ ] Calcula ticket médio (receita / nº budgets)
- [ ] Identifica status (ativo se budget nos últimos 30 dias)
- [ ] Inclui data do último orçamento
- [ ] Ordena por receita (decrescente)

#### Response Format
```typescript
{
  customers: [
    {
      id: "customer-uuid-1",
      name: "Tech Solutions Brasil",
      total_revenue: 5400000,  // R$ 54.000
      budget_count: 12,
      average_ticket: 450000,  // R$ 4.500
      last_budget_date: "2025-01-15T10:00:00Z",
      status: "active"
    },
    {
      id: "customer-uuid-2",
      name: "Indústria XYZ Ltda",
      total_revenue: 3800000,
      budget_count: 8,
      average_ticket: 475000,
      last_budget_date: "2024-12-20T14:30:00Z",
      status: "inactive"
    }
    // ... mais 3 clientes
  ],
  total_customers: 45 // total na organização
}
```

#### Queries SQL Necessárias

```sql
SELECT
  c.id,
  c.name,
  COUNT(b.id) as budget_count,
  COALESCE(SUM(
    CASE
      WHEN b.status IN ('approved', 'completed', 'printing')
      THEN b.total_cost
      ELSE 0
    END
  ), 0) as total_revenue,
  MAX(b.created_at) as last_budget_date,
  CASE
    WHEN MAX(b.created_at) >= NOW() - INTERVAL '30 days' THEN 'active'
    ELSE 'inactive'
  END as status
FROM customers c
LEFT JOIN budgets b ON b.customer_id = c.id
WHERE c.organization_id = $1
GROUP BY c.id, c.name
HAVING COUNT(b.id) > 0  -- apenas clientes com budgets
ORDER BY total_revenue DESC
LIMIT 5;

-- Total de clientes (query separada)
SELECT COUNT(*) as total_customers
FROM customers
WHERE organization_id = $1;
```

#### Implementação Sugerida
```typescript
// src/services/dashboard/customers.service.ts

export class CustomersService {
  async getTopCustomers(organizationId: string): Promise<TopCustomersData> {
    const customers = await prisma.$queryRaw`
      SELECT
        c.id,
        c.name,
        COUNT(b.id)::int as budget_count,
        COALESCE(SUM(
          CASE WHEN b.status IN ('approved', 'completed', 'printing')
          THEN b.total_cost ELSE 0 END
        ), 0)::bigint as total_revenue,
        MAX(b.created_at) as last_budget_date,
        CASE
          WHEN MAX(b.created_at) >= NOW() - INTERVAL '30 days'
          THEN 'active'::text
          ELSE 'inactive'::text
        END as status
      FROM customers c
      LEFT JOIN budgets b ON b.customer_id = c.id
      WHERE c.organization_id = ${organizationId}
      GROUP BY c.id, c.name
      HAVING COUNT(b.id) > 0
      ORDER BY total_revenue DESC
      LIMIT 5
    `;

    const totalCustomers = await prisma.customer.count({
      where: { organizationId },
    });

    // Calcular average_ticket no código
    const customersWithTicket = customers.map(c => ({
      ...c,
      average_ticket: c.budget_count > 0
        ? Math.round(c.total_revenue / c.budget_count)
        : 0,
    }));

    return {
      customers: customersWithTicket,
      total_customers: totalCustomers,
    };
  }
}
```

#### Testes
- [ ] Testar com menos de 5 clientes
- [ ] Testar cliente sem budgets (não deve aparecer)
- [ ] Verificar cálculo de average_ticket
- [ ] Testar status active/inactive
- [ ] Verificar ordenação por receita

#### Notas Técnicas
- Considerar apenas budgets que geraram receita (approved/completed/printing)
- Status "active" = budget nos últimos 30 dias
- Average ticket calculado: `total_revenue / budget_count`
- Clientes sem budgets não aparecem no ranking
- Cache: 10 minutos

---

### Task #6: GET /api/dashboard/operational-insights

**Tipo:** Backend API
**Prioridade:** Média (TIER 2)
**Estimativa:** M (1 dia)
**Dependências:** Task #0

#### Descrição
Endpoint que retorna métricas operacionais do negócio: ticket médio, margem de lucro, tempo de impressão total e taxa de rejeição. Cada métrica inclui comparação com mês anterior.

Alimenta os 4 cards de "Insights Operacionais".

#### Acceptance Criteria
- [ ] Calcula ticket médio do mês atual
- [ ] Calcula margem de lucro média (profit_percentage)
- [ ] Calcula tempo total de impressão (soma de todos budget_items)
- [ ] Calcula taxa de rejeição (rejected / sent)
- [ ] Cada métrica tem % de mudança vs mês anterior
- [ ] Trata divisão por zero

#### Response Format
```typescript
{
  average_ticket: 145000,        // R$ 1.450
  average_ticket_change: 12.5,   // % vs mês anterior
  average_profit_margin: 35.8,   // %
  profit_margin_change: -2.3,
  total_print_time_hours: 156.5, // horas
  print_time_change: 18.2,
  rejection_rate: 15.3,          // %
  rejection_rate_change: -4.5    // negativo é bom (menos rejeições)
}
```

#### Queries SQL Necessárias

```sql
-- 1. Ticket médio atual
SELECT AVG(total_cost) as average_ticket
FROM budgets
WHERE organization_id = $1
  AND status IN ('approved', 'completed', 'printing')
  AND created_at >= date_trunc('month', CURRENT_DATE);

-- 2. Ticket médio mês anterior
SELECT AVG(total_cost) as average_ticket
FROM budgets
WHERE organization_id = $1
  AND status IN ('approved', 'completed', 'printing')
  AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
  AND created_at < date_trunc('month', CURRENT_DATE);

-- 3. Margem de lucro média atual
SELECT AVG(profit_percentage) as average_profit_margin
FROM budgets
WHERE organization_id = $1
  AND status IN ('approved', 'completed')
  AND created_at >= date_trunc('month', CURRENT_DATE);

-- 4. Margem de lucro mês anterior
SELECT AVG(profit_percentage) as average_profit_margin
FROM budgets
WHERE organization_id = $1
  AND status IN ('approved', 'completed')
  AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
  AND created_at < date_trunc('month', CURRENT_DATE);

-- 5. Tempo total de impressão atual (em minutos)
SELECT SUM(
  (bi.print_time_hours * 60 + bi.print_time_minutes) * bi.quantity
) as total_minutes
FROM budget_items bi
JOIN budgets b ON b.id = bi.budget_id
WHERE b.organization_id = $1
  AND b.status IN ('printing', 'completed')
  AND b.created_at >= date_trunc('month', CURRENT_DATE);

-- 6. Tempo de impressão mês anterior
SELECT SUM(
  (bi.print_time_hours * 60 + bi.print_time_minutes) * bi.quantity
) as total_minutes
FROM budget_items bi
JOIN budgets b ON b.id = bi.budget_id
WHERE b.organization_id = $1
  AND b.status IN ('printing', 'completed')
  AND b.created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
  AND b.created_at < date_trunc('month', CURRENT_DATE);

-- 7. Taxa de rejeição atual
SELECT
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) * 100.0 /
  NULLIF(COUNT(CASE WHEN status IN ('sent', 'approved', 'rejected') THEN 1 END), 0) as rejection_rate
FROM budgets
WHERE organization_id = $1
  AND created_at >= date_trunc('month', CURRENT_DATE);

-- 8. Taxa de rejeição mês anterior
SELECT
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) * 100.0 /
  NULLIF(COUNT(CASE WHEN status IN ('sent', 'approved', 'rejected') THEN 1 END), 0) as rejection_rate
FROM budgets
WHERE organization_id = $1
  AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
  AND created_at < date_trunc('month', CURRENT_DATE);
```

#### Implementação Sugerida
```typescript
// src/services/dashboard/insights.service.ts

export class InsightsService {
  async getOperationalInsights(organizationId: string): Promise<OperationalInsights> {
    const currentMonth = startOfMonth(new Date());
    const lastMonth = subMonths(currentMonth, 1);

    const [
      currentTicket,
      lastTicket,
      currentMargin,
      lastMargin,
      currentPrintTime,
      lastPrintTime,
      currentRejection,
      lastRejection,
    ] = await Promise.all([
      this.getAverageTicket(organizationId, currentMonth),
      this.getAverageTicket(organizationId, lastMonth, currentMonth),
      this.getProfitMargin(organizationId, currentMonth),
      this.getProfitMargin(organizationId, lastMonth, currentMonth),
      this.getTotalPrintTime(organizationId, currentMonth),
      this.getTotalPrintTime(organizationId, lastMonth, currentMonth),
      this.getRejectionRate(organizationId, currentMonth),
      this.getRejectionRate(organizationId, lastMonth, currentMonth),
    ]);

    return {
      average_ticket: Math.round(currentTicket || 0),
      average_ticket_change: this.calculateChange(currentTicket, lastTicket),
      average_profit_margin: Number((currentMargin || 0).toFixed(1)),
      profit_margin_change: this.calculateChange(currentMargin, lastMargin),
      total_print_time_hours: Number((currentPrintTime / 60).toFixed(1)),
      print_time_change: this.calculateChange(currentPrintTime, lastPrintTime),
      rejection_rate: Number((currentRejection || 0).toFixed(1)),
      rejection_rate_change: this.calculateChange(currentRejection, lastRejection),
    };
  }

  private async getTotalPrintTime(
    organizationId: string,
    startDate: Date,
    endDate?: Date
  ): Promise<number> {
    const result = await prisma.$queryRaw<[{ total_minutes: number }]>`
      SELECT COALESCE(SUM(
        (bi.print_time_hours * 60 + bi.print_time_minutes) * bi.quantity
      ), 0)::int as total_minutes
      FROM budget_items bi
      JOIN budgets b ON b.id = bi.budget_id
      WHERE b.organization_id = ${organizationId}
        AND b.status IN ('printing', 'completed')
        AND b.created_at >= ${startDate}
        ${endDate ? Prisma.sql`AND b.created_at < ${endDate}` : Prisma.empty}
    `;

    return result[0].total_minutes;
  }
}
```

#### Testes
- [ ] Testar com mês sem dados (retornar 0)
- [ ] Testar cálculo de tempo de impressão (horas + minutos)
- [ ] Verificar divisão por zero em taxa de rejeição
- [ ] Testar mudança negativa (melhoria na rejeição)

#### Notas Técnicas
- Tempo de impressão: `(hours * 60 + minutes) * quantity` = minutos totais, depois dividir por 60
- Taxa de rejeição: considerar apenas budgets que foram "sent" (não contar drafts)
- Para margem de lucro, usar campo `profit_percentage` do budget
- Mudança negativa na taxa de rejeição é POSITIVA (menos rejeições = bom)

---

### Task #7: GET /api/dashboard/top-filaments

**Tipo:** Backend API
**Prioridade:** Baixa (TIER 3)
**Estimativa:** M (6-8h)
**Dependências:** Task #0

#### Descrição
Endpoint que retorna os top 5 filamentos mais utilizados (produtos específicos), com informações de marca, cor, quantidade usada e valor total.

Alimenta o gráfico "Top Filamentos" (barras coloridas).

#### Acceptance Criteria
- [ ] Retorna top 5 filamentos por quantidade usada (usage_count)
- [ ] Inclui informações de marca e cor
- [ ] Calcula total de gramas utilizadas
- [ ] Calcula valor total gasto com esse filamento
- [ ] Retorna `color_preview` para renderizar barras coloridas
- [ ] Ordena por usage_count (quantas vezes usado)

#### Response Format
```typescript
{
  filaments: [
    {
      id: "filament-uuid-1",
      name: "PLA Premium",
      brand: "Bambu Lab",
      color: "Preto",
      color_preview: "#000000",  // hex, gradient, etc
      total_grams: 3500,
      total_value: 28000,  // R$ 280 em centavos
      usage_count: 24      // usado em 24 budgets
    },
    {
      id: "filament-uuid-2",
      name: "PETG Strong",
      brand: "Prusament",
      color: "Vermelho",
      color_preview: "#dc2626",
      total_grams: 2800,
      total_value: 35000,
      usage_count: 18
    }
    // ... mais 3 filamentos
  ],
  total_filament_cost: 150000  // soma de todos os filamentos
}
```

#### Queries SQL Necessárias

```sql
SELECT
  f.id,
  f.name,
  br.name as brand,
  f.color_name as color,
  f.color_preview,
  SUM(bif.quantity_grams) as total_grams,
  SUM(bif.quantity_grams * f.price_per_kg / 1000) as total_value,
  COUNT(DISTINCT bi.budget_id) as usage_count
FROM budget_item_filaments bif
JOIN filaments f ON f.id = bif.filament_id
JOIN brands br ON br.id = f.brand_id
JOIN budget_items bi ON bi.id = bif.budget_item_id
JOIN budgets b ON b.id = bi.budget_id
WHERE b.organization_id = $1
  AND b.status IN ('approved', 'printing', 'completed')
GROUP BY f.id, f.name, br.name, f.color_name, f.color_preview
ORDER BY usage_count DESC
LIMIT 5;

-- Total cost de filamentos
SELECT SUM(bif.quantity_grams * f.price_per_kg / 1000) as total_cost
FROM budget_item_filaments bif
JOIN filaments f ON f.id = bif.filament_id
JOIN budget_items bi ON bi.id = bif.budget_item_id
JOIN budgets b ON b.id = bi.budget_id
WHERE b.organization_id = $1
  AND b.status IN ('approved', 'printing', 'completed');
```

#### Implementação Sugerida
```typescript
// src/services/dashboard/filaments.service.ts

export class FilamentsService {
  async getTopFilaments(organizationId: string): Promise<TopFilamentsData> {
    const filaments = await prisma.$queryRaw<TopFilament[]>`
      SELECT
        f.id,
        f.name,
        br.name as brand,
        f.color_name as color,
        f.color_preview,
        COALESCE(SUM(bif.quantity_grams), 0)::int as total_grams,
        COALESCE(SUM(bif.quantity_grams * f.price_per_kg / 1000), 0)::bigint as total_value,
        COUNT(DISTINCT bi.budget_id)::int as usage_count
      FROM budget_item_filaments bif
      JOIN filaments f ON f.id = bif.filament_id
      JOIN brands br ON br.id = f.brand_id
      JOIN budget_items bi ON bi.id = bif.budget_item_id
      JOIN budgets b ON b.id = bi.budget_id
      WHERE b.organization_id = ${organizationId}
        AND b.status IN ('approved', 'printing', 'completed')
      GROUP BY f.id, f.name, br.name, f.color_name, f.color_preview
      ORDER BY usage_count DESC
      LIMIT 5
    `;

    const totalCost = await this.getTotalFilamentCost(organizationId);

    return {
      filaments,
      total_filament_cost: totalCost,
    };
  }
}
```

#### Testes
- [ ] Testar com menos de 5 filamentos
- [ ] Verificar cálculo de valor (grams * price_per_kg / 1000)
- [ ] Testar com filamentos sem uso
- [ ] Verificar ordenação por usage_count

#### Notas Técnicas
- **Importante:** `color_preview` pode ser:
  - Hex simples: `"#000000"`
  - Gradient CSS: `"linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)"`
  - Duo-tone/Rainbow: frontend já suporta
- Considerar apenas budgets que foram executados (approved/printing/completed)
- Calcular valor: `(grams / 1000) * price_per_kg`
- Usage count = número de budgets diferentes que usaram esse filamento

---

### Task #8: GET /api/dashboard/top-materials ⭐ NOVO

**Tipo:** Backend API
**Prioridade:** Baixa (TIER 3)
**Estimativa:** M (6-8h)
**Dependências:** Task #0

#### Descrição
Endpoint que retorna agregação de uso por **tipo de material** (PLA, ABS, PETG, TPU, etc), mostrando distribuição geral de materiais usados na organização.

Complementa o endpoint de filamentos, fornecendo visão macro por categoria.

Alimenta o gráfico "Top Materiais" (barras horizontais).

#### Acceptance Criteria
- [ ] Retorna todos os tipos de material usados (não limitar a 5)
- [ ] Agrega por material.name (PLA, ABS, etc)
- [ ] Calcula total de gramas por material
- [ ] Calcula valor total por material
- [ ] Calcula porcentagem em relação ao total
- [ ] Conta quantos filamentos diferentes de cada material
- [ ] Ordena por total_grams (decrescente)
- [ ] Retorna cor padronizada por tipo

#### Response Format
```typescript
{
  materials: [
    {
      material_type: "PLA",
      total_grams: 12500,
      total_value: 125000,  // R$ 1.250
      percentage: 45.2,     // % do total
      filament_count: 8,    // 8 filamentos diferentes de PLA
      color: "#3B82F6"      // azul (padronizado)
    },
    {
      material_type: "PETG",
      total_grams: 6800,
      total_value: 95000,
      percentage: 24.6,
      filament_count: 5,
      color: "#8B5CF6"      // roxo
    },
    {
      material_type: "ABS",
      total_grams: 5200,
      total_value: 68000,
      percentage: 18.8,
      filament_count: 4,
      color: "#EF4444"      // vermelho
    },
    {
      material_type: "TPU",
      total_grams: 3100,
      total_value: 52000,
      percentage: 11.4,
      filament_count: 2,
      color: "#F97316"      // laranja
    }
  ],
  total_usage: 27600  // soma de todos total_grams
}
```

#### Queries SQL Necessárias

```sql
WITH material_usage AS (
  SELECT
    m.name as material_type,
    SUM(bif.quantity_grams) as total_grams,
    SUM(bif.quantity_grams * f.price_per_kg / 1000) as total_value,
    COUNT(DISTINCT f.id) as filament_count
  FROM budget_item_filaments bif
  JOIN filaments f ON f.id = bif.filament_id
  JOIN materials m ON m.id = f.material_id
  JOIN budget_items bi ON bi.id = bif.budget_item_id
  JOIN budgets b ON b.id = bi.budget_id
  WHERE b.organization_id = $1
    AND b.status IN ('approved', 'printing', 'completed')
  GROUP BY m.name
),
total AS (
  SELECT SUM(total_grams) as total_usage
  FROM material_usage
)
SELECT
  mu.material_type,
  mu.total_grams::int,
  mu.total_value::bigint,
  (mu.total_grams * 100.0 / t.total_usage)::numeric(5,1) as percentage,
  mu.filament_count::int,
  t.total_usage::int
FROM material_usage mu
CROSS JOIN total t
ORDER BY mu.total_grams DESC;
```

#### Implementação Sugerida
```typescript
// src/services/dashboard/materials.service.ts

// Cores padronizadas por tipo de material
const MATERIAL_COLORS: Record<string, string> = {
  'PLA': '#3B82F6',     // Azul
  'PETG': '#8B5CF6',    // Roxo
  'ABS': '#EF4444',     // Vermelho
  'TPU': '#F97316',     // Laranja
  'ASA': '#EAB308',     // Amarelo
  'Nylon': '#22C55E',   // Verde
  'HIPS': '#EC4899',    // Rosa
  'PC': '#6366F1',      // Indigo
};

export class MaterialsService {
  async getTopMaterials(organizationId: string): Promise<TopMaterialsData> {
    const materials = await prisma.$queryRaw<MaterialUsage[]>`
      WITH material_usage AS (
        SELECT
          m.name as material_type,
          SUM(bif.quantity_grams) as total_grams,
          SUM(bif.quantity_grams * f.price_per_kg / 1000) as total_value,
          COUNT(DISTINCT f.id) as filament_count
        FROM budget_item_filaments bif
        JOIN filaments f ON f.id = bif.filament_id
        JOIN materials m ON m.id = f.material_id
        JOIN budget_items bi ON bi.id = bif.budget_item_id
        JOIN budgets b ON b.id = bi.budget_id
        WHERE b.organization_id = ${organizationId}
          AND b.status IN ('approved', 'printing', 'completed')
        GROUP BY m.name
      ),
      total AS (
        SELECT SUM(total_grams) as total_usage
        FROM material_usage
      )
      SELECT
        mu.material_type,
        mu.total_grams::int,
        mu.total_value::bigint,
        (mu.total_grams * 100.0 / t.total_usage)::numeric(5,1) as percentage,
        mu.filament_count::int,
        t.total_usage::int
      FROM material_usage mu
      CROSS JOIN total t
      ORDER BY mu.total_grams DESC
    `;

    // Adicionar cores padronizadas
    const materialsWithColors = materials.map(m => ({
      ...m,
      color: MATERIAL_COLORS[m.material_type] || '#6B7280', // cinza default
    }));

    const totalUsage = materials[0]?.total_usage || 0;

    return {
      materials: materialsWithColors,
      total_usage: totalUsage,
    };
  }
}
```

#### Testes
- [ ] Testar com organização usando apenas 1 tipo de material
- [ ] Verificar soma de percentagens = 100%
- [ ] Testar com material não mapeado em MATERIAL_COLORS (deve usar cinza)
- [ ] Verificar ordenação por total_grams

#### Notas Técnicas
- **Diferença entre Task #7 e #8:**
  - #7 (filaments): produtos específicos (Bambu Lab PLA Preto, eSun PETG Azul)
  - #8 (materials): categorias gerais (PLA, PETG, ABS)
- Cores são **hardcoded** no backend (mapa de tipos → cores)
- Frontend renderiza barras horizontais (diferente de #7 que é vertical)
- Não limitar a 5 - retornar todos os materiais usados
- Cache: 10 minutos

---

### Task #9: GET /api/dashboard/goals-alerts

**Tipo:** Backend API
**Prioridade:** Baixa (TIER 3)
**Estimativa:** M (1 dia)
**Dependências:** Task #1

#### Descrição
Endpoint que retorna metas da organização (revenue, clientes, conversão) e alertas automáticos (orçamentos pendentes, clientes inativos, etc).

Alimenta a seção "Metas e Alertas".

#### Acceptance Criteria
- [ ] Retorna 2-4 metas com progresso
- [ ] Calcula status da meta (on_track, at_risk, behind)
- [ ] Gera alertas baseados em condições
- [ ] Alertas têm link de ação
- [ ] Metas podem ser configuráveis (tabela ou hardcoded)

#### Response Format
```typescript
{
  goals: [
    {
      id: "goal-1",
      type: "revenue",
      title: "Meta de Receita Mensal",
      target: 10000000,    // R$ 100k
      current: 7500000,    // R$ 75k
      progress: 75.0,      // %
      status: "on_track"   // ou "at_risk" ou "behind"
    },
    {
      id: "goal-2",
      type: "customers",
      title: "Novos Clientes este Mês",
      target: 10,
      current: 8,
      progress: 80.0,
      status: "on_track"
    }
  ],
  alerts: [
    {
      id: "alert-1",
      type: "warning",
      title: "Orçamentos Pendentes",
      description: "7 orçamentos enviados há mais de 7 dias sem resposta",
      count: 7,
      action_url: "/budgets?status=sent&old=true",
      timestamp: "2025-01-20T10:00:00Z"
    },
    {
      id: "alert-2",
      type: "info",
      title: "Clientes Inativos",
      description: "12 clientes sem orçamentos há mais de 30 dias",
      count: 12,
      action_url: "/customers?status=inactive",
      timestamp: "2025-01-20T10:00:00Z"
    }
  ]
}
```

#### Queries SQL Necessárias

```sql
-- 1. Metas (buscar de configuração ou hardcoded)
-- Opção A: Tabela organization_settings
SELECT
  monthly_revenue_goal,
  monthly_customers_goal,
  target_conversion_rate
FROM organization_settings
WHERE organization_id = $1;

-- 2. Progresso das metas (reusar queries de Task #1)
-- ...

-- 3. Alerta: Orçamentos pendentes > 7 dias
SELECT COUNT(*) as pending_count
FROM budgets
WHERE organization_id = $1
  AND status = 'sent'
  AND created_at < NOW() - INTERVAL '7 days';

-- 4. Alerta: Clientes inativos > 30 dias
SELECT COUNT(DISTINCT c.id) as inactive_count
FROM customers c
WHERE c.organization_id = $1
  AND c.id NOT IN (
    SELECT DISTINCT customer_id
    FROM budgets
    WHERE organization_id = $1
      AND created_at >= NOW() - INTERVAL '30 days'
  );

-- 5. Alerta: Taxa de conversão baixa
-- Reusar query de taxa de conversão, comparar com threshold (ex: < 50%)
```

#### Implementação Sugerida
```typescript
// src/services/dashboard/goals.service.ts

export class GoalsService {
  async getGoalsAlerts(organizationId: string): Promise<GoalsAlertsData> {
    // Buscar configurações (ou usar defaults)
    const settings = await this.getOrganizationSettings(organizationId);

    // Buscar dados atuais
    const currentRevenue = await this.getCurrentMonthRevenue(organizationId);
    const newCustomers = await this.getNewCustomersCount(organizationId);
    const conversionRate = await this.getConversionRate(organizationId);

    // Montar metas
    const goals = [
      this.buildRevenueGoal(settings.monthly_revenue_goal, currentRevenue),
      this.buildCustomersGoal(settings.monthly_customers_goal, newCustomers),
      this.buildConversionGoal(settings.target_conversion_rate, conversionRate),
    ];

    // Gerar alertas dinamicamente
    const alerts = await this.generateAlerts(organizationId);

    return { goals, alerts };
  }

  private buildRevenueGoal(target: number, current: number): Goal {
    const progress = (current / target) * 100;
    const monthProgress = this.getCurrentMonthProgress(); // % do mês já passou

    return {
      id: 'goal-revenue',
      type: 'revenue',
      title: 'Meta de Receita Mensal',
      target,
      current,
      progress: Number(progress.toFixed(1)),
      status: this.calculateGoalStatus(progress, monthProgress),
    };
  }

  private calculateGoalStatus(
    progress: number,
    monthProgress: number
  ): 'on_track' | 'at_risk' | 'behind' {
    if (progress >= monthProgress) {
      return 'on_track';
    }
    if (progress < monthProgress - 20) {
      return 'behind';
    }
    return 'at_risk';
  }

  private async generateAlerts(organizationId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Alerta: Orçamentos pendentes
    const pendingCount = await this.getPendingBudgetsCount(organizationId);
    if (pendingCount > 5) {
      alerts.push({
        id: 'alert-pending-budgets',
        type: 'warning',
        title: 'Orçamentos Pendentes',
        description: `${pendingCount} orçamentos enviados há mais de 7 dias sem resposta`,
        count: pendingCount,
        action_url: '/budgets?status=sent',
        timestamp: new Date().toISOString(),
      });
    }

    // Alerta: Clientes inativos
    const inactiveCount = await this.getInactiveCustomersCount(organizationId);
    if (inactiveCount > 10) {
      alerts.push({
        id: 'alert-inactive-customers',
        type: 'info',
        title: 'Clientes Inativos',
        description: `${inactiveCount} clientes sem orçamentos há mais de 30 dias`,
        count: inactiveCount,
        action_url: '/customers?status=inactive',
        timestamp: new Date().toISOString(),
      });
    }

    // Alerta: Taxa de conversão baixa
    const conversionRate = await this.getConversionRate(organizationId);
    if (conversionRate < 50) {
      alerts.push({
        id: 'alert-low-conversion',
        type: 'danger',
        title: 'Taxa de Conversão Baixa',
        description: 'Taxa de conversão abaixo de 50%. Revise sua estratégia.',
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }

  private getCurrentMonthProgress(): number {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    return (currentDay / daysInMonth) * 100;
  }
}
```

#### Testes
- [ ] Testar cálculo de status (on_track, at_risk, behind)
- [ ] Testar geração de alertas condicionais
- [ ] Verificar que alertas não aparecem se condição não atendida
- [ ] Testar com metas customizadas

#### Notas Técnicas
- Metas podem vir de tabela `organization_settings` ou serem hardcoded
- Status da meta depende do progresso vs % do mês que já passou
  - Se progresso >= mês_progresso → on_track
  - Se progresso < mês_progresso - 20% → behind
  - Caso contrário → at_risk
- Alertas são **gerados dinamicamente** baseado em condições
- Nem sempre haverá alertas (array pode ser vazio)
- Cache: 5 minutos

---

## 🔧 Task #10: Índices e Otimizações de Banco

**Tipo:** Database Optimization
**Prioridade:** Média
**Estimativa:** P (2-3h)
**Dependências:** Tasks #1-#9 implementadas

#### Descrição
Criar índices compostos no banco de dados para otimizar as queries do dashboard, que fazem muitas agregações e filtros por `organization_id` + `status` + `created_at`.

#### Acceptance Criteria
- [ ] Índices criados em todas as tabelas principais
- [ ] Queries do dashboard < 500ms
- [ ] EXPLAIN ANALYZE mostra uso dos índices
- [ ] Sem impacto negativo em writes

#### Índices Recomendados

```sql
-- Tabela: budgets
-- Índice principal para queries do dashboard
CREATE INDEX idx_budgets_org_status_date
ON budgets (organization_id, status, created_at DESC);

-- Índice para queries de conversão
CREATE INDEX idx_budgets_org_date
ON budgets (organization_id, created_at DESC);

-- Tabela: customers
CREATE INDEX idx_customers_org_date
ON customers (organization_id, created_at DESC);

-- Tabela: budget_items
CREATE INDEX idx_budget_items_budget_id
ON budget_items (budget_id);

-- Tabela: budget_item_filaments
CREATE INDEX idx_bif_budget_item_id
ON budget_item_filaments (budget_item_id);

CREATE INDEX idx_bif_filament_id
ON budget_item_filaments (filament_id);

-- Tabela: filaments
CREATE INDEX idx_filaments_brand_material
ON filaments (brand_id, material_id);
```

#### Validação
```sql
-- Testar cada query principal com EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT SUM(total_cost)
FROM budgets
WHERE organization_id = 'xxx'
  AND status IN ('approved', 'completed')
  AND created_at >= '2025-01-01';

-- Deve mostrar "Index Scan using idx_budgets_org_status_date"
```

#### Notas Técnicas
- Índices compostos devem seguir ordem: `organization_id` → `status` → `created_at`
- `DESC` no `created_at` otimiza queries com `ORDER BY created_at DESC`
- Monitorar impacto em writes (INSERTs/UPDATEs ficam ~5-10% mais lentos)
- Considerar `CONCURRENTLY` em produção para não bloquear tabela

---

## 🚀 Task #11: Implementar Cache com Redis (Opcional)

**Tipo:** Performance Optimization
**Prioridade:** Baixa
**Estimativa:** P (4h)
**Dependências:** Tasks #1-#9

#### Descrição
Implementar camada de cache com Redis para endpoints do dashboard, reduzindo carga no banco e melhorando tempo de resposta.

#### Acceptance Criteria
- [ ] Redis configurado e conectado
- [ ] Endpoints principais com cache de 5-10 minutos
- [ ] Cache invalidado ao criar/atualizar budgets
- [ ] Fallback gracioso se Redis estiver down

#### Implementação Sugerida

```go
// core/cache/redis_cache.go
package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"spooliq/core/logger"
)

type RedisCache struct {
	client *redis.Client
	logger logger.Logger
}

func NewRedisCache(redisURL string, logger logger.Logger) *RedisCache {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		logger.Error(context.Background(), "Failed to parse Redis URL", map[string]interface{}{
			"error": err.Error(),
		})
		return nil
	}

	client := redis.NewClient(opts)

	// Testar conexão
	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		logger.Warn(ctx, "Redis not available, cache disabled", map[string]interface{}{
			"error": err.Error(),
		})
	}

	return &RedisCache{
		client: client,
		logger: logger,
	}
}

func (c *RedisCache) Get(ctx context.Context, key string, dest interface{}) error {
	if c.client == nil {
		return fmt.Errorf("redis client not initialized")
	}

	val, err := c.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return fmt.Errorf("cache miss")
	}
	if err != nil {
		c.logger.Error(ctx, "Cache get error", map[string]interface{}{
			"key":   key,
			"error": err.Error(),
		})
		return err
	}

	if err := json.Unmarshal([]byte(val), dest); err != nil {
		return fmt.Errorf("failed to unmarshal cache data: %w", err)
	}

	return nil
}

func (c *RedisCache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if c.client == nil {
		return nil // Silently skip if Redis unavailable
	}

	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal value: %w", err)
	}

	if err := c.client.Set(ctx, key, data, ttl).Err(); err != nil {
		c.logger.Error(ctx, "Cache set error", map[string]interface{}{
			"key":   key,
			"error": err.Error(),
		})
		return err
	}

	return nil
}

func (c *RedisCache) Invalidate(ctx context.Context, pattern string) error {
	if c.client == nil {
		return nil
	}

	keys, err := c.client.Keys(ctx, pattern).Result()
	if err != nil {
		c.logger.Error(ctx, "Cache invalidate error", map[string]interface{}{
			"pattern": pattern,
			"error":   err.Error(),
		})
		return err
	}

	if len(keys) > 0 {
		if err := c.client.Del(ctx, keys...).Err(); err != nil {
			return err
		}
	}

	return nil
}

// Decorator pattern para usecase com cache
type CachedOverviewUsecase struct {
	baseUsecase *usecases.GetOverviewUsecase
	cache       *RedisCache
	cacheTTL    time.Duration
}

func NewCachedOverviewUsecase(
	baseUsecase *usecases.GetOverviewUsecase,
	cache *RedisCache,
) *CachedOverviewUsecase {
	return &CachedOverviewUsecase{
		baseUsecase: baseUsecase,
		cache:       cache,
		cacheTTL:    5 * time.Minute,
	}
}

func (uc *CachedOverviewUsecase) Handle(c *gin.Context) {
	ctx := c.Request.Context()
	organizationID := helpers.GetOrganizationID(c)

	cacheKey := fmt.Sprintf("dashboard:overview:%s", organizationID)

	// Tentar buscar do cache
	var cachedData entities.DashboardOverview
	if err := uc.cache.Get(ctx, cacheKey, &cachedData); err == nil {
		c.JSON(200, gin.H{"data": cachedData, "cached": true})
		return
	}

	// Cache miss - executar usecase normal
	result, err := uc.baseUsecase.Execute(ctx, organizationID)
	if err != nil {
		appError := errors.UsecaseError("failed to get overview", err)
		c.JSON(appError.HTTPStatus(), gin.H{"error": appError.Message()})
		return
	}

	// Salvar no cache (ignora erro se Redis down)
	_ = uc.cache.Set(ctx, cacheKey, result, uc.cacheTTL)

	c.JSON(200, gin.H{"data": result})
}

// Invalidar cache ao criar/atualizar budget
// features/budget/domain/usecases/create_budget_usecase.go
func (uc *CreateBudgetUsecase) Execute(ctx context.Context, dto CreateBudgetDTO) (*entities.Budget, error) {
	// Criar budget
	budget, err := uc.repo.Create(ctx, dto)
	if err != nil {
		return nil, err
	}

	// Invalidar caches do dashboard
	pattern := fmt.Sprintf("dashboard:*:%s", budget.OrganizationID)
	_ = uc.cache.Invalidate(ctx, pattern)

	return budget, nil
}
```

#### go.mod dependencies
```go
require (
	github.com/redis/go-redis/v9 v9.7.0
)
```

#### TTLs Recomendados
- Overview: 5 minutos
- Revenue Trend: 10 minutos
- Top Customers: 10 minutos
- Recent Activity: 2 minutos
- Goals/Alerts: 5 minutos

#### Notas Técnicas
- Cache key pattern: `dashboard:{endpoint}:{organization_id}`
- Invalidar cache ao: criar budget, atualizar status, criar cliente
- Sempre ter fallback se Redis falhar (retornar dado do banco)
- Monitorar hit rate do cache

---

## 📚 Documentação e Testes

### Task #12: Testes Unitários dos Usecases e Repositories

**Tipo:** Testing
**Prioridade:** Média
**Estimativa:** G (2 dias)
**Dependências:** Tasks #1-#9

#### Descrição
Criar testes unitários para todos os usecases e repositories do dashboard, garantindo cálculos corretos e tratamento de edge cases.

#### Acceptance Criteria
- [ ] Cobertura de testes > 80% (usar `go test -cover`)
- [ ] Testes para divisão por zero
- [ ] Testes para organização vazia
- [ ] Testes para cálculos de percentagem
- [ ] Testes para aggregações
- [ ] Mocks de repository usando testify/mock

#### Ferramentas
```bash
# Instalar dependências de teste
go get github.com/stretchr/testify/assert
go get github.com/stretchr/testify/mock
go get github.com/DATA-DOG/go-sqlmock

# Rodar testes
go test ./features/dashboard/...

# Cobertura
go test -cover ./features/dashboard/...
go test -coverprofile=coverage.out ./features/dashboard/...
go tool cover -html=coverage.out
```

#### Exemplo de Testes

```go
// features/dashboard/domain/usecases/get_overview_usecase_test.go
package usecases_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"spooliq/features/dashboard/domain/entities"
	"spooliq/features/dashboard/domain/usecases"
)

// Mock Repository
type MockDashboardRepository struct {
	mock.Mock
}

func (m *MockDashboardRepository) GetCurrentMonthRevenue(
	ctx context.Context,
	organizationID string,
	startDate, endDate time.Time,
) (int64, error) {
	args := m.Called(ctx, organizationID, startDate, endDate)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockDashboardRepository) GetConversionRate(
	ctx context.Context,
	organizationID string,
	startDate, endDate time.Time,
) (float64, error) {
	args := m.Called(ctx, organizationID, startDate, endDate)
	return args.Get(0).(float64), args.Error(1)
}

// ... outros métodos do mock

// Mock Logger
type MockLogger struct {
	mock.Mock
}

func (m *MockLogger) Info(ctx context.Context, msg string, fields map[string]interface{}) {
	m.Called(ctx, msg, fields)
}

func (m *MockLogger) Error(ctx context.Context, msg string, fields map[string]interface{}) {
	m.Called(ctx, msg, fields)
}

// Testes
func TestGetOverviewUsecase_Execute(t *testing.T) {
	t.Run("should calculate positive change correctly", func(t *testing.T) {
		mockRepo := new(MockDashboardRepository)
		mockLogger := new(MockLogger)

		usecase := usecases.NewGetOverviewUsecase(mockRepo, mockLogger)

		// Configurar mocks para retornar dados do mês atual e anterior
		mockRepo.On("GetCurrentMonthRevenue",
			mock.Anything, "org-123", mock.Anything, mock.Anything).
			Return(int64(150000), nil).Once()

		mockRepo.On("GetCurrentMonthRevenue",
			mock.Anything, "org-123", mock.Anything, mock.Anything).
			Return(int64(100000), nil).Once()

		// ... configurar outros mocks

		result, err := usecase.Execute(context.Background(), "org-123")

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, float64(50.0), result.RevenueChangePercentage)
		mockRepo.AssertExpectations(t)
	})

	t.Run("should handle division by zero", func(t *testing.T) {
		mockRepo := new(MockDashboardRepository)
		mockLogger := new(MockLogger)

		usecase := usecases.NewGetOverviewUsecase(mockRepo, mockLogger)

		// Mês anterior = 0, atual = 100
		mockRepo.On("GetCurrentMonthRevenue",
			mock.Anything, "org-123", mock.Anything, mock.Anything).
			Return(int64(100000), nil).Once()

		mockRepo.On("GetCurrentMonthRevenue",
			mock.Anything, "org-123", mock.Anything, mock.Anything).
			Return(int64(0), nil).Once()

		// ... configurar outros mocks

		result, err := usecase.Execute(context.Background(), "org-123")

		assert.NoError(t, err)
		assert.Equal(t, float64(100.0), result.RevenueChangePercentage)
	})

	t.Run("should handle organization with no budgets", func(t *testing.T) {
		mockRepo := new(MockDashboardRepository)
		mockLogger := new(MockLogger)

		usecase := usecases.NewGetOverviewUsecase(mockRepo, mockLogger)

		// Todos os valores = 0
		mockRepo.On("GetCurrentMonthRevenue",
			mock.Anything, "org-empty", mock.Anything, mock.Anything).
			Return(int64(0), nil)

		mockRepo.On("GetConversionRate",
			mock.Anything, "org-empty", mock.Anything, mock.Anything).
			Return(float64(0), nil)

		mockRepo.On("GetBudgetsByStatus",
			mock.Anything, "org-empty").
			Return(map[entities.BudgetStatus]int{}, nil)

		mockRepo.On("GetNewCustomersCount",
			mock.Anything, "org-empty", mock.Anything, mock.Anything).
			Return(0, nil)

		result, err := usecase.Execute(context.Background(), "org-empty")

		assert.NoError(t, err)
		assert.Equal(t, int64(0), result.CurrentMonthRevenue)
		assert.Equal(t, float64(0), result.ConversionRate)
		assert.Equal(t, 0, result.NewCustomersCount)
	})
}

// Teste de Repository com sqlmock
func TestDashboardRepository_GetCurrentMonthRevenue(t *testing.T) {
	db, sqlMock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	assert.NoError(t, err)

	repo := repositories.NewDashboardRepositoryImpl(gormDB, mockLogger)

	t.Run("should return revenue for period", func(t *testing.T) {
		startDate := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
		endDate := time.Date(2025, 2, 1, 0, 0, 0, 0, time.UTC)

		rows := sqlmock.NewRows([]string{"total_revenue"}).
			AddRow(4523000)

		sqlMock.ExpectQuery(`SELECT COALESCE\(SUM\(total_cost\), 0\) as total_revenue`).
			WithArgs("org-123", "approved", "completed", "printing", startDate, endDate).
			WillReturnRows(rows)

		revenue, err := repo.GetCurrentMonthRevenue(
			context.Background(),
			"org-123",
			startDate,
			endDate,
		)

		assert.NoError(t, err)
		assert.Equal(t, int64(4523000), revenue)
		assert.NoError(t, sqlMock.ExpectationsWereMet())
	})
}
```

---

### Task #13: Documentação da API com Swagger

**Tipo:** Documentation
**Prioridade:** Baixa
**Estimativa:** P (2-3h)
**Dependências:** Tasks #1-#9

#### Descrição
Criar documentação completa da API do dashboard com Swagger/OpenAPI usando swaggo/swag para Go.

#### Acceptance Criteria
- [ ] Swagger UI acessível em /api/docs
- [ ] Todos os endpoints documentados
- [ ] Exemplos de request/response
- [ ] Códigos de erro documentados
- [ ] Schemas de entities documentados

#### Instalação
```bash
# Instalar swag CLI
go install github.com/swaggo/swag/cmd/swag@latest

# Adicionar dependências ao go.mod
go get github.com/swaggo/gin-swagger
go get github.com/swaggo/files
```

#### Exemplo de Documentação

```go
// features/dashboard/domain/usecases/get_overview_usecase.go
package usecases

// GetOverviewUsecase godoc
// @Summary      Retorna overview geral do dashboard
// @Description  Retorna KPIs principais: receita, taxa de conversão, novos clientes e budgets por status
// @Tags         Dashboard
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  entities.DashboardOverviewResponse
// @Failure      401  {object}  errors.HTTPError "Não autenticado"
// @Failure      500  {object}  errors.HTTPError "Erro interno"
// @Router       /dashboard/overview [get]
func (uc *GetOverviewUsecase) Handle(c *gin.Context) {
	// ... implementação
}
```

```go
// features/dashboard/domain/entities/overview.go
package entities

// DashboardOverviewResponse representa a resposta do endpoint de overview
// @Description Response do dashboard overview com KPIs principais
type DashboardOverviewResponse struct {
	Data DashboardOverview `json:"data"`
} // @name DashboardOverviewResponse

// DashboardOverview contém os KPIs principais do dashboard
// @Description KPIs principais do dashboard analytics
type DashboardOverview struct {
	CurrentMonthRevenue      int64                   `json:"current_month_revenue" example:"4523000"`
	RevenueChangePercentage  float64                 `json:"revenue_change_percentage" example:"23.5"`
	ConversionRate           float64                 `json:"conversion_rate" example:"68.2"`
	ConversionRateChange     float64                 `json:"conversion_rate_change" example:"5.1"`
	BudgetsByStatus          map[BudgetStatus]int    `json:"budgets_by_status"`
	NewCustomersCount        int                     `json:"new_customers_count" example:"7"`
	NewCustomersChange       float64                 `json:"new_customers_change" example:"12.5"`
} // @name DashboardOverview
```

#### Configuração no main.go
```go
// main.go (ou onde configura o router)
package main

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "spooliq/docs" // generated by swag
)

// @title           SpoolIQ Dashboard API
// @version         1.0
// @description     API para dashboard analytics do SpoolIQ
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  support@spooliq.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Token de autenticação Keycloak (format: "Bearer {token}")

func main() {
	router := gin.Default()

	// Swagger endpoint
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// ... resto da configuração
}
```

#### Gerar Documentação
```bash
# Na raiz do projeto Go
swag init

# Isso gera:
# - docs/docs.go
# - docs/swagger.json
# - docs/swagger.yaml

# Acessar em:
# http://localhost:8080/swagger/index.html
```

---

## 🎯 Checklist Geral de Implementação

### Fase 1: Setup e Infraestrutura
- [ ] Task #0: Estrutura de pastas e tipos
- [ ] Task #10: Índices de banco de dados
- [ ] Configurar autenticação nos endpoints
- [ ] Configurar CORS e rate limiting

### Fase 2: Endpoints TIER 1 (Alta Prioridade)
- [ ] Task #1: GET /api/dashboard/overview
- [ ] Task #2: GET /api/dashboard/revenue-trend
- [ ] Task #3: GET /api/dashboard/conversion-funnel
- [ ] Task #4: GET /api/dashboard/recent-activity

### Fase 3: Endpoints TIER 2 (Média Prioridade)
- [ ] Task #5: GET /api/dashboard/top-customers
- [ ] Task #6: GET /api/dashboard/operational-insights

### Fase 4: Endpoints TIER 3 (Baixa Prioridade)
- [ ] Task #7: GET /api/dashboard/top-filaments
- [ ] Task #8: GET /api/dashboard/top-materials
- [ ] Task #9: GET /api/dashboard/goals-alerts

### Fase 5: Otimizações
- [ ] Task #11: Implementar cache (Redis) - Opcional
- [ ] Performance tuning
- [ ] Monitoramento de queries lentas

### Fase 6: Qualidade
- [ ] Task #12: Testes unitários
- [ ] Task #13: Documentação Swagger
- [ ] Code review
- [ ] Deploy em staging

---

## 📖 Guia de Desenvolvimento

### Ordem Recomendada de Implementação

1. **Dia 1-2:** Setup inicial (Task #0, #10)
2. **Dia 3-5:** TIER 1 endpoints (#1, #2, #3, #4)
3. **Dia 6-7:** TIER 2 endpoints (#5, #6)
4. **Dia 8-9:** TIER 3 endpoints (#7, #8, #9)
5. **Dia 10:** Otimizações e testes

### Padrões a Seguir (Go)

#### 1. Estrutura de Usecase (atua como handler)
```go
// features/dashboard/domain/usecases/get_example_usecase.go
package usecases

import (
	"context"
	"spooliq/core/errors"
	"spooliq/core/helpers"
	"spooliq/core/logger"
	"spooliq/features/dashboard/domain/entities"
	"spooliq/features/dashboard/domain/repositories"

	"github.com/gin-gonic/gin"
)

type GetExampleUsecase struct {
	repo   repositories.DashboardRepository
	logger logger.Logger
}

func NewGetExampleUsecase(
	repo repositories.DashboardRepository,
	logger logger.Logger,
) *GetExampleUsecase {
	return &GetExampleUsecase{
		repo:   repo,
		logger: logger,
	}
}

// Handle é o método HTTP handler
func (uc *GetExampleUsecase) Handle(c *gin.Context) {
	ctx := c.Request.Context()

	// Extrair organization_id do JWT
	organizationID := helpers.GetOrganizationID(c)
	if organizationID == "" {
		appError := errors.UnauthorizedError("Organization ID not found")
		c.JSON(appError.HTTPStatus(), gin.H{"error": appError.Message()})
		return
	}

	// Log com contexto de trace
	uc.logger.Info(ctx, "Getting example data", map[string]interface{}{
		"organization_id": organizationID,
	})

	// Executar lógica de negócio
	result, err := uc.Execute(ctx, organizationID)
	if err != nil {
		appError := errors.UsecaseError("failed to get example", err)
		uc.logger.Error(ctx, "Failed to get example", map[string]interface{}{
			"organization_id": organizationID,
			"error":           err.Error(),
		})
		c.JSON(appError.HTTPStatus(), gin.H{"error": appError.Message()})
		return
	}

	c.JSON(200, gin.H{"data": result})
}

// Execute contém a lógica de negócio
func (uc *GetExampleUsecase) Execute(ctx context.Context, organizationID string) (*entities.ExampleData, error) {
	// Validações
	if organizationID == "" {
		return nil, errors.NewAppError("organization_id is required", nil, 400)
	}

	// Buscar dados do repository
	data, err := uc.repo.GetData(ctx, organizationID)
	if err != nil {
		return nil, err
	}

	// Transformações e cálculos
	result := &entities.ExampleData{
		Field1: data.Field1,
		Field2: calculateSomething(data.Field2),
	}

	return result, nil
}
```

#### 2. Estrutura de Repository
```go
// features/dashboard/data/repositories/dashboard_repository_impl.go
package repositories

import (
	"context"
	"spooliq/core/logger"
	"spooliq/features/dashboard/data/models"
	"spooliq/features/dashboard/domain/entities"
	"time"

	"gorm.io/gorm"
)

type DashboardRepositoryImpl struct {
	db     *gorm.DB
	logger logger.Logger
}

func NewDashboardRepositoryImpl(
	db *gorm.DB,
	logger logger.Logger,
) *DashboardRepositoryImpl {
	return &DashboardRepositoryImpl{
		db:     db,
		logger: logger,
	}
}

func (r *DashboardRepositoryImpl) GetData(
	ctx context.Context,
	organizationID string,
) (*entities.DataResult, error) {
	var result struct {
		Field1 string
		Field2 int64
	}

	// GORM query com context e parametrização automática
	err := r.db.WithContext(ctx).
		Model(&models.Budget{}).
		Select("field1, SUM(field2) as field2").
		Where("organization_id = ?", organizationID).
		Group("field1").
		Scan(&result).Error

	if err != nil {
		r.logger.Error(ctx, "Database query failed", map[string]interface{}{
			"organization_id": organizationID,
			"error":           err.Error(),
		})
		return nil, err
	}

	return &entities.DataResult{
		Field1: result.Field1,
		Field2: result.Field2,
	}, nil
}
```

#### 3. Tratamento de Erros (Padrão AppError → HTTPError)
```go
// core/errors/app_error.go
// Já existe no projeto - usar os métodos:

// 400 Bad Request
appError := errors.ValidationError("invalid input")

// 401 Unauthorized
appError := errors.UnauthorizedError("token expired")

// 403 Forbidden
appError := errors.ForbiddenError("insufficient permissions")

// 404 Not Found
appError := errors.NotFoundError("resource not found")

// 500 Internal Server Error
appError := errors.UsecaseError("failed to process", err)

// Response:
c.JSON(appError.HTTPStatus(), gin.H{"error": appError.Message()})
```

#### 4. Logs com OpenTelemetry
```go
// Sempre usar ctx para correlação de trace
uc.logger.Info(ctx, "Dashboard overview requested", map[string]interface{}{
	"organization_id": organizationID,
	"period":          period,
})

uc.logger.Error(ctx, "Failed to get overview", map[string]interface{}{
	"organization_id": organizationID,
	"error":           err.Error(),
})

uc.logger.Warn(ctx, "Cache unavailable", map[string]interface{}{
	"key": cacheKey,
})
```

#### 5. Queries Paralelas com Goroutines
```go
func (uc *GetOverviewUsecase) Execute(ctx context.Context, organizationID string) (*entities.DashboardOverview, error) {
	// Canal para resultados
	type result struct {
		currentRevenue int64
		lastRevenue    int64
		err            error
	}
	resultChan := make(chan result, 2)

	// Goroutine 1: Receita atual
	go func() {
		revenue, err := uc.repo.GetCurrentMonthRevenue(ctx, organizationID, startDate, endDate)
		resultChan <- result{currentRevenue: revenue, err: err}
	}()

	// Goroutine 2: Receita mês anterior
	go func() {
		revenue, err := uc.repo.GetCurrentMonthRevenue(ctx, organizationID, lastMonthStart, lastMonthEnd)
		resultChan <- result{lastRevenue: revenue, err: err}
	}()

	// Coletar resultados
	var currentRevenue, lastRevenue int64
	for i := 0; i < 2; i++ {
		res := <-resultChan
		if res.err != nil {
			return nil, res.err
		}
		if res.currentRevenue > 0 {
			currentRevenue = res.currentRevenue
		}
		if res.lastRevenue > 0 {
			lastRevenue = res.lastRevenue
		}
	}

	// ... resto da lógica
}
```

---

## 🔍 Critérios de Aceitação Gerais

### Performance
- [ ] Cada endpoint responde em < 500ms (sem cache)
- [ ] Com cache, < 50ms
- [ ] Queries usam índices corretos (EXPLAIN ANALYZE)
- [ ] Sem N+1 queries

### Segurança
- [ ] Autenticação obrigatória em todos endpoints
- [ ] Multi-tenancy: sempre filtrar por organization_id
- [ ] Rate limiting configurado
- [ ] Logs não expõem dados sensíveis

### Qualidade de Código
- [ ] Go code formatado com `gofmt` e `goimports`
- [ ] Linting com `golangci-lint` sem erros
- [ ] Código comentado onde necessário (godoc style)
- [ ] Testes unitários > 80% cobertura (`go test -cover`)
- [ ] Sem fmt.Println em produção (usar logger com contexto)

### Documentação
- [ ] README atualizado
- [ ] Swagger/OpenAPI documentado
- [ ] Comentários em queries complexas
- [ ] Changelog mantido

---

## 🚨 Problemas Comuns e Soluções (Go)

### Problema: Query muito lenta
**Solução:**
```go
// 1. Verificar se índices estão sendo usados
// No PostgreSQL:
// EXPLAIN ANALYZE SELECT ...

// 2. Adicionar índice composto
// CREATE INDEX idx_budgets_org_status_date
// ON budgets (organization_id, status, created_at DESC);

// 3. Usar .Debug() do GORM temporariamente para ver SQL gerado
db.Debug().
	Model(&models.Budget{}).
	Where("organization_id = ?", organizationID).
	Find(&results)
```

### Problema: Divisão por zero
**Solução:**
```go
func calculateRate(numerator, denominator float64) float64 {
	if denominator == 0 {
		return 0
	}
	return (numerator / denominator) * 100
}

// Ou inline:
rate := float64(0)
if sentCount > 0 {
	rate = (float64(approvedCount) / float64(sentCount)) * 100
}
```

### Problema: Valores null em agregações GORM
**Solução:**
```go
// SQL com COALESCE é automaticamente tratado pelo GORM
var result struct {
	TotalRevenue int64
}

err := db.WithContext(ctx).
	Model(&models.Budget{}).
	Select("COALESCE(SUM(total_cost), 0) as total_revenue").
	Where("organization_id = ?", organizationID).
	Scan(&result).Error

// result.TotalRevenue será 0 se não houver dados
```

### Problema: Vazamento de dados entre organizações
**Solução:**
```go
// 1. SEMPRE usar helpers.GetOrganizationID(c) no handler
organizationID := helpers.GetOrganizationID(c)
if organizationID == "" {
	appError := errors.UnauthorizedError("Organization ID not found")
	c.JSON(appError.HTTPStatus(), gin.H{"error": appError.Message()})
	return
}

// 2. SEMPRE filtrar por organization_id em queries
err := db.WithContext(ctx).
	Model(&models.Budget{}).
	Where("organization_id = ?", organizationID). // OBRIGATÓRIO
	Find(&results).Error

// 3. Criar testes para validar multi-tenancy
func TestMultiTenancy(t *testing.T) {
	// Criar budgets para org-1 e org-2
	// Buscar com org-1, verificar que não retorna dados de org-2
}
```

### Problema: Context cancelled / timeout
**Solução:**
```go
// Sempre propagar context corretamente
func (uc *GetOverviewUsecase) Handle(c *gin.Context) {
	ctx := c.Request.Context() // Usar context da request

	// Passar ctx para todas as chamadas
	result, err := uc.Execute(ctx, organizationID)
	// ...
}

// No repository
func (r *DashboardRepositoryImpl) GetData(ctx context.Context, ...) error {
	// WithContext propaga cancelamento e timeout
	err := r.db.WithContext(ctx).
		Model(&models.Budget{}).
		Where(...).
		Scan(&result).Error
}
```

### Problema: Goroutine leak
**Solução:**
```go
// ERRADO - goroutine pode não terminar
go func() {
	result, _ := someOperation()
	// Se ninguém ler do canal, goroutine fica travada
	resultChan <- result
}()

// CORRETO - usar canal com buffer
resultChan := make(chan result, 1) // buffer de 1
go func() {
	result, _ := someOperation()
	resultChan <- result // não bloqueia mesmo se ninguém ler
}()

// Ou usar context para cancelar
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()

go func() {
	select {
	case <-ctx.Done():
		return // limpar recurso
	case resultChan <- result:
	}
}()
```

---

## 📞 Contatos e Recursos

### Dúvidas sobre Frontend
- Verificar interfaces TypeScript em `src/types/dashboard.ts` (frontend repo)
- Mock data em `src/services/dashboard/mock-data.ts` (frontend repo)
- Exemplos de uso em `src/hooks/dashboard/*.ts` (frontend repo)
- Frontend espera response format: `{"data": {...}}` para sucesso

### Referências Úteis do Projeto
- Padrões de arquitetura: ver features/customer e features/brand (mesma estrutura)
- Middleware de autenticação: `core/middlewares/auth_middleware.go`
- Error handling: `core/errors/app_error.go`
- Helpers: `core/helpers/context.go` (GetOrganizationID, GetUserID)
- Logger: `core/logger/` (OpenTelemetry integration)

### Referências Externas
- [GORM Docs](https://gorm.io/docs/)
- [GORM Advanced Query](https://gorm.io/docs/advanced_query.html)
- [Gin Web Framework](https://gin-gonic.com/docs/)
- [PostgreSQL Date Functions](https://www.postgresql.org/docs/current/functions-datetime.html)
- [Go Redis](https://redis.uptrace.dev/)
- [Uber FX Dependency Injection](https://uber-go.github.io/fx/)
- [Testify (Testing)](https://github.com/stretchr/testify)
- [Swaggo (Swagger)](https://github.com/swaggo/swag)

---

## ✅ Definição de Pronto (DoD)

Uma task está completa quando:
- [ ] Código implementado e revisado
- [ ] Testes unitários passando
- [ ] Endpoint testado manualmente (Postman/Insomnia)
- [ ] Frontend integrado e funcionando
- [ ] Documentação atualizada
- [ ] Deploy em staging bem-sucedido
- [ ] Code review aprovado

---

**Boa sorte na implementação! 🚀**

Se tiver dúvidas sobre alguma task específica, não hesite em pedir clarificações.
