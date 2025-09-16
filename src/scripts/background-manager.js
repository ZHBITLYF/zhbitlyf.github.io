/**
 * 全局背景管理器
 * 确保所有页面共享同一个WebGL背景实例，避免重复初始化
 */

// 检查是否已经有全局背景管理器
if (!window.globalBackgroundManager) {
    class GlobalBackgroundManager {
        constructor() {
            this.canvas = null;
            this.isInitialized = false;
            this.currentPage = null;
        }
        
        /**
         * 初始化或复用背景
         */
        async initBackground() {
            if (this.isInitialized) {
                console.log('🔄 复用已存在的WebGL背景');
                this.attachToCurrentPage();
                return;
            }
            
            console.log('🚀 首次初始化全局WebGL背景');
            
            // 动态导入背景渲染器
            try {
                const { backgroundRenderer } = await import('./background-renderer.js');
                await backgroundRenderer.init();
                this.canvas = document.getElementById('webgl-background');
                this.isInitialized = true;
                console.log('✅ 全局背景初始化完成');
            } catch (error) {
                console.error('❌ 背景初始化失败:', error);
                this.fallbackToCSS();
            }
        }
        
        /**
         * 将背景附加到当前页面
         */
        attachToCurrentPage() {
            const canvas = document.getElementById('webgl-background');
            if (canvas && this.canvas) {
                // 确保画布在正确的位置
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.zIndex = '-1';
            }
        }
        
        /**
         * 页面切换时的清理
         */
        beforePageChange() {
            // 保持背景运行，不进行清理
            console.log('🔄 页面切换中，保持背景运行');
        }
        
        /**
         * CSS回退方案
         */
        fallbackToCSS() {
            document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            console.log('🎨 使用CSS背景作为回退方案');
        }
    }
    
    // 创建全局实例
    window.globalBackgroundManager = new GlobalBackgroundManager();
    
    // 页面卸载时的处理
    window.addEventListener('beforeunload', () => {
        window.globalBackgroundManager.beforePageChange();
    });
    
    // 页面可见性变化时的处理
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.globalBackgroundManager.isInitialized) {
            window.globalBackgroundManager.attachToCurrentPage();
        }
    });
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.globalBackgroundManager.initBackground();
    });
} else {
    window.globalBackgroundManager.initBackground();
}

// 导出管理器
export default window.globalBackgroundManager;