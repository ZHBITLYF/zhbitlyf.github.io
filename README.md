# 个人博客网站

一个现代化的个人博客和作品集网站，采用原生HTML、CSS和JavaScript构建。

## 🚀 项目特性

- 📱 响应式设计，支持移动端和桌面端
- 🎨 现代化UI设计，流畅的动画效果
- 📝 博客文章管理系统
- 💼 项目作品展示
- 🔍 文章搜索和分类功能
- 🎯 视差滚动效果
- 🔐 项目访问权限控制

## 📁 项目结构

```
├── public/                 # 静态HTML文件
│   ├── index.html         # 首页
│   ├── blog.html          # 博客页面
│   └── portfolio.html     # 项目展示页面
├── src/                   # 源代码目录
│   ├── assets/           # 静态资源
│   │   ├── images/       # 图片文件
│   │   └── icons/        # 图标文件
│   ├── styles/           # 样式文件
│   │   └── style.css     # 主样式文件
│   ├── scripts/          # JavaScript文件
│   │   ├── common.js     # 公共功能
│   │   ├── blog.js       # 博客功能
│   │   ├── portfolio.js  # 项目展示功能
│   │   ├── portfolio-auth.js # 权限控制
│   │   └── parallax.js   # 视差效果
│   ├── components/       # 组件目录（预留）
│   ├── pages/           # 页面目录（预留）
│   └── utils/           # 工具函数（预留）
├── config/              # 配置文件目录
├── docs/               # 文档目录
├── package.json        # 项目配置
└── README.md          # 项目说明
```

## 🛠️ 技术栈

- **前端框架**: 原生JavaScript (ES6+)
- **样式**: CSS3 + Flexbox + Grid
- **构建工具**: 无需构建，直接运行
- **开发服务器**: Live Server

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

或者直接使用Live Server插件打开 `public/index.html`

### 访问网站

- 首页: http://localhost:3000
- 博客: http://localhost:3000/blog.html
- 项目展示: http://localhost:3000/portfolio.html

## 📝 功能说明

### 首页
- 个人介绍和技能展示
- 最新博客文章预览
- 响应式导航栏
- 视差滚动效果

### 博客页面
- 文章列表展示
- 搜索和分类筛选
- 分页功能
- 文章详情查看

### 项目展示
- 项目作品集展示
- 密码保护功能
- 项目详情模态框

## 🎨 自定义配置

### 修改个人信息
编辑 `public/index.html` 中的个人介绍部分

### 添加博客文章
编辑 `src/scripts/blog.js` 中的 `blogPosts` 数组

### 修改项目展示
编辑 `src/scripts/portfolio.js` 中的项目数据

### 自定义样式
修改 `src/styles/style.css` 文件

## 📱 响应式设计

项目采用移动优先的响应式设计：
- 移动端: < 768px
- 平板端: 768px - 1024px
- 桌面端: > 1024px

## 🔧 开发指南

### 代码规范
- 使用ES6+语法
- 遵循语义化HTML
- CSS采用BEM命名规范
- JavaScript使用模块化开发

### 性能优化
- 图片懒加载
- CSS和JS文件压缩
- 缓存策略优化

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📞 联系方式

- 邮箱: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)
- 网站: https://yourusername.github.io