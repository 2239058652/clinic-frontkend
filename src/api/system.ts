import request from '@/utils/request'

// ================= 用户管理 =================
export const getUserListApi = (params: any) => request({ url: '/user', method: 'get', params })
export const createUserApi = (data: any) => request({ url: '/user', method: 'post', data })
export const deleteUserApi = (id: number) => request({ url: `/user/${id}`, method: 'delete' })
export const assignUserRolesApi = (id: number, roleIds: number[]) =>
    request({ url: `/user/${id}/roles`, method: 'post', data: { roleIds } })

// ================= 角色管理 =================
export const getRoleListApi = (params: any) => request({ url: '/role', method: 'get', params })
export const createRoleApi = (data: any) => request({ url: '/role', method: 'post', data })
export const updateRoleApi = (id: number, data: any) => request({ url: `/role/${id}`, method: 'patch', data })
export const deleteRoleApi = (id: number) => request({ url: `/role/${id}`, method: 'delete' })
// 角色分配权限核心接口
export const getRolePermissionsApi = (id: number) => request({ url: `/role/${id}/permissions`, method: 'get' })
export const assignRolePermissionsApi = (id: number, permissionIds: number[]) =>
    request({ url: `/role/${id}/permissions`, method: 'post', data: { permissionIds } })

// ================= 权限管理 =================
export const getPermissionTreeApi = () => request({ url: '/permission/tree', method: 'get' })
export const createPermissionApi = (data: any) => request({ url: '/permission', method: 'post', data })
export const updatePermissionApi = (id: number, data: any) =>
    request({ url: `/permission/${id}`, method: 'patch', data })
export const deletePermissionApi = (id: number) => request({ url: `/permission/${id}`, method: 'delete' })
