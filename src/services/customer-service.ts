import api from '@/lib/api/client'
import { buildListParams, toPage } from '@/lib/api/pagination'
import { Customer, CustomerBudget } from '@/types/models'
import type { PaginatedResponse } from '@/types/api'

export interface CustomerFilters {
    search?: string
    page?: number
    pageSize?: number
}

export interface CreateCustomerDTO {
    name: string
    email: string
    phone?: string
    document?: string // CPF/CNPJ
    address?: string
    city?: string
    state?: string
    zip_code?: string
    notes?: string
}

export interface UpdateCustomerDTO extends Partial<CreateCustomerDTO> {
}

/** Raw list item: the API may wrap each customer with aggregate counts. */
interface RawCustomerListItem {
    customer?: Customer
    budget_count?: number
    total_budgets?: number
}

function normalizeListItem(item: RawCustomerListItem & Partial<Customer>): Customer {
    // New shape may return the customer flat; legacy wraps it under `customer`.
    const base = item.customer ?? (item as Customer)
    return {
        ...base,
        budgets_count: item.budget_count ?? base.budgets_count,
        total_spent: item.total_budgets ?? base.total_spent ?? 0,
    }
}

export const customerService = {
    /**
     * List customers with filters and pagination. Tolerant to both the new
     * `{ data, total, page, page_size, total_pages }` envelope and legacy arrays.
     */
    async list(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
        const { search, page, pageSize } = filters || {}
        const { data } = await api.get('/customers/', {
            params: buildListParams({ page, pageSize, q: search }),
        })
        const pageData = toPage<RawCustomerListItem & Partial<Customer>>(data)
        return { ...pageData, data: pageData.data.map(normalizeListItem) }
    },

    /**
     * Get single customer by ID
     */
    async getById(id: string): Promise<Customer> {
        const {data} = await api.get<{
            customer: Customer,
            budget_count: number,
            budgets: CustomerBudget[],
            total_budgets: number
        }>(`/customers/${id}`)


        return {
            ...data.customer,
            budgets: data.budgets,
            budgets_count: data.budget_count,
            total_spent: data.total_budgets
        }
    },

    /**
     * Create new customer
     */
    async create(data: CreateCustomerDTO): Promise<Customer> {
        const response = await api.post<Customer>('/customers/', data)
        return response.data
    },

    /**
     * Update customer
     */
    async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
        const response = await api.put<Customer>(`/customers/${id}`, data)
        return response.data
    },

    /**
     * Delete customer
     */
    async delete(id: string): Promise<void> {
        await api.delete(`/customers/${id}`)
    },
}

export default customerService
