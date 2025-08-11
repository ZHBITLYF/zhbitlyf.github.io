/**
 * 渲染系统
 * 负责WebGL渲染管线的管理
 */
class RenderSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.uniformCache = new Map();
        this.attributeCache = new Map();
        this.currentShader = null;
        
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
        
        console.log('✅ 渲染系统初始化成功');
    }
    
    beginFrame() {
        const gl = this.gl;
        
        // 清空画布
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
        
        // 设置材质uniforms
        material.applyUniforms(gl, shader.program);
        
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
        // 帧结束处理
        this.currentShader = null;
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
    }
    
    destroy() {
        this.uniformCache.clear();
        this.attributeCache.clear();
        
        if (this.gl) {
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