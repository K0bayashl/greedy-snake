# 贪吃蛇游戏 - 项目规则手册

## 项目概述

贪吃蛇是一个纯前端网页游戏，使用 Canvas API 实现。

## 技术约束

- **纯前端**：不使用后端服务
- **无框架**：纯 JavaScript，不使用 React/Vue 等
- **无依赖**：不引入第三方库
- **浏览器兼容**：支持现代浏览器

## 代码规范

### JavaScript

```javascript
// 好的示例
function updateScore(points) {
  currentScore += points;
  updateDisplay();
}

const GAME_SPEED = 100;
let snakeDirection = 'right';

// 不好的示例
function update(points){score+=points;}
var speed=100;
```

- 使用 `const` 定义常量
- 使用 `let` 定义变量（不使用 `var`）
- 函数名使用动词开头：`updateScore()`, `drawGame()`, `checkCollision()`
- 语句末尾不加分号

### 命名约定

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `currentScore`, `snakeDirection` |
| 常量 | UPPER_SNAKE_CASE | `GAME_SPEED`, `CANVAS_WIDTH` |
| 函数 | camelCase, 动词开头 | `updateScore()`, `drawGame()` |
| 类 | PascalCase | `GameEngine`, `Snake` |

## 目录结构

```
greedy-snake/
├── src/                      # 源代码目录
│   ├── index.html           # 游戏页面
│   ├── style.css            # 样式文件
│   └── game.js              # 游戏逻辑（核心文件）
├── docs/                     # 文档目录
│   ├── learning.md          # Claude Code 学习笔记
│   ├── features.md          # 游戏功能说明
│   └── guides/              # 各功能指南
│       ├── hooks-guide.md
│       ├── mcp-guide.md
│       ├── output-styles-guide.md
│       ├── skills-guide.md
│       └── subagent-guide.md
├── .claude/                  # Claude Code 配置
│   ├── settings.json        # 项目配置
│   ├── settings.local.json  # 本地配置
│   ├── agents/              # 自定义 SubAgents
│   │   ├── designer.md
│   │   ├── developer.md
│   │   ├── doc-writer.md
│   │   ├── reviewer.md
│   │   └── tester.md
│   ├── skills/              # 自定义 Skills
│   │   ├── change-summary/
│   │   ├── code-reviewer/
│   │   └── game-tester/
│   └── output-styles/       # 自定义 Output Styles
│       └── snake-game-dev.md
├── CLAUDE.md                 # 本文件（项目规则手册）
├── greedy-snake.iml          # IDE 配置
└── .idea/                    # IDE 配置目录
```

## 核心文件说明

### src/game.js

游戏的核心逻辑文件，包含：

- **游戏循环**：`gameLoop()`
- **绘制函数**：`drawGame()`, `drawSnake()`, `drawFood()`
- **状态管理**：`startGame()`, `togglePause()`, `gameOver()`
- **输入处理**：键盘方向键控制
- **难度系统**：简单/普通/困难三种速度
- **双倍分数食物**：限时 6 秒的金色食物

### src/index.html

游戏页面结构，包含 Canvas 元素和 UI 控件。

### src/style.css

游戏样式，包含布局、按钮样式、动画效果等。

### 修改注意事项

1. **修改 src/game.js 前**：必须先用 Read 工具读取完整文件
2. **Canvas 相关**：修改绘制逻辑后务必测试视觉效果
3. **游戏平衡**：调整速度、分数等参数需考虑各难度
4. **兼容性**：新增功能要考虑暂停状态的处理

## 已知问题

- 暂停时双倍分数食物的计时器可能不准确（已有补偿逻辑）

## 开发流程

1. 添加新功能前，先与用户确认需求
2. 使用 Read 工具查看 `src/` 目录下的相关代码
3. 使用 Edit 工具修改代码
4. 建议用户测试功能
5. 重要更新需修改 `docs/learning.md`

## 禁止事项

- ❌ 添加第三方依赖
- ❌ 使用 ES6+ 新特性导致兼容性问题
- ❌ 重构工作正常的代码（除非明确要求）
- ❌ 修改核心游戏机制而不告知用户
