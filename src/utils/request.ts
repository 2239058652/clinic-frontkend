import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000
})

// --- 无感刷新所需变量 ---
let isRefreshing = false // 是否正在刷新 token
let requestsQueue: Array<() => void> = [] // 请求队列（收集刷新期间进来的请求）

// 创建一个独立的 axios 实例用于刷新 token，防止死循环
const refreshAxios = axios.create({
    baseURL: '/api',
    timeout: 5000
})

// --- 请求拦截器 ---
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

// --- 响应拦截器 ---
request.interceptors.response.use(
    (response) => {
        const res = response.data
        if (res.code === 200 || res.code === 201) {
            return res.data
        }
        ElMessage.error(res.message || '系统错误')
        return Promise.reject(new Error(res.message || 'Error'))
    },
    async (error) => {
        const status = error.response?.status
        const message = error.response?.data?.message || '网络异常'
        const originalRequest = error.config // 获取引发错误的原始请求配置

        // ================= 核心：401 无感刷新 Token =================
        if (status === 401) {
            const refreshToken = localStorage.getItem('refreshToken')

            // 如果连 refreshToken 都没有，直接去登录
            if (!refreshToken) {
                return logoutAndRedirect()
            }

            // 如果正在刷新中，把当前的请求存入队列挂起，等待刷新完毕后执行
            if (isRefreshing) {
                return new Promise((resolve) => {
                    requestsQueue.push(() => {
                        // 刷新成功后，替换新 Token 并重新发起请求
                        originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`
                        resolve(request(originalRequest))
                    })
                })
            }

            // 改变刷新状态，开始刷新
            isRefreshing = true
            try {
                // 调用后端的 refresh 接口
                const res = await refreshAxios.post('/auth/refresh', { refreshToken })
                const newTokens = res.data.data // 根据你的 ResponseInterceptor，真正的数据在 data 里面

                // 1. 存储新的 Token
                localStorage.setItem('accessToken', newTokens.accessToken)
                localStorage.setItem('refreshToken', newTokens.refreshToken)

                // 2. 刷新当前的原始请求
                originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`

                // 3. 执行队列中积压的其它请求
                requestsQueue.forEach((cb) => cb())
                requestsQueue = [] // 清空队列

                // 4. 返回当前请求的结果
                return request(originalRequest)
            } catch (refreshError) {
                // 如果 refresh 也失败了（比如 refreshToken 过期），则强制下线
                console.error('刷新Token失败', refreshError)
                requestsQueue = [] // 清空队列
                return logoutAndRedirect()
            } finally {
                // 无论刷新成功与否，重置刷新状态
                isRefreshing = false
            }
        }

        // ================= 其他错误处理 =================
        if (status === 403) {
            ElMessage.error('权限不足，无法操作')
        } else if (status === 400) {
            ElMessage.error(typeof message === 'object' ? JSON.stringify(message) : message)
        } else {
            ElMessage.error(message)
        }

        return Promise.reject(error)
    }
)

/**
 * 清除本地信息并跳转登录
 */
function logoutAndRedirect() {
    ElMessage.warning('登录已失效，请重新登录')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
    router.push('/login')
    return Promise.reject(new Error('Token Expired'))
}

export default request
