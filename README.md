# SynTicks Chart

> A playful real-time candlestick charting engine by Ondra (OndiTech).

## Features

- ⚡ Real-time streaming OHLCV with play/pause & catch-up
- 🕒 Timeframe switching (1s → 1d)
- ✏️ Drawing tools (trendlines, rays, levels)
- 📈 Indicators (e.g. SMA, EMA) as composable pipelines
- 🧽 Smooth animations (no rigid technical feel)
- 📱 Runs smoothly in modern browsers & mobile
- 🧩 Framework-agnostic core + Vue 3 wrapper

## Install

```bash
npm install synticks-chart
# or
yarn add synticks-chart
```

## Quickstart (Vue 3)

```ts
import { PlaygroundChart } from "synticks-chart/vue";
```

```vue
<template>
  <PlaygroundChart symbol="BTCUSDT" timeframe="1m" />
</template>
```

_(API will evolve. See /docs for full guide once stabilised.)_

## Roadmap

- [ ] Core engine with static candles
- [ ] Real-time streaming + play/pause
- [ ] Timeframe aggregation engine
- [ ] Drawing tools
- [ ] Indicators
- [ ] Docs site & examples

## License

MIT © Ondřej Hráček
