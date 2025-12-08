import type { Candle } from './types'
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

export interface LayoutConfig {
  labelPadding?: {
    enabled: boolean
    left?: number
    bottom?: number
  }
}

export interface ChartState {
  candles: Candle[]
  autoScrollEnabled: boolean
  viewport?: Viewport
  crosshair?: Crosshair
  drawings?: DrawingShape[]
  currentDrawing?: DrawingShape
  indicators?: IndicatorData[]
  interactionMode?: InteractionMode
  theme?: Theme
  layout?: LayoutConfig
}

export function createChartState(): ChartState {
  return {
    candles: [],
    autoScrollEnabled: true,
    layout: {
      labelPadding: {
        enabled: true
      }
    }
  }
}

