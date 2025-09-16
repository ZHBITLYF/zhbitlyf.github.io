/**
 * 几何体类
 * 管理顶点数据
 */
export class Geometry {
    constructor(gl, vertices, indices = null) {
        this.gl = gl;
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.vertexCount = 0;
        this.indexCount = 0;
        
        this.setupBuffers(vertices, indices);
    }
    
    setupBuffers(vertices, indices) {
        // 创建顶点缓冲区
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.vertexCount = vertices.length / 2; // 假设是2D顶点
        
        // 创建索引缓冲区（如果提供）
        if (indices) {
            this.indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
            this.indexCount = indices.length;
        }
    }
    
    bind(gl, program) {
        // 兼容新旧接口
        if (typeof gl === 'object' && gl.getAttribute) {
            // 旧接口：bind(shader)
            const shader = gl;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            
            const positionLocation = shader.getAttribute('a_position');
            if (positionLocation !== undefined) {
                this.gl.enableVertexAttribArray(positionLocation);
                this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            }
            
            if (this.indexBuffer) {
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            }
        } else {
            // 新接口：bind(gl, program)
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            
            const positionLocation = gl.getAttribLocation(program, 'a_position');
            if (positionLocation !== -1) {
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            }
            
            if (this.indexBuffer) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            }
        }
    }
    
    unbind(gl) {
        // 解绑缓冲区
        if (gl) {
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            if (this.indexBuffer) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            }
        }
    }
    
    draw() {
        if (this.indexBuffer) {
            this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
        } else {
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
        }
    }
    
    destroy() {
        if (this.vertexBuffer) {
            this.gl.deleteBuffer(this.vertexBuffer);
        }
        if (this.indexBuffer) {
            this.gl.deleteBuffer(this.indexBuffer);
        }
    }
}