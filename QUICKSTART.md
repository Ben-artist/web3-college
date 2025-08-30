# 🚀 Web3大学平台 - 快速开始指南

## 📋 前置要求

- **Node.js 18+** - [下载地址](https://nodejs.org/)
- **MetaMask 钱包** - [下载地址](https://metamask.io/)
- **Git** - 用于克隆项目

## 🏃‍♂️ 快速开始

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd web3-college
```

### 2. 一键启动（推荐）
```bash
./start.sh
```

### 3. 手动启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 🌐 访问应用

启动成功后，在浏览器中访问：

- **学生端（桌面端）**: http://localhost:3000/
- **作者端（移动端）**: http://localhost:3000/author

## 🔗 连接钱包

1. 点击右上角的"连接钱包"按钮
2. 选择 MetaMask 钱包
3. 在 MetaMask 中确认连接
4. 选择正确的网络（推荐使用测试网）

## 📱 功能体验

### 学生端功能
- ✅ 浏览可用课程
- ✅ 连接钱包
- ✅ 切换网络
- ✅ 购买课程（需要钱包连接）
- ✅ 代币兑换（需要钱包连接）

### 作者端功能
- ✅ 创建新课程
- ✅ 管理已创建课程
- ✅ 查看区块链存储信息

## 🔧 开发模式

### 启动开发服务器
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🌍 网络配置

### 测试网（推荐）
- **Sepolia**: 以太坊测试网
- 需要测试ETH（可以从水龙头获取）

### 主网
- **Ethereum**: 以太坊主网
- 需要真实ETH

## 📚 学习资源

- [React 官方文档](https://react.dev/)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Wagmi 文档](https://wagmi.sh/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

## 🐛 常见问题

### Q: 钱包连接失败
A: 确保已安装 MetaMask 并解锁钱包

### Q: 网络切换失败
A: 在 MetaMask 中手动添加网络，或使用测试网

### Q: API调用失败
A: 检查网络连接和Workers服务状态

### Q: 页面显示异常
A: 清除浏览器缓存，重新加载页面

## 📞 技术支持

如果遇到问题，请：

1. 检查控制台错误信息
2. 查看 README.md 文档
3. 提交 Issue 到项目仓库

## 🎯 下一步

- [ ] 部署Workers到生产环境
- [ ] 集成真实AI API
- [ ] 添加更多课程类型
- [ ] 实现去中心化存储
- [ ] 优化移动端体验

---

**祝您使用愉快！🎉**
