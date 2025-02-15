import Mock from 'mockjs';

// 模拟登录接口
Mock.mock('/login', 'post', (options) => {
  
  const { role, username, password } = JSON.parse(options.body);
  if (
    username === 'test' &&
    password === '1234' &&
    (role === 'student' || role === 'teacher' || role === 'admin')
  ) {
    return {
      success: true,
      message: '登录成功',
      data: {
        token: 'mock-token-12345',
        role,
      },
    };
  } else {
    return {
      success: false,
      message: '用户名或密码错误',
    };
  }
});

let courses = [
  {
    courseCode: 'C001',
    courseName: '计算机导论',
    classTerm: '2024学年(上)',
    classDay: '周一12节，周三34节',
    location: '主楼101',
    credit: 2,
    description: '介绍计算机科学的基础概念。'
  },
  {
    courseCode: 'C002',
    courseName: '高等数学',
    classTerm: '2024学年(下)',
    classDay: '周二12节，周四34节',
    location: '数学楼202',
    credit: 3,
    description: '学习微积分和线性代数。'
  }
];

// 获取课程列表
Mock.mock('/api/t/courses', 'get', () => {
  return courses;
});

// 创建新课程
Mock.mock('/api/t/courses', 'post', (options) => {
  const body = JSON.parse(options.body);

  // 自动生成一个唯一的 courseCode
  const newCourseCode = 'C' + (courses.length + 1).toString().padStart(3, '0');
  const newCourse = {
    courseCode: newCourseCode,
    ...body
  };

  courses.push(newCourse);

  return {
    success: true,
    message: '课程创建成功',
    data: newCourse
  };
});

// 更新课程信息
Mock.mock(/\/api\/t\/courses\/C\d{3}/, 'put', (options) => {
  const courseCode = options.url.match(/\/api\/courses\/(C\d{3})/)[1];
  const body = JSON.parse(options.body);

  let updated = false;
  courses = courses.map(course => {
    if (course.courseCode === courseCode) {
      updated = true;
      return { ...course, ...body, courseCode }; // 确保 courseCode 不变
    }
    return course;
  });

  if (updated) {
    return {
      success: true,
      message: '课程更新成功'
    };
  } else {
    return {
      success: false,
      message: '未找到要更新的课程'
    };
  }
});

// 删除课程
Mock.mock(/\/api\/t\/courses\/C\d{3}/, 'delete', (options) => {
  const courseCode = options.url.match(/\/api\/t\/courses\/(C\d{3})/)[1];

  const initialLength = courses.length;
  courses = courses.filter(course => course.courseCode !== courseCode);

  if (courses.length < initialLength) {
    return {
      success: true,
      message: '课程删除成功'
    };
  } else {
    return {
      success: false,
      message: '未找到要删除的课程'
    };
  }
});


// 模拟用户信息接口
Mock.mock('/api/user-info', 'get', {
  name: '牜膜',
  phone: '13800138000',
  address: '牛马505',
})


// 你可以根据需要添加更多模拟接口

// 模拟课程数据
let courses_2 = [ 
  {
    courseId: 'C001',
    courseName: 'Web开发基础',
    teacher: '王老师',
    classTerm: '2024学年(上)',
    classDay: ['周一 3-4节', '周三 5-6节'],
    location: '逸夫楼302',
    credit: 3,
    capacity: 60,
    enrolled: 45,
    description: '学习Web开发的基本概念和技术。'
  },
  // 可以添加更多课程数据
]

// 已选课程列表
let selectedCourses = []

// 拦截获取所有课程的请求
Mock.mock(/\/api\/courses/, 'get', (options) => {
  const params = new URLSearchParams(options.url.split('?')[1])
  const searchQuery = params.get('search') || ''
  const selectedCredit = params.get('credit')
  const page = parseInt(params.get('page')) || 1
  const pageSize = parseInt(params.get('pageSize')) || 8

  // 过滤课程
  let filteredCourses = courses_2.filter(course => { // 使用 courses_2
    const matchesSearch = course.courseName.includes(searchQuery) || course.teacher.includes(searchQuery)
    const matchesCredit = selectedCredit ? course.credit === parseInt(selectedCredit) : true
    return matchesSearch && matchesCredit
  })

  // 分页
  const total = filteredCourses.length
  const start = (page - 1) * pageSize
  const end = page * pageSize
  const paginatedCourses = filteredCourses.slice(start, end)

  return {
    courses: paginatedCourses,
    total
  }
})

// 拦截获取已选课程的请求
Mock.mock('/api/selected-courses', 'get', () => {
  return {
    selectedCourses
  }
})

// 拦截报名课程的请求
Mock.mock('/api/enroll', 'post', (options) => {
  const body = JSON.parse(options.body)
  const courseId = body.courseId

  const course = courses_2.find(c => c.courseId === courseId) // 使用 courses_2
  if (!course) {
    return { success: false, message: '课程不存在' }
  }

  if (course.enrolled >= course.capacity) {
    return { success: false, message: '课程已满' }
  }

  if (selectedCourses.some(c => c.courseId === courseId)) {
    return { success: false, message: '你已选过此课程' }
  }

  // 检查时间冲突
  const hasConflict = selectedCourses.some(selected =>
    selected.classDay.some(time => course.classDay.includes(time))
  )

  if (hasConflict) {
    return { success: false, message: '课程时间冲突' }
  }

  course.enrolled += 1
  selectedCourses.push(course)

  return { success: true, message: '报名成功' }
})

// 拦截退选课程的请求
Mock.mock('/api/withdraw', 'post', (options) => {
  const body = JSON.parse(options.body)
  const courseId = body.courseId

  const index = selectedCourses.findIndex(c => c.courseId === courseId)
  if (index === -1) {
    return { success: false, message: '你未选此课程' }
  }

  selectedCourses.splice(index, 1)
  const course = courses_2.find(c => c.courseId === courseId) // 使用 courses_2
  if (course) {
    course.enrolled -= 1
  }

  return { success: true, message: '退选成功' }
})

// Initial course data
let courses_3 = [ // 数组名更改为 courses_3
  {
    courseId: 'C001',
    courseName: 'Web开发基础',
    classTerm: '2024学年(上)',
    classDay: ['周一 3-4节', '周三 5-6节'],
    location: '逸夫楼302',
    credit: 3,
    capacity: 60,
    description: '学习Web开发的基本概念和技术。',
    published: false,
  },
  // Add more course objects if needed
];

// Mock GET /api/teacher/courses
Mock.mock('/api/teacher/courses', 'get', () => {
  console.log('Mock GET /api/teacher/courses');
  return courses_3; // 使用 courses_3
});

// Mock POST /api/teacher/courses/{courseId}/publish
Mock.mock(/\/api\/teacher\/courses\/\w+\/publish/, 'post', (options) => {
  console.log('Mock POST /api/teacher/courses/{courseId}/publish');

  // Extract courseId from the URL
  const match = options.url.match(/\/api\/teacher\/courses\/(\w+)\/publish/);
  const courseId = match ? match[1] : null;

  if (courseId) {
    const course = courses_3.find((c) => c.courseId === courseId); // 使用 courses_3
    if (course) {
      course.published = true;
      return {
        success: true,
        message: '课程发布成功',
      };
    } else {
      return {
        success: false,
        message: '未找到指定的课程',
      };
    }
  } else {
    return {
      success: false,
      message: '无效的课程ID',
    };
  }
});

// 模拟数据存储
let enrolledCourses = [
  { id: 'C101', name: 'Web开发基础' },
  { id: 'C102', name: '算法导论' },
  // 你可以根据需要添加更多的课程
];

let feedbackList = [
  {
    id: 'F001',
    courseId: 'C101',
    courseName: 'Web开发基础',
    rating: 5,
    content: '课程内容丰富，收获很大。',
    createdAt: '2023-10-10T10:00:00Z',
  },
  // 你可以根据需要添加更多的评价
];

// GET /api/enrolled-courses
Mock.mock('/api/enrolled-courses', 'get', () => {
  return enrolledCourses;
});

// GET /api/feedback
Mock.mock('/api/feedback', 'get', () => {
  return feedbackList;
});

// POST /api/feedback
Mock.mock('/api/feedback', 'post', (options) => {
  const body = JSON.parse(options.body);
  const newFeedback = {
    id: Mock.Random.guid(),
    courseId: body.courseId,
    courseName: enrolledCourses.find(course => course.id === body.courseId)?.name || '',
    rating: body.rating,
    content: body.content,
    createdAt: new Date().toISOString(),
  };
  feedbackList.unshift(newFeedback);
  return newFeedback;
});


// PUT /api/feedback/:id
Mock.mock(/\/api\/feedback\/\w+/, 'put', (options) => {
  const idMatch = options.url.match(/\/api\/feedback\/(\w+)/);
  const id = idMatch ? idMatch[1] : null;
  if (id) {
    const body = JSON.parse(options.body);
    const index = feedbackList.findIndex(feedback => feedback.id === id);
    if (index !== -1) {
      feedbackList[index] = { ...feedbackList[index], ...body };
      return feedbackList[index];
    } else {
      return { error: '未找到对应的评价' };
    }
  } else {
    return { error: '无效的评价ID' };
  }
});

// DELETE /api/feedback/:id
Mock.mock(/\/api\/feedback\/\w+/, 'delete', (options) => {
  const idMatch = options.url.match(/\/api\/feedback\/(\w+)/);
  const id = idMatch ? idMatch[1] : null;
  if (id) {
    const index = feedbackList.findIndex(feedback => feedback.id === id);
    if (index !== -1) {
      feedbackList.splice(index, 1);
      return { success: true };
    } else {
      return { error: '未找到对应的评价' };
    }
  } else {
    return { error: '无效的评价ID' };
  }
});

// Setup to simulate network latency (optional but recommended)
Mock.setup({
  timeout: '200-600', // Random delay between 200ms and 600ms
});

//----------------------------------------------------------------------------
// 模拟课程数据
let courses_4 = [ // 数组名更改为 courses_4
  {
    courseId: 'C001',
    courseName: 'Web开发基础',
    classTerm: '2024学年(上)',
    classDay: ['周一 3-4节', '周三 5-6节'],
    location: '逸夫楼302',
    credit: 3,
    capacity: 60,
    description: '学习Web开发的基本概念和技术。',
  },
  // 你可以根据需要添加更多课程
];

// 模拟考勤数据存储，键为 `${courseId}_${date}`
let attendanceData = {
  // 示例：为课程C001在2023-11-01的考勤记录
  'C001_2025-02-04': [
    {
      id: 'A1001',
      studentId: "S1001",
      studentName: "张三",
      status: 'present', // 出勤
      lateMinutes: 0,
      checkInTime: "2023-08-20 08:28:00"
    },
    {
      id: 'A1002',
      studentId: "S1002",
      studentName: "李四",
      status: 'late', // 迟到
      lateMinutes: 10,
      checkInTime: null
     
    },
    {
      id: 'A1003',
      studentId: "S1003",
      studentName: '王五',
      status: 'absent', // 缺勤
      lateMinutes: 0,
      checkInTime: null
    },
    // 你可以添加更多学生的考勤记录
  ],
  // 可以为其他课程和日期添加更多考勤记录
};

// Mock GET /api/teacher/courses
Mock.mock('/api/teacher/courses', 'get', () => {
  console.log('Mock GET /api/teacher/courses');
  return courses_4; // 使用 courses_4
});

// Mock GET /api/attendance
Mock.mock(/\/api\/attendance\?.*/, 'get', (options) => {
  console.log('Mock GET /api/attendance');

  const url = new URL(options.url, 'http://localhost');
  const courseId = url.searchParams.get('courseId');
  const date = url.searchParams.get('date');

  if (!courseId || !date) {
    return { error: '缺少参数' };
  }

  const key = `${courseId}_${date}`;


   // 如果已有考勤数据，返回它；否则生成模拟数据
   if (attendanceData[key]) {
    return attendanceData[key];
  } else {
    // 生成模拟的考勤记录
    const records = Mock.mock({
      'records|30-50': [
        {
          'id|+1': 1, // 自增的唯一ID
          'studentId': function () {
            return 'S' + Mock.Random.natural(1001, 9999); // 学生ID
          },
          'studentName': '@cname', // 学生姓名
          'status|1': ['present', 'late', 'absent'], // 随机状态
          'lateMinutes': function () {
            return this.status === 'late' ? Mock.Random.integer(1, 30) : 0;
          },
          'checkInTime': function () {
            if (this.status === 'absent') {
              return ''; // 缺勤则无签到时间
            } else {
              // 假设上课时间为当天的08:00:00
              const baseTimeStr = `${date} 08:00:00`;
              let baseTime = new Date(baseTimeStr);
              if (this.status === 'late') {
                // 如果迟到，增加迟到分钟数
                baseTime.setMinutes(baseTime.getMinutes() + this.lateMinutes);
              } else {
                // 如果准时，随机提前0-5分钟签到
                baseTime.setMinutes(baseTime.getMinutes() - Mock.Random.integer(0, 5));
              }
              // 格式化时间为 yyyy-MM-dd HH:mm:ss
              const fmtTime = `${baseTime.getFullYear()}-${('0' + (baseTime.getMonth() + 1)).slice(-2)}-${('0' + baseTime.getDate()).slice(-2)} ${('0' + baseTime.getHours()).slice(-2)}:${('0' + baseTime.getMinutes()).slice(-2)}:${('0' + baseTime.getSeconds()).slice(-2)}`;
              return fmtTime;
            }
          },
        },
      ],
    }).records;
    
    attendanceData[key] = records;
    return records;
  }
});
// Mock PUT /api/attendance （更新单个记录）
Mock.mock('/api/attendance', 'put', (options) => {
  console.log('Mock PUT /api/attendance');

  const body = JSON.parse(options.body);
  const { attendanceId, status, lateMinutes } = body;

  let updated = false;

  for (const key in attendanceData) {
    const record = attendanceData[key].find((item) => item.id === attendanceId);
    if (record) {
      record.status = status;
      record.lateMinutes = lateMinutes;
      updated = true;
      break;
    }
  }

  return updated ? { success: true } : { success: false, message: '记录未找到' };
});

// Mock POST /api/attendance （批量更新）
Mock.mock('/api/attendance', 'post', (options) => {
  console.log('Mock POST /api/attendance');

  const body = JSON.parse(options.body);
  const { updates } = body;

  updates.forEach((update) => {
    const { attendanceId, status, lateMinutes } = update;

    for (const key in attendanceData) {
      const record = attendanceData[key].find((item) => item.id === attendanceId);
      if (record) {
        record.status = status;
        record.lateMinutes = lateMinutes;
      }
    }
  });

  return { success: true };
});

// Mock GET /api/attendance/export
Mock.mock(/\/api\/attendance\/export\?.*/, 'get', () => {
  console.log('Mock GET /api/attendance/export');

  // 模拟返回一个Blob对象，实际使用中需要根据需求调整
  const data = '这是模拟的考勤报表内容，包括学生名单和考勤状态等信息。';
  return new Blob([data], { type: 'text/plain;charset=utf-8' });
});
//----------------------------------------------------------------------------

const activities = [
  {
    id: 1,
    title: '社区环保清洁活动',
    type: '环境保护',
    startTime: '2023-08-20 09:00',
    endTime: '2023-08-20 12:00',
    location: '牛马505',
    capacity: 50,
    registered: 32,
    status: '可报名',
    organizer: 'hzg',
    description: '参与社区环境清洁，共建美好家园。活动内容包括垃圾分类指导、街道清扫等。',
    notes: [
      '请自备手套和饮用水',
      '提前15分钟到达集合点',
      '穿着舒适的运动鞋'
    ],
    //isNew: true
  },
  // 更多模拟数据...
  {
    id: 9,
    title: '绿色行动环保日',
    type: '环境保护',
    startTime: '2024-08-05 10:00',
    endTime: '2024-08-05 16:00',
    location: '北京市朝阳公园',
    capacity: 100,
    registered: 65,
    status: '可报名',
    organizer: '自然保护协会',
    description: '参与公园清洁活动，宣传环保知识。',
    notes: ['自带水杯', '穿舒适衣服']
  },
  {
    id: 2,
    title: '社区义诊活动',
    type: '医疗协助',
    startTime: '2024-08-10 09:00',
    endTime: '2024-08-10 12:00',
    location: '上海市静安区社区服务中心',
    capacity: 50,
    registered: 38,
    status: '可报名',
    organizer: '红十字会',
    description: '为社区居民提供免费义诊服务。',
    notes: ['携带身份证', '提前预约']
  },
  {
    id: 3,
    title: '青少年编程培训',
    type: '教育支持',
    startTime: '2024-08-15 14:00',
    endTime: '2024-08-15 17:00',
    location: '深圳市南山区科技园',
    capacity: 80,
    registered: 72,
    status: '可报名',
    organizer: '科技创新协会',
    description: '为青少年提供免费编程培训课程。',
    notes: ['自带电脑', '有编程基础']
  },
  {
    id: 4,
    title: '传统文化艺术展',
    type: '文化传播',
    startTime: '2024-08-20 10:00',
    endTime: '2024-08-20 18:00',
    location: '广州市越秀区文化宫',
    capacity: 200,
    registered: 150,
    status: '可报名',
    organizer: '文化交流协会',
    description: '展示中国传统文化艺术作品。',
    notes: ['免费入场', '欢迎拍照']
  },
  {
    id: 5,
    title: '关爱老人社区行',
    type: '社区服务',
    startTime: '2024-08-25 09:00',
    endTime: '2024-08-25 11:00',
    location: '南京市玄武区养老院',
    capacity: 60,
    registered: 45,
    status: '可报名',
    organizer: '志愿者协会',
    description: '为养老院老人提供关爱服务。',
    notes: ['携带慰问品', '注意言行举止']
  },
  {
    id: 6,
    title: '自然科学探索营',
    type: '教育支持',
    startTime: '2024-08-30 08:00',
    endTime: '2024-08-30 17:00',
    location: '成都市青城山自然保护区',
    capacity: 40,
    registered: 35,
    status: '可报名',
    organizer: '科学普及协会',
    description: '带领青少年探索自然科学奥秘。',
    notes: ['穿登山鞋', '注意安全']
  },
  {
    id: 7,
    title: '国际志愿者日活动',
    type: '社区服务',
    startTime: '2024-09-05 10:00',
    endTime: '2024-09-05 15:00',
    location: '杭州市西湖风景区',
    capacity: 120,
    registered: 90,
    status: '可报名',
    organizer: '国际志愿者协会',
    description: '组织志愿者参与各项社区服务活动。',
    notes: ['统一服装', '准时到达']
  }
]

// Mock the API endpoint
Mock.mock('/api/volunteer_info', 'get', () =>{
  return activities
})

// GET /api/volunteer/activities
Mock.mock('/api/volunteer/activities', 'get', () => {
  return activities
})

// 模拟报名端点
Mock.mock('/api/register_activity', 'post', (options) => {
  const { id } = JSON.parse(options.body)
  const activity = activities.find(a => a.id === id)

  if (activity) {
    if (activity.registered >= activity.capacity) {
      return {
        success: false,
        message: '该活动已满员'
      }
    } else {
      activity.registered += 1
      return {
        success: true,
        message: '报名成功',
        updatedActivity: activity
      }
    }
  } else {
    return {
      success: false,
      message: '活动不存在'
    }
  }
})


// 活动类型选项
const activityTypes = ['环境保护', '社区服务', '教育支持', '医疗协助', '文化传播']

// const activities = [
//   {
//     id: 1,
//     title: '绿色行动环保日',
//     type: '环境保护',
//     startTime: '2024-08-05 10:00',
//     endTime: '2024-08-05 16:00',
//     location: '北京市朝阳公园',
//     capacity: 100,
//     registered: 65,
//     organizer: '自然保护协会',
//     description: '参与公园清洁活动，宣传环保知识。',
//     notes: ['自带水杯', '穿舒适衣服']
//   },
//   {
//     id: 2,
//     title: '社区义诊活动',
//     type: '医疗协助',
//     startTime: '2024-08-10 09:00',
//     endTime: '2024-08-10 12:00',
//     location: '上海市静安区社区服务中心',
//     capacity: 50,
//     registered: 38,
//     organizer: '红十字会',
//     description: '为社区居民提供免费义诊服务。',
//     notes: ['携带身份证', '提前预约']
//   },
//   {
//     id: 3,
//     title: '青少年编程培训',
//     type: '教育支持',
//     startTime: '2024-08-15 14:00',
//     endTime: '2024-08-15 17:00',
//     location: '深圳市南山区科技园',
//     capacity: 80,
//     registered: 72,
//     organizer: '科技创新协会',
//     description: '为青少年提供免费编程培训课程。',
//     notes: ['自带电脑', '有编程基础']
//   },
//   {
//     id: 4,
//     title: '传统文化艺术展',
//     type: '文化传播',
//     startTime: '2024-08-20 10:00',
//     endTime: '2024-08-20 18:00',
//     location: '广州市越秀区文化宫',
//     capacity: 200,
//     registered: 150,
//     organizer: '文化交流协会',
//     description: '展示中国传统文化艺术作品。',
//     notes: ['免费入场', '欢迎拍照']
//   },
//   {
//     id: 5,
//     title: '关爱老人社区行',
//     type: '社区服务',
//     startTime: '2024-08-25 09:00',
//     endTime: '2024-08-25 11:00',
//     location: '南京市玄武区养老院',
//     capacity: 60,
//     registered: 45,
//     organizer: '志愿者协会',
//     description: '为养老院老人提供关爱服务。',
//     notes: ['携带慰问品', '注意言行举止']
//   },
//   {
//     id: 6,
//     title: '自然科学探索营',
//     type: '教育支持',
//     startTime: '2024-08-30 08:00',
//     endTime: '2024-08-30 17:00',
//     location: '成都市青城山自然保护区',
//     capacity: 40,
//     registered: 35,
//     organizer: '科学普及协会',
//     description: '带领青少年探索自然科学奥秘。',
//     notes: ['穿登山鞋', '注意安全']
//   },
//   {
//     id: 7,
//     title: '国际志愿者日活动',
//     type: '社区服务',
//     startTime: '2024-09-05 10:00',
//     endTime: '2024-09-05 15:00',
//     location: '杭州市西湖风景区',
//     capacity: 120,
//     registered: 90,
//     organizer: '国际志愿者协会',
//     description: '组织志愿者参与各项社区服务活动。',
//     notes: ['统一服装', '准时到达']
//   }
// ];


// POST /api/volunteer/activities
Mock.mock('/api/volunteer/activities', 'post', (options) => {
  const body = JSON.parse(options.body)
  const newId = activities.length ? activities[activities.length - 1].id + 1 : 1
  const newActivity = {
    id: newId,
    registered: 0,
    organizer: '当前用户', // 假设为当前用户
    ...body
  }
  activities.push(newActivity)
  return {
    message: '活动创建成功',
    data: newActivity
  }
})

// PUT /api/volunteer/activities/{id}
Mock.mock(/\/api\/volunteer\/activities\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/volunteer\/activities\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  const index = activities.findIndex(activity => activity.id === id)
  if (index !== -1) {
    activities[index] = {
      ...activities[index],
      ...body
    }
    return {
      message: '活动更新成功',
      data: activities[index]
    }
  } else {
    return {
      message: '活动不存在'
    }
  }
})

// DELETE /api/volunteer/activities/{id}
Mock.mock(/\/api\/volunteer\/activities\/\d+/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/volunteer\/activities\/(\d+)/)[1])
  const index = activities.findIndex(activity => activity.id === id)
  if (index !== -1) {
    activities.splice(index, 1)
    return {
      message: '活动删除成功'
    }
  } else {
    return {
      message: '活动不存在'
    }
  }
})

// 模拟生成学员数据
const participantsData = Mock.mock({
  'participants|10-30': [
    {
      'id|+1': 1,
      studentId: 'S@integer(1000,9999)',
      name: '@cname',
      signupTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
      serviceHours: '@integer(1,4)'
    }
  ]
}).participants

// GET /api/volunteer/activities/{id}/participants
Mock.mock(/\/api\/volunteer\/activities\/\d+\/participants/, 'get', () => {
  return participantsData
})

// POST /api/volunteer/service-hours
Mock.mock('/api/volunteer/service-hours', 'post', (options) => {
  const body = JSON.parse(options.body)
  const { recordId, hours } = body
  const participant = participantsData.find(p => p.id === recordId)
  if (participant) {
    participant.serviceHours = hours
    return {
      message: '服务时长更新成功',
      data: participant
    }
  } else {
    return {
      message: '记录不存在'
    }
  }
})

const Random = Mock.Random

// 模拟课程选项，用于 '已修读课程' 和 '教授的课程'
const courseOptions = [
  { value: 'C001', label: '计算机基础' },
  { value: 'C002', label: '高等数学' },
  { value: 'C003', label: '大学英语' }
]

// 初始化学生数据列表
let studentList = []
const totalStudents = 100

for (let i = 0; i < totalStudents; i++) {
  studentList.push(Mock.mock({
    studentId: Random.string('number', 8),
    name: Random.cname(),
    phone: /^1[3-9]\d{9}$/,
    address: Random.county(true)
  }))
}

// 获取学生列表
Mock.mock(/\/api\/students/, 'get', (options) => {
  const url = new URL(options.url, window.location.origin)
  const page = parseInt(url.searchParams.get('page')) || 1
  const limit = parseInt(url.searchParams.get('limit')) || 10

  const start = (page - 1) * limit
  const end = page * limit
  const data = studentList.slice(start, end)

  return {
    code: 200,
    message: 'success',
    data: data,
    total: totalStudents
  }
})

// 添加学生
Mock.mock('/api/students', 'post', (options) => {
  const body = JSON.parse(options.body)
  studentList.push({
    studentId: body.studentId,
    name: body.name,
    phone: body.phone,
    address: body.address
  })
  return {
    code: 200,
    message: '添加成功'
  }
})

// 更新学生信息
Mock.mock(/\/api\/students\/\d+/, 'put', (options) => {
  const url = options.url
  const studentId = url.match(/\/api\/students\/(\d+)/)[1]
  const body = JSON.parse(options.body)

  const index = studentList.findIndex(item => item.studentId === studentId)
  if (index !== -1) {
    studentList[index] = { ...studentList[index], ...body }
    return {
      code: 200,
      message: '更新成功'
    }
  } else {
    return {
      code: 404,
      message: '学生不存在'
    }
  }
})

// 删除学生
Mock.mock(new RegExp('/api/students/[^/]+$'), 'delete', (options) => {
  const url = options.url
  const studentId = url.split('/').pop()

  const index = studentList.findIndex(item => item.studentId === studentId)
  if (index !== -1) {
    studentList.splice(index, 1)
    return {
      code: 200,
      message: '删除成功'
    }
  } else {
    return {
      code: 404,
      message: '学生不存在'
    }
  }
})
// 初始化教师数据列表
let teacherList = []
const totalTeachers = 50

for (let i = 0; i < totalTeachers; i++) {
  teacherList.push(Mock.mock({
    teacherId: Random.string('upper', 2) + Random.string('number', 6),
    name: Random.cname(),
    phone: /^1[3-9]\d{9}$/,
    address: Random.county(true)
  }))
}

// 模拟 GET /api/teachers 接口
Mock.mock(/\/api\/teachers/, 'get', (options) => {
  const url = new URL(options.url, window.location.origin)
  const page = parseInt(url.searchParams.get('page')) || 1
  const limit = parseInt(url.searchParams.get('limit')) || 10

  const start = (page - 1) * limit
  const end = page * limit
  const data = teacherList.slice(start, end)

  return {
    code: 200,
    message: 'success',
    data: data,
    total: totalTeachers
  }
})

// 添加teachers
Mock.mock('/api/teachers', 'post', (options) => {
  const body = JSON.parse(options.body)
  studentList.push({
    studentId: body.studentId,
    name: body.name,
    phone: body.phone,
    address: body.address
  })
  return {
    code: 200,
    message: '添加成功'
  }
})

// 更新teachers信息
Mock.mock(/\/api\/teachers\/\d+/, 'put', (options) => {
  const url = options.url
  const studentId = url.match(/\/api\/students\/(\d+)/)[1]
  const body = JSON.parse(options.body)

  const index = studentList.findIndex(item => item.studentId === studentId)
  if (index !== -1) {
    studentList[index] = { ...studentList[index], ...body }
    return {
      code: 200,
      message: '更新成功'
    }
  } else {
    return {
      code: 404,
      message: '学生不存在'
    }
  }
})

// 删除teachers
Mock.mock(/\/api\/teachers\/\d+/, 'delete', (options) => {
  const url = options.url
  const studentId = url.match(/\/api\/students\/(\d+)/)[1]

  const index = studentList.findIndex(item => item.studentId === studentId)
  if (index !== -1) {
    studentList.splice(index, 1)
    return {
      code: 200,
      message: '删除成功'
    }
  } else {
    return {
      code: 404,
      message: '学生不存在'
    }
  }
})

// Mock the GET /api/admin/courses endpoint
Mock.mock(/\/api\/admin\/courses/, 'get', (options) => {
  const url = new URL(options.url, window.location.origin)
  const params = Object.fromEntries(url.searchParams.entries())
  const page = parseInt(params.page) || 1
  const limit = parseInt(params.limit) || 10
  const total = 100

  const courses = []
  for (let i = 0; i < limit; i++) {
    const index = (page - 1) * limit + i + 1
    if (index > total) break

    courses.push(Mock.mock({
      courseId: 'C' + index.toString().padStart(3, '0'),
      courseName: Random.ctitle(5, 10),
      teacher: Random.cname(),
      classTerm: Random.pick([
        '2024学年(上)',
        '2024学年(下)',
        '2023学年(上)',
        '2023学年(下)'
      ]),
      classDay: [
        `周${Random.pick(['一', '二', '三', '四', '五'])} ${Random.natural(1, 5)}-${Random.natural(6, 10)}节`,
        `周${Random.pick(['一', '二', '三', '四', '五'])} ${Random.natural(1, 5)}-${Random.natural(6, 10)}节`
      ],
      location: Random.cword(2, 4) + '楼' + Random.natural(100, 500),
      credit: Random.natural(1, 5),
      capacity: Random.natural(30, 100),
      enrolled: Random.natural(0, 60),
      description: Random.csentence(10, 20)
    }))
  }

  return {
    code: 200,
    message: 'success',
    data: courses,
    total
  }
})

// Mock the POST /api/admin/courses endpoint
Mock.mock('/api/admin/courses', 'post', (options) => {
  const body = JSON.parse(options.body)
  // You can add validation logic here if needed
  return {
    code: 200,
    message: '课程创建成功'
  }
})

// Mock the PUT /api/admin/courses/:courseId endpoint
Mock.mock(/\/api\/admin\/courses\/\w+/, 'put', (options) => {
  const body = JSON.parse(options.body)
  return {
    code: 200,
    message: '课程更新成功'
  }
})

// Mock the DELETE /api/admin/courses/:courseId endpoint
Mock.mock(/\/api\/admin\/courses\/\w+/, 'delete', (options) => {
  return {
    code: 200,
    message: '课程删除成功'
  }
})

// mock.js


// 模拟课程列表接口
Mock.mock('/api/attendance/courses', 'get', [
  { id: 1, courseName: '高等数学' },
  { id: 2, courseName: '大学物理' },
  { id: 3, courseName: '计算机网络' },
  { id: 4, courseName: '数据结构' },
  { id: 5, courseName: '线性代数' }
])

// 模拟考勤信息接口
Mock.mock(/\/api\/attendance\/\d+/, 'get', (options) => {
  const courseId = options.url.split('/').pop()
  return [
    { sid: 1001, studentName: '张伟', state: 0 },
    { sid: 1002, studentName: '李娜', state: 1 },
    { sid: 1003, studentName: '王敏', state: 0 },
    { sid: 1004, studentName: '刘强', state: 2 },
    { sid: 1005, studentName: '陈静', state: 0 }
  ]
})

// 模拟提交考勤信息接口
Mock.mock('/api/attendance/submit', 'post', (options) => {
  console.log('提交数据:', JSON.parse(options.body))
  return { code: 200, message: '提交成功' }
})