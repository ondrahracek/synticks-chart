<script setup lang="ts">
// Import directly from the library source via alias
import { PlaygroundChart } from 'synticks-chart/vue'
</script>

<template>
  <div style="width: 100vw; height: 100vh; padding: 16px; box-sizing: border-box;">
    <PlaygroundChart symbol="BTCUSDT" timeframe="1m" />
  </div>
</template>

