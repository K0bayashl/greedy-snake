# Claude Code 学习笔记

## 📚 学习路线图

- [x] 第1课：Claude Code 基本使用
- [x] 第2课：常用命令与工具实践
- [x] 第3课：Hooks 自动化事件触发
- [ ] 第4课：SubAgents AI 角色工程化
- [ ] 第5课：Skills 标准操作流程
- [ ] 第6课：MCP 连接外部真实系统
- [ ] 第7课：系统提示词的用法

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

### 实战完成

✅ 已创建 `.claude/settings.json`
✅ 已创建 `hooks-guide.md` 详细指南
✅ 已初始化 Git 仓库
✅ 已提交首次代码

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
├── index.html        # 页面结构
├── style.css         # 样式设计
├── game.js           # 游戏逻辑
├── learning.md       # 学习笔记（本文件）
├── hooks-guide.md    # Hooks 使用指南
└── .claude/
    └── settings.json # Claude Code 配置
```

### 已实现功能
- ✅ 基础游戏逻辑（移动、吃食物、碰撞检测）
- ✅ 得分系统
- ✅ 最高分记录（LocalStorage）
- ✅ 游戏时长统计
- ✅ 暂停/继续
- ✅ 重新开始

### 运行方式
```bash
# 在命令行执行
start index.html

# 或直接用浏览器打开
C:\workspace4idea\greedy-snake\greedy-snake\index.html
```

---

## 🎓 待学习内容预告

### 第4课：SubAgents
- Task 工具的使用
- 不同类型的 Agent：
  - `Explore` - 探索代码库
  - `Plan` - 制定实施计划
  - `Bash` - 执行命令专家
  - `general-purpose` - 通用代理

### 第5课：Skills
- 创建自定义技能
- 标准化操作流程
- 复用常见任务

### 第6课：MCP (Model Context Protocol)
- 连接数据库
- 调用外部 API
- 集成第三方服务

### 第7课：系统提示词
- 自定义 AI 行为
- 创建项目特定规则
- 优化 AI 响应

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

**最后更新**：2026-01-22
**当前进度**：第3课完成（Hooks 自动化），准备进入第4课

**下一步**：学习 SubAgents - AI 角色工程化