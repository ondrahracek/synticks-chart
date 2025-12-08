import { describe, it, expect } from 'vitest'
import { lerp, lerpCandle, lerpViewport, lerpChartState } from '../../src/rendering/AnimationState'
import type { Candle } from '../../src/core/types'
import type { Viewport } from '../../src/core/viewport'
import type { ChartState } from '../../src/core/state'

describe('Animation helpers', () => {
  describe('lerp', () => {
    it('returns start value when t=0', () => {
      expect(lerp(0, 10, 0)).toBe(0)
    })

    it('returns end value when t=1', () => {
      expect(lerp(0, 10, 1)).toBe(10)
    })

    it('returns midpoint when t=0.5', () => {
      expect(lerp(0, 10, 0.5)).toBe(5)
    })
  })

  describe('lerpCandle', () => {
    it('interpolates candle close price', () => {
      const prev: Candle = {
        timestamp: 1000,
        open: 100,
        high: 105,
        low: 99,
        close: 100,
        volume: 1000
      }
      const next: Candle = {
        timestamp: 1000,
        open: 100,
        high: 105,
        low: 99,
        close: 105,
        volume: 1000
      }

      const result = lerpCandle(prev, next, 0.5)
      expect(result.close).toBe(102.5)
    })
  })

  describe('lerpViewport', () => {
    it('interpolates viewport from and to times', () => {
      const prev: Viewport = {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
      const next: Viewport = {
        from: 1500,
        to: 2500,
        widthPx: 800,
        heightPx: 600
      }

      const result = lerpViewport(prev, next, 0.5)
      expect(result.from).toBe(1250)
      expect(result.to).toBe(2250)
      expect(result.widthPx).toBe(800)
      expect(result.heightPx).toBe(600)
    })
  })

  describe('lerpChartState', () => {
    it('interpolates last candle close price', () => {
      const prev: ChartState = {
        candles: [
          { timestamp: 1000, open: 100, high: 105, low: 99, close: 100, volume: 1000 }
        ],
        autoScrollEnabled: true
      }
      const next: ChartState = {
        candles: [
          { timestamp: 1000, open: 100, high: 105, low: 99, close: 100, volume: 1000 },
          { timestamp: 2000, open: 100, high: 105, low: 99, close: 105, volume: 1000 }
        ],
        autoScrollEnabled: true
      }

      const result = lerpChartState(prev, next, 0.5)
      expect(result.candles).toHaveLength(2)
      expect(result.candles[1].close).toBe(102.5)
    })
  })
})

