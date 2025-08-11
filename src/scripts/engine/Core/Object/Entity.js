/**
 * 实体类
 * ECS架构中的实体，可以添加多个组件
 */
class Entity {
    constructor(name = 'Entity') {
        this.name = name;
        this.components = new Map();
        this.children = [];
        this.parent = null;
        this.active = true;
    }
    
    addComponent(component) {
        const type = component.constructor.name;
        if (this.components.has(type)) {
            console.warn(`实体 '${this.name}' 已有组件 '${type}'，将被替换`);
            this.components.get(type).destroy();
        }
        this.components.set(type, component);
        return component;
    }
    
    getComponent(componentType) {
        const typeName = typeof componentType === 'string' ? componentType : componentType.name;
        return this.components.get(typeName);
    }
    
    removeComponent(componentType) {
        const typeName = typeof componentType === 'string' ? componentType : componentType.name;
        const component = this.components.get(typeName);
        if (component) {
            component.destroy();
            this.components.delete(typeName);
        }
    }
    
    addChild(entity) {
        if (entity.parent) {
            entity.parent.removeChild(entity);
        }
        entity.parent = this;
        this.children.push(entity);
    }
    
    removeChild(entity) {
        const index = this.children.indexOf(entity);
        if (index > -1) {
            this.children.splice(index, 1);
            entity.parent = null;
        }
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // 更新所有组件
        this.components.forEach(component => {
            if (component.enabled) {
                component.update(deltaTime);
            }
        });
        
        // 更新子实体
        this.children.forEach(child => child.update(deltaTime));
    }
    
    destroy() {
        // 销毁所有组件
        this.components.forEach(component => component.destroy());
        this.components.clear();
        
        // 销毁子实体
        this.children.forEach(child => child.destroy());
        this.children.length = 0;
        
        // 从父实体中移除
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }
}