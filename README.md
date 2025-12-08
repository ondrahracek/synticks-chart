# SynTicks Chart

A playful real-time candlestick charting engine for Vue 3 and vanilla JavaScript/TypeScript.

## Installation

```bash
npm install synticks-chart
```

## Quick Start

### Vue Component (Recommended)

```vue
<script setup lang="ts">
import { ref } from "vue";
import { PlaygroundChart } from "synticks-chart/vue";
import type { Candle, TimeframeId } from "synticks-chart";

const chartRef = ref<InstanceType<typeof PlaygroundChart> | null>(null);
const symbol = ref("BTCUSDT");
const timeframe = ref<TimeframeId>("1m");

function loadData() {
  const candles: Candle[] = [
    {
      timestamp: 1000,
      open: 100,
      high: 105,
      low: 99,
      close: 103,
      volume: 1000,
    },
    {
      timestamp: 2000,
      open: 103,
      high: 107,
      low: 102,
      close: 106,
      volume: 1200,
    },
    // ... more candles
  ];
  chartRef.value?.loadCandles(candles);
}
</script>

<template>
  <div style="width: 100%; height: 600px;">
    <PlaygroundChart
      ref="chartRef"
      :symbol="symbol"
      :timeframe="timeframe"
      theme="dark"
    />
  </div>
</template>
```

### Programmatic API

```typescript
import { ChartEngine } from "synticks-chart";
import type { Candle } from "synticks-chart";

const canvas = document.getElementById("chart") as HTMLCanvasElement;
const engine = new ChartEngine(canvas, {
  symbol: "BTCUSDT",
  timeframe: "1m",
});

const candles: Candle[] = [
  /* ... */
];
engine.loadCandles(candles);
```

## Data Structure

Every candle must follow this structure:

```typescript
interface Candle {
  timestamp: number; // Unix timestamp in milliseconds
  open: number; // Opening price
  high: number; // Highest price
  low: number; // Lowest price
  close: number; // Closing price
  volume: number; // Trading volume
}
```

Example:

```typescript
const candle: Candle = {
  timestamp: Date.now(), // or any millisecond timestamp
  open: 100.5,
  high: 105.75,
  low: 99.25,
  close: 103.0,
  volume: 1500,
};
```

## API Reference

### Vue Component Props

```typescript
interface Props {
  symbol: string; // Required: Trading symbol
  timeframe: TimeframeId; // Required: Chart timeframe
  theme?: ThemeName; // Optional: Theme ('light' | 'dark')
}
```

### Essential Methods

#### Data Loading

**`loadCandles(candles: Candle[]): void`**

- Loads candle data and auto-fits the viewport
- Replaces all existing data
- Auto-creates viewport to show all candles
- Recalculates indicators

**`appendCandle(candle: Candle): void`**

- Adds a single candle to the end
- Appends to existing data
- Recalculates indicators
- Does not auto-pan (user must pan manually)

**`resetData(): void`**

- Clears all data
- Removes all candles
- Clears viewport
- Indicators remain registered (but have no data)

#### Indicators

**`addIndicator(id: string, inputs: Record<string, unknown>): void`**

Adds an indicator to the chart.

**Built-in Indicators:**

- `'sma'` (Simple Moving Average)
  ```typescript
  chartRef.value?.addIndicator("sma", { period: 20 });
  ```

**Important:**

- Indicator ID format: Use `'sma'` for SMA
- Full ID is auto-generated (e.g., `'sma:20'`)
- To remove, use the full ID: `'sma:20'`

**`removeIndicator(id: string): void`**

Removes an indicator from the chart.

```typescript
chartRef.value?.removeIndicator("sma:20");
```

#### Drawing Tools

**`setDrawingMode(mode: string): void`**

Sets interaction mode:

- `'pan'` - Pan and zoom (default)
- `'draw-trendline'` - Draw trendlines
- `'draw-horizontal'` - Draw horizontal lines

**`clearDrawings(): void`**

Removes all drawings from the chart.

#### Theme

**`setTheme(themeName: 'light' | 'dark'): void`**

Sets chart theme.

```typescript
chartRef.value?.setTheme("dark");
```

#### Label Padding

**`setLabelPadding(enabled: boolean): void`**

Controls label padding, which reserves space for axis labels to prevent clipping.

- **Enabled by default** - Labels are automatically positioned in reserved padding areas
- When enabled: Reserves 60px on the left and 30px at the bottom for labels
- When disabled: Labels may be clipped if they extend beyond the chart area

```typescript
// Enable label padding
chartRef.value?.setLabelPadding(true);

// Disable label padding
chartRef.value?.setLabelPadding(false);
```

#### Playback Control

**`play(): void`** / **`pause(): void`**

Controls playback state.

> **Note:** These control internal state only. You still need to call `appendCandle()` to add data.

#### State Access

**`getState(): ChartStateSnapshot | undefined`**

Gets current chart state.

```typescript
const state = chartRef.value?.getState();
console.log(state?.candles.length); // Number of candles
console.log(state?.indicatorsCount); // Number of indicators
```

## Important Requirements & Constraints

### 1. Canvas Container Must Have Dimensions

The chart needs a container with explicit dimensions:

```vue
<!-- ✅ Good -->
<div style="width: 100%; height: 600px;">
  <PlaygroundChart ... />
</div>

<!-- ❌ Bad - no height -->
<div>
  <PlaygroundChart ... />
</div>
```

### 2. Canvas Must Be in DOM Before Initialization

For programmatic usage, ensure the canvas is in the DOM:

```typescript
// ✅ Good
onMounted(() => {
  const canvas = document.getElementById('chart')
  const engine = new ChartEngine(canvas, {...})
})

// ❌ Bad - canvas not in DOM yet
const canvas = document.createElement('canvas')
const engine = new ChartEngine(canvas, {...})
```

### 3. Timestamps Must Be in Milliseconds

```typescript
// ✅ Good
timestamp: Date.now();
timestamp: 1699123456000;

// ❌ Bad
timestamp: 1699123456; // seconds, not milliseconds
```

### 4. Candles Should Be Sorted by Timestamp

Load candles in chronological order (oldest first).

### 5. Component Cleanup

The Vue component handles cleanup automatically. For programmatic usage:

```typescript
onBeforeUnmount(() => {
  engine.destroy(); // Important!
});
```

## Expected Behavior

### Automatic Features (No Code Required)

- **Panning:** Click and drag to pan
- **Zooming:** Mouse wheel or pinch gesture
- **Responsive:** Resizes with container
- **Smooth animations:** Automatic interpolation
- **Grid:** Auto-generated price and time grid
- **Labels:** Auto-formatted price and time labels

### What You Control

- **Data loading:** You call `loadCandles()` or `appendCandle()`
- **Indicators:** You add/remove them
- **Drawings:** User draws them (when in drawing mode)
- **Theme:** You set it

### What Happens Automatically

- **Viewport creation:** When you call `loadCandles()`
- **Indicator calculation:** When candles are added/removed
- **Rendering:** Continuous via animation loop
- **Event handling:** Pan, zoom, draw handled internally

## Common Use Cases

### 1. Load Historical Data

```typescript
const historicalCandles = await fetchCandlesFromAPI();
chartRef.value?.loadCandles(historicalCandles);
```

### 2. Stream Live Data

```typescript
// On new candle received
socket.on("candle", (candle: Candle) => {
  chartRef.value?.appendCandle(candle);
});
```

### 3. Add Moving Average

```typescript
chartRef.value?.addIndicator("sma", { period: 20 });
```

### 4. Enable Drawing Tools

```typescript
// User clicks "Draw Trendline" button
chartRef.value?.setDrawingMode("draw-trendline");

// User clicks "Pan" button
chartRef.value?.setDrawingMode("pan");
```

### 5. Switch Themes

```typescript
function toggleTheme() {
  const current = theme.value === "light" ? "dark" : "light";
  chartRef.value?.setTheme(current);
}
```

## TypeScript Types

```typescript
import type {
  Candle, // Your candle data
  TimeframeId, // '1s' | '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d'
  ThemeName, // 'light' | 'dark'
} from "synticks-chart";
```

## Supported Timeframes

- `'1s'` - 1 second
- `'1m'` - 1 minute
- `'5m'` - 5 minutes
- `'15m'` - 15 minutes
- `'30m'` - 30 minutes
- `'1h'` - 1 hour
- `'4h'` - 4 hours
- `'1d'` - 1 day

## Summary Checklist

To use the chart, you need to:

1. ✅ Install: `npm install synticks-chart`
2. ✅ Import: `import { PlaygroundChart } from 'synticks-chart/vue'`
3. ✅ Provide container: With explicit width/height
4. ✅ Format data: Candles with `timestamp`, `open`, `high`, `low`, `close`, `volume`
5. ✅ Load data: Call `loadCandles(candles)`
6. ✅ (Optional) Add indicators: `addIndicator('sma', { period: 20 })`
7. ✅ (Optional) Set theme: `setTheme('dark')`
8. ✅ (Optional) Enable drawings: `setDrawingMode('draw-trendline')`

That's it! The chart handles rendering, interactions, and updates automatically.

## License

MIT

## Author

Ondřej Hráček <ondra.hracek@seznam.cz>
