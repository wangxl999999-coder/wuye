<template>
  <div class="repairs-page">
    <el-card>
      <template #header>
        <span>报修管理</span>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="repairs" v-loading="loading" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="title" label="报修标题" min-width="200" />
        <el-table-column prop="user_name" label="报修人" width="100" />
        <el-table-column prop="building" label="楼栋" width="80">
          <template #default="{ row }">
            {{ row.building }}{{ row.room }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="assignee_name" label="处理人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleProcess(row)" v-if="row.status === 'pending'">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="报修详情" width="600px">
      <div v-if="currentRepair" class="repair-detail">
        <div class="detail-item">
          <span class="label">报修标题：</span>
          <span>{{ currentRepair.title }}</span>
        </div>
        <div class="detail-item">
          <span class="label">报修人：</span>
          <span>{{ currentRepair.user_name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">联系电话：</span>
          <span>{{ currentRepair.phone }}</span>
        </div>
        <div class="detail-item">
          <span class="label">房屋信息：</span>
          <span>{{ currentRepair.building }}{{ currentRepair.room }}</span>
        </div>
        <div class="detail-item">
          <span class="label">报修类型：</span>
          <span>{{ currentRepair.type }}</span>
        </div>
        <div class="detail-item">
          <span class="label">问题描述：</span>
          <span>{{ currentRepair.description || '无' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">当前状态：</span>
          <el-tag :type="getStatusType(currentRepair.status)">{{ getStatusText(currentRepair.status) }}</el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button 
          type="primary" 
          @click="handleComplete" 
          v-if="currentRepair && currentRepair.status !== 'completed'"
        >
          完成报修
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRepairs, getRepairDetail, updateRepair } from '@/api/repairs'

const loading = ref(false)
const repairs = ref([])
const detailVisible = ref(false)
const currentRepair = ref(null)

const queryForm = ref({
  status: '',
  page: 1,
  limit: 20
})

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    closed: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    closed: '已关闭'
  }
  return texts[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRepairs(queryForm.value)
    repairs.value = res.repairs || []
  } catch (error) {
    console.error('加载报修记录失败:', error)
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryForm.value = { status: '', page: 1, limit: 20 }
  loadData()
}

const handleView = async (row) => {
  try {
    const res = await getRepairDetail(row.id)
    currentRepair.value = res.repair
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

const handleProcess = async (row) => {
  try {
    await updateRepair(row.id, { status: 'processing' })
    ElMessage.success('已标记为处理中')
    loadData()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleComplete = async () => {
  if (!currentRepair.value) return
  try {
    await updateRepair(currentRepair.value.id, { status: 'completed' })
    ElMessage.success('报修已完成')
    detailVisible.value = false
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
.repairs-page {
  padding: 0;
}

.query-form {
  margin-bottom: 20px;
}

.repair-detail .detail-item {
  margin-bottom: 16px;
  line-height: 1.6;
}

.repair-detail .label {
  color: #909399;
  display: inline-block;
  width: 100px;
}
</style>
