import { describe, it, expect } from 'vitest'
import {
  BUDGET_STATUS_TRANSITIONS,
  getAllowedTransitions,
  isShareable,
} from '@/lib/budgets/status'

describe('BUDGET_STATUS_TRANSITIONS', () => {
  it('matches the API transition contract', () => {
    expect(BUDGET_STATUS_TRANSITIONS).toEqual({
      draft: ['sent', 'cancelled'],
      sent: ['approved', 'rejected', 'expired', 'cancelled'],
      approved: ['printing', 'cancelled'],
      rejected: ['draft'],
      expired: ['draft'],
      cancelled: ['draft'],
      printing: ['completed'],
      completed: [],
    })
  })

  it('lets a draft move only to sent or cancelled', () => {
    expect(getAllowedTransitions('draft')).toEqual(['sent', 'cancelled'])
  })

  it('treats completed as terminal', () => {
    expect(getAllowedTransitions('completed')).toEqual([])
  })
})

describe('isShareable', () => {
  it('allows sharing early-stage statuses', () => {
    expect(isShareable('draft')).toBe(true)
    expect(isShareable('sent')).toBe(true)
    expect(isShareable('approved')).toBe(true)
  })

  it('blocks sharing once cancelled, printing or completed', () => {
    expect(isShareable('cancelled')).toBe(false)
    expect(isShareable('printing')).toBe(false)
    expect(isShareable('completed')).toBe(false)
  })
})
