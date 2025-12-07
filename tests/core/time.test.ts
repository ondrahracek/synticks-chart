import { describe, it, expect } from 'vitest'
import { timeframeToMs, normalizeToBucket } from '../../src/core/time'
import type { TimeframeId } from '../../src/core/types'

describe('timeframeToMs', () => {
  it('converts 1s to 1000ms', () => {
    expect(timeframeToMs('1s')).toBe(1000)
  })

  it('converts 1m to 60000ms', () => {
    expect(timeframeToMs('1m')).toBe(60000)
  })

  it('converts 15m to 900000ms', () => {
    expect(timeframeToMs('15m')).toBe(900000)
  })
})

describe('normalizeToBucket', () => {
  it('returns bucket start for a given timestamp and timeframe', () => {
    const timestamp = 1234567890123 // Some timestamp with milliseconds
    const bucketStart = normalizeToBucket(timestamp, '1m')
    expect(bucketStart).toBeLessThanOrEqual(timestamp)
    expect(bucketStart % 60000).toBe(0) // Should be aligned to minute boundary
    expect(bucketStart).toBe(1234567860000) // Exact bucket start
  })

  it('normalizes to 1s buckets correctly', () => {
    const timestamp = 1234567890123
    const bucketStart = normalizeToBucket(timestamp, '1s')
    expect(bucketStart).toBe(1234567890000)
  })

  it('normalizes to 15m buckets correctly', () => {
    const timestamp = 1234567890123
    const bucketStart = normalizeToBucket(timestamp, '15m')
    expect(bucketStart % 900000).toBe(0) // Should be aligned to 15-minute boundary
  })
})

