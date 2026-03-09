import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
    baseURL: '/api', // 代理到 http://localhost:3001
    timeout: 10000
})

request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

request.interceptors.response.use(
    (response) => {
        const res = response.data
        // 对接 NestJS 的 ResponseInterceptor
        if (res.code === 200 || res.code === 201) {
            return res.data
        }
        ElMessage.error(res.message || '系统错误')
        return Promise.reject(new Error(res.message || 'Error'))
    },
    (error) => {
        const status = error.response?.status
        const message = error.response?.data?.message || '网络异常'

        if (status === 401) {
            ElMessage.warning('登录已失效，请重新登录')
            localStorage.clear()
            router.push('/login')
        } else if (status === 403) {
            ElMessage.error('权限不足，无法操作')
        } else if (status === 400) {
            // 拦截 NestJS ValidationPipe 的 DTO 校验错误
            ElMessage.error(typeof message === 'object' ? JSON.stringify(message) : message)
        } else {
            ElMessage.error(message)
        }
        return Promise.reject(error)
    }
)

export default request
