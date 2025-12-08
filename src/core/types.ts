// Core types for the charting engine

export type TimeframeId = '1s' | '5s' | '10s' | '15s' | '30s' | '1m' | '5m' | '10m' | '15m' | '30m' | '45m' | '1h' | '4h' | '1d'

export interface Candle {
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: number
}

export interface PricePoint {
  price: number
  timestamp: number
}

export type SeriesId = string

export type PlaybackMode = 'play' | 'pause' | 'catchup'
