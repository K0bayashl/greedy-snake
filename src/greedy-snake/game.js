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

// 障碍物配置
const OBSTACLE_CONFIG = {
    easy: { count: 3, refreshInterval: 15000, spawnDelay: 3000 },
    normal: { count: 5, refreshInterval: 12000, spawnDelay: 2000 },
    hard: { count: 8, refreshInterval: 10000, spawnDelay: 1000 }
};

// 无敌道具配置
const POWER_UP_CONFIG = {
    duration: 10000, // 无敌持续时间（毫秒）
    spawnChance: 0.25, // 生成概率 25%
    respawnMinDelay: 3000, // 重生最小延迟（毫秒）
    respawnMaxDelay: 7000 // 重生最大延迟（毫秒）
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

// 障碍物系统
let obstacles = []; // 障碍物数组
let upcomingObstacles = []; // 即将生成的障碍物（警告显示）
let obstacleRefreshTimeout = null; // 障碍物刷新定时器
let obstacleSpawnTimeout = null; // 首次生成定时器
let obstacleWarningTimeout = null; // 警告显示定时器
let obstaclePauseTime = 0; // 记录障碍物暂停时的时间戳
let obstacleNextRefreshTime = 0; // 下次刷新时间戳
const OBSTACLE_WARNING_TIME = 3000; // 障碍物生成前警告时间（毫秒）

// 无敌道具系统
let invinciblePowerUp = null; // 无敌道具对象 {x, y, spawnTime}
let isInvincible = false; // 是否处于无敌状态
let invincibleEndTime = 0; // 无敌状态结束时间戳
let invinciblePowerUpCheckInterval = null; // 检查道具超时的定时器
let invincibleStatusCheckInterval = null; // 检查无敌状态超时的定时器
let invinciblePowerUpRespawnTimeout = null; // 道具重生延迟定时器
let invinciblePowerUpPauseTime = 0; // 记录道具暂停时的时间戳
let invincibleStatusPauseTime = 0; // 记录无敌状态暂停时的时间戳

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

    // 清除障碍物相关定时器和状态
    if (obstacleRefreshTimeout) {
        clearTimeout(obstacleRefreshTimeout);
        obstacleRefreshTimeout = null;
    }
    if (obstacleSpawnTimeout) {
        clearTimeout(obstacleSpawnTimeout);
        obstacleSpawnTimeout = null;
    }
    if (obstacleWarningTimeout) {
        clearTimeout(obstacleWarningTimeout);
        obstacleWarningTimeout = null;
    }
    obstacles = [];
    upcomingObstacles = [];
    obstaclePauseTime = 0;
    obstacleNextRefreshTime = 0;

    // 清除无敌道具相关定时器和状态
    if (invinciblePowerUpCheckInterval) {
        clearInterval(invinciblePowerUpCheckInterval);
        invinciblePowerUpCheckInterval = null;
    }
    if (invincibleStatusCheckInterval) {
        clearInterval(invincibleStatusCheckInterval);
        invincibleStatusCheckInterval = null;
    }
    if (invinciblePowerUpRespawnTimeout) {
        clearTimeout(invinciblePowerUpRespawnTimeout);
        invinciblePowerUpRespawnTimeout = null;
    }
    invinciblePowerUp = null;
    isInvincible = false;
    invincibleEndTime = 0;
    invinciblePowerUpPauseTime = 0;
    invincibleStatusPauseTime = 0;

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
        if (obstacleRefreshTimeout) {
            clearTimeout(obstacleRefreshTimeout);
            obstacleRefreshTimeout = null;
        }
        if (obstacleSpawnTimeout) {
            clearTimeout(obstacleSpawnTimeout);
            obstacleSpawnTimeout = null;
        }
        if (obstacleWarningTimeout) {
            clearTimeout(obstacleWarningTimeout);
            obstacleWarningTimeout = null;
        }

        // 清理无敌道具定时器
        if (invinciblePowerUpCheckInterval) {
            clearInterval(invinciblePowerUpCheckInterval);
            invinciblePowerUpCheckInterval = null;
        }
        if (invincibleStatusCheckInterval) {
            clearInterval(invincibleStatusCheckInterval);
            invincibleStatusCheckInterval = null;
        }
        if (invinciblePowerUpRespawnTimeout) {
            clearTimeout(invinciblePowerUpRespawnTimeout);
            invinciblePowerUpRespawnTimeout = null;
        }

        isPlaying = true;
        isPaused = false;
        startTime = Date.now();
        gameLoop = setInterval(update, DIFFICULTY[currentDifficulty].speed);

        // 调度障碍物警告显示（在生成前3秒）
        const spawnDelay = OBSTACLE_CONFIG[currentDifficulty].spawnDelay;
        const warningDelay = Math.max(0, spawnDelay - OBSTACLE_WARNING_TIME);

        obstacleWarningTimeout = setTimeout(() => {
            if (isPlaying && !isPaused) {
                showObstacleWarning();
            }
            obstacleWarningTimeout = null;
        }, warningDelay);

        // 调度障碍物首次生成
        obstacleSpawnTimeout = setTimeout(() => {
            if (isPlaying && !isPaused) {
                spawnObstacles();
                scheduleObstacleRefresh();
            }
            obstacleSpawnTimeout = null;
        }, spawnDelay);
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

        // 暂停障碍物刷新定时器
        if (obstacleRefreshTimeout) {
            clearTimeout(obstacleRefreshTimeout);
            obstacleRefreshTimeout = null;
        }
        if (obstacleSpawnTimeout) {
            clearTimeout(obstacleSpawnTimeout);
            obstacleSpawnTimeout = null;
        }
        if (obstacleWarningTimeout) {
            clearTimeout(obstacleWarningTimeout);
            obstacleWarningTimeout = null;
        }
        // 记录障碍物暂停时间
        if (obstacles.length > 0 || obstacleNextRefreshTime > 0) {
            obstaclePauseTime = Date.now();
        }

        // 暂停无敌道具检查定时器
        if (invinciblePowerUpCheckInterval) {
            clearInterval(invinciblePowerUpCheckInterval);
            invinciblePowerUpCheckInterval = null;
        }
        if (invincibleStatusCheckInterval) {
            clearInterval(invincibleStatusCheckInterval);
            invincibleStatusCheckInterval = null;
        }
        // 记录暂停时间
        if (invinciblePowerUp) {
            invinciblePowerUpPauseTime = Date.now();
        }
        if (isInvincible) {
            invincibleStatusPauseTime = Date.now();
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

        // 恢复障碍物刷新定时器
        if (obstacles.length > 0 && obstacleNextRefreshTime > 0) {
            const pausedDuration = Date.now() - obstaclePauseTime;
            obstacleNextRefreshTime += pausedDuration;
            const remainingTime = obstacleNextRefreshTime - Date.now();

            if (remainingTime > 0) {
                obstacleRefreshTimeout = setTimeout(() => {
                    if (isPlaying && !isPaused) {
                        refreshObstacles();
                        scheduleObstacleRefresh();
                    }
                }, remainingTime);
            } else {
                // 暂停期间已经应该刷新了
                refreshObstacles();
                scheduleObstacleRefresh();
            }
        } else if (obstacleSpawnTimeout === null && obstacles.length === 0 && upcomingObstacles.length === 0) {
            // 如果障碍物还没生成也没警告，重新调度
            const spawnDelay = OBSTACLE_CONFIG[currentDifficulty].spawnDelay;
            const warningDelay = Math.max(0, spawnDelay - OBSTACLE_WARNING_TIME);

            // 先调度警告
            obstacleWarningTimeout = setTimeout(() => {
                if (isPlaying && !isPaused) {
                    showObstacleWarning();
                }
                obstacleWarningTimeout = null;
            }, warningDelay);

            // 再调度生成
            obstacleSpawnTimeout = setTimeout(() => {
                if (isPlaying && !isPaused) {
                    spawnObstacles();
                    scheduleObstacleRefresh();
                }
                obstacleSpawnTimeout = null;
            }, spawnDelay);
        }

        // 恢复无敌道具检查定时器
        if (invinciblePowerUp) {
            const pausedDuration = Date.now() - invinciblePowerUpPauseTime;
            invinciblePowerUp.spawnTime += pausedDuration;
            if (!invinciblePowerUpCheckInterval) {
                invinciblePowerUpCheckInterval = setInterval(checkInvinciblePowerUpTimeout, 500);
            }
        }

        // 恢复无敌状态检查定时器
        if (isInvincible) {
            const pausedDuration = Date.now() - invincibleStatusPauseTime;
            invincibleEndTime += pausedDuration;
            if (!invincibleStatusCheckInterval) {
                invincibleStatusCheckInterval = setInterval(checkInvincibleStatus, 500);
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

    // 8%概率生成无敌道具（如果当前没有道具）
    if (!invinciblePowerUp && Math.random() < POWER_UP_CONFIG.spawnChance) {
        generateInvinciblePowerUp();
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

    // 确保双倍食物不在障碍物位置
    for (let obstacle of obstacles) {
        if (obstacle.x === newBonusFood.x && obstacle.y === newBonusFood.y) {
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

// 生成无敌道具
function generateInvinciblePowerUp() {
    let newPowerUp = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        spawnTime: Date.now()
    };

    // 确保道具不在普通食物位置
    if (newPowerUp.x === food.x && newPowerUp.y === food.y) {
        generateInvinciblePowerUp();
        return;
    }

    // 确保道具不在双倍食物位置
    if (bonusFood && newPowerUp.x === bonusFood.x && newPowerUp.y === bonusFood.y) {
        generateInvinciblePowerUp();
        return;
    }

    // 确保道具不在蛇身上
    for (let segment of snake) {
        if (segment.x === newPowerUp.x && segment.y === newPowerUp.y) {
            generateInvinciblePowerUp();
            return;
        }
    }

    // 确保道具不在障碍物位置
    for (let obstacle of obstacles) {
        if (obstacle.x === newPowerUp.x && obstacle.y === newPowerUp.y) {
            generateInvinciblePowerUp();
            return;
        }
    }

    // 确保道具不在即将生成的障碍物位置
    for (let upcomingObstacle of upcomingObstacles) {
        if (upcomingObstacle.x === newPowerUp.x && upcomingObstacle.y === newPowerUp.y) {
            generateInvinciblePowerUp();
            return;
        }
    }

    invinciblePowerUp = newPowerUp;

    // 启动检查道具超时的定时器
    if (!invinciblePowerUpCheckInterval) {
        invinciblePowerUpCheckInterval = setInterval(checkInvinciblePowerUpTimeout, 500);
    }
}

// 生成障碍物
function generateObstacles() {
    obstacles = [];
    const count = OBSTACLE_CONFIG[currentDifficulty].count;

    for (let i = 0; i < count; i++) {
        let obstacle = generateSingleObstacle();
        if (obstacle) {
            obstacles.push(obstacle);
        }
    }
}

// 生成单个障碍物（避开蛇身、食物、其他障碍物）
function generateSingleObstacle() {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
        attempts++;
        let pos = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };

        // 检查是否在蛇身上
        let onSnake = false;
        for (let segment of snake) {
            if (segment.x === pos.x && segment.y === pos.y) {
                onSnake = true;
                break;
            }
        }
        if (onSnake) continue;

        // 检查是否在普通食物位置
        if (pos.x === food.x && pos.y === food.y) continue;

        // 检查是否在双倍食物位置
        if (bonusFood && pos.x === bonusFood.x && pos.y === bonusFood.y) continue;

        // 检查是否在无敌道具位置
        if (invinciblePowerUp && pos.x === invinciblePowerUp.x && pos.y === invinciblePowerUp.y) continue;

        // 检查是否在其他障碍物位置
        let onObstacle = false;
        for (let obs of obstacles) {
            if (obs.x === pos.x && obs.y === pos.y) {
                onObstacle = true;
                break;
            }
        }
        if (onObstacle) continue;

        // 检查是否在蛇头周围3x3安全区
        let head = snake[0];
        if (Math.abs(pos.x - head.x) <= 1 && Math.abs(pos.y - head.y) <= 1) continue;

        return pos;
    }

    return null; // 无法找到合适位置
}

// 显示障碍物生成警告（提前3秒显示半透明障碍物）
function showObstacleWarning() {
    upcomingObstacles = [];
    const count = OBSTACLE_CONFIG[currentDifficulty].count;

    for (let i = 0; i < count; i++) {
        let obstacle = generateSingleObstacle();
        if (obstacle) {
            upcomingObstacles.push(obstacle);
        }
    }
}

// 生成障碍物（从警告状态转为真实障碍物）
function spawnObstacles() {
    obstacles = [];
    // 如果有警告障碍物，直接使用；否则重新生成
    if (upcomingObstacles.length > 0) {
        obstacles = upcomingObstacles;
        upcomingObstacles = [];
    } else {
        generateObstacles();
    }
}

// 调度下次障碍物刷新
function scheduleObstacleRefresh() {
    const refreshInterval = OBSTACLE_CONFIG[currentDifficulty].refreshInterval;
    obstacleNextRefreshTime = Date.now() + refreshInterval;
    const warningDelay = refreshInterval - OBSTACLE_WARNING_TIME;

    // 先调度警告显示
    if (warningDelay > 0) {
        setTimeout(() => {
            if (isPlaying && !isPaused) {
                showObstacleWarning();
            }
        }, warningDelay);
    }

    // 再调度实际刷新
    obstacleRefreshTimeout = setTimeout(() => {
        if (isPlaying && !isPaused) {
            spawnObstacles();
            scheduleObstacleRefresh();
        }
    }, refreshInterval);
}

// 刷新障碍物位置
function refreshObstacles() {
    let head = snake[0];
    let newObstacles = [];

    // 重新生成障碍物，避开蛇头位置
    for (let i = 0; i < OBSTACLE_CONFIG[currentDifficulty].count; i++) {
        let newObs = generateSingleObstacle();
        if (newObs) {
            // 检查新位置是否在蛇头位置（安全保护）
            if (newObs.x === head.x && newObs.y === head.y) {
                // 跳过此障碍物，保持原位
                if (i < obstacles.length && obstacles[i]) {
                    newObstacles.push(obstacles[i]);
                }
            } else {
                newObstacles.push(newObs);
            }
        } else if (i < obstacles.length && obstacles[i]) {
            // 无法生成新位置，保持原位
            newObstacles.push(obstacles[i]);
        }
    }

    obstacles = newObstacles;
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

// 检查无敌道具是否超时
function checkInvinciblePowerUpTimeout() {
    if (invinciblePowerUp && Date.now() - invinciblePowerUp.spawnTime > POWER_UP_CONFIG.duration) {
        invinciblePowerUp = null;
        clearInterval(invinciblePowerUpCheckInterval);
        invinciblePowerUpCheckInterval = null;

        // 超时后尝试重新生成道具
        if (isPlaying && !isPaused) {
            const respawnDelay = Math.random() * (POWER_UP_CONFIG.respawnMaxDelay - POWER_UP_CONFIG.respawnMinDelay) + POWER_UP_CONFIG.respawnMinDelay;
            invinciblePowerUpRespawnTimeout = setTimeout(() => {
                if (isPlaying && !isPaused && !invinciblePowerUp) {
                    generateInvinciblePowerUp();
                }
                invinciblePowerUpRespawnTimeout = null;
            }, respawnDelay);
        }
    }
}

// 检查无敌状态是否超时
function checkInvincibleStatus() {
    if (isInvincible && Date.now() > invincibleEndTime) {
        isInvincible = false;
        invincibleEndTime = 0;
        clearInterval(invincibleStatusCheckInterval);
        invincibleStatusCheckInterval = null;
    }
}

// 更新游戏状态
function update() {
    direction = nextDirection;

    // 计算蛇头新位置
    let head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // 无敌状态下穿墙处理
    if (isInvincible) {
        if (head.x < 0) head.x = GRID_SIZE - 1;
        if (head.x >= GRID_SIZE) head.x = 0;
        if (head.y < 0) head.y = GRID_SIZE - 1;
        if (head.y >= GRID_SIZE) head.y = 0;
    }

    // 检查碰撞（无敌状态下跳过墙体、障碍物、自身碰撞检测）
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

    // 检查是否吃到无敌道具
    if (invinciblePowerUp && head.x === invinciblePowerUp.x && head.y === invinciblePowerUp.y) {
        // 激活无敌状态
        isInvincible = true;
        invincibleEndTime = Date.now() + POWER_UP_CONFIG.duration;
        invinciblePowerUp = null;
        clearInterval(invinciblePowerUpCheckInterval);
        invinciblePowerUpCheckInterval = null;
        if (invinciblePowerUpRespawnTimeout) {
            clearTimeout(invinciblePowerUpRespawnTimeout);
            invinciblePowerUpRespawnTimeout = null;
        }

        // 启动无敌状态检查定时器
        if (!invincibleStatusCheckInterval) {
            invincibleStatusCheckInterval = setInterval(checkInvincibleStatus, 500);
        }

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
    // 无敌状态下跳过所有碰撞检测
    if (isInvincible) {
        return false;
    }

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

    // 撞到障碍物
    for (let obstacle of obstacles) {
        if (obstacle.x === head.x && obstacle.y === head.y) {
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
    if (obstacleRefreshTimeout) {
        clearTimeout(obstacleRefreshTimeout);
        obstacleRefreshTimeout = null;
    }
    if (obstacleSpawnTimeout) {
        clearTimeout(obstacleSpawnTimeout);
        obstacleSpawnTimeout = null;
    }
    if (obstacleWarningTimeout) {
        clearTimeout(obstacleWarningTimeout);
        obstacleWarningTimeout = null;
    }
    if (invinciblePowerUpCheckInterval) {
        clearInterval(invinciblePowerUpCheckInterval);
        invinciblePowerUpCheckInterval = null;
    }
    if (invincibleStatusCheckInterval) {
        clearInterval(invincibleStatusCheckInterval);
        invincibleStatusCheckInterval = null;
    }
    if (invinciblePowerUpRespawnTimeout) {
        clearTimeout(invinciblePowerUpRespawnTimeout);
        invinciblePowerUpRespawnTimeout = null;
    }
    isPlaying = false;
    isPaused = false;
    isInvincible = false;
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

// 绘制蛇身（圆形样式）
function drawSnakeBody(segment, index) {
    const centerX = segment.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = segment.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - 1;

    // 根据身体位置设置渐变颜色
    const gradient = ctx.createRadialGradient(
        centerX - 2, centerY - 2, 1,
        centerX, centerY, radius
    );
    if (index === 0) {
        gradient.addColorStop(0, '#66BB6A');
        gradient.addColorStop(1, '#388E3C');
    } else {
        gradient.addColorStop(0, '#AED581');
        gradient.addColorStop(1, '#7CB342');
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 添加高光效果
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY - 3, radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
}

// 绘制向上表情
function drawUpFace(centerX, centerY) {
    // 眼睛向上看
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 4, centerY - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔向上
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 4, centerY - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // "O"型嘴巴
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 3, 3, 0, Math.PI * 2);
    ctx.stroke();
}

// 绘制向下表情
function drawDownFace(centerX, centerY) {
    // 眼睛向下看
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY + 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 4, centerY + 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔向下
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY + 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 4, centerY + 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 大张嘴
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.arc(centerX, centerY + 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // 舌头
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(centerX, centerY + 6, 2, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制向左表情
function drawLeftFace(centerX, centerY) {
    // 眼睛向左看
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX - 2, centerY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX - 2, centerY + 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔向左
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY + 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 歪嘴笑
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(centerX + 2, centerY, 5, -Math.PI / 4, Math.PI / 4);
    ctx.stroke();
}

// 绘制向右表情
function drawRightFace(centerX, centerY) {
    // 眼睛向右看
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX + 2, centerY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 2, centerY + 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔向右
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX + 3, centerY - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 3, centerY + 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 歪嘴笑
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(centerX - 2, centerY, 5, Math.PI * 3/4, Math.PI * 5/4);
    ctx.stroke();
}

// 绘制蛇头（带动态表情）
function drawSnakeHead(segment) {
    const centerX = segment.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = segment.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2;

    // 绘制蛇头背景（圆形）
    const headGradient = ctx.createRadialGradient(
        centerX - 3, centerY - 3, 1,
        centerX, centerY, radius
    );
    headGradient.addColorStop(0, '#66BB6A');
    headGradient.addColorStop(1, '#2E7D32');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = headGradient;
    ctx.fill();

    // 添加高光
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 4, radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // 根据方向绘制表情
    if (direction.y === -1) {
        drawUpFace(centerX, centerY);
    } else if (direction.y === 1) {
        drawDownFace(centerX, centerY);
    } else if (direction.x === -1) {
        drawLeftFace(centerX, centerY);
    } else {
        drawRightFace(centerX, centerY);
    }
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
        // 无敌状态下添加发光效果
        if (isInvincible) {
            const centerX = segment.x * CELL_SIZE + CELL_SIZE / 2;
            const centerY = segment.y * CELL_SIZE + CELL_SIZE / 2;

            // 绘制金色光晕
            ctx.beginPath();
            ctx.arc(centerX, centerY, CELL_SIZE / 2 + 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.fill();

            // 绘制第二层光晕（闪烁效果）
            const blinkPhase = Math.sin(Date.now() / 100) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, CELL_SIZE / 2 + 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${0.2 + blinkPhase * 0.2})`;
            ctx.fill();
        }

        // 蛇头使用卡通样式，蛇身使用圆形
        if (index === 0) {
            drawSnakeHead(segment);
        } else {
            drawSnakeBody(segment, index);
        }
    });

    // 绘制障碍物
    obstacles.forEach(obstacle => {
        drawObstacle(obstacle);
    });

    // 绘制即将生成的障碍物（半透明警告）
    upcomingObstacles.forEach(obstacle => {
        drawUpcomingObstacle(obstacle);
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

    // 绘制无敌道具
    if (invinciblePowerUp) {
        drawInvinciblePowerUp();
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

// 绘制障碍物
function drawObstacle(obstacle) {
    const x = obstacle.x * CELL_SIZE;
    const y = obstacle.y * CELL_SIZE;

    // 检查是否即将刷新（闪烁警告效果）
    let isWarning = false;
    let timeUntilRefresh = 0;
    if (obstacleNextRefreshTime > 0) {
        timeUntilRefresh = obstacleNextRefreshTime - Date.now();
        if (timeUntilRefresh < 3000) {
            isWarning = true;
        }
    }

    // 计算闪烁透明度
    let alpha = 1;
    if (isWarning) {
        const blinkSpeed = timeUntilRefresh < 1000 ? 100 : 300;
        alpha = Math.sin(Date.now() / blinkSpeed * Math.PI) * 0.3 + 0.7;
    }

    // 砖块主体
    ctx.fillStyle = isWarning ? `rgba(93, 64, 55, ${alpha})` : '#5D4037';
    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

    // 砖缝效果
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

    // 3D 高光效果（左上角）
    ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * alpha})`;
    ctx.fillRect(x + 2, y + 2, 4, 4);

    // 阴影效果（右下角）
    ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * alpha})`;
    ctx.fillRect(x + CELL_SIZE - 5, y + CELL_SIZE - 5, 4, 4);
}

// 绘制即将生成的障碍物（半透明警告）
function drawUpcomingObstacle(obstacle) {
    const x = obstacle.x * CELL_SIZE;
    const y = obstacle.y * CELL_SIZE;

    // 半透明砖块主体
    ctx.fillStyle = 'rgba(93, 64, 55, 0.3)';
    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

    // 半透明砖缝效果
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

    // 淡淡的高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x + 2, y + 2, 4, 4);

    // 淡淡的阴影效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x + CELL_SIZE - 5, y + CELL_SIZE - 5, 4, 4);
}

// 绘制无敌道具
function drawInvinciblePowerUp() {
    const x = invinciblePowerUp.x * CELL_SIZE;
    const y = invinciblePowerUp.y * CELL_SIZE;
    const centerX = x + CELL_SIZE / 2;
    const centerY = y + CELL_SIZE / 2;

    // 计算闪烁透明度
    const time = Date.now();
    const blinkPhase = Math.sin(time / 120) * 0.5 + 0.5;
    const alpha = 0.7 + blinkPhase * 0.3;

    // 绘制金色光环（外层）
    ctx.beginPath();
    ctx.arc(centerX, centerY, CELL_SIZE / 2 + 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.3})`;
    ctx.fill();

    // 绘制金色光环（中层）
    ctx.beginPath();
    ctx.arc(centerX, centerY, CELL_SIZE / 2 + 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 223, 0, ${alpha * 0.5})`;
    ctx.fill();

    // 绘制盾牌主体背景
    const shieldSize = CELL_SIZE - 6;
    const shieldX = centerX - shieldSize / 2;
    const shieldY = centerY - shieldSize / 2;

    // 盾牌形状
    ctx.beginPath();
    ctx.moveTo(shieldX, shieldY);
    ctx.lineTo(shieldX + shieldSize, shieldY);
    ctx.lineTo(shieldX + shieldSize, shieldY + shieldSize * 0.7);
    ctx.lineTo(centerX, shieldY + shieldSize);
    ctx.lineTo(shieldX, shieldY + shieldSize * 0.7);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(184, 134, 11, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制盾牌内部十字
    ctx.beginPath();
    const crossSize = shieldSize * 0.3;
    const crossThickness = 3;
    // 横向
    ctx.moveTo(centerX - crossSize / 2, centerY);
    ctx.lineTo(centerX + crossSize / 2, centerY);
    // 纵向
    ctx.moveTo(centerX, centerY - crossSize / 2);
    ctx.lineTo(centerX, centerY + crossSize / 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.lineWidth = crossThickness;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 绘制高光
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
    ctx.fill();
}

// 页面加载完成后初始化
window.addEventListener('load', init);