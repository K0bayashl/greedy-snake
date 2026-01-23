# Claude Code MCP 配置指南

## 📌 什么是 MCP？

**MCP (Model Context Protocol)** 是一种开放协议，让 AI 助手能够连接外部系统，突破本地文件系统的限制。

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

## 🔧 配置文件位置

### 项目级配置
`.claude/settings.json`（仅当前项目生效）

### 用户级配置
`~/.claude/settings.json`（所有项目生效）

**优先级**：项目级配置会覆盖用户级配置

## 📝 基本配置结构

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

### 配置字段说明

| 字段 | 说明 | 必填 |
|------|------|------|
| `command` | 启动服务器的命令 | ✅ |
| `args` | 命令参数数组 | ✅ |
| `env` | 环境变量对象 | ❌ |

## 🎯 MCP 的价值

| 能力 | 没有 MCP | 有 MCP |
|------|----------|--------|
| 读写本地文件 | ✅ | ✅ |
| 执行终端命令 | ✅ | ✅ |
| 搜索代码 | ✅ | ✅ |
| 读取数据库 | ❌ | ✅ |
| 调用 API | ❌ | ✅ |
| 访问云服务 | ❌ | ✅ |
| 获取实时数据 | ❌ | ✅ |

## 🏗️ 架构组成

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

**工作原理**：
1. Claude Code 内置 MCP Client
2. MCP Client 通过标准协议与 MCP Server 通信
3. MCP Server 作为独立进程运行
4. Server 连接到外部资源（数据库、API 等）

## 🎨 MCP Server 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **官方** | Claude Code 官方维护 | `@modelcontextprotocol/server-filesystem` |
| **社区** | 社区贡献的服务器 | `@modelcontextprotocol/server-github` |
| **自定义** | 你自己写的 | 连接公司内部系统 |

## 💡 常用 MCP Servers

### 1. server-filesystem
**功能**：限制文件系统访问范围

**用途**：
- 限制 Claude 只能访问特定目录
- 提高安全性，防止访问敏感文件

**配置示例**：
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/directory"
      ]
    }
  }
}
```

### 2. server-github
**功能**：GitHub 集成

**用途**：
- 读取仓库信息
- 创建 Issue
- 提交 Pull Request
- 查看代码历史

**配置示例**：
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

**获取 GitHub Token**：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token"
3. 选择需要的权限
4. 复制 token 并填入配置

### 3. server-postgres
**功能**：PostgreSQL 数据库访问

**用途**：
- 直接查询数据库
- 执行 SQL 语句
- 分析数据

**配置示例**：
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

### 4. server-brave-search
**功能**：实时网页搜索

**用途**：
- 搜索最新技术资料
- 查找 Bug 解决方案
- 获取实时信息

**配置示例**：
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-api-key"
      }
    }
  }
}
```

**获取 Brave API Key**：
1. 访问 https://api.search.brave.com/app/keys
2. 注册账号
3. 创建 API Key

### 5. server-puppeteer
**功能**：浏览器自动化

**用途**：
- 自动化测试
- 网页截图
- 爬取动态内容

**配置示例**：
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

## 🎨 可用变量

MCP 配置中可以使用环境变量：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**设置环境变量**：
- Windows: `set GITHUB_TOKEN=gh_xxx`
- Linux/Mac: `export GITHUB_TOKEN=gh_xxx`

## 💡 实用配置示例

### 示例1：完整的开发环境配置
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      }
    }
  }
}
```

### 示例2：限制文件系统访问
```json
{
  "mcpServers": {
    "project-files": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:/workspace4idea/greedy-snake"
      ]
    }
  }
}
```

### 示例3：自定义 MCP Server
```json
{
  "mcpServers": {
    "custom-api": {
      "command": "node",
      "args": ["./scripts/mcp-server.js"],
      "env": {
        "API_ENDPOINT": "https://api.example.com",
        "API_KEY": "${CUSTOM_API_KEY}"
      }
    }
  }
}
```

## ⚙️ 配置详解

### 基本配置

| 配置项 | 说明 |
|--------|------|
| 文件位置 | `.claude/settings.json` 或 `.claude/settings.local.json` |
| 重启要求 | ⚠️ **必须重启** Claude Code |
| 生效时机 | 重启后生效 |

### 配置结构

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

### YAML 字段说明

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `command` | ✅ | 执行命令 | `npx`, `node` |
| `args` | ✅ | 命令参数 | `["-y", "@package"]` |
| `env` | ❌ | 环境变量 | API keys, 连接字符串 |

### 配置位置

```
项目级：.claude/settings.json
用户级：~/.claude/settings.json
```

### 常用 MCP Servers

| MCP Server | 安装命令 | 用途 |
|------------|----------|------|
| `server-filesystem` | `npx @modelcontextprotocol/server-filesystem` | 限制访问目录 |
| `server-github` | `npx @modelcontextprotocol/server-github` | GitHub 集成 |
| `server-postgres` | `npx @modelcontextprotocol/server-postgres` | PostgreSQL 数据库 |
| `server-brave-search` | `npx @modelcontextprotocol/server-brave-search` | 网页搜索 |

### 配置示例

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

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| MCP Server 不启动 | 检查 `command` 和 `args` 是否正确 |
| 连接失败 | 检查 `env` 环境变量是否配置 |
| ⚠️ 没有重启 | 重启 Claude Code |

## 🔄 工作流程

```
1. 在 settings.json 配置 MCP 服务器
   │
2. 重启 Claude Code（加载配置）
   │
3. Claude 自动启动 MCP Server 进程
   │
4. 你给 Claude 任务
   │
5. Claude 判断是否需要调用 MCP
   │
6. 通过 MCP Client 与 Server 通信
   │
7. Server 执行操作并返回结果
   │
8. Claude 处理结果并返回给你
```

## 🛠️ 调试 MCP

### 查看 MCP 状态

使用命令查看已加载的 MCP 服务器：
```
/mcp
```

### 常见问题排查

#### 问题1：MCP Server 启动失败

**症状**：
- 配置后无法使用 MCP 功能
- 错误信息提示服务器未启动

**解决方法**：
1. 检查 `command` 和 `args` 是否正确
2. 确保依赖已安装（如 Node.js）
3. 查看终端错误日志
4. 手动运行命令测试

```bash
# 测试 MCP Server 是否能正常启动
npx -y @modelcontextprotocol/server-github
```

#### 问题2：环境变量未生效

**症状**：
- 提示缺少 API Key
- 连接失败

**解决方法**：
1. 确认环境变量名称正确
2. 检查环境变量是否已设置
3. 尝试直接在配置中写入值（仅用于测试）

```json
// 临时测试（不要提交到版本控制）
"env": {
  "GITHUB_TOKEN": "gh_xxx"  // 直接写入值
}
```

#### 问题3：权限不足

**症状**：
- 无法访问某些资源
- 提示权限错误

**解决方法**：
1. 检查 API Token 权限
2. 确认数据库用户权限
3. 检查文件系统访问权限

## 🎓 最佳实践

1. **使用环境变量**：敏感信息（API Key、密码）使用环境变量，不要硬编码
2. **限制访问范围**：使用 filesystem MCP 限制可访问的目录
3. **最小权限原则**：只授予必要的权限
4. **版本控制**：`.claude/settings.json` 可以加入版本控制（但注意不要包含敏感信息）
5. **文档化配置**：为自定义 MCP Server 编写文档
6. **测试配置**：配置后立即测试，确保功能正常
7. **监控日志**：关注 MCP Server 的日志输出

## 🔒 安全注意事项

### 1. 保护敏感信息

❌ **错误做法**：
```json
{
  "env": {
    "GITHUB_TOKEN": "gh_xxx"  // 硬编码敏感信息
  }
}
```

✅ **正确做法**：
```json
{
  "env": {
    "GITHUB_TOKEN": "${GITHUB_TOKEN}"  // 使用环境变量
  }
}
```

### 2. 限制文件访问

使用 filesystem MCP 限制访问范围，防止意外访问敏感文件。

### 3. 定期更新依赖

定期更新 MCP Server 包，获取安全修复：
```bash
npm update @modelcontextprotocol/server-github
```

### 4. 审查权限

定期审查 MCP Server 的权限配置，移除不必要的权限。

## 📚 创建自定义 MCP Server

### 基本结构

```javascript
// mcp-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'custom-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// 注册工具
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'custom_tool',
        description: '自定义工具描述',
        inputSchema: {
          type: 'object',
          properties: {
            param1: {
              type: 'string',
              description: '参数1'
            }
          },
          required: ['param1']
        }
      }
    ]
  };
});

// 处理工具调用
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'custom_tool') {
    // 执行自定义逻辑
    const result = await doSomething(args.param1);
    return {
      content: [
        {
          type: 'text',
          text: `结果: ${result}`
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 配置自定义 Server

```json
{
  "mcpServers": {
    "custom": {
      "command": "node",
      "args": ["./scripts/mcp-server.js"],
      "env": {
        "API_KEY": "${CUSTOM_API_KEY}"
      }
    }
  }
}
```

## 🎯 实战场景：贪吃蛇项目的 MCP 需求

| MCP 服务 | 优先级 | 用途 |
|----------|--------|------|
| **Chrome DevTools** | 🔴 高 | 调试游戏、自动化测试（本地已有） |
| **Brave Search** | 🟡 中 | 查游戏开发资料、Bug 解决方案 |
| **GitHub** | 🟢 低 | 开源后管理仓库 |
| **PostgreSQL** | ⚪ 可选 | 做在线排行榜时用 |

### 推荐配置

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

## 🚫 常见错误

### 错误1：JSON 格式错误

❌ 错误：
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
      // 缺少逗号
    }
  }
}
```

✅ 正确：
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

### 错误2：环境变量未设置

❌ 错误：
```json
{
  "env": {
    "GITHUB_TOKEN": "${GITHUB_TOKEN}"  // 环境变量未设置
  }
}
```

**解决方法**：
```bash
# Windows
set GITHUB_TOKEN=gh_xxx

# Linux/Mac
export GITHUB_TOKEN=gh_xxx
```

### 错误3：依赖未安装

❌ 错误：
```
Error: Cannot find module '@modelcontextprotocol/server-github'
```

**解决方法**：
```bash
npm install -g @modelcontextprotocol/server-github
```

## 📚 下一步

尝试配置你自己的 MCP Servers：
- 连接 GitHub 管理仓库
- 集成数据库查询功能
- 添加实时搜索能力
- 创建自定义 MCP Server

## 🔗 有用资源

- MCP 官方文档: https://modelcontextprotocol.io
- MCP GitHub: https://github.com/modelcontextprotocol
- MCP Server 列表: https://github.com/modelcontextprotocol/servers

---

**更新日期**：2026-01-23