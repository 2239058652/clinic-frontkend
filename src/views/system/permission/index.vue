<template>
    <div class="page-container">
        <div class="glass-card search-bar">
            <div class="action-btn">
                <el-button type="success" :icon="Plus" @click="openAddDialog(null)">新增顶级菜单</el-button>
                <el-button :icon="Refresh" @click="fetchData">刷新</el-button>
            </div>
        </div>

        <div class="glass-card table-area">
            <el-table
                :data="tableData"
                v-loading="loading"
                style="width: 100%"
                class="custom-table"
                row-key="id"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                default-expand-all
            >
                <el-table-column prop="name" label="菜单/权限名称" width="220" />
                <el-table-column prop="type" label="类型" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.type === 'MENU' ? undefined : 'warning'">
                            {{ row.type === 'MENU' ? '菜单' : '接口 API' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="code" label="权限标识 (Code)" width="180" />
                <el-table-column prop="path" label="路由路径" width="150" />
                <el-table-column prop="sort" label="排序" width="80" align="center" />

                <el-table-column label="操作" width="220" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button type="success" link @click="openAddDialog(row)" v-if="row.type === 'MENU'">
                            新增子项
                        </el-button>
                        <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
                        <el-popconfirm title="确定要删除吗？包含子节点也会受影响" @confirm="handleDelete(row.id)">
                            <template #reference>
                                <el-button type="danger" link>删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" custom-class="glass-dialog">
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
                <el-form-item label="上级节点" v-if="formData.parentId">
                    <el-input v-model="parentName" disabled />
                </el-form-item>
                <el-form-item label="权限类型" prop="type">
                    <el-radio-group v-model="formData.type">
                        <el-radio label="MENU">页面菜单</el-radio>
                        <el-radio label="API">接口操作</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="formData.name" placeholder="如：系统管理 或 添加用户" />
                </el-form-item>
                <el-form-item label="权限标识" prop="code">
                    <el-input v-model="formData.code" placeholder="如：system 或 user:add" />
                </el-form-item>
                <el-form-item label="路由地址" prop="path" v-if="formData.type === 'MENU'">
                    <el-input v-model="formData.path" placeholder="如：/system/user" />
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="formData.sort" :min="0" />
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
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPermissionTreeApi, createPermissionApi, updatePermissionApi, deletePermissionApi } from '@/api/system'

const loading = ref(false)
const tableData = ref([])

const fetchData = async () => {
    loading.value = true
    try {
        const res: any = await getPermissionTreeApi()
        tableData.value = res // 权限树通常直接返回数组
    } finally {
        loading.value = false
    }
}

const handleDelete = async (id: number) => {
    await deletePermissionApi(id)
    ElMessage.success('删除成功')
    fetchData()
}

// --- 表单逻辑 ---
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref()
const dialogTitle = ref('新增权限')
const parentName = ref('')

const formData = reactive({
    id: 0,
    parentId: null as number | null,
    name: '',
    code: '',
    type: 'MENU',
    path: '',
    sort: 0
})

const rules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
}

// 传入 row 表示是添加子节点，传 null 表示添加顶级节点
const openAddDialog = (row: any) => {
    dialogTitle.value = '新增权限'
    Object.assign(formData, {
        id: 0,
        parentId: row ? row.id : null,
        name: '',
        code: '',
        type: 'MENU',
        path: '',
        sort: 0
    })
    parentName.value = row ? row.name : ''
    dialogVisible.value = true
}

const openEditDialog = (row: any) => {
    dialogTitle.value = '编辑权限'
    Object.assign(formData, {
        id: row.id,
        parentId: row.parentId,
        name: row.name,
        code: row.code,
        type: row.type,
        path: row.path,
        sort: row.sort
    })
    dialogVisible.value = true
}

const submitForm = () => {
    formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        submitLoading.value = true
        try {
            if (formData.id) {
                await updatePermissionApi(formData.id, formData)
                ElMessage.success('更新成功')
            } else {
                await createPermissionApi(formData)
                ElMessage.success('创建成功')
            }
            dialogVisible.value = false
            fetchData()
        } finally {
            submitLoading.value = false
        }
    })
}

onMounted(() => fetchData())
</script>

<style scoped lang="scss">
@import '@/assets/styles/common-glass.scss';
</style>
