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
          <Button :disabled="userInfoStore.userInfo.isAdmin === 0" type="link" @click="handleEditUser(record.id)">编辑</Button>
          <Popconfirm title="确定是否要删除该用户" ok-text="确定" cancel-text="取消" @confirm="handleDeleteUser(record.id)">
            <Button :disabled="userInfoStore.userInfo.isAdmin === 0" type="link">删除</Button>
          </Popconfirm>
        </template>
      </template>
      <template v-else-if="column.dataIndex === 'isAdmin'">
        <span>{{ record.isAdmin === 1 ? '是' : '否' }}</span>
      </template>
    </template>
  </Table>
  <AddOrEditUserModal
    ref="modalRef"
    :id="currentEditUserId"
    v-model:open="open"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Table, Button, message, Popconfirm } from 'ant-design-vue'
  import { getUserList, updateUserInfoByAdmin, deleteUserByAdmin, createUserByAdmin } from '@/api/index'
  import { columns } from './data'
  import { IUserListItem,ICreateUserByAdminParams, IUserListData } from '@/api/model'
  import { useUserInfo } from '@/store/user'
  import { PlusOutlined } from '@ant-design/icons-vue'
  import AddOrEditUserModal from '@/components/AddOrEditUserModal/index.vue'
  import * as dir from 'lodash-es'

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

  function handleEditUser(id: number) {
    currentEditUserId.value = id
    open.value = true
  }

  function handleDeleteUser(id: number) {
    try {
      deleteUserByAdmin({id}).then(() => {
        message.success('删除成功')
        fetchUserList()
      })
    } catch (error) {}
  }

  function handleConfirm($event:IUserListItem) {
    // 区分新增与编辑
    if(currentEditUserId.value) {
      const body = {
      ...$event
    } as IUserListItem
    console.log(body)
    updateUserInfoByAdmin(body).then(() => {
      message.success('更新成功')
      open.value = false
      fetchUserList()
    })  
    }else {
      const body = dir.omit($event, 'id') as ICreateUserByAdminParams
      console.log(body)
      createUserByAdmin(body).then(() => {
        message.success('新增成功')
        open.value = false
        fetchUserList()
      })
    }
  }

  function handleCancel() {
    currentEditUserId.value = void 0
  }
</script>

<style scoped></style>
