<template>
  <div class="feedback-review-container">
    <div class="filter-toolbar">
      <el-select
        v-model="selectedCourse"
        placeholder="全部课程"
        clearable
        class="course-filter"
      >
        <el-option
          v-for="course in courseOptions"
          :key="course.courseId"
          :label="course.courseName"
          :value="course.courseId"
        />
      </el-select>

      <el-radio-group v-model="sortType" @change="handleSortChange">
        <el-radio-button label="time">按时间排序</el-radio-button>
        <el-radio-button label="rating">按评分排序</el-radio-button>
      </el-radio-group>
    </div>

    <el-table
      :data="filteredFeedbacks"
      v-loading="loading"
      stripe
      style="width: 100%"
      empty-text="暂无评价数据"
    >
      <el-table-column prop="courseName" label="课程名称" width="200" />
      <el-table-column label="评分" width="200">
        <template #default="{ row }">
          <div class="rating-display">
            <el-rate
              v-model="row.rating"
              disabled
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              show-score
              score-template="{value} 分"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="评价内容">
        <template #default="{ row }">
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
          >
            <template #reference>
              <div class="content-preview">
                {{ truncateContent(row.content) }}
              </div>
            </template>
            <div class="full-content">
              <p>{{ row.content }}</p>
              <div class="feedback-meta">
                <span class="time">{{ formatTime(row.createdAt) }}</span>
              </div>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="totalItems"
      layout="total, prev, pager, next"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const API = {
  getFeedbacks: '/api/feedback'
}

const feedbacks = ref([])
const loading = ref(false)
const selectedCourse = ref('')
const sortType = ref('time')
const currentPage = ref(1)
const pageSize = ref(10)

const courseOptions = computed(() => {
  const courses = new Map()
  feedbacks.value.forEach(f => {
    if (!courses.has(f.courseId)) {
      courses.set(f.courseId, {
        courseId: f.courseId,
        courseName: f.courseName
      })
    }
  })
  return Array.from(courses.values())
})

const filteredFeedbacks = computed(() => {
  let result = feedbacks.value

  if (selectedCourse.value) {
    result = result.filter(f => f.courseId === selectedCourse.value)
  }

  if (sortType.value === 'time') {
    result = [...result].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  } else {
    result = [...result].sort((a, b) => b.rating - a.rating)
  }

  const start = (currentPage.value - 1) * pageSize.value
  return result.slice(start, start + pageSize.value)
})

const totalItems = computed(() => {
  return filteredFeedbacks.value.length
})

onMounted(() => {
  loadFeedbacks()
})

const loadFeedbacks = async () => {
  try {
    loading.value = true
    const response = await axios.get(API.getFeedbacks)
    feedbacks.value = response.data
  } catch (error) {
    ElMessage.error('评价数据加载失败')
  } finally {
    loading.value = false
  }
}

const truncateContent = (text) => {
  return text.length > 60 ? text.substring(0, 60) + '...' : text
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const handleSortChange = () => {
  currentPage.value = 1
}
</script>

<style scoped lang="scss">
.feedback-review-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .filter-toolbar {
    margin-bottom: 20px;
    display: flex;
    gap: 20px;

    .course-filter {
      width: 300px;
    }
  }

  .rating-display {
    display: flex;
    align-items: center;

    :deep(.el-rate) {
      display: flex;
      align-items: center;
    }
  }

  .content-preview {
    color: #666;
    cursor: pointer;
    line-height: 1.6;
  }

  .full-content {
    p {
      margin: 0;
      line-height: 1.8;
    }

    .feedback-meta {
      margin-top: 10px;
      color: #909399;
      font-size: 0.9em;
    }
  }

  .pagination {
    margin-top: 20px;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .filter-toolbar {
    flex-direction: column;
  }
}
</style>