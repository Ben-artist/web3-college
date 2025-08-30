# Web3 College Cloudflare Workers

## 项目简介
这是Web3大学平台的Cloudflare Workers服务，提供课程数据和购买记录的Web2存储功能，配合智能合约使用。

## 功能特性

### 🎓 课程管理
- **创建课程**: 将课程数据存储到Web2数据库
- **获取课程**: 根据用户地址获取创建的课程列表
- **数据格式**: `address:[{课程id，content，title, cost}]`

### 💰 购买记录
- **记录购买**: 记录用户购买课程的信息
- **查询记录**: 获取特定课程或所有课程的购买记录
- **数据格式**: `[{creator, buyer:[address1,address2], title, count, cost}]`

## API接口

### 课程相关接口

#### 创建课程
```http
POST /api/courses
Content-Type: application/json

{
  "address": "0x1234...",
  "courseId": 1,
  "content": "课程内容",
  "title": "课程标题",
  "cost": 100
}
```

#### 获取用户课程
```http
GET /api/courses/{address}
```

#### 获取所有课程
```http
GET /api/courses
```

### 购买记录相关接口

#### 记录课程购买
```http
POST /api/purchases
Content-Type: application/json

{
  "courseId": 1,
  "creator": "0x1234...",
  "buyer": "0x5678...",
  "title": "课程标题",
  "cost": 100
}
```

#### 获取课程购买记录
```http
GET /api/purchases/{courseId}
```

#### 获取所有购买记录
```http
GET /api/purchases
```

## 安装和部署

### 环境要求
- Node.js 18+
- Wrangler CLI

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
npm run dev
```

### 部署到Cloudflare
```bash
npm run deploy
```

## 配置说明

### wrangler.toml
```toml
name = "web3-college-workers"
main = "src/index.js"
compatibility_date = "2024-01-01"

# KV命名空间配置
[[kv_namespaces]]
binding = "COURSE_DATA"
id = "your-kv-namespace-id"

[[kv_namespaces]]
binding = "PURCHASE_RECORDS"
id = "your-purchase-kv-namespace-id"
```

### 环境变量
- `COURSE_DATA`: 课程数据KV存储绑定
- `PURCHASE_RECORDS`: 购买记录KV存储绑定

## 数据存储结构

### 课程数据 (COURSE_DATA)
```json
{
  "0x1234...": [
    {
      "courseId": 1,
      "content": "课程内容",
      "title": "课程标题",
      "cost": 100
    }
  ]
}
```

### 购买记录 (PURCHASE_RECORDS)
```json
[
  {
    "courseId": 1,
    "creator": "0x1234...",
    "buyers": ["0x5678...", "0x9abc..."],
    "title": "课程标题",
    "count": 2,
    "cost": 100,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## 使用示例

### 前端调用示例
```javascript
// 创建课程
const createCourse = async (address, courseId, content, title, cost) => {
  const response = await fetch('https://your-worker.your-subdomain.workers.dev/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address,
      courseId,
      content,
      title,
      cost
    })
  });
  
  return await response.json();
};

// 记录购买
const recordPurchase = async (courseId, creator, buyer, title, cost) => {
  const response = await fetch('https://your-worker.your-subdomain.workers.dev/api/purchases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      courseId,
      creator,
      buyer,
      title,
      cost
    })
  });
  
  return await response.json();
};
```

## 错误处理

### 常见错误码
- `400`: 请求参数错误
- `404`: 接口不存在
- `405`: 不支持的请求方法
- `500`: 服务器内部错误

### 错误响应格式
```json
{
  "error": "错误描述",
  "message": "详细错误信息"
}
```

## 安全特性

### CORS支持
- 支持跨域请求
- 允许所有来源访问（生产环境建议限制）

### 数据验证
- 以太坊地址格式验证
- 必要字段检查
- 数据类型验证

## 性能优化

### KV存储
- 使用Cloudflare KV进行快速数据访问
- 支持高并发读取

### 缓存策略
- 响应头包含适当的缓存控制
- 支持ETag和条件请求

## 监控和日志

### 错误日志
- 所有错误都会记录到Cloudflare Workers日志
- 包含详细的错误信息和堆栈跟踪

### 性能监控
- 响应时间监控
- 请求量统计
- 错误率监控

## 扩展功能

### 未来计划
- [ ] 支持课程分类和标签
- [ ] 添加用户权限管理
- [ ] 集成D1数据库
- [ ] 支持文件上传
- [ ] 添加搜索功能

## 技术支持

如有问题，请查看：
1. Cloudflare Workers官方文档
2. 项目代码注释
3. 联系开发团队

## 许可证

MIT License
