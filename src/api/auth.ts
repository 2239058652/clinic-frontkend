import request from '@/utils/request'

// 登录接口
export const loginApi = (data: any) => {
    return request({
        url: '/auth/login',
        method: 'post',
        data
    })
}

// 退出登录接口
export const logoutApi = () => {
    return request({
        url: '/auth/logout',
        method: 'post'
    })
}
