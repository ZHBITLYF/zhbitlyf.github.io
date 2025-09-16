/**
 * 单页面应用路由器
 * 实现页面切换而不重新加载背景
 */

class SPARouter {
    constructor() {
        this.currentPage = 'home';
        this.pages = ['home', 'blog', 'portfolio'];
        this.init();
    }

    init() {
        // 绑定导航链接点击事件
        this.bindNavigation();
        
        // 绑定卡片导航事件
        this.bindCardNavigation();
        
        // 监听浏览器前进后退
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'home';
            this.navigateTo(page, false);
        });
        
        // 初始化页面状态
        const initialPage = this.getPageFromURL() || 'home';
        this.navigateTo(initialPage, true);
        
        // 为初始页面添加动画效果
        setTimeout(() => {
            const initialPageElement = document.getElementById(`${initialPage}-page`);
            if (initialPageElement) {
                this.animateCards(initialPageElement);
            }
        }, 100);
    }

    bindNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page && this.pages.includes(page)) {
                    this.navigateTo(page);
                }
            });
        });
    }

    bindCardNavigation() {
        // 绑定卡片点击事件
        const cards = document.querySelectorAll('[data-navigate]');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const page = card.getAttribute('data-navigate');
                if (page && this.pages.includes(page)) {
                    this.navigateTo(page);
                }
            });
        });
    }

    navigateTo(page, replaceState = false) {
        if (!this.pages.includes(page) || page === this.currentPage) {
            return;
        }

        // 隐藏当前页面
        const currentPageElement = document.getElementById(`${this.currentPage}-page`);
        if (currentPageElement) {
            currentPageElement.classList.remove('active');
        }

        // 显示目标页面
        const targetPageElement = document.getElementById(`${page}-page`);
        if (targetPageElement) {
            targetPageElement.classList.add('active');
            
            // 为卡片添加动画效果
            this.animateCards(targetPageElement);
        }

        // 更新导航状态
        this.updateNavigation(page);

        // 更新浏览器历史
        const url = page === 'home' ? '/' : `/${page}`;
        if (replaceState) {
            history.replaceState({ page }, '', url);
        } else {
            history.pushState({ page }, '', url);
        }

        // 更新当前页面
        this.currentPage = page;

        // 触发页面切换事件
        this.onPageChange(page);

        console.log(`🔄 SPA导航到: ${page}`);
    }

    animateCards(pageElement) {
        // 查找所有需要动画的卡片元素
        const cards = pageElement.querySelectorAll('.card, .blog-item, .post-card, .portfolio-item, .portfolio-card');
        
        // 重置所有卡片的动画状态
        cards.forEach(card => {
            card.classList.remove('show');
            card.classList.add('card-animate');
        });
        
        // 延迟触发动画，确保页面已经显示
        setTimeout(() => {
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('show');
                }, index * 150); // 每个卡片延迟150ms，给更多时间展示
            });
        }, 100);
    }

    updateNavigation(activePage) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    getPageFromURL() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') {
            return 'home';
        }
        const page = path.replace('/', '').replace('.html', '');
        return this.pages.includes(page) ? page : 'home';
    }

    onPageChange(page) {
        // 页面切换时的回调，可以在这里添加页面特定的逻辑
        document.title = this.getPageTitle(page);
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    getPageTitle(page) {
        const titles = {
            home: '个人博客 - 首页',
            blog: '个人博客 - 博客文章',
            portfolio: '个人博客 - 项目经历'
        };
        return titles[page] || '个人博客';
    }
}

// 创建全局路由器实例
window.spaRouter = new SPARouter();

// 导出路由器
export default window.spaRouter;