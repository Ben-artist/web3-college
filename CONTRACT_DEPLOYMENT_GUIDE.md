# CourseManager合约部署指南

## 🚀 合约更新说明

### 主要改进
1. **新增`createCourse`函数**: 创建课程时自动奖励作者10 TSK
2. **完善课程管理**: 添加课程信息存储和查询功能
3. **优化购买流程**: 简化购买逻辑，自动处理平台费用

### 合约功能

#### 创建课程 (`createCourse`)
```solidity
function createCourse(
    uint256 _courseId,
    string memory _title,
    uint256 _price
) external
```
- 创建新课程
- 作者自动获得10 TSK奖励
- 作者自动成为第一个购买者
- 记录课程信息到区块链

#### 购买课程 (`buyCourse`)
```solidity
function buyCourse(
    uint256 _courseId,
    uint256 _amount
) external
```
- 用户购买课程
- 平台收取1 TSK费用
- 剩余金额转给作者
- 添加买家到课程

#### 查询功能
- `getCourseInfo`: 查询课程信息
- `getCourseBuyers`: 查询课程买家
- `isBuyerInCourse`: 检查是否已购买
- `getCourseAuthor`: 查询课程作者

## 🔧 部署步骤

### 1. 编译合约
```bash
# 使用Hardhat或Remix编译
npx hardhat compile
# 或者使用Remix在线编译器
```

### 2. 部署合约
```bash
# 部署到目标网络（如Sepolia测试网）
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. 更新前端配置
部署完成后，更新以下文件中的合约地址：
- `src/config/wagmi.ts`
- `src/services/api.ts`

### 4. 注入TSK代币
**重要**: 合约部署后，需要向合约地址转入足够的TSK代币，用于奖励作者。

```solidity
// 合约地址需要至少有 1000 TSK (10 TSK × 100个课程)
// 建议转入 2000 TSK 作为奖励池
```

## 📋 部署检查清单

- [ ] 合约编译成功
- [ ] 部署到目标网络
- [ ] 验证合约地址
- [ ] 向合约转入TSK代币
- [ ] 更新前端配置
- [ ] 测试课程创建功能
- [ ] 验证TSK奖励发放

## 🧪 测试步骤

### 1. 创建课程测试
```javascript
// 调用createCourse函数
await courseManager.createCourse(
    1, // courseId
    "Web3开发入门", // title
    ethers.utils.parseEther("10") // price (10 TSK)
)
```

### 2. 检查TSK余额
```javascript
// 检查作者TSK余额是否增加10个
const balance = await tskToken.balanceOf(authorAddress)
```

### 3. 购买课程测试
```javascript
// 用户approve TSK
await tskToken.approve(courseManagerAddress, ethers.utils.parseEther("10"))

// 购买课程
await courseManager.buyCourse(1, ethers.utils.parseEther("10"))
```

## ⚠️ 注意事项

1. **TSK余额**: 确保合约有足够的TSK代币用于奖励
2. **网络选择**: 确保前端和合约在同一网络
3. **权限设置**: 确保用户钱包有足够的TSK余额和授权
4. **错误处理**: 前端需要处理合约调用的各种错误情况

## 🔗 相关文件

- `contracts/CourseManager.sol`: 合约源码
- `src/pages/CreateCoursePage.tsx`: 前端创建课程逻辑
- `src/services/api.ts`: API服务配置
- `src/config/wagmi.ts`: 区块链配置
