# 开发文档

## 项目架构

### 目录结构说明

```
├── public/                 # 静态HTML文件目录
│   ├── index.html         # 首页 - 个人介绍和技能展示
│   ├── blog.html          # 博客页面 - 文章列表和详情
│   └── portfolio.html     # 项目展示页面 - 作品集
├── src/                   # 源代码目录
│   ├── assets/           # 静态资源
│   │   ├── images/       # 图片文件 (JPG, PNG, SVG)
│   │   └── icons/        # 图标文件 (favicon等)
│   ├── styles/           # 样式文件
│   │   └── style.css     # 主样式文件 (包含所有页面样式)
│   ├── scripts/          # JavaScript文件
│   │   ├── common.js     # 公共功能 (导航、通知、工具函数)
│   │   ├── blog.js       # 博客功能 (文章管理、搜索、分页)
│   │   ├── portfolio.js  # 项目展示功能
│   │   ├── portfolio-auth.js # 权限控制
│   │   └── parallax.js   # 视差滚动效果
│   ├── components/       # 可复用组件 (预留扩展)
│   ├── pages/           # 页面级组件 (预留扩展)
│   └── utils/           # 工具函数 (预留扩展)
├── config/              # 配置文件
│   ├── development.json # 开发环境配置
│   └── production.json  # 生产环境配置
└── docs/               # 项目文档
    └── DEVELOPMENT.md  # 开发文档
```

## 技术栈

### 前端技术
- **HTML5**: 语义化标签，SEO友好
- **CSS3**: Flexbox + Grid布局，CSS变量，动画效果
- **JavaScript ES6+**: 模块化开发，现代语法
- **响应式设计**: 移动优先，多设备适配

### 开发工具
- **Live Server**: 本地开发服务器
- **Git**: 版本控制
- **VS Code**: 推荐IDE

## 核心功能模块

### 1. 公共模块 (common.js)
- 导航栏交互
- 平滑滚动
- 返回顶部按钮
- 通知系统
- 工具函数 (防抖、节流、日期格式化)

### 2. 博客模块 (blog.js)
- 文章数据管理
- 搜索功能
- 分类筛选
- 分页显示
- 文章详情展示

### 3. 项目展示模块 (portfolio.js + portfolio-auth.js)
- 项目数据展示
- 模态框交互
- 密码保护功能
- 项目详情查看

### 4. 视觉效果模块 (parallax.js)
- 视差滚动效果
- 背景动画

## 开发规范

### HTML规范
- 使用语义化标签
- 保持良好的缩进和结构
- 添加必要的meta标签
- 使用合适的alt属性

### CSS规范
- 采用BEM命名规范
- 使用CSS变量管理主题色彩
- 移动优先的响应式设计
- 合理使用Flexbox和Grid

### JavaScript规范
- 使用ES6+语法
- 函数式编程优先
- 避免全局变量污染
- 添加适当的错误处理
- 使用有意义的变量和函数名

## 响应式断点

```css
/* 移动端 */
@media (max-width: 767px) { }

/* 平板端 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 桌面端 */
@media (min-width: 1024px) { }
```

## 性能优化

### 图片优化
- 使用适当的图片格式
- 实现懒加载
- 提供多种尺寸

### 代码优化
- CSS和JS文件合并
- 代码压缩
- 缓存策略

### 加载优化
- 关键CSS内联
- 非关键资源延迟加载
- 使用CDN

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 16+
- IE 11 (基础功能)

## 部署说明

### GitHub Pages部署
1. 推送代码到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择source为根目录或docs文件夹
4. 访问 `https://username.github.io/repository-name`

### 自定义服务器部署
1. 将public目录内容上传到服务器
2. 配置Web服务器指向public目录
3. 设置适当的缓存策略

## 常见问题

### Q: 如何添加新的博客文章？
A: 编辑 `src/scripts/blog.js` 文件中的 `blogPosts` 数组，添加新的文章对象。

### Q: 如何修改网站主题色？
A: 编辑 `src/styles/style.css` 文件中的CSS变量或渐变色定义。

### Q: 如何添加新的项目展示？
A: 编辑 `src/scripts/portfolio.js` 文件中的项目数据。

### Q: 如何自定义视差效果？
A: 修改 `src/scripts/parallax.js` 文件中的滚动速度参数。