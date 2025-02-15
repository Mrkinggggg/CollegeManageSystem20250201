<template>
  <div class="course-enrollment-container">
    <div class="filter-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索课程名称"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><search /></el-icon>
        </template>
      </el-input>

      <el-select 
        v-model="selectedCredit" 
        placeholder="学分筛选" 
        clearable
        class="filter-select"
      >
        <el-option
          v-for="credit in creditOptions"
          :key="credit"
          :label="`${credit} 学分`"
          :value="credit"
        />
      </el-select>
    </div>

    <el-table 
      :data="filteredCourses"
      stripe
      style="width: 100%"
      class="course-table"
      @row-click="handleRowClick"
    >
      <el-table-column prop="id" label="课程编号" width="120" />
      <el-table-column prop="courseName" label="课程名称" width="180" />
      <el-table-column prop="teacherName" label="授课教师" width="120" />
      <el-table-column prop="classTerm" label="开课学期" width="150" />
      <el-table-column label="上课时间" width="150">
        <template #default="{ row }">
          {{ row.classDay}}
        </template>
      </el-table-column>
      <el-table-column prop="location" label="上课地点" width="120" />
      <el-table-column prop="credit" label="学分" width="80" />
      <el-table-column label="容量" width="120">
        <template #default="{ row }">
          <el-progress 
            :percentage="(row.enroll / row.capacity) * 100" 
            :format="() => `${row.enroll}/${row.capacity}`"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            :disabled="isCourseSelected(row) || isCourseFull(row) "
            @click.stop="handleEnroll(row)"
          >
            {{ isCourseSelected(row) ? '已选' : '报名' }}
          </el-button>
          <!-- <div v-if="hasTimeConflict(row)" class="conflict-tip">
            <el-icon><warning /></el-icon>
            <span>时间冲突</span>
          </div> -->
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="totalCourses"
      layout="total, prev, pager, next"
      class="pagination"
    />

    <div class="selected-courses">
      <h3 class="panel-title">已选课程（{{ selectedCourses.length }}门）</h3>
      <el-table :data="selectedCourses" style="width: 100%">
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="handleWithdraw(row)"
            >
              退选
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="课程详情" v-model="dialogVisible" width="50%">
      <div v-if="currentCourse">
        <p><strong>课程编号：</strong>{{ currentcourse.id }}</p>
        <p><strong>课程名称：</strong>{{ currentCourse.courseName }}</p>
        <p><strong>授课教师：</strong>{{ currentCourse.teacherName }}</p>
        <p><strong>开课学期：</strong>{{ currentCourse.classTerm }}</p>
        <p><strong>上课时间：</strong>{{ currentCourse.classDay.join(' | ') }}</p>
        <p><strong>上课地点：</strong>{{ currentCourse.location }}</p>
        <p><strong>学分：</strong>{{ currentCourse.credit }}</p>
        <p><strong>容量：</strong>{{ currentCourse.capacity }}</p>
        <p><strong>已选人数：</strong>{{ currentCourse.enrolled }}</p>
        <p><strong>课程描述：</strong>{{ currentCourse.description }}</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Search, Warning } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'CourseEnrollment',
  components: { Search, Warning },
  setup() {
    const searchQuery = ref('')
    const selectedCredit = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(8)
    const creditOptions = [1, 2, 3, 4, 5]
    const allCourses = ref([])       
    const selectedCourses = ref([])  
    const dialogVisible = ref(false) 
    const currentCourse = ref(null)  

    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/t/courses', {
          params: {
            search: searchQuery.value,
            credit: selectedCredit.value,
            page: currentPage.value,
            pageSize: pageSize.value
          }
        })
        allCourses.value = response.data
      } catch (error) {
        console.error('获取课程数据失败:', error)
      }
    }

    const fetchSelectedCourses = async () => {
      try {
        const response = await axios.get('/api/selected-courses')
        selectedCourses.value = response.data.selectedCourses
      } catch (error) {
        console.error('获取已选课程失败:', error)
      }
    }

    const filteredCourses = computed(() => {
      return allCourses.value.filter(course => {
        const matchSearch = course.courseName.includes(searchQuery.value) ||
          course.teacherName.includes(searchQuery.value)
        const matchCredit = selectedCredit.value ? course.credit === selectedCredit.value : true
        return matchSearch && matchCredit
      })
    })

    const totalCourses = computed(() => allCourses.value.length)

    const isCourseSelected = (course) => {
      return selectedCourses.value.some(c => c.id === course.id)
    }

    const isCourseFull = (course) => {
      return course.enrolled >= course.capacity
    }

    // const hasTimeConflict = (targetCourse) => {
    //   return selectedCourses.value.some(selected =>
    //     selected.classDay.some(time => targetCourse.classDay.includes(time))
    //   )
    // }

    const handleEnroll = async (course) => {
      try {
        await axios.post(`/api/enroll/${course.id}`)
        selectedCourses.value.push({ ...course })
        const target = allCourses.value.find(c => c.id === course.id)
        if (target) {
          target.enrolled += 1
        }
      } catch (error) {
        console.error('报名失败:', error)
      }
    }

    const handleWithdraw = async (course) => {
      try {
        console.log(course.id)
        await axios.post(`/api/withdraw/${course.id}`)
        const index = selectedCourses.value.findIndex(c => c.id === course.id)
        if (index > -1) {
          selectedCourses.value.splice(index, 1)
        }
        const target = allCourses.value.find(c => c.id === course.id)
        if (target) {
          target.enrolled -= 1
        }
      } catch (error) {
        console.error('退选失败:', error)
      }
    }

    const handleRowClick = (row) => {
      currentCourse.value = row
      dialogVisible.value = true
    }

    onMounted(() => {
      fetchCourses()
      fetchSelectedCourses()
    })

    return {
      searchQuery,
      selectedCredit,
      currentPage,
      pageSize,
      creditOptions,
      filteredCourses,
      totalCourses,
      selectedCourses,
      isCourseSelected,
      isCourseFull,
      //hasTimeConflict,
      handleEnroll,
      handleWithdraw,
      handleRowClick,
      dialogVisible,
      currentCourse
    }
  }
}
</script>

<style scoped lang="scss">
.course-enrollment-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;

  .filter-section {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .search-input {
      width: 300px;
    }

    .filter-select {
      width: 150px;
    }
  }

  .course-table {
    margin-bottom: 30px;

    :deep(.el-progress__text) {
      font-size: 12px !important;
    }

    .conflict-tip {
      color: #e6a23c;
      font-size: 12px;
      margin-top: 5px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }

  .pagination {
    justify-content: center;
    margin: 20px 0;
  }

  .selected-courses {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;

    .panel-title {
      color: #2c3e50;
      margin-bottom: 15px;
    }
  }
}

@media (max-width: 768px) {
  .course-enrollment-container {
    padding: 10px;

    .filter-section {
      flex-direction: column;

      .search-input,
      .filter-select {
        width: 100%;
      }
    }
  }
}
</style>
