/**
 * 材质类
 * 封装着色器和相关参数
 */
export class Material {
    constructor(shader) {
        this.shader = shader;
        this.uniforms = new Map();
    }
    
    setUniform(name, value) {
        this.uniforms.set(name, value);
    }
    
    apply() {
        this.shader.use();
        for (const [name, value] of this.uniforms) {
            this.shader.setUniform(name, value);
        }
    }
    
    applyUniforms(gl, program) {
        // 兼容旧接口，直接调用apply方法
        this.apply();
    }
}