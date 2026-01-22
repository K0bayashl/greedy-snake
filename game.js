// 游戏配置
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

// 难度配置（速度：毫秒/帧，数值越小速度越快）
const DIFFICULTY = {
    easy: { speed: 300, name: '简单' },
    normal: { speed: 200, name: '普通' },
    hard: { speed: 120, name: '困难' }
};

// 游戏状态
let canvas, ctx;
let snake, direction, nextDirection;
let food;
let score, highScore;
let gameLoop;
let isPlaying = false;
let isPaused = false;
let startTime = 0;
let playTime = 0;
let currentDifficulty = 'easy';

// 特殊食物（双倍分数）
let bonusFood = null; // 双倍食物对象 {x, y, spawnTime}
const BONUS_FOOD_DURATION = 6000; // 双倍食物存在时间（毫秒）
const BONUS_FOOD_SCORE = 20; // 双倍食物得分
const BONUS_FOOD_SPAWN_CHANCE = 0.3; // 生成双倍食物的概率
const BONUS_FOOD_RESPAWN_MIN_DELAY = 2000; // 双倍食物重生最小延迟（毫秒）
const BONUS_FOOD_RESPAWN_MAX_DELAY = 5000; // 双倍食物重生最大延迟（毫秒）
let bonusFoodCheckInterval = null; // 检查双倍食物超时的定时器
let bonusFoodRespawnTimeout = null; // 双倍食物重生延迟定时器
let bonusFoodPauseTime = 0; // 记录双倍食物暂停时的时间戳

// 初始化游戏
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // 从本地存储读取最高分
    highScore = localStorage.getItem('snakeHighScore') || 0;
    document.getElementById('highScore').textContent = highScore;

    // 绑定按钮事件
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resetBtn').addEventListener('click', resetGame);

    // 绑定难度选择按钮
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!isPlaying) {
                setDifficulty(this.dataset.difficulty);
            }
        });
    });

    // 绑定键盘事件
    document.addEventListener('keydown', handleKeyPress);

    resetGame();
}

// 设置难度
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;

    // 更新按钮激活状态
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === difficulty) {
            btn.classList.add('active');
        }
    });
}

// 重置游戏
function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    updateScore();
    generateFood();

    // 清除双倍食物相关定时器和状态
    if (bonusFoodCheckInterval) {
        clearInterval(bonusFoodCheckInterval);
        bonusFoodCheckInterval = null;
    }
    if (bonusFoodRespawnTimeout) {
        clearTimeout(bonusFoodRespawnTimeout);
        bonusFoodRespawnTimeout = null;
    }
    bonusFood = null;
    bonusFoodPauseTime = 0;

    draw();
}

// 开始游戏
function startGame() {
    if (!isPlaying) {
        // 清理旧的定时器
        if (bonusFoodCheckInterval) {
            clearInterval(bonusFoodCheckInterval);
            bonusFoodCheckInterval = null;
        }
        if (bonusFoodRespawnTimeout) {
            clearTimeout(bonusFoodRespawnTimeout);
            bonusFoodRespawnTimeout = null;
        }

        isPlaying = true;
        isPaused = false;
        startTime = Date.now();
        gameLoop = setInterval(update, DIFFICULTY[currentDifficulty].speed);
    }
}

// 暂停/继续
function togglePause() {
    if (!isPlaying) return;

    isPaused = !isPaused;
    if (isPaused) {
        // 暂停游戏循环
        clearInterval(gameLoop);

        // 暂停双倍食物检查定时器
        if (bonusFoodCheckInterval) {
            clearInterval(bonusFoodCheckInterval);
            bonusFoodCheckInterval = null;
        }

        // 记录暂停时间（如果有双倍食物）
        if (bonusFood) {
            bonusFoodPauseTime = Date.now();
        }

        document.getElementById('pauseBtn').textContent = '继续';
    } else {
        // 恢复游戏循环
        gameLoop = setInterval(update, DIFFICULTY[currentDifficulty].speed);

        // 恢复双倍食物检查定时器
        if (bonusFood) {
            // 调整 spawnTime 以补偿暂停时间
            const pausedDuration = Date.now() - bonusFoodPauseTime;
            bonusFood.spawnTime += pausedDuration;

            // 重新启动检查定时器
            if (!bonusFoodCheckInterval) {
                bonusFoodCheckInterval = setInterval(checkBonusFoodTimeout, 500);
            }
        }

        document.getElementById('pauseBtn').textContent = '暂停';
    }
}

// 处理键盘输入
function handleKeyPress(e) {
    const key = e.key;

    if (key === 'ArrowUp' && direction.y === 0) {
        nextDirection = { x: 0, y: -1 };
    } else if (key === 'ArrowDown' && direction.y === 0) {
        nextDirection = { x: 0, y: 1 };
    } else if (key === 'ArrowLeft' && direction.x === 0) {
        nextDirection = { x: -1, y: 0 };
    } else if (key === 'ArrowRight' && direction.x === 0) {
        nextDirection = { x: 1, y: 0 };
    }

    // 防止方向键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault();
    }
}

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    };

    // 确保食物不在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }

    // 30%概率生成双倍食物（如果当前没有双倍食物）
    if (!bonusFood && Math.random() < BONUS_FOOD_SPAWN_CHANCE) {
        generateBonusFood();
    }
}

// 生成双倍食物
function generateBonusFood() {
    let newBonusFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        spawnTime: Date.now()
    };

    // 确保双倍食物不在普通食物位置
    if (newBonusFood.x === food.x && newBonusFood.y === food.y) {
        generateBonusFood();
        return;
    }

    // 确保双倍食物不在蛇身上
    for (let segment of snake) {
        if (segment.x === newBonusFood.x && segment.y === newBonusFood.y) {
            generateBonusFood();
            return;
        }
    }

    bonusFood = newBonusFood;

    // 启动检查双倍食物超时的定时器
    if (!bonusFoodCheckInterval) {
        bonusFoodCheckInterval = setInterval(checkBonusFoodTimeout, 500);
    }
}

// 检查双倍食物是否超时
function checkBonusFoodTimeout() {
    if (bonusFood && Date.now() - bonusFood.spawnTime > BONUS_FOOD_DURATION) {
        bonusFood = null;
        clearInterval(bonusFoodCheckInterval);
        bonusFoodCheckInterval = null;

        // 超时后尝试重新生成双倍食物
        if (isPlaying && !isPaused) {
            const respawnDelay = Math.random() * (BONUS_FOOD_RESPAWN_MAX_DELAY - BONUS_FOOD_RESPAWN_MIN_DELAY) + BONUS_FOOD_RESPAWN_MIN_DELAY;
            bonusFoodRespawnTimeout = setTimeout(() => {
                if (isPlaying && !isPaused && !bonusFood) {
                    generateBonusFood();
                }
                bonusFoodRespawnTimeout = null;
            }, respawnDelay);
        }
    }
}

// 更新游戏状态
function update() {
    direction = nextDirection;

    // 计算蛇头新位置
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    let ateFood = false;

    // 检查是否吃到普通食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        ateFood = true;
    }

    // 检查是否吃到双倍食物
    if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
        score += BONUS_FOOD_SCORE;
        bonusFood = null;
        clearInterval(bonusFoodCheckInterval);
        bonusFoodCheckInterval = null;
        ateFood = true;
    }

    if (ateFood) {
        updateScore();
        generateFood();
    } else {
        snake.pop();
    }

    draw();
}

// 检查碰撞
function checkCollision(head) {
    // 撞墙
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }

    // 撞到自己
    for (let segment of snake) {
        if (segment.x === head.x && segment.y === head.y) {
            return true;
        }
    }

    return false;
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    if (bonusFoodCheckInterval) {
        clearInterval(bonusFoodCheckInterval);
        bonusFoodCheckInterval = null;
    }
    if (bonusFoodRespawnTimeout) {
        clearTimeout(bonusFoodRespawnTimeout);
        bonusFoodRespawnTimeout = null;
    }
    isPlaying = false;
    isPaused = false;
    document.getElementById('pauseBtn').textContent = '暂停';

    // 计算游戏时长
    playTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(playTime / 60);
    const seconds = playTime % 60;

    // 更新最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    alert(`游戏结束！\n难度：${DIFFICULTY[currentDifficulty].name}\n得分：${score}\n用时：${minutes}分${seconds}秒`);
}

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = score;
}

// 绘制游戏画面
function draw() {
    // 清空画布
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 绘制网格
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
    });

    // 绘制普通食物
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // 绘制双倍食物（金色，带闪烁效果）
    if (bonusFood) {
        drawBonusFood();
    }
}

// 绘制双倍食物
function drawBonusFood() {
    // 计算闪烁透明度（基于时间产生呼吸效果）
    const time = Date.now();
    const blinkPhase = Math.sin(time / 150) * 0.5 + 0.5; // 0到1之间变化
    const alpha = 0.6 + blinkPhase * 0.4; // 透明度在0.6-1.0之间变化

    // 绘制光晕效果
    ctx.beginPath();
    ctx.arc(
        bonusFood.x * CELL_SIZE + CELL_SIZE / 2,
        bonusFood.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 + 3,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.3})`;
    ctx.fill();

    // 绘制双倍食物主体
    ctx.beginPath();
    ctx.arc(
        bonusFood.x * CELL_SIZE + CELL_SIZE / 2,
        bonusFood.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.fill();

    // 绘制内圈高光
    ctx.beginPath();
    ctx.arc(
        bonusFood.x * CELL_SIZE + CELL_SIZE / 2 - 2,
        bonusFood.y * CELL_SIZE + CELL_SIZE / 2 - 2,
        CELL_SIZE / 4,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.8})`;
    ctx.fill();

    // 绘制"2x"文字标识
    ctx.fillStyle = `rgba(184, 134, 11, ${alpha})`;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        '2x',
        bonusFood.x * CELL_SIZE + CELL_SIZE / 2,
        bonusFood.y * CELL_SIZE + CELL_SIZE / 2
    );
}

// 页面加载完成后初始化
window.addEventListener('load', init);