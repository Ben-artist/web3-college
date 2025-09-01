/**
 * Web3 College Cloudflare Workers
 * 提供课程数据和购买记录的Web2存储服务
 * 
 * 主要功能：
 * 1. 课程管理 - 创建、更新、查询课程
 * 2. 购买记录 - 记录、查询购买信息
 * 
 * 数据格式：
 * - 课程: address:[{courseId, content, title, cost}]
 * - 购买: [{courseId, creator, buyers:[], title, count, cost}]
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 设置CORS头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    // 处理预检请求
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 路由处理
      if (path.startsWith('/api/courses')) {
        return await handleCourses(request, env, corsHeaders);
      } else if (path.startsWith('/api/purchases')) {
        return await handlePurchases(request, env, corsHeaders);
      } else if (path === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          headers: corsHeaders,
          status: 200
        });
      } else {
        return new Response(JSON.stringify({ error: '接口不存在' }), {
          headers: corsHeaders,
          status: 404
        });
      }
    } catch (error) {
      console.error('Workers错误:', error);
      return new Response(JSON.stringify({ 
        error: '服务器内部错误', 
        message: error.message 
      }), {
        headers: corsHeaders,
        status: 500
      });
    }
  },
};

// 课程处理函数
async function handleCourses(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'GET' && path.match(/^\/api\/courses\/(0x[a-fA-F0-9]{40})$/)) {
    const address = path.split('/').pop();
    return await getUserCourses(address, env, corsHeaders);
  }
  
  if (method === 'GET' && path === '/api/courses') {
    return await getAllCourses(env, corsHeaders);
  }
  
  if (method === 'POST' && path === '/api/courses') {
    return await createCourse(request, env, corsHeaders);
  }

  return new Response(JSON.stringify({ error: '不支持的请求方法' }), {
    headers: corsHeaders,
    status: 405
  });
}

// 购买记录处理函数
async function handlePurchases(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'GET' && path.match(/^\/api\/purchases\/(\d+)$/)) {
    const courseId = path.split('/').pop();
    return await getCoursePurchases(courseId, env, corsHeaders);
  }
  
  if (method === 'GET' && path === '/api/purchases') {
    return await getAllPurchases(env, corsHeaders);
  }
  
  if (method === 'POST' && path === '/api/purchases') {
    return await recordPurchase(request, env, corsHeaders);
  }

  // 🆕 添加查询学生购买标记接口
  if (method === 'GET' && path.match(/^\/api\/purchases\/check\/(\d+)\/(0x[a-fA-F0-9]{40})$/)) {
    const [, courseId, studentAddress] = path.match(/^\/api\/purchases\/check\/(\d+)\/(0x[a-fA-F0-9]{40})$/);
    return await checkStudentPurchase(courseId, studentAddress, env, corsHeaders);
  }

  return new Response(JSON.stringify({ error: '不支持的请求方法' }), {
    headers: corsHeaders,
    status: 405
  });
}

// 创建课程
async function createCourse(request, env, corsHeaders) {
  try {
    // 解析请求数据
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        error: '数据格式错误', 
        message: '请检查JSON格式是否正确'
      }), {
        headers: corsHeaders,
        status: 400
      });
    }

    const { address, courseId, content, title, cost, description, cover, txHash } = body;
    // 简单验证必要字段
    if (!address || !courseId || !content || !title || cost === undefined) {
      return new Response(JSON.stringify({ 
        error: '缺少必要字段', 
        required: ['address', 'courseId', 'content', 'title', 'cost']
      }), {
        headers: corsHeaders,
        status: 400
      });
    }

    // 获取用户现有课程
    const existingCourses = await env.COURSE_DATA.get(address);
    let userCourses = [];
    
    if (existingCourses) {
      try {
        userCourses = JSON.parse(existingCourses);
      } catch (error) {
        userCourses = [];
      }
    }

    // 检查课程是否已存在
    const existingCourseIndex = userCourses.findIndex(course => course.courseId === courseId);
    
    if (existingCourseIndex !== -1) {
      // 课程已存在，不允许更新
      return new Response(JSON.stringify({ 
        error: '课程已存在', 
        message: '该课程ID已存在，请使用不同的课程ID'
      }), {
        headers: corsHeaders,
        status: 409
      });
    }

    // 创建新课程
    const newCourse = { 
      courseId, 
      content, 
      title, 
      cost, 
      description: description || '', 
      cover: cover || '',
      buyer: [address], // 创建者默认已购买
      txHash: txHash || ''
    };
    
    // 🆕 记录新课程对象
    console.log('📝 创建的新课程对象:')
    console.log(JSON.stringify(newCourse, null, 2))
    
    userCourses.push(newCourse);

    // 保存到存储
    await env.COURSE_DATA.put(address, JSON.stringify(userCourses));
    console.log('✅ 课程数据已保存到存储')

    // 同时更新所有课程的汇总数据
    await updateAllCoursesSummary(env, courseId, content, title, cost, address, description, cover, [address], txHash);
    console.log('✅ 课程汇总数据已更新')

    // 🆕 验证存储后的数据
    const storedData = await env.COURSE_DATA.get(address);
    console.log('📝 存储后的原始数据:')
    console.log(storedData)
    
    if (storedData) {
      const parsedStoredData = JSON.parse(storedData);
      console.log('📝 存储后的解析数据:')
      console.log(JSON.stringify(parsedStoredData, null, 2))
      
      // 检查最后一个课程是否包含description和cover
      const lastCourse = parsedStoredData[parsedStoredData.length - 1];
      if (lastCourse) {
        console.log('📝 最后存储的课程字段检查:')
        console.log('description:', lastCourse.description)
        console.log('cover:', lastCourse.cover)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: '课程创建成功',
      data: { address, courses: userCourses }
    }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    console.error('创建课程错误:', error);
    return new Response(JSON.stringify({ 
      error: '创建课程失败', 
      message: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

// 获取用户创建的课程列表
async function getUserCourses(address, env, corsHeaders) {
  try {
    console.log('📝 查询用户课程 - 地址:', address)
    
    // 获取用户课程数据
    const coursesData = await env.COURSE_DATA.get(address);
    // 如果没有数据，返回空数组
    if (!coursesData) {
      console.log('📝 用户没有课程数据，返回空数组')
      return new Response(JSON.stringify({ 
        address, 
        courses: [] 
      }), {
        headers: corsHeaders,
        status: 200
      });
    }

    // 解析课程数据
    const courses = JSON.parse(coursesData);
    // 返回用户课程列表
    const response = {
      address,
      courses
    }
    return new Response(JSON.stringify(response), {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    console.error('获取用户课程错误:', error);
    return new Response(JSON.stringify({ 
      error: '获取用户课程失败', 
      message: error.message 
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

// 获取所有课程列表
async function getAllCourses(env, corsHeaders) {
  try {
    // 由于KV存储的限制，我们需要遍历所有可能的地址来获取课程
    // 这里我们使用一个特殊的键来存储所有课程的汇总信息
    
    // 首先尝试获取汇总数据
    const summaryData = await env.COURSE_DATA.get('all_courses_summary');
    let allCourses = [];
    
    if (summaryData) {
      try {
        allCourses = JSON.parse(summaryData);
      } catch (error) {
        allCourses = [];
      }
    }
    
    // 如果没有汇总数据，返回空数组
    if (allCourses.length === 0) {
      return new Response(JSON.stringify({
        courses: [],
        total: 0,
        message: '暂无课程数据'
      }), {
        headers: corsHeaders,
        status: 200
      });
    }
    
    return new Response(JSON.stringify({
      courses: allCourses,
      total: allCourses.length
    }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    console.error('获取所有课程错误:', error);
    return new Response(JSON.stringify({ 
      error: '获取所有课程失败', 
      message: error.message 
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

// 记录购买
async function recordPurchase(request, env, corsHeaders) {
  try {
    // 解析请求数据
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        error: '数据格式错误', 
        message: '请检查JSON格式是否正确'
      }), {
        headers: corsHeaders,
        status: 400
      });
    }

    const { courseId, creator, buyer, title, cost, txHash } = body;

    // 简单验证必要字段
    if (!courseId || !creator || !buyer || !title || cost === undefined) {
      return new Response(JSON.stringify({ 
        error: '缺少必要字段', 
        required: ['courseId', 'creator', 'buyer', 'title', 'cost'] 
      }), {
        headers: corsHeaders,
        status: 400
      });
    }

    // 获取现有购买记录，kv 存储
    const existingRecords = await env.PURCHASE_RECORDS.get('all');
    let purchaseRecords = [];
    
    if (existingRecords) {
      try {
        purchaseRecords = JSON.parse(existingRecords);
      } catch (error) {
        purchaseRecords = [];
      }
    }

    // 查找是否已存在该课程的记录
    const existingRecordIndex = purchaseRecords.findIndex(record => record.courseId === courseId);

    if (existingRecordIndex !== -1) {
      // 更新现有记录
      const existingRecord = purchaseRecords[existingRecordIndex];
      
      // 检查买家是否已经购买过
      if (!existingRecord.buyers.includes(buyer)) {
        existingRecord.buyers.push(buyer);
        existingRecord.count = existingRecord.buyers.length;
        existingRecord.txHash = txHash || existingRecord.txHash;
      }
      
      purchaseRecords[existingRecordIndex] = existingRecord;
    } else {
      // 创建新记录
      const newRecord = {
        courseId,
        creator,
        buyers: [buyer],
        title,
        count: 1,
        cost,
        txHash: txHash || ''
      };
      
      purchaseRecords.push(newRecord);
    }

    // 保存到存储
    await env.PURCHASE_RECORDS.put('all', JSON.stringify(purchaseRecords));

    // 同时更新课程创建者的课程数据中的buyer数组
    await updateCourseBuyers(env, creator, courseId, buyer);

    return new Response(JSON.stringify({
      success: true,
      message: '购买记录保存成功',
      data: { courseId, creator, buyer, title, cost, txHash }
    }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    console.error('记录购买错误:', error);
    return new Response(JSON.stringify({ 
      error: '记录购买失败', 
      message: error.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

// 更新所有课程汇总数据
async function updateAllCoursesSummary(env, courseId, content, title, cost, address, description, cover, buyer, txHash) {
  try {
    // 获取现有的汇总数据
    const summaryData = await env.COURSE_DATA.get('all_courses_summary');
    let allCourses = [];
    
    if (summaryData) {
      try {
        allCourses = JSON.parse(summaryData);
      } catch (error) {
        allCourses = [];
      }
    }

    // 添加新课程到汇总数据
    allCourses.push({
      courseId,
      content,
      title,
      cost,
      address,
      description: description || '',
      cover: cover || '',
      buyer: buyer,
      txHash: txHash || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 保存汇总数据
    await env.COURSE_DATA.put('all_courses_summary', JSON.stringify(allCourses));
    
  } catch (error) {
    console.error('更新课程汇总失败:', error);
    // 这里不抛出错误，因为主流程不应该因为汇总更新失败而失败
  }
}

// 获取特定课程的购买记录
async function getCoursePurchases(courseId, env, corsHeaders) {
  try {
    // 获取所有购买记录，kv 存储
    const purchaseRecords = await env.PURCHASE_RECORDS.get('all');
    
    // 如果没有记录，返回空数组
    if (!purchaseRecords) {
      return new Response(JSON.stringify({ courseId, purchases: [] }), {
        headers: corsHeaders,
        status: 200
      });
    }

    // 解析购买记录
    const records = JSON.parse(purchaseRecords);
    
    // 查找特定课程的记录
    const courseRecord = records.find(record => record.courseId === courseId);
    
    // 如果没有找到，返回空数组
    if (!courseRecord) {
      return new Response(JSON.stringify({ courseId, purchases: [] }), {
        headers: corsHeaders,
        status: 200
      });
    }

    // 返回课程购买记录
    return new Response(JSON.stringify({
      courseId,
      purchases: courseRecord
    }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    console.error('获取课程购买记录错误:', error);
    return new Response(JSON.stringify({ 
      error: '获取课程购买记录失败', 
      message: error.message 
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

// 获取所有购买记录
async function getAllPurchases(env, corsHeaders) {
  try {
    // 获取所有购买记录
    const purchaseRecords = await env.PURCHASE_RECORDS.get('all');
    
    // 如果没有记录，返回空数组
    if (!purchaseRecords) {
      return new Response(JSON.stringify({ purchases: [] }), {
        headers: corsHeaders,
        status: 200
      });
    }

    // 解析购买记录
    const records = JSON.parse(purchaseRecords);
    
    // 返回所有购买记录
    return new Response(JSON.stringify({
      purchases: records,
      total: records.length
    }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    console.error('获取所有购买记录错误:', error);
    return new Response(JSON.stringify({ 
      error: '获取所有购买记录失败', 
      message: error.message 
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}

// 🆕 更新课程数据中的buyer数组
async function updateCourseBuyers(env, creatorAddress, courseId, buyerAddress) {
  try {
    // 获取创建者的课程数据
    const creatorCourses = await env.COURSE_DATA.get(creatorAddress);
    if (!creatorCourses) {
      return; // 没有课程数据，无需处理
    }

    let courses = [];
    try {
      courses = JSON.parse(creatorCourses);
    } catch (error) {
      console.error('解析创建者课程数据失败:', error);
      return;
    }

    // 查找对应课程
    const courseIndex = courses.findIndex(course => course.courseId === courseId);
    if (courseIndex === -1) {
      return; // 课程不存在，无需处理
    }

    // 更新buyer数组
    const course = courses[courseIndex];
    if (!course.buyer) {
      course.buyer = [];
    }
    
    // 如果买家不在列表中，添加进去
    if (!course.buyer.includes(buyerAddress)) {
      course.buyer.push(buyerAddress);
    }

    // 保存更新后的课程数据
    await env.COURSE_DATA.put(creatorAddress, JSON.stringify(courses));

    // 同时更新全局汇总数据
    await updateAllCoursesSummary(env, courseId, course.content, course.title, course.cost, creatorAddress, course.description, course.cover, course.buyer, course.txHash);
    
  } catch (error) {
    console.error('更新课程buyer数组失败:', error);
    // 这里不抛出错误，因为主流程不应该因为同步更新失败而失败
  }
}

// 🆕 检查学生是否购买过特定课程
async function checkStudentPurchase(courseId, studentAddress, env, corsHeaders) {
  try {
    // 获取所有购买记录
    const purchaseRecords = await env.PURCHASE_RECORDS.get('all');
    
    // 如果没有记录，返回未购买
    if (!purchaseRecords) {
      return new Response(JSON.stringify({
        courseId,
        studentAddress,
        hasPurchased: false,
        message: '该学生未购买过任何课程'
      }), {
        headers: corsHeaders,
        status: 200
      });
    }

    // 解析购买记录
    const records = JSON.parse(purchaseRecords);
    
    // 查找特定课程的记录
    const courseRecord = records.find(record => record.courseId === courseId);
    
    // 如果没有找到该课程的记录，返回未购买
    if (!courseRecord) {
      return new Response(JSON.stringify({
        courseId,
        studentAddress,
        hasPurchased: false,
        message: '该课程暂无购买记录'
      }), {
        headers: corsHeaders,
        status: 200
      });
    }

    // 检查学生是否在购买者列表中
    const hasPurchased = courseRecord.buyers.includes(studentAddress);
    
    return new Response(JSON.stringify({
      courseId,
      studentAddress,
      hasPurchased,
      courseTitle: courseRecord.title,
      courseCost: courseRecord.cost,
      message: hasPurchased ? '该学生已购买此课程' : '该学生未购买此课程'
    }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    console.error('检查学生购买记录错误:', error);
    return new Response(JSON.stringify({ 
      error: '检查学生购买记录失败', 
      message: error.message 
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}
