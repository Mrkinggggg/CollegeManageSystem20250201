<template>
  <div class="volunteer-container">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索活动名称或组织方"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
        v-model="selectedType"
        placeholder="全部类型"
        clearable
        class="type-select"
      >
        <el-option
          v-for="type in activityTypes"
          :key="type"
          :label="type"
          :value="type"
        />
      </el-select>
    </div>

    <div class="activity-list">
      <el-card
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="activity-card"
      >
        <template #header>
          <div class="card-header">
            <h3>{{ activity.title }}</h3>
            <el-tag :type="getTagType(activity.type)">
              {{ activity.type }}
            </el-tag>
          </div>
        </template>

        <div class="activity-info">
          <div class="info-item">
            <el-icon><Clock /></el-icon>
            <span>{{ formatDate(activity.startTime) }} - {{ formatDate(activity.endTime) }}</span>
          </div>
          <div class="info-item">
            <el-icon><Location /></el-icon>
            <span>{{ activity.location }}</span>
          </div>
          <div class="info-item">
            <el-icon><User /></el-icon>
            <span>{{ activity.organizer }}</span>
          </div>
          <div class="progress">
            <el-progress
              :percentage="(activity.registered / activity.capacity) * 100"
              :format="() => `${activity.registered}/${activity.capacity}人`"
            />
          </div>
        </div>

        <div class="card-actions">
          <el-button
            type="primary"
            :loading="loadingMap[activity.id]"
            :disabled="isRegistered(activity.id)"
            @click="showDetail(activity)"
          >
            {{ isRegistered(activity.id) ? '已报名' : '查看详情' }}
          </el-button>
        </div>
      </el-card>
    </div>

    <div class="registered-activities" v-if="registeredActivities.length > 0">
      <h3>已报名活动（{{ registeredActivities.length }}个）</h3>
      <el-table :data="registeredActivities" style="width: 100%">
        <el-table-column prop="title" label="活动名称" />
        <el-table-column prop="location" label="活动地点" />
        <el-table-column label="时间" width="220">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }} - {{ formatDate(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="handleCancel(row)"
            >
              取消报名
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="detailVisible"
      :title="selectedActivity.title"
      width="600px"
    >
      <div class="activity-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="活动类型">
            <el-tag :type="getTagType(selectedActivity.type)">
              {{ selectedActivity.type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="活动时间">
            {{ formatDateTime(selectedActivity.startTime) }} - 
            {{ formatDateTime(selectedActivity.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="活动地点">
            {{ selectedActivity.location }}
          </el-descriptions-item>
          <el-descriptions-item label="组织方">
            {{ selectedActivity.organizer }}
          </el-descriptions-item>
          <el-descriptions-item label="当前报名">
            {{ selectedActivity.registered }}/{{ selectedActivity.capacity }}人
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>活动描述</h4>
          <p>{{ selectedActivity.description }}</p>
        </div>

        <div class="detail-section" v-if="selectedActivity.notes?.length">
          <h4>注意事项</h4>
          <ul>
            <li v-for="(note, index) in selectedActivity.notes" :key="index">
              {{ note }}
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关 闭</el-button>
        <el-button
          type="primary"
          :disabled="isRegistered(selectedActivity.id)"
          @click="handleRegister(selectedActivity)"
        >
          {{ isRegistered(selectedActivity.id) ? '已报名' : '立即报名' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

import { Search, Clock, Location, User } from '@element-plus/icons-vue'

const activities = ref([])
const registeredActivities = ref([])
const selectedActivity = ref({})
const detailVisible = ref(false)
const loadingMap = ref({})

const searchKeyword = ref('')
const selectedType = ref('')
const activityTypes = computed(() => [
  ...new Set(activities.value.map(a => a.type))
])

const fetchData = async () => {
  try {
    const [activitiesRes, registeredRes] = await Promise.all([
      axios.get('/api/volunteer_info'),
      axios.get('/api/volunteer/activities')
    ])
    
    activities.value = activitiesRes.data.activities
    registeredActivities.value = registeredRes.data
  } catch (error) {
    ElMessage.error('数据加载失败')
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}

const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString()
}

const isRegistered = (id) => {
  return registeredActivities.value.some(a => a.id === id)
}

const showDetail = (activity) => {
  selectedActivity.value = activity
  detailVisible.value = true
}

const handleRegister = async (activity) => {
  try {
    loadingMap.value[activity.id] = true
    await ElMessageBox.confirm(
      `确定要报名【${activity.title}】吗？`,
      '报名确认',
      { confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    
    await axios.post(`/api/register_activity/${activity.id}`)
    registeredActivities.value.push(activity)
    activity.registered++
    ElMessage.success('报名成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('报名失败')
    }
  } finally {
    loadingMap.value[activity.id] = false
  }
}

const handleCancel = async (activity) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消【${activity.title}】的报名吗？`,
      '取消确认',
      { confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    
    await axios.delete(`/api/register_activity/${activity.id}`)
    registeredActivities.value = registeredActivities.value.filter(a => a.id !== activity.id)
    const target = activities.value.find(a => a.id === activity.id)
    if (target) target.registered--
    ElMessage.success('已取消报名')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    const matchSearch = activity.title.includes(searchKeyword.value) ||
      activity.organizer.includes(searchKeyword.value)
    const matchType = selectedType.value ? 
      activity.type === selectedType.value : true
    return matchSearch && matchType
  })
})

const getTagType = (type) => {
  const typeMap = {
    '环境保护': 'success',
    '社区服务': 'primary',
    '教育支持': 'warning',
    '医疗协助': 'danger'
  }
  return typeMap[type] || 'info'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.volunteer-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;

  .filter-bar {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .search-input {
      width: 300px;
    }

    .type-select {
      width: 150px;
    }
  }

  .activity-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .activity-card {
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .activity-info {
      .info-item {
        display: flex;
        align-items: center;
        margin: 8px 0;
        color: #666;

        .el-icon {
          margin-right: 8px;
          font-size: 16px;
        }
      }

      .progress {
        margin: 16px 0;
      }
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
    }
  }

  .registered-activities {
    margin-top: 40px;

    h3 {
      margin-bottom: 20px;
      color: #666;
    }
  }

  .activity-detail {
    .detail-section {
      margin: 20px 0;

      h4 {
        color: #409eff;
        margin: 15px 0 10px;
      }

      ul {
        padding-left: 20px;
        color: #666;
      }
    }
  }
}

@media (max-width: 768px) {
  .volunteer-container {
    padding: 10px;

    .filter-bar {
      flex-direction: column;

      .search-input,
      .type-select {
        width: 100%;
      }
    }

    .activity-list {
      grid-template-columns: 1fr;
    }
  }
}
</style>