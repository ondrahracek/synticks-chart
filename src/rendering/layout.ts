import type { Candle } from '../core/types'
import type { Viewport } from '../core/viewport'
import { timeToX, priceToY } from '../core/viewport'

export interface CandleRect {
  x: number
  y: number
  w: number
  h: number
  isUp: boolean
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

  const candleWidth = Math.max(1, viewport.widthPx / candles.length * 0.8)
  const result: CandleRect[] = []

  for (const candle of candles) {
    const centerX = timeToX(candle.timestamp, viewport)
    const x = Math.max(0, centerX - candleWidth / 2)
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
      isUp: candle.close > candle.open
    })
  }

  return result
}

