<template>
  <Modal
    v-model:open="open"
    :title="isEdit ? '编辑用户' : '添加用户'"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div v-if="isEdit && !loading" class="z-99 absolute top-0 bottom-0 left-0 right-0 flex flex-items-center justify-center bg-white bg-opacity-50">
      <Spin />
    </div>
    <Form class="mt-8" :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
      <FormItem label="用户名" name="name" required>
        <Input v-model:value="formState.name" placeholder="请输入用户名" />
      </FormItem>

      <FormItem label="邮箱" name="email" required>
        <Input v-model:value="formState.email" placeholder="请输入邮箱" />
      </FormItem>

      <FormItem label="手机号" name="mobile" required>
        <Input v-model:value="formState.mobile" placeholder="请输入手机号" />
      </FormItem>

      <FormItem label="密码" name="password" :required="!props.id">
        <Input.Password
          v-model:value="formState.password"
          :placeholder="props.id ? '不修改请留空' : '请输入密码'"
        />
      </FormItem>

      <FormItem label="管理员" name="isAdmin">
        <Switch v-model:checked="formState.isAdmin" />
      </FormItem>
    </Form>
  </Modal>
</template>

<script setup lang="ts">
  import { Modal, Form, FormItem, Input, Switch, Spin } from 'ant-design-vue'
  import { ref, reactive, watch, computed } from 'vue'
  import { getUserInfo } from '@/api'

  type IFormState = {
    name: string
    email: string
    mobile: string
    password?: string
    isAdmin: boolean
  }
  const isEdit = computed(() => {
    return !!props.id
  })
  const loading = ref<boolean>(false)
  const props = defineProps({
    id: Number
  })

  const emit = defineEmits(['confirm', 'cancel'])
  const open = ref<boolean>(false)
  const formState = reactive<IFormState>({
    name: '',
    email: '',
    mobile: '',
    isAdmin: false
  })

  watch(
    () => props.id,
    newValue => {
      console.log('newValue', newValue)
      if (newValue) {
        fetchUserInfo(newValue as number)
      }
    }
  )

  function handleOk() {
    emit('confirm', {
      ...formState,
      isAdmin: formState.isAdmin ? 1 : 0,
      id: props.id
    })
  }

  function handleCancel() {
    emit('cancel')
    resetForm()
  }

  function resetForm() {
    Object.assign(formState, {
      name: '',
      email: '',
      mobile: '',
      password: '',
      isAdmin: false
    })
  }

  function fetchUserInfo(id: number) {
    getUserInfo({ id }).then(data => {
      if (data) {
        loading.value = true
        Object.assign(formState, {
          name: data.name,
          password: data.password,
          mobile: data.mobile,
          email: data.email,
          isAdmin: data.isAdmin === 1 ? true : false
        })
      }
    }).catch(() => {
      loading.value = true
    })
  }

  defineExpose({
    open,
    formState
  })
</script>
