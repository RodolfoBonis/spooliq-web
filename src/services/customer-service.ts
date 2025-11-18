import api from '@/lib/api/client'
import {Customer, CustomerBudget} from '@/types/models'
import type {PaginatedResponse} from '@/types/api'

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

export const customerService = {
    /**
     * List customers with filters and pagination
     */
    async list(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
        const {data} = await api.get('/customers/', {
            params: filters,
        })

        // Backend returns: { data: [{ customer: {...}, budget_count: 0 }], total, page, page_size, total_pages }
        // We need to extract the customer objects
        const customers = data.data?.map((item: any) => ({
            ...item.customer,
            budgets_count: item.budget_count,
            total_spent: item.total_budgets || 0,
        })) || []

        return {
            data: customers,
            total: data.total || 0,
            page: data.page || 1,
            pageSize: data.page_size || 10,
            totalPages: data.total_pages || 1,
        }
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

