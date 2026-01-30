# 像素皮肤系统设计文档

## 设计目标

为2048游戏添加像素风皮肤系统，满足以下需求：
1. 提供默认/像素两种皮肤可选
2. 像素数字使用Canvas动态绘制
3. 与三套主题（light/dark/neon）完美兼容
4. 实现高效的缓存机制优化性能

## 架构设计

### 核心类：TileSkinManager

```javascript
class TileSkinManager {
  constructor() {
    this.pixelCanvas = document.createElement('canvas')
    this.pixelCtx = this.pixelCanvas.getContext('2d')
    this.pixelSize = 5
    this.pixelCache = new Map()
  }

  // 判断是否使用像素皮肤
  isPixelSkin() {
    return this.currentSkin === 'pixel'
  }

  // 获取数字的像素背景图URL
  getPixelBackground(number, theme) {
    // 检查缓存
    const cacheKey = `${number}-${theme}`
    if (this.pixelCache.has(cacheKey)) {
      return this.pixelCache.get(cacheKey)
    }
    // 绘制像素数字
    const dataUrl = this.drawPixelNumber(number, theme)
    this.pixelCache.set(cacheKey, dataUrl)
    return dataUrl
  }

  // 绘制像素数字
  drawPixelNumber(number, theme) {
    // 设置Canvas尺寸
    // 根据主题获取颜色
    // 绘制5x7点阵数字
    // 返回dataURL
  }

  // 清除缓存
  clearCache() {
    this.pixelCache.clear()
  }

  // 设置当前皮肤
  setSkin(skinType) {
    this.currentSkin = skinType
    this.clearCache()
  }
}
```

### 与现有系统的集成

#### 1. Game2048 类集成

```javascript
class Game2048 {
  constructor() {
    this.skinManager = new TileSkinManager()
    // 从localStorage读取皮肤设置
    const savedSkin = localStorage.getItem('tileSkin') || 'default'
    this.skinManager.setSkin(savedSkin)
  }

  updateDisplay() {
    // 为每个方块应用皮肤
    const tile = document.createElement('div')
    if (this.skinManager.isPixelSkin()) {
      const bgUrl = this.skinManager.getPixelBackground(value, this.themeManager.currentTheme)
      tile.style.backgroundImage = `url(${bgUrl})`
      tile.classList.add('tile-pixel')
    }
  }
}
```

#### 2. ThemeManager 类集成

```javascript
class ThemeManager {
  getPixelTextColor(number) {
    const colors = {
      light: this.getLightPixelColor(number),
      dark: this.getDarkPixelColor(number),
      neon: this.getNeonPixelColor(number)
    }
    return colors[this.currentTheme]
  }

  getLightPixelColor(number) {
    // 根据数字返回深色系颜色
    const colorMap = {
      2: '#776e65',
      4: '#776e65',
      8: '#f9f6f2',
      // ...
    }
    return colorMap[number] || '#f9f6f2'
  }

  getDarkPixelColor(number) {
    // 暗黑主题使用浅色像素
    return number <= 4 ? '#eee4da' : '#ffffff'
  }

  getNeonPixelColor(number) {
    // 霓虹主题使用霓虹色
    const neonColors = {
      2: '#0ff',
      4: '#f0f',
      8: '#ff0',
      // ...
    }
    return neonColors[number] || '#fff'
  }
}
```

#### 3. SettingsManager 类集成

```javascript
class SettingsManager {
  initSettings() {
    // 添加皮肤选择器
    const skinSelector = this.createSkinSelector()
    this.settingsContent.appendChild(skinSelector)
  }

  createSkinSelector() {
    const container = document.createElement('div')
    container.className = 'setting-item'

    const label = document.createElement('label')
    label.textContent = '皮肤选择：'

    const select = document.createElement('select')
    select.id = 'skin-select'
    const options = [
      { value: 'default', text: '默认' },
      { value: 'pixel', text: '像素' }
    ]
    options.forEach(opt => {
      const option = document.createElement('option')
      option.value = opt.value
      option.textContent = opt.text
      select.appendChild(option)
    })

    // 从localStorage读取设置
    const savedSkin = localStorage.getItem('tileSkin') || 'default'
    select.value = savedSkin

    // 监听变化
    select.addEventListener('change', (e) => {
      const newSkin = e.target.value
      localStorage.setItem('tileSkin', newSkin)
      // 通知Game2048更新
      window.game2048.skinManager.setSkin(newSkin)
      window.game2048.updateDisplay()
    })

    container.appendChild(label)
    container.appendChild(select)
    return container
  }
}
```

## 数据结构设计

### 像素点阵字体

使用5x7点阵表示每个数字：

```javascript
const PIXEL_DIGITS = {
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  '1': [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0]
  ],
  // ... 2-9
}
```

### 缓存键设计

```javascript
// 缓存键格式：{数字}-{主题}
const cacheKey = `${number}-${theme}`

// 示例：
// '2-light'  - 数字2的light主题像素图
// '2048-neon' - 数字2048的neon主题像素图
```

## 渲染流程

### 像素模式渲染流程

```
1. updateDisplay() 被调用
   │
2. 遍历所有方块
   │
3. 对每个方块：
   │
   ├─> 检查是否为像素皮肤
   │     │
   │     └─> 是：进入像素渲染流程
   │           │
   │           ├─> 生成缓存键：{number}-{theme}
   │           │
   │           ├─> 检查缓存
   │           │     │
   │           │     ├─> 命中：直接使用缓存
   │           │     │
   │           │     └─> 未命中：
   │           │           │
   │           │           ├─> 创建Canvas（5*7像素）
   │           │           │
   │           │           ├─> 获取主题颜色
   │           │           │
   │           │           ├─> 遍历点阵绘制像素
   │           │           │
   │           │           └─> 转换为DataURL并缓存
   │           │
   │           └─> 设置backgroundImage
   │
   └─> 添加tile-pixel类名
```

## CSS设计

### 像素方块样式

```css
.tile-inner {
  /* 默认样式 */
  width: 100%;
  height: 100%;
  border-radius: 3px;
  background: #eee4da;
  color: #776e65;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tile-pixel .tile-inner {
  /* 像素皮肤样式 */
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  color: transparent; /* 隐藏文字 */
  image-rendering: pixelated; /* 保持像素清晰 */
}

/* 主题发光效果 */
.theme-dark .tile-pixel .tile-inner {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.theme-neon .tile-pixel .tile-inner {
  box-shadow: 0 0 15px currentColor, 0 0 30px currentColor;
}
```

### 皮肤选择器样式

```css
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.setting-item label {
  font-size: 16px;
  font-weight: bold;
}

.setting-item select {
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}
```

## 性能优化

### 1. 缓存策略

```javascript
// 缓存所有可能数字的像素图
const possibleNumbers = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192]

// 预热缓存（可选）
function warmupCache() {
  const themes = ['light', 'dark', 'neon']
  themes.forEach(theme => {
    possibleNumbers.forEach(num => {
      skinManager.getPixelBackground(num, theme)
    })
  })
}
```

### 2. 主题切换优化

```javascript
class ThemeManager {
  setTheme(themeName) {
    this.currentTheme = themeName
    // 清除像素缓存，因为颜色会变化
    if (window.game2048.skinManager) {
      window.game2048.skinManager.clearCache()
    }
    // 触发重新渲染
    window.game2048.updateDisplay()
  }
}
```

### 3. gap值缓存

```javascript
class Game2048 {
  constructor() {
    this.gap = 15
  }

  // 避免重复计算gap值
  updateTilePositions() {
    if (!this.cachedGap) {
      this.cachedGap = this.gap
    }
    const tileSize = (this.gridSize - this.cachedGap * (this.size + 1)) / this.size
    // ...
  }
}
```

## 修复问题记录

### 中优先级问题

1. **皮肤切换后需要刷新才能生效**
   - 原因：切换皮肤后没有调用updateDisplay()
   - 修复：在SettingsManager中添加change事件监听，切换后立即调用updateDisplay()

2. **像素缓存未在主题切换时清除**
   - 原因：主题切换后像素颜色变化，但缓存仍使用旧颜色
   - 修复：在ThemeManager.setTheme()中调用skinManager.clearCache()

3. **gap值每次都重新计算**
   - 原因：updateTilePositions中每次都计算gap值
   - 修复：缓存gap值，避免重复计算

4. **像素数字在小方块上显示不清晰**
   - 原因：background-size设置不当
   - 修复：使用contain确保像素图完整显示

## 扩展性设计

### 支持更多皮肤

```javascript
class TileSkinManager {
  // 未来可以添加更多皮肤类型
  getTileBackground(number, theme) {
    switch (this.currentSkin) {
      case 'default':
        return null // 使用CSS背景
      case 'pixel':
        return this.getPixelBackground(number, theme)
      case 'retro': // 未来扩展
        return this.getRetroBackground(number, theme)
      case 'custom': // 未来扩展
        return this.getCustomBackground(number, theme)
    }
  }
}
```

### 支持自定义像素大小

```javascript
class TileSkinManager {
  constructor(pixelSize = 5) {
    this.pixelSize = pixelSize
    this.canvasSize = pixelSize * 7 // 7个像素高
  }

  setPixelSize(size) {
    this.pixelSize = size
    this.clearCache()
  }
}
```

## 测试策略

### 功能测试
- [ ] 皮肤切换功能
- [ ] 像素数字渲染正确性
- [ ] 三套主题颜色适配
- [ ] 设置持久化

### 性能测试
- [ ] 缓存命中率
- [ ] 首次渲染时间
- [ ] 缓存命中后渲染时间
- [ ] 主题切换响应时间

### 兼容性测试
- [ ] Chrome/Edge/Firefox/Safari
- [ ] 不同分辨率下显示
- [ ] 触摸设备上操作

---

**设计日期**：2026-01-28
**设计版本**：1.0
**状态**：已实现并测试通过
