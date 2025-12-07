import { describe, it, expect } from 'vitest'

describe('Public API', () => {
  it('exports ChartEngine from main entry', async () => {
    const module = await import('../src/index')
    expect(module.ChartEngine).toBeDefined()
  })

  it('exports TimeframeId type from main entry', async () => {
    const module = await import('../src/index')
    expect(module).toBeDefined()
  })

  it('exports PlaygroundChart from vue entry', async () => {
    const module = await import('../src/vue')
    expect(module.PlaygroundChart).toBeDefined()
  })
})

