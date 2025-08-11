/**
 * WebGL着色器类
 * 管理顶点着色器和片段着色器的编译和链接
 */
class Shader {
    constructor(gl, vertexSource, fragmentSource) {
        this.gl = gl;
        this.program = null;
        this.uniforms = new Map();
        this.attributes = new Map();
        
        this.compile(vertexSource, fragmentSource);
    }
    
    compile(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error('着色器程序链接失败: ' + this.gl.getProgramInfoLog(this.program));
        }
        
        // 清理着色器对象
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);
        
        // 缓存uniform和attribute位置
        this.cacheLocations();
    }
    
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
    
    cacheLocations() {
        // 获取所有active uniforms
        const numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const uniformInfo = this.gl.getActiveUniform(this.program, i);
            const location = this.gl.getUniformLocation(this.program, uniformInfo.name);
            this.uniforms.set(uniformInfo.name, location);
        }
        
        // 获取所有active attributes
        const numAttributes = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttributes; i++) {
            const attributeInfo = this.gl.getActiveAttrib(this.program, i);
            const location = this.gl.getAttribLocation(this.program, attributeInfo.name);
            this.attributes.set(attributeInfo.name, location);
        }
    }
    
    use() {
        this.gl.useProgram(this.program);
    }
    
    setUniform(name, value) {
        const location = this.uniforms.get(name);
        if (location === undefined) {
            console.warn(`Uniform '${name}' not found in shader`);
            return;
        }
        
        if (typeof value === 'number') {
            this.gl.uniform1f(location, value);
        } else if (Array.isArray(value)) {
            switch (value.length) {
                case 2:
                    this.gl.uniform2f(location, value[0], value[1]);
                    break;
                case 3:
                    this.gl.uniform3f(location, value[0], value[1], value[2]);
                    break;
                case 4:
                    this.gl.uniform4f(location, value[0], value[1], value[2], value[3]);
                    break;
            }
        }
    }
    
    getAttribute(name) {
        return this.attributes.get(name);
    }
    
    destroy() {
        if (this.program) {
            this.gl.deleteProgram(this.program);
            this.program = null;
        }
    }
}