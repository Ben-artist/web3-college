# 🚀 Cloudflare Workers 简化使用指南

## 📖 这是什么？

这是一个简单的Web2数据存储服务，用来配合你的Web3应用存储课程和购买记录。

## 🎯 主要功能

### 1. 课程管理
- **创建课程**: 保存课程信息
- **查询课程**: 获取用户创建的课程

### 2. 购买记录
- **记录购买**: 记录谁买了什么课程
- **查询记录**: 查看课程的购买情况

## 📝 数据格式

### 课程数据
```json
{
  "用户地址": [
    {
      "courseId": "课程ID",
      "content": "课程内容",
      "title": "课程标题",
      "cost": 100
    }
  ]
}
```

### 购买记录
```json
[
  {
    "courseId": "课程ID",
    "creator": "创作者地址",
    "buyers": ["买家1", "买家2"],
    "title": "课程标题",
    "count": 2,
    "cost": 100
  }
]
```

## 🔧 使用方法

### 1. 创建课程
```javascript
const response = await fetch('/api/courses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: "用户地址",
    courseId: "课程ID",
    content: "课程内容",
    title: "课程标题",
    cost: 100
  })
});
```

### 2. 记录购买
```javascript
const response = await fetch('/api/purchases', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    courseId: "课程ID",
    creator: "创作者地址",
    buyer: "购买者地址",
    title: "课程标题",
    cost: 100
  })
});
```

### 3. 查询课程
```javascript
const response = await fetch('/api/courses/用户地址');
const data = await response.json();
console.log(data.courses); // 课程列表
```

### 4. 查询购买记录
```javascript
const response = await fetch('/api/purchases/课程ID');
const data = await response.json();
console.log(data.purchases); // 购买记录
```

## ❓ 常见问题

### Q: 为什么创建课程失败？
A: 检查：
1. JSON格式是否正确
2. 是否包含所有必要字段
3. 数据是否为空

### Q: 数据存储在哪里？
A: 使用Cloudflare Workers KV存储，全球分布式，访问速度快。

### Q: 如何部署？
A: 运行 `./deploy.sh` 即可一键部署。

## 🎉 总结

这个服务很简单：
- 接收数据 → 验证格式 → 存储到KV → 返回结果
- 支持课程和购买记录的基本操作
- 错误处理友好，便于调试

适合学习和理解Web2数据存储的基本概念！
