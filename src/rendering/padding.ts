export interface LabelPadding {
  left: number
  bottom: number
}

const DEFAULT_LEFT_PADDING = 60
const DEFAULT_BOTTOM_PADDING = 30

export function getDefaultLabelPadding(): LabelPadding {
  return {
    left: DEFAULT_LEFT_PADDING,
    bottom: DEFAULT_BOTTOM_PADDING
  }
}

