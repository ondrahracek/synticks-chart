import { describe, it, expect } from 'vitest'
import { getTheme, type Theme } from '../../src/core/theme'

describe('Theme', () => {
  it('returns dark theme when requested', () => {
    const theme = getTheme('dark')

    expect(theme).toBeDefined()
    expect(theme.background).toBeDefined()
    expect(theme.grid).toBeDefined()
    expect(theme.candleUp).toBeDefined()
    expect(theme.candleDown).toBeDefined()
  })

  it('returns light theme when requested', () => {
    const theme = getTheme('light')

    expect(theme).toBeDefined()
    expect(theme.background).toBeDefined()
  })
})

