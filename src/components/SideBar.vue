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
    import { ref, watch, onMounted } from 'vue'
    import { menuRoutes } from '@/router/basic'
    import { useRouter, useRoute } from 'vue-router'
    import { getSelectedMenuKey, setSelectedMenuKey } from '@/utils/menu'
  
    const router = useRouter()
    const route = useRoute()
    const selectedKeys = ref<string[]>(['info'])

    // 统一处理路由和菜单选中状态
    function updateMenuState(path: string) {
      const menuKey = path.replace('/', '') || 'info'
      selectedKeys.value = [menuKey]
      setSelectedMenuKey(menuKey)
    }

    // 初始化
    onMounted(() => {
      const savedKey = getSelectedMenuKey()
      if (savedKey) {
        selectedKeys.value = [savedKey]
        const targetRoute = menuRoutes[savedKey]
        if (targetRoute && route.path !== targetRoute) {
          router.push(targetRoute)
        }
      } else if (route.path === '/') {
        router.push('/info')
        updateMenuState('info')
      } else {
        updateMenuState(route.path)
      }
    })

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
      .ant-menu {
        border-inline-end: none !important;
     }
    }
</style>
@/utils/menu