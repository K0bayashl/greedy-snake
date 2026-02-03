---
name: add-feature
description: 添加新功能 - 调用 Manager Agent 进行完整开发闭环
user-invocable: true
context: current
---

# 添加新功能技能

这是一个快捷入口，用于启动完整的功能开发流程。

## 功能说明

当用户输入 `/add-feature` 或请求"添加新功能"时，此技能会：
1. 调用 **Manager Agent**（项目经理）
2. Manager 会自动协调整个开发流程：
   - 需求确认
   - 设计评审（designer）
   - 代码实现（developer）
   - 代码审查（reviewer）
   - 测试验证（tester）
   - 文档更新（doc-writer）

## 使用方法

### 方式1：斜杠命令
```
/add-feature 障碍物系统
```

### 方式2：自然语言
```
帮我添加一个障碍物功能
我想加一个计分板
```

## 执行逻辑

调用 Manager Agent，传递用户需求：

```
Task(
  subagent_type="manager",
  model="opus",
  prompt="用户请求添加新功能

功能名称：{从用户输入提取}
用户需求：{原始需求}

请按照你的标准流程执行：
1. 需求确认
2. 设计评审（designer）
3. 方案确认（等待用户批准）
4. 代码实现（developer）
5. 代码审查（reviewer）
6. 测试验证（tester）
7. 文档更新（doc-writer）
8. 完成报告"
)
```

## 注意事项

- 此 Skill **不负责执行**，只负责启动 Manager
- 流程编排由 Manager Agent 全权负责
- Manager 会在关键节点询问用户确认
