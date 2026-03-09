<template>
    <div class="page-container">
        <div class="glass-card search-bar">
            <el-form :inline="true" :model="queryParams" class="form-inline">
                <el-form-item label="患者姓名">
                    <el-input
                        v-model="queryParams.name"
                        placeholder="请输入姓名进行检索"
                        clearable
                        @keyup.enter="fetchData"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :icon="Search" @click="fetchData">查询</el-button>
                    <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
            <div class="action-btn">
                <el-button type="success" :icon="Plus" @click="openAddDialog">添加患者档案</el-button>
            </div>
        </div>

        <div class="glass-card table-area">
            <el-table :data="tableData" v-loading="loading" style="width: 100%" class="custom-table">
                <el-table-column prop="id" label="病历号" width="100" align="center" />
                <el-table-column prop="name" label="姓名" width="120">
                    <template #default="scope">
                        <span class="patient-name">{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="gender" label="性别" width="80" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.gender === 'FEMALE' ? 'danger' : ''" effect="light" round>
                            {{ scope.row.gender === 'FEMALE' ? '女' : '男' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="age" label="年龄" width="80" align="center" />
                <el-table-column prop="phone" label="联系电话" width="150" />
                <el-table-column prop="idCard" label="身份证号" width="180" />
                <el-table-column prop="createdAt" label="建档时间" />
            </el-table>

            <div class="pagination-wrapper">
                <el-pagination
                    v-model:current-page="queryParams.page"
                    v-model:page-size="queryParams.pageSize"
                    :page-sizes="[10, 20, 50]"
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="fetchData"
                    @current-change="fetchData"
                />
            </div>
        </div>

        <el-dialog
            v-model="dialogVisible"
            title="新建患者档案"
            width="500px"
            custom-class="glass-dialog"
            destroy-on-close
        >
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="90px">
                <el-form-item label="患者姓名" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入真实姓名" />
                </el-form-item>
                <el-form-item label="性别" prop="gender">
                    <el-radio-group v-model="formData.gender">
                        <el-radio label="MALE">男</el-radio>
                        <el-radio label="FEMALE">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="年龄" prop="age">
                    <el-input-number v-model="formData.age" :min="1" :max="120" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
                </el-form-item>
                <el-form-item label="身份证号" prop="idCard">
                    <el-input v-model="formData.idCard" placeholder="请输入18位身份证号" maxlength="18" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" :loading="submitLoading" @click="submitForm">确认建档</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPatientListApi, addPatientApi } from '@/api/patient'

// 搜索条件对应你 NestJS 控制器的参数
const queryParams = reactive({
    page: 1,
    pageSize: 10,
    name: ''
})

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

// 获取表格数据
const fetchData = async () => {
    loading.value = true
    try {
        const res: any = await getPatientListApi(queryParams)
        // 根据你 NestJS Service 的返回结构调整，一般分页返回的是 [data, total] 或 { list, total }
        // 这里假设你的 patientsService.listPatients 返回的是 { items: [], total: 0 } 或 { data: [], total: 0 }
        tableData.value = res.items || res.data || res[0] || []
        total.value = res.total || res[1] || 0
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 重置搜索
const resetSearch = () => {
    queryParams.name = ''
    queryParams.page = 1
    fetchData()
}

// ========== 表单弹窗逻辑 ==========
const dialogVisible = ref(false)
const formRef = ref()
const submitLoading = ref(false)

const formData = reactive({
    name: '',
    gender: 'MALE',
    age: 25,
    phone: '',
    idCard: ''
})

// 表单验证，对应你的 CreatePatientsDto
const rules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }]
}

const openAddDialog = () => {
    Object.assign(formData, { name: '', gender: 'MALE', age: 25, phone: '', idCard: '' })
    dialogVisible.value = true
}

const submitForm = () => {
    if (!formRef.value) return
    formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            submitLoading.value = true
            try {
                await addPatientApi(formData)
                ElMessage.success('患者档案创建成功')
                dialogVisible.value = false
                fetchData() // 刷新列表
            } catch (error) {
                console.error(error)
            } finally {
                submitLoading.value = false
            }
        }
    })
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped lang="scss">
.page-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    /* 确保页面高度撑满，防抖动 */
    min-height: calc(100vh - 120px);
}

/* 医疗科技风的毛玻璃卡片 */
.glass-card {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.04);
}

.search-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .form-inline {
        flex: 1;

        :deep(.el-form-item) {
            margin-bottom: 0;
        }
    }
}

.table-area {
    flex: 1;
    display: flex;
    flex-direction: column;

    .patient-name {
        font-weight: 600;
        color: #0ea5e9; /* 医疗蓝强调 */
        letter-spacing: 1px;
    }

    /* 深度美化 Element Table 适配毛玻璃 */
    :deep(.el-table) {
        background: transparent;
        --el-table-border-color: rgba(226, 232, 240, 0.6);

        tr,
        th.el-table__cell,
        td.el-table__cell {
            background: transparent;
        }

        thead th {
            color: #334155;
            font-weight: 600;
            background-color: rgba(241, 245, 249, 0.6) !important;
            border-bottom: 2px solid rgba(226, 232, 240, 0.8);
        }

        .el-table__row {
            transition: all 0.3s ease;

            &:hover > td.el-table__cell {
                background-color: rgba(224, 242, 254, 0.5) !important; /* 悬浮时的淡蓝色 */
            }
        }
    }

    .pagination-wrapper {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;
    }
}

/* 全局弹窗毛玻璃样式补充 (可以移到 style.css 中) */
:deep(.glass-dialog) {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

    .el-dialog__header {
        border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        margin-right: 0;
        padding-bottom: 16px;
    }

    .el-dialog__footer {
        border-top: 1px solid rgba(226, 232, 240, 0.8);
        padding-top: 16px;
    }
}
</style>
