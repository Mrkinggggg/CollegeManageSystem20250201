<template>
  <div class="login-container">
    <el-card class="login-box">
      <template #header>
        <div class="login-title">登录</div>
      </template>
      <el-form @submit.prevent="handleLogin" :model="loginForm">
        <el-form-item label="身份">
          <el-select v-model="loginForm.role" placeholder="请选择身份">
            <el-option label="学生" value="student"></el-option>
            <el-option label="教师" value="teacher"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="loginForm.phone" placeholder="请输入账号" required />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" required show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" native-type="submit">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="register-link">
        <span>还没有账号？</span>
        <el-link type="primary" :underline="false" @click="$router.push('/register')">注册</el-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import axios from 'axios';

export default {
  data() {
    return {
      loginForm: {
        role: '',
        phone: '',
        password: ''
      }
    };
  },
  methods: {
    async handleLogin() {
      if (!this.loginForm.role || !this.loginForm.phone || !this.loginForm.password) {
        ElMessage.warning("请填写完整信息");
        return;
      }
      
      

      try {
        const response = await axios.post('/login', this.loginForm , {headers:{
          'Content-Type':'application/json'}
        });

        if (response.data.success) {
          if (this.loginForm.role == 'student'){
            ElMessage.success(`以 ${this.loginForm.role} 身份登录成功`);
            this.$router.push('/student/profile');
            console.log(this.loginForm)
          }
          else if (this.loginForm.role == 'teacher'){
            ElMessage.success(`以 ${this.loginForm.role} 身份登录成功`);
            this.$router.push('/teacher/course-manage');
          }else if (this.loginForm.role == 'admin'){
            ElMessage.success(`以 ${this.loginForm.role} 身份登录成功`);
            this.$router.push('/admin_');
          }
        } else {
          ElMessage.error('登录失败：' + response.data.message );
        }
      } catch (error) {
        if (error.response) {
    
          ElMessage.error(`请求错误：${error.response.status} - ${error.response.data.message || '未知错误'}`);
        } else if (error.request) {
         
          ElMessage.error('服务器无响应，请检查网络连接');
          console.error('未收到响应：', error.request);
        } else {
          
          ElMessage.error(`请求失败：${error.message}`);
          console.error('请求错误：', error.message);
        }
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  width: 350px;
  padding: 20px;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
}

.register-link,
.retrieve-password {
  margin-top: 10px;
  text-align: center;
}
</style>