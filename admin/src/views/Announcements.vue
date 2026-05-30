<template>
  <div class="announcements-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>公告管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            发布公告
          </el-button>
        </div>
      </template>

      <el-table :data="announcements" v-loading="loading" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="title" label="公告标题" min-width="250">
          <template #default="{ row }">
            <el-tag v-if="row.priority === 'high'" type="danger" size="small">重要</el-tag>
            <span style="margin-left: 8px;">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="creator_name" label="发布人" width="100" />
        <el-table-column prop="created_at" label="发布时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑公告' : '发布公告'" width="600px">
      <el-form :model="announcementForm" label-width="100px">
        <el-form-item label="公告标题">
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告类型">
          <el-select v-model="announcementForm.type" placeholder="请选择">
            <el-option label="通知" value="notice" />
            <el-option label="活动" value="activity" />
            <el-option label="紧急" value="emergency" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="announcementForm.priority">
            <el-option label="普通" value="normal" />
            <el-option label="重要" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="公告内容">
          <el-input 
            v-model="announcementForm.content" 
            type="textarea" 
            :rows="6" 
            placeholder="请输入公告内容" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="公告详情" width="600px">
      <div v-if="currentAnnouncement" class="announcement-detail">
        <h3 class="detail-title">{{ currentAnnouncement.title }}</h3>
        <div class="detail-meta">
          <span>发布人：{{ currentAnnouncement.creator_name }}</span>
          <span>发布时间：{{ currentAnnouncement.created_at }}</span>
        </div>
        <div class="detail-content">{{ currentAnnouncement.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAnnouncements, getAnnouncementDetail, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/api/announcements'

const loading = ref(false)
const announcements = ref([])
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentAnnouncement = ref(null)

const announcementForm = ref({
  title: '',
  type: 'notice',
  priority: 'normal',
  content: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAnnouncements()
    announcements.value = res.announcements || []
  } catch (error) {
    console.error('加载公告失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  announcementForm.value = {
    title: '',
    type: 'notice',
    priority: 'normal',
    content: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  announcementForm.value = { ...row }
  dialogVisible.value = true
}

const handleView = async (row) => {
  try {
    const res = await getAnnouncementDetail(row.id)
    currentAnnouncement.value = res.announcement
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateAnnouncement(announcementForm.value.id, announcementForm.value)
      ElMessage.success('更新成功')
    } else {
      await createAnnouncement(announcementForm.value)
      ElMessage.success('发布成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该公告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteAnnouncement(row.id)
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
.announcements-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.announcement-detail {
  padding: 10px 0;
}

.detail-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.detail-content {
  line-height: 1.8;
  color: #303133;
}
</style>
