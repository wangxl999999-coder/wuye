<template>
  <div class="complaints-page">
    <el-card>
      <template #header>
        <span>投诉管理</span>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已回复" value="replied" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="complaints" v-loading="loading" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="title" label="投诉标题" min-width="200" />
        <el-table-column prop="user_name" label="投诉人" width="100" />
        <el-table-column prop="building" label="楼栋" width="80">
          <template #default="{ row }">
            {{ row.building }}{{ row.room }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleReply(row)" v-if="row.status === 'pending'">回复</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="投诉详情" width="600px">
      <div v-if="currentComplaint" class="complaint-detail">
        <div class="detail-item">
          <span class="label">投诉标题：</span>
          <span>{{ currentComplaint.title }}</span>
        </div>
        <div class="detail-item">
          <span class="label">投诉人：</span>
          <span>{{ currentComplaint.user_name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">联系电话：</span>
          <span>{{ currentComplaint.phone }}</span>
        </div>
        <div class="detail-item">
          <span class="label">房屋信息：</span>
          <span>{{ currentComplaint.building }}{{ currentComplaint.room }}</span>
        </div>
        <div class="detail-item">
          <span class="label">投诉类型：</span>
          <span>{{ currentComplaint.type }}</span>
        </div>
        <div class="detail-item">
          <span class="label">投诉内容：</span>
          <span>{{ currentComplaint.description || '无' }}</span>
        </div>
        <div class="detail-item" v-if="currentComplaint.reply">
          <span class="label">物业回复：</span>
          <span>{{ currentComplaint.reply }}</span>
        </div>
        <div class="detail-item">
          <span class="label">当前状态：</span>
          <el-tag :type="getStatusType(currentComplaint.status)">{{ getStatusText(currentComplaint.status) }}</el-tag>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="replyVisible" title="回复投诉" width="500px">
      <el-form :model="replyForm" label-width="80px">
        <el-form-item label="回复内容">
          <el-input 
            v-model="replyForm.reply" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入回复内容" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getComplaints, getComplaintDetail, replyComplaint } from '@/api/complaints'

const loading = ref(false)
const complaints = ref([])
const detailVisible = ref(false)
const replyVisible = ref(false)
const currentComplaint = ref(null)
const currentComplaintId = ref(null)

const queryForm = ref({
  status: '',
  page: 1,
  limit: 20
})

const replyForm = ref({
  reply: ''
})

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    processing: 'primary',
    replied: 'success',
    closed: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    processing: '处理中',
    replied: '已回复',
    closed: '已关闭'
  }
  return texts[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getComplaints(queryForm.value)
    complaints.value = res.complaints || []
  } catch (error) {
    console.error('加载投诉记录失败:', error)
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
    const res = await getComplaintDetail(row.id)
    currentComplaint.value = res.complaint
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

const handleReply = (row) => {
  currentComplaintId.value = row.id
  replyForm.value.reply = ''
  replyVisible.value = true
}

const submitReply = async () => {
  if (!replyForm.value.reply.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  try {
    await replyComplaint(currentComplaintId.value, replyForm.value.reply)
    ElMessage.success('回复成功')
    replyVisible.value = false
    loadData()
  } catch (error) {
    console.error('回复失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.complaints-page {
  padding: 0;
}

.query-form {
  margin-bottom: 20px;
}

.complaint-detail .detail-item {
  margin-bottom: 16px;
  line-height: 1.6;
}

.complaint-detail .label {
  color: #909399;
  display: inline-block;
  width: 100px;
}
</style>
