<template>
  <div class="retrieve-container">
    <el-card class="retrieve-box">
      <template #header>
        <div class="retrieve-title">找回密码</div>
      </template>
      <el-form @submit.prevent="handleRetrieve" :model="retrieveForm">
        <el-form-item label="账号">
          <el-input v-model="retrieveForm.username" placeholder="请输入账号" required />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="retrieveForm.email" type="email" placeholder="请输入注册时的邮箱" required />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="retrieve-button" native-type="submit">找回密码</el-button>
        </el-form-item>
      </el-form>
      <div class="back-to-login">
        <span>返回</span>
        <el-link type="primary" :underline="false" @click="$router.push('/login')">登录</el-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      retrieveForm: {
        username: '',
        email: ''
      }
    };
  },
  methods: {
    handleRetrieve() {
      if (!this.retrieveForm.username || !this.retrieveForm.email) {
        ElMessage.warning("请填写完整信息");
        return;
      }
      ElMessage.success("如果您的账号匹配，我们将发送重置密码的链接到您的邮箱");
      // 
    }
  }
};
</script>

<style scoped>
.retrieve-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.retrieve-box {
  width: 350px;
  padding: 20px;
}

.retrieve-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.retrieve-button {
  width: 100%;
}

.back-to-login {
  margin-top: 10px;
  text-align: center;
}
</style>