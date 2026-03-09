import request from '@/utils/request'

export const loginApi = (data: any) => request({ url: '/auth/login', method: 'post', data })
export const logoutApi = () => request({ url: '/auth/logout', method: 'post' })
export const getMeApi = () => request({ url: '/auth/me', method: 'get' })
