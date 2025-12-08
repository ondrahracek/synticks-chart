import type { Candle } from 'synticks-chart'

export function generateSampleData(count: number = 50): Candle[] {
  const baseTime = Date.now() - count * 60000
  const basePrice = 50000
  const candles: Candle[] = []

  for (let i = 0; i < count; i++) {
    const timestamp = baseTime + i * 60000
    const open = basePrice + (Math.random() - 0.5) * 1000
    const close = open + (Math.random() - 0.5) * 500
    const high = Math.max(open, close) + Math.random() * 200
    const low = Math.min(open, close) - Math.random() * 200
    const volume = Math.random() * 1000

    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume
    })
  }

  return candles
}

export function generateRandomCandle(timestamp?: number): Candle {
  const basePrice = 50000 + (Math.random() - 0.5) * 1000
  const open = basePrice
  const close = open + (Math.random() - 0.5) * 500
  const high = Math.max(open, close) + Math.random() * 200
  const low = Math.min(open, close) - Math.random() * 200
  const volume = Math.random() * 1000

  return {
    timestamp: timestamp ?? Date.now(),
    open,
    high,
    low,
    close,
    volume
  }
}

