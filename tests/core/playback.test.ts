import { describe, it, expect } from 'vitest'
import { PlaybackController } from '../../src/core/playback'
import { createChartState } from '../../src/core/state'
import type { Candle } from '../../src/core/types'

describe('PlaybackController', () => {
  it('has initial state with playback live, empty candles and missedCandles', () => {
    const state = createChartState()
    const controller = new PlaybackController(state)

    expect(state.playback).toBe('live')
    expect(state.candles).toEqual([])
    expect(state.missedCandles).toEqual([])
  })

  it('appends to candles when live and handleCandleClosed is called', () => {
    const state = createChartState()
    const controller = new PlaybackController(state)
    const candle: Candle = {
      timestamp: 1000,
      open: 100,
      high: 105,
      low: 99,
      close: 103,
      volume: 1000
    }

    controller.handleCandleClosed(candle)

    expect(state.candles).toHaveLength(1)
    expect(state.candles[0]).toEqual(candle)
  })

  it('updates last candle when live and handleCandleUpdated is called', () => {
    const state = createChartState()
    const controller = new PlaybackController(state)
    const candle1: Candle = {
      timestamp: 1000,
      open: 100,
      high: 105,
      low: 99,
      close: 103,
      volume: 1000
    }
    const candle2: Candle = {
      timestamp: 1000,
      open: 100,
      high: 107,
      low: 98,
      close: 104,
      volume: 1200
    }

    controller.handleCandleClosed(candle1)
    controller.handleCandleUpdated(candle2)

    expect(state.candles).toHaveLength(1)
    expect(state.candles[0]).toEqual(candle2)
  })

  it('appends to missedCandles when paused and handleCandleClosed is called', () => {
    const state = createChartState()
    const controller = new PlaybackController(state)
    const candle: Candle = {
      timestamp: 1000,
      open: 100,
      high: 105,
      low: 99,
      close: 103,
      volume: 1000
    }

    controller.pause()
    controller.handleCandleClosed(candle)

    expect(state.missedCandles).toHaveLength(1)
    expect(state.missedCandles[0]).toEqual(candle)
    expect(state.candles).toHaveLength(0)
  })

  it('updates latest missedCandles when paused and handleCandleUpdated is called', () => {
    const state = createChartState()
    const controller = new PlaybackController(state)
    const candle1: Candle = {
      timestamp: 1000,
      open: 100,
      high: 105,
      low: 99,
      close: 103,
      volume: 1000
    }
    const candle2: Candle = {
      timestamp: 1000,
      open: 100,
      high: 107,
      low: 98,
      close: 104,
      volume: 1200
    }

    controller.pause()
    controller.handleCandleClosed(candle1)
    controller.handleCandleUpdated(candle2)

    expect(state.missedCandles).toHaveLength(1)
    expect(state.missedCandles[0]).toEqual(candle2)
  })

  it('merges missedCandles into candles and clears buffer when play is called', () => {
    const state = createChartState()
    const controller = new PlaybackController(state)
    const candle1: Candle = {
      timestamp: 1000,
      open: 100,
      high: 105,
      low: 99,
      close: 103,
      volume: 1000
    }
    const candle2: Candle = {
      timestamp: 2000,
      open: 103,
      high: 107,
      low: 102,
      close: 106,
      volume: 1200
    }

    controller.pause()
    controller.handleCandleClosed(candle1)
    controller.handleCandleClosed(candle2)
    controller.play()

    expect(state.candles).toHaveLength(2)
    expect(state.candles[0]).toEqual(candle1)
    expect(state.candles[1]).toEqual(candle2)
    expect(state.missedCandles).toHaveLength(0)
    expect(state.playback).toBe('play')
  })
})

