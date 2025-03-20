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
          <Button type="link" @click="handleEditUser(record.id)">编辑</Button>
          <Button type="link">删除</Button>
        </template>
      </template>
    </template>
  </Table>
  <AddOrEditUserModal ref="modalRef" :id="currentEditUserId" v-model:open="open" @confirm="handleConfirm" @cancel="handleCancel" />
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Table, Button, message } from 'ant-design-vue'
  import { getUserList, updateUserInfo } from '@/api/index'
  import { columns } from './data'
  import { IUpdateUserInfoParams, IUserListData } from '@/api/model'
  import { useUserInfo } from '@/store/user'
  import { PlusOutlined } from '@ant-design/icons-vue'
  import AddOrEditUserModal from '@/components/AddOrEditUserModal/index.vue'

  onMounted(() => {
    fetchUserList()
  })
  const modalRef = ref()
  const currentEditUserId = ref<number>()
  const open = ref<boolean>(false)
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

  function handleAddUser() {
    open.value = true
  }

  function handleEditUser(id:number) {
    currentEditUserId.value = id
    open.value = true
  }

  function handleConfirm() {
    if(modalRef.value) {
      console.log("modalRef.value",modalRef.value.formState)
      const state = modalRef.value.formState
      const body = {
        ...state
      } as IUpdateUserInfoParams
      updateUserInfo(body).then(() => {
        message.success("更新成功")
        open.value = false
      })
    }
  }

  function handleCancel() {
    currentEditUserId.value = void 0
  }
</script>

<style scoped></style>
