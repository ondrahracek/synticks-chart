import { describe, it, expect } from 'vitest'
import { timeToX, xToTime, priceToY, yToPrice, panViewport, zoomViewport } from '../../src/core/viewport'
import type { Viewport } from '../../src/core/viewport'

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

