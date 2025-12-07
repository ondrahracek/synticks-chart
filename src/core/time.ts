import type { TimeframeId } from './types'

const TIME_UNIT_MULTIPLIERS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000
}

export function timeframeToMs(tf: TimeframeId): number {
  const match = tf.match(/^(\d+)([smhd])$/)
  if (!match) {
    throw new Error(`Invalid timeframe: ${tf}`)
  }
  
  const value = parseInt(match[1], 10)
  const unit = match[2]
  
  return value * TIME_UNIT_MULTIPLIERS[unit]
}

export function normalizeToBucket(t: number, tf: TimeframeId): number {
  const ms = timeframeToMs(tf)
  return Math.floor(t / ms) * ms
}

