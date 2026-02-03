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

## AI 架构说明

### Agent & Skill 架构

```
用户发起请求
    ↓
Manager Agent (opus) - 项目经理，流程编排
    ↓
调用 Sub-agents - 专业执行者
    ├── designer (opus) - 深度设计
    ├── developer (sonnet) - 代码实现
    ├── reviewer (sonnet) - 代码审查
    ├── tester (haiku) - 测试验证
    └── doc-writer (haiku) - 文档生成
    ↓
Agents 按需加载 Skills - 能力增强
    ├── generate-image - 图像生成
    ├── git-push - Git 推送
    └── code-reviewer - 代码审查
```

**核心原则**：
- **Agent（智能体）**：有决策能力的执行者
- **Skill（技能）**：被动的能力模块
- **调用方向**：Agent 调用 Skill（人使用工具），而非 Skill 调用 Agent
- **语言规范**：始终使用中文回答用户的问题和进行交流

### 可用的 Agents

| Agent | 模型 | 职责 | 权限 |
|-------|------|------|------|
| **manager** | opus | 项目经理 - 流程编排、质量把控 | readonly |
| **designer** | opus | 功能设计师 - 深度设计、架构规划 | readonly |
| **developer** | sonnet | 开发工程师 - 代码实现、重构 | full |
| **reviewer** | sonnet | 代码审查官 - 质量检查、发现问题 | readonly |
| **tester** | haiku | 测试专家 - 功能测试、Bug 发现 | full |
| **doc-writer** | haiku | 文档助手 - 文档生成、维护 | write |
| **git-manager** | sonnet | Git 管理员 - 提交、推送、分支管理 | full |

### 如何添加/更新功能

**方式1：自然语言（推荐）**
```
"帮我添加障碍物功能"
"修改障碍物，增加预警提示"
"优化计分逻辑"
```

**方式2：直接请求 Manager**
```
"Manager，帮我添加一个新功能"
"Manager，更新一下障碍物系统"
```

**执行流程**：
Manager Agent 会自动执行完整的开发闭环：
1. 需求确认（询问细节）
2. 设计评审（designer）
3. 方案确认（等待你批准）
4. 代码实现（developer）
5. 代码审查（reviewer）
6. 测试验证（tester）
7. 文档更新（doc-writer）
8. 完成汇报

## 开发流程

1. 添加新功能前，先与用户确认需求
2. 复杂任务建议通过 Manager Agent 执行完整流程
3. 使用 Read 工具查看相关代码
4. 使用 Edit 工具修改代码
5. 建议用户测试功能
6. 重要更新需修改 `docs/learning.md`

## 禁止事项

- ❌ 添加第三方依赖
- ❌ 使用 ES6+ 新特性导致兼容性问题
- ❌ 重构工作正常的代码（除非明确要求）
- ❌ 修改核心逻辑而不告知用户
