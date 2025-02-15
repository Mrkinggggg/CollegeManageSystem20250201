<template>
  <div class="user-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>学生管理</span>
          <el-button type="primary" @click="openDialog('student')">添加学生</el-button>
        </div>
      </template>
      
      <el-table :data="students" v-loading="loading.student">
        <el-table-column prop="id" label="学号" width="180" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="address" label="住址" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="editUser(row, 'student')">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteUser(row.id, 'student')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.student.page"
        v-model:page-size="pagination.student.limit"
        :total="pagination.student.total"
        @current-change="loadStudents"
        layout="prev, pager, next"
      />
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教师管理</span>
          <el-button type="primary" @click="openDialog('teacher')">添加教师</el-button>
        </div>
      </template>

      <el-table :data="teachers" v-loading="loading.teacher">
        <el-table-column prop="id" label="教师编号" width="180" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="address" label="住址" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="editUser(row, 'teacher')">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteUser(row.id, 'teacher')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.teacher.page"
        v-model:page-size="pagination.teacher.limit"
        :total="pagination.teacher.total"
        @current-change="loadTeachers"
        layout="prev, pager, next"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="`${dialogType === 'student' ? '学生' : '教师'}信息`">
      <el-form :model="formData" :rules="rules" ref="formRef">
        <el-form-item v-if="dialogType === 'student'" label="学号" prop="id" v-show="!!currentEditId">
          <el-input v-model="formData.id" :disabled="!!currentEditId" />
        </el-form-item>
        <el-form-item v-else label="教师编号" prop="id" v-show="!!currentEditId">
          <el-input v-model="formData.id" :disabled="!!currentEditId" />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        
        <el-form-item label="住址" prop="address" v-show="!!currentEditId">
          <el-input v-model="formData.address" />
        </el-form-item>
      </el-form>
      <el-alert 
        type="info"
        title="新账号默认密码：123456"
        show-icon
        class="default-password-alert"
      />

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(dialogType)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const students = ref([])
const teachers = ref([])

const loading = reactive({
  student: false,
  teacher: false
})

const pagination = reactive({
  student: { page: 1, limit: 10, total: 0 },
  teacher: { page: 1, limit: 10, total: 0 }
})

const dialogVisible = ref(false)
const dialogType = ref('student')
const currentEditId = ref(null)
const formRef = ref(null)
const formData = reactive({
  id: '',
  name: '',
  phone: '',
  address: ''
})

const rules = {
  studentId: [{ required: true, message: '学号不能为空', trigger: 'blur' }],
  teacherId: [{ required: true, message: '教师编号不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  phone: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    
  ]
}

onMounted(() => {
  loadStudents()
  loadTeachers()
})

const loadStudents = async () => {
  try {
    loading.student = true
    const res = await axios.get(
      `/admin/user/student/${pagination.student.limit}/${pagination.student.page-1}`
    )
    students.value = res.data.data
    pagination.student.total = res.data.total
  } catch (error) {
    ElMessage.error('加载学生数据失败')
  } finally {
    loading.student = false
  }
}

const loadTeachers = async () => {
  try {
    loading.teacher = true
    const res = await axios.get(
      `/admin/user/teacher/${pagination.teacher.limit}/${pagination.teacher.page-1}`
    )
    teachers.value = res.data.data
    pagination.teacher.total = res.data.total
  } catch (error) {
    ElMessage.error('加载教师数据失败')
  } finally {
    loading.teacher = false
  }
}


const openDialog = (type) => {
  dialogType.value = type
  dialogVisible.value = true
  currentEditId.value = null
  resetForm()
}

const editUser = (row, type) => {
  dialogType.value = type
  currentEditId.value = row.id
  Object.assign(formData, row)
  dialogVisible.value = true
// console.log(formData)
}

const submitForm = async (type) => {
  await formRef.value.validate()
  
  try {
    console.log(formData)
    const isEdit = !!currentEditId.value
    const url =  `/admin/user${isEdit ? `/${currentEditId.value}` : ''}`
       
    const method = isEdit ? 'put' : 'post'
    
    const payload = { ...formData }

    if (!payload.id) {
      delete payload.id
      payload.role = type
    }

    await axios[method](url, payload)
    ElMessage.success(`${isEdit ? '更新' : '添加'}成功`)
    dialogVisible.value = false
    dialogType.value === 'student' ? loadStudents() : loadTeachers()
  } catch (error) {
    ElMessage.error('操作失败')
    console.log(error)
  }
}

const deleteUser = async (id, type) => {
  try {
    await ElMessageBox.confirm('确认删除该用户？', '警告', { type: 'warning' })
    await axios.delete(`/admin/user/${id}`)
    ElMessage.success('删除成功')
    type === 'student' ? loadStudents() : loadTeachers()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
    console.log(error)
  }
}

const resetForm = () => {

  formData.name = ''
  formData.phone = ''
  formData.address = ''
  formData.password = '123456'
}
</script>

<style scoped>
.user-management {
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
.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>