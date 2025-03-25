<template>
  <Result status="404" title="404" sub-title="Sorry, the page you visited does not exist.">
    <template #extra>
      <Button type="primary" @click="handleBack">返回主页</Button>
    </template>
  </Result>
</template>

<script setup lang="ts">
  import { Result, Button } from 'ant-design-vue'
  import { setSelectedMenuKey } from '@/utils/menu';
  import { useRouter } from 'vue-router'
  const router = useRouter()

  function handleBack() {
    setSelectedMenuKey('info')
    router.replace('/info')
  }
</script>

<style scoped></style>
