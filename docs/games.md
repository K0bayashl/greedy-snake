# 游戏总览

本项目是一个多游戏的前端游戏集合，所有游戏均使用纯前端技术实现，无需后端服务。

## 游戏列表

### 1. 贪吃蛇游戏

**目录**：[greedy-snake](./greedy-snake/)

**类型**：经典休闲游戏

**核心玩法**：
- 控制蛇在网格中移动
- 吃食物增长蛇身
- 避免撞墙或撞到自己

**特色功能**：
- 难度选择（简单/普通/困难）
- 双倍分数食物（限时6秒）
- 动态障碍物系统
- 无敌道具（蓝色星星）
- 卡通外观系统

**技术栈**：Canvas API + LocalStorage

**运行**：`start src/greedy-snake/index.html`

---

### 2. 数字跑酷游戏

**目录**：[number-parkour](./number-parkour/)

**类型**：竖版跑酷游戏

**核心玩法**：
- 双通道自动前进
- 运算护栏（+ - × ÷）
- 数字障碍物突破
- 达到目标距离过关

**特色功能**：
- 3个关卡（2000m/5000m/10000m）
- 动态平衡算法
- 隐性连续难度系统
- 加权随机运算生成
- 移动中碰撞检测

**技术栈**：Canvas API + requestAnimationFrame

**运行**：`start src/number-parkour/index.html`

---

### 3. 2048 游戏

**目录**：[2048](./2048/)

**类型**：数字合并益智游戏

**核心玩法**：
- 4x4棋盘滑动方块
- 相同数字合并（2+2=4）
- 目标合成2048

**特色功能**：
- 撤销功能
- 动画效果（缩放/脉冲）
- 视觉特效系统：
  - 三套主题（原色/暗黑/霓虹）
  - 粒子爆炸效果
  - 震动反馈
- 像素皮肤系统：
  - 双皮肤模式
  - Canvas像素绘制
  - 主题完美兼容
  - 智能缓存机制

**技术栈**：DOM操作 + CSS动画 + Canvas（像素绘制）

**运行**：`start src/2048/index.html`

---

## 项目结构

```
greedy-snake/
├── src/
│   ├── greedy-snake/        # 贪吃蛇游戏
│   │   ├── index.html
│   │   ├── style.css
│   │   └── game.js
│   ├── number-parkour/      # 数字跑酷游戏
│   │   ├── index.html
│   │   ├── style.css
│   │   └── game.js
│   └── 2048/                # 2048游戏
│       ├── index.html
│       ├── style.css
│       └── game.js
├── docs/
│   ├── guides/
│   │   └── learning.md      # Claude Code学习笔记
│   ├── greedy-snake/        # 贪吃蛇文档
│   ├── number-parkour/      # 数字跑酷文档
│   └── 2048/                # 2048文档
│       ├── effects/         # 视觉特效系统
│       └── pixel-skin/      # 像素皮肤系统
├── .claude/                 # Claude Code配置
│   ├── settings.json
│   ├── agents/
│   ├── skills/
│   └── output-styles/
└── CLAUDE.md                # 项目规则手册
```

## 技术特点

### 共性技术
- **纯前端**：无后端依赖
- **无框架**：原生JavaScript
- **无依赖**：不引入第三方库
- **Canvas绘图**：高性能渲染
- **LocalStorage**：本地数据存储
- **requestAnimationFrame**：流畅动画

### 各游戏特色
| 游戏 | 核心技术 | 特点 |
|------|----------|------|
| 贪吃蛇 | Canvas游戏循环 | 网格移动、道具系统 |
| 数字跑酷 | 缓动动画、动态平衡 | 运算逻辑、难度系统 |
| 2048 | DOM操作 + Canvas | 合并逻辑、特效系统 |

## 开发规范

### 代码风格
- 2空格缩进
- 驼峰命名（camelCase）
- 函数名动词开头
- const定义常量，let定义变量
- 语句末尾不加分号

### 命名约定
| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `currentScore`, `isGameOver` |
| 常量 | UPPER_SNAKE_CASE | `MAX_SNAKE_LENGTH`, `GRID_SIZE` |
| 函数 | camelCase, 动词开头 | `updateGame()`, `checkCollision()` |
| 类 | PascalCase | `Game2048`, `ThemeManager` |

### 文件组织
- 每个游戏独立目录
- HTML/CSS/JS分离
- 一个游戏一个文档目录

## 运行方式

### 启动游戏
```bash
# Windows
start src/{game-name}/index.html

# macOS/Linux
open src/{game-name}/index.html
```

### 本地开发
建议使用Live Server或类似工具：
- VS Code：安装Live Server插件
- 右键HTML文件 → "Open with Live Server"

## 数据存储

各游戏使用独立的LocalStorage键：
- 贪吃蛇：`snakeHighScore`
- 数字跑酷：`parkourHighScore`
- 2048：`2048HighScore`, `tileSkin`

## 学习资源

- [Claude Code学习笔记](./guides/learning.md)
- [项目规则手册](../CLAUDE.md)

---

**最后更新**：2026-01-28
**项目状态**：活跃开发中
