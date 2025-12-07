import type { Candle, PlaybackMode } from './types'
import type { Viewport } from './viewport'

export interface ViewportState {
  // TODO: viewport properties
}

export interface Crosshair {
  x: number
  y: number
}

export interface ChartState {
  candles: Candle[]
  missedCandles: Candle[]
  playback: PlaybackMode | 'live'
  viewport?: Viewport
  crosshair?: Crosshair
}

export function createChartState(): ChartState {
  return {
    candles: [],
    missedCandles: [],
    playback: 'live'
  }
}

