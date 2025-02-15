<template>
  <div class="register-container">
    <el-card class="register-box">
      <template #header>
        <div class="register-title">注册</div>
      </template>
      <el-form @submit.prevent="handleRegister" :model="registerForm">
        <el-form-item label="姓名">
          <el-input v-model="registerForm.name" placeholder="请输入真实姓名" required />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" required />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="registerForm.password" 
                   type="password" 
                   placeholder="请输入密码（6-20位字符）" 
                   required 
                   show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="registerForm.confirmPassword" 
                   type="password" 
                   placeholder="请再次输入密码" 
                   required 
                   show-password />
        </el-form-item>
        <el-form-item label="身份">
          <el-select v-model="registerForm.role" placeholder="请选择身份" >
            <el-option label="学生" value="student"></el-option>
            <el-option label="教师" value="teacher"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            class="register-button" 
            native-type="submit"
            :loading="loading"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-link">
        <span>已有账号？</span>
        <el-link type="primary" :underline="false" @click="$router.push('/login')">登录</el-link>
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
      loading: false,
      registerForm: {
        name: '',      
        phone: '',
        password: '',
        confirmPassword: '',
        role: ''
      }
    };
  },
  methods: {
    async handleRegister() {
      if (!this.registerForm.name || 
          !this.registerForm.phone || 
          !this.registerForm.password || 
          !this.registerForm.confirmPassword) {
        ElMessage.warning("请填写完整信息");
        return;
      }

      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        ElMessage.error("两次输入的密码不一致");
        return;
      }

      try {
        this.loading = true;
        
        const response = await axios.post('/register', {
          name: this.registerForm.name,  
          phone: this.registerForm.phone,
          role: this.registerForm.role,
          password: this.registerForm.password
        });

        if (response.data.status == "success") {
          ElMessage.success(`注册成功，用户ID：${response.data.message}`);
          this.$router.push('/login');
        } else {
          ElMessage.error(response.data.message || '注册失败');
          console.log(error)
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || '请求失败，请检查网络';
        ElMessage.error(errorMsg);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.register-box {
  width: 400px;
}

.register-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}

.register-button {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}
</style>