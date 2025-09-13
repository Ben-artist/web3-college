# 端到端测试说明

## 测试结构

```
tests/e2e/
├── support/
│   └── e2e.ts              # 测试支持文件和自定义命令
├── fixtures/
│   └── courses.json        # 测试数据
├── specs/
│   ├── student-page.cy.ts      # 学生页面测试
│   ├── author-page.cy.ts       # 作者页面测试
│   ├── create-course-page.cy.ts # 创建课程页面测试
│   ├── course-detail-page.cy.ts # 课程详情页面测试
│   └── wallet-connection.cy.ts  # 钱包连接测试
└── README.md               # 本文件
```

## 运行测试

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 运行端到端测试
```bash
# 在 Cypress 测试界面中运行
npm run test:e2e

# 或者在命令行中运行
npx cypress run
```

## 测试覆盖范围

### 学生页面测试 (`student-page.cy.ts`)
- ✅ 页面标题和导航显示
- ✅ 课程列表显示
- ✅ 课程详情跳转
- ✅ 课程搜索功能
- ✅ 页面标签切换
- ✅ 钱包连接功能
- ✅ 钱包断开功能

### 作者页面测试 (`author-page.cy.ts`)
- ✅ 作者页面标题显示
- ✅ 已创建课程列表
- ✅ 创建课程按钮
- ✅ 课程编辑功能
- ✅ 课程删除功能
- ✅ 用户名设置功能

### 创建课程页面测试 (`create-course-page.cy.ts`)
- ✅ 创建课程表单显示
- ✅ 课程信息填写
- ✅ 课程预览功能
- ✅ AI 扩写功能
- ✅ 课程创建功能
- ✅ 必填字段验证
- ✅ 价格格式验证
- ✅ 取消创建功能

### 课程详情页面测试 (`course-detail-page.cy.ts`)
- ✅ 课程详情显示
- ✅ Markdown 内容渲染
- ✅ 作者信息显示
- ✅ 课程购买功能
- ✅ 购买取消功能
- ✅ 课程统计信息
- ✅ 返回课程列表
- ✅ 课程分享功能
- ✅ 课程不存在处理

### 钱包连接测试 (`wallet-connection.cy.ts`)
- ✅ MetaMask 钱包连接
- ✅ 钱包断开功能
- ✅ 连接失败处理
- ✅ 未安装 MetaMask 处理
- ✅ 网络切换功能
- ✅ 用户名设置功能
- ✅ 交易历史查看

## 自定义命令

### `cy.mockWalletConnection()`
模拟 MetaMask 钱包连接，设置必要的 ethereum 对象。

### `cy.waitForPageLoad()`
等待页面完全加载，包括检查加载状态。

### `cy.mockCourseData()`
模拟课程数据 API 调用，返回测试用的课程列表。

## 测试数据

测试数据存储在 `fixtures/courses.json` 中，包含：
- 课程列表数据
- 用户信息数据
- 模拟的区块链地址和余额

## 注意事项

1. **测试环境**：确保开发服务器运行在 `http://localhost:3000`
2. **钱包模拟**：测试使用模拟的 MetaMask 钱包，不会进行真实交易
3. **API 模拟**：所有 API 调用都被模拟，不会访问真实后端
4. **数据隔离**：每个测试用例都是独立的，不会相互影响

## 调试技巧

1. **查看测试运行**：使用 `cypress open` 在浏览器中查看测试运行
2. **截图和视频**：测试失败时会自动截图，可以查看 `screenshots` 和 `videos` 目录
3. **控制台日志**：在测试中添加 `cy.log()` 来输出调试信息
4. **暂停测试**：使用 `cy.pause()` 来暂停测试进行调试

## 扩展测试

要添加新的测试用例：

1. 在 `specs/` 目录下创建新的 `.cy.ts` 文件
2. 在 `support/e2e.ts` 中添加自定义命令（如需要）
3. 在 `fixtures/` 目录下添加测试数据（如需要）
4. 更新本 README 文件

## 持续集成

这些测试可以集成到 CI/CD 流程中：

```yaml
# GitHub Actions 示例
- name: Run E2E tests
  run: |
    npm run dev &
    npx cypress run --browser chrome
```
