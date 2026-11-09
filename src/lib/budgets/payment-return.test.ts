import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { phaseFromConfirmError, phaseFromConfirmResponse } from './payment-return'

function axiosError(status?: number) {
  const error = new AxiosError('request failed')
  if (status !== undefined) {
    error.response = { status, data: {} } as AxiosResponse
  }
  return error
}

describe('phaseFromConfirmResponse', () => {
  it('maps a paid confirmation to the paid phase', () => {
    expect(phaseFromConfirmResponse('paid')).toBe('paid')
  })

  it('maps a processing confirmation to the processing phase (which polls)', () => {
    expect(phaseFromConfirmResponse('processing')).toBe('processing')
  })
})

describe('phaseFromConfirmError', () => {
  it('polls on network errors (no response)', () => {
    expect(phaseFromConfirmError(axiosError())).toBe('processing')
    expect(phaseFromConfirmError(new Error('boom'))).toBe('processing')
  })

  it('polls on 5xx and rate limiting', () => {
    expect(phaseFromConfirmError(axiosError(500))).toBe('processing')
    expect(phaseFromConfirmError(axiosError(503))).toBe('processing')
    expect(phaseFromConfirmError(axiosError(429))).toBe('processing')
  })

  it('fails (no polling) on definitive 4xx', () => {
    expect(phaseFromConfirmError(axiosError(400))).toBe('failed')
    expect(phaseFromConfirmError(axiosError(404))).toBe('failed')
    expect(phaseFromConfirmError(axiosError(409))).toBe('failed')
    expect(phaseFromConfirmError(axiosError(422))).toBe('failed')
  })
})
