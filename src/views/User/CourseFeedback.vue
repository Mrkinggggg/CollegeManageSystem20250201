<template>
  <div class="course-feedback-container">
    <el-card class="feedback-form">
      <template #header>
        <div class="form-header">
          <h3>课程评价提交</h3>
          <el-alert
            title="您的评价将帮助改进教学质量"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
      </template>

      <el-form 
        :model="feedbackForm" 
        :rules="formRules"
        ref="feedbackFormRef"
        label-position="top"
      >
        <el-form-item label="选择课程" prop="courseId">
          <el-select
            v-model="feedbackForm.courseId"
            placeholder="请选择要评价的课程"
            filterable
            class="full-width"
          >
            <el-option
              v-for="course in enrolledCourses"
              :key="course.id"
              :label="course.courseName"
              :value="course.id"
              :disabled="hasFeedback(course.id)"
            >
              <span>{{ course.courseName }}</span>
              <span v-if="hasFeedback(course.id)" class="option-tag">
                <el-tag size="mini" type="success">已评价</el-tag>
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="课程评分" prop="rating">
          <el-rate
            v-model="feedbackForm.rating"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            show-text
            :texts="['较差', '一般', '良好', '优秀', '非常棒']"
          />
        </el-form-item>

        <el-form-item label="详细评价" prop="content">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="5"
            placeholder="请详细描述您的课程体验（建议100-500字）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="submitFeedback"
            :loading="submitting"
          >
            提交评价
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="feedback-history">
      <template #header>
        <div class="history-header">
          <h3>历史评价记录（{{ feedbackList.length }}条）</h3>
          <el-button type="text" @click="toggleHistoryExpand">
            {{ showAllHistory ? '收起' : '展开全部' }}
          </el-button>
        </div>
      </template>

      <el-table
        :data="showAllHistory ? feedbackList : recentFeedback"
        style="width: 100%"
        empty-text="暂无评价记录"
      >
        <el-table-column prop="courseName" label="课程名称" width="180" />
        <el-table-column label="评分" width="200">
          <template #default="{ row }">
            <el-rate
              v-model="row.rating"
              disabled
              show-score
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              score-template="{value} 分"
            />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容">
          <template #default="{ row }">
            <div class="feedback-content">
              {{ row.content }}
              <div class="feedback-meta">
                <span class="time">{{ formatTime(row.createdAt) }}</span>
                <el-tag v-if="row.isAnonymous" size="mini" type="info">
                  匿名
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="mini" @click="editFeedback(row)">
              编辑
            </el-button>
            <!-- <el-button size="mini" type="danger" @click="deleteFeedback(row.id)">
              删除
            </el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showEditDialog" title="编辑评价" width="600px">
      <el-form :model="editingFeedback" :rules="formRules" ref="editFormRef">
        <el-form-item label="课程评分" prop="rating">
          <el-rate
            v-model="editingFeedback.rating"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
          />
        </el-form-item>

        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="editingFeedback.content"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="匿名评价">
          <el-switch v-model="editingFeedback.isAnonymous" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit" :loading="submitting">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

export default {
  setup() {

    const feedbackForm = reactive({
      courseId: '',
      rating: 0,
      content: '',
    })

    const formRules = {
      courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
      rating: [
        { required: true, message: '请选择评分', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            if (value < 1) {
              callback(new Error('请至少选择1星评分'))
            } else {
              callback()
            }
          },
          trigger: 'change'
        }
      ],
      content: [
        { required: true, message: '请输入评价内容', trigger: 'blur' },
        { min: 10, message: '评价内容至少10个字符', trigger: 'blur' }
      ]
    }

    const enrolledCourses = ref([])
    const feedbackList = ref([])

    const fetchEnrolledCourses = async () => {
      try {
        const response = await axios.get('/api/selected-courses')
        enrolledCourses.value = response.data.selectedCourses
        console.log(enrolledCourses.value)
      } catch (error) {
        console.error('获取已选课程失败:', error)
      }
    }

    const fetchFeedbackList = async () => {
      try {
        const response = await axios.get('/api/feedback')
        feedbackList.value = response.data
        console.log(feedbackList.value)
      } catch (error) {
        console.error('获取课程评价信息失败:', error)
      }
    }

    onMounted(() => {
      fetchEnrolledCourses()
      fetchFeedbackList()
    })

    const recentFeedback = computed(() => feedbackList.value.slice(0, 3))
    const hasFeedback = (courseId) => {
      return feedbackList.value.some(f => f.courseId == courseId)
    }

    const feedbackFormRef = ref(null)
    const editFormRef = ref(null)

    const submitting = ref(false)
    const submitFeedback = async () => {
      try {
        await feedbackFormRef.value.validate()
        submitting.value = true
        const response = await axios.post('/api/feedback', feedbackForm)
      
        feedbackList.value.unshift(response.data)
        
        resetForm()
        ElMessage.success('评价提交成功')
      } catch (error) {
        console.error('提交评价失败:', error)
        ElMessage.error('提交评价失败')
      } finally {
        submitting.value = false
      }
    }

    const resetForm = () => {
      feedbackFormRef.value.resetFields()
    }

    const showAllHistory = ref(false)
    const toggleHistoryExpand = () => {
      showAllHistory.value = !showAllHistory.value
    }

    const showEditDialog = ref(false)
    const editingFeedback = reactive({
      id: '',
      courseId: '',
      courseName: '',
      rating: 0,
      content: '',
      createdAt: ''
    })
    const editFeedback = (feedback) => {
      Object.assign(editingFeedback, feedback)
      showEditDialog.value = true
    }

    const confirmEdit = async () => {
      try {
        await editFormRef.value.validate()
        submitting.value = true
        const response = await axios.put(
          `/api/feedback/${editingFeedback.id}`,
          editingFeedback
        )
        const index = feedbackList.value.findIndex(f => f.id === editingFeedback.id)
        if (index > -1) {
          feedbackList.value.splice(index, 1, response.data)
        }
        ElMessage.success('修改成功')
        showEditDialog.value = false
      } catch (error) {
        console.error('修改反馈失败:', error)
        ElMessage.error('修改反馈失败')
      } finally {
        submitting.value = false
      }
    }

    const deleteFeedback = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这条评价吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await axios.delete(`/api/feedback/${id}`)
        feedbackList.value = feedbackList.value.filter(f => f.id !== id)
        ElMessage.success('删除成功')
      } catch (error) {
        console.error('删除反馈失败:', error)
      }
    }

    const formatTime = (date) => {
      return new Date(date).toLocaleString()
    }

    return {
      feedbackForm,
      formRules,
      enrolledCourses,
      feedbackList,
      recentFeedback,
      showAllHistory,
      showEditDialog,
      editingFeedback,
      submitting,
      hasFeedback,
      submitFeedback,
      resetForm,
      toggleHistoryExpand,
      editFeedback,
      confirmEdit,
      deleteFeedback,
      formatTime,
      feedbackFormRef,
      editFormRef
    }
  }
}
</script>

<style scoped lang="scss">
.course-feedback-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;

  .feedback-form {
    margin-bottom: 24px;

    .form-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .full-width {
    width: 100%;
  }

  .option-tag {
    margin-left: 10px;
  }

  .feedback-history {
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .feedback-content {
    line-height: 1.6;

    .feedback-meta {
      margin-top: 8px;
      color: #909399;
      font-size: 0.9em;

      .time {
        margin-right: 10px;
      }
    }
  }
}

@media (max-width: 768px) {
  .course-feedback-container {
    padding: 10px;

    .form-header {
      flex-direction: column;
      align-items: flex-start !important;

      h3 {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
