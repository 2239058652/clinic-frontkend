<template>
    <div class="login-container">
        <div class="bg-shape shape1"></div>
        <div class="bg-shape shape2"></div>
        <div class="bg-shape shape3"></div>

        <div class="login-box">
            <div class="login-header">
                <div class="logo-circle">
                    <el-icon><FirstAidKit /></el-icon>
                </div>
                <h2 class="login-title">Smart Dental</h2>
                <p class="login-subtitle">智能口腔数字化管理平台</p>
            </div>

            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large" class="login-form">
                <el-form-item prop="username">
                    <el-input
                        v-model="loginForm.username"
                        placeholder="请输入管理员账号"
                        :prefix-icon="User"
                        @keyup.enter="handleLogin"
                        class="glass-input"
                    />
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        show-password
                        @keyup.enter="handleLogin"
                        class="glass-input"
                    />
                </el-form-item>

                <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
                    进 入 系 统
                </el-button>
            </el-form>

            <div class="login-footer">
                <span>安全 · 智能 · 高效</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, FirstAidKit } from '@element-plus/icons-vue'
import { loginApi } from '@/api/auth'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
    username: '',
    password: ''
})

const loginRules = reactive({
    username: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
    password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
})

const handleLogin = () => {
    if (!loginFormRef.value) return

    loginFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            loading.value = true
            try {
                const res: any = await loginApi(loginForm)

                // 保存 NestJS 返回的完整凭证
                localStorage.setItem('accessToken', res.accessToken)
                localStorage.setItem('refreshToken', res.refreshToken)
                localStorage.setItem('userInfo', JSON.stringify(res.user))

                ElMessage({
                    message: `欢迎回来，${res.user.name || res.user.username}`,
                    type: 'success',
                    customClass: 'glass-message'
                })
                router.push('/')
            } catch (error) {
                console.error('登录异常', error)
            } finally {
                loading.value = false
            }
        }
    })
}
</script>

<style scoped lang="scss">
.login-container {
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    /* 科技感与舒心感结合的背景渐变：医疗蓝 -> 薄荷绿 -> 纯净白 */
    background: linear-gradient(135deg, #e0f2fe 0%, #d1fae5 50%, #bae6fd 100%);
    position: relative;
    overflow: hidden;

    /* 悬浮的渐变几何图形，增加科技灵动感 */
    .bg-shape {
        position: absolute;
        filter: blur(60px);
        z-index: 1;
        border-radius: 50%;
    }
    .shape1 {
        width: 400px;
        height: 400px;
        background: #60a5fa; // 科技蓝
        top: -100px;
        left: -100px;
        opacity: 0.4;
        animation: float 8s ease-in-out infinite;
    }
    .shape2 {
        width: 500px;
        height: 500px;
        background: #34d399; // 薄荷绿
        bottom: -150px;
        right: -100px;
        opacity: 0.3;
        animation: float 10s ease-in-out infinite reverse;
    }
    .shape3 {
        width: 300px;
        height: 300px;
        background: #818cf8; // 淡淡的紫蓝
        bottom: 20%;
        left: 20%;
        opacity: 0.2;
        animation: float 12s ease-in-out infinite;
    }

    @keyframes float {
        0% {
            transform: translateY(0px) scale(1);
        }
        50% {
            transform: translateY(-30px) scale(1.05);
        }
        100% {
            transform: translateY(0px) scale(1);
        }
    }

    /* 毛玻璃登录面板 */
    .login-box {
        position: relative;
        z-index: 10;
        width: 420px;
        padding: 50px 40px;
        background: rgba(255, 255, 255, 0.45); // 半透明白
        backdrop-filter: blur(16px); // 毛玻璃核心属性
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.6); // 边缘高光
        border-radius: 24px; // 舒心感需要大圆角
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.08); // 极柔和的阴影

        .login-header {
            text-align: center;
            margin-bottom: 40px;

            .logo-circle {
                width: 64px;
                height: 64px;
                margin: 0 auto 16px;
                background: linear-gradient(135deg, #3b82f6, #10b981);
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                font-size: 32px;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            }

            .login-title {
                font-size: 26px;
                font-weight: 700;
                color: #1e293b;
                letter-spacing: 1px;
                margin: 0 0 8px;
                font-family: 'Helvetica Neue', Arial, sans-serif;
            }

            .login-subtitle {
                font-size: 14px;
                color: #64748b;
                margin: 0;
                letter-spacing: 2px;
            }
        }

        .login-form {
            /* 深度覆盖 Element Plus 的输入框默认样式，使其融入毛玻璃背景 */
            :deep(.el-input__wrapper) {
                background-color: rgba(255, 255, 255, 0.6);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02) !important;
                border-radius: 12px;
                padding: 4px 15px;
                transition: all 0.3s;

                &.is-focus {
                    background-color: rgba(255, 255, 255, 0.9);
                    box-shadow: 0 0 0 1px #3b82f6 inset !important; // 科技蓝边框
                }

                .el-input__inner {
                    color: #334155;
                }
            }
        }

        .login-btn {
            width: 100%;
            height: 48px;
            margin-top: 20px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 2px;
            border: none;
            /* 按钮使用微渐变，呼应口腔医疗的洁净感 */
            background: linear-gradient(to right, #3b82f6, #2dd4bf);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
                background: linear-gradient(to right, #2563eb, #14b8a6);
            }

            &:active {
                transform: translateY(0);
            }
        }

        .login-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            letter-spacing: 4px;
        }
    }
}
</style>
