# Cloudflare Pages 部署指南

## 🚀 快速部署

### 方法1：使用部署脚本（推荐）
```bash
./deploy-to-pages.sh
```

### 方法2：手动部署
```bash
# 1. 构建项目
npm run build

# 2. 复制文件到pages目录
mkdir -p pages
cp -r dist/* pages/
cp _headers _redirects pages/

# 3. 上传pages目录到Cloudflare Pages
```

## 📋 Cloudflare Pages 配置

### 项目设置
- **项目名称**: web3-college
- **框架预设**: None (静态站点)
- **构建输出目录**: `pages/`
- **根目录**: `/`
- **Node.js版本**: 18.x

### 环境变量
无需设置环境变量

### 自定义域名（可选）
- 在Cloudflare Pages设置中添加自定义域名
- 确保DNS记录指向Cloudflare

## 🔧 解决MIME类型错误

如果遇到 "Expected a JavaScript-or-Wasm module script" 错误：

1. **检查_headers文件**：确保JavaScript文件有正确的MIME类型
2. **清除缓存**：在Cloudflare Pages中清除缓存
3. **重新部署**：删除并重新创建Pages项目

## 📁 文件结构

```
pages/
├── _headers          # MIME类型配置
├── _redirects        # 重定向规则
├── index.html        # 主页面
└── assets/           # 静态资源
    ├── index-*.css   # 样式文件
    ├── index-*.js    # 主JavaScript文件
    ├── vendor-*.js   # 第三方库
    └── wagmi-*.js    # Web3库
```

## 🐛 常见问题

### 1. MIME类型错误
**错误**: `Expected a JavaScript-or-Wasm module script`
**解决**: 确保_headers文件正确配置了JavaScript文件的MIME类型

### 2. 路由404错误
**错误**: 刷新页面后出现404
**解决**: 确保_redirects文件包含SPA重定向规则

### 3. 资源加载失败
**错误**: CSS或JS文件无法加载
**解决**: 检查文件路径，确保使用相对路径

## 🔄 更新部署

每次代码更新后：
```bash
./deploy-to-pages.sh
```

然后重新上传pages目录到Cloudflare Pages。

## 📊 性能优化

- ✅ 代码分割：vendor、wagmi、主应用分离
- ✅ 资源压缩：Gzip压缩
- ✅ 缓存策略：静态资源长期缓存
- ✅ 预加载：关键资源预加载

## 🌐 访问地址

部署完成后，你的应用将在以下地址可用：
- Cloudflare Pages URL: `https://web3-college.pages.dev`
- 自定义域名: `https://your-domain.com`（如果配置了）
