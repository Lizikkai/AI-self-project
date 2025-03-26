import axios, { AxiosResponseHeaders } from 'axios'
import { message } from 'ant-design-vue'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { whiteList } from '@/router/basic'
import router from '@/router'
import { removeSelectedMenuKey } from '@/utils/menu'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,   // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  },
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 例如：添加token
    const isIncludesWhiteList = whiteList.includes(config.url as string)
    if(!isIncludesWhiteList) {
      const token = getToken()
      if (token) {
        const tokenValue = token.startsWith('Bearer') ? token : `Bearer ${token}`
        config.headers['Authorization'] = `Bearer ${tokenValue}`
      }
    }
    return config
  },
  error => {
    console.log("error",error)
    const msg = error.response?.data?.message || error.message || '请求失败'
    message.error(msg)
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  res => {
    const { data } = res
    // 根据后端的返回状态码判断请求是否成功
    if (data.code !== 0) {
      message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }

    const token = getTokenFromHeader(res.headers as AxiosResponseHeaders)
    if (token) {
      setToken(token)
    }
    message.success(data.message)
    return data.content
  },
  async error => {
    const status = error.response?.status
    console.log("status",status)
    // 处理 HTTP 错误状态
    const msg = error.response?.data?.message || error.message || '请求失败'
    if(statusIsLoginInvalid(status as number)) {
      if(getToken()) {
        removeToken()
      }
      removeSelectedMenuKey()
      await router.replace({ name: 'LoginPage', replace: true })
      message.error(msg)
    }else {
      message.error(msg)
    }
    return Promise.reject(error)
  }
)

function statusIsLoginInvalid(status:number) {
  return status === 401 || status === 403
}

function getTokenFromHeader(headers:AxiosResponseHeaders) {
  return headers ? (headers['Authorization'] || headers['authorization']) : null
}

export default request