/**
 * WebGL游戏引擎
 * 参考Unreal Engine和Cocos2d-x的架构设计，提供完整的游戏引擎框架
 * 
 * 核心架构：
 * - Engine: 引擎核心，管理所有子系统
 * - RenderSystem: 渲染系统，负责WebGL渲染管线
 * - ResourceManager: 资源管理器，管理着色器、纹理等资源
 * - SceneManager: 场景管理器，管理场景节点和组件
 * - Component: 组件系统，实现ECS架构
 */

// 测试脚本加载
console.log('🔧 WebGL游戏引擎脚本已加载');

// 引擎模块将通过 HTML 脚本标签加载
// 所有类将在全局作用域中可用

/**
 * 背景渲染器
 * 使用新的GameEngine架构，展示ECS系统的使用
 */
class SimpleBackgroundRenderer {
    constructor() {
        this.canvas = null;
        this.gameEngine = null;
        this.backgroundEntity = null;
        this.isInitialized = false;
        this.animationId = null;
        
        // 动画参数
        this.startTime = performance.now();
        
        // FPS控制参数
        this.targetFPS = 60;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsStartTime = 0;
        
        // 默认着色器源码
        this.defaultVertexShader = `
            attribute vec2 a_position;
            uniform mat4 u_modelMatrix;
            varying vec2 v_uv;
            
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = u_modelMatrix * vec4(a_position, 0.0, 1.0);
            }
        `;
        
        this.defaultFragmentShader = `
            precision mediump float;
            
            uniform float u_time;
            varying vec2 v_uv;
            
            void main() {
                vec2 uv = v_uv;
                
                // 创建动态渐变效果
                float time = u_time * 0.001;
                
                // 基础渐变色
                vec3 color1 = vec3(0.4, 0.5, 0.9); // 蓝紫色
                vec3 color2 = vec3(0.5, 0.3, 0.7); // 紫色
                vec3 color3 = vec3(0.8, 0.4, 0.6); // 粉色
                
                // 动态混合
                float wave1 = sin(uv.x * 3.0 + time) * 0.5 + 0.5;
                float wave2 = cos(uv.y * 2.0 + time * 0.7) * 0.5 + 0.5;
                float wave3 = sin((uv.x + uv.y) * 2.5 + time * 1.2) * 0.5 + 0.5;
                
                vec3 finalColor = mix(color1, color2, wave1);
                finalColor = mix(finalColor, color3, wave2 * 0.6);
                
                // 添加一些亮度变化
                finalColor *= 0.8 + wave3 * 0.3;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
    
    /**
     * 初始化背景渲染器
     * @param {string} vertexShaderSource - 可选的自定义顶点着色器源码
     * @param {string} fragmentShaderSource - 可选的自定义片段着色器源码
     */
    async init(vertexShaderSource = null, fragmentShaderSource = null) {
        try {
            console.log('🎨 初始化WebGL引擎背景渲染器...');
            
            // 创建canvas元素
            console.log('📋 步骤1: 创建canvas元素');
            this.createCanvas();
            
            // 初始化GameEngine
            console.log('🔧 步骤2: 初始化GameEngine');
            this.gameEngine = new GameEngine(this.canvas);
            
            // 使用自定义着色器或默认着色器
            const vertexShader = vertexShaderSource || this.defaultVertexShader;
            const fragmentShader = fragmentShaderSource || this.defaultFragmentShader;
            
            // 创建着色器和材质
            console.log('🎭 步骤3: 创建着色器和材质');
            const shader = this.gameEngine.createShader('backgroundShader', vertexShader, fragmentShader);
            const material = this.gameEngine.createMaterial('backgroundMaterial', shader);
            
            // 创建全屏四边形几何体
            console.log('📐 步骤4: 创建全屏四边形几何体');
            const vertices = [
                -1.0, -1.0,
                 1.0, -1.0,
                -1.0,  1.0,
                -1.0,  1.0,
                 1.0, -1.0,
                 1.0,  1.0
            ];
            const geometry = this.gameEngine.createGeometry('backgroundGeometry', vertices);
            
            // 创建背景实体并添加组件
            console.log('🎯 步骤5: 创建背景实体');
            this.backgroundEntity = this.gameEngine.createEntity('Background');
            
            // 添加Transform组件
            const transform = new Transform(this.backgroundEntity);
            this.backgroundEntity.addComponent(transform);
            
            // 添加RenderComponent组件
            const renderComponent = new RenderComponent(this.backgroundEntity, material, geometry);
            this.backgroundEntity.addComponent(renderComponent);
            
            // 启动游戏引擎
            console.log('🔄 步骤6: 启动游戏引擎');
            this.gameEngine.start();
            this.startRenderLoop();
            
            // 监听窗口大小变化
            console.log('📏 步骤7: 设置窗口大小监听');
            this.setupResizeHandler();
            
            // 清除body的背景样式，确保WebGL canvas可见
            document.body.style.background = 'transparent';
            
            // 确保canvas在最前面但不阻挡交互
            this.canvas.style.zIndex = '-1';
            this.canvas.style.pointerEvents = 'none';
            
            this.isInitialized = true;
            console.log('✅ GameEngine背景渲染器初始化完成');
            
        } catch (error) {
            console.error('❌ 背景渲染器初始化失败:', error);
            console.error('错误堆栈:', error.stack);
            // 临时禁用CSS回退，显示错误信息
            alert('WebGL初始化失败: ' + error.message);
            // this.fallbackToCSS();
        }
    }
    
    /**
     * 更新着色器
     * @param {string} vertexShaderSource - 顶点着色器源码
     * @param {string} fragmentShaderSource - 片段着色器源码
     */
    updateShader(vertexShaderSource, fragmentShaderSource) {
        if (!this.gameEngine || !this.gameEngine.isRunning) {
            console.error('❌ 引擎未初始化，无法更新着色器');
            return;
        }
        
        try {
            // 创建新的着色器和材质
            const shader = this.gameEngine.createShader('backgroundShader', vertexShaderSource, fragmentShaderSource);
            const material = this.gameEngine.createMaterial('backgroundMaterial', shader);
            
            // 更新背景实体的渲染组件
            if (this.backgroundEntity) {
                const renderComponent = this.backgroundEntity.getComponent('RenderComponent');
                if (renderComponent) {
                    renderComponent.setMaterial(material);
                }
            }
            
            console.log('✅ 着色器更新成功');
        } catch (error) {
            console.error('❌ 着色器更新失败:', error);
        }
    }
    
    /**
     * 创建canvas元素
     */
    createCanvas() {
        // 使用已存在的canvas元素
        this.canvas = document.getElementById('webgl-background');
        if (!this.canvas) {
            console.error('❌ 未找到webgl-background canvas元素');
            throw new Error('WebGL canvas元素不存在');
        }
        
        console.log('✅ 找到现有的WebGL canvas元素');
        
        // 确保canvas样式正确
        this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -2;
                pointer-events: none;
            `;
        
        // 设置canvas尺寸
        this.resizeCanvas();
    }
    

    
    /**
     * 启动渲染循环
     */
    startRenderLoop() {
        // 目标帧率设置
        const targetFPS = 60;
        const targetFrameTime = 1000 / targetFPS; // 16.67ms per frame
        let lastFrameTime = 0;
        let frameCount = 0;
        let fpsStartTime = performance.now();
        
        const render = (currentTime) => {
            if (!this.isInitialized || !this.gameEngine || !this.gameEngine.isRunning) return;
            
            // 计算帧间隔
            const deltaTime = currentTime - lastFrameTime;
            
            // 跳帧逻辑：如果距离上一帧时间不足目标帧时间，跳过此帧
            if (deltaTime < targetFrameTime) {
                this.animationId = requestAnimationFrame(render);
                return;
            }
            
            // 更新上一帧时间
            lastFrameTime = currentTime - (deltaTime % targetFrameTime);
            
            // 计算实际时间（用于着色器动画）
            const animationTime = currentTime - this.startTime;
            
            // 更新材质的uniform参数
            if (this.backgroundEntity) {
                const renderComponent = this.backgroundEntity.getComponent('RenderComponent');
                if (renderComponent && renderComponent.material) {
                    renderComponent.material.setUniform('u_time', animationTime);
                    // renderComponent.material.setUniform('u_resolution', [this.canvas.width, this.canvas.height]);
                }
            }
            
            // GameEngine会自动处理渲染
            
            // FPS统计（每秒输出一次）
            frameCount++;
            if (currentTime - fpsStartTime >= 1000) {
                const actualFPS = Math.round((frameCount * 1000) / (currentTime - fpsStartTime));
                console.log(`🎯 实际FPS: ${actualFPS}, 目标FPS: ${targetFPS}`);
                frameCount = 0;
                fpsStartTime = currentTime;
            }
            
            this.animationId = requestAnimationFrame(render);
        };
        
        // 初始化时间戳
        this.startTime = performance.now();
        this.animationId = requestAnimationFrame(render);
        console.log('🎬 GameEngine渲染循环已启动 (60FPS + VSync)');
    }
    
    /**
     * 设置窗口大小变化处理
     */
    setupResizeHandler() {
        const resizeHandler = () => {
            this.resizeCanvas();
            if (this.gameEngine && this.gameEngine.isRunning) {
                this.gameEngine.resize(this.canvas.width, this.canvas.height);
            }
        };
        
        window.addEventListener('resize', resizeHandler);
    }
    
    /**
     * 调整canvas尺寸
     */
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;
        
        this.canvas.width = displayWidth * dpr;
        this.canvas.height = displayHeight * dpr;
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
    }
    
    /**
     * 暂停渲染
     */
    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * 恢复渲染
     */
    resume() {
        if (!this.animationId && this.isInitialized) {
            this.startRenderLoop();
        }
    }
    
    /**
     * 销毁渲染器
     */
    destroy() {
        this.pause();
        
        // 销毁引擎资源
        if (this.gameEngine) {
            this.gameEngine.destroy();
            this.gameEngine = null;
        }
        
        // 清理引用
        this.backgroundEntity = null;
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        this.isInitialized = false;
        console.log('🗑️ GameEngine背景渲染器已销毁');
    }
    
    /**
     * CSS回退方案
     */
    fallbackToCSS() {
        console.log('🔄 使用CSS渐变背景作为回退方案');
        
        // 移除WebGL canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        // 恢复CSS背景
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

// 创建全局实例
window.backgroundRenderer = new SimpleBackgroundRenderer();

// 暴露引擎类到全局，方便开发者使用
window.GameEngine = GameEngine;
window.RenderSystem = RenderSystem;
window.Shader = Shader;
window.Material = Material;
window.Geometry = Geometry;
window.EventSystem = EventSystem;
window.ResourceManager = ResourceManager;
window.SceneManager = SceneManager;
window.Component = Component;
window.Transform = Transform;
window.RenderComponent = RenderComponent;
window.Entity = Entity;

/**
 * 等待DOM就绪后初始化
 */
function initWhenReady() {
    console.log('🚀 开始初始化WebGL引擎背景渲染器');
    window.backgroundRenderer.init();
}

/**
 * 强制启动背景渲染器
 */
function forceStartBackground() {
    console.log('🔥 强制启动背景渲染器');
    if (window.backgroundRenderer) {
        if (!window.backgroundRenderer.isInitialized) {
            console.log('🔄 背景渲染器未初始化，开始初始化...');
            window.backgroundRenderer.init().catch(error => {
                console.error('❌ 强制初始化失败:', error);
                // 使用CSS回退
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            });
        } else {
            console.log('✅ 背景渲染器已初始化');
            if (!window.backgroundRenderer.animationId) {
                console.log('🔄 启动渲染循环...');
                window.backgroundRenderer.resume();
            }
        }
    }
}

/**
 * 使用自定义着色器初始化背景渲染器
 * @param {string} vertexShaderSource - 顶点着色器源码
 * @param {string} fragmentShaderSource - 片段着色器源码
 */
function initWithCustomShader(vertexShaderSource, fragmentShaderSource) {
    console.log('🎨 使用自定义着色器初始化背景渲染器');
    if (window.backgroundRenderer) {
        if (window.backgroundRenderer.isInitialized) {
            // 如果已初始化，更新着色器
            window.backgroundRenderer.updateShader(vertexShaderSource, fragmentShaderSource);
        } else {
            // 如果未初始化，使用自定义着色器初始化
            window.backgroundRenderer.init(vertexShaderSource, fragmentShaderSource).catch(error => {
                console.error('❌ 自定义着色器初始化失败:', error);
                // 使用CSS回退
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            });
        }
    }
}

// 暴露函数到全局
window.forceStartBackground = forceStartBackground;
window.initWithCustomShader = initWithCustomShader;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
} else {
    initWhenReady();
}

// 延迟强制启动
setTimeout(() => {
    if (!window.backgroundRenderer || !window.backgroundRenderer.isInitialized) {
        console.log('⏰ 3秒后强制启动背景渲染器');
        forceStartBackground();
    }
}, 3000);