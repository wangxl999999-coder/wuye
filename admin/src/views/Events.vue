<template>
  <div class="events-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>事件管理</span>
          <el-button type="primary" @click="handleAdd" v-if="isAdminOrReception">
            <el-icon><Plus /></el-icon>
            新增事件
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="事件类型">
          <el-select v-model="queryForm.type" placeholder="请选择" clearable>
            <el-option label="租约到期" value="lease_expiry" />
            <el-option label="通行证签名" value="pass_signature" />
            <el-option label="通行证待审" value="pass_approval" />
            <el-option label="车辆许可延期" value="vehicle_renewal" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
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

      <el-table :data="events" v-loading="loading" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="title" label="事件标题" min-width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="相关租户" width="100" />
        <el-table-column prop="building" label="楼栋" width="80">
          <template #default="{ row }">
            {{ row.building }}{{ row.room }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityTag(row.priority)">{{ getPriorityText(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)" v-if="isAdminOrReception">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-if="isAdmin">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="mt-4"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="queryForm.limit"
        :current-page="queryForm.page"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="eventForm" label-width="100px">
        <el-form-item label="事件类型">
          <el-select v-model="eventForm.type" placeholder="请选择">
            <el-option label="租约到期" value="lease_expiry" />
            <el-option label="通行证签名不全" value="pass_signature" />
            <el-option label="通行证待审批" value="pass_approval" />
            <el-option label="车辆许可延期" value="vehicle_renewal" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="事件标题">
          <el-input v-model="eventForm.title" placeholder="请输入事件标题" />
        </el-form-item>
        <el-form-item label="相关租户">
          <el-input v-model="eventForm.user_id" type="number" placeholder="请输入租户ID" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="eventForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="eventForm.priority">
            <el-option label="高" value="high" />
            <el-option label="中" value="normal" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="eventForm.status">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="eventForm.due_date" type="date" placeholder="选择日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="事件详情" width="600px">
      <div v-if="currentEvent" class="event-detail">
        <div class="detail-item">
          <span class="label">事件标题：</span>
          <span>{{ currentEvent.title }}</span>
        </div>
        <div class="detail-item">
          <span class="label">事件类型：</span>
          <el-tag :type="getTypeTag(currentEvent.type)">{{ getTypeText(currentEvent.type) }}</el-tag>
        </div>
        <div class="detail-item">
          <span class="label">相关租户：</span>
          <span>{{ currentEvent.user_name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">联系电话：</span>
          <span>{{ currentEvent.phone }}</span>
        </div>
        <div class="detail-item">
          <span class="label">房屋信息：</span>
          <span>{{ currentEvent.building }}{{ currentEvent.room }}</span>
        </div>
        <div class="detail-item">
          <span class="label">事件描述：</span>
          <span>{{ currentEvent.description || '无' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">当前状态：</span>
          <el-tag :type="getStatusType(currentEvent.status)">{{ getStatusText(currentEvent.status) }}</el-tag>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span>{{ currentEvent.created_at }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getEvents, createEvent, updateEvent, deleteEvent, getEventDetail } from '@/api/events'

const userStore = useUserStore()
const loading = ref(false)
const events = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentEvent = ref(null)

const isAdmin = computed(() => userStore.userInfo?.role === 'admin')
const isAdminOrReception = computed(() => ['admin', 'reception'].includes(userStore.userInfo?.role))

const queryForm = ref({
  type: '',
  status: '',
  page: 1,
  limit: 10
})

const eventForm = ref({
  type: '',
  title: '',
  user_id: '',
  description: '',
  priority: 'normal',
  status: 'pending',
  due_date: ''
})

const dialogTitle = computed(() => isEdit.value ? '编辑事件' : '新增事件')

const getTypeTag = (type) => {
  const tags = {
    lease_expiry: 'danger',
    pass_signature: 'warning',
    pass_approval: 'primary',
    vehicle_renewal: 'success',
    other: 'info'
  }
  return tags[type] || 'info'
}

const getTypeText = (type) => {
  const texts = {
    lease_expiry: '租约到期',
    pass_signature: '通行证签名',
    pass_approval: '通行证待审',
    vehicle_renewal: '车辆延期',
    other: '其他'
  }
  return texts[type] || type
}

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

const getPriorityTag = (priority) => {
  const tags = {
    high: 'danger',
    normal: 'warning',
    low: 'success'
  }
  return tags[priority] || 'info'
}

const getPriorityText = (priority) => {
  const texts = {
    high: '高',
    normal: '中',
    low: '低'
  }
  return texts[priority] || priority
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getEvents(queryForm.value)
    events.value = res.events || []
    total.value = res.events?.length || 0
  } catch (error) {
    console.error('加载事件失败:', error)
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryForm.value = {
    type: '',
    status: '',
    page: 1,
    limit: 10
  }
  loadData()
}

const handleSizeChange = (size) => {
  queryForm.value.limit = size
  loadData()
}

const handleCurrentChange = (page) => {
  queryForm.value.page = page
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  eventForm.value = {
    type: '',
    title: '',
    user_id: '',
    description: '',
    priority: 'normal',
    status: 'pending',
    due_date: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  eventForm.value = { ...row }
  dialogVisible.value = true
}

const handleView = async (row) => {
  try {
    const res = await getEventDetail(row.id)
    currentEvent.value = res.event
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateEvent(eventForm.value.id, eventForm.value)
      ElMessage.success('更新成功')
    } else {
      await createEvent(eventForm.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该事件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteEvent(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.events-page {
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

.mt-4 {
  margin-top: 20px;
}

.event-detail .detail-item {
  margin-bottom: 16px;
  line-height: 1.6;
}

.event-detail .label {
  color: #909399;
  display: inline-block;
  width: 100px;
}
</style>
