export type ThemeName = 'light' | 'dark'

export interface Theme {
  background: string
  grid: string
  candleUp: string
  candleDown: string
  drawing: string
  indicator: string
}

export function getTheme(name: ThemeName): Theme {
  if (name === 'dark') {
    return {
      background: '#1a1a1a',
      grid: '#2a2a2a',
      candleUp: '#26a69a',
      candleDown: '#ef5350',
      drawing: '#2196F3',
      indicator: '#ff9800'
    }
  }

  return {
    background: '#ffffff',
    grid: '#e0e0e0',
    candleUp: '#26a69a',
    candleDown: '#ef5350',
    drawing: '#2196F3',
    indicator: '#ff9800'
  }
}

