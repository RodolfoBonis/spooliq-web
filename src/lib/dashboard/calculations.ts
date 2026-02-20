import type { FunnelStep } from '@/types/dashboard';

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

/**
 * Calculate conversion rate
 * @param converted - Number of conversions
 * @param total - Total number
 * @returns Conversion rate as percentage
 */
export function calculateConversionRate(converted: number, total: number): number {
  if (total === 0) return 0;
  return (converted / total) * 100;
}

/**
 * Calculate average from array of numbers
 * @param values - Array of numbers
 * @returns Average
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate conversion rate between funnel stages
 * @param currentStage - Current stage data
 * @param nextStage - Next stage data
 * @returns Conversion rate as percentage
 */
export function calculateStageConversionRate(
  currentStage: FunnelStep,
  nextStage: FunnelStep | null
): number {
  if (!nextStage || currentStage.count === 0) return 0;
  return (nextStage.count / currentStage.count) * 100;
}

/**
 * Calculate overall conversion rate for the entire funnel
 * @param stages - All funnel stages
 * @returns Overall conversion rate from first to last stage
 */
export function calculateOverallConversionRate(stages: FunnelStep[]): number {
  if (stages.length < 2) return 0;

  const firstStage = stages[0];
  const lastStage = stages[stages.length - 1];

  if (firstStage.count === 0) return 0;

  return (lastStage.count / firstStage.count) * 100;
}

/**
 * Calculate progress percentage towards a goal
 * @param current - Current value
 * @param target - Target value
 * @returns Progress as percentage (capped at 100)
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
}

/**
 * Calculate goal status based on progress
 * @param progress - Progress percentage
 * @param periodProgress - How far through the period we are (0-100)
 * @returns Status: 'on_track' | 'at_risk' | 'behind'
 */
export function calculateGoalStatus(
  progress: number,
  periodProgress: number
): 'on_track' | 'at_risk' | 'behind' {
  // If we're ahead of schedule
  if (progress >= periodProgress) {
    return 'on_track';
  }

  // If we're more than 20% behind schedule
  if (progress < periodProgress - 20) {
    return 'behind';
  }

  // Otherwise, we're at risk
  return 'at_risk';
}

/**
 * Calculate sum of array
 * @param values - Array of numbers
 * @returns Sum
 */
export function calculateSum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculate median from array of numbers
 * @param values - Array of numbers
 * @returns Median
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Calculate trend based on array of values
 * @param values - Array of values (oldest to newest)
 * @returns Trend direction: 'up' | 'down' | 'stable'
 */
export function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';

  // Simple linear regression slope
  const n = values.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // Threshold for considering trend significant
  const threshold = 0.01;

  if (slope > threshold) return 'up';
  if (slope < -threshold) return 'down';
  return 'stable';
}

/**
 * Calculate growth rate over multiple periods
 * @param values - Array of values (oldest to newest)
 * @returns Average growth rate as percentage
 */
export function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0;

  const growthRates: number[] = [];

  for (let i = 1; i < values.length; i++) {
    const rate = calculatePercentageChange(values[i], values[i - 1]);
    if (isFinite(rate)) {
      growthRates.push(rate);
    }
  }

  return calculateAverage(growthRates);
}

/**
 * Format a large number to a more readable format
 * @param value - Number to format
 * @returns Formatted string with K, M, B suffixes
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Calculate days in current month
 * @returns Number of days in current month
 */
export function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/**
 * Calculate how far through the month we are (0-100)
 * @returns Progress percentage
 */
export function getCurrentMonthProgress(): number {
  const now = new Date();
  const currentDay = now.getDate();
  const totalDays = getDaysInCurrentMonth();

  return (currentDay / totalDays) * 100;
}
