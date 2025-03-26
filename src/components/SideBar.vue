<template>
  <div class="w-[14%] menu">
    <Menu mode="vertical" theme="dark" v-model:selectedKeys="selectedKeys" @select="handleSelectMenu">
      <MenuItem key="home">
        <template #icon>
          <HomeOutlined />
        </template>
        <span>主页</span>
      </MenuItem>
      <MenuItem key="conversation">
        <template #icon>
          <CommentOutlined />
        </template>
        <span>AI对话</span>
      </MenuItem>
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
    </Menu>
  </div>
</template>

<script setup lang="ts">
    import { Menu, MenuItem, MenuDivider } from "ant-design-vue";
    import { SmileOutlined, HomeOutlined, UserOutlined, CommentOutlined } from "@ant-design/icons-vue";
    import { ref, watch, onMounted } from 'vue'
    import { menuRoutes } from '@/router/basic'
    import { useRouter, useRoute } from 'vue-router'
    import { getSelectedMenuKey, setSelectedMenuKey } from '@/utils/menu'
  
    const router = useRouter()
    const route = useRoute()
    const selectedKeys = ref<string[]>(['home'])

    // 统一处理路由和菜单选中状态
    function updateMenuState(path: string) {
      const menuKey = path.replace('/', '') || 'home'
      selectedKeys.value = [menuKey]
      setSelectedMenuKey(menuKey)
    }

    // // 初始化
    // onMounted(() => {
    //   const savedKey = getSelectedMenuKey()
    //   if (savedKey) {
    //     console.log(savedKey)
    //     selectedKeys.value = [savedKey]
    //     const targetRoute = menuRoutes[savedKey]
    //     console.log(targetRoute)
    //     if (targetRoute && route.path !== targetRoute) {
    //       router.push(targetRoute)
    //     }
    //   }  else {
    //     updateMenuState(route.path)
    //   }
    // })

    // 监听路由变化
    watch(() => route.path, (newPath) => {
      updateMenuState(newPath)
    })

    // 处理菜单选择
    function handleSelectMenu(selection: any) {
      const route = menuRoutes[selection.key]
      if (route) {
        router.push(route)
      }
    }
</script>

<style scoped lang="less">
    .menu {
      height: 100vh;
      // background: lightpink;
      background-color: #001427;
      padding-top: 60px;
      box-sizing: border-box;
      .ant-menu {
        border-inline-end: none !important;
     }
    }
</style>
@/utils/menu