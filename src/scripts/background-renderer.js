/**
 * 首页背景渲染器
 * 参考webgl-test.html的简洁实现，直接使用WebGL API创建高效的动态背景
 */

// 测试脚本加载
console.log('🔧 background-renderer.js 脚本已加载');

class SimpleBackgroundRenderer {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.isInitialized = false;
        this.animationId = null;
        
        // 动画参数
        this.startTime = performance.now();
        this.timeUniform = null;
        this.resolutionUniform = null;
        
        // FPS控制参数
        this.targetFPS = 60;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsStartTime = 0;
    }
    
    /**
     * 初始化背景渲染器
     */
    async init() {
        try {
            console.log('🎨 初始化简洁背景渲染器...');
            
            // 创建canvas元素
            console.log('📋 步骤1: 创建canvas元素');
            this.createCanvas();
            
            // 初始化WebGL上下文
            console.log('🔧 步骤2: 初始化WebGL上下文');
            this.initWebGL();
            
            // 创建着色器程序
            console.log('🎭 步骤3: 创建着色器程序');
            this.createShaderProgram();
            
            // 创建全屏四边形
            console.log('📐 步骤4: 创建全屏四边形');
            this.createFullscreenQuad();
            
            // 启动渲染循环
            console.log('🔄 步骤5: 启动渲染循环');
            this.startRenderLoop();
            
            // 监听窗口大小变化
            console.log('📏 步骤6: 设置窗口大小监听');
            this.setupResizeHandler();
            
            // 清除body的背景样式，确保WebGL canvas可见
            document.body.style.background = 'transparent';
            
            // 确保canvas在最前面但不阻挡交互
            this.canvas.style.zIndex = '-1';
            this.canvas.style.pointerEvents = 'none';
            
            this.isInitialized = true;
            console.log('✅ 简洁背景渲染器初始化完成');
            
        } catch (error) {
            console.error('❌ 背景渲染器初始化失败:', error);
            console.error('错误堆栈:', error.stack);
            // 临时禁用CSS回退，显示错误信息
            alert('WebGL初始化失败: ' + error.message);
            // this.fallbackToCSS();
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
     * 初始化WebGL上下文
     */
    initWebGL() {
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        if (!this.gl) {
            throw new Error('WebGL不支持');
        }
        
        console.log('✅ WebGL上下文创建成功');
        
        // 设置视口
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * 创建着色器程序
     */
    createShaderProgram() {
        // 顶点着色器 - 创建全屏四边形
        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        // 片段着色器 - 创建动态渐变背景
        const fragmentShaderSource = `
            precision mediump float;
            
            uniform float u_time;
            uniform vec2 u_resolution;
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
        
        // 创建着色器
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        // 创建程序
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error('着色器程序链接失败: ' + this.gl.getProgramInfoLog(this.program));
        }
        
        // 获取uniform位置
        this.timeUniform = this.gl.getUniformLocation(this.program, 'u_time');
        this.resolutionUniform = this.gl.getUniformLocation(this.program, 'u_resolution');
        
        console.log('✅ 着色器程序创建成功');
    }
    
    /**
     * 创建着色器
     */
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const error = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error('着色器编译失败: ' + error);
        }
        
        return shader;
    }
    
    /**
     * 创建全屏四边形
     */
    createFullscreenQuad() {
        // 全屏四边形顶点（两个三角形）
        const vertices = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0
        ]);
        
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
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
            if (!this.isInitialized) return;
            
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
            
            // 使用着色器程序
            this.gl.useProgram(this.program);
            
            // 设置uniform
            this.gl.uniform1f(this.timeUniform, animationTime);
            this.gl.uniform2f(this.resolutionUniform, this.canvas.width, this.canvas.height);
            
            // 清除并渲染
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
            
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
        console.log('🎬 优化渲染循环已启动 (60FPS + VSync)');
    }
    
    /**
     * 设置窗口大小变化处理
     */
    setupResizeHandler() {
        const resizeHandler = () => {
            this.resizeCanvas();
            if (this.gl) {
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
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
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        this.isInitialized = false;
        console.log('🗑️ 背景渲染器已销毁');
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

/**
 * 等待DOM就绪后初始化
 */
function initWhenReady() {
    console.log('🚀 开始初始化背景渲染器');
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

// 暴露强制启动函数到全局
window.forceStartBackground = forceStartBackground;

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