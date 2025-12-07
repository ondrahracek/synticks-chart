import { describe, it, expect } from 'vitest'
import { startDrawing, updateDrawing, finishDrawing } from '../../src/core/drawings'
import type { DrawingKind, DrawingShape } from '../../src/core/drawings'

describe('DrawingTool', () => {
  it('starts a trendline drawing with first point', () => {
    const shape = startDrawing('trendline', { time: 1000, price: 100 })

    expect(shape.kind).toBe('trendline')
    expect(shape.points).toHaveLength(1)
    expect(shape.points[0]).toEqual({ time: 1000, price: 100 })
    expect(shape.isComplete).toBe(false)
  })

  it('updates drawing with new point', () => {
    const shape = startDrawing('trendline', { time: 1000, price: 100 })
    const updated = updateDrawing(shape, { time: 2000, price: 150 })

    expect(updated.points).toHaveLength(2)
    expect(updated.points[1]).toEqual({ time: 2000, price: 150 })
    expect(updated.isComplete).toBe(false)
  })

  it('finishes drawing and marks it as complete', () => {
    const shape = startDrawing('trendline', { time: 1000, price: 100 })
    const updated = updateDrawing(shape, { time: 2000, price: 150 })
    const finished = finishDrawing(updated)

    expect(finished.isComplete).toBe(true)
    expect(finished.points).toHaveLength(2)
  })

  it('starts a horizontal line drawing', () => {
    const shape = startDrawing('horizontal', { time: 1000, price: 100 })

    expect(shape.kind).toBe('horizontal')
    expect(shape.points).toHaveLength(1)
  })

  it('completes horizontal line with second point at same price', () => {
    const shape = startDrawing('horizontal', { time: 1000, price: 100 })
    const updated = updateDrawing(shape, { time: 2000, price: 100 })
    const finished = finishDrawing(updated)

    expect(finished.isComplete).toBe(true)
    expect(finished.points[0].price).toBe(finished.points[1].price)
  })
})

