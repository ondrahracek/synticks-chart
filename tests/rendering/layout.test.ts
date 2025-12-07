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

  it('filters out offscreen candles', () => {
    const candles: Candle[] = [
      { timestamp: 500, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 1500, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 2500, open: 100, high: 105, low: 99, close: 103, volume: 1000 }
    ]

    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    const result = computeCandleRects(candles, viewport, 99, 107)

    expect(result).toHaveLength(1)
    expect(result[0].x).toBeGreaterThanOrEqual(0)
  })

  it('calculates width based on time intervals for visible candles', () => {
    const manyCandles: Candle[] = Array.from({ length: 50 }, (_, i) => ({
      timestamp: 1000 + i * 100,
      open: 100,
      high: 105,
      low: 99,
      close: 103,
      volume: 1000
    }))

    const viewport: Viewport = {
      from: 2000,
      to: 3000,
      widthPx: 800,
      heightPx: 600
    }

    const result = computeCandleRects(manyCandles, viewport, 99, 105)

    const visibleCount = result.length
    expect(visibleCount).toBeGreaterThan(0)
    
    const timeSpan = viewport.to - viewport.from
    const timeInterval = 100
    const expectedWidth = (timeInterval / timeSpan) * viewport.widthPx * 0.8

    expect(result[0].w).toBeCloseTo(expectedWidth, 1)
  })

  it('includes wick coordinates in result', () => {
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

    expect(result[0]).toHaveProperty('highY')
    expect(result[0]).toHaveProperty('lowY')
    expect(result[0].highY).toBeLessThan(result[0].lowY)
  })

  it('calculates candle width based on time intervals, not count', () => {
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 1100, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 1200, open: 106, high: 108, low: 105, close: 107, volume: 1300 }
    ]

    const viewport: Viewport = {
      from: 1000,
      to: 1200,
      widthPx: 800,
      heightPx: 600
    }

    const result = computeCandleRects(candles, viewport, 99, 108)

    const timeSpan = viewport.to - viewport.from
    const timeInterval = 100
    const expectedWidth = (timeInterval / timeSpan) * viewport.widthPx * 0.8

    expect(result).toHaveLength(3)
    expect(result[0].w).toBeCloseTo(expectedWidth, 1)
    expect(result[1].w).toBeCloseTo(expectedWidth, 1)
    expect(result[2].w).toBeCloseTo(expectedWidth, 1)
  })
})

