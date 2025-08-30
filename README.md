# Web3大学平台

## 项目简介
这是一个基于区块链技术的去中心化教育平台，集成了智能合约、钱包连接、课程管理和代币系统等功能。

## 主要功能

### 学生端（桌面端）
- **课程浏览**: 展示链上课程列表，支持课程详情查看
- **钱包连接**: 集成以太坊钱包，支持ENS地址显示
- **网络切换**: 支持测试网、本地网络等不同区块链环境
- **课程购买**: 使用YD代币购买课程，支持智能合约交互
- **代币兑换**: 提供YD代币兑换功能

### 作者端（移动端）
- **课程管理**: 创建、编辑和管理课程内容
- **AI辅助**: 集成AI润色功能，提升课程内容质量
- **区块链存储**: 课程元数据存储在区块链上
- **传统存储**: 课程详细内容存储在传统Web2数据库中

### 🆕 Cloudflare Workers 集成
- **课程数据存储**: 使用Workers KV存储课程详细信息
- **购买记录管理**: 记录和查询课程购买信息
- **Web2数据层**: 配合智能合约提供完整的数据存储方案

## 技术架构

### 前端技术栈
- **React 18**: 现代化的用户界面框架
- **Vite**: 快速的构建工具
- **shadcn/ui**: 现代化的UI组件库
- **Tailwind CSS**: 实用优先的CSS框架
- **Wagmi**: 以太坊钱包连接和智能合约交互
- **TypeScript**: 类型安全的JavaScript

### 区块链集成
- **钱包连接**: MetaMask、WalletConnect等主流钱包
- **网络支持**: 以太坊主网、测试网、本地开发网络

### 🆕 后端服务
- **Cloudflare Workers**: 边缘计算服务
- **Workers KV**: 高性能键值存储
- **RESTful API**: 标准化的数据接口

## 项目结构
```
web3-college/
├── src/                    # 前端应用代码
├── workers/                # 🆕 Cloudflare Workers服务
│   ├── src/               # Workers源代码
│   ├── examples/          # 前端集成示例
│   ├── test/              # 功能测试
│   ├── package.json       # Workers依赖
│   └── wrangler.toml      # Workers配置
├── public/                 # 静态资源
├── package.json            # 项目依赖
└── README.md              # 项目说明
```

## 🆕 Cloudflare Workers 功能详解

### 数据存储结构

#### 课程数据 (COURSE_DATA)
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

#### 购买记录 (PURCHASE_RECORDS)
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

### API接口

#### 课程管理
- `POST /api/courses` - 创建/更新课程
- `GET /api/courses/{address}` - 获取用户课程
- `GET /api/courses` - 获取所有课程

#### 购买记录
- `POST /api/purchases` - 记录课程购买
- `GET /api/purchases/{courseId}` - 获取课程购买记录
- `GET /api/purchases` - 获取所有购买记录

#### 系统监控
- `GET /api/health` - 服务健康检查

### 使用方式

#### 1. 部署Workers
```bash
cd workers
npm install
npm run deploy
```

#### 2. 前端集成
```javascript
import { WorkersAPIService } from './workers/examples/frontend-integration.js';

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

## 安装和运行

### 环境要求
- Node.js 18+
- npm 或 yarn
- Cloudflare账户（用于Workers部署）

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 🆕 部署Workers
```bash
cd workers
chmod +x deploy.sh
./deploy.sh
```

## 使用说明

### 学生端使用
1. 连接钱包（MetaMask等）
2. 选择网络环境（测试网/本地网络）
3. 浏览可用课程
4. 使用YD代币购买课程
5. 查看课程详情和学习进度

### 作者端使用
1. 连接钱包验证身份
2. 创建新课程（标题、内容、价格）
3. 使用AI润色功能优化内容
4. 发布课程到区块链
5. 管理已创建的课程

### 🆕 Workers集成使用
1. 部署Cloudflare Workers服务
2. 配置KV命名空间
3. 在前端调用API接口
4. 监控服务运行状态

## 平台功能

### 课程管理
- 课程创建和存储
- 课程购买验证
- 用户权限管理

### 代币系统
- YD代币的铸造和转账
- 代币兑换机制
- 质押系统

## 开发注意事项
- 确保钱包已连接并选择正确的网络
- 测试网需要获取测试代币
- 🆕 Workers需要配置正确的KV命名空间

## 未来规划
- 增加更多区块链网络支持
- 优化用户界面和用户体验
- 添加更多AI功能
- 实现去中心化存储
- 增加社区功能
- 🆕 扩展Workers功能（搜索、分类、权限管理等）

## 项目完成状态

### ✅ 已完成功能
- **前端应用**: 完整的React + Vite + Material-UI应用
- **钱包集成**: Wagmi集成，支持MetaMask等主流钱包
- **学生端**: 课程浏览、购买、代币兑换
- **作者端**: 课程创建、管理
- **响应式设计**: 支持桌面端和移动端
- 🆕 **Cloudflare Workers**: 完整的Web2数据存储服务

### 🔧 技术特性
- **现代化架构**: React 18 + TypeScript + Vite
- **UI组件库**: Material-UI 5 + 自定义主题
- **区块链集成**: Wagmi + Viem
- **开发工具**: ESLint + Prettier
- 🆕 **边缘计算**: Cloudflare Workers + KV存储

### 📱 用户体验
- **直观界面**: 清晰的功能分区和导航
- **实时反馈**: 操作状态提示和错误处理
- **钱包集成**: 无缝的钱包连接和网络切换
- **响应式布局**: 适配不同屏幕尺寸
- 🆕 **数据同步**: 区块链与Web2数据的无缝集成

## 快速开始

### 一键启动
```bash
./start.sh
```

### 手动启动
```bash
npm install
npm run dev
```

### 🆕 Workers部署
```bash
cd workers
./deploy.sh
```

详细说明请查看 [QUICKSTART.md](./QUICKSTART.md)

## 技术支持
如有问题，请查看代码注释、QUICKSTART.md文档或联系开发团队。

## 项目反思与改进

### 🎯 项目亮点
1. **完整的技术栈**: 从前端UI到后端服务的完整实现
2. **用户体验**: 直观的界面设计和流畅的交互
3. **代码质量**: 清晰的代码结构和完善的注释
4. **可扩展性**: 模块化设计，易于添加新功能
5. 🆕 **数据架构**: 区块链+Web2的混合存储方案

### 🔍 改进方向
1. **AI集成**: 实现真实的AI润色功能
2. **去中心化存储**: 集成IPFS等去中心化存储
3. **性能优化**: 实现虚拟滚动、懒加载等优化
4. **安全增强**: 添加更多安全检查和审计
5. **移动端优化**: 进一步优化移动端体验
6. 🆕 **Workers优化**: 实现更高效的数据查询和缓存

### 🚀 未来规划
1. **多链支持**: 扩展到其他区块链网络
2. **社区功能**: 添加评论、评分、讨论等
3. **NFT集成**: 课程证书NFT化
4. **DeFi功能**: 添加流动性挖矿、治理代币等
5. 🆕 **Workers扩展**: 支持D1数据库、文件上传、搜索等
