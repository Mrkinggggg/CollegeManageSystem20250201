<template>
  <div class="edit-profile-container">
    <el-card class="edit-profile-card">
      <template #header>
        <div class="edit-profile-title">编辑个人信息</div>
      </template>
      <el-form
        :model="userInfo"
        :rules="rules"
        ref="userForm"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userInfo.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="phone">
          <el-input
            v-model="userInfo.phone"
            placeholder="请输入电话号码"
            maxlength="11"
          ></el-input>
        </el-form-item>
        <el-form-item label="居住地址" prop="address">
          <el-input
            v-model="userInfo.address"
            placeholder="请输入居住地址"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">
            保存修改
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditProfile',
  data() {
    return {
      userInfo: {
        name: '',
        phone: '',
        address: '',
      },
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
        ],
        phone: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          {
            pattern: /^[0-9]{11}$/,
            message: '电话号码格式不正确',
            trigger: 'blur',
          },
        ],
        address: [
          { required: true, message: '请输入居住地址', trigger: 'blur' },
        ],
      },
    };
  },
  mounted() {
    this.loadUserInfo();
  },
  methods: {
    async loadUserInfo() {
      try {
      
        const response = await axios.get('/api/user-info');
      
        this.userInfo = response.data.message;
      } catch (error) {
        console.error('加载用户信息失败:', error);
        this.$message.error('加载用户信息失败');
      }
    },
    handleSubmit() {
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          try {
           
            await axios.post('/api/update-user-info', this.userInfo);
            this.$message.success('个人信息更新成功');
  
            this.$router.push('/student/profile');
          } catch (error) {
            console.error('更新个人信息失败:', error);
            this.$message.error('更新个人信息失败');
          }
        } else {
          this.$message.error('请完善表单信息');
          return false;
        }
      });
    },
    handleCancel() {
      this.$router.push('/student/profile');
    },
  },
};
</script>

<style scoped lang="scss">
.edit-profile-container {
  max-width: 600px;
  margin: 2rem auto;
}

.edit-profile-card {
  padding: 2rem;
}

.edit-profile-title {
  font-size: 1.5rem;
  color: #2c3e50;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-button + .el-button {
  margin-left: 10px;
}
</style>
