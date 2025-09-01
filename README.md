# Web3大学平台

## 项目简介
这是一个基于区块链技术的去中心化教育平台，集成了智能合约、钱包连接、课程管理和代币系统等功能。

## 🆕 最新功能更新

### 🚀 Stream模式AI API集成
- **实时流式响应**: DeepSeek API现在支持stream模式，提供更流畅的AI内容生成体验
- **实时内容显示**: 用户可以实时看到AI生成的内容，无需等待完整响应
- **双模式支持**: 同时保留原有的非流式API作为备用方案
- **性能优化**: 减少用户等待时间，提升交互体验

### ✨ 全新Markdown编辑器
- **Ant Design X集成**: 使用现代化的UI组件库，提供专业的编辑体验
- **实时预览**: 左侧编辑，右侧实时显示Markdown渲染效果
- **智能工具栏**: 内置常用Markdown语法快捷按钮（粗体、斜体、标题、列表等）
- **键盘快捷键**: 支持Ctrl+B(粗体)、Ctrl+I(斜体)、Ctrl+K(链接)、Tab(缩进)等快捷键
- **自动高度调整**: 编辑器高度根据内容自动调整，提供更好的编辑体验
- **字符计数**: 实时显示内容字符数，帮助用户控制内容长度

### 🔧 技术特性
- **Stream API实现**: 使用Fetch API的ReadableStream实现流式数据处理
- **事件驱动架构**: 支持onChunk、onComplete、onError等回调函数
- **错误处理**: 完善的错误处理和用户提示机制
- **性能优化**: 防抖处理，避免频繁的状态更新

### 🎯 功能演示
- **演示页面**: 访问 `/demo` 路径体验所有新功能
- **Stream API演示**: 实时体验AI内容生成的流式响应
- **Markdown编辑器演示**: 体验现代化的Markdown编辑功能
- **交互式学习**: 通过实际操作了解新功能的使用方法

### 🎨 AI封面图生成修复
- **Coze API结构修复**: 修复了AI生图API返回数据的解析问题，正确提取`data.output`中的图片URL
- **提示词精简**: 大幅简化AI生图的提示词，从复杂的100字要求简化为简洁的课程标题和描述
- **类型化风格**: 支持技术、商业、艺术、科学、语言等不同课程类型的封面图生成
- **错误处理优化**: 增强了API调用的错误处理和调试信息

### 🔍 API调试增强
- **详细日志记录**: 在Workers中添加了完整的API调用日志，包括数据接收、存储和返回的全过程
- **字段完整性检查**: 自动检查description和cover字段在数据传递过程中的完整性
- **存储验证**: 在数据存储后立即验证，确保字段没有丢失
- **调试工具**: 提供了专门的测试文件来验证API功能的正确性

### 🎯 CourseManager合约修复
- **TSK奖励机制**: 修复了创建课程时作者无法获得10 TSK奖励的问题
- **新增createCourse函数**: 添加了专门的课程创建函数，自动处理奖励发放
- **完善课程管理**: 增加了课程信息存储、作者映射和查询功能
- **优化购买流程**: 简化了购买逻辑，自动处理平台费用分配
- **合约测试工具**: 提供了完整的测试脚本来验证合约功能

## 主要功能

### 学生端（桌面端）
- **课程浏览**: 展示链上课程列表，支持课程详情查看
- **钱包连接**: 集成以太坊钱包，支持ENS地址显示
- **网络切换**: 支持测试网、本地网络等不同区块链环境
- **课程购买**: 使用YD代币购买课程，支持智能合约交互
- **🆕 代币兑换**: 集成TokenExchange智能合约，支持ETH与平台代币的双向兑换

### 作者端（移动端）
- **课程管理**: 创建、编辑和管理课程内容
- **AI辅助**: 集成AI润色功能，提升课程内容质量（仅限课程内容，标题需手动输入）
- **🎨 AI封面图生成**: 使用Coze API根据课程类型自动生成专业封面图
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
- **智能合约**: TSKToken合约，支持ETH兑换TSK代币

### 🆕 后端服务
- **Cloudflare Workers**: 边缘计算服务
- **Workers KV**: 高性能键值存储
- **RESTful API**: 标准化的数据接口
- **🎨 Coze API**: AI封面图生成服务，支持多种课程类型和风格

## 项目结构
```
web3-college/
├── src/                    # 前端应用代码
│   ├── services/          # 🆕 API服务层
│   │   └── api.ts         # 统一API服务
│   ├── components/        # UI组件
│   ├── pages/            # 页面组件
│   ├── hooks/            # 自定义Hooks
│   ├── config/           # 配置文件
│   ├── contracts/        # 合约ABI
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   └── styles/           # 样式文件
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

## 🆕 智能合约功能详解

### 🆕 重要更新：ETH与TSK兑换比例
**当前兑换比例**: 1 ETH = 1000 TSK（已从1:100更新为1:1000）

**前端实现**: TokenExchange组件已硬编码兑换比例为1000，确保显示一致性

### 🆕 课程购买功能详解
**完整购买流程**: 学生购买课程时，系统会自动执行以下步骤：
1. **余额检查**: 验证学生TSK代币余额是否足够支付课程费用
2. **TSK转账**: 调用TSKToken合约的transfer函数，将课程费用从学生钱包转账到作者钱包
3. **购买记录**: 调用CourseManager合约的addBuyerToCourse函数，将学生地址添加到课程的购买者列表
4. **数据同步**: 更新Workers API的购买记录，确保Web2和Web3数据一致
5. **状态更新**: 更新前端UI，显示购买成功状态

**技术特性**:
- **实时余额检查**: 使用useReadContract hook实时查询TSK余额
- **交易状态跟踪**: 使用useWriteContract hook跟踪转账和购买交易状态
- **错误处理**: 完善的错误提示和用户反馈机制
- **自动刷新**: 交易完成后自动刷新TSK余额和课程状态

**用户体验**:
- **一键购买**: 点击购买按钮即可完成整个购买流程
- **实时反馈**: 显示交易进行状态和结果提示
- **余额不足提示**: 当TSK余额不足时，显示详细的余额信息
- **购买状态**: 已购买的课程显示"已购买"状态，防止重复购买

### TSKToken合约
- **合约地址**: `0x9e78396494C8C57a66D462d487a4c49EA88aa82D` (最新部署)
- **主要功能**:
  - `swapETHForTSK(uint256 amount)`: 将指定数量的ETH兑换为TSK代币（1 ETH = 1000 TSK）
  - `approve(address spender, uint256 amount)`: 授权代币使用
  - `balanceOf(address account)`: 查询账户TSK余额
  - `mint(address to, uint256 amount)`: 铸造代币（仅限合约拥有者）
- **兑换流程**: 用户调用合约方法并发送对应数量的ETH，获得相应数量的TSK代币

#### 🆕 CourseManager合约
- **合约地址**: `0x0C0D6623D36a1BE389747bB9E9156a00828F4F25`
- **主要功能**:
  - `addBuyerToCourse(uint256 _courseId, address _buyer)`: 添加购买者到课程
  - `getCourseBuyers(uint256 _courseId)`: 获取课程的购买者列表
  - `isBuyerInCourse(uint256 _courseId, address _buyer)`: 检查用户是否已购买课程
  - `BuyerAdded` 事件: 记录购买者添加事件
- **集成方式**: 
  - 课程创建时自动初始化合约
  - 用户购买时调用合约记录购买状态
  - 支持查询购买历史和验证购买状态

#### 🆕 TokenExchange合约
- **主要功能**:
  - `buyToken(address _recipient)`: 用ETH购买代币，支持指定接收地址
  - `sellToken(uint256 amount)`: 卖出指定数量的代币获得ETH
  - `EXCHANGE_RATE()`: 查看当前兑换汇率
  - `TOKEN_ADDRESS()`: 获取关联的代币合约地址
- **兑换特性**: 
  - 双向兑换：ETH ↔ 代币
  - 实时汇率：自动从合约读取最新汇率
  - 灵活接收：购买时可指定代币接收地址
  - 完整事件：记录所有兑换交易（TokensBought、TokensSold）

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
      "cost": 100,
      "description": "课程简介描述",
      "cover": "https://example.com/cover.jpg",
      "buyer": ["0x1234...", "0x5678..."],
      "txHash": "0xabcd..."
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
- `POST /api/courses` - 创建新课程
- `GET /api/courses/{address}` - 获取用户课程
- `GET /api/courses` - 获取所有课程

#### 购买记录
- `POST /api/purchases` - 记录课程购买
- `GET /api/purchases/{courseId}` - 获取课程购买记录
- `GET /api/purchases` - 获取所有购买记录
- `GET /api/purchases/check/{courseId}/{studentAddress}` - 检查学生是否购买过特定课程

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
```typescript
import { WorkersAPIService, DeepSeekAPIService, API_CONFIG } from '../services/api';

// 获取所有课程
const allCourses = await WorkersAPIService.getAllCourses();

// 创建课程（支持描述、封面、交易哈希）
const result = await WorkersAPIService.createCourse(
  '0x1234...',  // 用户地址
  'course-123', // 课程ID
  '课程内容',    // 内容
  '课程标题',    // 标题
  100,          // 价格
  '这是一个关于Web3开发的入门课程', // 描述
  'https://example.com/cover.jpg',  // 封面URL
  '0xabcd...'   // 交易哈希
);

// 检查学生是否购买过课程
const purchaseStatus = await WorkersAPIService.checkStudentPurchase(
  'course-123', // 课程ID
  '0x5678...'   // 学生地址
);

// CourseManager合约集成
import { CourseManagerService, API_CONFIG } from '../services/api';

// 获取CourseManager合约地址
const courseManagerAddress = API_CONFIG.COURSE_MANAGER_ADDRESS;

// 添加购买者到课程
const addBuyerParams = await CourseManagerService.addBuyerToCourse(
  123,           // 课程ID (数字)
  '0x5678...'   // 购买者地址
);

// 检查用户是否已购买课程
const isBuyerParams = await CourseManagerService.isBuyerInCourse(
  123,           // 课程ID (数字)
  '0x5678...'   // 用户地址
);

// 获取课程购买者列表
const getBuyersParams = await CourseManagerService.getCourseBuyers(123);

// 记录购买（支持交易哈希）
await WorkersAPIService.recordPurchase(
  'course-123', // 课程ID
  '0x1234...',  // 创作者
  '0x5678...',  // 购买者
  '课程标题',    // 标题
  100,          // 价格
  '0xefgh...'   // 交易哈希
);

// AI美化课程内容
const beautifiedContent = await DeepSeekAPIService.beautifyCourseContent('原始内容');

// 获取合约地址
const tskTokenAddress = API_CONFIG.TSK_TOKEN_ADDRESS;
```

## 🆕 API服务层架构

### 服务模块

#### WorkersAPIService
- **createCourse**: 创建新课程（支持描述、封面、交易哈希）
- **getUserCourses**: 获取用户课程
- **getAllCourses**: 获取所有课程
- **recordPurchase**: 记录购买
- **checkStudentPurchase**: 检查学生是否购买过特定课程
- **healthCheck**: 健康检查

#### 🎨 CozeAPIService
- **generateCoverImage**: 根据课程信息生成封面图
- **generateTypedCoverImage**: 根据课程类型生成特定风格的封面图
- **generateMultipleCoverOptions**: 批量生成多个封面图选项

#### ContractAPIService
- **getTSKTokenAddress**: 获取TSK代币合约地址
- 预留智能合约交互接口

### 配置管理
- **API_CONFIG**: 统一管理所有API配置
- 支持环境变量配置
- 类型安全的配置访问

## 🆕 Markdown内容支持

### 功能特性
- **Markdown渲染**: 使用markdown-it库渲染课程内容
- **格式丰富**: 支持标题、列表、链接、代码块等
- **即时预览**: 本地渲染，无网络延迟
- **响应式设计**: 适配各种设备尺寸

### 支持的语法
- **文本格式**: 粗体、斜体、删除线
- **标题**: H1-H6标题层级
- **列表**: 有序和无序列表
- **链接和图片**: 超链接和图片嵌入
- **代码**: 行内代码和代码块
- **引用**: 引用文本块
- **表格**: 标准Markdown表格

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
3. 使用AI美化功能优化课程内容
   - 点击"AI美化(Stream)"按钮美化内容
   - 预览美化后的内容
   - 确认无误后点击"应用美化内容"按钮
   - 或点击"取消并保持原内容"按钮保持原内容
4. 选择课程类型，使用AI生成封面图
5. 点击"预览课程"按钮查看课程效果（弹窗显示）
6. 点击"创建课程"按钮完成创建
5. 发布课程到区块链
6. 管理已创建的课程

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
- 🆕 **课程管理**: 支持创建新课程，包含描述、封面、购买者列表和交易哈希
- 🆕 **购买标记**: 支持查询学生购买状态
- 🆕 **作者界面**: 简洁的课程创建和管理页面
- 🆕 **学生界面**: 优化的课程展示，只显示封面、标题和描述
- 🎨 **AI封面图生成**: 集成Coze API，支持多种课程类型的智能封面图生成
- 🆕 **TokenExchange集成**: 完整的ETH与代币双向兑换功能，支持实时汇率和余额管理（当前汇率：1 ETH = 1000 TSK）

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
6. **AI功能优化**: 课程标题手动输入，内容AI美化，封面图AI生成

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
6. 🆕 **权限管理**: 实现更细粒度的课程编辑和删除权限控制
7. 🆕 **购买历史**: 为学生提供完整的购买历史记录查询
8. 🎨 **封面图优化**: 支持更多风格选项、批量生成、用户自定义等
9. 🆕 **TokenExchange增强**: 支持更多代币类型、流动性池、限价单交易等高级功能

### ✅ 最新完成的功能调整
- **课程标题输入优化**: 移除了课程标题的AI美化功能，改为纯手动输入，确保标题的准确性和用户控制
- **保留AI功能**: 课程内容AI美化和封面图AI生成功能保持不变
- **用户体验提升**: 简化了课程创建流程，让用户更专注于内容创作
- **界面清理**: 移除了课程标题输入框旁边的AI美化按钮和魔法棒图标
- **提示文字更新**: 将"使用AI美化按钮可以让标题更加吸引人"改为"请输入清晰、简洁的课程标题"
