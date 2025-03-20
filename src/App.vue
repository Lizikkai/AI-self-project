<template>
  <ConfigProvider :locale="getAntdLocale">
    <template v-if="route.path === '/login'">
      <RouterView />
    </template>
    <template v-else>
      <Container>
        <RouterView />
      </Container>
    </template>
  </ConfigProvider>
</template>

<script setup>
import { ConfigProvider } from "ant-design-vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { ref } from "vue";
import { useRoute } from "vue-router";
import Container from "@/components/Container.vue";

const route = useRoute();
const getAntdLocale = ref(zhCN);
</script>

<style lang="scss" scoped></style>
