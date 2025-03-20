<template>
  <Table :columns="columns" :data-source="userList" :loading="loading">
    <template #title>
      <div class="flex flex-row flex-items-center justify-between">
        <span>共{{ userList.length }}位用户</span>
        <Button type="primary" @click="handleAddUser">
          <template #icon>
            <PlusOutlined />
          </template>
          <span>添加用户</span>
        </Button>
      </div>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'action'">
        <template v-if="record.id !== userInfoStore.userInfo.userId">
          <Button type="link">编辑</Button>
          <Button type="link">删除</Button>
        </template>
      </template>
    </template>
  </Table>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Table, Button } from 'ant-design-vue'
  import { getUserList } from '@/api/index'
  import { columns } from './data'
  import { IUserListData } from '@/api/model'
  import { useUserInfo } from '@/store/user'
  import { PlusOutlined } from '@ant-design/icons-vue'

  onMounted(() => {
    fetchUserList()
  })
  const userInfoStore = useUserInfo()
  const loading = ref<boolean>(false)
  const userList = ref<IUserListData>([])
  function fetchUserList() {
    getUserList()
      .then(res => {
        console.log(res)
        if (res) {
          loading.value = false
          userList.value = res
        }
      })
      .catch(() => {
        loading.value = false
      })
  }

  function handleAddUser() {}
</script>

<style scoped></style>
