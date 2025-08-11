/**
 * 资源管理器
 * 管理着色器、纹理、模型等资源的加载和缓存
 */
class ResourceManager {
    constructor() {
        this.shaders = new Map();
        this.textures = new Map();
        this.geometries = new Map();
        this.materials = new Map();
    }
    
    createShader(name, gl, vertexSource, fragmentSource) {
        if (this.shaders.has(name)) {
            console.warn(`着色器 '${name}' 已存在，将被覆盖`);
            this.shaders.get(name).destroy();
        }
        
        const shader = new Shader(gl, vertexSource, fragmentSource);
        this.shaders.set(name, shader);
        return shader;
    }
    
    getShader(name) {
        return this.shaders.get(name);
    }
    
    createMaterial(name, shader) {
        if (this.materials.has(name)) {
            console.warn(`材质 '${name}' 已存在，将被覆盖`);
        }
        
        const material = new Material(shader);
        this.materials.set(name, material);
        return material;
    }
    
    getMaterial(name) {
        return this.materials.get(name);
    }
    
    createGeometry(name, gl, vertices, indices = null) {
        if (this.geometries.has(name)) {
            console.warn(`几何体 '${name}' 已存在，将被覆盖`);
            this.geometries.get(name).destroy();
        }
        
        const geometry = new Geometry(gl, vertices, indices);
        this.geometries.set(name, geometry);
        return geometry;
    }
    
    getGeometry(name) {
        return this.geometries.get(name);
    }
    
    destroy() {
        // 销毁所有资源
        this.shaders.forEach(shader => shader.destroy());
        this.geometries.forEach(geometry => geometry.destroy());
        
        this.shaders.clear();
        this.textures.clear();
        this.geometries.clear();
        this.materials.clear();
    }
}