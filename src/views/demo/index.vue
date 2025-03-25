<template>
  <div
    class="w-10 h-10 bg-red-300"
    v-motion
    :initial="{ opacity: 0, y: 100 }"
    :enter="{ opacity: 1, y: 0, scale: 1 }"
    :variants="{ custom: { scale: 2 } }"
    :hovered="{ scale: 1.2 }"
    :delay="200"
    :duration="1200"
  />
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>