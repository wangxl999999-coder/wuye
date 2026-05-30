<template>
  <div class="fees-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>物业费管理</span>
          <el-button type="primary" @click="handleAdd" v-if="isAdmin">
            <el-icon><Plus /></el-icon>
            生成账单
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable>
            <el-option label="待缴费" value="unpaid" />
            <el-option label="已缴费" value="paid" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="fees" v-loading="loading" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="month" label="月份" width="120" />
        <el-table-column prop="user_name" label="租户" width="100" />
        <el-table-column prop="building" label="楼栋" width="80">
          <template #default="{ row }">
            {{ row.building }}{{ row.room }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="费用类型" width="100" />
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'paid' ? 'success' : 'warning'">
              {{ row.status === 'paid' ? '已缴费' : '待缴费' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="due_date" label="截止日期" width="120" />
        <el-table-column prop="paid_at" label="缴费时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              link 
              type="primary" 
              @click="handlePay(row)" 
              v-if="row.status === 'unpaid' && isAdmin"
            >
              标记缴费
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="生成物业费账单" width="500px">
      <el-form :model="feeForm" label-width="100px">
        <el-form-item label="租户ID">
          <el-input v-model="feeForm.user_id" type="number" placeholder="请输入租户ID" />
        </el-form-item>
        <el-form-item label="月份">
          <el-input v-model="feeForm.month" placeholder="如：2024-01" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model="feeForm.amount" type="number" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="费用类型">
          <el-input v-model="feeForm.type" placeholder="如：物业费" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="feeForm.due_date" type="date" placeholder="选择日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getFees, createFee, payFee } from '@/api/fees'

const userStore = useUserStore()
const loading = ref(false)
const fees = ref([])
const dialogVisible = ref(false)

const isAdmin = computed(() => userStore.userInfo?.role === 'admin')

const queryForm = ref({
  status: '',
  page: 1,
  limit: 20
})

const feeForm = ref({
  user_id: '',
  month: '',
  amount: '',
  type: '物业费',
  due_date: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getFees(queryForm.value)
    fees.value = res.fees || []
  } catch (error) {
    console.error('加载物业费失败:', error)
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryForm.value = { status: '', page: 1, limit: 20 }
  loadData()
}

const handleAdd = () => {
  feeForm.value = {
    user_id: '',
    month: '',
    amount: '',
    type: '物业费',
    due_date: ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await createFee(feeForm.value)
    ElMessage.success('创建成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('创建失败:', error)
  }
}

const handlePay = async (row) => {
  try {
    await payFee(row.id)
    ElMessage.success('标记成功')
    loadData()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.fees-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.query-form {
  margin-bottom: 20px;
}
</style>
