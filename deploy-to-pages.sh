#!/bin/bash

# 构建并准备部署文件
npm run build
mkdir -p pages
cp -r dist/* pages/
cp _headers _redirects pages/
echo "✅ 部署文件已准备完成，上传pages目录到Cloudflare Pages"
