# WebGL 渲染引擎

## 概述

这是一个基于WebGL的现代渲染引擎，参考了Cocos、Unreal、Unity等主流游戏引擎的架构设计。引擎采用模块化设计，支持组件系统，具有良好的扩展性和可维护性。

## 架构设计

### 核心模块

```
src/engine/
├── core/                    # 核心模块
│   ├── Engine.js           # 引擎主类
│   ├── GameObject.js       # 游戏对象和组件系统
│   ├── TimeManager.js      # 时间管理器
│   └── ResourceManager.js  # 资源管理器
├── renderer/               # 渲染模块
│   ├── Renderer.js         # 主渲染器
│   ├── ShaderManager.js    # 着色器管理器
│   └── MaterialManager.js  # 材质管理器
├── components/             # 组件模块
│   ├── Camera.js           # 相机组件
│   └── MeshRenderer.js     # 网格渲染器组件
├── scene/                  # 场景管理
│   └── SceneManager.js     # 场景管理器
├── math/                   # 数学库
│   └── MathLib.js          # 向量、矩阵运算
└── Engine.js               # 引擎入口文件
```

### 设计模式

1. **组件系统 (ECS)**
   - 参考Unity的GameObject-Component架构
   - 每个GameObject可以添加多个Component
   - 组件之间通过事件系统通信

2. **管理器模式**
   - 各个功能模块独立管理
   - 统一的生命周期管理
   - 资源的集中管理和释放

3. **工厂模式**
   - EngineFactory负责创建引擎实例
   - 统一的创建接口和配置

## 核心特性

### 1. 渲染管线

- **WebGL上下文管理**: 自动检测WebGL2/WebGL1支持
- **着色器系统**: 动态编译和管理着色器程序
- **材质系统**: 支持多种材质类型和参数
- **网格管理**: 顶点缓冲区和索引缓冲区管理

### 2. 场景系统

- **场景管理**: 多场景支持和切换
- **层级系统**: GameObject父子关系管理
- **相机系统**: 透视和正交投影支持

### 3. 组件系统

- **Transform**: 位置、旋转、缩放变换
- **MeshRenderer**: 网格渲染组件
- **Camera**: 相机组件
- **可扩展**: 易于添加新的组件类型

### 4. 资源管理

- **纹理管理**: 图片加载和WebGL纹理创建
- **音频管理**: 音频文件加载和播放
- **内存管理**: 自动资源释放和垃圾回收

### 5. 输入系统

- **键盘输入**: 按键状态检测
- **鼠标输入**: 鼠标位置和按钮状态
- **触摸输入**: 移动设备触摸支持

## 使用方法

### 基本初始化

```javascript
// 1. 加载引擎
await RenderEngine.load({
    onProgress: (loaded, total) => {
        console.log(`加载进度: ${loaded}/${total}`);
    }
});

// 2. 创建引擎实例
const engine = await RenderEngine.create('canvas-id', {
    width: 800,
    height: 600,
    clearColor: [0.0, 0.0, 0.0, 1.0]
});

// 3. 创建场景
const scene = engine.sceneManager.createScene('main');

// 4. 启动引擎
engine.start();
```

### 创建游戏对象

```javascript
const { GameObject, MeshRenderer } = window.EngineModules;

// 创建游戏对象
const cube = new GameObject('Cube');

// 添加网格渲染器组件
const meshRenderer = cube.addComponent(new MeshRenderer());

// 设置网格和材质
const mesh = engine.renderer.meshManager.createCube('cube');
const material = engine.renderer.materialManager.getMaterial('basic');

meshRenderer.setMesh(mesh);
meshRenderer.setMaterial(material);

// 设置变换
cube.transform.setPosition(0, 0, -5);
cube.transform.setRotation(45, 45, 0);

// 添加到场景
scene.addGameObject(cube);
```

### 自定义着色器

```javascript
// 创建自定义着色器
engine.renderer.shaderManager.createShader('custom', {
    vertex: `
        attribute vec3 a_position;
        uniform mat4 u_mvpMatrix;
        void main() {
            gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
        }
    `,
    fragment: `
        precision mediump float;
        uniform float u_time;
        void main() {
            float r = sin(u_time) * 0.5 + 0.5;
            gl_FragColor = vec4(r, 0.0, 1.0 - r, 1.0);
        }
    `
});

// 创建使用自定义着色器的材质
const customMaterial = engine.renderer.materialManager.createMaterial('custom', {
    shaderName: 'custom',
    uniforms: {
        u_time: 0.0
    }
});
```

## 背景渲染器示例

项目中包含了一个完整的背景渲染器示例 (`src/scripts/background-renderer.js`)，展示了如何：

1. 创建全屏动态背景
2. 实现实时颜色动画
3. 响应窗口大小变化
4. 提供CSS回退方案

## 扩展性设计

### 未来WebGPU支持

引擎架构已考虑WebGPU兼容性：

1. **抽象渲染接口**: 渲染器使用抽象接口，便于切换底层API
2. **着色器抽象**: 着色器管理器可扩展支持WGSL
3. **资源管理**: 统一的资源管理接口

### 添加新组件

```javascript
class CustomComponent extends Component {
    constructor() {
        super();
        this.customProperty = 0;
    }
    
    update(deltaTime) {
        // 组件更新逻辑
        this.customProperty += deltaTime;
    }
    
    onAttach() {
        // 组件附加时的初始化
    }
    
    onDetach() {
        // 组件分离时的清理
    }
}
```

## 性能优化

1. **批处理渲染**: 相同材质的对象批量渲染
2. **视锥剔除**: 相机视野外的对象不参与渲染
3. **LOD系统**: 距离相关的细节层次
4. **对象池**: 减少内存分配和垃圾回收

## 调试工具

- **渲染统计**: 绘制调用次数、顶点数、三角形数
- **FPS监控**: 实时帧率显示
- **资源监控**: 内存使用情况
- **着色器调试**: 编译错误信息

## 浏览器兼容性

- **WebGL2**: 现代浏览器首选
- **WebGL1**: 兼容较老浏览器
- **CSS回退**: WebGL不支持时的备选方案

## 开发建议

1. **模块化开发**: 保持各模块职责单一
2. **错误处理**: 完善的错误捕获和处理
3. **性能监控**: 定期检查渲染性能
4. **内存管理**: 及时释放不用的资源
5. **代码规范**: 保持一致的编码风格

## 总结

这个渲染引擎提供了一个完整的3D渲染解决方案，具有良好的架构设计和扩展性。通过参考主流游戏引擎的设计模式，实现了一个轻量级但功能完整的WebGL渲染引擎，适合用于Web应用的3D渲染需求。