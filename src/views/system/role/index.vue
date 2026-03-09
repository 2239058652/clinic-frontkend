<template>
    <div class="page-container">
        <div class="glass-card search-bar">
            <el-form :inline="true" :model="queryParams" class="form-inline">
                <el-form-item label="角色名称">
                    <el-input v-model="queryParams.name" placeholder="请输入角色名称" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchData">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
            <div class="action-btn">
                <el-button type="success" @click="openAddDialog">新增角色</el-button>
            </div>
        </div>

        <div class="glass-card table-area">
            <el-table :data="tableData" v-loading="loading" style="width: 100%" class="custom-table">
                <el-table-column prop="id" label="ID" width="80" align="center" />
                <el-table-column prop="name" label="角色名称" width="150" />
                <el-table-column prop="code" label="角色编码" width="150">
                    <template #default="{ row }">
                        <el-tag effect="light">{{ row.code }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
                            {{ row.status === 'ACTIVE' ? '启用' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="260" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button type="warning" link @click="openPermissionDrawer(row)">分配权限</el-button>
                        <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
                        <el-popconfirm title="确定要删除该角色吗？" @confirm="handleDelete(row.id)">
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

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" custom-class="glass-dialog">
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="formData.name" placeholder="如：系统管理员" />
                </el-form-item>
                <el-form-item label="角色编码" prop="code">
                    <el-input v-model="formData.code" placeholder="如：ADMIN" :disabled="!!formData.id" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="formData.description" type="textarea" :rows="3" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="submitForm">确认</el-button>
            </template>
        </el-dialog>

        <el-drawer v-model="drawerVisible" title="分配菜单与接口权限" size="400px" class="glass-drawer">
            <div v-loading="treeLoading" class="tree-container">
                <el-tree
                    ref="permissionTreeRef"
                    :data="permissionTree"
                    show-checkbox
                    node-key="id"
                    default-expand-all
                    :props="{ label: 'name', children: 'children' }"
                >
                    <template #default="{ node, data }">
                        <span class="custom-tree-node">
                            <span>{{ node.label }}</span>
                            <el-tag
                                size="small"
                                :type="data.type === 'MENU' ? undefined : 'warning'"
                                style="margin-left: 10px"
                            >
                                {{ data.type === 'MENU' ? '菜单' : '接口' }}
                            </el-tag>
                        </span>
                    </template>
                </el-tree>
            </div>
            <template #footer>
                <el-button @click="drawerVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="submitPermissions">保存权限</el-button>
            </template>
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, ElTree } from 'element-plus' // 引入 Element Plus 的类型
import {
    getRoleListApi,
    createRoleApi,
    updateRoleApi,
    deleteRoleApi,
    getPermissionTreeApi,
    getRolePermissionsApi,
    assignRolePermissionsApi
} from '@/api/system'
import { cleanEmptyParams } from '@/utils'

// --- 表格数据 ---
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryParams = reactive({ page: 1, pageSize: 10, name: '' })

const fetchData = async () => {
    loading.value = true
    try {
        const params: any = cleanEmptyParams(queryParams)
        const res: any = await getRoleListApi(params)
        // 修复1：对接后端 RoleService 返回的 { list, pagination } 结构
        tableData.value = res.list || []
        total.value = res.pagination?.total || 0
    } finally {
        loading.value = false
    }
}

const resetSearch = () => {
    queryParams.name = ''
    queryParams.page = 1
    fetchData()
}

// --- 增改弹窗 ---
const dialogVisible = ref(false)
const submitLoading = ref(false)
// 修复2：为 formRef 添加 TS 类型，消除标红
const formRef = ref<FormInstance>()
const dialogTitle = ref('新增角色')
const formData = reactive({ id: 0, name: '', code: '', description: '' })
const rules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
}

const openAddDialog = () => {
    dialogTitle.value = '新增角色'
    Object.assign(formData, { id: 0, name: '', code: '', description: '' })
    dialogVisible.value = true
    // 清除校验状态
    nextTick(() => formRef.value?.clearValidate())
}

const openEditDialog = (row: any) => {
    dialogTitle.value = '编辑角色'
    Object.assign(formData, { id: row.id, name: row.name, code: row.code, description: row.description })
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
}

const submitForm = () => {
    if (!formRef.value) return
    formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        submitLoading.value = true
        try {
            // 修复3：由于后端启用了 forbidNonWhitelisted，必须剔除无关字段
            const payload = {
                name: formData.name,
                code: formData.code,
                description: formData.description
            }

            if (formData.id) {
                await updateRoleApi(formData.id, payload)
                ElMessage.success('更新成功')
            } else {
                await createRoleApi(payload)
                ElMessage.success('创建成功')
            }
            dialogVisible.value = false
            fetchData()
        } finally {
            submitLoading.value = false
        }
    })
}

const handleDelete = async (id: number) => {
    await deleteRoleApi(id)
    ElMessage.success('删除成功')
    fetchData()
}

// --- 分配权限逻辑 ---
const drawerVisible = ref(false)
const treeLoading = ref(false)
// 修复4：为 Tree 增加实例类型，避免 getCheckedKeys() 报错
const permissionTreeRef = ref<InstanceType<typeof ElTree>>()
const permissionTree = ref([])
const currentRoleId = ref(0)

const openPermissionDrawer = async (row: any) => {
    currentRoleId.value = row.id
    drawerVisible.value = true
    treeLoading.value = true
    try {
        if (permissionTree.value.length === 0) {
            const res: any = await getPermissionTreeApi()
            permissionTree.value = res
        }

        const rolePerms: any = await getRolePermissionsApi(row.id)
        // 从后端返回的 permissions 数组中提取 id
        const checkedKeys = rolePerms.map((p: any) => p.id)

        await nextTick()
        permissionTreeRef.value?.setCheckedKeys(checkedKeys)
    } finally {
        treeLoading.value = false
    }
}

const submitPermissions = async () => {
    if (!permissionTreeRef.value) return
    submitLoading.value = true
    try {
        const checkedKeys = permissionTreeRef.value.getCheckedKeys() as number[]
        const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys() as number[]
        const allSelectedIds = [...checkedKeys, ...halfCheckedKeys]

        await assignRolePermissionsApi(currentRoleId.value, allSelectedIds)
        ElMessage.success('权限分配成功')
        drawerVisible.value = false
    } finally {
        submitLoading.value = false
    }
}

onMounted(() => fetchData())
</script>

<style scoped lang="scss">
@import '@/assets/styles/common-glass.scss';

.tree-container {
    padding: 10px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    max-height: calc(100vh - 180px);
    overflow-y: auto;
}

/* 抽屉毛玻璃效果 */
:deep(.glass-drawer) {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
}
</style>
