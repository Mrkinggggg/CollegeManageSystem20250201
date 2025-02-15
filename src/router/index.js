import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/User/Login.vue'
import Register from '@/views/User/Register.vue'
import Profile from '@/views/User/Profile.vue'
import CourseEnrollment from '@/views/User/CourseEnrollment.vue'
import CourseFeedback from '@/views/User/CourseFeedback.vue'
import VolunteerService from '@/views/User/VolunteerService.vue'
import Retrieve from '@/views/User/Retrieve.vue'
import Edit from '@/views/User/Edit.vue'

import CourseManage from '@/views/Teacher/CourseManage.vue'
import CourseSchedule from '@/views/Teacher/CourseSchedule.vue'
import Attendance from '@/views/Teacher/Attendance.vue'
import FeedbackReview from '@/views/Teacher/FeedbackReview.vue'
import VolunteerActivity from '@/views/Teacher/VolunteerActivity.vue'

import UserManage from '@/views/Admin/UserManage.vue'
import CourseReviewAdmin from '@/views/Admin/CourseReview.vue'
import AttendanceReport from '@/views/Admin/AttendanceReport.vue'
import VolunteerManage from '@/views/Admin/VolunteerManage.vue'

import AdiminHome from '@/views/Admin/AdiminHome.vue'
const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/retrieve', name: 'Retrieve', component: Retrieve},
  { 
    path: '/student/profile', 
    name: 'Profile', 
    component: Profile,   
  },
  {
    path: '/student/edit',
    name: 'edit',
    component: Edit
  },
  { path: '/student/course-enrollment', name: 'CourseEnrollment', component: CourseEnrollment },
  { path: '/student/course-feedback', name: 'CourseFeedback', component: CourseFeedback },
  { path: '/student/volunteer-service', name: 'VolunteerService', component: VolunteerService },
  
  { path: '/teacher/course-manage', name: 'CourseManage', component: CourseManage },
  { path: '/admin/course-schedule', name: 'CourseSchedule', component: CourseSchedule },
  { path: '/teacher/attendance', name: 'Attendance', component: Attendance },
  { path: '/teacher/feedback-review', name: 'FeedbackReview', component: FeedbackReview },
  { path: '/teacher/volunteer-activity', name: 'VolunteerActivity', component: VolunteerActivity },
  
  { path: '/admin_', name: 'AdiminHome', component: AdiminHome},
  { path: '/admin/user-manage', name: 'UserManage', component: UserManage },
  { path: '/admin/course-review', name: 'CourseReviewAdmin', component: CourseReviewAdmin },
  { path: '/admin/attendance-report', name: 'AttendanceReport', component: AttendanceReport },
  { path: '/admin/volunteer-manage', name: 'VolunteerManage', component: VolunteerManage },
  
  { path: '/', redirect: '/login' },
  { path: '/:catchAll(.*)', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
