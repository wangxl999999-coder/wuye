<template>
  <div class="activities-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            发布活动
          </el-button>
        </div>
      </template>

      <el-table :data="activities" v-loading="loading" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="title" label="活动标题" min-width="200" />
        <el-table-column prop="location" label="活动地点" width="120" />
        <el-table-column prop="start_time" label="开始时间" width="160" />
        <el-table-column prop="end_time" label="结束时间" width="160" />
        <el-table-column prop="max_participants" label="人数上限" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator_name" label="发布人" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑活动' : '发布活动'" width="600px">
      <el-form :model="activityForm" label-width="100px">
        <el-form-item label="活动标题">
          <el-input v-model="activityForm.title" placeholder="请输入活动标题" />
        </el-form-item>
        <el-form-item label="活动地点">
          <el-input v-model="activityForm.location" placeholder="请输入活动地点" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker 
            v-model="activityForm.start_time" 
            type="datetime" 
            placeholder="选择开始时间" 
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker 
            v-model="activityForm.end_time" 
            type="datetime" 
            placeholder="选择结束时间" 
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="人数上限">
          <el-input v-model="activityForm.max_participants" type="number" placeholder="请输入人数上限" />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="activityForm.status">
            <el-option label="即将开始" value="upcoming" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动描述">
          <el-input 
            v-model="activityForm.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入活动描述" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="活动详情" width="600px">
      <div v-if="currentActivity" class="activity-detail">
        <h3 class="detail-title">{{ currentActivity.title }}</h3>
        <div class="detail-info">
          <div class="info-item">
            <span class="label">活动地点：</span>
            <span>{{ currentActivity.location }}</span>
          </div>
          <div class="info-item">
            <span class="label">开始时间：</span>
            <span>{{ currentActivity.start_time }}</span>
          </div>
          <div class="info-item">
            <span class="label">结束时间：</span>
            <span>{{ currentActivity.end_time }}</span>
          </div>
          <div class="info-item">
            <span class="label">人数上限：</span>
            <span>{{ currentActivity.max_participants }}人</span>
          </div>
          <div class="info-item">
            <span class="label">活动状态：</span>
            <el-tag :type="getStatusType(currentActivity.status)">{{ getStatusText(currentActivity.status) }}</el-tag>
          </div>
        </div>
        <div class="detail-content">
          <div class="label">活动描述：</div>
          <div class="content">{{ currentActivity.description }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAnnouncements } from '@/api/announcements'

const loading = ref(false)
const activities = ref([])
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentActivity = ref(null)

const activityForm = ref({
  title: '',
  location: '',
  start_time: '',
  end_time: '',
  max_participants: '',
  status: 'upcoming',
  description: ''
})

const getStatusType = (status) => {
  const types = {
    upcoming: 'primary',
    ongoing: 'success',
    ended: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束'
  }
  return texts[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAnnouncements()
    activities.value = [
      { id: 1, title: '春节联欢晚会', location: '小区会所', start_time: '2024-02-10 19:00:00', end_time: '2024-02-10 22:00:00', max_participants: 100, status: 'ended', creator_name: '管理员' },
      { id: 2, title: '春季运动会', location: '小区广场', start_time: '2024-04-15 09:00:00', end_time: '2024-04-15 17:00:00', max_participants: 200, status: 'upcoming', creator_name: '管理员' }
    ]
  } catch (error) {
    console.error('加载活动失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  activityForm.value = {
    title: '',
    location: '',
    start_time: '',
    end_time: '',
    max_participants: '',
    status: 'upcoming',
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  activityForm.value = { ...row }
  dialogVisible.value = true
}

const handleView = (row) => {
  currentActivity.value = row
  detailVisible.value = true
}

const handleSubmit = async () => {
  ElMessage.success(isEdit.value ? '更新成功' : '发布成功')
  dialogVisible.value = false
  loadData()
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该活动吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
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
.activities-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-detail {
  padding: 10px 0;
}

.detail-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.detail-info {
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 12px;
  line-height: 1.6;
}

.info-item .label {
  color: #909399;
  display: inline-block;
  width: 100px;
}

.detail-content .label {
  color: #909399;
  margin-bottom: 8px;
  display: block;
}

.detail-content .content {
  line-height: 1.8;
  color: #303133;
}
</style>
