import type { Candle } from './types'

const DEFAULT_TIME_PADDING_PERCENT = 0.1
const DEFAULT_TIME_PADDING_MS = 60000
const DEFAULT_PRICE_PADDING_PERCENT = 0.05
const DEFAULT_INITIAL_CANDLES = 150
const MIN_CANDLE_WIDTH_PX = 10
const MAX_CANDLE_WIDTH_PX = 100
const MAX_INITIAL_CANDLES = 400
const CANDLE_WIDTH_USAGE = 0.8
const VIEWPORT_AT_LATEST_THRESHOLD = 0.05

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
  maxTime: number,
  candles?: Candle[]
): Viewport {
  const zoomed = zoomViewport(viewport, factor, anchorTime)
  let clamped = clampViewportToRange(zoomed, minTime, maxTime)
  
  if (candles && candles.length > 0) {
    if (factor < 1) {
      const maxAllowedSpan = calculateMaxTimeSpanForMinCandleWidth(viewport.widthPx, candles)
      const currentSpan = clamped.to - clamped.from
      if (currentSpan > maxAllowedSpan) {
        const halfSpan = maxAllowedSpan / 2
        clamped = {
          ...clamped,
          from: anchorTime - halfSpan,
          to: anchorTime + halfSpan
        }
        clamped = clampViewportToRange(clamped, minTime, maxTime)
      }
    } else if (factor > 1) {
      const minAllowedSpan = calculateMinTimeSpanForMaxCandleWidth(viewport.widthPx, candles)
      const currentSpan = clamped.to - clamped.from
      if (currentSpan < minAllowedSpan) {
        const halfSpan = minAllowedSpan / 2
        clamped = {
          ...clamped,
          from: anchorTime - halfSpan,
          to: anchorTime + halfSpan
        }
        clamped = clampViewportToRange(clamped, minTime, maxTime)
      }
    }
  }
  
  return clamped
}

function getAverageTimeInterval(candles: Candle[]): number {
  if (candles.length < 2) {
    return 0
  }
  
  const timeIntervals: number[] = []
  for (let i = 1; i < candles.length; i++) {
    timeIntervals.push(candles[i].timestamp - candles[i - 1].timestamp)
  }
  return timeIntervals.reduce((sum, interval) => sum + interval, 0) / timeIntervals.length
}

function calculateMaxTimeSpanForMinCandleWidth(viewportWidthPx: number, candles: Candle[]): number {
  if (candles.length < 2) {
    return Infinity
  }
  
  const avgTimeInterval = getAverageTimeInterval(candles)
  return (avgTimeInterval * viewportWidthPx * CANDLE_WIDTH_USAGE) / MIN_CANDLE_WIDTH_PX
}

function calculateMinTimeSpanForMaxCandleWidth(viewportWidthPx: number, candles: Candle[]): number {
  if (candles.length < 2) {
    return 0
  }
  
  const avgTimeInterval = getAverageTimeInterval(candles)
  return (avgTimeInterval * viewportWidthPx * CANDLE_WIDTH_USAGE) / MAX_CANDLE_WIDTH_PX
}

export function filterCandlesByViewport(
  candles: Candle[],
  viewport: Viewport,
  paddingPercent: number = DEFAULT_TIME_PADDING_PERCENT
): Candle[] {
  if (candles.length === 0) return []

  const timeSpan = viewport.to - viewport.from
  const padding = timeSpan > 0 ? timeSpan * paddingPercent : DEFAULT_TIME_PADDING_MS
  const minTime = viewport.from - padding
  const maxTime = viewport.to + padding

  return candles.filter(candle =>
    candle.timestamp >= minTime && candle.timestamp <= maxTime
  )
}

export function calculateInitialCandleCount(viewportWidthPx: number): number {
  const availableWidth = viewportWidthPx * CANDLE_WIDTH_USAGE
  const maxFromWidth = Math.floor(availableWidth / MIN_CANDLE_WIDTH_PX)

  let count: number
  if (maxFromWidth < DEFAULT_INITIAL_CANDLES) {
    count = maxFromWidth
  } else if (maxFromWidth <= MAX_INITIAL_CANDLES) {
    count = DEFAULT_INITIAL_CANDLES
  } else {
    count = MAX_INITIAL_CANDLES
  }

  return Math.max(1, count)
}

export function createViewportFromLastCandles(
  candles: Candle[],
  count: number,
  widthPx: number,
  heightPx: number
): Viewport | null {
  if (candles.length === 0) return null

  const lastCandles = candles.slice(-count)
  return createViewportFromCandles(lastCandles, widthPx, heightPx)
}

export function isViewportAtLatest(viewport: Viewport, candles: Candle[]): boolean {
  if (candles.length === 0) return false
  
  const latestCandleTime = candles[candles.length - 1].timestamp
  const viewportEndTime = viewport.to
  const timePadding = (viewport.to - viewport.from) * VIEWPORT_AT_LATEST_THRESHOLD
  
  return latestCandleTime <= viewportEndTime + timePadding
}

export function panToLatest(viewport: Viewport, candles: Candle[]): Viewport {
  if (candles.length === 0) return viewport
  
  const latestCandleTime = candles[candles.length - 1].timestamp
  const timeSpan = viewport.to - viewport.from
  const timePadding = timeSpan > 0 ? timeSpan * DEFAULT_TIME_PADDING_PERCENT : DEFAULT_TIME_PADDING_MS
  
  return {
    ...viewport,
    from: latestCandleTime - timeSpan + timePadding,
    to: latestCandleTime + timePadding
  }
}

export function addPricePadding(minPrice: number, maxPrice: number, paddingPercent: number = DEFAULT_PRICE_PADDING_PERCENT): { minPrice: number; maxPrice: number } {
  const priceSpan = maxPrice - minPrice
  if (priceSpan <= 0) {
    const fixedPadding = minPrice > 0 ? minPrice * paddingPercent : 1
    return {
      minPrice: minPrice - fixedPadding,
      maxPrice: maxPrice + fixedPadding
    }
  }
  
  const padding = priceSpan * paddingPercent
  return {
    minPrice: minPrice - padding,
    maxPrice: maxPrice + padding
  }
}

