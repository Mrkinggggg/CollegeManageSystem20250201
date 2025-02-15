<template>
  <div class="profile-container">
    <el-card class="profile-section">
      <template #header>
        <div class="profile-title">个人信息管理</div>
      </template>
      <el-form :model="userInfo" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="userInfo.name" readonly />
        </el-form-item>
        <el-form-item label="电话号码">
          <el-input v-model="userInfo.phone" readonly />
        </el-form-item>
        <el-form-item label="居住地址">
          <el-input v-model="userInfo.address" readonly />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="$router.push('/student/edit')">编辑个人信息</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="quick-actions">
      <h3>快捷操作</h3>
      <div class="action-cards">
        <router-link to="/student/course-enrollment" class="action-card enrollment">
          <el-card class="action-card-content">
            <div class="card-content">
              <el-icon><i class="el-icon-notebook-2"></i></el-icon>
              <span>课程报名与选课</span>
            </div>
          </el-card>
        </router-link>
        <router-link to="/student/course-feedback" class="action-card feedback">
          <el-card class="action-card-content">
            <div class="card-content">
              <el-icon><i class="el-icon-chat-line-round"></i></el-icon>
              <span>课程评价与反馈</span>
            </div>
          </el-card>
        </router-link>
        <router-link to="/student/volunteer-service" class="action-card volunteer">
          <el-card class="action-card-content">
            <div class="card-content">
              <el-icon><i class="el-icon-user-solid"></i></el-icon>
              <span>志愿服务报名</span>
            </div>
          </el-card>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ElIcon } from 'element-plus';
import axios from 'axios';

export default {
  name: 'UserProfile',
  components: {
    ElIcon,
  },
  data() {
    return {
      userInfo: {
        name: '',
        phone: '',
        address: '',
      },
    };
  },
  created() {
    this.fetchUserInfo();
  },
  methods: {
    async fetchUserInfo() {
      try {
      
        const response = await axios.get('/api/user-info');
    
        this.userInfo = response.data.message;
        console.log(this.userInfo.username)
      } catch (error) {
        console.error('获取个人信息失败:', error);
      }
    },
  },
  
};

</script>

<style scoped lang="scss">
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 20px;

  .profile-section {
    margin-bottom: 2rem;
  }

  .profile-title {
    font-size: 1.5rem;
    color: #2c3e50;
  }
}

.el-form-item {
  margin-bottom: 20px;
}

.quick-actions {
  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .action-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .action-card {
    text-decoration: none; /* 移除下划线 */
    display: block; /* 使整个卡片可点击 */
    .el-card {
      cursor: pointer;
      transition: transform 0.3s;
      background-color: transparent;

      .card-content {
        display: flex;
        align-items: center;
        gap: 1rem;

        .el-icon {
          font-size: 2rem;
          color: white;
        }

        span {
          font-size: 1.2rem;
          color: white;
        }
      }

      &:hover {
        transform: translateY(-5px);
      }
    }

    /* 设置不同操作卡片的背景颜色 */
    &.enrollment .el-card {
      background-color: #67C23A;
    }
    &.feedback .el-card {
      background-color: #E6A23C;
    }
    &.volunteer .el-card {
      background-color: #F56C6C;
    }
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .action-cards {
    flex-direction: column;
  }
}
</style>
