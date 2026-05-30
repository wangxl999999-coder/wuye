<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <div class="card-header">
        <span>用户管理</span>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="角色">
          <el-select v-model="queryForm.role" placeholder="请选择" clearable>
            <el-option label="管理员" value="admin" />
            <el-option label="租户" value="tenant" />
            <el-option label="接待" value="reception" />
            <el-option label="维修人员" value="repair" />
            <el-option label="访客" value="visitor" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="users" v-loading="loading" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTag(row.role)">{{ getRoleText(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="building" label="楼栋" width="80" />
        <el-table-column prop="room" label="房间" width="80" />
        <el-table-column prop="created_at" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="userForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="租户" value="tenant" />
            <el-option label="接待" value="reception" />
            <el-option label="维修人员" value="repair" />
            <el-option label="访客" value="visitor" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋">
          <el-input v-model="userForm.building" placeholder="请输入楼栋" />
        </el-form-item>
        <el-form-item label="房间">
          <el-input v-model="userForm.room" placeholder="请输入房间号" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/users'

const loading = ref(false)
const users = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)

const queryForm = ref({
  role: '',
  page: 1,
  limit: 20
})

const userForm = ref({
  username: '',
  password: '',
  name: '',
  phone: '',
  role: 'tenant',
  building: '',
  room: ''
})

const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '新增用户')

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

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUsers(queryForm.value)
    users.value = res.users || []
  } catch (error) {
    console.error('加载用户失败:', error)
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryForm.value = { role: '', page: 1, limit: 20 }
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  userForm.value = {
    username: '',
    password: '',
    name: '',
    phone: '',
    role: 'tenant',
    building: '',
    room: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  userForm.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateUser(userForm.value.id, userForm.value)
      ElMessage.success('更新成功')
    } else {
      await createUser(userForm.value)
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
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteUser(row.id)
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
.users-page {
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
