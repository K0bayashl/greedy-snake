// ========== 游戏配置 ==========
const GAME_CONFIG = {
  canvasWidth: 400,
  canvasHeight: 600,
  scrollSpeed: 2,
  targetFPS: 60,
  playerY: 500,
  laneWidth: 200,
  playerRadius: 20
}

// 运算配置
const BALANCE_CONFIG = {
  initialNumber: { min: 5, max: 15 },
  operations: {
    add: { minPercent: 0.1, maxPercent: 0.5 },
    sub: { maxPercent: 0.3 },
    mul: { multipliers: [2, 3] },
    div: { divisors: [2, 3, 4, 5] }
  },
  obstacle: { minPercent: 0.3, maxPercent: 0.8 },
  operationWeights: { add: 3, sub: 2, mul: 2, div: 1 },
  minSafeNumber: 3,
  maxNumber: 100
}

// 物体类型
const ObjectType = {
  BARRIER_ADD: 'add',
  BARRIER_SUB: 'sub',
  BARRIER_MUL: 'mul',
  BARRIER_DIV: 'div',
  OBSTACLE: 'obstacle'
}

// 游戏状态
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameover'
}

// ========== 全局变量 ==========
let canvas, ctx
let gameState
let highScore = 0
let lastTime = 0
let animationId = null

// 浮动文字效果
let floatingTexts = []

// ========== 初始化 ==========
function init() {
  canvas = document.getElementById('gameCanvas')
  ctx = canvas.getContext('2d')

  // 读取最高分（确保是数字类型）
  highScore = parseInt(localStorage.getItem('parkourHighScore')) || 0
  document.getElementById('highScore').textContent = highScore

  // 绑定按钮事件
  document.getElementById('startBtn').addEventListener('click', startGame)
  document.getElementById('pauseBtn').addEventListener('click', togglePause)

  // 绑定键盘事件
  document.addEventListener('keydown', handleKeyPress)

  // 绑定画布点击事件
  canvas.addEventListener('click', switchLane)

  resetGame()
}

// 重置游戏
function resetGame() {
  const initialNumber = Math.floor(randomRange(BALANCE_CONFIG.initialNumber.min, BALANCE_CONFIG.initialNumber.max + 1))

  gameState = {
    current: GameState.MENU,
    player: {
      lane: 'left',
      startLane: 'left',
      targetLane: 'left',
      number: initialNumber,
      isMoving: false,
      moveProgress: 0
    },
    track: {
      offsetY: 0,
      objects: [],
      distance: 0
    },
    game: {
      score: 0,
      startTime: 0
    }
  }

  floatingTexts = []

  // 预生成一些物体
  preSpawnObjects(initialNumber)

  updateUI()
  draw()
}

// 预生成物体
function preSpawnObjects(initialNumber) {
  let y = GAME_CONFIG.canvasHeight + 100

  while (y > -500) {
    const gap = Math.floor(randomRange(200, 400))
    y = y - gap

    const isBarrier = Math.random() < 0.7

    if (isBarrier) {
      // 先决定是正向运算（+、×）还是负向运算（-、÷）
      const isPositive = Math.random() < 0.5
      const opType = isPositive ? 'positive' : 'negative'

      const leftOpData = getOperationValueByType(initialNumber, opType, 0)
      const rightOpData = getOperationValueByType(initialNumber, opType, 0)

      gameState.track.objects.push({
        y: y,
        lane: 'left',
        type: 'barrier_' + leftOpData.operation,
        operation: leftOpData.operation,
        value: leftOpData.value,
        passed: false
      })

      gameState.track.objects.push({
        y: y,
        lane: 'right',
        type: 'barrier_' + rightOpData.operation,
        operation: rightOpData.operation,
        value: rightOpData.value,
        passed: false
      })
    } else {
      // 生成两个障碍物，左右各一个
      const config = getAdjustedConfig(0)
      const leftObstacleValue = Math.floor(
        initialNumber * randomRange(config.obstacle.minPercent, config.obstacle.maxPercent)
      )
      const rightObstacleValue = Math.floor(
        initialNumber * randomRange(config.obstacle.minPercent, config.obstacle.maxPercent)
      )

      gameState.track.objects.push({
        y: y,
        lane: 'left',
        type: 'obstacle',
        value: Math.max(1, leftObstacleValue),
        passed: false
      })

      gameState.track.objects.push({
        y: y,
        lane: 'right',
        type: 'obstacle',
        value: Math.max(1, rightObstacleValue),
        passed: false
      })
    }
  }
}

// ========== 游戏控制 ==========
function startGame() {
  if (gameState.current !== GameState.MENU && gameState.current !== GameState.GAME_OVER) {
    return
  }

  resetGame()
  gameState.current = GameState.PLAYING
  gameState.game.startTime = Date.now()

  document.getElementById('startBtn').textContent = '重新开始'
  document.getElementById('pauseBtn').disabled = false
  hideMessage()

  lastTime = performance.now()
  gameLoop(lastTime)
}

function togglePause() {
  if (gameState.current === GameState.PLAYING) {
    gameState.current = GameState.PAUSED
    document.getElementById('pauseBtn').textContent = '继续'
    cancelAnimationFrame(animationId)
    showMessage('游戏暂停', 'info')
  } else if (gameState.current === GameState.PAUSED) {
    gameState.current = GameState.PLAYING
    document.getElementById('pauseBtn').textContent = '暂停'
    hideMessage()
    lastTime = performance.now()
    gameLoop(lastTime)
  }
}

function handleKeyPress(event) {
  if (event.code === 'Space') {
    event.preventDefault()
    if (gameState.current === GameState.PLAYING) {
      switchLane()
    } else if (gameState.current === GameState.MENU || gameState.current === GameState.GAME_OVER) {
      startGame()
    }
  }
}

function switchLane() {
  if (gameState.current !== GameState.PLAYING) return
  if (gameState.player.isMoving) return

  const player = gameState.player
  player.startLane = player.lane
  player.targetLane = player.lane === 'left' ? 'right' : 'left'
  player.isMoving = true
  player.moveProgress = 0
}

// ========== 游戏循环 ==========
function gameLoop(timestamp) {
  if (gameState.current !== GameState.PLAYING) return

  const deltaTime = timestamp - lastTime

  if (deltaTime >= 1000 / GAME_CONFIG.targetFPS) {
    update(deltaTime)
    draw()
    lastTime = timestamp
  }

  animationId = requestAnimationFrame(gameLoop)
}

// ========== 更新逻辑 ==========
function update(deltaTime) {
  updatePlayer(deltaTime)
  updateTrack(deltaTime)
  checkCollision()
  updateFloatingTexts(deltaTime)
}

function updatePlayer(deltaTime) {
  const player = gameState.player

  if (player.isMoving) {
    player.moveProgress += deltaTime * 0.006

    if (player.moveProgress >= 1) {
      player.moveProgress = 0
      player.isMoving = false
      player.lane = player.targetLane
    }
  }
}

function updateTrack(deltaTime) {
  const track = gameState.track

  // 更新跑道滚动
  track.offsetY += GAME_CONFIG.scrollSpeed * (deltaTime / 16)
  track.distance += GAME_CONFIG.scrollSpeed * (deltaTime / 16)

  // 生成新物体
  spawnObject()

  // 移除屏幕外的物体
  const objectSpawnY = -100
  track.objects = track.objects.filter(obj => {
    const screenY = obj.y + track.offsetY
    return screenY < GAME_CONFIG.canvasHeight + 50
  })

  updateUI()
}

function spawnObject() {
  const track = gameState.track
  const lastObject = track.objects[track.objects.length - 1]
  const lastY = lastObject ? lastObject.y : GAME_CONFIG.canvasHeight + 200

  // 如果最后一个物体还没离开生成区域，不生成
  if (lastY > GAME_CONFIG.canvasHeight + 100) return

  const gap = Math.floor(randomRange(200, 400))
  const y = lastY - gap

  const isBarrier = Math.random() < 0.7

  if (isBarrier) {
    // 先决定是正向运算（+、×）还是负向运算（-、÷）
    const isPositive = Math.random() < 0.5
    const opType = isPositive ? 'positive' : 'negative'

    const leftOpData = getOperationValueByType(gameState.player.number, opType, gameState.track.distance)
    const rightOpData = getOperationValueByType(gameState.player.number, opType, gameState.track.distance)

    track.objects.push({
      y: y,
      lane: 'left',
      type: 'barrier_' + leftOpData.operation,
      operation: leftOpData.operation,
      value: leftOpData.value,
      passed: false
    })

    track.objects.push({
      y: y,
      lane: 'right',
      type: 'barrier_' + rightOpData.operation,
      operation: rightOpData.operation,
      value: rightOpData.value,
      passed: false
    })
  } else {
    // 生成两个障碍物，左右各一个
    const config = getAdjustedConfig(gameState.track.distance)
    const leftObstacleValue = Math.floor(
      gameState.player.number * randomRange(config.obstacle.minPercent, config.obstacle.maxPercent)
    )
    const rightObstacleValue = Math.floor(
      gameState.player.number * randomRange(config.obstacle.minPercent, config.obstacle.maxPercent)
    )

    track.objects.push({
      y: y,
      lane: 'left',
      type: 'obstacle',
      value: Math.max(1, leftObstacleValue),
      passed: false
    })

    track.objects.push({
      y: y,
      lane: 'right',
      type: 'obstacle',
      value: Math.max(1, rightObstacleValue),
      passed: false
    })
  }
}

// ========== 难度系统 ==========
// 获取难度系数
function getDifficultyMultiplier(distance) {
  const baseMultiplier = 1 + (distance / 5000) * 0.5
  return Math.min(baseMultiplier, 2.5)
}

// 获取动态调整后的配置
function getAdjustedConfig(distance) {
  const multiplier = getDifficultyMultiplier(distance)

  return {
    add: {
      minPercent: Math.min(0.15, 0.1 + (multiplier - 1) * 0.025),
      maxPercent: Math.min(0.8, 0.5 + (multiplier - 1) * 0.3)
    },
    sub: {
      maxPercent: Math.min(0.5, 0.3 + (multiplier - 1) * 0.2)
    },
    mul: {
      multipliers: multiplier > 1.9 ? [2, 3, 4, 5] : (multiplier > 1.3 ? [2, 3, 4] : [2, 3])
    },
    div: {
      divisors: multiplier > 2.1 ? [2, 3, 4, 5, 6, 7] : (multiplier > 1.5 ? [2, 3, 4, 5, 6] : [2, 3, 4, 5])
    },
    obstacle: {
      minPercent: Math.min(0.5, 0.3 + (multiplier - 1) * 0.1),
      maxPercent: Math.min(0.85, 0.8 + (multiplier - 1) * 0.025)
    }
  }
}

// ========== 运算系统 ==========
function getOperationValue(currentNumber) {
  const op = selectOperationType()
  let value = 0

  switch(op) {
    case 'add':
      value = Math.floor(currentNumber * randomRange(BALANCE_CONFIG.operations.add.minPercent, BALANCE_CONFIG.operations.add.maxPercent))
      value = Math.max(1, value)
      break
    case 'sub':
      const maxSub = currentNumber - BALANCE_CONFIG.minSafeNumber
      value = Math.floor(Math.min(maxSub, currentNumber * BALANCE_CONFIG.operations.sub.maxPercent))
      value = Math.max(1, value)
      break
    case 'mul':
      const multipliers = BALANCE_CONFIG.operations.mul.multipliers
      value = multipliers[Math.floor(Math.random() * multipliers.length)]
      break
    case 'div':
      const divisors = BALANCE_CONFIG.operations.div.divisors
        .filter(d => currentNumber % d === 0 && Math.floor(currentNumber / d) >= BALANCE_CONFIG.minSafeNumber)
      if (divisors.length > 0) {
        value = divisors[Math.floor(Math.random() * divisors.length)]
      } else {
        value = 2
      }
      break
  }

  return { operation: op, value }
}

function selectOperationType() {
  const weights = BALANCE_CONFIG.operationWeights
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight

  for (const [op, weight] of Object.entries(weights)) {
    random -= weight
    if (random <= 0) return op
  }
  return 'add'
}

function selectOperationTypeByType(opType) {
  if (opType === 'positive') {
    // 正向运算：加法和乘法
    const weights = { add: BALANCE_CONFIG.operationWeights.add, mul: BALANCE_CONFIG.operationWeights.mul }
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight

    for (const [op, weight] of Object.entries(weights)) {
      random -= weight
      if (random <= 0) return op
    }
    return 'add'
  } else {
    // 负向运算：减法和除法
    const weights = { sub: BALANCE_CONFIG.operationWeights.sub, div: BALANCE_CONFIG.operationWeights.div }
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight

    for (const [op, weight] of Object.entries(weights)) {
      random -= weight
      if (random <= 0) return op
    }
    return 'sub'
  }
}

function getOperationValueByType(currentNumber, opType, currentDistance) {
  const op = selectOperationTypeByType(opType)
  const config = getAdjustedConfig(currentDistance)
  let value = 0

  switch(op) {
    case 'add':
      value = Math.floor(currentNumber * randomRange(config.add.minPercent, config.add.maxPercent))
      value = Math.max(1, value)
      break
    case 'sub':
      const maxSub = currentNumber - BALANCE_CONFIG.minSafeNumber
      value = Math.floor(Math.min(maxSub, currentNumber * config.sub.maxPercent))
      value = Math.max(1, value)
      break
    case 'mul':
      const multipliers = config.mul.multipliers
      value = multipliers[Math.floor(Math.random() * multipliers.length)]
      break
    case 'div':
      const divisors = config.div.divisors
        .filter(d => currentNumber % d === 0 && Math.floor(currentNumber / d) >= BALANCE_CONFIG.minSafeNumber)
      if (divisors.length > 0) {
        value = divisors[Math.floor(Math.random() * divisors.length)]
      } else {
        value = 2
      }
      break
  }

  return { operation: op, value }
}

function applyOperation(op, value) {
  const player = gameState.player
  let oldValue = player.number
  let newValue = oldValue

  switch(op) {
    case 'add':
      newValue = oldValue + value
      break
    case 'sub':
      newValue = oldValue - value
      break
    case 'mul':
      newValue = oldValue * value
      break
    case 'div':
      newValue = Math.floor(oldValue / value)
      break
  }

  player.number = newValue

  // 显示运算反馈
  const opSymbol = { add: '+', sub: '-', mul: '×', div: '÷' }[op]
  showFloatingText(`${oldValue} ${opSymbol} ${value} = ${newValue}`)

  // 检查游戏结束条件（数字为0或负数都无法继续游戏）
  if (player.number <= 0) {
    gameOver('数字耗尽，游戏结束！')
  }
}

// ========== 碰撞检测 ==========
function checkCollision() {
  const player = gameState.player
  const track = gameState.track
  const playerY = GAME_CONFIG.playerY

  for (const obj of track.objects) {
    const screenY = obj.y + track.offsetY

    // 碰撞检测逻辑：
    // - 如果没在移动，只检查当前通道
    // - 如果正在移动，检查当前通道和目标通道
    const shouldCheck = player.isMoving
      ? (obj.lane === player.lane || obj.lane === player.targetLane)
      : (obj.lane === player.lane)

    if (!shouldCheck) continue

    // 检查Y轴碰撞
    if (Math.abs(screenY - playerY) < 30) {
      if (obj.type.startsWith('barrier_') && !obj.passed) {
        const operation = obj.type.replace('barrier_', '')
        applyOperation(operation, obj.value)
        obj.passed = true
      } else if (obj.type === 'obstacle' && !obj.passed) {
        obj.passed = true
        if (player.number >= obj.value) {
          player.number -= obj.value
          showFloatingText(`突破! ${obj.value}`)
          gameState.game.score += obj.value * 10
        } else {
          gameOver(`数字不足！需要 ${obj.value}，你有 ${player.number}`)
          return
        }
      }
    }
  }
}

// ========== 游戏流程 ==========
function gameOver(reason) {
  gameState.current = GameState.GAME_OVER
  cancelAnimationFrame(animationId)

  // 更新最高分
  if (gameState.game.score > highScore) {
    highScore = gameState.game.score
    localStorage.setItem('parkourHighScore', highScore)
    document.getElementById('highScore').textContent = highScore
  }

  showMessage(`${reason}<br>得分: ${gameState.game.score}`, 'gameover')
  document.getElementById('startBtn').textContent = '重新开始'
}

// ========== 渲染函数 ==========
function draw() {
  // 清空画布
  ctx.clearRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight)

  // 绘制背景
  drawBackground()

  // 绘制跑道
  drawTrack()

  // 绘制物体
  drawObjects()

  // 绘制角色
  drawPlayer()

  // 绘制浮动文字
  drawFloatingTexts()
}

function drawBackground() {
  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.canvasHeight)
  gradient.addColorStop(0, '#87CEEB')
  gradient.addColorStop(1, '#E0F7FA')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight)

  // 绘制跑道
  ctx.fillStyle = '#90EE90'
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight)
}

function drawTrack() {
  // 绘制跑道分隔线
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 4
  ctx.setLineDash([20, 20])

  // 移动的分隔线效果
  const dashOffset = -(gameState.track.offsetY % 40)
  ctx.lineDashOffset = dashOffset

  ctx.beginPath()
  ctx.moveTo(GAME_CONFIG.canvasWidth / 2, 0)
  ctx.lineTo(GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight)
  ctx.stroke()

  ctx.setLineDash([])

  // 绘制跑道边框
  ctx.strokeStyle = '#4CAF50'
  ctx.lineWidth = 6
  ctx.strokeRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight)
}

function drawPlayer() {
  const player = gameState.player

  // 计算起始位置和目标位置
  const startCenter = player.startLane === 'left' ? GAME_CONFIG.laneWidth / 2 : GAME_CONFIG.canvasWidth - GAME_CONFIG.laneWidth / 2
  const targetCenter = player.targetLane === 'left' ? GAME_CONFIG.laneWidth / 2 : GAME_CONFIG.canvasWidth - GAME_CONFIG.laneWidth / 2

  // 计算当前X位置
  let x
  if (player.isMoving) {
    const t = easeInOutQuad(player.moveProgress)
    x = startCenter + (targetCenter - startCenter) * t
  } else {
    x = player.lane === 'left' ? GAME_CONFIG.laneWidth / 2 : GAME_CONFIG.canvasWidth - GAME_CONFIG.laneWidth / 2
  }

  const y = GAME_CONFIG.playerY

  // 绘制角色身体
  ctx.beginPath()
  ctx.arc(x, y, GAME_CONFIG.playerRadius, 0, Math.PI * 2)
  ctx.fillStyle = '#FF6B6B'
  ctx.fill()
  ctx.strokeStyle = '#E55555'
  ctx.lineWidth = 3
  ctx.stroke()

  // 绘制角色眼睛
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x - 6, y - 5, 4, 0, Math.PI * 2)
  ctx.arc(x + 6, y - 5, 4, 0, Math.PI * 2)
  ctx.fill()

  // 绘制角色嘴巴
  ctx.beginPath()
  ctx.arc(x, y + 2, 8, 0.1 * Math.PI, 0.9 * Math.PI)
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.stroke()

  // 绘制头顶数字
  ctx.fillStyle = '#333'
  ctx.font = 'bold 32px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(player.number, x, y - 35)
}

function drawObjects() {
  for (const obj of gameState.track.objects) {
    const screenY = obj.y + gameState.track.offsetY

    // 只绘制屏幕内的物体
    if (screenY < -50 || screenY > GAME_CONFIG.canvasHeight + 50) continue

    const x = obj.lane === 'left' ? GAME_CONFIG.laneWidth / 2 : GAME_CONFIG.canvasWidth - GAME_CONFIG.laneWidth / 2

    if (obj.type.startsWith('barrier_')) {
      drawBarrier(x, screenY, obj)
    } else if (obj.type === 'obstacle') {
      drawObstacle(x, screenY, obj)
    }
  }
}

function drawBarrier(x, y, obj) {
  const operation = obj.type.replace('barrier_', '')
  const colors = {
    add: { primary: '#4CAF50', dark: '#388E3C', light: '#81C784' },
    sub: { primary: '#FF9800', dark: '#F57C00', light: '#FFB74D' },
    mul: { primary: '#2196F3', dark: '#1976D2', light: '#64B5F6' },
    div: { primary: '#9C27B0', dark: '#7B1FA2', light: '#BA68C8' }
  }
  const symbols = { add: '+', sub: '-', mul: '×', div: '÷' }
  const color = colors[operation]

  // 护栏尺寸
  const postWidth = 12
  const postHeight = 60
  const railY = y
  const signRadius = 28

  // 绘制左侧立柱
  ctx.fillStyle = color.dark
  ctx.fillRect(x - 75 - postWidth / 2, railY - postHeight / 2, postWidth, postHeight)
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 2
  ctx.strokeRect(x - 75 - postWidth / 2, railY - postHeight / 2, postWidth, postHeight)

  // 绘制右侧立柱
  ctx.fillStyle = color.dark
  ctx.fillRect(x + 75 - postWidth / 2, railY - postHeight / 2, postWidth, postHeight)
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 2
  ctx.strokeRect(x + 75 - postWidth / 2, railY - postHeight / 2, postWidth, postHeight)

  // 绘制横栏（上下两条）
  const railHeight = 6
  for (let railOffset of [-18, 18]) {
    // 横栏渐变
    const gradient = ctx.createLinearGradient(x - 75, railY + railOffset, x + 75, railY + railOffset)
    gradient.addColorStop(0, color.dark)
    gradient.addColorStop(0.5, color.primary)
    gradient.addColorStop(1, color.dark)

    ctx.fillStyle = gradient
    ctx.fillRect(x - 75, railY + railOffset - railHeight / 2, 150, railHeight)

    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1
    ctx.strokeRect(x - 75, railY + railOffset - railHeight / 2, 150, railHeight)
  }

  // 绘制中间悬挂的标识牌（圆形）
  ctx.beginPath()
  ctx.arc(x, railY, signRadius, 0, Math.PI * 2)

  // 标识牌渐变背景
  const signGradient = ctx.createRadialGradient(x - 5, railY - 5, 0, x, railY, signRadius)
  signGradient.addColorStop(0, color.light)
  signGradient.addColorStop(1, color.primary)
  ctx.fillStyle = signGradient
  ctx.fill()

  // 标识牌边框
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 3
  ctx.stroke()

  // 绘制内圈装饰
  ctx.beginPath()
  ctx.arc(x, railY, signRadius - 5, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 绘制运算符号和数字
  ctx.fillStyle = '#FFF'
  ctx.font = 'bold 26px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${symbols[operation]}${obj.value}`, x, railY)

  // 添加阴影效果
  ctx.textBaseline = 'alphabetic'
}

function drawObstacle(x, y, obj) {
  // 绘制障碍物
  ctx.fillStyle = '#F44336'
  ctx.beginPath()
  ctx.arc(x, y, 30, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#D32F2F'
  ctx.lineWidth = 3
  ctx.stroke()

  // 绘制数字
  ctx.fillStyle = '#FFF'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(obj.value, x, y + 8)
}

// ========== 浮动文字 ==========
function showFloatingText(text) {
  floatingTexts.push({
    text: text,
    x: GAME_CONFIG.canvasWidth / 2,
    y: GAME_CONFIG.playerY - 60,
    alpha: 1,
    offsetY: 0
  })
}

function updateFloatingTexts(deltaTime) {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i]
    ft.offsetY -= deltaTime * 0.05
    ft.alpha -= deltaTime * 0.001

    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1)
    }
  }
}

function drawFloatingTexts() {
  for (const ft of floatingTexts) {
    ctx.fillStyle = `rgba(0, 0, 0, ${ft.alpha})`
    ctx.font = 'bold 20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(ft.text, ft.x, ft.y + ft.offsetY)
  }
}

// ========== UI更新 ==========
function updateUI() {
  document.getElementById('playerNumber').textContent = gameState.player.number
  document.getElementById('distance').textContent = Math.floor(gameState.track.distance)
}

// ========== 消息显示 ==========
function showMessage(text, type) {
  let messageDiv = document.querySelector('.game-message')
  if (!messageDiv) {
    messageDiv = document.createElement('div')
    messageDiv.className = 'game-message'
    document.querySelector('.container').appendChild(messageDiv)
  }

  messageDiv.innerHTML = text
  messageDiv.className = 'game-message ' + type
  messageDiv.style.display = 'block'
}

function hideMessage() {
  const messageDiv = document.querySelector('.game-message')
  if (messageDiv) {
    messageDiv.style.display = 'none'
  }
}

// ========== 工具函数 ==========
function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

// ========== 页面加载完成后初始化 ==========
window.addEventListener('load', init)
