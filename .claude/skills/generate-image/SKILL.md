---
name: generate-image
description: 使用本地 API 生成图像
user-invocable: true
context: none
model: sonnet
allowed-tools:
  - Bash
---

# 图像生成技能

此技能允许通过命令行调用本地 Node.js 脚本生成图像。

## 参数

- `prompt`: (必需) 图像描述提示词
- `filename`: (可选) 输出文件名，默认为 generated-{timestamp}.png

## 实现细节

调用 `.claude/skills/generate-image/generate.js` 脚本。

## 示例

```bash
/generate-image prompt="pixel art cat"
/generate-image prompt="cyberpunk city" filename="city.png"
```

## 执行逻辑

```javascript
// 调用脚本
// 注意：参数需要正确传递
Bash(
  command=`node .claude/skills/generate-image/generate.js --prompt="${prompt}" --filename="${filename || ''}"`
)
```
