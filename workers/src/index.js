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

    const { address, courseId, content, title, cost } = body;

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
      // 更新现有课程
      userCourses[existingCourseIndex] = { courseId, content, title, cost };
    } else {
      // 添加新课程
      userCourses.push({ courseId, content, title, cost });
    }

    // 保存到存储
    await env.COURSE_DATA.put(address, JSON.stringify(userCourses));

    return new Response(JSON.stringify({
      success: true,
      message: existingCourseIndex !== -1 ? '课程更新成功' : '课程创建成功',
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
    // 获取用户课程数据
    const coursesData = await env.COURSE_DATA.get(address);
    
    // 如果没有数据，返回空数组
    if (!coursesData) {
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
    return new Response(JSON.stringify({
      address,
      courses
    }), {
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
    // 注意：这里需要实现一个更高效的方式来获取所有课程
    // 在实际生产环境中，可能需要使用D1数据库或其他更适合的存储方案
    // 这里提供一个基础实现
    
    const allCourses = [];
    
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

    const { courseId, creator, buyer, title, cost } = body;

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
        cost
      };
      
      purchaseRecords.push(newRecord);
    }

    // 保存到存储
    await env.PURCHASE_RECORDS.put('all', JSON.stringify(purchaseRecords));

    return new Response(JSON.stringify({
      success: true,
      message: '购买记录保存成功',
      data: { courseId, creator, buyer, title, cost }
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
