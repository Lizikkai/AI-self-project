<template>
  <div class="chat-container flex flex-col justify-between">
    <!-- 聊天消息显示区域 -->
    <div class="messages-container" ref="messagesContainer">
      <div
        class="flex flex-items-center gap-4"
        :class="msg.role === 'user' ? 'justify-end' : ''"
        v-for="(msg, index) in messages"
        :key="index"
      >
        <template v-if="msg.role === 'user'">
          <Avatar
            class="flex-none"
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          />
        </template>
        <template v-else>
          <Avatar class="flex-none">
            <template #icon><UserOutlined /></template>
          </Avatar>
        </template>
        <!-- <template v-if="msg.role === 'user'">
          <div :class="msg.role" class="message-content">{{ msg.content }}</div>
        </template>
        <template v-else>
          <highlightjs language="js" :code="msg.content" />
        </template> -->
        <div :class="msg.role" class="message-content" v-html="marked(msg.content)" v-highlight></div>
        
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
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { Input, InputGroup, Avatar, message, Space, Button } from 'ant-design-vue'
  import { getToken } from '../../utils/auth'
  import { marked } from 'marked'


  const inputMessage = ref('')
  const messages = ref<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const loading = ref(false)
  const messagesContainer = ref<HTMLElement | null>(null)

  // 发送消息处理函数
  async function handleSendMessage() {
    if (!inputMessage.value.trim()) {
      message.error('请输入消息')
      return
    }

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: inputMessage.value
    })

    // 准备接收AI回复
    loading.value = true

    // 创建一个空的AI回复占位
    const aiMessageIndex = messages.value.length
    messages.value.push({
      role: 'assistant',
      content: ''
    })

    // 滚动到底部
    scrollToBottom()

    // 使用fetch API发送请求
    const token = getToken()
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
    flex: 1; /* 占据剩余空间 */
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
    /* 确保输入区域固定在底部 */
    flex-shrink: 0;
  }

  .message-item {
  }

  .message-content.user {
    align-self: flex-end;
    background-color: #1890ff;
    color: white;
  }

  .message-content.assistant {
    align-self: flex-start;
    background-color: #f0f2f5;
    color: #000;
  }
  .message-content {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 8px;
    word-break: break-word;
    font-size: 14px;
    line-height: 1.3;
  }

  .input-area {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
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
    background-color: #1890ff;
    color: #1890ff;
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
    background-color: #1890ff;
    color: #1890ff;
    animation: dot-flashing 1s infinite alternate;
    animation-delay: 0s;
  }

  .dot-flashing::after {
    left: 15px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: #1890ff;
    color: #1890ff;
    animation: dot-flashing 1s infinite alternate;
    animation-delay: 1s;
  }

  @keyframes dot-flashing {
    0% {
      background-color: #1890ff;
    }
    50%,
    100% {
      background-color: rgba(24, 144, 255, 0.2);
    }
  }
</style>
