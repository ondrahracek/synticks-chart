import type { TimeframeId, Candle } from '../core/types'
import { normalizeToBucket } from '../core/time'

export interface StreamingServiceCallbacks {
  onCandleClosed: (candle: Candle) => void
  onCandleUpdated: (candle: Candle) => void
}

export interface Tick {
  t: number
  price: number
  volume: number
}

export class StreamingService {
  private currentCandle: Candle | null = null
  private currentBucket: number | null = null

  constructor(
    private timeframe: TimeframeId,
    private callbacks: StreamingServiceCallbacks
  ) {}

  ingestTick(tick: Tick): void {
    const bucket = normalizeToBucket(tick.t, this.timeframe)

    if (this.isNewBucket(bucket)) {
      this.closeCurrentCandle()
      this.startNewCandle(bucket, tick)
    } else {
      this.updateCurrentCandle(tick)
    }

    this.notifyCandleUpdated()
  }

  private isNewBucket(bucket: number): boolean {
    return this.currentBucket === null || bucket !== this.currentBucket
  }

  private closeCurrentCandle(): void {
    if (this.currentCandle !== null) {
      this.callbacks.onCandleClosed(this.currentCandle)
    }
  }

  private startNewCandle(bucket: number, tick: Tick): void {
    this.currentBucket = bucket
    this.currentCandle = this.createCandleFromTick(bucket, tick)
  }

  private createCandleFromTick(bucket: number, tick: Tick): Candle {
    return {
      timestamp: bucket,
      open: tick.price,
      high: tick.price,
      low: tick.price,
      close: tick.price,
      volume: tick.volume
    }
  }

  private updateCurrentCandle(tick: Tick): void {
    if (this.currentCandle === null) {
      const bucket = normalizeToBucket(tick.t, this.timeframe)
      this.currentCandle = this.createCandleFromTick(bucket, tick)
      this.currentBucket = bucket
    } else {
      this.currentCandle.high = Math.max(this.currentCandle.high, tick.price)
      this.currentCandle.low = Math.min(this.currentCandle.low, tick.price)
      this.currentCandle.close = tick.price
      this.currentCandle.volume += tick.volume
    }
  }

  private notifyCandleUpdated(): void {
    if (this.currentCandle !== null) {
      this.callbacks.onCandleUpdated({ ...this.currentCandle })
    }
  }
}

