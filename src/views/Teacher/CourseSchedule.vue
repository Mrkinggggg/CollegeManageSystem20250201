<template>
  <div class="course-schedule-container">
    <el-table
      :data="courses"
      v-loading="loading"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="课程ID" width="120" />
      <el-table-column prop="courseName" label="课程名称" width="180" />
      <el-table-column prop="classTerm" label="学期" width="150" />
      <el-table-column label="上课时间" width="220">
        <template #default="{ row }">
          <el-tag
            v-for="(day, index) in row.classDay"
            :key="index"
            class="time-tag"
          >
            {{ day }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="上课地点" width="150" />
      <el-table-column prop="credit" label="学分" width="80" />
      <el-table-column prop="capacity" label="容量" width="100" />
      <el-table-column label="课程描述">
        <template #default="{ row }">
          <el-popover
            placement="top-start"
            :width="300"
            trigger="hover"
          >
            <template #reference>
              <div class="description-preview">
                {{ truncateDescription(row.description) }}
              </div>
            </template>
            <div class="full-description">{{ row.description }}</div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="发布状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.published ? 'success' : 'info'">
            {{ row.published ? '已发布' : '未发布' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            :disabled="row.published"
            @click="handlePublish(row.id)"
          >
            {{ row.published ? '已发布' : '发布' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="publishDialogVisible"
      title="发布确认"
      width="500px"
    >
      <div class="publish-confirm-content">
        <el-alert
          title="发布后学员将可以查看和报名该课程"
          type="warning"
          :closable="false"
          show-icon
        />
        <div class="course-info">
          <h4>{{ selectedCourse?.courseName }}</h4>
          <p>课程ID：{{ selectedCourse?.id }}</p>
          <p>上课时间：{{ selectedCourse?.classDay.join(', ') }}</p>
          <p>上课地点：{{ selectedCourse?.location }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmPublish"
          :loading="publishing"
        >
          确认发布
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted ,reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const API = {
  getCourses: '/api/t/courses',
  publishCourse: code => `/api/t/courses/${code}`
}

const courses = ref([])
const loading = ref(false)
const publishDialogVisible = ref(false)
const publishing = ref(false)
const selectedCourse = ref(null)
// 保持 courses_o 为 ref 对象
let courses_o = ref([])

onMounted(() => {
  loadCourses()
})

const loadCourses = async () => {
  try {
    loading.value = true
    const response = await axios.get(API.getCourses)
    // 正确赋值：赋给 courses_o.value 而不是 courses_o
    courses_o.value = response.data
    courses.value = response.data.map(course => ({
      ...course,
      published: course.published || false,
      // 如果 classDay 是字符串，则通过英文逗号或中文逗号分割，并去除首尾空格
      classDay: typeof course.classDay === 'string'
        ? course.classDay.split(/,|，/).map(day => day.trim())
        : course.classDay
    }))
    console.log(courses_o.value)
  } catch (error) {
    ElMessage.error('课程加载失败')
  } finally {
    loading.value = false
  }
}

const handlePublish = (courseId) => {
  selectedCourse.value = courses.value.find(c => c.id === courseId)
  publishDialogVisible.value = true
}

const confirmPublish = async () => {
  try {
    publishing.value = true
    
    // 在 courses_o 中查找对应的课程对象，并更新 published 为 true
    const courseToUpdate = courses_o.value.find(course => course.id === selectedCourse.value.id)
    if (courseToUpdate) {
      const targetCourse = courses_o.value.find(c => c.id === selectedCourse.value.id)

      const form = reactive({
      ...targetCourse,
      published: true // 更新 published 字段
    })

      console.log("11111111")
      console.log(form)
      // 发送发布请求
      await axios.put(API.publishCourse(selectedCourse.value.id), form)
     
      // 同时更新 courses 数组中对应课程的 published 状态
      const index = courses.value.findIndex(course => course.id === selectedCourse.value.id)
      if (index > -1) {
        courses.value[index].published = true
      }
      
      ElMessage.success('课程发布成功')
      publishDialogVisible.value = false
    }
  } catch (error) {
    ElMessage.error('发布失败，请稍后重试')
    console.log(error)
  } finally {
    publishing.value = false
  }
}

const truncateDescription = (text) => {
  return text.length > 50 ? text.substring(0, 50) + '...' : text
}
</script>


<style scoped lang="scss">
.course-schedule-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .time-tag {
    margin: 2px;
  }

  .description-preview {
    color: #666;
    cursor: pointer;
  }

  .full-description {
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .publish-confirm-content {
    .course-info {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;

      h4 {
        margin: 0 0 10px 0;
        color: #2c3e50;
      }

      p {
        margin: 5px 0;
        color: #666;
      }
    }
  }
}
</style>