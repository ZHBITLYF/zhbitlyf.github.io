// 博客页面功能模块

// 博客数据（实际项目中应该从后端API获取）
const blogPosts = [
    {
        id: 1,
        title: '我的第一篇博客',
        category: 'tech',
        date: '2024-01-15',
        excerpt: '这是我博客的第一篇文章，记录了我开始写博客的初衷和想法。在这个数字化时代，拥有一个属于自己的博客空间变得越来越重要...',
        tags: ['博客', '开始', '分享'],
        content: '完整的文章内容...'
    },
    {
        id: 2,
        title: '技术学习心得',
        category: 'tech',
        date: '2024-01-10',
        excerpt: '分享我在学习新技术过程中的一些心得体会和踩坑经验。学习技术不仅仅是掌握语法和API，更重要的是理解背后的设计思想...',
        tags: ['学习', '技术', '心得'],
        content: '完整的文章内容...'
    },
    {
        id: 3,
        title: '项目开发总结',
        category: 'project',
        date: '2024-01-05',
        excerpt: '最近完成了一个项目，总结一下开发过程中的收获和反思。这个项目让我学到了很多关于团队协作、代码质量和项目管理的知识...',
        tags: ['项目', '总结', '开发'],
        content: '完整的文章内容...'
    },
    {
        id: 4,
        title: '新年新开始',
        category: 'life',
        date: '2024-01-01',
        excerpt: '新的一年开始了，回顾过去一年的成长和收获，展望未来的目标和计划。生活不仅仅是工作，还有很多值得我们去探索和体验的东西...',
        tags: ['新年', '感悟', '目标'],
        content: '完整的文章内容...'
    },
    {
        id: 5,
        title: '前端开发最佳实践',
        category: 'tech',
        date: '2023-12-28',
        excerpt: '整理了一些前端开发中的最佳实践，包括代码规范、性能优化、可维护性等方面。这些实践能够帮助我们写出更好的代码...',
        tags: ['前端', '最佳实践', '优化'],
        content: '完整的文章内容...'
    }
];

// 当前显示的文章列表
let currentPosts = [...blogPosts];
let currentPage = 1;
const postsPerPage = 3;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeBlog();
    
    // 检查URL参数，如果有文章ID则直接显示文章详情
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    if (postId) {
        showPostDetail(parseInt(postId));
    }
});

// 初始化博客功能
function initializeBlog() {
    // 初始化时直接渲染，不需要淡出效果
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;
    
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = currentPosts.slice(startIndex, endIndex);
    
    blogList.innerHTML = postsToShow.map(post => `
        <article class="blog-item" data-category="${post.category}">
            <div class="blog-meta">
                <span class="category-tag ${post.category}">${getCategoryName(post.category)}</span>
                <span class="blog-date">${CommonUtils.formatDate(post.date)}</span>
            </div>
            <h3>${post.title}</h3>
            <p class="blog-excerpt">${post.excerpt}</p>
            <div class="blog-tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <a href="#" class="read-more" onclick="readFullPost(${post.id})">阅读全文</a>
        </article>
    `).join('');
    
    // 页面加载时的初始淡入动画
    fadeInNewItems();
    setupEventListeners();
    updatePagination();
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', CommonUtils.debounce(searchPosts, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPosts();
            }
        });
    }
    
    // 分类筛选
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', filterByCategory);
    }
    
    // 分页按钮
    setupPaginationListeners();
}

// 搜索文章
function searchPosts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        currentPosts = [...blogPosts];
    } else {
        currentPosts = blogPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    currentPage = 1;
    renderPosts();
    updatePagination();
    
    // 显示搜索结果提示
    if (searchTerm !== '') {
        CommonUtils.showNotification(
            `找到 ${currentPosts.length} 篇相关文章`,
            'info',
            2000
        );
    }
}

// 按分类筛选
function filterByCategory() {
    const selectedCategory = document.getElementById('category-select').value;
    
    if (selectedCategory === 'all') {
        currentPosts = [...blogPosts];
    } else {
        currentPosts = blogPosts.filter(post => post.category === selectedCategory);
    }
    
    currentPage = 1;
    renderPosts();
    updatePagination();
    
    // 清空搜索框
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
}

// 渲染文章列表
function renderPosts() {
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;
    
    // 计算当前页面要显示的文章
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = currentPosts.slice(startIndex, endIndex);
    
    if (postsToShow.length === 0) {
        // 先淡出现有内容
        fadeOutExistingItems(() => {
            blogList.innerHTML = `
                <div class="no-posts">
                    <h3>😔 没有找到相关文章</h3>
                    <p>试试其他关键词或分类吧</p>
                </div>
            `;
        });
        return;
    }
    
    // 先淡出现有内容，再淡入新内容
    fadeOutExistingItems(() => {
        blogList.innerHTML = postsToShow.map(post => `
            <article class="blog-item" data-category="${post.category}">
                <div class="blog-meta">
                    <span class="category-tag ${post.category}">${getCategoryName(post.category)}</span>
                    <span class="blog-date">${CommonUtils.formatDate(post.date)}</span>
                </div>
                <h3>${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <div class="blog-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="#" class="read-more" onclick="readFullPost(${post.id})">阅读全文</a>
            </article>
        `).join('');
        
        // 添加自然灵动的淡入动画效果
        fadeInNewItems();
    });
}

// 淡出现有项目的函数
function fadeOutExistingItems(callback) {
    const existingItems = document.querySelectorAll('.blog-item.show');
    
    if (existingItems.length === 0) {
        callback();
        return;
    }
    
    // 为现有项目添加淡出动画
    existingItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-out');
        }, index * 50); // 错落淡出，每个间隔50ms
    });
    
    // 等待所有项目淡出完成后执行回调
    setTimeout(callback, existingItems.length * 50 + 400);
}

// 淡入新项目的函数
function fadeInNewItems() {
    const blogItems = document.querySelectorAll('.blog-item');
    
    // 使用requestAnimationFrame确保DOM更新完成后再开始动画
    requestAnimationFrame(() => {
        blogItems.forEach((item, index) => {
            // 延迟添加show类，创建错落有致的动画效果
            setTimeout(() => {
                item.classList.add('show');
            }, index * 120 + 100); // 每个项目间隔120ms，初始延迟100ms
        });
    });
}

// 获取分类名称
function getCategoryName(category) {
    const categoryNames = {
        'tech': '技术分享',
        'life': '生活感悟',
        'project': '项目总结'
    };
    return categoryNames[category] || category;
}

// 阅读完整文章
function readFullPost(postId) {
    showPostDetail(postId);
}

function showPostDetail(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) {
        CommonUtils.showNotification('文章不存在', 'error', 3000);
        return;
    }
    
    // 隐藏博客列表和搜索控件
    const blogList = document.querySelector('.blog-posts');
    const searchControls = document.querySelector('.search-controls');
    const categoryFilter = document.querySelector('.category-filter');
    const pagination = document.querySelector('.pagination');
    
    if (blogList) blogList.style.display = 'none';
    if (searchControls) searchControls.style.display = 'none';
    if (categoryFilter) categoryFilter.style.display = 'none';
    if (pagination) pagination.style.display = 'none';
    
    // 创建或显示文章详情容器
    let postDetail = document.querySelector('.post-detail');
    if (!postDetail) {
        postDetail = document.createElement('div');
        postDetail.className = 'post-detail';
        document.querySelector('.container').appendChild(postDetail);
    }
    
    // 渲染文章详情
    postDetail.innerHTML = `
        <article class="post-full">
            <header class="post-header">
                <button class="back-btn" onclick="backToBlogList()">← 返回博客列表</button>
                <h1 class="post-title">${post.title}</h1>
                <div class="post-meta">
                    <span class="post-date">${post.date}</span>
                    <span class="post-category">${getCategoryName(post.category)}</span>
                </div>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </header>
            <div class="post-content">
                <p>${post.excerpt}</p>
                <p>这里是文章的完整内容。在实际项目中，这里会显示从后端获取的完整文章内容。</p>
                <p>文章内容可以包含多个段落、图片、代码块等丰富的内容格式。</p>
                <h3>示例小标题</h3>
                <p>这是一个示例段落，展示文章的详细内容结构。</p>
                <blockquote>
                    <p>这是一个引用块的示例，可以用来突出重要的观点或引用其他来源的内容。</p>
                </blockquote>
                <p>文章的结尾部分，总结主要观点和思考。</p>
            </div>
        </article>
    `;
    
    postDetail.style.display = 'block';
    
    // 更新页面标题
    document.title = `${post.title} - 我的博客`;
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToBlogList() {
    // 显示博客列表和控件
    const blogList = document.querySelector('.blog-posts');
    const searchControls = document.querySelector('.search-controls');
    const categoryFilter = document.querySelector('.category-filter');
    const pagination = document.querySelector('.pagination');
    const postDetail = document.querySelector('.post-detail');
    
    if (blogList) blogList.style.display = 'block';
    if (searchControls) searchControls.style.display = 'flex';
    if (categoryFilter) categoryFilter.style.display = 'block';
    if (pagination) pagination.style.display = 'flex';
    if (postDetail) postDetail.style.display = 'none';
    
    // 恢复页面标题
    document.title = '我的博客 - 博客文章';
    
    // 清除URL参数
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.replaceState({}, '', url);
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 设置分页监听器
function setupPaginationListeners() {
    // 这个函数会在updatePagination中动态设置
}

// 更新分页
function updatePagination() {
    const totalPages = Math.ceil(currentPosts.length / postsPerPage);
    const pagination = document.querySelector('.pagination');
    
    if (!pagination || totalPages <= 1) {
        if (pagination) pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // 生成分页HTML
    let paginationHTML = `
        <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            上一页
        </button>
        <span class="page-numbers">
    `;
    
    // 生成页码按钮
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-num active">${i}</button>`;
        } else {
            paginationHTML += `<button class="page-num" onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    paginationHTML += `
        </span>
        <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            下一页
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// 切换页面
function changePage(page) {
    const totalPages = Math.ceil(currentPosts.length / postsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderPosts();
    updatePagination();
    
    // 滚动到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 导出函数到全局作用域
window.searchPosts = searchPosts;
window.filterByCategory = filterByCategory;
window.readFullPost = readFullPost;
window.changePage = changePage;
window.backToBlogList = backToBlogList;

console.log('📝 博客功能模块已加载');