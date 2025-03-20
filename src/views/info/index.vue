<template>
  <div class="info-container">
    <h1 class="info-title">个人信息</h1>
    
    <Card class="info-card">
      <Form
        :model="formState"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
        @finish="handleSubmit"
      >
        <FormItem label="用户名" name="name">
          <Input v-model:value="formState.name" :disabled="!isEditing" />
        </FormItem>
        
        <FormItem label="邮箱" name="email">
          <Input v-model:value="formState.email" :disabled="!isEditing" />
        </FormItem>
        
        <FormItem label="手机号" name="mobile">
          <Input v-model:value="formState.mobile" :disabled="!isEditing" />
        </FormItem>
        
        <FormItem label="是否管理员" name="isAdmin">
          <Switch v-model:checked="formState.isAdmin" :disabled="!isEditing" />
        </FormItem>

        <FormItem v-if="isEditing" label="密码" name="password">
          <Input.Password v-model:value="formState.password" placeholder="不修改请留空" />
        </FormItem>
        
        <FormItem :wrapper-col="{ offset: 4, span: 16 }">
          <Button v-if="!isEditing" type="primary" @click="startEditing">编辑信息</Button>
          <template v-else>
            <Button type="primary" html-type="submit" :loading="loading">保存</Button>
            <Button style="margin-left: 10px" @click="cancelEditing">取消</Button>
          </template>
        </FormItem>
      </Form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Input,Form,Card,FormItem,Button,Switch } from 'ant-design-vue';
import { useUserInfo } from '@/store/user';
import { updateUserInfo } from '@/api'
import { IUpdateUserInfoParams } from '@/api/model'

const userInfoStore = useUserInfo();
const isEditing = ref(false);
const loading = ref(false);
const originalFormState = ref({});

type IFormState = {
  name: string;
  email: string;
  mobile: string;
  password?: string;
  isAdmin: boolean;
}

const getInitialState = ():IFormState => {
  return {
    name: '',
    email: '',
    mobile: '',
    isAdmin: false
  }
}

// 表单数据
const formState = reactive<IFormState>(getInitialState());

// 获取用户信息
onMounted(() => {
  loadUserInfo();
});

// 加载用户信息
function loadUserInfo() {
  const userInfo = userInfoStore.userInfo;
  formState.name = userInfo.name || '';
  formState.email = userInfo.email || '';
  formState.mobile = userInfo.mobile || '';
  formState.password = '';
  formState.isAdmin = userInfo.isAdmin === 1 ? true : false || false;
  
  // 保存原始数据，用于取消编辑时恢复
  originalFormState.value = { ...formState };
}

// 开始编辑
function startEditing() {
  isEditing.value = true;
}

// 取消编辑
function cancelEditing() {
  Object.assign(formState, originalFormState.value);
  formState.password = '';
  isEditing.value = false;
}

// 提交表单
async function handleSubmit(values: IFormState) {
  console.log("values",values)
  loading.value = true;
  try {
    // 构建更新数据，只包含修改的字段
    const body = {
      ...values,
      isAdmin: values.isAdmin ? 1 : 0
    } as IUpdateUserInfoParams
    if(values.password) {
      body.password = values.password
    }
    
    // 调用更新接口
    const result = await updateUserInfo(body);
    
    // 更新本地存储的用户信息
    userInfoStore.userInfo = {
      ...userInfoStore.userInfo,
      ...body,
      isAdmin: body.isAdmin ? 1 : 0
    };
    isEditing.value = false;
    formState.password = '';
    
    // 更新原始数据
    originalFormState.value = { ...formState, password: '' };
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.info-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.info-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 500;
}

.info-card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>