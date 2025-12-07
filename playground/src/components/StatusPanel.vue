<template>
  <div data-test="status-panel" class="status-panel">
    <div>Symbol: {{ state.symbol }}</div>
    <div>Timeframe: {{ state.timeframe }}</div>
    <div>Playback: {{ state.playback === 'live' ? 'LIVE' : state.playback }}</div>
    <div>Candles: {{ state.candlesCount }}</div>
    <div>Drawings: {{ state.drawingsCount }}</div>
    <div>Indicators: {{ state.indicatorsCount }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  state: {
    symbol: string
    timeframe: string
    playback: string
    candlesCount: number
    drawingsCount: number
    indicatorsCount: number
  }
}>()
</script>

