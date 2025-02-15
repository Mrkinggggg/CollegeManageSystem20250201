<template>
  <div class="course-manage-container">
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增课程
      </el-button>
    </div>

    <el-table
      :data="courses"
      v-loading="loading"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="课程代码" width="100" />
      <el-table-column prop="courseName" label="课程名称" width="200" />
      <el-table-column prop="classTerm" label="开课学期" width="150">
        <template #default="{ row }">
          <el-tag>{{ row.classTerm }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="classDay" label="上课时间" width="150" />
      <el-table-column prop="location" label="上课地点" width="200" />
      <el-table-column prop="credit" label="学分" width="80" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="100px"
      >

        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" />
        </el-form-item>

        <el-form-item label="开课学期" prop="classTerm">
          <el-select
            v-model="form.classTerm"
            placeholder="请选择学期"
            filterable
          >
            <el-option
              v-for="term in termOptions"
              :key="term"
              :label="term"
              :value="term"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="上课时间" prop="classDay">
          <el-input
            v-model="form.classDay"
            placeholder="格式示例：周一12节，周三34节"
          />
        </el-form-item>

        <el-form-item label="上课地点" prop="location">
          <el-input v-model="form.location" />
        </el-form-item>

        <el-form-item label="学分" prop="credit">
          <el-input-number
            v-model="form.credit"
            :min="1"
            :max="5"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitting"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
      <!-- <div class="bottom-buttons">
        <el-button type="primary" @click="navigateTo('/teacher/course-schedule')">课程安排与发布</el-button>
        <el-button type="success" @click="navigateTo('/teacher/attendance')">考勤管理</el-button>
        <el-button type="warning" @click="navigateTo('/teacher/feedback-review')">课程评价与反馈</el-button>
        <el-button type="info" @click="navigateTo('/teacher/volunteer-activity')">志愿活动管理</el-button>
      </div> -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const API = {
  getCourses: '/api/t/courses',
  createCourse: '/api/t/courses',
  updateCourse: code => `/api/t/courses/${code}`,
  deleteCourse: code => `/api/t/courses/${code}`
}

const courses = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const isEditMode = ref(false)

const initialForm = () => ({
  courseName: '',
  classTerm: '',
  classDay: '',
  location: '',
  credit: 2,
  description: '',
  published: false
})

const form = reactive(initialForm())

const rules = reactive({
  courseName: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { max: 50, message: '课程名称不能超过50个字符', trigger: 'blur' }
  ],
  classTerm: [
    { required: true, message: '请选择开课学期', trigger: 'change' }
  ],
  classDay: [
    { required: true, message: '请输入上课时间', trigger: 'blur' },
    { pattern: /^周[一二三四五六日][0-9]{2}节(，周[一二三四五六日][0-9]{2}节)*$/,
      message: '格式示例：周一12节，周三34节',
      trigger: 'blur' }
  ],
  location: { required: true, message: '请输入上课地点', trigger: 'blur' },
  credit: { required: true, message: '请选择学分', trigger: 'blur' }
})

const termOptions = ref([
  '2024学年(上)',
  '2024学年(下)',
  '2025学年(上)',
  '2025学年(下)'
])

const dialogTitle = computed(() => isEditMode.value ? '编辑课程' : '新增课程')

onMounted(() => {
  loadCourses()
})

const loadCourses = async () => {
  try {
    loading.value = true
    const response = await axios.get(API.getCourses)
    courses.value = response.data
  } catch (error) {
    ElMessage.error('课程加载失败'+ responese.data)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  Object.assign(form, initialForm())
  isEditMode.value = false
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  isEditMode.value = true
  dialogVisible.value = true
}

const handleDelete = async (courseCode) => {
  try {
    await ElMessageBox.confirm('确定要删除该课程吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await axios.delete(API.deleteCourse(courseCode))
    ElMessage.success('删除成功')
    loadCourses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    let response
    if (isEditMode.value) {
      response = await axios.put(API.updateCourse(form.id), form)
      console.log(form)
    } else {
      response = await axios.post(API.createCourse, form)
    }

    ElMessage.success(isEditMode.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    loadCourses()
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
  
}

const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
.course-manage-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .toolbar {
    margin-bottom: 20px;
  }
}

.el-select {
  width: 100%;
}

.bottom-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

</style>