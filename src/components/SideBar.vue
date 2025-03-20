<template>
  <div class="w-[12%] menu">
    <Menu mode="vertical" theme="dark" v-model:selectedKeys="selectedKeys" @select="handleSelectMenu">
      <MenuItem key="info">
        <template #icon>
          <SmileOutlined />
        </template>
        <span>个人信息</span>
      </MenuItem>
      <MenuItem key="user">
        <template #icon>
          <UserOutlined />
        </template>
        <span>用户列表</span>
      </MenuItem>
      <MenuItem key="home">
        <template #icon>
          <HomeOutlined />
        </template>
        <span>主页</span>
      </MenuItem>
    </Menu>
  </div>
</template>

<script setup lang="ts">
    import { Menu, MenuItem, MenuDivider } from "ant-design-vue";
    import { SmileOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons-vue";
    import { ref, watch } from 'vue'
    import { menuRoutes } from '@/router/basic'
    import { useRouter, useRoute } from 'vue-router'
  
    const router = useRouter()
    const route = useRoute()
    const getCurrentRouteKey = () => {
      const savedKey = localStorage.getItem("selected-menu-key")
      console.log("savedKey",savedKey)
      if(savedKey) return [savedKey]
      const _path = route.path.replace('/','')
      const path = _path ? _path : 'info'
      return [path]
    }
    const selectedKeys = ref<string[]>(getCurrentRouteKey())

    watch(() => selectedKeys.value, newVal => {
      console.log("newVal",newVal)
      if(newVal && newVal[0]) {
        localStorage.setItem('selected-menu-key',newVal[0])
      }
    },{immediate:true})

    function handleSelectMenu(selection:any) {
      console.log("key",selection.key)
      const key = selection.key
      if (key) {
        const route = menuRoutes[key]
        console.log("route",route)
        if(route) router.push(route)
      }
    }



</script>

<style scoped lang="less">
    .menu {
      height: 100vh;
      // background: lightpink;
      background-color: #001427;
      .ant-menu {
        border-inline-end: none !important;
     }
    }
</style>
