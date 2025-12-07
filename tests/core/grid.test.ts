import { describe, it, expect } from 'vitest'
import { calculatePriceInterval, generatePriceLevels, calculateTimeInterval, generateTimeLevels, formatPrice, formatTime, calculateOptimalLineCount } from '../../src/core/grid'

describe('calculatePriceInterval', () => {
  it('calculates nice price interval for given price range', () => {
    const interval = calculatePriceInterval(50000, 51000, 5)
    
    expect(interval).toBeGreaterThan(0)
    expect(interval).toBeLessThanOrEqual(1000)
  })
})

describe('generatePriceLevels', () => {
  it('generates price levels for given range and interval', () => {
    const levels = generatePriceLevels(50000, 51000, 200)
    
    expect(levels.length).toBeGreaterThan(0)
    expect(levels[0]).toBeGreaterThanOrEqual(50000)
    expect(levels[levels.length - 1]).toBeLessThanOrEqual(51000)
    expect(levels.every((level, i) => i === 0 || level > levels[i - 1])).toBe(true)
  })
})

describe('calculateTimeInterval', () => {
  it('calculates nice time interval for given time range', () => {
    const from = 1000
    const to = 1000 + (60 * 60 * 1000)
    const interval = calculateTimeInterval(from, to, 5)
    
    expect(interval).toBeGreaterThan(0)
    expect(interval).toBeLessThanOrEqual(60 * 60 * 1000)
  })
})

describe('generateTimeLevels', () => {
  it('generates time levels aligned to intervals', () => {
    const from = 1000
    const to = 1000 + (60 * 60 * 1000)
    const interval = 15 * 60000
    const levels = generateTimeLevels(from, to, interval)
    
    expect(levels.length).toBeGreaterThan(0)
    expect(levels[0]).toBeGreaterThanOrEqual(from)
    expect(levels[levels.length - 1]).toBeLessThanOrEqual(to)
    expect(levels.every((level, i) => i === 0 || level > levels[i - 1])).toBe(true)
  })
})

describe('formatPrice', () => {
  it('formats price value for display', () => {
    const formatted = formatPrice(50000)
    
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

describe('formatTime', () => {
  it('formats timestamp for display', () => {
    const timestamp = 1000
    const interval = 60000
    const formatted = formatTime(timestamp, interval)
    
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })
})

describe('calculateOptimalLineCount', () => {
  it('calculates optimal number of grid lines based on dimensions', () => {
    const lineCount = calculateOptimalLineCount(1000, 600, 50)
    
    expect(lineCount).toBeGreaterThan(0)
    expect(lineCount).toBeLessThanOrEqual(20)
  })
})

