import { Component } from './Component.js';

/**
 * 渲染组件
 * 管理实体的渲染相关属性
 */
export class RenderComponent extends Component {
    constructor(entity, material, geometry) {
        super(entity);
        this.material = material;
        this.geometry = geometry;
        this.visible = true;
        this.renderOrder = 0;
    }
    
    setMaterial(material) {
        this.material = material;
    }
    
    setGeometry(geometry) {
        this.geometry = geometry;
    }
}