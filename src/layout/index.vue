<template>
    <el-container class="layout-wrapper">
        <el-aside width="240px" class="aside-menu">
            <div class="logo-area">
                <el-icon class="logo-icon"><FirstAidKit /></el-icon>
                <span class="logo-text">Smart Dental</span>
            </div>

            <el-scrollbar class="menu-scrollbar">
                <el-menu
                    :default-active="activeMenu"
                    class="el-menu-vertical"
                    active-text-color="#0ea5e9"
                    text-color="#475569"
                    router
                >
                    <el-menu-item index="/dashboard">
                        <el-icon><Monitor /></el-icon>
                        <span>工作台概览</span>
                    </el-menu-item>

                    <el-sub-menu index="/system">
                        <template #title>
                            <el-icon><Setting /></el-icon>
                            <span>系统管理</span>
                        </template>
                        <el-menu-item index="/system/user">用户管理</el-menu-item>
                        <el-menu-item index="/system/role">角色管理</el-menu-item>
                        <el-menu-item index="/system/permission">权限管理</el-menu-item>
                    </el-sub-menu>

                    <el-menu-item index="/patient">
                        <el-icon><Avatar /></el-icon>
                        <span>患者管理</span>
                    </el-menu-item>

                    <el-sub-menu index="/logs">
                        <template #title>
                            <el-icon><Document /></el-icon>
                            <span>日志与审计</span>
                        </template>
                        <el-menu-item index="/logs/audit">操作日志</el-menu-item>
                        <el-menu-item index="/logs/login">登录日志</el-menu-item>
                    </el-sub-menu>
                </el-menu>
            </el-scrollbar>
        </el-aside>

        <el-container class="right-container">
            <el-header class="header">
                <div class="header-left">
                    <span class="welcome-text">数字化口腔管理中心</span>
                </div>
                <div class="header-right">
                    <el-dropdown @command="handleCommand">
                        <div class="user-profile">
                            <el-avatar :size="32" class="avatar">Doc</el-avatar>
                            <span class="username">{{ username }}</span>
                            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="logout" class="logout-item">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>

            <el-main class="main-content">
                <router-view v-slot="{ Component }">
                    <transition name="fade-transform" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Monitor, Document, ArrowDown, FirstAidKit } from '@element-plus/icons-vue'
import { logoutApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)
const userInfoStr = localStorage.getItem('userInfo')
const username = ref(userInfoStr ? JSON.parse(userInfoStr).username : 'Admin')

const handleCommand = async (command: string) => {
    if (command === 'logout') {
        try {
            await logoutApi()
        } catch (e) {
            console.error(e)
        } finally {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userInfo')
            ElMessage.success('已安全退出')
            router.push('/login')
        }
    }
}
</script>

<style scoped lang="scss">
/* 最外层容器，严格占满全屏，防溢出 */
.layout-wrapper {
    height: 100vh;
    width: 100%;
    overflow: hidden;
    background-color: #f0fdf4; /* 极淡的薄荷绿背景，让人放松 */
}

/* 左侧边栏 */
.aside-menu {
    background-color: #ffffff;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
    display: flex;
    flex-direction: column;
    z-index: 10;
    transition: width 0.3s;

    .logo-area {
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 20px;
        border-bottom: 1px solid #f1f5f9;

        .logo-icon {
            font-size: 28px;
            color: #0ea5e9; /* 医疗蓝 */
            margin-right: 12px;
        }
        .logo-text {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: 0.5px;
        }
    }

    .menu-scrollbar {
        flex: 1;
        overflow: hidden;

        .el-menu-vertical {
            border-right: none; /* 去掉 Element 默认的丑边框 */
            padding-top: 10px;

            :deep(.el-menu-item),
            :deep(.el-sub-menu__title) {
                margin: 4px 12px;
                border-radius: 8px; /* 菜单项圆角，更现代 */
                height: 48px;
                line-height: 48px;

                &:hover {
                    background-color: #f0f9ff;
                    color: #0ea5e9;
                }
            }

            :deep(.el-menu-item.is-active) {
                background-color: #e0f2fe;
                color: #0284c7;
                font-weight: 600;
            }
        }
    }
}

/* 右侧结构 */
.right-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden; /* 锁死右侧外层滚动 */
}

/* 顶部 Header */
.header {
    height: 64px;
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px); /* 毛玻璃 */
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    z-index: 9;

    .welcome-text {
        font-size: 16px;
        color: #475569;
        font-weight: 500;
    }

    .user-profile {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 20px;
        transition: background 0.2s;

        &:hover {
            background: #f1f5f9;
        }

        .avatar {
            background: linear-gradient(135deg, #38bdf8, #34d399);
            font-size: 12px;
            margin-right: 10px;
        }
        .username {
            font-size: 14px;
            color: #334155;
            font-weight: 500;
        }
    }
}

/* 主内容区（内部独立滚动） */
.main-content {
    flex: 1;
    overflow-y: auto; /* 只有这里可以向下滚动 */
    overflow-x: hidden;
    padding: 24px;
    position: relative;
}

/* 路由切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
    transition: all 0.3s ease;
}
.fade-transform-enter-from {
    opacity: 0;
    transform: translateX(-20px);
}
.fade-transform-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>
