import { describe, it, expect } from 'vitest'
import { createChartState } from '../../src/core/state'

describe('ChartState', () => {
  it('creates initial state with autoScrollEnabled true', () => {
    const state = createChartState()
    
    expect(state.autoScrollEnabled).toBe(true)
  })
})

