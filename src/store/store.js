// src/store/store.js
import { reactive, computed } from 'vue'

export const store = reactive({
  // 学员基础数据
  students: [
    { id: '1001', name: '张三' },
    { id: '1002', name: '李四' },
    { id: '1003', name: '王五' }
  ],

  // 考勤记录
  attendanceRecords: [],

  // 添加考勤记录
  addAttendance(record) {
    const student = this.students.find(s => s.id === record.studentId)
    let status = '正常'
    
    if (!record.signTime) {
      status = '缺勤'
    } else {
      const signHour = new Date(record.signTime).getHours()
      const signMinutes = new Date(record.signTime).getMinutes()
      // 假设课程开始时间为 9:00，9:30 后算迟到
      if (signHour > 9 || (signHour === 9 && signMinutes > 30)) {
        status = '迟到'
      }
    }

    this.attendanceRecords.push({
      studentId: record.studentId,
      studentName: student.name,
      courseName: record.courseName,
      signTime: record.signTime || '未签到',
      status
    })
  },

  // 计算考勤报表
  attendanceReport: computed(() => {
    const report = {}
    store.attendanceRecords.forEach(record => {
      if (!report[record.courseName]) {
        report[record.courseName] = {
          normal: 0,
          late: 0,
          absent: 0
        }
      }
      if (record.status === '正常') report[record.courseName].normal++
      if (record.status === '迟到') report[record.courseName].late++
      if (record.status === '缺勤') report[record.courseName].absent++
    })
    return report
  })
})