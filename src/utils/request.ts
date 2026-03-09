import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 Axios 实例
const request = axios.create({
    baseURL: '/api', // 对应 vite.config.ts 里的代理配置
    timeout: 10000
})

// 请求拦截器：自动带上 Token
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

// 响应拦截器：处理后端的报错和 401 踢人
request.interceptors.response.use(
    (response) => {
        // 你的后端返回结构应该是 { code, message, data }
        const res = response.data
        if (res.code !== 200 && res.code !== 201 && res.code !== undefined) {
            ElMessage.error(res.message || '系统错误')
            return Promise.reject(new Error(res.message || 'Error'))
        }
        return res.data || res // 根据你的实际返回结构调整
    },
    (error) => {
        // 重点：处理你后端的 401 Unauthorized 和 Token 过期/被挤下线
        if (error.response?.status === 401) {
            ElMessage.warning('登录已失效或被挤下线，请重新登录')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('userInfo')
            // 跳转到登录页
            router.push('/login')
        } else if (error.response?.status === 403) {
            ElMessage.error('没有权限访问该接口')
        } else {
            ElMessage.error(error.response?.data?.message || error.message || '网络错误')
        }
        return Promise.reject(error)
    }
)

export default request
