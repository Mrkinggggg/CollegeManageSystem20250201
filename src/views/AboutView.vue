<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
<template>
  <div class="volunteer-activity-container">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">
        <el-icon></el-icon>
        发布新活动
      </el-button>
    </div>

    <!-- 活动表格 -->
    <el-table
      :data="activities"
      v-loading="loading"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="title" label="活动名称" width="220" />
      <el-table-column prop="type" label="活动类型" width="120" />
      <el-table-column label="活动时间" width="220">
        <template #default="{ row }">
          <div class="time-cell">
            <div>{{ formatDate(row.startTime) }}</div>
            <div class="time-range">{{ row.timeRange }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="活动地点" width="150" />
      <el-table-column label="人数状态" width="150">
        <template #default="{ row }">
          <el-progress 
            :percentage="(row.registered / row.capacity) * 100" 
            :format="() => `${row.registered}/${row.capacity}`"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(row.id)"
          >
            删除
          </el-button>
          <el-button
            size="small"
            type="info"
            @click="viewParticipants(row.id)"
          >
            查看报名
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 活动编辑对话框 -->
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
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择活动类型">
            <el-option
              v-for="type in activityTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="活动地点" prop="location">
          <el-input v-model="form.location" />
        </el-form-item>

        <el-form-item label="招募人数" prop="capacity">
          <el-input-number
            v-model="form.capacity"
            :min="1"
            :max="1000"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
          />
        </el-form-item>

        <el-form-item label="注意事项">
          <el-tag
            v-for="(note, index) in form.notes"
            :key="index"
            closable
            @close="removeNote(index)"
            class="note-tag"
          >
            {{ note }}
          </el-tag>
          <el-input
            v-model="newNote"
            placeholder="输入注意事项"
            class="input-new-note"
            @keyup.enter="addNote"
          >
            <template #append>
              <el-button @click="addNote">添加</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitting"
        >
          确认发布
        </el-button>
      </template>
    </el-dialog>

    <!-- 报名学员对话框 -->
    <el-dialog
      v-model="participantDialogVisible"
      title="报名学员"
      width="650px"
    >
      <el-table :data="participants" v-loading="participantLoading">
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="signupTime" label="报名时间" width="180" />
        <el-table-column label="服务时长">
          <template #default="{ row }">
            <el-input-number
              v-model="row.serviceHours"
              :min="0"
              :max="100"
              @change="updateServiceHours(row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const API = {
  getActivities: '/api/volunteer/activities',
  createActivity: '/api/volunteer/activities',
  updateActivity: id => `/api/volunteer/activities/${id}`,
  deleteActivity: id => `/api/volunteer/activities/${id}`,
  getParticipants: id => `/api/volunteer/activities/${id}/participants`,
  updateServiceHours: '/api/volunteer/service-hours'
}

const activities = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const isEditMode = ref(false)
const newNote = ref('')
const participants = ref([])
const participantDialogVisible = ref(false)
const participantLoading = ref(false)

const activityTypes = [
  '环境保护', '社区服务', '教育支持', '医疗协助', '文化传播'
]

const initialForm = () => ({
  id: null,
  title: '',
  type: '',
  timeRange: [],
  location: '',
  capacity: 50,
  description: '',
  notes: []
})

const form = reactive(initialForm())

const rules = reactive({
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' },
    { max: 50, message: '标题不能超过50个字符', trigger: 'blur' }
  ],
  type: { required: true, message: '请选择活动类型', trigger: 'change' },
  timeRange: [
    { required: true, message: '请选择活动时间', trigger: 'change' },
    { validator: (_, value, callback) => {
      if (value[0] >= value[1]) {
        callback(new Error('结束时间必须晚于开始时间'))
      } else {
        callback()
      }
    }, trigger: 'change' }
  ],
  location: { required: true, message: '请输入活动地点', trigger: 'blur' },
  capacity: { required: true, message: '请设置招募人数', trigger: 'blur' }
})

const dialogTitle = computed(() => 
  isEditMode.value ? '编辑志愿活动' : '发布新活动'
)

onMounted(() => {
  loadActivities()
})

const loadActivities = async () => {
  try {
    loading.value = true
    const response = await axios.get(API.getActivities)
    activities.value = response.data.map(activity => ({
      ...activity,
      timeRange: `${formatTime(activity.startTime)} - ${formatTime(activity.endTime)}`
    }))
  } catch (error) {
    ElMessage.error('活动加载失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  Object.assign(form, initialForm())
  isEditMode.value = false
  dialogVisible.value = true
}

const handleEdit = (activity) => {
  Object.assign(form, {
    ...activity,
    timeRange: [activity.startTime, activity.endTime]
  })
  isEditMode.value = true
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该活动吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await axios.delete(API.deleteActivity(id))
    ElMessage.success('删除成功')
    loadActivities()
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

    const payload = {
      ...form,
      startTime: form.timeRange[0],
      endTime: form.timeRange[1]
    }

    if (isEditMode.value) {
      await axios.put(API.updateActivity(form.id), payload)
    } else {
      await axios.post(API.createActivity, payload)
    }

    ElMessage.success(isEditMode.value ? '更新成功' : '发布成功')
    dialogVisible.value = false
    loadActivities()
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

const addNote = () => {
  if (newNote.value) {
    form.notes.push(newNote.value)
    newNote.value = ''
  }
}

const removeNote = (index) => {
  form.notes.splice(index, 1)
}

const viewParticipants = async (id) => {
  try {
    participantLoading.value = true
    const response = await axios.get(API.getParticipants(id))
    participants.value = response.data
    participantDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取报名信息失败')
  } finally {
    participantLoading.value = false
  }
}

const updateServiceHours = async (row) => {
  try {
    await axios.post(API.updateServiceHours, {
      recordId: row.id,
      hours: row.serviceHours
    })
    ElMessage.success('服务时长更新成功')
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const formatDate = (datetime) => {
  return new Date(datetime).toLocaleDateString()
}

const formatTime = (datetime) => {
  return new Date(datetime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped lang="scss">
.volunteer-activity-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .toolbar {
    margin-bottom: 20px;
  }

  .time-cell {
    line-height: 1.4;
    
    .time-range {
      color: #666;
      font-size: 0.9em;
    }
  }

  .note-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }

  .input-new-note {
    width: 300px;
    margin-top: 8px;
  }
}

.participant-table {
  .service-hours-input {
    width: 120px;
  }
}
</style>