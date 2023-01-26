<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  linkUrl: String
})

const openLink = () => {
  let sendToQuestUrl = new URL("https://oculus.com/open_url/");
  sendToQuestUrl.searchParams.set("url", props.linkUrl ?? window.location.href);
  window.location.href = sendToQuestUrl;
}
</script>

<template>
  <button @click="openLink">Open in Quest ♾️</button>
</template>

<style scoped>
</style>
