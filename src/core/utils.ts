export function safeMin(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((min, val) => Math.min(min, val), values[0])
}

export function safeMax(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((max, val) => Math.max(max, val), values[0])
}

export function safeMinOf<T>(items: T[], selector: (item: T) => number): number {
  if (items.length === 0) return 0
  return items.reduce((min, item) => Math.min(min, selector(item)), selector(items[0]))
}

export function safeMaxOf<T>(items: T[], selector: (item: T) => number): number {
  if (items.length === 0) return 0
  return items.reduce((max, item) => Math.max(max, selector(item)), selector(items[0]))
}

