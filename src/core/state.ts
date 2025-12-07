import type { Candle, PlaybackMode } from './types'
import type { Viewport } from './viewport'
import type { DrawingShape } from './drawings'
import type { Theme } from './theme'

export interface Crosshair {
  x: number
  y: number
}

export type InteractionMode = 'pan' | 'draw-trendline' | 'draw-horizontal'

export interface IndicatorData {
  id: string
  values: number[]
  timestamps: number[]
}

export interface ChartState {
  candles: Candle[]
  missedCandles: Candle[]
  playback: PlaybackMode | 'live'
  viewport?: Viewport
  crosshair?: Crosshair
  drawings?: DrawingShape[]
  currentDrawing?: DrawingShape
  indicators?: IndicatorData[]
  interactionMode?: InteractionMode
  theme?: Theme
}

export function createChartState(): ChartState {
  return {
    candles: [],
    missedCandles: [],
    playback: 'live'
  }
}

