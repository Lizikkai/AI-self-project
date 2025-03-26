<template>
  <div class="chat-container flex flex-col justify-between">
    <!-- 聊天消息显示区域 -->
    <div class="messages-container" ref="messagesContainer">
      <div
        class="flex flex-items-start gap-4"
        :class="msg.role === 'user' ? 'justify-end' : ''"
        v-for="(msg, index) in messages"
        :key="index"
      >
        <template v-if="msg.role === 'user'">
          <!-- 将头像放在右侧 -->
          <div :class="msg.role" class="message-content">{{ msg.content }}</div>
        </template>
        <template v-else>
          <Avatar class="flex-none">
            <template #icon><UserOutlined /></template>
          </Avatar>
          <template v-if="msg.includeCode">
            <div
              :class="msg.role"
              class="message-content"
              v-html="marked(msg.content)"
              v-highlight
            ></div>
          </template>
          <template v-else>
            <div :class="msg.role" class="message-content">{{ msg.content }}</div>
          </template>
        </template>
      </div>
      <div v-if="loading" class="loading-indicator">
        <div class="dot-flashing"></div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <InputGroup compact>
        <Input
          v-model:value="inputMessage"
          style="width: 80%"
          placeholder="请输入您的问题..."
          @keyup.enter="handleSendMessage"
        />
        <Button type="primary" @click="handleSendMessage" :loading="loading">发送</Button>
      </InputGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, nextTick } from 'vue'
  import { Input, InputGroup, Avatar, message, Button } from 'ant-design-vue'
  import { getToken, removeToken } from '../../utils/auth'
  import { marked } from 'marked'
  import { UserOutlined } from '@ant-design/icons-vue'
  import { removeSelectedMenuKey } from '../../utils/menu'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const inputMessage = ref('')
  const messages = ref<
    Array<{ role: 'user' | 'assistant'; content: string; includeCode: boolean }>
  >([])
  const loading = ref(false)
  const messagesContainer = ref<HTMLElement | null>(null)

  function isTokenExpired(token: string) {
    try {
      // 1. 分割 Token 获取 Payload
      const payloadBase64 = token.split('.')[1]
      // 2. 补全 Base64 长度并解码
      const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')))
      // 3. 获取过期时间（单位：秒）并转换为毫秒
      const expTimestamp = decodedPayload.exp * 1000
      // 4. 比较当前时间与过期时间
      return Date.now() >= expTimestamp
    } catch (error) {
      return true // 默认视为过期
    }
  }

  function redirectToLogin() {
    removeToken()
    localStorage.removeItem('userInfo')
    removeSelectedMenuKey()
    router.replace({ name: 'LoginPage' })
  }

  // 发送消息处理函数
  async function handleSendMessage() {
    if (!inputMessage.value.trim()) {
      message.error('请输入消息')
      return
    }

    const token = getToken()
    if (!token) {
      message.error('请先登录')
      redirectToLogin()
      return
    }
    if (isTokenExpired(token)) {
      message.error('登录已过期，请重新登录')
      redirectToLogin()
      return
    }

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: inputMessage.value,
      includeCode: false
    })

    // 准备接收AI回复
    loading.value = true

    // 创建一个空的AI回复占位
    const aiMessageIndex = messages.value.length
    messages.value.push({
      role: 'assistant',
      content: '',
      includeCode: false
    })

    // 滚动到底部
    scrollToBottom()

    // 使用fetch API发送请求
    const url = '/api/ai/chat'
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: inputMessage.value })
      })

      if (!response.ok) {
        throw new Error('请求失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')

      while (true) {
        const { done, value } = (await reader?.read()) || {}
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.trim().split('\n')

        lines.forEach(line => {
          if (line.startsWith('data:')) {
            const data = JSON.parse(line.substring(5))
            if (data.content) {
              messages.value[aiMessageIndex].content += data.content
              messages.value[aiMessageIndex].includeCode = true
              scrollToBottom()
            }
            if (data.done) {
              loading.value = false
            }
            if (data.error) {
              console.error('接收到错误:', data.error)
              message.error(data.error || '接收消息时发生错误')
              loading.value = false
            }
          }
        })
      }
    } catch (error) {
      console.error('请求错误:', error)
      message.error('连接服务器时发生错误')
      loading.value = false
    }

    // 清空输入框
    inputMessage.value = ''
  }

  // 滚动到底部
  function scrollToBottom() {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
</script>

<style scoped>
  .chat-container {
    font-family:
      DeepSeek-CJK-patch,
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      Segoe UI,
      Roboto,
      Noto Sans,
      Ubuntu,
      Cantarell,
      Helvetica Neue,
      Oxygen,
      Open Sans,
      sans-serif;
    display: flex;
    flex-direction: column;
    height: 90vh;
    max-width: 800px;
    margin: 0 auto;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    overflow: hidden;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: #f9fafd;
  }

  .input-area {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
    flex-shrink: 0;
  }

  .message-content.user {
    align-self: flex-end;
    background-color: #eff6ff; /* 柔和的蓝绿色 */
  }

  .message-content.assistant {
    align-self: flex-start;
    background-color: #f0f2f5;
  }

  .message-content {
    max-width: 80%;
    padding: 8px 22px;
    color: #262626;
    border-radius: 8px;
    word-break: break-word;
    /* white-space: pre-wrap; */
    font-size: 14px;
    line-height: 28px;
  }

  .loading-indicator {
    display: flex;
    justify-content: center;
    margin: 10px 0;
  }

  .dot-flashing {
    position: relative;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: #5bc0de; /* 柔和的蓝绿色 */
    color: #5bc0de;
    animation: dot-flashing 1s infinite linear alternate;
    animation-delay: 0.5s;
  }

  .dot-flashing::before,
  .dot-flashing::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
  }

  .dot-flashing::before {
    left: -15px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: #5bc0de;
    color: #5bc0de;
    animation: dot-flashing 1s infinite alternate;
    animation-delay: 0s;
  }

  .dot-flashing::after {
    left: 15px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: #5bc0de;
    color: #5bc0de;
    animation: dot-flashing 1s infinite alternate;
    animation-delay: 1s;
  }

  @keyframes dot-flashing {
    0% {
      background-color: #5bc0de;
    }
    50%,
    100% {
      background-color: rgba(91, 192, 222, 0.2);
    }
  }
</style>
