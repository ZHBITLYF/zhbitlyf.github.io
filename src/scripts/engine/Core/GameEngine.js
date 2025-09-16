import { RenderSystem } from '../Renderer/RenderSystem.js';
import { ResourceManager } from '../Resource/ResourceManager.js';
import { SceneManager } from '../Scene/SceneManager.js';
import { EventSystem } from './Event/EventSystem.js';

/**
 * 游戏引擎核心
 * 管理所有子系统，提供统一的引擎接口
 */
export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderSystem = new RenderSystem(canvas);
        this.resourceManager = new ResourceManager();
        this.sceneManager = new SceneManager();
        this.eventSystem = new EventSystem();
        
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;
        
        console.log('🚀 游戏引擎初始化完成 (最高性能模式)');
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        
        console.log('▶️ 游戏引擎已启动');
    }
    
    stop() {
        this.isRunning = false;
        console.log('⏹️ 游戏引擎已停止');
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
        this.lastTime = currentTime;
        
        // 更新FPS
        this.updateFPS(currentTime);
        
        // 更新场景
        this.sceneManager.update(this.deltaTime);
        
        // 渲染
        this.render();
        
        // 继续循环
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
            
            // 发送FPS更新事件
            this.eventSystem.emit('fpsUpdate', this.fps);
        }
    }
    
    render() {
        this.renderSystem.beginFrame();
        
        // 渲染场景中的所有渲染组件
        const renderQueue = this.sceneManager.getRenderQueue();
        renderQueue.forEach(renderComponent => {
            this.renderSystem.renderComponent(renderComponent);
        });
        
        this.renderSystem.endFrame();
    }
    
    resize(width, height) {
        this.renderSystem.resize(width, height);
        this.eventSystem.emit('resize', width, height);
    }
    
    // 便捷方法：创建实体
    createEntity(name) {
        return this.sceneManager.createEntity(name);
    }
    
    // 便捷方法：创建着色器
    createShader(name, vertexSource, fragmentSource) {
        return this.resourceManager.createShader(name, this.renderSystem.gl, vertexSource, fragmentSource);
    }
    
    // 便捷方法：创建材质
    createMaterial(name, shader) {
        return this.resourceManager.createMaterial(name, shader);
    }
    
    // 便捷方法：创建几何体
    createGeometry(name, vertices, indices = null) {
        return this.resourceManager.createGeometry(name, this.renderSystem.gl, vertices, indices);
    }
    
    // 获取WebGL上下文
    getGL() {
        return this.renderSystem.gl;
    }
    
    // 获取FPS
    getFPS() {
        return this.fps;
    }
    
    // 获取帧时间
    getDeltaTime() {
        return this.deltaTime;
    }
    
    destroy() {
        this.stop();
        this.sceneManager.destroy();
        this.resourceManager.destroy();
        this.renderSystem.destroy();
        this.eventSystem.clear();
        
        console.log('🗑️ 游戏引擎已销毁');
    }
}