/**
 * 场景管理器
 * 管理场景中的所有实体和组件
 */
class SceneManager {
    constructor() {
        this.rootEntity = new Entity('Root');
        this.renderQueue = [];
        this.eventSystem = new EventSystem();
    }
    
    createEntity(name) {
        const entity = new Entity(name);
        this.rootEntity.addChild(entity);
        return entity;
    }
    
    removeEntity(entity) {
        entity.destroy();
    }
    
    update(deltaTime) {
        this.rootEntity.update(deltaTime);
        this.updateRenderQueue();
    }
    
    updateRenderQueue() {
        this.renderQueue.length = 0;
        this.collectRenderComponents(this.rootEntity);
        
        // 按渲染顺序排序
        this.renderQueue.sort((a, b) => a.renderOrder - b.renderOrder);
    }
    
    collectRenderComponents(entity) {
        if (!entity.active) return;
        
        const renderComponent = entity.getComponent('RenderComponent');
        if (renderComponent && renderComponent.visible && renderComponent.material && renderComponent.geometry) {
            this.renderQueue.push(renderComponent);
        }
        
        entity.children.forEach(child => this.collectRenderComponents(child));
    }
    
    getRenderQueue() {
        return this.renderQueue;
    }
    
    destroy() {
        this.rootEntity.destroy();
        this.renderQueue.length = 0;
        this.eventSystem.clear();
    }
}