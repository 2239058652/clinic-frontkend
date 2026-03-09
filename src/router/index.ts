import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/login/index.vue')
        },
        {
            path: '/',
            name: 'Layout',
            component: () => import('@/layout/index.vue'),
            redirect: '/dashboard',
            children: [
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: () => import('@/views/dashboard/index.vue')
                },
                // --- 系统管理 ---
                {
                    path: 'system/user',
                    name: 'SystemUser',
                    component: () => import('@/views/system/user/index.vue') // 你上一步已经写好的
                },
                {
                    path: 'system/role',
                    name: 'SystemRole',
                    component: () => import('@/views/system/role/index.vue') // 本次新增
                },
                {
                    path: 'system/permission',
                    name: 'SystemPermission',
                    component: () => import('@/views/system/permission/index.vue') // 本次新增
                },
                // --- 业务模块 ---
                {
                    path: 'patient',
                    name: 'PatientManage',
                    component: () => import('@/views/patient/index.vue') // 之前的患者模块
                },
                // --- 日志管理 ---
                {
                    path: 'logs/audit',
                    name: 'AuditLogs',
                    component: () => import('@/views/logs/audit.vue')
                },
                {
                    path: 'logs/login',
                    name: 'LoginLogs',
                    component: () => import('@/views/logs/login.vue')
                }
            ]
        }
    ]
})

// 路由守卫：没登录不让进后台
router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('accessToken')
    if (to.path !== '/login' && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router
