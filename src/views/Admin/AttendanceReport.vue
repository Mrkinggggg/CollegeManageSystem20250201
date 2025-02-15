<template>
  <div class="attendance-container">
    <el-card class="search-card">
      <div class="header">
        <el-select
          v-model="selectedCourseId"
          placeholder="请选择课程"
          filterable
          clearable
          style="width: 300px; margin-right: 20px"
        >
          <el-option
            v-for="course in courseList"
            :key="course.id"
            :label="course.courseName"
            :value="course.id"
          />
        </el-select>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSearch"
        >
          查询考勤信息
        </el-button>
      </div>
    </el-card>

    <el-card v-loading="loading" class="student-list">
      <el-table :data="studentList" border stripe style="width: 100%">
        <el-table-column prop="sid" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="120" />
        <el-table-column label="考勤状态">
          <template #default="{ row }">
            <el-select
              v-model="row.state"
              placeholder="选择状态"
              @change="handleStatusChange(row)"
            >
              <el-option label="出勤" :value="0" />
              <el-option label="缺勤" :value="1" />
              <el-option label="迟到" :value="2" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="handleReset(row)"
            >
              重置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="submit-area">
      <el-button
        type="success"
        size="large"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交考勤信息' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 课程列表数据
const courseList = ref([])
const selectedCourseId = ref('')

// 学生考勤数据
const studentList = ref([])
const originalStudentList = ref([])

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 获取课程列表
const fetchCourses = async () => {
  try {
    const response = await axios.get('/api/attendance/courses')
    courseList.value = response.data
    console.log(response.data)
    console.log(courseList.value)
  } catch (error) {
    ElMessage.error('课程加载失败')
    console.error('课程加载错误:', error)
  }
}

// 查询考勤信息
const handleSearch = async () => {
  if (!selectedCourseId.value) {
    ElMessage.warning('请先选择课程')
    return
  }

  try {
    loading.value = true
    const response = await axios.get(`/api/attendance/${selectedCourseId.value}`)
    studentList.value = response.data.map(item => ({ ...item }))
    originalStudentList.value = response.data.map(item => ({ ...item }))
  } catch (error) {
    ElMessage.error('考勤信息加载失败')
    console.error('考勤信息加载错误:', error)
  } finally {
    loading.value = false
  }
}

// 状态修改处理
const handleStatusChange = (row) => {
  ElMessage.success(`${row.studentName} 状态已修改为 ${getStatusText(row.state)}`)
}

// 重置单个学生状态
const handleReset = (row) => {
  const original = originalStudentList.value.find(s => s.sid === row.sid)
  if (original) {
    row.state = original.state
    ElMessage.success(`${row.studentName} 状态已重置`)
  }
}

// 提交考勤信息
const handleSubmit = async () => {
  try {
    submitting.value = true
    
    // 构建提交数据
    const payload = {
      courseId: selectedCourseId.value,
      students: studentList.value.map(student => ({
        sid: student.sid,
        state: student.state
      }))
    }

    await axios.post('/api/attendance/submit', payload)
    console.log(payload)
    ElMessage.success('考勤信息提交成功')
    // 更新原始数据
    originalStudentList.value = studentList.value.map(item => ({ ...item }))
  } catch (error) {
    ElMessage.error('提交失败')
    console.error('提交错误:', error)
  } finally {
    submitting.value = false
  }
}

// 状态文字转换
const getStatusText = (state) => {
  return {
    0: '出勤',
    1: '缺勤',
    2: '迟到'
  }[state]
}

// 初始化加载课程
onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.attendance-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 20px;
}

.header {
  display: flex;
  align-items: center;
  padding: 15px;
}

.student-list {
  margin-bottom: 20px;
}

.submit-area {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.el-table {
  margin-top: 15px;
}

.el-select {
  width: 150px;
}
</style>