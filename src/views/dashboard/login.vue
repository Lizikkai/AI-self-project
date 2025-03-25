<template>
  <div class="login-container flex flex-items-center justify-center">
    <div
      class="login-box"
      v-motion
      :initial="{ opacity: 0, y: 100 }"
      :enter="{ opacity: 1, y: 0, scale: 1 }"
      :delay="200"
      :duration="500"
    >
      <div class="login-header">
        <div class="logo">
          <!-- <img src="@/assets/logo.png" alt="Logo" /> -->
        </div>
        <h2 class="welcome-text">欢迎使用 AI 平台</h2>
      </div>

      <div class="tabs">
        <div class="tab" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">
          登录
        </div>
        <div
          class="tab"
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          注册
        </div>
      </div>

      <div class="form-container">
        <!-- 登录表单 -->
        <transition name="fade" mode="out-in">
          <Form
            v-if="activeTab === 'login'"
            ref="loginFormRef"
            :model="loginForm"
            @finish="handleLoginFinish"
            :wrapper-col="{ span: 20 }"
            :label-col="{ span: 4 }"
          >
            <FormItem
              label="用户名"
              name="name"
              required
              :rules="[{ trigger: 'blur', message: '请输入用户名' }]"
            >
              <Input v-model:value="loginForm.name" placeholder="请输入用户名" size="large" />
            </FormItem>
            <FormItem
              label="密码"
              name="password"
              required
              :rules="[{ trigger: 'blur', message: '请输入密码' }]"
            >
              <Input.Password
                v-model:value="loginForm.password"
                placeholder="请输入密码"
                size="large"
              />
            </FormItem>
            <div class="remember-forgot">
              <Checkbox v-model:checked="loginForm.remember">记住我</Checkbox>
              <a class="forgot-link">忘记密码?</a>
            </div>
            <FormItem :wrapper-col="{ span: 24 }">
              <Button
                type="primary"
                html-type="submit"
                class="submit-btn"
                size="large"
                :loading="loading"
              >
                登录
              </Button>
            </FormItem>
          </Form>

          <!-- 注册表单 -->
          <Form
            v-else
            ref="registerFormRef"
            :model="registerForm"
            @finish="handleRegisterFinish"
            layout="vertical"
          >
            <FormItem
              label="用户名"
              name="name"
              :rules="[{ required: true, message: '请输入用户名' }]"
            >
              <Input v-model:value="registerForm.name" placeholder="请输入用户名" size="large" />
            </FormItem>
            <FormItem
              label="手机号"
              name="mobile"
              :rules="[
                { required: true, message: '请输入手机号码' },
                { trigger: 'blur', message: '请输入正确的手机号码', pattern: /^1[3-9]\d{9}$/ }
              ]"
            >
              <Input
                v-model:value="registerForm.mobile"
                placeholder="请输入手机号码"
                size="large"
              />
            </FormItem>
            <FormItem
              label="邮箱"
              name="email"
              :rules="[
                { required: true, message: '请输入邮箱' },
                {
                  type: 'email',
                  message: '请输入有效的邮箱地址',
                  pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
                }
              ]"
            >
              <Input v-model:value="registerForm.email" placeholder="请输入邮箱" size="large" />
            </FormItem>
            <FormItem
              label="密码"
              name="password"
              :rules="[{ required: true, message: '请输入密码' }]"
            >
              <Input.Password
                v-model:value="registerForm.password"
                placeholder="请输入密码"
                size="large"
              />
            </FormItem>
            <FormItem
              label="确认密码"
              name="confirmPassword"
              :rules="[
                { required: true, message: '请输入密码' },
                { validator: validateConfirmPassword, trigger: 'blur' }
              ]"
            >
              <Input.Password
                v-model:value="registerForm.confirmPassword"
                placeholder="请确认密码"
                size="large"
              />
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                html-type="submit"
                class="submit-btn"
                size="large"
                :loading="loading"
              >
                注册
              </Button>
            </FormItem>
          </Form>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, unref } from 'vue'
  import { Form, FormItem, Input, Button, Checkbox, FormInstance } from 'ant-design-vue'
  import { useUserInfo } from '@/store/user'
  import { revokeRememberMeFn, rememberMeFn, removeRememberMeFn } from '@/utils/app'

  type ILoginFormState = {
    name: string
    password: string
    remember: boolean
  }
  type IRegisterFormState = {
    name: string
    email: string
    password: string
    confirmPassword: string
    mobile: string
  }
  const userInfoStore = useUserInfo()
  // 活动标签状态
  const activeTab = ref('login')
  const loading = ref(false)
  const rememberUserInfoData = revokeRememberMeFn()
  // 登录表单
  const loginFormRef = ref<FormInstance>()
  const getInitialLoginForm = (): ILoginFormState => {
    return {
      name: rememberUserInfoData?.name ?? '',
      password: rememberUserInfoData?.password ?? '',
      remember: rememberUserInfoData?.remember ?? false
    }
  }
  const loginForm = reactive(getInitialLoginForm())

  // 注册表单
  const registerFormRef = ref()
  const getInitialRegisterForm = (): IRegisterFormState => {
    return {
      name: '',
      email: '',
      password: '',
      mobile: '',
      confirmPassword: ''
    }
  }
  const registerForm = reactive(getInitialRegisterForm())

  const validateConfirmPassword = async (rule: any, value: any) => {
    console.log('value', value)
    if (!value || value !== registerForm.password) {
      return Promise.reject(new Error('两次输入的密码不一致!'))
    }
    return Promise.resolve()
  }

  // 处理登录
  const handleLoginFinish = (values: ILoginFormState) => {
    const state = unref(loginForm)
    loading.value = true
    if (state.remember) {
      rememberMeFn({
        name: values.name,
        password: values.password,
        remember: state.remember
      })
    } else {
      removeRememberMeFn()
    }
    userInfoStore.login(
      { name: values.name, password: values.password },
      {
        onError: () => {
          loading.value = false
        }
      }
    )
  }

  // 处理注册
  const handleRegisterFinish = async (values: IRegisterFormState) => {
    loading.value = true
    // 这里添加注册API调用
    const body = {
      name: values.name,
      password: values.password,
      email: values.email,
      mobile: values.mobile
    }
    userInfoStore.register(body, {
      onError: () => {
        loading.value = false
      }
    })
  }
</script>

<style lang="less" scoped>
  .login-container {
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .login-box {
    width: 100%;
    max-width: 450px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    padding: 40px;
    // transition: all 0.3s ease;

    // &:hover {
    //   transform: translateY(-5px);
    //   box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    // }
  }

  .login-header {
    text-align: center;
    margin-bottom: 30px;

    .logo {
      margin-bottom: 15px;

      img {
        height: 60px;
        width: auto;
      }
    }

    .welcome-text {
      font-size: 24px;
      color: #333;
      margin: 0;
      font-weight: 600;
    }
  }

  .tabs {
    display: flex;
    margin-bottom: 30px;
    border-bottom: 1px solid #eee;

    .tab {
      flex: 1;
      text-align: center;
      padding: 12px 0;
      font-size: 16px;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        color: #1890ff;
      }

      &.active {
        color: #1890ff;

        &:after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #1890ff;
        }
      }
    }
  }

  .form-container {
    margin-bottom: 20px;
    // min-height: 300px;
  }

  .remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .forgot-link {
      color: #1890ff;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .submit-btn {
    width: 100%;
    height: 45px;
    font-size: 16px;
    border-radius: 6px;
  }

  .social-login {
    margin-top: 30px;

    .divider {
      display: flex;
      align-items: center;
      margin: 20px 0;

      &:before,
      &:after {
        content: '';
        flex: 1;
        height: 1px;
        background: #eee;
      }

      span {
        padding: 0 15px;
        font-size: 14px;
        color: #999;
      }
    }

    .social-icons {
      display: flex;
      justify-content: center;
      gap: 20px;

      .social-icon {
        font-size: 18px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-3px);
          color: #1890ff;
        }
      }
    }
  }

  // 过渡动画
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
@/api/index
