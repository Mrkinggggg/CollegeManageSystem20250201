<template>
  <div class="course-review">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>课程信息管理</span>
          <el-button type="primary" @click="openDialog">创建课程</el-button>
        </div>
      </template>

      <el-table :data="courses" v-loading="loading">
        <el-table-column prop="id" label="课程编号" width="120" />
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="teacherName" label="授课教师" />
        <el-table-column prop="classTerm" label="开课学期" width="150" />
        <el-table-column label="上课时间" width="200">
          <template #default="{ row }">{{ row.classDay.join(' | ') }}</template>
        </el-table-column>
        <el-table-column prop="location" label="上课地点" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="capacity" label="容量" width="80" />
        <el-table-column prop="enroll" label="已选人数" width="100" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="editCourse(row)">审核/编辑</el-button>
            <el-button size="small" type="danger" @click="deleteCourse(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        @current-change="loadCourses"
        layout="prev, pager, next"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="`${isEdit ? '编辑' : '创建'}课程`">
      <el-form :model="formData" :rules="rules" ref="formRef">
        
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="formData.courseName" />
        </el-form-item>

        <el-form-item label="授课教师ID" prop="teacherId">
          <el-input v-model="formData.teacherId" />
        </el-form-item>

        <el-form-item label="开课学期" prop="classTerm">
          <el-select v-model="formData.classTerm">
            <el-option
              v-for="term in termOptions"
              :key="term"
              :label="term"
              :value="term"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="上课时间" prop="classDay">
          <div v-for="(day, index) in formData.classDay" :key="index" class="time-item">
            <el-input v-model="formData.classDay[index]" />
            <el-button
              type="danger"
              circle
              :icon="Delete"
              @click="removeClassTime(index)"
            />
          </div>
          <el-button type="primary" @click="addClassTime">添加时间段</el-button>
        </el-form-item>

        <el-form-item label="上课地点" prop="location">
          <el-input v-model="formData.location" />
        </el-form-item>

        <el-form-item label="学  分" prop="credit">
          <el-input-number v-model="formData.credit" :min="1" :max="8" />
        </el-form-item>

        <el-form-item label="课程容量" prop="capacity">
          <el-input-number v-model="formData.capacity" :min="1" />
        </el-form-item>

        <el-form-item label="课程描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const courses = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const pagination = reactive({
  page: 0,
  limit: 10,
  total: 0
})

const formData = reactive({
  id: '',
  courseName: '',
  teacherName: '',
  teacherId:'',
  classTerm: '',
  classDay: [''],
  location: '',
  credit: 3,
  capacity: 60,
  description: ''
})

const termOptions = [
  '2024学年(上)',
  '2024学年(下)',
  '2023学年(上)',
  '2023学年(下)'
]

const rules = {
  
  courseName: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }],
  teacherId: [{ required: true, message: '授课教师不能为空', trigger: 'blur' }],
  classTerm: [{ required: true, message: '请选择开课学期', trigger: 'change' }],
  location: [{ required: true, message: '上课地点不能为空', trigger: 'blur' }],
  credit: [{ required: true, message: '请选择学分', trigger: 'blur' }],
  capacity: [{ required: true, message: '请设置课程容量', trigger: 'blur' }],
  classDay: [
    { 
      validator: (_, value, callback) => {
        if (value.length === 0 || value.some(v => !v.trim())) {
          callback(new Error('至少需要填写一个有效时间段'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

onMounted(() => {
  loadCourses()
})

const loadCourses = async () => {
  try {
    loading.value = true
    const res = await axios.get(`/admin/courses/${pagination.limit}/${pagination.page}`);

    courses.value = res.data.data.map(course => {
      return {
        ...course,
        
        classDay: course.classDay ? course.classDay.split(/,|，/).map(item => item.trim()) : []
      }
    })
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('加载课程数据失败')
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  dialogVisible.value = true
  isEdit.value = false
  resetForm()
}

const editCourse = (course) => {
  Object.assign(formData, course)
  isEdit.value = true
  dialogVisible.value = true
}

const addClassTime = () => {
  formData.classDay.push('')
}

const removeClassTime = (index) => {
  formData.classDay.splice(index, 1)
}

const submitForm = async () => {
  await formRef.value.validate()
  
  try {
    const payload = { ...formData }
    delete payload.id
    payload.teacherId = payload.teacherId
    delete payload.teacherName
    payload.published = 1
    payload.classDay = formData.classDay.join(',')
    if (isEdit.value) {
      await axios.put(`/admin/courses/${formData.id}`, payload)
    } else {
      await axios.post('/admin/courses', payload)
    }
    ElMessage.success(`${isEdit.value ? '更新' : '创建'}成功`)
    dialogVisible.value = false
    loadCourses()
  } catch (error) {
    ElMessage.error('操作失败请检查信息是否有误')

  }
}

const deleteCourse = async (courseId) => {
  try {
    await ElMessageBox.confirm('确认删除该课程？', '警告', { type: 'warning' })
    await axios.delete(`/admin/courses/${courseId}`)
    ElMessage.success('删除成功')
    loadCourses()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'classDay') {
      formData[key] = ['']
    } else if (typeof formData[key] === 'number') {
      formData[key] = key === 'credit' ? 3 : 60
    } else {
      formData[key] = ''
    }
  })
}
</script>

<style scoped>
.course-review {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.time-item .el-input {
  flex: 1;
  margin-right: 10px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>