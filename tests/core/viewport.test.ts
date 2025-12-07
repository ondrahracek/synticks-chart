import { describe, it, expect } from 'vitest'
import { timeToX, xToTime, priceToY, yToPrice, panViewport, zoomViewport, createViewportFromCandles, updateViewportDimensions, getDataTimeRange, clampViewportToRange, zoomViewportWithBounds } from '../../src/core/viewport'
import type { Viewport } from '../../src/core/viewport'
import type { Candle } from '../../src/core/types'

describe('timeToX', () => {
  it('maps from time to 0', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    expect(timeToX(1000, viewport)).toBe(0)
  })

  it('maps to time to widthPx', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    expect(timeToX(2000, viewport)).toBe(800)
  })

  it('maps mid-time to width / 2', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    expect(timeToX(1500, viewport)).toBe(400)
  })
})

describe('priceToY', () => {
  it('maps maxPrice to 0 (top)', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    expect(priceToY(200, viewport, 100, 200)).toBe(0)
  })

  it('maps minPrice to heightPx', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    expect(priceToY(100, viewport, 100, 200)).toBe(600)
  })

  it('maps mid-price to height / 2', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    expect(priceToY(150, viewport, 100, 200)).toBe(300)
  })
})

describe('xToTime', () => {
  it('maps x=0 to from time', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    expect(xToTime(0, viewport)).toBe(1000)
  })

  it('maps x=widthPx to to time', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    expect(xToTime(800, viewport)).toBe(2000)
  })
})

describe('yToPrice', () => {
  it('maps y=0 to maxPrice', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    expect(yToPrice(0, viewport, 100, 200)).toBe(200)
  })

  it('maps y=heightPx to minPrice', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    expect(yToPrice(600, viewport, 100, 200)).toBe(100)
  })
})

describe('panViewport', () => {
  it('pans left by shifting from/to times by delta in time', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    const timeSpan = viewport.to - viewport.from
    const deltaTime = (100 / viewport.widthPx) * timeSpan

    const result = panViewport(viewport, 100)

    expect(result.from).toBe(1000 - deltaTime)
    expect(result.to).toBe(2000 - deltaTime)
    expect(result.widthPx).toBe(viewport.widthPx)
    expect(result.heightPx).toBe(viewport.heightPx)
  })

  it('pans right by shifting from/to times by delta in time', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    const timeSpan = viewport.to - viewport.from
    const deltaTime = (-100 / viewport.widthPx) * timeSpan

    const result = panViewport(viewport, -100)

    expect(result.from).toBe(1000 - deltaTime)
    expect(result.to).toBe(2000 - deltaTime)
    expect(result.widthPx).toBe(viewport.widthPx)
    expect(result.heightPx).toBe(viewport.heightPx)
  })
})

describe('zoomViewport', () => {
  it('zooms in by shrinking visible span around anchor time', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    const result = zoomViewport(viewport, 2, 1500)

    const originalSpan = viewport.to - viewport.from
    const newSpan = result.to - result.from
    expect(newSpan).toBe(originalSpan / 2)
    expect(result.from).toBeLessThan(1500)
    expect(result.to).toBeGreaterThan(1500)
    expect(result.widthPx).toBe(viewport.widthPx)
    expect(result.heightPx).toBe(viewport.heightPx)
  })

  it('zooms out by expanding visible span around anchor time', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }

    const result = zoomViewport(viewport, 0.5, 1500)

    const originalSpan = viewport.to - viewport.from
    const newSpan = result.to - result.from
    expect(newSpan).toBe(originalSpan * 2)
    expect(result.from).toBeLessThan(1500)
    expect(result.to).toBeGreaterThan(1500)
    expect(result.widthPx).toBe(viewport.widthPx)
    expect(result.heightPx).toBe(viewport.heightPx)
  })
})

describe('createViewportFromCandles', () => {
  it('returns null for empty candles array', () => {
    expect(createViewportFromCandles([], 800, 600)).toBeNull()
  })

  it('creates viewport with correct time range', () => {
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { timestamp: 2000, open: 105, high: 115, low: 95, close: 110, volume: 1000 }
    ]
    const viewport = createViewportFromCandles(candles, 800, 600)
    
    expect(viewport).not.toBeNull()
    expect(viewport!.from).toBeLessThan(1000)
    expect(viewport!.to).toBeGreaterThan(2000)
    expect(viewport!.widthPx).toBe(800)
    expect(viewport!.heightPx).toBe(600)
  })

  it('handles single candle', () => {
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 }
    ]
    const viewport = createViewportFromCandles(candles, 800, 600)
    
    expect(viewport).not.toBeNull()
    expect(viewport!.from).toBeLessThan(1000)
    expect(viewport!.to).toBeGreaterThan(1000)
  })
})

describe('updateViewportDimensions', () => {
  it('updates dimensions while preserving time range', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }
    
    const updated = updateViewportDimensions(viewport, 1200, 900)
    
    expect(updated.from).toBe(1000)
    expect(updated.to).toBe(2000)
    expect(updated.widthPx).toBe(1200)
    expect(updated.heightPx).toBe(900)
  })
})

describe('getDataTimeRange', () => {
  it('returns null for empty candles array', () => {
    expect(getDataTimeRange([])).toBeNull()
  })
})

describe('clampViewportToRange', () => {
  it('returns viewport unchanged when it fits within range', () => {
    const viewport: Viewport = {
      from: 1100,
      to: 1900,
      widthPx: 800,
      heightPx: 600
    }
    
    const result = clampViewportToRange(viewport, 1000, 2000)
    
    expect(result.from).toBe(1100)
    expect(result.to).toBe(1900)
  })

  it('clamps viewport when it extends beyond maxTime', () => {
    const viewport: Viewport = {
      from: 1500,
      to: 2500,
      widthPx: 800,
      heightPx: 600
    }
    
    const result = clampViewportToRange(viewport, 1000, 2000)
    
    expect(result.to).toBe(2000)
    expect(result.from).toBeLessThanOrEqual(2000)
    expect(result.from).toBeGreaterThanOrEqual(1000)
  })
})

describe('zoomViewportWithBounds', () => {
  it('zooms viewport and clamps to bounds', () => {
    const viewport: Viewport = {
      from: 1000,
      to: 2000,
      widthPx: 800,
      heightPx: 600
    }
    
    const result = zoomViewportWithBounds(viewport, 0.5, 1500, 500, 3000)
    
    const originalSpan = viewport.to - viewport.from
    const newSpan = result.to - result.from
    expect(newSpan).toBeGreaterThan(originalSpan)
    expect(result.from).toBeGreaterThanOrEqual(500)
    expect(result.to).toBeLessThanOrEqual(3000)
  })
})

