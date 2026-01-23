---
name: change-summary
description: 变更摘要 - 生成代码变更的简洁摘要
user-invocable: true
context: fork
model: sonnet
allowed-tools:
  - Bash
  - Read
  - Task
---

# 变更摘要技能

生成 Git 代码变更的结构化摘要。

## 执行策略

### 自己完成（常规场景）
- ✅ 标准 Git 变更分析
- ✅ 生成 commit message
- ✅ 变更概览和统计

**操作**：直接用 git 命令分析并输出

### 调用 SubAgent（特殊场景）
- ❌ 需要深入理解代码变更的业务含义
- ❌ 需要同时更新相关文档
- ❌ 复杂的多功能集成变更

**操作**：
- `Task(subagent_type="reviewer")` - 理解变更影响
- `Task(subagent_type="doc-writer")` - 更新文档

## 工作流程

1. **评估复杂度** - 判断是自己做还是需要协助
2. **获取变更** - 使用 `git status` 和 `git diff` 查看变更
3. **分析内容** - 理解变更的性质和目的
4. **生成摘要** - 输出结构化的变更报告

## 输出格式

### 变更类型
- ✨ **新功能** (feat)
- 🐛 **Bug修复** (fix)
- ♻️ **重构** (refactor)
- 📝 **文档** (docs)
- 🎨 **样式** (style)
- ⚡ **性能** (perf)
- ✅ **测试** (test)

### 摘要内容

```
## 变更概述
[一句话总结本次变更的目的]

## 变更详情
| 文件 | 变更类型 | 说明 |
|------|----------|------|
| game.js | feat | 添加双倍分数食物功能 |

## 影响范围
- [x] 游戏逻辑
- [ ] UI渲染
- [ ] 数据存储

## 建议
[如果有建议，在此列出]

---
执行方式：Skill 直接完成 / 协同 SubAgent 完成
```
