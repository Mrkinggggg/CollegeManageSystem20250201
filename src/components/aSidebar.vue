<template>
    <div class="sidebar">
     
      <div class="menu-buttons">
        <button @click="navigateTo('/admin/user-manage')">用户管理</button>
        <button @click="navigateTo('/admin/course-review')">课程管理</button>
        <button @click="navigateTo('/admin/course-schedule')">课程发布</button>
        <button @click="navigateTo('/admin/attendance-report')">考勤管理</button>
        <button @click="navigateTo('/admin/volunteer-manage')">志愿服务</button>
      </div>
     
      <div class="logout-button">
        <button @click="handleLogout">退出登录</button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'Sidebar',
    methods: {
     
      navigateTo(path) {
        this.$router.push(path);
      },
     
      handleLogout() {
        if (confirm('确定要退出登录吗？')) {
          
          document.cookie.split(';').forEach(cookie => {
            document.cookie = cookie
              .replace(/^ +/, '')
              .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
          });
          
          axios.defaults.withCredentials = false;
          
          this.$router.push('/login');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .sidebar {
    width: 200px;
    height: 100%;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    box-sizing: border-box;
  }
  

  .menu-buttons button {
    width: 100%;
    margin-bottom: 10px;
    padding: 12px;
    font-size: 16px;
    cursor: pointer;
    border: none;              
    border-radius: 5px;        
    background-color: #3498db; 
    color: #fff;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .menu-buttons button:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }
  

  .logout-button button {
    width: 100%;
    padding: 12px;
    background-color: #e74c3c; 
    color: #fff;
    border: none;              
    border-radius: 5px;        
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .logout-button button:hover {
    background-color: #c0392b;
    transform: translateY(-2px);
  }
  
 
  button:focus {
    outline: none;
  }
  </style>
  