# Claude Code Skills 配置指南

## 📌 什么是 Skills？

Skills 是可复用的标准操作流程（SOP）模板，允许你将常见的任务流程封装成可重复使用的技能。

## 🔧 配置文件位置

`.claude/skills/{skill-name}/SKILL.md`

## 📝 基本文件结构

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

## 📝 SKILL.md 文件格式

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

## 🎨 YAML 字段说明

| 字段 | 说明 | 必填 | 可选值 |
|------|------|------|--------|
| `name` | 技能标识符（调用时使用） | ✅ | 任意字符串 |
| `description` | 简短描述 | ✅ | 任意字符串 |
| `user-invocable` | 是否可由用户直接调用 | ❌ | `true`/`false`（默认 true） |
| `context` | 执行上下文 | ❌ | `fork`（新上下文）/ `current`（当前对话） |
| `model` | 使用的模型 | ❌ | `sonnet`/`opus`/`haiku` |
| `allowed-tools` | 允许使用的工具列表 | ❌ | 工具名称数组 |

## 🎯 Skills vs SubAgents

| 特性 | SubAgent | Skills |
|------|----------|--------|
| 上下文 | 独立隔离 | 共享当前对话或 fork 新上下文 |
| 调用方式 | Task 工具 | `/skills` 命令或自然语言 |
| 适用场景 | 复杂独立任务 | 标准化流程 |
| Token 消耗 | 独立预算 | 可配置 |
| 配置位置 | `.claude/agents/` | `.claude/skills/` |

## 🚀 调用方式

### 方式1：斜杠命令
```
/skills
```
然后选择可用的技能。

### 方式2：自然语言
```
"用 code-reviewer 技能审查一下 game.js"
"调用 change-summary 生成变更摘要"
"请使用 game-tester 测试游戏功能"
```

### 方式3：Skill 工具
```
Skill(skill="code-reviewer", args="game.js")
```

## 💡 实用 Skill 示例

### 示例1：代码审查 Skill
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

你是一位经验丰富的代码审查专家。

## 审查流程
1. 读取指定的代码文件
2. 检查代码质量、可读性、性能问题
3. 识别潜在的 bug 和安全漏洞
4. 提供改进建议

## 输出格式
- 📋 问题列表（按严重程度排序）
- 💡 改进建议
- ✅ 代码亮点（如果有）
```

### 示例2：Git 变更摘要 Skill
```markdown
---
name: change-summary
description: 生成 Git 变更摘要 - 总结代码修改内容
user-invocable: true
context: current
model: haiku
allowed-tools:
  - Bash
---

# Git 变更摘要技能

你是一位 Git 专家，擅长总结代码变更。

## 工作流程
1. 运行 `git diff` 查看未提交的变更
2. 运行 `git log -n 5` 查看最近的提交
3. 分析变更的类型和影响
4. 生成简洁的变更摘要

## 输出格式
- 📝 变更文件列表
- 🔍 主要修改内容
- 📊 变更统计
```

### 示例3：游戏测试 Skill
```markdown
---
name: game-tester
description: 游戏功能测试 - 验证游戏逻辑和功能
user-invocable: true
context: fork
model: sonnet
allowed-tools:
  - Read
  - Glob
  - Bash
---

# 游戏测试技能

你是一位专业的游戏测试工程师。

## 测试流程
1. 读取游戏代码（index.html, style.css, game.js）
2. 分析游戏功能和逻辑
3. 识别潜在的功能缺陷
4. 测试边界情况和异常处理
5. 提供测试报告

## 测试要点
- 游戏核心逻辑
- 用户交互
- 性能表现
- 兼容性
```

### 示例4：代码格式化 Skill
```markdown
---
name: code-formatter
description: 代码格式化 - 自动格式化代码文件
user-invocable: true
context: current
model: haiku
allowed-tools:
  - Read
  - Edit
  - Bash
---

# 代码格式化技能

你是一位代码格式化专家。

## 支持的语言
- JavaScript
- HTML
- CSS
- JSON

## 格式化规则
- 使用 2 空格缩进
- 统一引号风格（单引号）
- 移除尾随空格
- 适当添加空行分隔逻辑块

## 执行流程
1. 读取目标文件
2. 应用格式化规则
3. 修改文件
4. 报告修改内容
```

## ⚙️ 配置详解

### 基本配置

| 配置项 | 说明 |
|--------|------|
| 文件位置 | `.claude/skills/{skill-name}/SKILL.md` |
| 重启要求 | ⚠️ **必须重启** Claude Code |
| 生效时机 | 重启后生效 |

### 配置结构

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

### SKILL.md 文件格式

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

### YAML 字段说明

| 字段 | 必填 | 说明 | 可选值 |
|------|------|------|--------|
| `name` | ✅ | 技能标识符 | 任意字符串 |
| `description` | ✅ | 简短描述 | 任意字符串 |
| `user-invocable` | ❌ | 用户是否可直接调用 | `true`, `false` |
| `context` | ❌ | 执行上下文 | `fork`, `current` |
| `model` | ❌ | 使用的模型 | `sonnet`, `opus`, `haiku` |
| `allowed-tools` | ❌ | 允许使用的工具 | Read, Edit, Write, Task... |

### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| no skills found | 文件名错误 | 必须是 `SKILL.md`，不是 `{name}.md` |
| 目录结构不对 | 单文件不是文件夹 | 创建 `{name}/SKILL.md` 结构 |
| Skill 不生效 | ⚠️ 没有重启 | 重启 Claude Code |

### 调用方式

```
# 方式1：斜杠命令
/skills

# 方式2：自然语言
"用 code-reviewer 技能审查代码"

# 方式3：Skill 工具
Skill(skill="code-reviewer", args="game.js")
```

## 🎨 上下文模式说明

### `context: fork`（推荐用于复杂任务）
- 创建新的独立上下文
- 不污染当前对话
- 适合需要大量 token 的任务
- 独立的工具权限和预算

### `context: current`（推荐用于快速任务）
- 在当前对话上下文中执行
- 共享对话历史
- 适合快速的小任务
- 更节省 token

## 🛠️ 工具权限配置

`allowed-tools` 字段限制 Skill 可以使用的工具：

```yaml
allowed-tools:
  - Read      # 读取文件
  - Edit      # 编辑文件
  - Write     # 创建文件
  - Bash      # 执行命令
  - Grep      # 搜索内容
  - Glob      # 查找文件
  - Task      # 调用 SubAgent
  - Skill     # 调用其他 Skill
  - WebFetch  # 获取网页内容
  - WebSearch # 网页搜索
```

如果省略 `allowed-tools`，Skill 可以使用所有可用工具。

## 🎓 最佳实践

1. **命名规范**：使用小写字母和连字符，如 `code-reviewer`
2. **描述清晰**：description 应该简洁明了，说明技能用途
3. **合理选择上下文**：复杂任务用 `fork`，简单任务用 `current`
4. **限制工具权限**：只授予必要的工具，提高安全性
5. **编写详细说明**：在 Markdown 部分清晰说明工作流程
6. **测试技能**：创建后立即测试，确保按预期工作
7. **版本控制**：将 `.claude/skills/` 加入 Git 版本控制

## 🔍 调试 Skills

如果 Skill 没有按预期工作：

1. **检查文件结构**：确保是 `{skill-name}/SKILL.md` 格式
2. **验证 YAML 语法**：YAML frontmatter 必须正确
3. **检查字段拼写**：确保所有字段名正确（如 `user-invocable` 不是 `userInvocable`）
4. **测试调用方式**：尝试不同的调用方式（命令、自然语言）
5. **查看错误日志**：注意终端或界面中的错误信息
6. **重启 Claude Code**：创建新 Skill 后可能需要重启

## 📚 Skills vs Hooks 对比

| 特性 | Hooks | Skills |
|------|-------|--------|
| 触发方式 | 自动（事件驱动） | 手动调用 |
| 执行时机 | 特定事件发生时 | 用户显式调用 |
| 配置位置 | `.claude/settings.json` | `.claude/skills/{name}/SKILL.md` |
| 典型用途 | 提醒、校验、格式化 | 标准化流程、复杂任务 |

**何时使用 Hooks**：
- 需要自动触发
- 简单的提醒或检查
- 事件响应

**何时使用 Skills**：
- 需要手动调用
- 复杂的多步骤流程
- 可复用的任务模板

## 🚫 常见错误

### 错误1：文件结构错误
❌ 错误：
```
.claude/skills/code-reviewer.md
```

✅ 正确：
```
.claude/skills/code-reviewer/SKILL.md
```

### 错误2：YAML 格式错误
❌ 错误：
```yaml
name: code-reviewer
description: 代码审查
user-invocable: true
```

✅ 正确（必须有 `---` 分隔符）：
```yaml
---
name: code-reviewer
description: 代码审查
user-invocable: true
---
```

### 错误3：字段名错误
❌ 错误：
```yaml
userInvocable: true  # 错误：应该是 user-invocable
```

✅ 正确：
```yaml
user-invocable: true
```

## 📚 下一步

尝试创建你自己的 Skills：
- 代码格式化工具
- 测试报告生成器
- 文档更新助手
- 代码迁移助手
- 性能分析工具

---

**更新日期**：2026-01-23