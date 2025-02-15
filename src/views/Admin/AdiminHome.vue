<template>
    <el-container class="admin-container">
      <el-main>
        <div class="button-container">
          <el-row :gutter="20" justify="center">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" class="button-col">
              <el-button 
                type="primary" 
                size="large" 
                @click="navigateTo('/admin/user-manage')"
                class="admin-button"
              >
                用户管理
              </el-button>
            </el-col>
  
            <el-col :xs="24" :sm="12" :md="8" :lg="6" class="button-col">
              <el-button 
                type="success" 
                size="large" 
                @click="navigateTo('/admin/course-review')"
                class="admin-button"
              >
                课程信息管理
              </el-button>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="6" class="button-col">
              <el-button 
                type="info" 
                size="large" 
                @click="navigateTo('/admin/course-schedule')"
                class="admin-button"
              >
                课程发布
              </el-button>
            </el-col>
     
            <el-col :xs="24" :sm="12" :md="8" :lg="6" class="button-col">
              <el-button 
                type="warning" 
                size="large" 
                @click="navigateTo('/admin/attendance-report')"
                class="admin-button"
              >
                考勤管理
              </el-button>
            </el-col>
  
            <el-col :xs="24" :sm="12" :md="8" :lg="6" class="button-col">
              <el-button 
                type="danger" 
                size="large" 
                @click="navigateTo('/admin/volunteer-manage')"
                class="admin-button"
              >
                志愿服务管理
              </el-button>
            </el-col>
  
           
          </el-row>
        </div>
      </el-main>
    </el-container>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const navigateTo = (path) => {
    router.push(path)
  }
  </script>
  
  <style scoped>
  .admin-container {
    height: 100vh;
    padding: 20px;
  }
  
  .button-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .button-col {
    margin-bottom: 20px;
    padding: 10px;
  }
  
  .admin-button {
    width: 100%;
    height: 100px;
    font-size: 18px;
    letter-spacing: 2px;
    transition: all 0.3s ease;
  }
  
  .admin-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    .admin-button {
      height: 80px;
      font-size: 16px;
    }
  }
  </style>