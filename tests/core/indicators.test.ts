import { describe, it, expect } from 'vitest'
import { IndicatorRegistry, createSMAIndicator } from '../../src/core/indicators'
import type { Candle } from '../../src/core/types'

describe('IndicatorRegistry', () => {
  it('registers SMA definition with id sma', () => {
    const registry = new IndicatorRegistry()
    registry.register('sma', createSMAIndicator())

    expect(registry.has('sma')).toBe(true)
  })

  it('calculates SMA with period 3 and skips first period-1 candles', () => {
    const registry = new IndicatorRegistry()
    registry.register('sma', createSMAIndicator())

    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 },
      { timestamp: 4000, open: 105, high: 109, low: 103, close: 108, volume: 1300 }
    ]

    const result = registry.calculate('sma', candles, { period: 3 })

    expect(result).toHaveLength(2)
    expect(result[0]).toBeCloseTo((103 + 106 + 105) / 3, 5)
    expect(result[1]).toBeCloseTo((106 + 105 + 108) / 3, 5)
  })

  it('throws if indicator not found', () => {
    const registry = new IndicatorRegistry()

    expect(() => {
      registry.calculate('unknown', [], {})
    }).toThrow('Indicator not found: unknown')
  })
})

