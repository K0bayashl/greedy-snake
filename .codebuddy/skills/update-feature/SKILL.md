---
name: update-feature
description: 更新现有功能 - 调用 Manager Agent 进行完整开发闭环
allowed-tools: Task
---

# 更新现有功能技能

这是一个快捷入口，用于启动功能更新流程。

## 功能说明

当用户输入 `/update-feature` 或请求"修改/优化现有功能"时，此技能会：
1. 调用 **Manager Agent**（项目经理）
2. Manager 会自动协调整个更新流程：
   - 需求确认
   - 设计评审（designer）
   - 代码修改（developer）
   - 代码审查（reviewer）
   - 回归测试（tester）
   - 文档更新（doc-writer）

## 使用方法

### 方式1：斜杠命令
```
/update-feature 障碍物增加预警
```

### 方式2：自然语言
```
修改障碍物，加上预警提示
优化计分逻辑
修复暂停时计时器还在走的 Bug
```

## 执行逻辑

调用 Manager Agent，传递用户需求：

```
Task(
  subagent_type="manager",
  model="gpt-5.1-codex",
  prompt="用户请求更新现有功能

功能名称：{从用户输入提取}
更新需求：{原始需求}

请按照你的更新流程执行：
1. 需求确认（要改什么、为什么改）
2. 设计评审（designer - 关注兼容性和影响范围）
3. 方案确认（等待用户批准）
4. 代码修改（developer - 最小化改动）
5. 代码审查（reviewer - 检查是否破坏原功能）
6. 回归测试（tester - 验证原功能正常）
7. 文档更新（doc-writer）
8. 完成报告"
)
```

## 更新类型

Manager 会识别以下更新类型：
- **新增** - 在现有功能上增加新特性
- **改进** - 优化现有实现
- **修复** - 修复 Bug
- **重构** - 改进代码结构

## 注意事项

- 此 Skill **不负责执行**，只负责启动 Manager
- 流程编排由 Manager Agent 全权负责
- Manager 会特别关注向后兼容性
- 必须执行回归测试确保原功能正常
