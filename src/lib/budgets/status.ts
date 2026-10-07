import type { BudgetStatus } from '@/types/models'

/**
 * Allowed budget status transitions (API contract v2.13.0).
 *
 * | From      | To                                     |
 * |-----------|----------------------------------------|
 * | draft     | sent, cancelled                        |
 * | sent      | approved, rejected, expired, cancelled |
 * | approved  | printing, cancelled                    |
 * | rejected  | draft                                  |
 * | expired   | draft                                  |
 * | cancelled | draft                                  |
 * | printing  | completed                              |
 * | completed | (none)                                 |
 */
export const BUDGET_STATUS_TRANSITIONS: Record<BudgetStatus, BudgetStatus[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['approved', 'rejected', 'expired', 'cancelled'],
  approved: ['printing', 'cancelled'],
  rejected: ['draft'],
  expired: ['draft'],
  cancelled: ['draft'],
  printing: ['completed'],
  completed: [],
}

/** Statuses to which a budget can move manually from its current status. */
export function getAllowedTransitions(current: BudgetStatus): BudgetStatus[] {
  return BUDGET_STATUS_TRANSITIONS[current] ?? []
}

/** Statuses where a budget cannot be shared via a public link. */
export const NON_SHAREABLE_STATUSES: readonly BudgetStatus[] = [
  'cancelled',
  'printing',
  'completed',
]

/** Whether a budget in this status can be shared (POST /budgets/:id/share). */
export function isShareable(status: BudgetStatus): boolean {
  return !NON_SHAREABLE_STATUSES.includes(status)
}

/** All budget statuses, in display order — used for list filters. */
export const BUDGET_STATUS_ORDER: readonly BudgetStatus[] = [
  'draft',
  'sent',
  'approved',
  'rejected',
  'expired',
  'cancelled',
  'printing',
  'completed',
]
