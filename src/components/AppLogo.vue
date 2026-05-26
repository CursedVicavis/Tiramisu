<template>
  <img
    src="/logo.svg"
    :width="size"
    :height="size"
    alt="Tiramisu logo"
    class="app-logo"
    :style="{ width: size + 'px', height: size + 'px' }"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 32 })
</script>

<style scoped>
.app-logo {
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}
</style>
