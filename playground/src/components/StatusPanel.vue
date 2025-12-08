<template>
  <div data-test="status-panel" class="status-panel">
    <div>Symbol: {{ state.symbol }}</div>
    <div>Timeframe: {{ state.timeframe }}</div>
    <div>Auto-scroll: {{ state.autoScrollEnabled ? 'enabled' : 'disabled' }}</div>
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
    autoScrollEnabled: boolean
    candlesCount: number
    drawingsCount: number
    indicatorsCount: number
  }
}>()
</script>

