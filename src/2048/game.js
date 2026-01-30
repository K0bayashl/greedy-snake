// 2048 游戏核心逻辑

const GRID_SIZE = 4
const WINNING_TILE = 2048
const BEST_SCORE_KEY = '2048-best-score'
const THEME_KEY = '2048-theme'
const SETTINGS_KEY = '2048-settings'
const SKIN_KEY = '2048-skin'

// ===== 主题颜色配置 =====
const TILE_COLORS = {
  light: {
    2: '#EEE4DA', 4: '#EDE0C8', 8: '#F2B179', 16: '#F59563',
    32: '#F67C5F', 64: '#F65E3B', 128: '#EDCF72', 256: '#EDCC61',
    512: '#EDC850', 1024: '#EDC53F', 2048: '#EDC22E'
  },
  dark: {
    2: '#e94560', 4: '#ff6b6b', 8: '#ff8e53', 16: '#ff6b35',
    32: '#ffd93d', 64: '#ffcd3c', 128: '#ffc93c', 256: '#ffb347',
    512: '#ff9f43', 1024: '#ff8800', 2048: '#ff6b6b'
  },
  neon: {
    2: '#00ff88', 4: '#00ffaa', 8: '#ff00ff', 16: '#ff44ff',
    32: '#00ffff', 64: '#44ffff', 128: '#ffff00', 256: '#ffff44',
    512: '#ff8800', 1024: '#ffaa00', 2048: '#ff0000'
  }
}

const PIXEL_TEXT_COLORS = {
  light: {
    2: '#776E65', 4: '#776E65', 8: '#F9F6F2', 16: '#F9F6F2',
    32: '#F9F6F2', 64: '#F9F6F2', 128: '#F9F6F2', 256: '#F9F6F2',
    512: '#F9F6F2', 1024: '#F9F6F2', 2048: '#F9F6F2'
  },
  dark: {
    2: '#a0b0c0', 4: '#b0c0d0', 8: '#fff', 16: '#fff',
    32: '#fff', 64: '#fff', 128: '#1a1a2e', 256: '#1a1a2e',
    512: '#1a1a2e', 1024: '#1a1a2e', 2048: '#1a1a2e'
  },
  neon: {
    2: '#00ff88', 4: '#00ffaa', 8: '#fff', 16: '#fff',
    32: '#000', 64: '#000', 128: '#000', 256: '#000',
    512: '#000', 1024: '#000', 2048: '#fff'
  }
}

// ===== 皮肤管理器 =====
class TileSkinManager {
  constructor() {
    this.currentSkin = this.loadSkin()
    this.pixelCache = {}
    this.imageCache = {} // 图片缓存
    this.digitPatterns = this.initDigitPatterns()
    this.game = null
    this.applySkin(this.currentSkin)
  }

  setGame(game) {
    this.game = game
  }

  loadSkin() {
    try {
      const saved = localStorage.getItem(SKIN_KEY)
      return saved || 'default'
    } catch (e) {
      return 'default'
    }
  }

  saveSkin(skin) {
    try {
      localStorage.setItem(SKIN_KEY, skin)
    } catch (e) {
      // 隐私模式静默处理
    }
  }

  applySkin(skin) {
    this.currentSkin = skin
    document.documentElement.setAttribute('data-tile-skin', skin)
    this.saveSkin(skin)

    // 如果是狗狗皮肤，预加载图片
    if (skin === 'dog-evolution') {
      this.preloadSkinImages(skin)
    }

    if (this.game) {
      this.game.updateDisplay()
    }
  }

  // 预加载皮肤图片
  preloadSkinImages(skin) {
    if (skin !== 'dog-evolution') return

    const values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]
    values.forEach(value => {
      if (!this.imageCache[value]) {
        this.loadAndProcessImage(value)
      }
    })
  }

  loadAndProcessImage(value) {
    // 标记为正在加载，避免重复触发
    if (this.imageCache[value] === 'loading') return

    this.imageCache[value] = 'loading'
    const img = new Image()
    // img.crossOrigin = "Anonymous" // 移除此行以兼容本地文件系统(file://)预览
    img.src = `assets/skins/dog-evolution/${value}.png`

    img.onload = () => {
      try {
        const processed = this.removeBackground(img)
        this.imageCache[value] = processed
        // 图片处理完成后刷新显示
        if (this.game) this.game.updateDisplay()
      } catch (e) {
        console.error('Image processing failed:', e)
        // 降级：如果处理失败（如跨域问题），使用原图
        this.imageCache[value] = img
        // 确保降级后也刷新显示
        if (this.game) this.game.updateDisplay()
      }
    }

    img.onerror = () => {
        delete this.imageCache[value] // 允许重试
    }
  }

  // 去除白色背景
  removeBackground(img) {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      // 将接近白色的像素设为透明 (阈值 245)
      if (r > 245 && g > 245 && b > 245) {
        data[i + 3] = 0
      }
    }

    ctx.putImageData(imageData, 0, 0)

    const newImg = new Image()
    newImg.src = canvas.toDataURL()
    return newImg
  }

  // 获取皮肤图片
  getSkinImage(value) {
    const cached = this.imageCache[value]
    if (cached && cached !== 'loading') {
      return cached
    }
    // 如果未缓存或正在加载，触发加载流程
    if (!cached) {
      this.loadAndProcessImage(value)
    }
    return null
  }

  // 4x7像素数字图案（1表示有像素，0表示空白）
  initDigitPatterns() {
    return {
      '0': [[0,1,1,0], [1,0,0,1], [1,0,0,1], [1,0,0,1], [1,0,0,1], [1,0,0,1], [0,1,1,0]],
      '1': [[0,0,1,0], [0,1,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0], [0,1,1,1]],
      '2': [[0,1,1,0], [1,0,0,1], [0,0,0,1], [0,0,1,0], [0,1,0,0], [1,0,0,0], [1,1,1,1]],
      '3': [[0,1,1,0], [1,0,0,1], [0,0,0,1], [0,0,1,0], [0,0,0,1], [1,0,0,1], [0,1,1,0]],
      '4': [[0,0,1,0], [0,1,1,0], [1,0,1,0], [1,0,1,0], [1,1,1,1], [0,0,1,0], [0,0,1,0]],
      '5': [[1,1,1,1], [1,0,0,0], [1,1,1,0], [0,0,0,1], [0,0,0,1], [1,0,0,1], [0,1,1,0]],
      '6': [[0,1,1,0], [1,0,0,0], [1,1,1,0], [1,0,0,1], [1,0,0,1], [1,0,0,1], [0,1,1,0]],
      '7': [[1,1,1,1], [0,0,0,1], [0,0,0,1], [0,0,1,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]],
      '8': [[0,1,1,0], [1,0,0,1], [1,0,0,1], [0,1,1,0], [1,0,0,1], [1,0,0,1], [0,1,1,0]],
      '9': [[0,1,1,0], [1,0,0,1], [1,0,0,1], [0,1,1,1], [0,0,0,1], [0,0,0,1], [0,1,1,0]]
    }
  }

  getPixelNumber(value) {
    if (!this.pixelCache[value]) {
      this.pixelCache[value] = this.renderPixelCanvas(value)
    }
    return this.pixelCache[value]
  }

  renderPixelCanvas(value) {
    const valueStr = value.toString()
    const digits = valueStr.split('')
    const pixelSize = 4
    const letterSpacing = 1

    // Calculate total width
    let totalCols = 0
    digits.forEach((digit, index) => {
      const pattern = this.digitPatterns[digit]
      if (pattern) {
        totalCols += pattern[0].length
        if (index < digits.length - 1) {
          totalCols += letterSpacing
        }
      }
    })

    const rows = 7

    const canvas = document.createElement('canvas')
    canvas.width = totalCols * pixelSize
    canvas.height = rows * pixelSize
    canvas.className = 'pixel-number'

    const ctx = canvas.getContext('2d')

    // 获取当前主题的文字颜色
    const theme = document.documentElement.getAttribute('data-theme') || 'light'
    const pixelColor = (PIXEL_TEXT_COLORS[theme] && PIXEL_TEXT_COLORS[theme][value]) || '#fff'

    ctx.fillStyle = pixelColor

    let currentX = 0

    digits.forEach((digit, index) => {
      const pattern = this.digitPatterns[digit]
      if (!pattern) return

      const digitCols = pattern[0].length

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < digitCols; col++) {
          if (pattern[row][col]) {
            ctx.fillRect(
              (currentX + col) * pixelSize,
              row * pixelSize,
              pixelSize,
              pixelSize
            )
          }
        }
      }

      currentX += digitCols
      if (index < digits.length - 1) {
        currentX += letterSpacing
      }
    })

    return canvas
  }

  // 重新渲染所有缓存的像素图（主题切换时调用）
  refreshPixelCache() {
    this.pixelCache = {}
  }
}

// ===== 主题管理器 =====
class ThemeManager {
  constructor(skinManager) {
    this.skinManager = skinManager
    this.currentTheme = this.loadTheme()
    this.game = null
    this.applyTheme(this.currentTheme)
    this.bindEvents()
  }

  setGame(game) {
    this.game = game
  }

  loadTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      return saved || 'light'
    } catch (e) {
      return 'light'
    }
  }

  saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch (e) {
      // 隐私模式静默处理
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    this.currentTheme = theme
    this.updateActiveButton(theme)
    // 主题切换时刷新像素缓存
    if (this.skinManager) {
      this.skinManager.refreshPixelCache()
    }
    // 刷新显示以应用新的像素颜色
    if (this.game) {
      this.game.updateDisplay()
    }
  }

  updateActiveButton(theme) {
    document.querySelectorAll('.theme-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.theme === theme)
    })
  }

  bindEvents() {
    document.querySelectorAll('.theme-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme
        this.applyTheme(theme)
        this.saveTheme(theme)
      })
    })
  }
}

// ===== 粒子系统 =====
class ParticleSystem {
  constructor() {
    this.container = document.getElementById('particle-container')
    this.particles = []
    this.maxParticles = 100
    this.enabled = true
    this.density = 'medium'
    this.particleCounts = { low: 6, medium: 10, high: 16 }
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }

  setDensity(density) {
    this.density = density
  }

  getTileColor(value) {
    // 获取当前主题下的颜色
    const theme = document.documentElement.getAttribute('data-theme') || 'light'
    return (TILE_COLORS[theme] && TILE_COLORS[theme][value]) || '#EDC22E'
  }

  createExplosion(x, y, value) {
    if (!this.enabled) return

    const count = this.particleCounts[this.density] || 10
    const color = this.getTileColor(value)

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.removeOldestParticle()
      }
      this.createParticle(x, y, color)
    }
  }

  createParticle(x, y, color) {
    const particle = document.createElement('div')
    particle.className = 'particle'

    const size = Math.random() * 8 + 4
    const angle = Math.random() * Math.PI * 2
    const velocity = Math.random() * 100 + 50
    const vx = Math.cos(angle) * velocity
    const vy = Math.sin(angle) * velocity
    const life = Math.random() * 0.5 + 0.5

    particle.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      opacity: 1;
    `

    this.container.appendChild(particle)

    const particleObj = {
      element: particle,
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      life: life,
      maxLife: life,
      gravity: 200
    }

    this.particles.push(particleObj)
  }

  removeOldestParticle() {
    if (this.particles.length === 0) return
    const oldest = this.particles.shift()
    if (oldest.element.parentNode) {
      oldest.element.parentNode.removeChild(oldest.element)
    }
  }

  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]

      // 更新位置
      p.x += p.vx * deltaTime
      p.y += p.vy * deltaTime

      // 重力
      p.vy += p.gravity * deltaTime

      // 更新生命周期
      p.life -= deltaTime

      // 更新样式
      const opacity = Math.max(0, p.life / p.maxLife)
      p.element.style.left = `${p.x}px`
      p.element.style.top = `${p.y}px`
      p.element.style.opacity = opacity

      // 移除死亡粒子
      if (p.life <= 0) {
        if (p.element.parentNode) {
          p.element.parentNode.removeChild(p.element)
        }
        this.particles.splice(i, 1)
      }
    }
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    let lastTime = performance.now()
    const loop = (currentTime) => {
      if (!this.isRunning) return
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime
      this.update(deltaTime)
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }

  stop() {
    this.isRunning = false
    // 清理所有粒子 DOM
    this.particles.forEach(p => {
      if (p.element && p.element.parentNode) {
        p.element.parentNode.removeChild(p.element)
      }
    })
    this.particles = []
  }
}

// ===== 特效管理器 =====
class EffectsManager {
  constructor(particleSystem) {
    this.particleSystem = particleSystem
    this.vibrationEnabled = true
    this.gameContainer = document.querySelector('.game-container')
    this.shakeTimeout = null
  }

  setVibrationEnabled(enabled) {
    this.vibrationEnabled = enabled
  }

  triggerMergeEffect(x, y, value) {
    // 粒子效果
    this.particleSystem.createExplosion(x, y, value)

    // 震动效果
    this.triggerShake('medium')

    // 移动端震动
    if (this.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  triggerMoveEffect() {
    this.triggerShake('light')
  }

  triggerShake(intensity) {
    if (!this.gameContainer) return

    // 清除之前的定时器
    if (this.shakeTimeout) {
      clearTimeout(this.shakeTimeout)
    }

    const className = `shake-${intensity}`
    this.gameContainer.classList.remove('shake-light', 'shake-medium', 'shake-heavy')
    // 强制重绘确保动画重新触发
    void this.gameContainer.offsetWidth
    this.gameContainer.classList.add(className)

    this.shakeTimeout = setTimeout(() => {
      this.gameContainer.classList.remove(className)
      this.shakeTimeout = null
    }, 300)
  }
}

// ===== 设置管理器 =====
class SettingsManager {
  constructor(particleSystem, effectsManager, skinManager, game) {
    this.particleSystem = particleSystem
    this.effectsManager = effectsManager
    this.skinManager = skinManager
    this.game = game
    this.panel = document.getElementById('settings-panel')
    this.overlay = this.panel.querySelector('.settings-overlay')
    this.closeBtn = document.getElementById('settings-close')
    this.settingsBtn = document.getElementById('settings-btn')

    this.settings = this.loadSettings()
    this.applySettings()
    this.bindEvents()
    this.updateUI()
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      // 隐私模式或解析错误
    }
    return {
      particleDensity: 'medium',
      particlesEnabled: true,
      vibrationEnabled: true
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings))
    } catch (e) {
      // 隐私模式静默处理
    }
  }

  applySettings() {
    this.particleSystem.setDensity(this.settings.particleDensity)
    this.particleSystem.setEnabled(this.settings.particlesEnabled)
    this.effectsManager.setVibrationEnabled(this.settings.vibrationEnabled)
  }

  updateUI() {
    // 更新皮肤按钮
    document.querySelectorAll('.skin-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.skin === this.skinManager.currentSkin)
    })

    // 更新粒子密度按钮
    document.querySelectorAll('.option-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.density === this.settings.particleDensity)
    })

    // 更新开关
    const particleToggle = document.getElementById('particle-toggle')
    const vibrationToggle = document.getElementById('vibration-toggle')
    if (particleToggle) particleToggle.checked = this.settings.particlesEnabled
    if (vibrationToggle) vibrationToggle.checked = this.settings.vibrationEnabled
  }

  bindEvents() {
    // 打开设置面板
    this.settingsBtn.addEventListener('click', () => this.open())

    // 关闭设置面板
    this.closeBtn.addEventListener('click', () => this.close())
    this.overlay.addEventListener('click', () => this.close())

    // 皮肤选择
    document.querySelectorAll('.skin-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const skin = btn.dataset.skin
        this.skinManager.applySkin(skin)
        this.game.updateDisplay()
        this.updateUI()
      })
    })

    // 粒子密度选择
    document.querySelectorAll('.option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const density = btn.dataset.density
        this.settings.particleDensity = density
        this.particleSystem.setDensity(density)
        this.saveSettings()
        this.updateUI()
      })
    })

    // 粒子效果开关
    const particleToggle = document.getElementById('particle-toggle')
    if (particleToggle) {
      particleToggle.addEventListener('change', (e) => {
        this.settings.particlesEnabled = e.target.checked
        this.particleSystem.setEnabled(e.target.checked)
        this.saveSettings()
      })
    }

    // 震动效果开关
    const vibrationToggle = document.getElementById('vibration-toggle')
    if (vibrationToggle) {
      vibrationToggle.addEventListener('change', (e) => {
        this.settings.vibrationEnabled = e.target.checked
        this.effectsManager.setVibrationEnabled(e.target.checked)
        this.saveSettings()
      })
    }
  }

  open() {
    this.panel.classList.add('visible')
  }

  close() {
    this.panel.classList.remove('visible')
  }
}

// ===== 游戏主类 =====
class Game2048 {
  constructor(effectsManager, skinManager) {
    this.grid = []
    this.score = 0
    this.bestScore = this.loadBestScore()
    this.won = false
    this.over = false
    this.keepPlaying = false
    this.previousState = null
    this.effectsManager = effectsManager
    this.skinManager = skinManager
    this.mergedPositions = []

    this.tileContainer = document.getElementById('tile-container')
    this.currentScoreElement = document.getElementById('current-score')
    this.bestScoreElement = document.getElementById('best-score')
    this.gameMessage = document.getElementById('game-message')
    this.messageText = document.getElementById('message-text')
    this.gameContainer = document.querySelector('.game-container')

    this.gridGap = this.calculateGridGap()

    this.init()
  }

  calculateGridGap() {
    const gridBackground = document.querySelector('.grid-background')
    return gridBackground ? parseInt(getComputedStyle(gridBackground).gap) || 15 : 15
  }

  init() {
    this.setupGrid()
    this.addRandomTile()
    this.addRandomTile()
    this.updateDisplay()
    this.updateScore()
    this.bindEvents()
  }

  setupGrid() {
    this.grid = []
    for (let row = 0; row < GRID_SIZE; row++) {
      this.grid[row] = []
      for (let col = 0; col < GRID_SIZE; col++) {
        this.grid[row][col] = null
      }
    }
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e))

    const newGameBtn = document.getElementById('new-game-btn')
    const undoBtn = document.getElementById('undo-btn')
    const tryAgainBtn = document.getElementById('try-again-btn')

    newGameBtn.addEventListener('click', () => this.restart())
    undoBtn.addEventListener('click', () => this.undo())
    tryAgainBtn.addEventListener('click', () => this.restart())

    this.setupTouchEvents()
  }

  setupTouchEvents() {
    let startX = 0
    let startY = 0
    let touchStartTime = 0

    const gameContainer = document.querySelector('.game-container')

    gameContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return
      e.preventDefault()
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      touchStartTime = Date.now()
    }, { passive: false })

    gameContainer.addEventListener('touchend', (e) => {
      if (!startX || !startY) return
      e.preventDefault()

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const touchEndTime = Date.now()

      const deltaX = endX - startX
      const deltaY = endY - startY
      const deltaTime = touchEndTime - touchStartTime

      if (deltaTime < 1000) {
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)

        if (Math.max(absX, absY) > 30) {
          if (absX > absY) {
            if (deltaX > 0) {
              this.move('right')
            } else {
              this.move('left')
            }
          } else {
            if (deltaY > 0) {
              this.move('down')
            } else {
              this.move('up')
            }
          }
        }
      }

      startX = 0
      startY = 0
    }, { passive: false })
  }

  handleKeyDown(e) {
    const keyMap = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right'
    }

    if (keyMap[e.key]) {
      e.preventDefault()
      this.move(keyMap[e.key])
    }
  }

  getEmptyCells() {
    const emptyCells = []
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!this.grid[row][col]) {
          emptyCells.push({ row, col })
        }
      }
    }
    return emptyCells
  }

  addRandomTile() {
    const emptyCells = this.getEmptyCells()
    if (emptyCells.length === 0) return

    // 使用 Math.random() 生成伪随机数，用于游戏逻辑（非加密场景）
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    const value = Math.random() < 0.9 ? 2 : 4

    this.grid[randomCell.row][randomCell.col] = {
      value: value,
      isNew: true,
      merged: false
    }
  }

  cloneGrid(grid) {
    // 使用 structuredClone 进行深拷贝，比 JSON.parse(JSON.stringify()) 更高效
    if (typeof structuredClone === 'function') {
      return structuredClone(grid)
    }
    // 降级方案：手动二维数组拷贝
    const cloned = []
    for (let row = 0; row < GRID_SIZE; row++) {
      cloned[row] = []
      for (let col = 0; col < GRID_SIZE; col++) {
        cloned[row][col] = grid[row][col] ? { ...grid[row][col] } : null
      }
    }
    return cloned
  }

  saveState() {
    this.previousState = {
      grid: this.cloneGrid(this.grid),
      score: this.score,
      won: this.won,
      over: this.over,
      keepPlaying: this.keepPlaying
    }
  }

  undo() {
    if (!this.previousState) return

    this.grid = this.cloneGrid(this.previousState.grid)
    this.score = this.previousState.score
    this.won = this.previousState.won
    this.over = this.previousState.over
    this.keepPlaying = this.previousState.keepPlaying

    this.updateDisplay()
    this.updateScore()

    // 根据撤销后的状态重新显示消息
    if (this.over) {
      this.showMessage('游戏结束')
    } else if (this.won && !this.keepPlaying) {
      this.showMessage('你赢了！', true)
    } else {
      this.hideMessage()
    }

    this.previousState = null
  }

  move(direction) {
    if (this.over && !this.keepPlaying) return

    this.saveState()

    const vector = this.getVector(direction)
    const traversals = this.buildTraversals(vector)
    let moved = false
    let mergedScore = 0
    this.mergedPositions = []

    // 清除合并标记
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (this.grid[row][col]) {
          this.grid[row][col].merged = false
          this.grid[row][col].isNew = false
        }
      }
    }

    traversals.x.forEach((x) => {
      traversals.y.forEach((y) => {
        const cell = { row: y, col: x }
        const tile = this.grid[cell.row][cell.col]

        if (tile) {
          const positions = this.findFarthestPosition(cell, vector)
          const next = positions.next
          const farthest = positions.farthest

          if (next && this.grid[next.row][next.col] &&
              this.grid[next.row][next.col].value === tile.value &&
              !this.grid[next.row][next.col].merged) {
            // 合并
            const mergedValue = tile.value * 2
            this.grid[next.row][next.col] = {
              value: mergedValue,
              merged: true,
              isNew: false
            }
            this.grid[cell.row][cell.col] = null
            mergedScore += mergedValue
            moved = true

            // 记录合并位置
            this.mergedPositions.push({
              row: next.row,
              col: next.col,
              value: mergedValue
            })

            if (mergedValue === WINNING_TILE && !this.won) {
              this.won = true
            }
          } else {
            // 移动
            if (farthest.row !== cell.row || farthest.col !== cell.col) {
              this.grid[farthest.row][farthest.col] = tile
              this.grid[cell.row][cell.col] = null
              moved = true
            }
          }
        }
      })
    })

    if (moved) {
      this.score += mergedScore
      this.addRandomTile()
      this.updateDisplay()
      this.updateScore()

      // 触发特效
      this.triggerEffects()

      if (this.won && !this.keepPlaying) {
        this.showMessage('你赢了！', true)
      } else if (!this.movesAvailable()) {
        this.over = true
        this.showMessage('游戏结束')
      }
    }
  }

  triggerEffects() {
    if (!this.effectsManager) return

    // 移动震动
    this.effectsManager.triggerMoveEffect()

    // 合并粒子效果
    if (this.mergedPositions.length > 0) {
      setTimeout(() => {
        this.mergedPositions.forEach((pos) => {
          const tileElement = this.getTileElementAt(pos.row, pos.col)
          if (tileElement) {
            const rect = tileElement.getBoundingClientRect()
            const x = rect.left + rect.width / 2
            const y = rect.top + rect.height / 2
            this.effectsManager.triggerMergeEffect(x, y, pos.value)
          }
        })
      }, 150)
    }
  }

  getTileElementAt(row, col) {
    const tiles = this.tileContainer.querySelectorAll('.tile')
    for (const tile of tiles) {
      const tileRow = parseInt(tile.style.top) / (tile.offsetHeight + this.gridGap)
      const tileCol = parseInt(tile.style.left) / (tile.offsetWidth + this.gridGap)
      if (Math.round(tileRow) === row && Math.round(tileCol) === col) {
        return tile
      }
    }
    return null
  }

  getVector(direction) {
    const map = {
      'up': { row: -1, col: 0 },
      'down': { row: 1, col: 0 },
      'left': { row: 0, col: -1 },
      'right': { row: 0, col: 1 }
    }
    return map[direction]
  }

  buildTraversals(vector) {
    const traversals = { x: [], y: [] }

    for (let pos = 0; pos < GRID_SIZE; pos++) {
      traversals.x.push(pos)
      traversals.y.push(pos)
    }

    if (vector.row === 1) traversals.y.reverse()
    if (vector.col === 1) traversals.x.reverse()

    return traversals
  }

  findFarthestPosition(cell, vector) {
    let previous
    let current = { row: cell.row, col: cell.col }

    do {
      previous = current
      current = {
        row: previous.row + vector.row,
        col: previous.col + vector.col
      }
    } while (this.withinBounds(current) && !this.grid[current.row][current.col])

    return {
      farthest: previous,
      next: this.withinBounds(current) ? current : null
    }
  }

  withinBounds(position) {
    return position.row >= 0 && position.row < GRID_SIZE &&
           position.col >= 0 && position.col < GRID_SIZE
  }

  movesAvailable() {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!this.grid[row][col]) {
          return true
        }
        if (col < GRID_SIZE - 1 &&
            this.grid[row][col].value === this.grid[row][col + 1].value) {
          return true
        }
        if (row < GRID_SIZE - 1 &&
            this.grid[row][col].value === this.grid[row + 1][col].value) {
          return true
        }
      }
    }
    return false
  }

  updateDisplay() {
    this.tileContainer.innerHTML = ''

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const tile = this.grid[row][col]
        if (tile) {
          const tileElement = document.createElement('div')
          tileElement.className = `tile tile-${tile.value}`

          if (tile.value > 2048) {
            tileElement.classList.add('tile-super')
          }

          if (tile.isNew) {
            tileElement.classList.add('tile-new')
          }
          if (tile.merged) {
            tileElement.classList.add('tile-merged')
          }

          // 根据皮肤类型渲染数字
          if (this.skinManager.currentSkin === 'pixel') {
            const canvas = this.skinManager.getPixelNumber(tile.value)
            if (canvas) {
              tileElement.innerHTML = ''
              // 创建新canvas并复制内容（cloneNode不复制绘制内容）
              const newCanvas = document.createElement('canvas')
              newCanvas.width = canvas.width
              newCanvas.height = canvas.height
              newCanvas.className = canvas.className
              const newCtx = newCanvas.getContext('2d')
              newCtx.drawImage(canvas, 0, 0)
              tileElement.appendChild(newCanvas)
              tileElement.classList.add('tile-pixel')
            } else {
              tileElement.textContent = tile.value
              tileElement.classList.remove('tile-pixel')
            }
          } else if (this.skinManager.currentSkin === 'dog-evolution') {
            // 狗狗进化皮肤
            const img = this.skinManager.getSkinImage(tile.value)

            if (img && img instanceof HTMLImageElement) {
              tileElement.innerHTML = ''
              const imgClone = img.cloneNode(true)
              tileElement.appendChild(imgClone)
              tileElement.classList.add('tile-image')
            } else {
              // 图片未加载完成时显示数字
              tileElement.textContent = tile.value
              tileElement.classList.remove('tile-pixel')
              tileElement.classList.remove('tile-image')
            }
          } else {
            tileElement.textContent = tile.value
            tileElement.classList.remove('tile-pixel')
            tileElement.classList.remove('tile-image')
          }

          // 计算位置：百分比基于内容区域，加上间隙偏移
          // tile-container 有15px padding，所以百分比计算需要调整
          const cellSize = (this.tileContainer.clientWidth - 3 * this.gridGap) / 4
          const left = `${col * (cellSize + this.gridGap)}px`
          const top = `${row * (cellSize + this.gridGap)}px`

          tileElement.style.left = left
          tileElement.style.top = top

          this.tileContainer.appendChild(tileElement)
        }
      }
    }
  }

  updateScore() {
    this.currentScoreElement.textContent = this.score
    this.bestScoreElement.textContent = this.bestScore

    if (this.score > this.bestScore) {
      this.bestScore = this.score
      this.bestScoreElement.textContent = this.bestScore
      this.saveBestScore()
    }
  }

  loadBestScore() {
    try {
      const saved = localStorage.getItem(BEST_SCORE_KEY)
      return saved ? parseInt(saved, 10) : 0
    } catch (e) {
      // 隐私模式或localStorage不可用时返回0
      return 0
    }
  }

  saveBestScore() {
    try {
      localStorage.setItem(BEST_SCORE_KEY, this.bestScore.toString())
    } catch (e) {
      // 隐私模式或localStorage不可用时静默处理
    }
  }

  showMessage(text, canContinue = false) {
    this.messageText.textContent = text
    this.gameMessage.classList.add('visible')

    if (canContinue) {
      this.keepPlaying = true
      const tryAgainBtn = document.getElementById('try-again-btn')
      tryAgainBtn.textContent = '继续游戏'
    } else {
      const tryAgainBtn = document.getElementById('try-again-btn')
      tryAgainBtn.textContent = '再试一次'
    }
  }

  hideMessage() {
    this.gameMessage.classList.remove('visible')
  }

  restart() {
    this.grid = []
    this.score = 0
    this.won = false
    this.over = false
    this.keepPlaying = false
    this.previousState = null
    this.hideMessage()
    this.init()
  }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Starting game initialization...')

    // 初始化皮肤管理器
    const skinManager = new TileSkinManager()

    // 初始化主题管理器
    const themeManager = new ThemeManager(skinManager)

    // 初始化粒子系统
    const particleSystem = new ParticleSystem()
    particleSystem.start()

    // 初始化特效管理器
    const effectsManager = new EffectsManager(particleSystem)

    // 初始化游戏
    const game = new Game2048(effectsManager, skinManager)

    // 设置game引用，解决循环依赖
    skinManager.setGame(game)
    themeManager.setGame(game)

    // 初始化设置管理器
    const settingsManager = new SettingsManager(particleSystem, effectsManager, skinManager, game)
    console.log('Settings manager initialized')

    // 将管理器暴露到全局（调试用）
    window.game2048 = {
      game,
      skinManager,
      themeManager,
      particleSystem,
      effectsManager,
      settingsManager
    }

    // 页面卸载时停止粒子系统
    window.addEventListener('beforeunload', () => {
      particleSystem.stop()
    })

    console.log('Game initialization completed successfully')
  } catch (error) {
    console.error('Game initialization failed:', error)
    alert('游戏初始化失败: ' + error.message)
  }
})
