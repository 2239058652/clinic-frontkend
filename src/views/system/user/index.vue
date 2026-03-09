<template>
    <div class="page-container">
        <div class="glass-card search-bar">
            <el-form :inline="true" :model="queryParams" class="form-inline">
                <el-form-item label="用户名">
                    <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="queryParams.email" placeholder="请输入邮箱" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchData">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
            <div class="action-btn">
                <el-button type="success" @click="openAddDialog">新增用户</el-button>
            </div>
        </div>

        <div class="glass-card table-area">
            <el-table :data="tableData" v-loading="loading" style="width: 100%" class="custom-table">
                <el-table-column prop="id" label="ID" width="80" align="center" />
                <el-table-column prop="username" label="用户名" width="150" />
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="email" label="邮箱" width="180" />
                <el-table-column prop="phone" label="手机号" width="150" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
                            {{ row.status === 'ACTIVE' ? '启用' : '禁用' }}
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" />

                <el-table-column label="操作" width="200" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="openAssignRole(row)">分配角色</el-button>
                        <el-popconfirm title="确定要删除该用户吗？" @confirm="handleDelete(row.id)">
                            <template #reference>
                                <el-button type="danger" link>删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
                <el-pagination
                    v-model:current-page="queryParams.page"
                    v-model:page-size="queryParams.pageSize"
                    :page-sizes="[10, 20, 50]"
                    background
                    layout="total, sizes, prev, pager, next"
                    :total="total"
                    @size-change="fetchData"
                    @current-change="fetchData"
                />
            </div>
        </div>

        <el-dialog
            v-model="dialogVisible"
            title="新增系统用户"
            width="500px"
            custom-class="glass-dialog"
            destroy-on-close
        >
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="formData.username" placeholder="登录账号" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="formData.password" type="password" show-password placeholder="登录密码" />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="formData.name" placeholder="真实姓名" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="formData.email" placeholder="工作邮箱" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="formData.phone" placeholder="联系电话" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="submitForm">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserListApi, createUserApi, deleteUserApi } from '@/api/system'
import { cleanEmptyParams } from '@/utils'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
    page: 1,
    pageSize: 10,
    username: '',
    email: ''
})

const fetchData = async () => {
    loading.value = true
    try {
        const params: any = cleanEmptyParams(queryParams)
        const res: any = await getUserListApi(params)

        tableData.value = res.list
        total.value = res.total || res.meta?.total || 0
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const resetSearch = () => {
    queryParams.username = ''
    queryParams.email = ''
    queryParams.page = 1
    fetchData()
}

const handleDelete = async (id: number) => {
    try {
        await deleteUserApi(id)
        ElMessage.success('删除成功')
        fetchData()
    } catch (error) {
        console.error(error)
    }
}

// ========== 表单逻辑 ==========
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref()
const formData = reactive({ username: '', password: '', name: '', email: '', phone: '' })

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const openAddDialog = () => {
    Object.assign(formData, { username: '', password: '', name: '', email: '', phone: '' })
    dialogVisible.value = true
}

const submitForm = () => {
    if (!formRef.value) return
    formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            submitLoading.value = true
            try {
                await createUserApi(formData)
                ElMessage.success('用户创建成功')
                dialogVisible.value = false
                fetchData()
            } catch (error) {
                console.error(error)
            } finally {
                submitLoading.value = false
            }
        }
    })
}

const openAssignRole = (row: any) => {
    // 分配角色逻辑我们放在写“角色模块”时补全
    ElMessage.info('分配角色功能将在搭建角色模块后开放')
}

onMounted(() => fetchData())
</script>

<style scoped lang="scss">
/* 此处完全复用之前 Patient 管理页面的 .page-container, .glass-card, .search-bar, .table-area 样式即可 */
@import '@/assets/styles/common-glass.scss'; /* 建议你把毛玻璃样式抽离成一个公共scss文件引入 */
</style>
