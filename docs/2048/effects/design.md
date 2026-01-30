# 视觉特效系统设计文档

## 1. 架构设计

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    视觉特效系统                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ ThemeManager│  │ParticleSystem│  │EffectsManager│    │
│  │   主题管理   │  │   粒子系统   │  │   效果管理   │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│                   ┌──────┴──────┐                       │
│                   │ SettingsManager                      │
│                   │   设置管理   │                       │
│                   └─────────────┘                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 类职责说明

| 类名 | 职责 | 核心方法 |
|------|------|----------|
| ThemeManager | 管理三套主题的切换和持久化 | switchTheme(), applyTheme(), saveTheme() |
| ParticleSystem | 粒子的创建、更新、渲染 | createParticles(), update(), render() |
| EffectsManager | 震动反馈的触发和管理 | shake(), vibrate(), triggerMergeEffect() |
| SettingsManager | 设置面板和配置管理 | open(), close(), saveSettings() |

## 2. 详细设计

### 2.1 ThemeManager 主题管理器

#### 职责
- 管理三套主题（原色/暗黑/霓虹）
- 主题切换和CSS变量应用
- 主题偏好持久化

#### 数据结构

```javascript
const THEMES = {
  original: {
    name: '原色',
    colors: {
      background: '#faf8ef',
      board: '#bbada0',
      tile2: '#eee4da',
      tile4: '#ede0c8',
      // ... 更多方块颜色
      textDark: '#776e65',
      textLight: '#f9f6f2'
    }
  },
  dark: {
    name: '暗黑',
    colors: {
      background: '#1a1a2e',
      board: '#16213e',
      // ... 暗黑主题配色
    }
  },
  neon: {
    name: '霓虹',
    colors: {
      background: '#0a0a0a',
      board: '#1a1a1a',
      // ... 霓虹主题配色
    }
  }
}
```

#### 核心算法

```javascript
class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme() || 'original'
    this.applyTheme(this.currentTheme)
  }

  // 切换主题
  switchTheme(themeName) {
    if (this.currentTheme === themeName) return
    this.currentTheme = themeName
    this.applyTheme(themeName)
    this.saveTheme(themeName)
  }

  // 应用主题（通过CSS变量）
  applyTheme(themeName) {
    const theme = THEMES[themeName]
    const root = document.documentElement

    // 设置CSS变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // 添加主题类名用于特定样式
    document.body.className = `theme-${themeName}`
  }

  // 持久化
  saveTheme(themeName) {
    localStorage.setItem('2048-theme', themeName)
  }

  loadTheme() {
    return localStorage.getItem('2048-theme')
  }
}
```

### 2.2 ParticleSystem 粒子系统

#### 职责
- 粒子创建和对象池管理
- 粒子物理更新（位置、速度、生命周期）
- 粒子渲染

#### 数据结构

```javascript
class Particle {
  constructor(x, y, color, config) {
    this.x = x
    this.y = y
    this.color = color
    this.vx = (Math.random() - 0.5) * config.speed
    this.vy = (Math.random() - 0.5) * config.speed - 2
    this.life = 1.0
    this.decay = config.decay
    this.size = Math.random() * config.size + 2
    this.gravity = config.gravity
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vy += this.gravity
    this.life -= this.decay
  }

  render(ctx) {
    ctx.globalAlpha = this.life
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1.0
  }
}
```

#### 密度配置

```javascript
const PARTICLE_DENSITY = {
  low: {
    count: 8,
    speed: 4,
    size: 3,
    gravity: 0.15,
    decay: 0.02
  },
  medium: {
    count: 15,
    speed: 6,
    size: 4,
    gravity: 0.2,
    decay: 0.025
  },
  high: {
    count: 25,
    speed: 8,
    size: 5,
    gravity: 0.25,
    decay: 0.03
  }
}
```

#### 核心算法

```javascript
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.particles = []
    this.density = 'medium'
    this.enabled = true
  }

  // 在指定位置创建粒子
  createParticles(x, y, color, density) {
    if (!this.enabled) return

    const config = PARTICLE_DENSITY[density || this.density]

    for (let i = 0; i < config.count; i++) {
      this.particles.push(new Particle(x, y, color, config))
    }
  }

  // 更新所有粒子
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.update()

      // 移除死亡粒子
      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  // 渲染粒子
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (const p of this.particles) {
      p.render(this.ctx)
    }
  }

  // 动画循环
  animate() {
    this.update()
    this.render()

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animate())
    }
  }
}
```

### 2.3 EffectsManager 效果管理器

#### 职责
- 震动效果触发
- 移动端震动API调用
- 桌面端CSS震动动画

#### 震动配置

```javascript
const SHAKE_CONFIG = {
  move: {
    duration: 100,
    intensity: 2,
    vibratePattern: 10
  },
  merge: {
    duration: 150,
    intensity: 4,
    vibratePattern: [20, 30, 20]
  },
  win: {
    duration: 300,
    intensity: 8,
    vibratePattern: [50, 100, 50, 100, 50]
  },
  lose: {
    duration: 250,
    intensity: 6,
    vibratePattern: [100, 50, 100]
  }
}
```

#### 核心算法

```javascript
class EffectsManager {
  constructor(boardElement) {
    this.boardElement = boardElement
    this.enabled = true
  }

  // 触发震动
  shake(type) {
    if (!this.enabled) return

    const config = SHAKE_CONFIG[type]

    // 移动端使用 Vibration API
    if (navigator.vibrate) {
      navigator.vibrate(config.vibratePattern)
    }

    // 桌面端使用 CSS 动画
    this.shakeElement(this.boardElement, config)
  }

  // CSS 震动动画
  shakeElement(element, config) {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      if (elapsed >= config.duration) {
        element.style.transform = ''
        return
      }

      const progress = elapsed / config.duration
      const intensity = config.intensity * (1 - progress)
      const x = (Math.random() - 0.5) * intensity
      const y = (Math.random() - 0.5) * intensity

      element.style.transform = `translate(${x}px, ${y}px)`
      requestAnimationFrame(animate)
    }

    animate()
  }

  // 合并特效（震动 + 粒子）
  triggerMergeEffect(x, y, color) {
    this.shake('merge')
    // 粒子系统由外部传入调用
  }
}
```

### 2.4 SettingsManager 设置管理器

#### 职责
- 设置面板的显示/隐藏
- 用户配置管理
- 配置持久化

#### 数据结构

```javascript
const DEFAULT_SETTINGS = {
  particleDensity: 'medium',  // low | medium | high
  particleEnabled: true,
  shakeEnabled: true
}
```

#### 核心算法

```javascript
class SettingsManager {
  constructor() {
    this.settings = this.loadSettings()
    this.panel = document.getElementById('settings-panel')
    this.overlay = document.getElementById('settings-overlay')
    this.bindEvents()
  }

  // 打开设置面板
  open() {
    this.panel.classList.add('open')
    this.overlay.classList.add('show')
    this.syncUI()
  }

  // 关闭设置面板
  close() {
    this.panel.classList.remove('open')
    this.overlay.classList.remove('show')
  }

  // 同步UI与设置
  syncUI() {
    document.getElementById('particle-density').value = this.settings.particleDensity
    document.getElementById('particle-toggle').checked = this.settings.particleEnabled
    document.getElementById('shake-toggle').checked = this.settings.shakeEnabled
  }

  // 更新设置
  updateSetting(key, value) {
    this.settings[key] = value
    this.saveSettings()
  }

  // 持久化
  saveSettings() {
    localStorage.setItem('2048-settings', JSON.stringify(this.settings))
  }

  loadSettings() {
    const saved = localStorage.getItem('2048-settings')
    return saved ? JSON.parse(saved) : { ...DEFAULT_SETTINGS }
  }

  // 事件绑定
  bindEvents() {
    // 密度滑块
    document.getElementById('particle-density').addEventListener('change', (e) => {
      this.updateSetting('particleDensity', e.target.value)
    })

    // 开关
    document.getElementById('particle-toggle').addEventListener('change', (e) => {
      this.updateSetting('particleEnabled', e.target.checked)
    })

    document.getElementById('shake-toggle').addEventListener('change', (e) => {
      this.updateSetting('shakeEnabled', e.target.checked)
    })

    // 关闭按钮
    document.getElementById('close-settings').addEventListener('click', () => {
      this.close()
    })

    // 点击遮罩关闭
    this.overlay.addEventListener('click', () => {
      this.close()
    })
  }
}
```

## 3. 与游戏逻辑的整合

### 3.1 初始化流程

```javascript
// game.js 初始化
function initGame() {
  // ... 原有初始化代码

  // 初始化特效系统
  window.themeManager = new ThemeManager()
  window.particleSystem = new ParticleSystem(document.getElementById('particle-canvas'))
  window.effectsManager = new EffectsManager(document.getElementById('game-board'))
  window.settingsManager = new SettingsManager()

  // 绑定主题按钮
  document.getElementById('theme-original').addEventListener('click', () => {
    window.themeManager.switchTheme('original')
  })
  document.getElementById('theme-dark').addEventListener('click', () => {
    window.themeManager.switchTheme('dark')
  })
  document.getElementById('theme-neon').addEventListener('click', () => {
    window.themeManager.switchTheme('neon')
  })

  // 绑定设置按钮
  document.getElementById('settings-btn').addEventListener('click', () => {
    window.settingsManager.open()
  })
}
```

### 3.2 游戏事件触发点

```javascript
// 移动后触发
function afterMove(direction) {
  // 震动反馈
  if (window.settingsManager.settings.shakeEnabled) {
    window.effectsManager.shake('move')
  }
}

// 合并时触发
function onMerge(row, col, value) {
  // 震动反馈
  if (window.settingsManager.settings.shakeEnabled) {
    window.effectsManager.shake('merge')
  }

  // 粒子效果
  if (window.settingsManager.settings.particleEnabled) {
    const x = col * TILE_SIZE + TILE_SIZE / 2
    const y = row * TILE_SIZE + TILE_SIZE / 2
    const color = getTileColor(value)
    window.particleSystem.createParticles(
      x, y, color,
      window.settingsManager.settings.particleDensity
    )
  }
}

// 游戏胜利时触发
function onWin() {
  if (window.settingsManager.settings.shakeEnabled) {
    window.effectsManager.shake('win')
  }
}

// 游戏失败时触发
function onGameOver() {
  if (window.settingsManager.settings.shakeEnabled) {
    window.effectsManager.shake('lose')
  }
}
```

## 4. CSS 变量设计

### 4.1 主题变量

```css
:root {
  /* 原色主题（默认） */
  --background: #faf8ef;
  --board: #bbada0;
  --tile-2: #eee4da;
  --tile-4: #ede0c8;
  --tile-8: #f2b179;
  --tile-16: #f59563;
  --tile-32: #f67c5f;
  --tile-64: #f65e3b;
  --tile-128: #edcf72;
  --tile-256: #edcc61;
  --tile-512: #edc850;
  --tile-1024: #edc53f;
  --tile-2048: #edc22e;
  --text-dark: #776e65;
  --text-light: #f9f6f2;
}

.theme-dark {
  --background: #1a1a2e;
  --board: #16213e;
  /* ... 暗黑主题颜色 */
}

.theme-neon {
  --background: #0a0a0a;
  --board: #1a1a1a;
  /* ... 霓虹主题颜色 */
}
```

### 4.2 使用示例

```css
.game-board {
  background-color: var(--board);
  transition: background-color 0.3s ease;
}

.tile-2 {
  background-color: var(--tile-2);
  color: var(--text-dark);
}
```

## 5. 性能优化策略

### 5.1 粒子系统优化

1. **对象池**：预先创建粒子对象，重复利用
2. **脏矩形检测**：只重绘有粒子的区域
3. **自动停止**：粒子全部消失后停止动画循环
4. **密度控制**：根据设备性能调整最大粒子数

### 5.2 主题切换优化

1. **CSS变量**：使用CSS变量而非直接修改样式
2. **过渡动画**：添加transition实现平滑切换
3. **will-change**：提示浏览器优化动画元素

### 5.3 震动优化

1. **防抖处理**：避免短时间内多次震动
2. **降级方案**：不支持Vibration API时使用CSS动画
3. **用户控制**：提供开关让用户自行选择

## 6. 扩展性设计

### 6.1 新增主题

```javascript
// 在 THEMES 对象中添加新主题
const THEMES = {
  // ... 现有主题
  forest: {
    name: '森林',
    colors: {
      background: '#2d5016',
      board: '#3d6b26',
      // ... 森林主题配色
    }
  }
}
```

### 6.2 新增特效类型

```javascript
// 在 EffectsManager 中添加新方法
class EffectsManager {
  // ... 现有方法

  // 新增闪光效果
  flash(color) {
    const flash = document.createElement('div')
    flash.className = 'flash-overlay'
    flash.style.backgroundColor = color
    document.body.appendChild(flash)

    setTimeout(() => flash.remove(), 300)
  }
}
```

## 7. 注意事项

1. **移动端性能**：粒子效果在低端设备上可能卡顿，建议默认使用低密度
2. **电池消耗**：震动和粒子效果会增加电量消耗，提供关闭选项
3. **无障碍支持**：确保特效不影响屏幕阅读器等辅助工具
4. **浏览器兼容**：测试各浏览器对Vibration API和CSS变量的支持
