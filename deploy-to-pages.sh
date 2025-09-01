#!/bin/bash

# Web3 College - Cloudflare Pages 部署脚本

echo "🚀 开始部署到 Cloudflare Pages..."

# 1. 构建项目
echo "📦 构建项目..."
npm run build

# 2. 创建pages目录（如果不存在）
mkdir -p pages

# 3. 复制构建文件到pages目录
echo "📁 复制构建文件..."
cp -r dist/* pages/

# 4. 复制Cloudflare Pages配置文件
echo "⚙️ 复制配置文件..."
cp _headers _redirects pages/

# 5. 显示部署信息
echo "✅ 部署文件准备完成！"
echo ""
echo "📂 pages目录内容："
ls -la pages/
echo ""
echo "🌐 现在你可以："
echo "1. 将pages目录上传到Cloudflare Pages"
echo "2. 或者使用Wrangler CLI部署："
echo "   wrangler pages deploy pages --project-name=web3-college"
echo ""
echo "📋 部署配置："
echo "- 构建输出目录: pages/"
echo "- 框架预设: None (静态站点)"
echo "- 根目录: /"
echo "- 环境变量: 无需设置"
