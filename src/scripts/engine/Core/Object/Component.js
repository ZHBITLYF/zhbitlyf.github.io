/**
 * 组件基类
 * 实现ECS架构中的组件系统
 */
class Component {
    constructor(entity) {
        this.entity = entity;
        this.enabled = true;
    }
    
    update(deltaTime) {
        // 子类重写此方法
    }
    
    destroy() {
        this.entity = null;
    }
}