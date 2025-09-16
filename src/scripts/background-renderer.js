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

// ES6模块导入
import { GameEngine } from './engine/Core/GameEngine.js';
import { RenderSystem } from './engine/Renderer/RenderSystem.js';
import { Shader } from './engine/Renderer/Shader.js';
import { Material } from './engine/Renderer/Material.js';
import { Geometry } from './engine/Renderer/Geometry.js';
import { EventSystem } from './engine/Core/Event/EventSystem.js';
import { ResourceManager } from './engine/Resource/ResourceManager.js';
import { SceneManager } from './engine/Scene/SceneManager.js';
import { Component } from './engine/Core/Object/Component.js';
import { Transform } from './engine/Core/Object/Transform.js';
import { RenderComponent } from './engine/Core/Object/RenderComponent.js';
import { Entity } from './engine/Core/Object/Entity.js';

// 测试脚本加载
console.log('🔧 WebGL游戏引擎脚本已加载');

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
        
        // 统一使用最高性能配置
        this.performanceLevel = 'high';
        
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
        
        // 根据性能等级选择着色器
        this.defaultFragmentShader = this.getOptimizedShader();
    }
    

    
    /**
     * 获取高性能着色器 - 流体波纹效果
     */
    getOptimizedShader() {
        return `
            precision mediump float;
            uniform float u_time;
            varying vec2 v_uv;
            
            #define S(a,b,t) smoothstep(a,b,t)
            
            mat2 Rot(float a) {
                float s = sin(a);
                float c = cos(a);
                return mat2(c, -s, s, c);
            }
            
            // Created by inigo quilez - iq/2014
            // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
            vec2 hash(vec2 p) {
                p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
                return fract(sin(p) * 43758.5453);
            }
            
            float noise(in vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                
                vec2 u = f * f * (3.0 - 2.0 * f);
                
                float n = mix(mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                                 dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                             mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                                 dot(-1.0 + 2.0 * hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
                return 0.5 + 0.5 * n;
            }
            
            void main() {
                vec2 fragCoord = v_uv * vec2(800.0, 600.0); // 模拟分辨率
                vec2 iResolution = vec2(800.0, 600.0);
                float iTime = u_time * 0.001;
                
                vec2 uv = fragCoord / iResolution.xy;
                float ratio = iResolution.x / iResolution.y;
                
                vec2 tuv = uv;
                tuv -= 0.5;
                
                // rotate with Noise
                float degree = noise(vec2(iTime * 0.1, tuv.x * tuv.y));
                
                tuv.y *= 1.0 / ratio;
                tuv *= Rot(radians((degree - 0.5) * 720.0 + 180.0));
                tuv.y *= ratio;
                
                // Wave warp with sin
                float frequency = 5.0;
                float amplitude = 30.0;
                float speed = iTime * 2.0;
                tuv.x += sin(tuv.y * frequency + speed) / amplitude;
                tuv.y += sin(tuv.x * frequency * 1.5 + speed) / (amplitude * 0.5);
                
                // draw the image
                vec3 colorYellow = vec3(0.957, 0.804, 0.623);
                vec3 colorDeepBlue = vec3(0.192, 0.384, 0.933);
                vec3 layer1 = mix(colorYellow, colorDeepBlue, S(-0.3, 0.2, (tuv * Rot(radians(-5.0))).x));
                
                vec3 colorRed = vec3(0.910, 0.510, 0.8);
                vec3 colorBlue = vec3(0.350, 0.71, 0.953);
                vec3 layer2 = mix(colorRed, colorBlue, S(-0.3, 0.2, (tuv * Rot(radians(-5.0))).x));
                
                vec3 finalComp = mix(layer1, layer2, S(0.5, -0.3, tuv.y));
                
                vec3 col = finalComp;
                
                gl_FragColor = vec4(col, 1.0);
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
            
            // 初始化GameEngine（最高性能模式）
            console.log('🔧 步骤2: 初始化GameEngine (最高性能模式)');
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
            
            // 创建背景实体
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
            
            // 设置窗口大小监听
            console.log('📏 步骤7: 设置窗口大小监听');
            this.setupResizeHandler();
            
            // 设置背景透明
            document.body.style.background = 'transparent';
            
            // 确保canvas在最底层
            this.canvas.style.zIndex = '-1';
            this.canvas.style.pointerEvents = 'none';
            
            this.isInitialized = true;
            console.log('✅ GameEngine背景渲染器初始化完成');
            
        } catch (error) {
            console.error('❌ 背景渲染器初始化失败:', error);
            console.error('错误堆栈:', error.stack);
            this.fallbackToCSS();
            alert('WebGL初始化失败: ' + error.message);
        }
    }

    /**
     * 更新着色器
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
            
            // 更新背景实体的材质
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
        // 查找现有的canvas元素
        this.canvas = document.getElementById('webgl-background');
        if (!this.canvas) {
            console.error('❌ 未找到webgl-background canvas元素');
            throw new Error('WebGL canvas元素不存在');
        }

        console.log('✅ 找到现有的WebGL canvas元素');
        
        // 设置canvas样式
        this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
            `;
        
        // 设置canvas尺寸
        this.resizeCanvas();
    }

    /**
     * 启动渲染循环
     */
    startRenderLoop() {
        // 自适应帧率设置
        let targetFPS = 60;
        let targetFrameTime = 1000 / targetFPS;
        let lastFrameTime = 0;
        let frameCount = 0;
        let fpsStartTime = performance.now();
        let performanceCheckInterval = 5000; // 每5秒检查一次性能
        let lastPerformanceCheck = performance.now();
        
        const render = (currentTime) => {
            if (!this.isInitialized || !this.gameEngine || !this.gameEngine.isRunning) return;
            
            // 计算帧间隔
            const deltaTime = currentTime - lastFrameTime;
            
            // 智能跳帧：根据性能动态调整
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
                }
            }
            
            // GameEngine会自动处理渲染
            
            // 性能监控和自适应调整
            frameCount++;
            if (currentTime - lastPerformanceCheck >= performanceCheckInterval) {
                const actualFPS = Math.round((frameCount * performanceCheckInterval) / (currentTime - fpsStartTime));
                
                // 自适应帧率调整
                if (actualFPS < 30 && targetFPS > 30) {
                    targetFPS = 30;
                    targetFrameTime = 1000 / targetFPS;
                    console.warn('⚠️ 性能较低，降低目标帧率至30FPS');
                } else if (actualFPS >= 55 && targetFPS < 60) {
                    targetFPS = 60;
                    targetFrameTime = 1000 / targetFPS;
                    console.log('✅ 性能良好，恢复60FPS');
                }
                
                // 重置计数器
                frameCount = 0;
                fpsStartTime = currentTime;
                lastPerformanceCheck = currentTime;
            }
            
            this.animationId = requestAnimationFrame(render);
        };
        
        // 初始化时间戳
        this.startTime = performance.now();
        this.animationId = requestAnimationFrame(render);
        console.log('🎬 智能渲染循环已启动 (自适应帧率)');
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
        
        // 使用最高分辨率
         const resolutionScale = 1.0;
        
        this.canvas.width = displayWidth * dpr * resolutionScale;
        this.canvas.height = displayHeight * dpr * resolutionScale;
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
        
        // 销毁GameEngine
        if (this.gameEngine) {
            this.gameEngine.destroy();
            this.gameEngine = null;
        }
        
        this.backgroundEntity = null;
        
        // 移除canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
        }
        
        console.log('🗑️ GameEngine背景渲染器已销毁');
    }

    /**
     * 回退到CSS背景
     */
    fallbackToCSS() {
        console.log('🔄 使用CSS渐变背景作为回退方案');
        
        // 移除WebGL canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
        }
        
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

/**
 * 背景管理器
 */
class BackgroundManager {
    constructor() {
        this.renderer = new SimpleBackgroundRenderer();
    }
    
    getRenderer() {
        return this.renderer;
    }
    
    async initIfNeeded() {
        if (!this.renderer.isInitialized) {
            await this.renderer.init();
        }
    }
}

// 全局背景管理器实例
window.backgroundManager = window.backgroundManager || new BackgroundManager();
const backgroundRenderer = window.backgroundManager.getRenderer();

// 初始化函数
function initWhenReady() {
    backgroundRenderer.init();
}

// 强制启动背景函数
function forceStartBackground() {
    try {
        if (backgroundRenderer.isInitialized) {
            console.log('🔄 背景渲染器已初始化，重新启动...');
            backgroundRenderer.destroy();
        }
        backgroundRenderer.init();
    } catch (error) {
        console.error('❌ 强制启动背景失败:', error);
        backgroundRenderer.fallbackToCSS();
    }
}

// 自定义着色器初始化函数
function initWithCustomShader(vertexShaderSource, fragmentShaderSource) {
    try {
        if (backgroundRenderer.isInitialized) {
            backgroundRenderer.updateShader(vertexShaderSource, fragmentShaderSource);
        } else {
            backgroundRenderer.init(vertexShaderSource, fragmentShaderSource);
        }
    } catch (error) {
        console.error('❌ 自定义着色器初始化失败:', error);
        backgroundRenderer.fallbackToCSS();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
} else {
    initWhenReady();
}

// 延迟启动备用方案
setTimeout(() => {
    if (!backgroundRenderer.isInitialized) {
        console.warn('⚠️ 背景渲染器初始化超时，尝试强制启动');
        forceStartBackground();
    }
}, 500);

// 导出模块
export { 
    backgroundRenderer, 
    forceStartBackground, 
    initWithCustomShader, 
    SimpleBackgroundRenderer,
    BackgroundManager,
    GameEngine,
    RenderSystem,
    Shader,
    Material,
    Geometry,
    EventSystem,
    ResourceManager,
    SceneManager,
    Component,
    Transform,
    RenderComponent,
    Entity
};