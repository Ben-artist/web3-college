#!/bin/bash

# Web3 College Cloudflare Workers 部署脚本

echo "🚀 开始部署 Web3 College Cloudflare Workers..."

# 检查是否安装了 Wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ 未找到 Wrangler CLI，正在安装..."
    npm install -g wrangler
fi

# 检查是否已登录 Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "🔐 请先登录 Cloudflare 账户..."
    wrangler login
fi

# 创建 KV 命名空间（如果不存在）
echo "📦 创建 KV 命名空间..."

# 课程数据命名空间
COURSE_DATA_ID=$(wrangler kv:namespace create "COURSE_DATA" --preview 2>&1 | grep -o 'id="[^"]*"' | cut -d'"' -f2)
if [ ! -z "$COURSE_DATA_ID" ]; then
    echo "✅ 课程数据命名空间创建成功: $COURSE_DATA_ID"
    # 更新配置文件
    sed -i.bak "s/your-kv-namespace-id/$COURSE_DATA_ID/g" wrangler.toml
else
    echo "⚠️  课程数据命名空间已存在或创建失败"
fi

# 购买记录命名空间
PURCHASE_RECORDS_ID=$(wrangler kv:namespace create "PURCHASE_RECORDS" --preview 2>&1 | grep -o 'id="[^"]*"' | cut -d'"' -f2)
if [ ! -z "$PURCHASE_RECORDS_ID" ]; then
    echo "✅ 购买记录命名空间创建成功: $PURCHASE_RECORDS_ID"
    # 更新配置文件
    sed -i.bak "s/your-purchase-kv-namespace-id/$PURCHASE_RECORDS_ID/g" wrangler.toml
else
    echo "⚠️  购买记录命名空间已存在或创建失败"
fi

# 安装依赖
echo "📥 安装项目依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 部署到 Cloudflare
echo "🚀 部署到 Cloudflare..."
wrangler deploy

# 检查部署状态
if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🌐 Workers URL: https://web3-college-workers.your-subdomain.workers.dev"
    echo ""
    echo "📋 可用的 API 接口："
    echo "  - POST /api/courses - 创建课程"
    echo "  - GET /api/courses/{address} - 获取用户课程"
    echo "  - GET /api/courses - 获取所有课程"
    echo "  - POST /api/purchases - 记录购买"
    echo "  - GET /api/purchases/{courseId} - 获取课程购买记录"
    echo "  - GET /api/purchases - 获取所有购买记录"
    echo "  - GET /api/health - 健康检查"
    echo ""
    echo "🔧 测试部署："
    echo "  curl https://web3-college-workers.your-subdomain.workers.dev/api/health"
else
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi

# 清理备份文件
rm -f wrangler.toml.bak

echo "✨ 部署脚本执行完成！"
