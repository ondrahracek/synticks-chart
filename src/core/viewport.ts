import type { Candle } from './types'

const DEFAULT_TIME_PADDING_PERCENT = 0.1
const DEFAULT_TIME_PADDING_MS = 60000

export interface Viewport {
  from: number
  to: number
  widthPx: number
  heightPx: number
}

export function timeToX(time: number, viewport: Viewport): number {
  const timeSpan = viewport.to - viewport.from
  if (timeSpan === 0) return 0
  const ratio = (time - viewport.from) / timeSpan
  return ratio * viewport.widthPx
}

export function xToTime(x: number, viewport: Viewport): number {
  const timeSpan = viewport.to - viewport.from
  if (viewport.widthPx === 0) return viewport.from
  const ratio = x / viewport.widthPx
  return viewport.from + ratio * timeSpan
}

export function priceToY(price: number, viewport: Viewport, minPrice: number, maxPrice: number): number {
  const priceSpan = maxPrice - minPrice
  if (priceSpan === 0) return viewport.heightPx / 2
  const ratio = (maxPrice - price) / priceSpan
  return ratio * viewport.heightPx
}

export function yToPrice(y: number, viewport: Viewport, minPrice: number, maxPrice: number): number {
  const priceSpan = maxPrice - minPrice
  if (viewport.heightPx === 0) return minPrice
  const ratio = y / viewport.heightPx
  return maxPrice - ratio * priceSpan
}

export function panViewport(viewport: Viewport, deltaPx: number): Viewport {
  const timeSpan = viewport.to - viewport.from
  const deltaTime = (deltaPx / viewport.widthPx) * timeSpan
  return {
    ...viewport,
    from: viewport.from - deltaTime,
    to: viewport.to - deltaTime
  }
}

export function zoomViewport(viewport: Viewport, factor: number, anchorTime: number): Viewport {
  const timeSpan = viewport.to - viewport.from
  const newSpan = timeSpan / factor
  const halfSpan = newSpan / 2
  return {
    ...viewport,
    from: anchorTime - halfSpan,
    to: anchorTime + halfSpan
  }
}

export function createViewportFromCandles(
  candles: Candle[],
  widthPx: number,
  heightPx: number
): Viewport | null {
  if (candles.length === 0) return null

  const timestamps = candles.map(c => c.timestamp)
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)
  const timeSpan = maxTime - minTime
  const timePadding = timeSpan > 0 ? timeSpan * DEFAULT_TIME_PADDING_PERCENT : DEFAULT_TIME_PADDING_MS

  return {
    from: minTime - timePadding,
    to: maxTime + timePadding,
    widthPx,
    heightPx
  }
}

export function updateViewportDimensions(
  viewport: Viewport,
  widthPx: number,
  heightPx: number
): Viewport {
  return {
    ...viewport,
    widthPx,
    heightPx
  }
}

export function getDataTimeRange(
  candles: Candle[],
  paddingPercent: number = DEFAULT_TIME_PADDING_PERCENT
): { minTime: number; maxTime: number } | null {
  if (candles.length === 0) return null
  
  const timestamps = candles.map(c => c.timestamp)
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)
  const timeSpan = maxTime - minTime
  const timePadding = timeSpan > 0 
    ? timeSpan * paddingPercent 
    : DEFAULT_TIME_PADDING_MS
  
  return {
    minTime: minTime - timePadding,
    maxTime: maxTime + timePadding
  }
}

export function clampViewportToRange(
  viewport: Viewport,
  minTime: number,
  maxTime: number
): Viewport {
  const timeSpan = viewport.to - viewport.from
  const dataSpan = maxTime - minTime
  
  if (timeSpan >= dataSpan) {
    return {
      ...viewport,
      from: minTime,
      to: maxTime
    }
  }
  
  let from = Math.max(viewport.from, minTime)
  let to = from + timeSpan
  
  if (to > maxTime) {
    to = maxTime
    from = to - timeSpan
    from = Math.max(from, minTime)
  }
  
  return {
    ...viewport,
    from,
    to
  }
}

export function zoomViewportWithBounds(
  viewport: Viewport,
  factor: number,
  anchorTime: number,
  minTime: number,
  maxTime: number
): Viewport {
  const zoomed = zoomViewport(viewport, factor, anchorTime)
  return clampViewportToRange(zoomed, minTime, maxTime)
}

