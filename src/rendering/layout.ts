import type { Candle } from '../core/types'
import type { Viewport } from '../core/viewport'
import { timeToX, priceToY, filterCandlesByViewport } from '../core/viewport'

export interface CandleRect {
  x: number
  y: number
  w: number
  h: number
  isUp: boolean
  highY: number
  lowY: number
}

export function computeCandleRects(
  candles: Candle[],
  viewport: Viewport,
  minPrice: number,
  maxPrice: number
): CandleRect[] {
  if (candles.length === 0) {
    return []
  }

  const visibleCandles = filterCandlesByViewport(candles, viewport)
  if (visibleCandles.length === 0) {
    return []
  }

  const timeSpan = viewport.to - viewport.from
  
  let candleWidth: number
  if (visibleCandles.length === 1 || timeSpan === 0) {
    candleWidth = Math.max(1, viewport.widthPx * 0.8)
  } else {
    const timeIntervals: number[] = []
    for (let i = 1; i < visibleCandles.length; i++) {
      timeIntervals.push(visibleCandles[i].timestamp - visibleCandles[i - 1].timestamp)
    }
    const avgTimeInterval = timeIntervals.reduce((sum, interval) => sum + interval, 0) / timeIntervals.length
    candleWidth = Math.max(1, (avgTimeInterval / timeSpan) * viewport.widthPx * 0.8)
  }

  const result: CandleRect[] = []

  for (const candle of visibleCandles) {
    const centerX = timeToX(candle.timestamp, viewport)
    const x = centerX - candleWidth / 2
    const highY = priceToY(candle.high, viewport, minPrice, maxPrice)
    const lowY = priceToY(candle.low, viewport, minPrice, maxPrice)
    const openY = priceToY(candle.open, viewport, minPrice, maxPrice)
    const closeY = priceToY(candle.close, viewport, minPrice, maxPrice)

    const bodyTop = Math.min(openY, closeY)
    const bodyBottom = Math.max(openY, closeY)
    const bodyHeight = Math.max(1, bodyBottom - bodyTop)

    result.push({
      x,
      y: bodyTop,
      w: candleWidth,
      h: bodyHeight,
      isUp: candle.close > candle.open,
      highY,
      lowY
    })
  }

  return result
}

