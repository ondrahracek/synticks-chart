export type DrawingKind = 'trendline' | 'horizontal'

export interface Point {
  time: number
  price: number
}

export interface DrawingShape {
  kind: DrawingKind
  points: Point[]
  isComplete: boolean
}

export function startDrawing(kind: DrawingKind, firstPoint: Point): DrawingShape {
  return {
    kind,
    points: [firstPoint],
    isComplete: false
  }
}

export function updateDrawing(shape: DrawingShape, newPoint: Point): DrawingShape {
  return {
    ...shape,
    points: [...shape.points, newPoint]
  }
}

export function finishDrawing(shape: DrawingShape): DrawingShape {
  return {
    ...shape,
    isComplete: true
  }
}

