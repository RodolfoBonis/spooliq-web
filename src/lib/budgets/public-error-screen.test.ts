import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { resolveErrorScreen } from './public-error-screen'

function apiError(status: number, code?: string) {
  const error = new AxiosError('request failed')
  error.response = { status, data: { code } } as AxiosResponse
  return error
}

describe('resolveErrorScreen', () => {
  it('explains a budget under review instead of "indisponível"', () => {
    const screen = resolveErrorScreen(apiError(409, 'budget_under_review'))
    expect(screen.title).toBe('Orçamento em revisão')
    expect(screen.description).toContain('mesmo link')
  })

  it('keeps the other 409 cases', () => {
    expect(resolveErrorScreen(apiError(409, 'budget_already_responded')).title).toBe(
      'Orçamento já respondido',
    )
    expect(resolveErrorScreen(apiError(409, 'budget_not_available')).title).toBe(
      'Orçamento indisponível',
    )
  })

  it('maps not found and unknown errors', () => {
    expect(resolveErrorScreen(apiError(404)).title).toBe('Orçamento não encontrado')
    expect(resolveErrorScreen(new Error('boom')).title).toBe(
      'Não foi possível carregar o orçamento',
    )
  })
})
