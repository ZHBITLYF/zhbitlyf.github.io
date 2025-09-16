
import { Component } from './Component.js';

/**
 * 变换组件
 * 管理实体的位置、旋转、缩放
 */
export class Transform extends Component {
    constructor(entity) {
        super(entity);
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        this.matrix = new Float32Array(16);
        this.dirty = true;
    }
    
    setPosition(x, y, z = 0) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.dirty = true;
    }
    
    setRotation(x, y, z) {
        this.rotation.x = x;
        this.rotation.y = y;
        this.rotation.z = z;
        this.dirty = true;
    }
    
    setScale(x, y, z = 1) {
        this.scale.x = x;
        this.scale.y = y;
        this.scale.z = z;
        this.dirty = true;
    }
    
    getMatrix() {
        if (this.dirty) {
            this.updateMatrix();
            this.dirty = false;
        }
        return this.matrix;
    }
    
    updateMatrix() {
        // 简化的矩阵计算（仅支持2D变换）
        const m = this.matrix;
        const cos = Math.cos(this.rotation.z);
        const sin = Math.sin(this.rotation.z);
        
        // 重置为单位矩阵
        m.fill(0);
        m[0] = cos * this.scale.x;
        m[1] = sin * this.scale.x;
        m[4] = -sin * this.scale.y;
        m[5] = cos * this.scale.y;
        m[10] = this.scale.z;
        m[12] = this.position.x;
        m[13] = this.position.y;
        m[14] = this.position.z;
        m[15] = 1;
    }
}