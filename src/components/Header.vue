<template>
    <div class="header">
      <div class="header-left">
        <h1>AI 平台</h1>
      </div>
      <div class="header-right">
        <Dropdown>
          <a class="user-dropdown" @click.prevent>
            <Avatar :size="32">
              <template #icon>
                <UserOutlined />
              </template>
            </Avatar>
            <span class="username">{{ userInfoStore.userInfo.name ?? "用户" }}</span>
          </a>
          <template #overlay>
            <Menu>
              <MenuItem key="profile" @click="handleToProfile">
                <UserOutlined />
                个人信息
              </MenuItem>
              <MenuItem key="settings">
                <SettingOutlined />
                设置
              </MenuItem>
              <MenuDivider />
              <MenuItem key="logout" @click="handleLogout">
                <LogoutOutlined />
                退出登录
              </MenuItem>
            </Menu>
          </template>
        </Dropdown>
      </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from "vue";
    import { useRouter } from "vue-router";
    import { removeToken } from '@/utils/auth'
    import { useUserInfo } from "@/store/user";
    import { Dropdown, Menu,MenuItem,MenuDivider, Avatar, Modal, message } from "ant-design-vue";
    import {
      UserOutlined,
      SettingOutlined,
      LogoutOutlined
    } from "@ant-design/icons-vue";
    import { setSelectedMenuKey, removeSelectedMenuKey } from '@/utils/menu'

    const router = useRouter()
    const userInfoStore = useUserInfo()

    function handleLogout() {
      Modal.confirm({
        title: "退出登录",
        content: "是否确认退出登录?",
        onOk:() => {
          // userInfoStore.$reset()
          localStorage.removeItem("userInfo")
          removeSelectedMenuKey()
          removeToken()
          message.success("退出登录成功")
          router.replace({ name: "LoginPage" })
        }
      })
    }

    function handleToProfile() {
      setSelectedMenuKey('info')
      router.push({ name: 'InfoPage' })
    }
</script>

<style scoped lang="less">
    .header {
      height: 40px;
      padding: 0 24px;
      box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: fixed;
      top: 0px;
      left: 0px;
      right: 0px;
      z-index: 99;
      background: #fff;

      .header-left {
        h1 {
          margin: 0;
          font-size: 20px;
          color: #1890ff;
        }
      }

      .header-right {
        .user-dropdown {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: all 0.3s;

          &:hover {
            background: rgba(0, 0, 0, 0.025);
          }

          .username {
            margin-left: 8px;
            color: rgba(0, 0, 0, 0.85);
          }
        }
      }
    }

    .content {
      flex: 1;
      padding: 24px;
      background: #f0f2f5;
    }
</style>
@/utils/menu