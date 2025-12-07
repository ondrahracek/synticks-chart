import type { Candle, PlaybackMode } from './types'

export interface ViewportState {
  // TODO: viewport properties
}

export interface ChartState {
  candles: Candle[]
  missedCandles: Candle[]
  playback: PlaybackMode | 'live'
  viewport?: ViewportState
}

export function createChartState(): ChartState {
  return {
    candles: [],
    missedCandles: [],
    playback: 'live'
  }
}

