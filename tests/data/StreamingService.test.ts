import { describe, it, expect } from 'vitest'
import { StreamingService } from '../../src/data/StreamingService'
import type { Candle } from '../../src/core/types'

interface Tick {
  t: number
  price: number
  volume: number
}

describe('StreamingService', () => {
  it('updates candle for ticks in the same bucket', () => {
    const baseTime = new Date('2024-01-01T00:00:00Z').getTime()
    const updated: Candle[] = []
    
    const svc = new StreamingService('1m', {
      onCandleClosed: () => {},
      onCandleUpdated: (c) => updated.push(c)
    })

    svc.ingestTick({ t: baseTime + 0 * 1000, price: 100, volume: 1 })
    svc.ingestTick({ t: baseTime + 10 * 1000, price: 102, volume: 2 })
    svc.ingestTick({ t: baseTime + 30 * 1000, price: 101, volume: 1 })

    expect(updated).toHaveLength(3)
    expect(updated[updated.length - 1].close).toBe(101)
    expect(updated[updated.length - 1].high).toBe(102)
    expect(updated[updated.length - 1].low).toBe(100)
    expect(updated[updated.length - 1].volume).toBe(4)
  })

  it('closes old candle and creates new one when crossing bucket boundary', () => {
    const baseTime = new Date('2024-01-01T00:00:00Z').getTime()
    const closed: Candle[] = []
    const updated: Candle[] = []
    
    const svc = new StreamingService('1m', {
      onCandleClosed: (c) => closed.push(c),
      onCandleUpdated: (c) => updated.push(c)
    })

    svc.ingestTick({ t: baseTime + 0 * 1000, price: 100, volume: 1 })
    svc.ingestTick({ t: baseTime + 30 * 1000, price: 102, volume: 2 })
    svc.ingestTick({ t: baseTime + 60 * 1000, price: 103, volume: 1 })
    svc.ingestTick({ t: baseTime + 90 * 1000, price: 104, volume: 2 })

    expect(closed).toHaveLength(1)
    expect(closed[0].close).toBe(102)
    expect(closed[0].timestamp).toBe(baseTime)
    
    expect(updated).toHaveLength(4)
    expect(updated[updated.length - 1].open).toBe(103)
    expect(updated[updated.length - 1].close).toBe(104)
    expect(updated[updated.length - 1].timestamp).toBe(baseTime + 60 * 1000)
  })

  it('accumulates volumes correctly across multiple ticks', () => {
    const baseTime = new Date('2024-01-01T00:00:00Z').getTime()
    const updated: Candle[] = []
    
    const svc = new StreamingService('1m', {
      onCandleClosed: () => {},
      onCandleUpdated: (c) => updated.push(c)
    })

    svc.ingestTick({ t: baseTime + 0 * 1000, price: 100, volume: 10 })
    svc.ingestTick({ t: baseTime + 10 * 1000, price: 101, volume: 20 })
    svc.ingestTick({ t: baseTime + 20 * 1000, price: 102, volume: 15 })
    svc.ingestTick({ t: baseTime + 30 * 1000, price: 103, volume: 5 })

    expect(updated[updated.length - 1].volume).toBe(50)
  })
})

