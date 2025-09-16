/**
 * 渲染系统
 * 负责WebGL渲染管线的管理
 */
export class RenderSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.uniformCache = new Map();
        this.attributeCache = new Map();
        this.currentShader = null;
        
        // 使用最高性能配置
        this.renderScale = 1.0; // 100%分辨率
        this.useRenderTarget = false; // 直接渲染更高效
        
        // 渲染目标缓冲区相关
        this.renderTarget = null;
        this.renderTexture = null;
        this.fullscreenQuad = null;
        this.blitShader = null;
        
        console.log('🎯 使用最高性能渲染配置 (100%分辨率，直接渲染)');
        
        this.init();
    }
    
    init() {
        // 获取WebGL上下文
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            throw new Error('WebGL不被支持');
        }
        
        // 设置WebGL状态
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // 创建渲染目标缓冲区
        this.createRenderTarget();
        
        // 创建用于最终显示的着色器和几何体
        this.createBlitResources();
        
        console.log('✅ 渲染系统初始化成功');
    }
    
    createRenderTarget() {
        const gl = this.gl;
        const width = Math.floor(this.canvas.width * this.renderScale);
        const height = Math.floor(this.canvas.height * this.renderScale);
        
        // 创建渲染纹理
        this.renderTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.renderTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        // 创建帧缓冲区
        this.renderTarget = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderTarget);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderTexture, 0);
        
        // 检查帧缓冲区完整性
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('❌ 渲染目标创建失败');
        }
        
        // 恢复默认帧缓冲区
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        console.log(`✅ 渲染目标创建成功 (${width}x${height})`);
    }
    
    createBlitResources() {
        const gl = this.gl;
        
        // 创建全屏四边形顶点数据
        const vertices = new Float32Array([
            -1, -1, 0, 0,
             1, -1, 1, 0,
            -1,  1, 0, 1,
             1,  1, 1, 1
        ]);
        
        this.fullscreenQuad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.fullscreenQuad);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        // 创建blit着色器
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;
        
        const fragmentShaderSource = `
            precision mediump float;
            uniform sampler2D u_texture;
            varying vec2 v_texCoord;
            
            void main() {
                gl_FragColor = texture2D(u_texture, v_texCoord);
            }
        `;
        
        this.blitShader = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    
    createShaderProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('着色器程序链接失败:', gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
    
    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('着色器编译失败:', gl.getShaderInfoLog(shader));
            return null;
        }
        
        return shader;
    }
    
    beginFrame() {
        const gl = this.gl;
        
        if (this.useRenderTarget && this.renderTarget && this.renderTexture) {
            // 使用RT缓冲区渲染
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderTarget);
            let width = Math.floor(this.canvas.width * this.renderScale);
            let height = Math.floor(this.canvas.height * this.renderScale);
            width = Math.max(width, 64);
            height = Math.max(height, 64);
            gl.viewport(0, 0, width, height);
        } else {
            // 直接渲染到屏幕
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 清空渲染目标
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    
    renderComponent(renderComponent) {
        const gl = this.gl;
        const material = renderComponent.material;
        const geometry = renderComponent.geometry;
        const shader = material.shader;
        
        // 切换着色器（如果需要）
        if (this.currentShader !== shader) {
            gl.useProgram(shader.program);
            this.currentShader = shader;
        }
        
        // 材质应用（包含uniform设置）
        material.apply();
        
        // 获取Transform组件（如果存在）
        const transform = renderComponent.entity.getComponent('Transform');
        if (transform) {
            const matrixLocation = gl.getUniformLocation(shader.program, 'u_modelMatrix');
            if (matrixLocation) {
                gl.uniformMatrix4fv(matrixLocation, false, transform.getMatrix());
            }
        }
        
        // 绑定几何体
        geometry.bind(gl, shader.program);
        
        // 绘制
        if (geometry.indexBuffer) {
            gl.drawElements(gl.TRIANGLES, geometry.indexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, geometry.vertexCount);
        }
        
        // 解绑
        geometry.unbind(gl);
    }
    
    endFrame() {
        const gl = this.gl;
        
        if (this.useRenderTarget && this.renderTarget && this.renderTexture && this.blitShader && this.fullscreenQuad) {
            // 使用RT缓冲区，需要blit到屏幕
            
            // 切换回默认帧缓冲区
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            
            // 清空屏幕
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
            // 使用blit着色器将渲染目标纹理绘制到屏幕
            gl.useProgram(this.blitShader);
            
            // 绑定渲染纹理
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.renderTexture);
            
            // 缓存uniform位置以避免重复查询
            if (!this.blitTextureLocation) {
                this.blitTextureLocation = gl.getUniformLocation(this.blitShader, 'u_texture');
            }
            gl.uniform1i(this.blitTextureLocation, 0);
            
            // 绑定全屏四边形
            gl.bindBuffer(gl.ARRAY_BUFFER, this.fullscreenQuad);
            
            // 缓存属性位置以避免重复查询
            if (!this.blitPositionLocation || !this.blitTexCoordLocation) {
                this.blitPositionLocation = gl.getAttribLocation(this.blitShader, 'a_position');
                this.blitTexCoordLocation = gl.getAttribLocation(this.blitShader, 'a_texCoord');
            }
            
            if (this.blitPositionLocation === -1 || this.blitTexCoordLocation === -1) {
                console.error('❌ Blit着色器属性位置获取失败');
                return;
            }
            
            gl.enableVertexAttribArray(this.blitPositionLocation);
            gl.enableVertexAttribArray(this.blitTexCoordLocation);
            
            gl.vertexAttribPointer(this.blitPositionLocation, 2, gl.FLOAT, false, 16, 0);
            gl.vertexAttribPointer(this.blitTexCoordLocation, 2, gl.FLOAT, false, 16, 8);
            
            // 绘制全屏四边形
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            
            // 清理状态
            gl.disableVertexAttribArray(this.blitPositionLocation);
            gl.disableVertexAttribArray(this.blitTexCoordLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        
        this.currentShader = null;
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        // 重新创建渲染目标以匹配新尺寸
        this.destroyRenderTarget();
        this.createRenderTarget();
        
        // 设置默认视口
        this.gl.viewport(0, 0, width, height);
    }
    
    destroyRenderTarget() {
        const gl = this.gl;
        
        if (this.renderTarget) {
            gl.deleteFramebuffer(this.renderTarget);
            this.renderTarget = null;
        }
        
        if (this.renderTexture) {
            gl.deleteTexture(this.renderTexture);
            this.renderTexture = null;
        }
    }
    
    destroy() {
        this.uniformCache.clear();
        this.attributeCache.clear();
        
        if (this.gl) {
            // 清理渲染目标资源
            this.destroyRenderTarget();
            
            // 清理blit资源
            if (this.fullscreenQuad) {
                this.gl.deleteBuffer(this.fullscreenQuad);
                this.fullscreenQuad = null;
            }
            
            if (this.blitShader) {
                this.gl.deleteProgram(this.blitShader);
                this.blitShader = null;
            }
            
            // 清理WebGL资源
            const numTextureUnits = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
            for (let unit = 0; unit < numTextureUnits; ++unit) {
                this.gl.activeTexture(this.gl.TEXTURE0 + unit);
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
                this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
            }
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }
        
        console.log('🗑️ 渲染系统已销毁');
    }
}