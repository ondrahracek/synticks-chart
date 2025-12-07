import type { Candle } from './types'
import type { ChartState } from './state'

export class PlaybackController {
  constructor(private state: ChartState) {}

  pause(): void {
    this.state.playback = 'pause'
  }

  play(): void {
    this.state.playback = 'play'
    this.mergeMissedCandles()
  }

  handleCandleClosed(candle: Candle): void {
    if (this.isLive()) {
      this.appendToCandles(candle)
    } else {
      this.appendToMissedCandles(candle)
    }
  }

  handleCandleUpdated(candle: Candle): void {
    if (this.isLive()) {
      this.updateLastCandle(candle)
    } else {
      this.updateLastMissedCandle(candle)
    }
  }

  private isLive(): boolean {
    return this.state.playback === 'live'
  }

  private appendToCandles(candle: Candle): void {
    this.state.candles.push(candle)
  }

  private appendToMissedCandles(candle: Candle): void {
    this.state.missedCandles.push(candle)
  }

  private updateLastCandle(candle: Candle): void {
    if (this.state.candles.length > 0) {
      this.state.candles[this.state.candles.length - 1] = candle
    }
  }

  private updateLastMissedCandle(candle: Candle): void {
    if (this.state.missedCandles.length > 0) {
      this.state.missedCandles[this.state.missedCandles.length - 1] = candle
    }
  }

  private mergeMissedCandles(): void {
    this.state.candles.push(...this.state.missedCandles)
    this.state.missedCandles = []
  }
}
