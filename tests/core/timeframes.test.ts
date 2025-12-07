import { describe, it, expect } from 'vitest'
import { aggregateCandles } from '../../src/core/timeframes'
import type { Candle, TimeframeId } from '../../src/core/types'

describe('aggregateCandles', () => {
  it('aggregates 1-minute candles to 5-minute candles', () => {
    const baseTime = new Date('2024-01-01T00:00:00Z').getTime()
    const baseCandles: Candle[] = [
      { open: 100, high: 105, low: 99, close: 103, volume: 1000, timestamp: baseTime + 0 * 60000 },
      { open: 103, high: 107, low: 102, close: 106, volume: 1200, timestamp: baseTime + 1 * 60000 },
      { open: 106, high: 108, low: 104, close: 105, volume: 1100, timestamp: baseTime + 2 * 60000 },
      { open: 105, high: 109, low: 103, close: 108, volume: 1300, timestamp: baseTime + 3 * 60000 },
      { open: 108, high: 110, low: 107, close: 109, volume: 1400, timestamp: baseTime + 4 * 60000 }
    ]

    const result = aggregateCandles(baseCandles, '5m')

    expect(result).toHaveLength(1)
    expect(result[0].timestamp).toBe(baseTime)
    expect(result[0].open).toBe(100)
    expect(result[0].high).toBe(110)
    expect(result[0].low).toBe(99)
    expect(result[0].close).toBe(109)
    expect(result[0].volume).toBe(6000)
  })

  it('handles partial buckets correctly', () => {
    const baseTime = new Date('2024-01-01T00:00:00Z').getTime()
    const baseCandles: Candle[] = [
      { open: 100, high: 105, low: 99, close: 103, volume: 1000, timestamp: baseTime + 0 * 60000 },
      { open: 103, high: 107, low: 102, close: 106, volume: 1200, timestamp: baseTime + 1 * 60000 },
      { open: 106, high: 108, low: 104, close: 105, volume: 1100, timestamp: baseTime + 2 * 60000 }
    ]

    const result = aggregateCandles(baseCandles, '5m')

    expect(result).toHaveLength(1)
    expect(result[0].timestamp).toBe(baseTime)
    expect(result[0].open).toBe(100)
    expect(result[0].high).toBe(108)
    expect(result[0].low).toBe(99)
    expect(result[0].close).toBe(105)
    expect(result[0].volume).toBe(3300)
  })

  it('returns empty array for empty input', () => {
    const result = aggregateCandles([], '5m')
    expect(result).toEqual([])
  })

  it('assumes input is already sorted by timestamp', () => {
    const baseTime = new Date('2024-01-01T00:00:00Z').getTime()
    const baseCandles: Candle[] = [
      { open: 100, high: 105, low: 99, close: 103, volume: 1000, timestamp: baseTime + 0 * 60000 },
      { open: 103, high: 107, low: 102, close: 106, volume: 1200, timestamp: baseTime + 1 * 60000 },
      { open: 106, high: 108, low: 104, close: 105, volume: 1100, timestamp: baseTime + 2 * 60000 },
      { open: 105, high: 109, low: 103, close: 108, volume: 1300, timestamp: baseTime + 3 * 60000 },
      { open: 108, high: 110, low: 107, close: 109, volume: 1400, timestamp: baseTime + 4 * 60000 }
    ]

    const result = aggregateCandles(baseCandles, '5m')

    expect(result).toHaveLength(1)
    expect(result[0].open).toBe(100)
    expect(result[0].close).toBe(109)
  })
})

