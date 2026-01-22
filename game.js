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
    draw();
}

// 开始游戏
function startGame() {
    if (!isPlaying) {
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
        clearInterval(gameLoop);
        document.getElementById('pauseBtn').textContent = '继续';
    } else {
        gameLoop = setInterval(update, DIFFICULTY[currentDifficulty].speed);
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

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
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

    // 绘制食物
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
}

// 页面加载完成后初始化
window.addEventListener('load', init);