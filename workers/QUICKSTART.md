# Cloudflare Workers 快速开始指南

## 🚀 5分钟快速部署

### 1. 准备工作
确保你已经：
- 安装了 Node.js 18+
- 有 Cloudflare 账户
- 安装了 Git

### 2. 克隆项目
```bash
git clone <your-repo-url>
cd web3-college/workers
```

### 3. 安装依赖
```bash
npm install
```

### 4. 登录 Cloudflare
```bash
npx wrangler login
```

### 5. 一键部署
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 手动部署步骤

### 步骤1: 创建 KV 命名空间
```bash
# 创建课程数据命名空间
npx wrangler kv:namespace create "COURSE_DATA"

# 创建购买记录命名空间  
npx wrangler kv:namespace create "PURCHASE_RECORDS"
```

### 步骤2: 更新配置文件
将生成的命名空间ID更新到 `wrangler.toml` 文件中。

### 步骤3: 部署服务
```bash
npx wrangler deploy
```

## 🧪 测试部署

### 健康检查
```bash
curl https://your-worker.your-subdomain.workers.dev/api/health
```

### 创建测试课程
```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "courseId": 1,
    "content": "测试课程内容",
    "title": "测试课程",
    "cost": 100
  }'
```

### 记录测试购买
```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "creator": "0x1234567890123456789012345678901234567890",
    "buyer": "0x0987654321098765432109876543210987654321",
    "title": "测试课程",
    "cost": 100
  }'
```

## 🔧 配置说明

### 环境变量
- `COURSE_DATA`: 课程数据KV存储绑定
- `PURCHASE_RECORDS`: 购买记录KV存储绑定

### 自定义域名
在 `wrangler.toml` 中添加：
```toml
[env.production]
name = "web3-college-workers-prod"
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## 📱 前端集成

### 安装依赖
```bash
npm install
```

### 导入服务
```javascript
import { WorkersAPIService } from './workers/examples/frontend-integration.js';
```

### 使用示例
```javascript
// 创建课程
const result = await WorkersAPIService.createCourse(
  '0x1234...',  // 用户地址
  1,            // 课程ID
  '课程内容',    // 内容
  '课程标题',    // 标题
  100           // 价格
);

// 记录购买
await WorkersAPIService.recordPurchase(
  1,            // 课程ID
  '0x1234...',  // 创作者
  '0x5678...',  // 购买者
  '课程标题',    // 标题
  100           // 价格
);
```

## 🐛 常见问题

### Q: 部署失败怎么办？
A: 检查以下几点：
1. 是否已登录 Cloudflare
2. KV 命名空间是否正确创建
3. 配置文件是否正确

### Q: API 调用失败？
A: 检查：
1. Workers 是否正常部署
2. 请求格式是否正确
3. CORS 设置是否正确

### Q: 数据存储失败？
A: 检查：
1. KV 命名空间权限
2. 数据格式是否正确
3. 网络连接是否正常

## 📊 监控和日志

### 查看日志
```bash
npx wrangler tail
```

### 性能监控
在 Cloudflare Dashboard 中查看：
- 请求量
- 响应时间
- 错误率

## 🔒 安全配置

### 生产环境设置
```toml
[env.production]
name = "web3-college-workers-prod"
vars = { ENVIRONMENT = "production" }

# 限制CORS来源
[[env.production.rules]]
type = "ESModule"
globs = ["**/*.js"]
fallthrough = true
```

### 访问控制
```javascript
// 在代码中添加身份验证
const authHeader = request.headers.get('Authorization');
if (!authHeader || !isValidToken(authHeader)) {
  return new Response('Unauthorized', { status: 401 });
}
```

## 📚 更多资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Workers KV 文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [项目 GitHub 仓库](https://github.com/your-username/web3-college)

## 🆘 获取帮助

如果遇到问题：
1. 查看项目 Issues
2. 联系开发团队
3. 参考官方文档

---

**祝您使用愉快！** 🎉
