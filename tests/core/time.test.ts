import { describe, it, expect } from 'vitest'
import { timeframeToMs, normalizeToBucket } from '../../src/core/time'
import type { TimeframeId } from '../../src/core/types'

describe('timeframeToMs', () => {
  it('converts 1s to 1000ms', () => {
    expect(timeframeToMs('1s')).toBe(1000)
  })

  it('converts 5s to 5000ms', () => {
    expect(timeframeToMs('5s')).toBe(5000)
  })

  it('converts 10s to 10000ms', () => {
    expect(timeframeToMs('10s')).toBe(10000)
  })

  it('converts 15s to 15000ms', () => {
    expect(timeframeToMs('15s')).toBe(15000)
  })

  it('converts 30s to 30000ms', () => {
    expect(timeframeToMs('30s')).toBe(30000)
  })

  it('converts 1m to 60000ms', () => {
    expect(timeframeToMs('1m')).toBe(60000)
  })

  it('converts 5m to 300000ms', () => {
    expect(timeframeToMs('5m')).toBe(300000)
  })

  it('converts 10m to 600000ms', () => {
    expect(timeframeToMs('10m')).toBe(600000)
  })

  it('converts 15m to 900000ms', () => {
    expect(timeframeToMs('15m')).toBe(900000)
  })

  it('converts 30m to 1800000ms', () => {
    expect(timeframeToMs('30m')).toBe(1800000)
  })

  it('converts 45m to 2700000ms', () => {
    expect(timeframeToMs('45m')).toBe(2700000)
  })

  it('converts 1h to 3600000ms', () => {
    expect(timeframeToMs('1h')).toBe(3600000)
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

