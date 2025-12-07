import type { Candle } from '../core/types'
import type { Viewport } from '../core/viewport'
import type { ChartState } from '../core/state'

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function lerpCandle(prev: Candle, next: Candle, t: number): Candle {
  return {
    timestamp: next.timestamp,
    open: lerp(prev.open, next.open, t),
    high: lerp(prev.high, next.high, t),
    low: lerp(prev.low, next.low, t),
    close: lerp(prev.close, next.close, t),
    volume: next.volume
  }
}

export function lerpViewport(prev: Viewport, next: Viewport, t: number): Viewport {
  return {
    from: lerp(prev.from, next.from, t),
    to: lerp(prev.to, next.to, t),
    widthPx: next.widthPx,
    heightPx: next.heightPx
  }
}

export function lerpChartState(prev: ChartState, next: ChartState, t: number): ChartState {
  const prevCandles = prev.candles || []
  const nextCandles = next.candles || []
  const maxLen = Math.max(prevCandles.length, nextCandles.length)
  const interpolatedCandles: Candle[] = []

  for (let i = 0; i < maxLen; i++) {
    const prevCandle = prevCandles[i]
    const nextCandle = nextCandles[i]

    if (!prevCandle && nextCandle) {
      if (prevCandles.length > 0 && i === nextCandles.length - 1) {
        const lastPrevCandle = prevCandles[prevCandles.length - 1]
        const interpolated = lerpCandle(
          { ...lastPrevCandle, close: lastPrevCandle.close },
          nextCandle,
          t
        )
        interpolatedCandles.push(interpolated)
      } else {
        interpolatedCandles.push(nextCandle)
      }
    } else if (prevCandle && !nextCandle) {
      interpolatedCandles.push(prevCandle)
    } else if (prevCandle && nextCandle) {
      if (i === prevCandles.length - 1 && i === nextCandles.length - 1) {
        interpolatedCandles.push(lerpCandle(prevCandle, nextCandle, t))
      } else {
        interpolatedCandles.push(nextCandle)
      }
    }
  }

  return {
    ...next,
    candles: interpolatedCandles,
    viewport: prev.viewport && next.viewport ? lerpViewport(prev.viewport, next.viewport, t) : next.viewport
  }
}

