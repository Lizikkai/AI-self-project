<template>
  <div class="chat-container flex flex-col justify-between">
    <div class="p-4 box-border">
      <BubbleList ref="bubbleListRef" :list="list" :max-height="`736px`">
        <template #avatar="{ item }">
          <div class="avatar-wrapper">
            <img
              :src="
                item.role === 'ai'
                  ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
                  : 'https://avatars.githubusercontent.com/u/76239030?v=4'
              "
              alt="avatar"
            />
          </div>
        </template>
        <template #header="{ item }">
          <div class="header-wrapper">
            <div class="header-name">
              {{ item.role === 'ai' ? '千问' : '🧁 我' }}
            </div>
          </div>
        </template>
        <template #content="{ item }">
          <div class="content-wrapper">
            <div class="content-text">
              <Typewriter :content="item.content!" :isMarkdown="item.isMarkdown" :typing="true" />
            </div>
          </div>
        </template>
        <template #loading="{ item }">
          <LoadingOutlined v-if="item.loading" />
        </template>
      </BubbleList>
    </div>
    <!-- 输入区域 -->
    <Sender :disabled="loading" :loading="loading" placeholder="请输入提问的关键词~" v-model:value="inputMessage" @submit="handleSendMessage" />
  </div>
</template>

<script setup lang="ts">
  import { ref, nextTick } from 'vue'
  import { message } from 'ant-design-vue'
  import { getToken, removeToken } from '../../utils/auth'
  import { LoadingOutlined } from '@ant-design/icons-vue'
  import { removeSelectedMenuKey } from '../../utils/menu'
  import { useRouter } from 'vue-router'
  import { useFetch } from '@vueuse/core'
  import { BubbleList, Sender, Typewriter } from 'vue-element-plus-x'
  import type {
    BubbleListItemProps,
    BubbleListProps
  } from 'vue-element-plus-x/types/components/BubbleList/types'

  type listType = BubbleListItemProps & {
    key: number
    role: 'user' | 'ai'
  }
  const bubbleListRef = ref()
  const router = useRouter()
  const inputMessage = ref('')
  const list = ref<BubbleListProps<listType>['list']>([])
  // const messages = ref<
  //   Array<{ role: 'user' | 'assistant'; content: string;  }>
  // >([])
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

    function isMarkdownContent(text: string): boolean {
      // 检查是否包含常见的 markdown 语法
      const markdownPatterns = [
        /```[\s\S]*?```/, // 代码块
        /\[.*?\]\(.*?\)/, // 链接
        /\*\*.*?\*\*/, // 粗体
        /\*.*?\*/, // 斜体
        /#{1,6}\s.*/, // 标题
        /^\s*[-*+]\s/, // 无序列表
        /^\s*\d+\.\s/, // 有序列表
        /^\s*>\s/, // 引用
        /`.*?`/, // 行内代码
        /\|.*\|.*\|/, // 表格
      ]

      return markdownPatterns.some(pattern => pattern.test(text))
    }

    // 添加用户消息
    list.value.push({
      role: 'user',
      content: inputMessage.value,
      key: Date.now(),
      placement: 'end',
      avatar: 'https://avatars.githubusercontent.com/u/76239030?v=4',
      avatarSize: '24px',
      isMarkdown: false,
      typing: false,
      loading: false,
      noStyle: true
    })

    // 准备接收AI回复
    loading.value = true

    // 创建一个空的AI回复占位
    const aiMessageIndex = list.value.length
    list.value.push({
      role: 'ai',
      content: '',
      key: Date.now(),
      placement: 'start',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      avatarSize: '24px',
      isMarkdown: false,
      typing: true,
      loading: true,
      noStyle: true
    })

    // 滚动到底部
    scrollToBottom()

    // 使用fetch API发送请求
    const url = '/api/ai/chat'
    try {
      const { response } = await useFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        },
        body: JSON.stringify({ message: inputMessage.value })
      })
      console.log('response', response.value)
      if (!response.value?.ok) {
        throw new Error('请求失败')
      }

      const reader = response.value.body?.getReader()
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
              list.value[aiMessageIndex].content += data.content
              if(isMarkdownContent(list.value[aiMessageIndex].content as string)) {
                list.value[aiMessageIndex].isMarkdown = true
              }
              scrollToBottom()
            }
            if (data.done) {
              loading.value = false
              list.value[aiMessageIndex].loading = false
            }
            if (data.error) {
              console.error('接收到错误:', data.error)
              message.error(data.error || '接收消息时发生错误')
              loading.value = false
              list.value[aiMessageIndex].loading = false
            }
          }
        })
      }
      console.log('messages', list.value)
    } catch (error) {
      console.error('请求错误:', error)
      message.error('连接服务器时发生错误')
      loading.value = false
    }

    // 清空输入框
    inputMessage.value = ''
  }

  function scrollToBottom() {
    if(bubbleListRef.value) {
      bubbleListRef.value.scrollToBottom()
    }
  }

  // 滚动到底部
  // function scrollToBottom() {
  //   nextTick(() => {
  //     if (messagesContainer.value) {
  //       messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  //     }
  //   })
  // }
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

<style lang="less" scoped>
  .avatar-wrapper {
    width: 40px;
    height: 40px;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
  .header-wrapper {
    .header-name {
        font-size: 14px;
        color: #979797;
    }
  }
  .content-wrapper {
    .content-text {
        font-size: 14px;
        color: #333;
        padding: 12px;
        background: linear-gradient(to right, #fdfcfb 0%, #ffd1ab 100%);
        border-radius: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
</style>
