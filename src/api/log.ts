import request from '@/utils/request'

// 获取审计日志列表
export const getAuditLogsApi = (params: { page: number; limit: number; module?: string }) => {
    return request({ url: '/logs/audit/logs', method: 'get', params })
}

// 获取登录日志列表
export const getLoginLogsApi = (params: { page: number; limit: number; status?: string }) => {
    return request({ url: '/logs/login/logs', method: 'get', params })
}
