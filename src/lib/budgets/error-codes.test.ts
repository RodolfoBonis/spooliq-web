import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from '@/lib/api/errors'
import { PUBLIC_PAYMENT_ERROR_CODES } from './error-codes'

function apiError(code: string, status = 409) {
  const error = new AxiosError('request failed')
  error.response = { status, data: { code } } as AxiosResponse
  return error
}

describe('PUBLIC_PAYMENT_ERROR_CODES mapping', () => {
  it('maps each payment error code to its pt-BR message', () => {
    for (const [code, message] of Object.entries(PUBLIC_PAYMENT_ERROR_CODES)) {
      expect(getApiErrorMessage(apiError(code), 'fallback', { byCode: PUBLIC_PAYMENT_ERROR_CODES })).toBe(
        message
      )
    }
  })

  it('uses the mapped message for a kind mismatch (stale value)', () => {
    expect(
      getApiErrorMessage(apiError('payment_kind_mismatch'), 'fallback', {
        byCode: PUBLIC_PAYMENT_ERROR_CODES,
      })
    ).toContain('Recarregue a página')
  })

  it('falls back when the code is unknown', () => {
    expect(
      getApiErrorMessage(apiError('something_else'), 'fallback', {
        byCode: PUBLIC_PAYMENT_ERROR_CODES,
      })
    ).toBe('fallback')
  })
})
