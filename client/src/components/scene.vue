<script setup>
import { onMounted, defineProps } from 'vue'
import { wrapper } from '../scenes/createScene'

const props = defineProps({
  xrUiOptions: Array
})

onMounted(() => {
    const dom = document.getElementById("scene-canvas")
    wrapper.createScene(dom, props.xrUiOptions)
})
</script>

<template>
  <canvas id="scene-canvas">
  </canvas>
</template>

<style scoped>
#scene-canvas {
    display: flex;
    margin: auto;
    height: 100%;
    width: 100%;
}
</style>
