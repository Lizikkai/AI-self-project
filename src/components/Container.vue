<template>
  <div class="container">
    <Header />
    <div class="flex flex-row flex-items-start">
      <SideBar />
      <div class="flex-1">
        <Content>
          <slot />
        </Content>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
    import Header from './Header.vue'
    import SideBar from './SideBar.vue'
    import Content from './Content.vue'
</script>

<style scoped>
  .container {
    min-width: 100%;
    min-height: 100vh;
    font-family: "Source Han Sans CN";
    padding-top: 46px;
  }
</style>