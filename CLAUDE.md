# 项目规则手册

## 项目概述

这是一个纯前端项目。

## 技术约束

- **纯前端**：不使用后端服务
- **无框架**：纯 JavaScript，不使用 React/Vue 等
- **无依赖**：不引入第三方库
- **浏览器兼容**：支持现代浏览器

## 代码规范

### JavaScript

```javascript
// 好的示例
function updateData(data) {
  currentData = data
  updateDisplay()
}

const DEFAULT_VALUE = 100
let isActive = true

// 不好的示例
function update(d){data=d}
var value=100
```

- 使用 `const` 定义常量
- 使用 `let` 定义变量（不使用 `var`）
- 函数名使用动词开头：`updateScore()`, `drawGame()`, `checkCollision()`
- 语句末尾不加分号

### 命名约定

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `currentUser`, `isLoading` |
| 常量 | UPPER_SNAKE_CASE | `MAX_SIZE`, `API_URL` |
| 函数 | camelCase, 动词开头 | `getData()`, `renderList()` |
| 类 | PascalCase | `GameManager`, `UserStore` |

## 目录结构

```
project/
├── src/                      # 源代码目录
├── docs/                     # 文档目录
│   └── learning.md          # Claude Code 学习笔记
├── .claude/                  # Claude Code 配置
│   ├── settings.json        # 项目配置
│   ├── settings.local.json  # 本地配置
│   ├── agents/              # 自定义 SubAgents
│   ├── skills/              # 自定义 Skills
│   └── output-styles/       # 自定义 Output Styles
├── CLAUDE.md                 # 本文件（项目规则手册）
└── .idea/                    # IDE 配置目录
```

## 开发流程

1. 添加新功能前，先与用户确认需求
2. 准备调用 `add-feature` 或 `update-feature` Skill 前，**必须**先询问用户确认
3. 使用 Read 工具查看相关代码
4. 使用 Edit 工具修改代码
5. 建议用户测试功能
6. 重要更新需修改 `docs/learning.md`

## 禁止事项

- ❌ 添加第三方依赖
- ❌ 使用 ES6+ 新特性导致兼容性问题
- ❌ 重构工作正常的代码（除非明确要求）
- ❌ 修改核心逻辑而不告知用户
