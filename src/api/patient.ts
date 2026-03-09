import request from '@/utils/request'

// 你的接口参数是 page, pageSize, name
export const getPatientListApi = (params: { page: number; pageSize: number; name?: string }) => {
    return request({ url: '/patient/list', method: 'get', params })
}

export const addPatientApi = (data: any) => {
    return request({ url: '/patient/add', method: 'post', data })
}
