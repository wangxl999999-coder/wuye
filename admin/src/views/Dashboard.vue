<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalEvents }}</div>
              <div class="stat-label">待处理事件</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67C23A">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.unpaidFees }}</div>
              <div class="stat-label">待缴物业费</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E6A23C">
              <el-icon><Tools /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingRepairs }}</div>
              <div class="stat-label">待处理报修</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #F56C6C">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalTenants }}</div>
              <div class="stat-label">租户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :lg="12" class="mb-4">
        <el-card title="事件类型分布">
          <div ref="eventChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :lg="12" class="mb-4">
        <el-card title="最近事件">
          <el-table :data="recentEvents" style="width: 100%">
            <el-table-column prop="title" label="事件标题" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :lg="24">
        <el-card title="快捷入口">
          <div class="quick-actions">
            <div class="action-item" @click="$router.push('/events')">
              <el-icon :size="32" color="#409EFF"><Bell /></el-icon>
              <span>事件管理</span>
            </div>
            <div class="action-item" @click="$router.push('/fees')">
              <el-icon :size="32" color="#67C23A"><Money /></el-icon>
              <span>物业费</span>
            </div>
            <div class="action-item" @click="$router.push('/repairs')">
              <el-icon :size="32" color="#E6A23C"><Tools /></el-icon>
              <span>报修管理</span>
            </div>
            <div class="action-item" @click="$router.push('/announcements')">
              <el-icon :size="32" color="#F56C6C"><Promotion /></el-icon>
              <span>公告管理</span>
            </div>
            <div v-if="userStore.userInfo?.role === 'admin'" class="action-item" @click="$router.push('/users')">
              <el-icon :size="32" color="#909399"><User /></el-icon>
              <span>用户管理</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'
import { getEvents } from '@/api/events'

const userStore = useUserStore()
const eventChart = ref(null)

const stats = ref({
  totalEvents: 0,
  unpaidFees: 0,
  pendingRepairs: 0,
  totalTenants: 0
})

const recentEvents = ref([])

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

const initChart = () => {
  if (!eventChart.value) return
  
  const chart = echarts.init(eventChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '事件类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 15, name: '租约到期', itemStyle: { color: '#F56C6C' } },
          { value: 8, name: '通行证待审', itemStyle: { color: '#E6A23C' } },
          { value: 12, name: '车辆延期', itemStyle: { color: '#409EFF' } },
          { value: 6, name: '签名不全', itemStyle: { color: '#67C23A' } },
          { value: 5, name: '其他', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }
  chart.setOption(option)
  
  window.addEventListener('resize', () => chart.resize())
}

const loadData = async () => {
  try {
    const res = await getEvents({ status: 'pending', limit: 10 })
    recentEvents.value = res.events || []
    stats.value.totalEvents = recentEvents.value.length
    
    stats.value.unpaidFees = 28
    stats.value.pendingRepairs = 12
    stats.value.totalTenants = 156
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  initChart()
  loadData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.stat-info {
  margin-left: 16px;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 30px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.action-item:hover {
  background: #f5f7fa;
  transform: translateY(-2px);
}

.action-item span {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}

.mt-4 {
  margin-top: 20px;
}

.mb-4 {
  margin-bottom: 20px;
}
</style>
