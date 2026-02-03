---
name: git-push
description: Git 提交推送 - 自动检查、暂存、提交、推送到远程仓库
allowed-tools: Task, AskUserQuestion
---

# Git 提交推送技能

你是一位负责 Git 提交和推送的专家，自动执行完整的 Git 上传流程。

## 执行流程

### 阶段1：检查状态

**调用 git-manager SubAgent 检查当前状态**：

```
Task(
  subagent_type="git-manager",
  prompt="检查 Git 状态\n\n请执行：\n1. git status 查看变更文件\n2. git diff 查看详细改动\n3. 列出所有变更文件清单\n4. 说明变更类型（新增/修改/删除）"
)
```

### 阶段2：确认提交范围

**向用户展示变更文件并确认**：

```
发现以下变更：

新增文件：
- file1.js
- file2.css

修改文件：
- game.js
- style.css

删除文件：
- old-file.js

是否提交所有变更？
- 是：提交所有文件
- 否：让我选择要提交的文件
```

使用 `AskUserQuestion` 询问用户。

### 阶段3：生成提交信息

**调用 git-manager SubAgent 生成提交信息**：

```
Task(
  subagent_type="git-manager",
  prompt="生成提交信息\n\n变更文件：\n{文件列表}\n\n变更内容：\n{diff 摘要}\n\n请生成：\n1. 符合 Conventional Commits 规范的提交信息\n2. 简洁描述主要变更\n3. 类型前缀：feat/fix/docs/style/refactor/test/chore"
)
```

**向用户展示提交信息并确认**：

```
建议提交信息：
feat: 添加障碍物功能

是否使用此提交信息？
- 是：使用建议的提交信息
- 否：我要自定义提交信息
```

### 阶段4：暂存和提交

**调用 git-manager SubAgent 执行提交**：

```
Task(
  subagent_type="git-manager",
  prompt="执行 Git 提交\n\n提交信息：{提交信息}\n\n提交文件：\n{文件列表}\n\n请执行：\n1. git add {文件}\n2. git commit -m \"{提交信息}\"\n3. 报告提交结果"
)
```

### 阶段5：推送到远程

**调用 git-manager SubAgent 推送**：

```
Task(
  subagent_type="git-manager",
  prompt="推送到远程仓库\n\n请执行：\n1. git push origin {分支名}\n2. 如果失败，检查是否需要 pull\n3. 报告推送结果和远程 URL"
)
```

**处理推送失败**：

如果推送失败（如需要先 pull）：

1. **询问用户**：
   ```
   推送失败，远程有新提交。需要先拉取远程变更。

   是否执行 git pull？
   - 是：执行 pull 并重新推送
   - 否：取消推送
   ```

2. **如果用户同意**，调用 git-manager 执行 pull 和推送

### 阶段6：完成报告

**向用户输出完成报告**：

```
## Git 推送完成

### 提交信息
{提交信息}

### 提交文件
- file1.js
- file2.css
- game.js

### 远程仓库
{远程仓库 URL}

### 分支
{分支名}

### 提交 Hash
{commit hash}

---
✅ 所有变更已成功推送到远程仓库
```

## SubAgent 调用规范

| SubAgent | 用途 | 调用时机 |
|----------|------|----------|
| `git-manager` | Git 操作 | 每个需要执行 git 命令的阶段 |

## 自动化规则

**必须执行的步骤**：
1. 检查状态（git status, git diff）
2. 用户确认提交范围
3. 生成并确认提交信息
4. 执行提交
5. 推送到远程

**可跳过条件**：
- 只有用户明确要求跳过某个确认步骤时才可跳过
- 跳过前必须告知用户风险

## 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>: <description>

[optional body]

[optional footer]
```

**类型（type）**：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档变更
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构（既不是新功能也不是修复）
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变更

**示例**：
- `feat: 添加障碍物功能`
- `fix: 修复蛇穿墙 bug`
- `docs: 更新 README 文档`
- `style: 统一代码缩进格式`
- `refactor: 重构碰撞检测逻辑`

## 禁止行为

- ❌ 未检查状态直接提交
- ❌ 提交未经用户确认的文件
- ❌ 使用无意义的提交信息（如 "update"）
- ❌ 强制推送（git push -f）除非用户明确要求
- ❌ 提交敏感文件（.env, credentials 等）
