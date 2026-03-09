import request from '@/utils/request'

// ================= 用户管理 =================
// 对应后端 @Controller('users')
export const getUserListApi = (params: any) => request({ url: '/users', method: 'get', params })
export const createUserApi = (data: any) => request({ url: '/users', method: 'post', data })
export const deleteUserApi = (id: number) => request({ url: `/users/${id}`, method: 'delete' })
export const assignUserRolesApi = (id: number, roleIds: number[]) =>
    request({ url: `/users/${id}/roles`, method: 'post', data: { roleIds } })

// ================= 角色管理 =================
// 对应后端 @Controller('roles')
export const getRoleListApi = (params: any) => request({ url: '/roles', method: 'get', params })
export const createRoleApi = (data: any) => request({ url: '/roles', method: 'post', data })
// 修复：后端是 @Put(':id')，不是 patch
export const updateRoleApi = (id: number, data: any) => request({ url: `/roles/${id}`, method: 'put', data })
export const deleteRoleApi = (id: number) => request({ url: `/roles/${id}`, method: 'delete' })

// 角色分配权限核心接口
export const getRolePermissionsApi = (id: number) => request({ url: `/roles/${id}/permissions`, method: 'get' })
export const assignRolePermissionsApi = (id: number, permissionIds: number[]) =>
    request({ url: `/roles/${id}/permissions`, method: 'post', data: { permissionIds } })

// ================= 权限管理 =================
// 假设后端是 @Controller('permissions') 或 @Controller('permission')
// 你可以根据后端的 controller 自行检查，通常是复数 permissions
export const getPermissionTreeApi = () => request({ url: '/permissions/tree', method: 'get' })
export const createPermissionApi = (data: any) => request({ url: '/permissions', method: 'post', data })
export const updatePermissionApi = (id: number, data: any) =>
    request({ url: `/permissions/${id}`, method: 'put', data })
export const deletePermissionApi = (id: number) => request({ url: `/permissions/${id}`, method: 'delete' })
