<script setup>
</script>

<template>
    <div class="web-hud">
        <slot />
    </div>
</template>

<style scoped>
.web-hud {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
</style>
