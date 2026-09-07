import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'

const service = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      Message({
        message: res.message || '请求异常',
        type: 'error',
        duration: 3000
      })
      if (res.code === 401) {
        // Token 过期，跳转登录
        window.location.href = '/login'
      }
      return Promise.reject(new Error(res.message || '请求异常'))
    }
    return res
  },
  error => {
    Message({
      message: error.message || '网络异常',
      type: 'error',
      duration: 3000
    })
    return Promise.reject(error)
  }
)

export default service
