---
name: commit
description: 提交代码到 Git 仓库
---

# Git 提交技能

自动执行 Git 提交流程。

## 执行步骤

1. 运行 `git status` 查看改动
2. 运行 `git diff` 查看具体变更
3. 运行 `git log -3 --oneline` 查看最近的提交风格
4. 分析变更内容，生成合适的提交信息
5. `git add` 添加相关文件
6. `git commit` 提交（包含 Co-Authored-By）

## 提交信息格式

```
类型(范围): 简短描述

详细说明（可选）

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 类型标签

- `feat`: 新功能
- `fix`: Bug 修复
- `refactor`: 重构
- `docs`: 文档更新
- `style`: 代码格式
- `test`: 测试相关
- `chore`: 构建/工具