<script setup>
import { ref } from 'vue';
import LaunchQuestButton from './components/launch-quest-button.vue'
import Scene from './components/scene.vue'
import WebHud from './components/web-hud.vue'

const supportsXR = 'xr' in window.navigator;
const enter = ref(null)

</script>

<template>
  <WebHud>
    <h1>Vite + Vue + Babylonjs</h1>
    <h2>Networked thru colyseus</h2>
    <br/>
    <div>
      <LaunchQuestButton v-if="!supportsXR" />
    </div>
  </WebHud>
  <scene />
</template>

<style scoped>
</style>
