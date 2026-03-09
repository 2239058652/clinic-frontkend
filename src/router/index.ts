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
                {
                    path: 'logs/audit',
                    name: 'AuditLogs',
                    component: () => import('@/views/logs/audit.vue')
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
