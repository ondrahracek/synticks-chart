import type { Candle, TimeframeId } from './types'
import { normalizeToBucket } from './time'

function aggregateBucketCandles(candles: Candle[]): Omit<Candle, 'timestamp'> {
  const open = candles[0].open
  const close = candles[candles.length - 1].close
  let high = candles[0].high
  let low = candles[0].low
  let volume = 0

  for (const candle of candles) {
    high = Math.max(high, candle.high)
    low = Math.min(low, candle.low)
    volume += candle.volume
  }

  return {
    open,
    high,
    low,
    close,
    volume
  }
}

export function aggregateCandles(baseCandles: Candle[], targetTf: TimeframeId): Candle[] {
  if (baseCandles.length === 0) {
    return []
  }

  const buckets = new Map<number, Candle[]>()

  for (const candle of baseCandles) {
    const bucketStart = normalizeToBucket(candle.timestamp, targetTf)
    if (!buckets.has(bucketStart)) {
      buckets.set(bucketStart, [])
    }
    buckets.get(bucketStart)!.push(candle)
  }

  const result: Candle[] = []

  for (const [bucketStart, candles] of buckets.entries()) {
    const aggregated = aggregateBucketCandles(candles)
    result.push({
      ...aggregated,
      timestamp: bucketStart
    })
  }

  return result
}

