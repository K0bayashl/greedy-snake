# Claude Code 学习笔记

## 📚 学习路线图

- [x] 第1课：Claude Code 基本使用
- [x] 第2课：常用命令与工具实践
- [x] 第3课：Hooks 自动化事件触发
- [x] 第4课：SubAgents AI 角色工程化
- [x] 第5课：Skills 标准操作流程
- [x] 第6课：MCP 连接外部真实系统
- [x] 第7课：Output Styles（系统提示词）

---

## 🎯 第1课：Claude Code 基本使用

### 核心概念

Claude Code 是 Anthropic 官方的 AI 编程助手，可以：
- ✅ 读取、编辑、创建文件
- ✅ 执行终端命令
- ✅ 搜索代码和文件
- ✅ 调用专门的 AI 代理处理复杂任务

### 已学习的工具

#### 1. Write 工具 - 创建文件
```
用途：创建新文件
参数：
  - file_path: 文件路径（绝对路径）
  - content: 文件内容
```

**示例**：创建了贪吃蛇项目的三个核心文件
- `index.html` - 页面结构
- `style.css` - 样式设计
- `game.js` - 游戏逻辑

#### 2. Glob 工具 - 查找文件
```
用途：按模式匹配查找文件
参数：
  - pattern: 匹配模式（如 **/*.js）
  - path: 搜索路径（可选）
```

**示例**：
- `**/*` - 查找所有文件
- `**/*.js` - 查找所有 JavaScript 文件
- `src/**/*.tsx` - 查找 src 目录下所有 TypeScript React 文件

#### 3. TodoWrite 工具 - 任务管理
```
用途：创建和管理任务列表
参数：
  - todos: 任务数组
    - content: 任务描述（命令式）
    - activeForm: 进行中的描述（进行时）
    - status: pending | in_progress | completed
```

**规则**：
- 同时只能有一个任务为 `in_progress`
- 完成任务后立即标记为 `completed`
- 可以动态添加新任务

---

## 🎯 第2课：常用命令与工具实践

### Claude Code 内置命令

| 命令 | 作用 | 使用场景 |
|------|------|---------|
| `/help` | 查看所有可用命令 | 忘记命令时 |
| `/model` | 切换 AI 模型 | 需要更快/更强的模型 |
| `/clear` | 清空当前对话 | 开始新任务，节省上下文 |
| `/tasks` | 查看运行中的后台任务 | 检查异步任务状态 |
| `/undo` | 撤销上一次文件修改 | 改错了需要回退 |

### 可用的 AI 模型

- **sonnet** (默认) - 平衡性能和速度
- **opus** - 最强大，适合复杂任务
- **haiku** - 最快速，适合简单任务

切换方法：`/model` 然后选择模型

### 核心工具详解

#### 1. Read 工具 - 读取文件
```
用途：读取文件内容（带行号）
参数：
  - file_path: 文件路径
  - offset: 起始行号（可选）
  - limit: 读取行数（可选）
```

**重要规则**：
- 使用 Edit 工具前必须先 Read 文件
- 返回内容带行号，格式：`行号→内容`
- 支持读取图片、PDF、Jupyter Notebook

#### 2. Edit 工具 - 精确修改文件
```
用途：字符串替换式编辑
参数：
  - file_path: 文件路径
  - old_string: 要替换的内容（必须完全匹配）
  - new_string: 新内容
  - replace_all: 是否替换所有匹配（默认 false）
```

**关键注意事项**：
- `old_string` 必须与文件内容**完全匹配**（包括空格、缩进）
- 不要包含 Read 工具返回的行号前缀
- 如果内容不唯一，要么提供更大的上下文，要么使用 `replace_all: true`

**实战示例**：添加游戏时长功能
1. 读取 `game.js`
2. 添加变量 `startTime` 和 `playTime`
3. 修改 `startGame()` 函数记录开始时间
4. 修改 `gameOver()` 函数显示用时

#### 3. Grep 工具 - 搜索代码内容
```
用途：在文件中搜索特定内容
参数：
  - pattern: 正则表达式模式
  - path: 搜索路径（可选）
  - glob: 文件类型过滤（如 "*.js"）
  - output_mode: 输出模式
    - "files_with_matches" - 只显示文件名（默认）
    - "content" - 显示匹配的行
    - "count" - 显示匹配次数
  - -i: 忽略大小写
  - -A/-B/-C: 显示上下文行
```

---

## 🎯 第3课：Hooks 自动化事件触发

### 什么是 Hooks？

**Hooks（钩子）** 是 Claude Code 的自动化机制，可以在特定事件发生时自动执行 Shell 命令。

### 核心概念

| Hook 类型 | 触发时机 | 常见用途 |
|-----------|----------|----------|
| `user-prompt-submit` | 用户发送消息时 | 显示 Git 状态、提醒注意事项 |
| `tool-use` | AI 调用工具时 | 权限检查、日志记录 |
| `edit-file` | 编辑文件时 | 代码格式化、语法检查 |
| `bash` | 执行 Bash 命令时 | 安全检查、命令审计 |

### 配置文件

**位置**：`.claude/settings.json`

**基本结构**：
```json
{
  "hooks": {
    "hook-name": {
      "command": "命令内容",
      "enabled": true/false
    }
  }
}
```

### 实战示例

#### 示例1：显示 Git 状态（已实现）
```json
{
  "hooks": {
    "user-prompt-submit": {
      "command": "git status -sb 2>nul",
      "enabled": true
    }
  }
}
```

#### 示例2：文件编辑后提醒格式化
```json
{
  "hooks": {
    "edit-file": {
      "command": "echo '📝 已编辑: {{file_path}}'",
      "enabled": true
    }
  }
}
```

#### 示例3：危险命令警告
```json
{
  "hooks": {
    "bash": {
      "command": "echo '⚠️ 执行: {{bash_command}}'",
      "enabled": true
    }
  }
}
```

### 可用变量

- `{{file_path}}` - 文件路径
- `{{bash_command}}` - Bash 命令
- `{{user_prompt}}` - 用户输入

### 权限配置

在 `settings.json` 中设置自动允许的命令类型：

```json
{
  "permissions": {
    "bash": {
      "allowedPrompts": [
        "查看文件",
        "运行 Git 命令",
        "读取文件内容"
      ]
    }
  }
}
```

### 配置详解

#### 基本配置

| 配置项 | 说明 |
|--------|------|
| 文件位置 | `.claude/settings.json` |
| 重启要求 | ❌ 不需要重启 |
| 生效时机 | 修改后立即生效 |

#### 配置结构

```json
{
  "hooks": {
    "user-prompt-submit": {
      "command": "命令内容",
      "enabled": true
    },
    "edit-file": {
      "command": "命令内容",
      "enabled": true
    },
    "bash": {
      "command": "命令内容",
      "enabled": true
    }
  }
}
```

#### 可用变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{file_path}}` | 文件路径 | `C:\project\src\game.js` |
| `{{bash_command}}` | Bash 命令 | `git status` |
| `{{user_prompt}}` | 用户输入 | 用户发送的消息内容 |

#### Windows 兼容性

**⚠️ 重点**：Windows 系统需要特殊处理

```bash
# 错误写法（Windows 会失败）
"command": "git status 2>/dev/null"

# 正确写法
"command": "git status -sb 2>nul"
```

#### 常见问题

| 问题 | 解决方案 |
|------|----------|
| Hook 没有执行 | 检查 `enabled` 是否为 `true` |
| 命令报错 | 检查 Windows 命令兼容性 |
| 变量不生效 | 确保变量名正确，用 `{{}}` 包裹 |

### 实战完成

✅ 已创建 `.claude/settings.json`
✅ 已创建 `hooks-guide.md` 详细指南
✅ 已初始化 Git 仓库
✅ 已提交首次代码

---

## 📖 第4课：SubAgents（已完成）

### 什么是 SubAgent？

SubAgent 是具有独立上下文和特定职责的 AI 代理。它们可以：
- 🧠 **独立思考** - 有独立的上下文和记忆
- 🎯 **专业分工** - 每个代理专注特定领域
- 🔒 **权限隔离** - 只能访问配置的工具
- 📋 **自定义行为** - 通过系统提示词定制

### 内置 Agent 类型

| Agent | 用途 | 工具权限 |
|-------|------|----------|
| `Explore` | 快速探索代码库 | 所有工具（除Task/ExitPlanMode） |
| `Plan` | 制定实施计划 | 所有工具（除Task/ExitPlanMode） |
| `Bash` | 执行命令专家 | Bash |
| `general-purpose` | 通用代理 | 全部工具 |
| `claude-code-guide` | Claude Code 帮助 | Glob, Grep, Read, WebFetch, WebSearch |

### 自定义 SubAgent

#### 创建位置
```
项目级：{project}/.claude/agents/{name}.md
用户级：~/.claude/agents/{name}.md
```

#### 文件格式
```markdown
---
name: developer
description: 开发工程师 - 实现新功能、重构代码
tools:
  - Read
  - Edit
  - Write
  - Bash
permissionMode: full
model: sonnet
---

# 开发工程师

你是一位专注于...（系统提示词内容）
```

#### YAML 字段说明

| 字段 | 说明 |
|------|------|
| `name` | Agent 标识符（调用时使用） |
| `description` | 简短描述 |
| `tools` | 允许使用的工具列表 |
| `permissionMode` | `readonly` 或 `full` |
| `model` | 使用的模型（`sonnet`/`opus`/`haiku`） |

### 调用方式

#### 方式1：自然语言描述
```
"让 developer 帮我添加道具系统"
"请 reviewer 审查一下 game.js"
```

#### 方式2：使用 Task 工具
```
Task(
  subagent_type="developer",
  prompt="添加道具功能"
)
```

### 上下文隔离机制

```
主对话
  │
  ├─> 调用 developer agent
  │     │
  │     └─> 独立上下文处理任务
  │           │
  │           └─> 返回结果给主对话
  │
  └─> 主对话只看到最终结果
```

**关键特性**：
- ✅ 每个 Agent 有独立的 token 预算
- ✅ 完成后只返回结果摘要
- ✅ 不会污染主对话的上下文
- ✅ 可通过 `agentId` 恢复之前的会话

### 实战：创建项目专属 Agent

#### 已创建的 5 个 Agent

| Agent | 文件 | 职责 |
|-------|------|------|
| `developer` | developer.md | 实现新功能、重构代码 |
| `reviewer` | reviewer.md | 代码审查、质量检查 |
| `designer` | designer.md | 设计玩法、优化体验 |
| `tester` | tester.md | 功能测试、发现 Bug |
| `doc-writer` | doc-writer.md | 维护文档、编写说明 |

#### 目录结构
```
.claude/
├── settings.json
└── agents/
    ├── developer.md
    ├── reviewer.md
    ├── designer.md
    ├── tester.md
    └── doc-writer.md
```

### 配置详解

#### 基本配置

| 配置项 | 说明 |
|--------|------|
| 文件位置 | `.claude/agents/{name}.md` |
| 重启要求 | ⚠️ **必须重启** Claude Code |
| 生效时机 | 重启后生效 |

#### 文件格式

**⚠️ 重点**：SubAgent 文件必须有 YAML frontmatter

```markdown
---
name: agent-name
description: 简短描述
tools:
  - Read
  - Edit
  - Write
permissionMode: full
model: sonnet
---

# 系统提示词内容
...
```

#### YAML 字段说明

| 字段 | 必填 | 说明 | 可选值 |
|------|------|------|--------|
| `name` | ✅ | Agent 标识符 | 任意字符串 |
| `description` | ✅ | 简短描述 | 任意字符串 |
| `tools` | ❌ | 允许使用的工具 | Read, Edit, Write, Bash, Grep, Glob... |
| `permissionMode` | ❌ | 权限模式 | `readonly`, `full` |
| `model` | ❌ | 使用的模型 | `sonnet`, `opus`, `haiku` |

#### 目录结构

```
.claude/
├── agents/
│   ├── developer.md
│   ├── reviewer.md
│   ├── designer.md
│   ├── tester.md
│   └── doc-writer.md
```

#### 调用方式

```
# 方式1：自然语言
"让 developer 帮我添加功能"

# 方式2：Task 工具
Task(subagent_type="developer", prompt="添加功能")
```

#### 常见问题

| 问题 | 解决方案 |
|------|----------|
| Agent not found | ⚠️ 重启 Claude Code |
| Agent 没有执行 | 检查 `name` 字段是否与调用名称一致 |
| 权限错误 | 检查 `permissionMode` 和 `tools` 配置 |

### 实战完成

✅ 已创建 5 个自定义 SubAgent
✅ 验证所有 Agent 可正常调用
✅ 理解上下文隔离机制
✅ 已创建 `subagent-guide.md` 详细指南
⚠️ **注意**：创建新 Agent 后需要重启 Claude Code

---

## 📖 第5课：Skills 标准操作流程（已完成）

### 什么是 Skills？

**Skills（技能）** 是可复用的标准操作流程（SOP）模板。与 SubAgent 不同：
- **SubAgent**：独立的 AI 代理，有完整上下文
- **Skills**：流程模板，在当前对话的上下文中执行

### 核心区别

| 特性 | SubAgent | Skills |
|------|----------|--------|
| 上下文 | 独立隔离 | 共享当前对话 |
| 调用方式 | Task 工具 | `/skills` 命令 |
| 适用场景 | 复杂独立任务 | 标准化流程 |
| Token 消耗 | 独立预算 | 共享当前对话 |

### 文件结构

**正确的目录结构**：
```
.claude/skills/
├── code-reviewer/
│   └── SKILL.md
├── change-summary/
│   └── SKILL.md
└── game-tester/
    └── SKILL.md
```

⚠️ **重要**：必须是 `{skill-name}/SKILL.md` 结构，不是 `{skill-name}.md`

### SKILL.md 文件格式

```markdown
---
name: code-reviewer
description: 代码审查 - 检查代码质量、发现潜在问题
user-invocable: true
context: fork
model: sonnet
allowed-tools:
  - Read
  - Grep
  - Glob
---

# 代码审查技能

你是一位代码审查专家...

## 工作流程
1. 阅读代码
2. 分析问题
3. 输出报告
```

### YAML 字段说明

| 字段 | 说明 |
|------|------|
| `name` | 技能标识符（调用时使用） |
| `description` | 简短描述 |
| `user-invocable` | 是否可由用户直接调用（`true`/`false`） |
| `context` | 执行上下文：`fork`（新上下文）或 `current`（当前对话） |
| `model` | 使用的模型（`sonnet`/`opus`/`haiku`） |
| `allowed-tools` | 允许使用的工具列表 |

### 调用方式

#### 方式1：斜杠命令
```
/skills
```
然后选择可用的技能。

#### 方式2：自然语言
```
"用 code-reviewer 技能审查一下 game.js"
"调用 change-summary 生成变更摘要"
```

#### 方式3：Skill 工具
```
Skill(skill="code-reviewer", args="game.js")
```

### 实战：创建项目 Skills

#### 已创建的 3 个 Skills

| Skill | 目录 | 用途 |
|-------|------|------|
| `code-reviewer` | code-reviewer/SKILL.md | 代码质量审查 |
| `change-summary` | change-summary/SKILL.md | 生成 Git 变更摘要 |
| `game-tester` | game-tester/SKILL.md | 游戏功能测试 |

### Skills vs Hooks

| 特性 | Hooks | Skills |
|------|-------|--------|
| 触发方式 | 自动（事件驱动） | 手动调用 |
| 执行时机 | 特定事件发生时 | 用户显式调用 |
| 典型用途 | 提醒、校验、格式化 | 标准化流程 |

**示例**：
- **Hooks**：编辑文件后自动运行 Prettier
- **Skills**：用户主动调用代码审查流程

### 配置详解

#### 基本配置

| 配置项 | 说明 |
|--------|------|
| 文件位置 | `.claude/skills/{skill-name}/SKILL.md` |
| 重启要求 | ⚠️ **必须重启** Claude Code |
| 生效时机 | 重启后生效 |

#### 文件结构

**⚠️ 重点**：必须是 `{skill-name}/SKILL.md` 结构

```
.claude/skills/
├── code-reviewer/
│   └── SKILL.md
├── change-summary/
│   └── SKILL.md
└── game-tester/
    └── SKILL.md
```

#### SKILL.md 文件格式

```markdown
---
name: skill-name
description: 简短描述
user-invocable: true
context: fork
model: sonnet
allowed-tools:
  - Read
  - Grep
  - Glob
  - Task
---

# 技能内容
...
```

#### YAML 字段说明

| 字段 | 必填 | 说明 | 可选值 |
|------|------|------|--------|
| `name` | ✅ | 技能标识符 | 任意字符串 |
| `description` | ✅ | 简短描述 | 任意字符串 |
| `user-invocable` | ❌ | 用户是否可直接调用 | `true`, `false` |
| `context` | ❌ | 执行上下文 | `fork`, `current` |
| `model` | ❌ | 使用的模型 | `sonnet`, `opus`, `haiku` |
| `allowed-tools` | ❌ | 允许使用的工具 | Read, Edit, Write, Task... |

#### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| no skills found | 文件名错误 | 必须是 `SKILL.md`，不是 `{name}.md` |
| 目录结构不对 | 单文件不是文件夹 | 创建 `{name}/SKILL.md` 结构 |
| Skill 不生效 | ⚠️ 没有重启 | 重启 Claude Code |

#### 调用方式

```
# 方式1：斜杠命令
/skills

# 方式2：自然语言
"用 code-reviewer 技能审查代码"

# 方式3：Skill 工具
Skill(skill="code-reviewer", args="game.js")
```

### 实战完成

✅ 已创建 3 个自定义 Skills
✅ 理解 Skills 与 SubAgent 的区别
✅ 掌握正确的文件夹结构
⚠️ **注意**：创建 Skills 后需重启 Claude Code

---

## 📖 第6课：MCP 连接外部真实系统

### 什么是 MCP？

**MCP (Model Context Protocol)** 是一种开放协议，让 AI 助手能够连接外部系统。

### 核心概念

```
┌─────────────────────────────────────────────────────────┐
│                    没有 MCP 的情况                        │
├─────────────────────────────────────────────────────────┤
│  Claude Code                                             │
│  │                                                       │
│  └─> 只能访问本地文件系统                                │
│      无法连接数据库、API、第三方服务                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    有 MCP 的情况                          │
├─────────────────────────────────────────────────────────┤
│  Claude Code                                             │
│  │                                                       │
│  ├─> MCP Server 1 ──> PostgreSQL 数据库                │
│  ├─> MCP Server 2 ──> GitHub API                        │
│  ├─> MCP Server 3 ──> Google Drive                     │
│  └─> MCP Server 4 ──> 自定义服务                        │
└─────────────────────────────────────────────────────────┘
```

### MCP 的价值

| 能力 | 没有 MCP | 有 MCP |
|------|----------|--------|
| 读写本地文件 | ✅ | ✅ |
| 执行终端命令 | ✅ | ✅ |
| 搜索代码 | ✅ | ✅ |
| 读取数据库 | ❌ | ✅ |
| 调用 API | ❌ | ✅ |
| 访问云服务 | ❌ | ✅ |
| 获取实时数据 | ❌ | ✅ |

### 架构组成

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│ Claude Code    │─────>│ MCP Client     │─────>│ MCP Server     │
│ (Host)         │      │ (内置)         │      │ (外部进程)     │
└────────────────┘      └────────────────┘      └────────────────┘
                                                       │
                                                       ▼
                                                ┌────────────────┐
                                                │ 外部资源       │
                                                │ - 数据库       │
                                                │ - API          │
                                                │ - 文件系统     │
                                                └────────────────┘
```

### MCP Server 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **官方** | Claude Code 官方维护 | `@modelcontextprotocol/server-filesystem` |
| **社区** | 社区贡献的服务器 | `@modelcontextprotocol/server-github` |
| **自定义** | 你自己写的 | 连接公司内部系统 |

### 配置文件位置

```
项目级：.claude/settings.json
用户级：~/.claude/settings.json
```

### 基本配置格式

```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

### 常用 MCP Servers

| MCP Server | 功能 | 用途 |
|------------|------|------|
| `server-filesystem` | 文件系统访问 | 限制 Claude 只能访问特定目录 |
| `server-github` | GitHub 集成 | 读取仓库、创建 Issue、提交 PR |
| `server-postgres` | PostgreSQL | 直接查询数据库 |
| `server-brave-search` | 网页搜索 | 实时搜索网络信息 |
| `server-puppeteer` | 浏览器自动化 | 自动化测试、截图 |

### 配置示例

#### 示例1：GitHub MCP
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "gh_xxx"
      }
    }
  }
}
```

#### 示例2：PostgreSQL MCP
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/db"
      }
    }
  }
}
```

### 工作流程

```
1. 你在 settings.json 配置 MCP 服务器
   │
2. 重启 Claude Code（加载配置）
   │
3. 你给 Claude 任务
   │
4. Claude 自动判断是否需要调用 MCP
   │
5. 调用 MCP 完成任务
```

### 实战：贪吃蛇项目的 MCP 需求

| MCP 服务 | 优先级 | 用途 |
|----------|--------|------|
| **Chrome DevTools** | 🔴 高 | 调试游戏、自动化测试（本地已有） |
| **Brave Search** | 🟡 中 | 查游戏开发资料、Bug 解决方案 |
| **GitHub** | 🟢 低 | 开源后管理仓库 |
| **PostgreSQL** | ⚪ 可选 | 做在线排行榜时用 |

### 配置详解

#### 基本配置

| 配置项 | 说明 |
|--------|------|
| 文件位置 | `.claude/settings.json` 或 `.claude/settings.local.json` |
| 重启要求 | ⚠️ **必须重启** Claude Code |
| 生效时机 | 重启后生效 |

#### 配置结构

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@package-name"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

#### YAML 字段说明

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `command` | ✅ | 执行命令 | `npx`, `node` |
| `args` | ✅ | 命令参数 | `["-y", "@package"]` |
| `env` | ❌ | 环境变量 | API keys, 连接字符串 |

#### 配置位置

```
项目级：.claude/settings.json
用户级：~/.claude/settings.json
```

#### 常用 MCP Servers

| MCP Server | 安装命令 | 用途 |
|------------|----------|------|
| `server-filesystem` | `npx @modelcontextprotocol/server-filesystem` | 限制访问目录 |
| `server-github` | `npx @modelcontextprotocol/server-github` | GitHub 集成 |
| `server-postgres` | `npx @modelcontextprotocol/server-postgres` | PostgreSQL 数据库 |
| `server-brave-search` | `npx @modelcontextprotocol/server-brave-search` | 网页搜索 |

#### 配置示例

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxx"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/db"
      }
    }
  }
}
```

#### 常见问题

| 问题 | 解决方案 |
|------|----------|
| MCP Server 不启动 | 检查 `command` 和 `args` 是否正确 |
| 连接失败 | 检查 `env` 环境变量是否配置 |
| ⚠️ 没有重启 | 重启 Claude Code |

### 实战完成

✅ 理解 MCP 的核心概念
✅ 了解 MCP 架构和工作原理
✅ 掌握基本配置格式
⚠️ **注意**：配置 MCP 后需重启 Claude Code

---

## 📖 第7课：Output Styles（系统提示词）

### 什么是 Output Styles？

**Output Styles** 通过修改 Claude Code 的 **system prompt**，把 Claude Code 变成不同类型的 Agent。

```
不是简单的 "输出风格"，而是 "角色 + 行为 + 交互契约" 的完整重塑
```

### 三种内置风格

| 风格 | 特点 | 适用场景 |
|------|------|----------|
| **Default（默认）** | 偏执行、高效、落地 | 日常开发 |
| **Explanatory（讲解型）** | 插入教育性 Insights | 理解代码库、学习实现选择 |
| **Learning（共学型）** | 插入 `TODO(human)` 让你参与 | 结对编程、训练手感 |

### 使用方式

#### 方式1：命令切换
```
/output-style explanatory
```

#### 方式2：配置文件
```json
// .claude/settings.local.json
{
  "outputStyle": "explanatory"
}
```

### 自定义 Output Style

#### 文件位置
```
项目级：.claude/output-styles/
用户级：~/.claude/output-styles/
```

#### 文件格式
```markdown
---
name: Game Developer
description: 贪吃蛇游戏开发专家
keep-coding-instructions: true
---

# 游戏开发助手

你是贪吃蛇游戏的开发专家。

## 行为规则
- 修改代码前先 Read 文件
- 重要功能完成后更新文档
- 保持代码简洁，不添加依赖
```

#### 关键字段

| 字段 | 说明 |
|------|------|
| `name` | 显示名称 |
| `description` | 在 `/output-style` UI 中展示 |
| `keep-coding-instructions` | 是否保留编码习惯（默认 `false`） |

### keep-coding-instructions 的作用

```
true  → 保留工程师习惯（运行测试、验证、谨慎执行）
false → 切换到非工程师角色（更偏文档/决策/模板）
```

### 易混淆点对照

| 能力 | 作用位置 | 影响范围 | 用途 |
|------|----------|----------|------|
| **Output Styles** | System Prompt（主对话） | 整体角色、语气、输出契约 | 切换身份（产品/运维/写作） |
| **CLAUDE.md** | User Message | 项目级约束 | 项目规范、目录结构 |
| **Subagents** | 子 agent | 任务分工、能力隔离 | 专业任务、自动化流程 |
| **Skills** | 触发指令 | 单次流程 | 标准化操作流程 |

### 实战：为贪吃蛇创建 Output Style

```markdown
---
name: Snake Game Dev
description: 贪吃蛇游戏开发专家
keep-coding-instructions: true
---

# 游戏开发助手

你是贪吃蛇游戏的开发专家。

## 项目背景
- 纯前端游戏，使用 Canvas API
- 已实现：基础游戏、难度选择、双倍分数食物
- 不使用框架和第三方库

## 代码风格
- 2 空格缩进
- 驼峰命名
- 函数名以动词开头

## 工作流程
1. 修改代码前先 Read 文件
2. 修改后说明变更内容
3. 重要功能完成后更新 learning.md

## 回复规范
- 用中文回复
- 不添加 emoji
- 简洁明确
```

### 配置详解

#### 基本配置

| 配置项 | 说明 |
|--------|------|
| 文件位置 | `.claude/output-styles/{name}.md` 或 `~/.claude/output-styles/{name}.md` |
| 重启要求 | ⚠️ **必须重启** Claude Code |
| 生效时机 | 重启后生效 |
| 激活方式 | `/output-style {name}` 或配置 `settings.local.json` |

#### 文件格式

**⚠️ 重点**：Output Style 文件必须有 YAML frontmatter

```markdown
---
name: Display Name
description: 简短描述
keep-coding-instructions: true
---

# 以下为自定义的 system prompt 内容
```

#### YAML 字段说明

| 字段 | 必填 | 说明 | 可选值 |
|------|------|------|--------|
| `name` | ✅ | 显示名称 | 任意字符串 |
| `description` | ✅ | 简短描述 | 在 UI 列表中展示 |
| `keep-coding-instructions` | ❌ | 是否保留编码习惯 | `true`, `false`（默认 false） |

#### keep-coding-instructions 详解

**⚠️ 重点**：这个字段决定了 Claude 是否保持"工程师身份"

| 值 | 行为特征 | 适用场景 |
|----|----------|----------|
| `true` | 保留编码习惯：运行测试、验证代码、谨慎执行 | 技术角色：架构师、开发者、测试 |
| `false` | 非工程师角色：偏文档、决策、模板 | 非技术角色：产品经理、运维、文档写作 |

#### 目录结构

```
.claude/
├── output-styles/
│   ├── snake-game-dev.md
│   ├── product-manager.md
│   └── code-reviewer.md
```

#### 激活方式

**方式1：命令切换**
```
/output-style snake-game-dev
```

**方式2：配置文件默认**
```json
// .claude/settings.local.json
{
  "outputStyle": "snake-game-dev"
}
```

#### 常见问题

| 问题 | 解决方案 |
|------|----------|
| Output Style 不出现在列表中 | ⚠️ 重启 Claude Code |
| YAML frontmatter 格式错误 | 检查 `---` 是否成对，字段是否正确 |
| Claude 行为不符合预期 | 检查 `keep-coding-instructions` 设置 |

### 实战完成

✅ 理解 Output Styles 的真正作用
✅ 掌握三种内置风格的使用
✅ 了解如何自定义 Output Style
✅ 区分 Output Styles、CLAUDE.md、Subagents、Skills

---

## 🔗 七门课串联：完整工作流

### 概念关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Claude Code 体系                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ Output Styles   │    │   CLAUDE.md     │                    │
│  │ (我是谁？)      │    │  (项目规则)     │                    │
│  │ - 产品经理      │    │  - 代码风格     │                    │
│  │ - 工程师        │    │  - 目录结构     │                    │
│  │ - 运维专家      │    │  - 约束条件     │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      ▼                                          │
│              ┌───────────────┐                                  │
│              │   主对话      │                                  │
│              │   (You)       │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│           ┌──────────┼──────────┐                              │
│           ▼          ▼          ▼                              │
│    ┌──────────┐ ┌─────────┐ ┌─────────┐                        │
│    │  Skills  │ │  Hooks  │ │   MCP   │                        │
│    │(流程模板)│ │(自动触发)│ │(外部连接)│                        │
│    └─────┬────┘ └────┬────┘ └────┬────┘                        │
│          │           │           │                              │
│          ▼           │           │                              │
│    ┌─────────┐       │           │                              │
│    │SubAgent │       │           │                              │
│    │(专业分工)│       │           │                              │
│    └─────────┘       │           │                              │
│                      │           │                              │
│                      ▼           ▼                              │
│                 ┌────────────────┐                             │
│                 │   完成任务     │                             │
│                 └────────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 一句话总结

| 概念 | 一句话描述 |
|------|-----------|
| **Output Styles** | 赋予你的角色（我是谁？） |
| **CLAUDE.md** | 定制规则手册（项目有什么规则？） |
| **Skills** | 调用后判断是否用 SubAgent 按步骤完成任务 |
| **Hooks** | 固定行为前后自动触发 |
| **MCP** | 按需自动调用，连接外部系统 |
| **SubAgents** | 独立上下文的专业代理 |
| **基本工具** | Read、Edit、Write、Grep、Glob |

### 完整工作流示例

```
场景：你想测试游戏功能

┌─────────────────────────────────────────────────────────────┐
│ 1. Output Styles 生效                                        │
│    "你是游戏开发专家"                                         │
└─────────────────────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────────┐
│ 2. CLAUDE.md 加载                                            │
│    遵循项目规范：2 空格缩进、驼峰命名、不使用第三方库        │
└─────────────────────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────────┐
│ 3. Hooks 自动触发                                            │
│    你发消息 → 自动显示 Git 状态                              │
└─────────────────────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────────┐
│ 4. 你说："用 game-tester 测试游戏"                           │
└─────────────────────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────────┐
│ 5. Skills 执行                                               │
│    读取 game-tester/SKILL.md                                 │
│    评估任务复杂度 → 判断需要浏览器测试                       │
└─────────────────────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────────┐
│ 6. 调用 SubAgent                                             │
│    Task(subagent_type="tester", prompt="测试游戏")          │
└─────────────────────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────────┐
│ 7. SubAgent 调用 MCP                                         │
│    需要 Chrome DevTools → 调用 chrome-devtools MCP           │
└─────────────────────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────────┐
│ 8. 返回结果                                                  │
│    SubAgent → Skills → 你（收到测试报告）                   │
└─────────────────────────────────────────────────────────────┘
```

### 决策树

```
收到任务
    │
    ├─> 需要外部资源？
    │       ├─ 是 → 调用 MCP
    │       └─ 否 → 继续
    │
    ├─> 是标准化流程？
    │       ├─ 是 → 调用 Skills
    │       │      │
    │       │      └─> 复杂？
    │       │             ├─ 是 → 调用 SubAgent
    │       │             └─ 否 → 自己完成
    │       └─ 否 → 继续
    │
    └─> 自己完成
```

### 易混淆点对照

| 问题 | 答案 |
|------|------|
| Output Styles 影响 SubAgent 吗？ | ❌ 不影响，SubAgent 有独立 system prompt |
| Skills 和 SubAgent 有什么区别？ | Skills 共享当前对话，SubAgent 独立上下文 |
| Hooks 和 Skills 有什么区别？ | Hooks 自动触发，Skills 手动调用 |
| MCP 只在困难时调用吗？ | ❌ 按需调用，不一定是困难 |
| CLAUDE.md 和 Output Styles 哪个优先？ | Output Styles 决定身份，CLAUDE.md 补充项目规则 |

---

## 🎓 七门课全部完成！

你现在掌握的 Claude Code 技能：

| 课 | 内容 | 状态 |
|----|------|------|
| 第1课 | 基本工具使用 | ✅ |
| 第2课 | 常用命令与工具 | ✅ |
| 第3课 | Hooks 自动化 | ✅ |
| 第4课 | SubAgents AI 角色工程化 | ✅ |
| 第5课 | Skills 标准流程 | ✅ |
| 第6课 | MCP 外部连接 | ✅ |
| 第7课 | Output Styles | ✅ |
| **综合** | 七门课串联 | ✅ |

---

## 🛠️ 实用工作流程

### 典型的修改代码流程

1. **搜索相关文件**
   ```
   使用 Glob: **/*.js
   ```

2. **搜索特定功能**
   ```
   使用 Grep: pattern="function gameOver"
   ```

3. **读取文件**
   ```
   使用 Read: file_path="C:\...\game.js"
   ```

4. **修改代码**
   ```
   使用 Edit: 提供 old_string 和 new_string
   ```

5. **验证修改**
   ```
   使用 Read 再次查看，或运行测试
   ```

### 如何高效提问

❌ **不好的提问**：
- "帮我改一下代码"
- "优化性能"

✅ **好的提问**：
- "给游戏添加难度选择功能，有简单、普通、困难三个等级"
- "在 game.js 的 gameOver 函数中添加游戏时长统计"
- "搜索所有使用 localStorage 的地方"

---

## 📦 当前项目信息

### 项目名称：贪吃蛇游戏

### 技术栈
- 纯前端（HTML + CSS + JavaScript）
- Canvas API 绘图
- LocalStorage 存储最高分

### 文件结构
```
greedy-snake/
├── index.html         # 页面结构
├── style.css          # 样式设计
├── game.js            # 游戏逻辑
├── learning.md        # 学习笔记（本文件）
├── features.md        # 功能说明文档
├── hooks-guide.md     # Hooks 使用指南
├── subagent-guide.md  # SubAgent 使用指南
└── .claude/
    ├── settings.json  # Claude Code 配置
    ├── agents/        # 自定义 Agent 定义
    │   ├── developer.md
    │   ├── reviewer.md
    │   ├── designer.md
    │   ├── tester.md
    │   └── doc-writer.md
    └── skills/        # 自定义 Skills 定义
        ├── code-reviewer/
        │   └── SKILL.md
        ├── change-summary/
        │   └── SKILL.md
        └── game-tester/
            └── SKILL.md
```

### 已实现功能
- ✅ 基础游戏逻辑（移动、吃食物、碰撞检测）
- ✅ 得分系统
- ✅ 最高分记录（LocalStorage）
- ✅ 游戏时长统计
- ✅ 暂停/继续
- ✅ 重新开始
- ✅ 难度选择（简单/普通/困难）
- ✅ 双倍分数食物（金色食物，限时6秒，闪烁动画）
- ✅ 动态障碍物系统（定期刷新，闪烁警告，安全区保护）
- ✅ 无敌道具（蓝色星星，5秒无敌，穿墙+避障）
- ✅ 卡通外观系统（搞怪滑稽表情，圆形渐变蛇身）

### 运行方式
```bash
# 在命令行执行
start index.html

# 或直接用浏览器打开
C:\workspace4idea\greedy-snake\greedy-snake\index.html
```

---

## 💡 学习建议

1. **边学边练**：每学一个工具就立即尝试使用
2. **看懂工具调用**：观察 Claude 如何使用工具，学习最佳实践
3. **提出问题**：不理解就问，Claude 会详细解释
4. **实际应用**：在真实项目中使用这些技能
5. **保存笔记**：重要的命令和技巧记录下来

---

## 📌 快速参考

### 最常用的 5 个工具
1. `Read` - 读文件
2. `Edit` - 改文件
3. `Write` - 写文件
4. `Grep` - 搜内容
5. `Glob` - 找文件

### 最常用的 5 个命令
1. `/help` - 帮助
2. `/model` - 切换模型
3. `/undo` - 撤销修改
4. `/clear` - 清空对话
5. `/tasks` - 查看任务

---

## 🔗 有用资源

- Claude Code GitHub: https://github.com/anthropics/claude-code
- 报告问题: https://github.com/anthropics/claude-code/issues

---

**最后更新**：2026-01-23
**当前进度**：七门课全部完成！🎉

**最新功能**：卡通外观系统 - 搞怪滑稽表情，圆形渐变蛇身

**已创建组件**：
- 5 个 SubAgent（developer, reviewer, designer, tester, doc-writer）
- 3 个 Skills（code-reviewer, change-summary, game-tester）

**掌握技能**：
- ✅ 基本工具使用（Read、Edit、Write、Grep、Glob）
- ✅ 内置命令（/help、/model、/clear、/tasks）
- ✅ Hooks 自动化
- ✅ SubAgents 专业分工
- ✅ Skills 标准流程
- ✅ MCP 外部连接
- ✅ Output Styles 身份切换