# Claude Code Hooks 配置指南

## 📌 什么是 Hooks？

Hooks 允许你在 Claude Code 的特定事件发生时自动执行 Shell 命令。

## 🔧 配置文件位置

`.claude/settings.json`

## 📝 基本配置结构

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

## 🎯 可用的 Hook 类型

### 1. user-prompt-submit
**触发时机**：用户发送消息给 Claude 时

**用途示例**：
- 提醒代码规范
- 检查工作目录状态
- 显示当前分支信息

**配置示例**：
```json
{
  "hooks": {
    "user-prompt-submit": {
      "command": "git status -s",
      "enabled": true
    }
  }
}
```

### 2. tool-use (特定工具)
**触发时机**：Claude 使用特定工具时

**支持的工具**：
- `edit-file` - 编辑文件时
- `write-file` - 创建文件时
- `bash` - 执行 Bash 命令时
- `read-file` - 读取文件时

**配置示例**：
```json
{
  "hooks": {
    "edit-file": {
      "command": "echo '文件已修改: {{file_path}}'",
      "enabled": true
    }
  }
}
```

### 3. bash (命令执行)
**触发时机**：执行 Bash 命令前

**用途示例**：
- 记录命令执行日志
- 检查命令权限
- 危险命令警告

**配置示例**：
```json
{
  "hooks": {
    "bash": {
      "command": "echo '即将执行: {{bash_command}}'",
      "enabled": true
    }
  }
}
```

## 🎨 可用变量

Hooks 命令中可以使用以下变量：

- `{{file_path}}` - 文件路径（edit-file、write-file）
- `{{bash_command}}` - Bash 命令内容（bash）
- `{{user_prompt}}` - 用户输入（user-prompt-submit）

## 💡 实用 Hook 示例

### 示例1：代码提交前检查
```json
{
  "hooks": {
    "user-prompt-submit": {
      "command": "if [[ \"$USER_PROMPT\" == *commit* ]]; then git diff --check; fi",
      "enabled": true
    }
  }
}
```

### 示例2：文件编辑后格式化（JavaScript）
```json
{
  "hooks": {
    "edit-file": {
      "command": "if [[ {{file_path}} == *.js ]]; then echo '建议运行: npx prettier --write {{file_path}}'; fi",
      "enabled": true
    }
  }
}
```

### 示例3：危险命令警告
```json
{
  "hooks": {
    "bash": {
      "command": "if [[ \"{{bash_command}}\" == *rm* ]] || [[ \"{{bash_command}}\" == *delete* ]]; then echo '⚠️ 警告：删除操作，请确认！'; fi",
      "enabled": true
    }
  }
}
```

### 示例4：自动显示 Git 状态
```json
{
  "hooks": {
    "user-prompt-submit": {
      "command": "git status -sb 2>/dev/null || echo '不在 Git 仓库中'",
      "enabled": true
    }
  }
}
```

## ⚙️ 配置详解

### 基本配置

| 配置项 | 说明 |
|--------|------|
| 文件位置 | `.claude/settings.json` |
| 重启要求 | ❌ 不需要重启 |
| 生效时机 | 修改后立即生效 |

### 配置结构

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

### 可用变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{file_path}}` | 文件路径 | `C:\project\src\game.js` |
| `{{bash_command}}` | Bash 命令 | `git status` |
| `{{user_prompt}}` | 用户输入 | 用户发送的消息内容 |

### Windows 兼容性

**⚠️ 重点**：Windows 系统需要特殊处理

```bash
# 错误写法（Windows 会失败）
"command": "git status 2>/dev/null"

# 正确写法
"command": "git status -sb 2>nul"
```

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| Hook 没有执行 | 检查 `enabled` 是否为 `true` |
| 命令报错 | 检查 Windows 命令兼容性 |
| 变量不生效 | 确保变量名正确，用 `{{}}` 包裹 |

## 🚫 Hook 失败处理

如果 Hook 命令返回非零退出码：
- Hook 会失败并阻止操作继续
- 错误信息会显示给用户
- 可以用于强制检查（如代码质量门禁）

**示例：阻止提交包含 TODO 的代码**
```json
{
  "hooks": {
    "bash": {
      "command": "if [[ \"{{bash_command}}\" == *commit* ]]; then ! git diff --cached | grep -i todo; fi",
      "enabled": true
    }
  }
}
```

## ⚙️ 权限配置

除了 Hooks，你还可以配置权限：

```json
{
  "permissions": {
    "bash": {
      "allowedPrompts": [
        "查看文件",
        "运行测试",
        "构建项目"
      ]
    }
  }
}
```

这些权限描述会让 Claude 在执行相关操作时自动获得许可。

## 🎓 最佳实践

1. **保持简单**：Hook 命令应该快速执行
2. **提供反馈**：使用 echo 输出有用信息
3. **错误处理**：使用 `2>/dev/null` 忽略不重要的错误
4. **渐进启用**：先测试，确认无误后再启用
5. **团队共享**：将 `.claude/settings.json` 加入版本控制

## 🔍 调试 Hooks

如果 Hook 没有按预期工作：

1. 检查 `enabled` 是否为 `true`
2. 在命令中添加 `echo` 输出调试信息
3. 测试命令在终端中是否能正常运行
4. 检查变量名是否正确（如 `{{file_path}}`）

## 📚 下一步

尝试创建你自己的 Hooks：
- 提交前运行 ESLint
- 编辑后自动格式化
- 显示项目信息提醒

---

**更新日期**：2026-01-22
