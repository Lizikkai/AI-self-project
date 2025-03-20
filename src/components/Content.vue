<template>
  <div class="w-full content">
    <slot />
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="less">
    .content {
      height: calc(100vh - 40px);
      padding: 20px;
      box-sizing: border-box;
    }
</style>