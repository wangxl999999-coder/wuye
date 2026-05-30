<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <el-col :lg="8">
        <el-card>
          <div class="user-info-card">
            <el-avatar :size="80" icon="UserFilled" />
            <h2 class="username">{{ userStore.userInfo?.name }}</h2>
            <el-tag :type="getRoleTag(userStore.userInfo?.role)" size="large">{{ getRoleText(userStore.userInfo?.role) }}</el-tag>
          </div>
          <el-divider />
          <div class="info-list">
            <div class="info-item">
            <span class="label">用户名：</span>
            <span>{{ userStore.userInfo?.username }}</span>
            </div>
            <div class="info-item">
            <span class="label">手机号：</span>
            <span>{{ userStore.userInfo?.phone || '未设置' }}</span>
            </div>
            <div class="info-item" v-if="userStore.userInfo?.building">
            <span class="label">楼栋：</span>
            <span>{{ userStore.userInfo?.building }}</span>
            </div>
            <div class="info-item" v-if="userStore.userInfo?.room">
            <span class="label">房间：</span>
            <span>{{ userStore.userInfo?.room }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="16">
        <el-card title="编辑资料">
          <el-form :model="profileForm" label-width="100px">
            <el-form-item label="姓名">
              <el-input v-model="profileForm.name" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const profileForm = ref({
  name: '',
  phone: ''
})

const getRoleTag = (role) => {
  const tags = {
    admin: 'danger',
    tenant: 'primary',
    reception: 'success',
    repair: 'warning',
    visitor: 'info'
  }
  return tags[role] || 'info'
}

const getRoleText = (role) => {
  const texts = {
    admin: '管理员',
    tenant: '租户',
    reception: '接待',
    repair: '维修人员',
    visitor: '访客'
  }
  return texts[role] || role
}

const handleSave = () => {
  ElMessage.success('保存成功')
}

onMounted(() => {
  if (userStore.userInfo) {
    profileForm.value.name = userStore.userInfo.name
    profileForm.value.phone = userStore.userInfo.phone
  }
})
</script>

<style scoped>
.profile-page {
  padding: 0;
}

.user-info-card {
  text-align: center;
  padding: 20px 0;
}

.username {
  margin: 16px 0 8px;
  color: #303133;
}

.info-list {
  line-height: 2.5;
}

.info-item .label {
  color: #909399;
  display: inline-block;
  width: 80px;
}
</style>
