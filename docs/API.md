# API 文档

## 概述

本项目采用前端静态数据管理，所有数据都存储在JavaScript文件中。以下是各个模块的数据结构和API说明。

## 博客模块 API

### 数据结构

#### BlogPost 对象

```javascript
{
  id: number,           // 文章唯一标识
  title: string,        // 文章标题
  category: string,     // 文章分类 ('tech', 'life', 'project')
  date: string,         // 发布日期 (YYYY-MM-DD)
  excerpt: string,      // 文章摘要
  tags: string[],       // 标签数组
  content: string       // 文章完整内容
}
```

### 函数接口

#### `searchPosts()`
搜索博客文章
- **参数**: 无 (从搜索框获取关键词)
- **返回**: 无 (直接更新页面显示)
- **功能**: 根据标题和摘要搜索文章

#### `filterByCategory()`
按分类筛选文章
- **参数**: 无 (从下拉框获取分类)
- **返回**: 无 (直接更新页面显示)
- **功能**: 筛选指定分类的文章

#### `readFullPost(postId)`
查看文章详情
- **参数**: 
  - `postId` (number): 文章ID
- **返回**: 无
- **功能**: 显示文章完整内容

#### `changePage(page)`
切换页面
- **参数**: 
  - `page` (number): 目标页码
- **返回**: 无
- **功能**: 分页显示文章列表

## 项目展示模块 API

### 数据结构

#### Project 对象

```javascript
{
  id: number,           // 项目唯一标识
  title: string,        // 项目标题
  description: string,  // 项目描述
  technologies: string[], // 使用的技术栈
  image: string,        // 项目截图URL
  demoUrl: string,      // 演示链接
  githubUrl: string,    // GitHub链接
  category: string      // 项目分类
}
```

### 函数接口

#### `showProjectModal(projectId)`
显示项目详情模态框
- **参数**: 
  - `projectId` (number): 项目ID
- **返回**: 无
- **功能**: 在模态框中显示项目详细信息

#### `closeModal()`
关闭模态框
- **参数**: 无
- **返回**: 无
- **功能**: 隐藏项目详情模态框

## 权限控制模块 API

### 函数接口

#### `checkPassword()`
验证访问密码
- **参数**: 无 (从输入框获取密码)
- **返回**: boolean
- **功能**: 验证用户输入的密码是否正确

#### `showPortfolioContent()`
显示项目内容
- **参数**: 无
- **返回**: 无
- **功能**: 密码验证成功后显示项目列表

## 公共模块 API

### 工具函数

#### `CommonUtils.showNotification(message, type, duration)`
显示通知消息
- **参数**: 
  - `message` (string): 通知内容
  - `type` (string): 通知类型 ('info', 'success', 'warning', 'error')
  - `duration` (number): 显示时长 (毫秒)
- **返回**: 无
- **功能**: 在页面顶部显示通知消息

#### `CommonUtils.formatDate(date, format)`
格式化日期
- **参数**: 
  - `date` (Date|string): 日期对象或字符串
  - `format` (string): 格式模板 (默认: 'YYYY-MM-DD')
- **返回**: string
- **功能**: 将日期格式化为指定格式

#### `CommonUtils.debounce(func, wait)`
防抖函数
- **参数**: 
  - `func` (function): 要防抖的函数
  - `wait` (number): 等待时间 (毫秒)
- **返回**: function
- **功能**: 创建防抖版本的函数

#### `CommonUtils.throttle(func, limit)`
节流函数
- **参数**: 
  - `func` (function): 要节流的函数
  - `limit` (number): 限制间隔 (毫秒)
- **返回**: function
- **功能**: 创建节流版本的函数

## 视差效果模块 API

### 事件监听

#### `scroll` 事件
- **触发**: 页面滚动时
- **功能**: 更新视差背景位置
- **计算公式**: `translateY(-${scrollY * 0.5}px)`

## 数据管理

### 博客数据 (blog.js)

```javascript
const blogPosts = [
  {
    id: 1,
    title: '我的第一篇博客',
    category: 'tech',
    date: '2024-01-15',
    excerpt: '这是我博客的第一篇文章...',
    tags: ['博客', '开始', '分享'],
    content: '完整的文章内容...'
  }
  // 更多文章...
];
```

### 项目数据 (portfolio.js)

```javascript
const projects = [
  {
    id: 1,
    title: '个人博客网站',
    description: '使用HTML、CSS、JavaScript构建的响应式个人博客',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    image: 'project1.jpg',
    demoUrl: 'https://example.com',
    githubUrl: 'https://github.com/username/project',
    category: 'web'
  }
  // 更多项目...
];
```

## 配置选项

### 分页配置

```javascript
const postsPerPage = 3;  // 每页显示的文章数量
```

### 分类映射

```javascript
const categoryNames = {
  'all': '全部',
  'tech': '技术',
  'life': '生活',
  'project': '项目'
};
```

### 密码配置

```javascript
const correctPassword = 'your-password';  // 项目访问密码
```

## 错误处理

### 常见错误类型

1. **文章不存在**: 当访问不存在的文章ID时
2. **密码错误**: 项目访问密码验证失败时
3. **网络错误**: 资源加载失败时

### 错误处理策略

- 使用 `try-catch` 包装可能出错的代码
- 通过 `CommonUtils.showNotification()` 显示错误信息
- 提供合理的默认值和降级方案

## 扩展指南

### 添加新功能模块

1. 在 `src/scripts/` 目录创建新的JS文件
2. 定义模块的数据结构和函数接口
3. 在相应的HTML文件中引入脚本
4. 更新本API文档

### 数据持久化

当前项目使用静态数据，如需数据持久化可考虑：

1. **LocalStorage**: 客户端存储
2. **后端API**: 连接数据库
3. **Headless CMS**: 如Strapi、Contentful
4. **静态站点生成器**: 如Gatsby、Next.js