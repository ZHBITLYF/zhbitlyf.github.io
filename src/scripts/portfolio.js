// 项目经历页面功能模块

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePortfolio();
});

// 初始化作品集功能
function initializePortfolio() {
    setupFilterButtons();
    setupSkillsAnimation();
    setupPortfolioItemsAnimation();
}

// 设置筛选按钮功能
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 筛选作品项目
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    // 添加显示动画
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
            
            // 显示筛选结果提示
            const visibleItems = Array.from(portfolioItems).filter(item => 
                filter === 'all' || item.getAttribute('data-category') === filter
            );
            
            const filterName = {
                'all': '全部',
                'web': 'Web开发',
                'mobile': '移动应用',
                'tool': '工具软件'
            };
            
            CommonUtils.showNotification(
                `显示 ${filterName[filter]} 作品 (${visibleItems.length} 个)`,
                'info',
                2000
            );
        });
    });
}

// 设置技能条动画
function setupSkillsAnimation() {
    const skillsSection = document.querySelector('.skills-section');
    if (!skillsSection) return;
    
    // 创建Intersection Observer来监听技能部分是否进入视口
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillBars();
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    observer.observe(skillsSection);
}

// 技能条动画
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach((bar, index) => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'width 1.5s ease-out';
            bar.style.width = targetWidth;
        }, index * 200);
    });
}

// 设置作品项目动画
function setupPortfolioItemsAnimation() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    // 为每个作品项目添加悬停效果
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // 添加进入视口动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    portfolioItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });
}

// 处理作品链接点击
function handlePortfolioLink(type, projectName) {
    const messages = {
        'demo': `正在打开 ${projectName} 的在线演示...`,
        'code': `正在查看 ${projectName} 的源代码...`,
        'download': `正在下载 ${projectName}...`
    };
    
    CommonUtils.showNotification(
        messages[type] || `正在访问 ${projectName}...`,
        'info',
        2000
    );
    
    // 实际项目中这里应该跳转到对应的链接
    // window.open(url, '_blank');
}

// 添加作品详情模态框功能
function showProjectDetails(projectId) {
    // 项目详情数据
    const projectDetails = {
        1: {
            title: '个人博客系统',
            description: '这是一个功能完整的个人博客系统，采用现代化的前端技术栈开发。',
            features: [
                '响应式设计，支持多设备访问',
                '文章分类和标签管理',
                '搜索和筛选功能',
                '密码保护的私密内容',
                '优雅的动画效果'
            ],
            technologies: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
            images: ['screenshot1.jpg', 'screenshot2.jpg']
        }
        // 可以添加更多项目详情
    };
    
    const project = projectDetails[projectId];
    if (!project) return;
    
    // 创建模态框
    const modal = createProjectModal(project);
    document.body.appendChild(modal);
    
    // 显示模态框
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 100);
}

// 创建项目详情模态框
function createProjectModal(project) {
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        ">
            <div class="modal-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
            ">
                <h2 style="margin: 0; color: #667eea;">${project.title}</h2>
                <button class="close-modal" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                ">×</button>
            </div>
            <div class="modal-body">
                <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                    ${project.description}
                </p>
                <h3 style="color: #333; margin-bottom: 10px;">主要功能</h3>
                <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                    ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <h3 style="color: #333; margin-bottom: 10px;">技术栈</h3>
                <div style="margin-bottom: 20px;">
                    ${project.technologies.map(tech => 
                        `<span style="
                            display: inline-block;
                            background: #667eea;
                            color: white;
                            padding: 5px 12px;
                            border-radius: 20px;
                            font-size: 0.8rem;
                            margin: 0 5px 5px 0;
                        ">${tech}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
    
    // 关闭模态框事件
    modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.classList.contains('close-modal')) {
            closeModal(modal);
        }
    });
    
    return modal;
}

// 关闭模态框
function closeModal(modal) {
    modal.style.opacity = '0';
    modal.querySelector('.modal-content').style.transform = 'scale(0.8)';
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

// 导出函数到全局作用域
window.handlePortfolioLink = handlePortfolioLink;
window.showProjectDetails = showProjectDetails;

console.log('💼 作品集功能模块已加载');