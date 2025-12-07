import { describe, it, expect } from 'vitest'
import { computeCandleRects } from '../../src/rendering/layout'
import type { Candle } from '../../src/core/types'
import type { Viewport } from '../../src/core/viewport'

describe('computeCandleRects', () => {
  it('computes candle rects with correct positions and dimensions', () => {
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
    ]

    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    const minPrice = 99
    const maxPrice = 107

    const result = computeCandleRects(candles, viewport, minPrice, maxPrice)

    expect(result).toHaveLength(2)
    expect(result[0].x).toBeGreaterThanOrEqual(0)
    expect(result[0].w).toBeGreaterThan(0)
    expect(result[0].isUp).toBe(true)
    expect(result[1].x).toBeGreaterThan(result[0].x)
  })

  it('marks candles as up when close > open', () => {
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 }
    ]

    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    const result = computeCandleRects(candles, viewport, 99, 105)

    expect(result[0].isUp).toBe(true)
  })

  it('marks candles as down when close < open', () => {
    const candles: Candle[] = [
      { timestamp: 1000, open: 103, high: 105, low: 99, close: 100, volume: 1000 }
    ]

    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    const result = computeCandleRects(candles, viewport, 99, 105)

    expect(result[0].isUp).toBe(false)
  })
})

