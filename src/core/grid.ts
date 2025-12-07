export function calculatePriceInterval(minPrice: number, maxPrice: number, targetLines: number): number {
  const priceSpan = maxPrice - minPrice
  if (priceSpan <= 0 || targetLines <= 0) return 1
  
  const rawInterval = priceSpan / targetLines
  
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)))
  const normalized = rawInterval / magnitude
  
  let niceValue: number
  if (normalized <= 1) {
    niceValue = 1
  } else if (normalized <= 2) {
    niceValue = 2
  } else if (normalized <= 5) {
    niceValue = 5
  } else {
    niceValue = 10
  }
  
  return niceValue * magnitude
}

export function generatePriceLevels(minPrice: number, maxPrice: number, interval: number): number[] {
  if (interval <= 0) return []
  
  const start = Math.ceil(minPrice / interval) * interval
  const levels: number[] = []
  
  for (let price = start; price <= maxPrice; price += interval) {
    levels.push(price)
  }
  
  return levels
}

export function calculateTimeInterval(from: number, to: number, targetLines: number): number {
  const timeSpan = to - from
  if (timeSpan <= 0 || targetLines <= 0) return 60000
  
  const rawInterval = timeSpan / targetLines
  
  const intervals = [
    1000,
    5000,
    15000,
    30000,
    60000,
    5 * 60000,
    15 * 60000,
    30 * 60000,
    60 * 60000,
    4 * 60 * 60000,
    24 * 60 * 60000
  ]
  
  for (let i = intervals.length - 1; i >= 0; i--) {
    if (intervals[i] <= rawInterval) {
      return intervals[i]
    }
  }
  
  return intervals[0]
}

export function generateTimeLevels(from: number, to: number, interval: number): number[] {
  if (interval <= 0) return []
  
  const start = Math.ceil(from / interval) * interval
  const levels: number[] = []
  
  for (let time = start; time <= to; time += interval) {
    levels.push(time)
  }
  
  return levels
}

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(2) + 'M'
  } else if (price >= 1000) {
    return (price / 1000).toFixed(2) + 'K'
  } else {
    return price.toFixed(2)
  }
}

export function formatTime(timestamp: number, interval: number): string {
  const date = new Date(timestamp)
  
  if (interval >= 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString()
  } else if (interval >= 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
}

export function calculateOptimalLineCount(span: number, dimensionPx: number, minSpacingPx: number): number {
  if (span <= 0 || dimensionPx <= 0 || minSpacingPx <= 0) return 5
  
  const maxLines = Math.floor(dimensionPx / minSpacingPx)
  return Math.max(3, Math.min(maxLines, 20))
}

