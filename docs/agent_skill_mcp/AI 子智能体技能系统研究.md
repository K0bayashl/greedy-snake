# **AI 子智能体（Subagent）及其技能（Skill）系统：架构演进、模块化能力与自治演化研究报告**

在人工智能迈向通用人工智能（AGI）的演进路径中，系统架构的重心已从单一模型能力的突破，转向了复杂多智能体系统（Multi-Agent Systems, MAS）的协同逻辑与自治演化能力。早期的生成式 AI 系统多以单一提示词驱动的交互为主，但在面对长链路、多步骤及跨领域的复杂业务逻辑时，往往面临上下文窗口爆炸、指令遵循度下降以及推理路径漂移等严峻挑战 1。为了解决这些瓶颈，行业领先的研究机构与企业开发出了 AI 子智能体（Subagent）及其配套的技能（Skill）系统。这些系统通过引入“关注点分离”的软件工程原则，将复杂的全局目标拆解为可管理的局部任务，极大地提升了系统的稳定性、可扩展性与执行效率 3。

## **第一章 AI 子智能体的定义、核心角色与架构范式**

子智能体（Subagent）被定义为在特定的上下文窗口中运行、拥有独立系统提示词、特定工具访问权限及自主权限的专业化 AI 助手 1。这种架构允许主智能体（Lead Agent）在面对复杂任务时，通过逻辑描述匹配将具体环节委托给最适合的子智能体执行 1。子智能体与主对话之间实现了物理上的上下文隔离，这种隔离不仅保护了主对话的整洁，更通过逻辑上的职能细分实现了“专家级”的任务处理，例如专门负责代码优化的智能体、负责安全扫描的智能体或负责合规性检查的智能体 1。

### **1.1 子智能体在多智能体架构中的功能定位**

在复杂的研究与开发环境中，子智能体不仅是执行单元，更是信息的过滤器与压缩器。在并行研究模式下，主智能体作为协调者开发策略，并派遣多个专业化子智能体分别执行搜索、工具调用和初步评估 5。这种架构的优势在于通过“多路探索-独立决策”降低了路径依赖（Path Dependency），使得调查过程更加彻底且独立 5。每个子智能体在完成任务后，仅向主智能体返回高度浓缩的关键信息，主智能体再根据这些反馈进行最终的综合汇总。这种机制有效解决了 Token 过度消耗的问题，使得 AI 系统能够处理超出单一上下文容量的大规模复杂项目 1。

### **1.2 典型的子智能体实现案例：Claude Code 与 Research System**

Claude Code 展现了子智能体在软件开发环境中的具体应用。通过 .claude/agents/ 或 \~/.claude/agents/ 目录下的 Markdown 文件，用户可以定义具有特定系统提示词（System Prompt）和工具权限的子智能体 1。例如，一个代码改进智能体可以被配置为专注于性能优化，它拥有独立的进程和资源限制。当主智能体识别到性能瓶颈时，会通过自动委托（Automatic Delegation）或显式调用（Explicit Invocation）将任务移交给该子智能体 3。

相比之下，Anthropic 的研究系统则采用了一种“编排者-工作者”（Orchestrator-Worker）模式。主智能体（Lead Researcher）负责分解查询、制定策略并描述子任务。子智能体随后独立执行 Web 搜索、评估工具结果，并通过“交织思考”（Interleaved Thinking）不断修正自身的查询策略 5。这种层级结构使得系统具备了更高的并行处理能力和鲁棒性。

### **1.3 垂直层级与分层控制系统（Layered Control System）**

层级化智能体系统通常采用三层架构模型：高层智能体、中层智能体与底层智能体（子智能体） 6。

| 层级名称 | 核心职责 | 典型模型/逻辑 |
| :---- | :---- | :---- |
| 高层智能体 (High-level) | 战略规划、任务拆解、全局目标设定 | 先进大语言模型 (如 Claude 3.5 Sonnet) |
| 中层智能体 (Mid-level) | 指令转化、计划细化、团队协调、汇报汇总 | 领域特定模型或复杂的提示词链 |
| 底层子智能体 (Low-level) | 任务执行、数据采集、工具调用 | 轻量级模型 (如 Haiku) 或基于规则的逻辑 |

6

在这种分层控制系统中，高层智能体负责“大局观”，管理整个系统与宏观目标的一致性。底层子智能体则是专注于窄领域任务的“行动者”，它们可能使用基于规则的逻辑、特定的 API 调用或受限的学习策略 6。这种层级化设计的核心价值在于它允许系统在不同的抽象级别上进行推理：高层关注“做什么”，而底层关注“怎么做” 7。

## **第二章 智能体技能（Skill）系统的标准化与模块化**

技能系统（Agent Skills）为 AI 提供了一种标准化的方式来打包和共享特定领域的能力。根据最新的行业共识与开放标准，技能被定义为包含指令、脚本、资源及元数据的模块化文件夹，智能体可以根据需要动态地发现并加载这些技能 8。

### **2.1 技能包的技术构成与文件结构**

技能包（Skill Package）是一个可共享的集合，旨在打破 AI 工具之间的孤岛效应。虽然多数组件是可选的，但其核心遵循严谨的目录结构。

| 组件名称 | 核心文件/目录 | 功能描述 |
| :---- | :---- | :---- |
| 核心指令层 | SKILL.md | **必填项**。包含 YAML 前置元数据和详细的 Markdown 指令，定义了技能的用途和执行逻辑 10。 |
| 执行脚本层 | scripts/ | 包含可执行的自动化脚本（Python, Bash 等），用于执行确定性任务，提高 Token 效率 9。 |
| 知识参考层 | references/ | 存储长篇文档、示例或法律合规标准，仅在需要时按需加载 9。 |
| 辅助资源层 | assets/ | 包含模板、配置、图片或生成输出所需的其他资源 9。 |

9

其中，SKILL.md 的 YAML 前置数据是智能体发现机制的关键。它要求 name 字段必须遵循特定的正则约束 ^\[a-z0-9\]+(-\[a-z0-9\]+)\*$，字符长度在 1 到 64 之间。description 字段（1 到 1024 字符）则决定了智能体在语义匹配阶段是否会选中该技能 10。

### **2.2 技能的发现、发现与执行流（Discovery & Execution Flow）**

技能系统运行遵循“渐进式披露”（Progressive Disclosure）原则。在会话启动时，系统仅加载一个包含技能名称和描述的轻量级索引，而不会消耗过多的上下文空间 8。

1. **语义匹配（Semantic Matching）**：当用户提交请求时，LLM 会将任务描述与已加载的轻量级索引进行对比。如果任务语义上契合（例如用户要求“审查这个控制器”），LLM 会识别到匹配的 code-reviewer 技能 8。  
2. **动态加载（Loading on Demand）**：一旦触发匹配，智能体会通过“加载工具”读取完整的 SKILL.md 内容和相关参考文件。  
3. **确定性执行（Deterministic Execution）**：智能体随后遵循技能中的分步程序。如果技能关联了脚本，智能体会运行这些脚本以执行如复杂金融计算或代码库重构等任务，这种方式比单纯依赖自然语言推理更具鲁棒性 8。

## **第三章 任务拆解与分层规划的逻辑深度**

任务拆解（Task Decomposition）是智能体实现自治规划的核心，其本质是将模糊、宏大的全局目标转化为一系列具体、可执行且相互关联的子任务 2。这一过程受到人类认知科学中解决问题方式的启发，即通过建立子目标（Subgoals）来管理复杂性。

### **3.1 任务拆解的三大原则与递归深度**

有效的任务拆解要求子任务必须满足：**具体性**（智能体确切知道做什么）、**可达成性**（在现有工具能力范围内）以及**有序性**（依赖关系明确） 2。智能体通常采用递归拆解逻辑。例如，在“开发软件应用”这一主任务下，第一层拆解产生“需求分析”、“设计方案”、“实现方案”等子任务；而“实现方案”又可细分为“环境搭建”、“模块编写”等，直到每个步骤都达到可执行水平 7。

### **3.2 任务执行逻辑的分类模型**

智能体系统在规划过程中，会根据子任务间的关系采用不同的调度逻辑：

* **顺序智能体（SequentialAgent）**：逻辑上类似装配线。前一个子任务的输出作为后一个任务的输入。适用于需要严谨数据流转的场景，如“抓取数据 ![][image1] 清洗数据 ![][image1] 分析数据 ![][image1] 总结发现” 2。  
* **并行智能体（ParallelAgent）**：类似多线并行的经理。同时分配任务给多个员工，适用于独立性强的任务。例如同时调用三个不同供应商的 API 以对比价格 2。  
* **循环智能体（LoopAgent）**：类似于编程中的 while 循环。重复执行特定子智能体直到满足终止条件，常用于 API 轮询或在测试失败时不断重试直到修复 12。

## **第四章 主流多智能体协同框架的深度比对**

当前市场上主要存在四大主流框架，它们在处理子智能体管理、技能分配及任务编排方面采取了截然不同的技术方案 13。

| 评估维度 | CrewAI | LangGraph | AutoGen | OpenAI Agent SDK |
| :---- | :---- | :---- | :---- | :---- |
| **核心架构** | 角色驱动 (Role-Based) | 图驱动 (Graph-Based) | 对话驱动 (Conversational) | 工具中心化 (Tool-Centric) |
| **技能承载** | 预定义的岗位责任与工具集 | 状态机中的节点函数 | 动态角色扮演与讨论 | 轻量级函数挂载 |
| **协同模式** | “团队/船员”式任务移交 | 严格的状态转移与分支逻辑 | 多智能体回合制对话 | 直接的工具 handoff |
| **状态管理** | 基于角色的内存与 RAG | 严格的检查点与回滚机制 | 基于消息列表的会话内存 | 简单的内置缓存 |
| **核心优势** | 易于理解、角色分工明确 | 确定性强、容错率高、可复现 | 灵活性极高、适合创意任务 | 极简主义、执行速度快 |

13

CrewAI 借鉴了职场管理模型，将智能体视为拥有特定“角色（Role）”、“目标（Goal）”和“背景故事（Backstory）”的员工，非常适合模拟人类组织流程 14。LangGraph 则将每一次交互建模为有向图中的节点，通过边来定义执行逻辑，赋予了开发者对执行路径极其微观的控制权，并支持复杂的循环流程（Cyclical Graphs） 13。AutoGen 侧重于利用多智能体之间的“涌现行为”，通过多方对话解决问题，适合需要反复迭代、评审（Writer-Critic 模式）的场景 13。

## **第五章 智能体通信协议与互操作性标准**

随着多智能体系统的规模化，不同厂商开发的智能体如何高效、安全地交换信息成为了关键瓶颈。传统的“AD-HOC JSON”方案缺乏语义一致性，容易导致系统性风险。

### **5.1 从 FIPA-ACL 到现代 ACP 与 MCP 协议**

智能体通信的历史演进反映了从“知识交换”向“动作协同”的转变。早期的 FIPA-ACL 虽然定义了 20 多种复杂的执行动作（Performatives），但由于其基于 IIOP 的复杂性，逐渐在 Web 时代失势 18。

现代协议如 **智能体通信协议（ACP）** 采用了四层架构：

* **传输层**：基于 Web 原生的 HTTP/REST 和 SSE 流式传输，兼容标准工具如 cURL 18。  
* **消息层**：引入了“自然语言信封”机制，将结构化 JSON 有效载荷包裹在语义说明中，使智能体能够兼具人类的可读性与机器的精确性 18。  
* **发现层**：通过嵌入式清单（Manifests）实现“零配置发现”，支持 DNS-SD 和本地扫描 18。  
* **安全层**：完全集成 JWT 和 OAuth，确保跨组织协作的信任边界 18。

与专注于垂直“模型-工具”集成的 **模型上下文协议（MCP）** 不同，ACP 侧重于水平的“智能体-智能体”对话。MCP 在生产环境中常面临上下文链条不受控增长、执行路径不透明等“熵增”问题 19。

### **5.2 状态共享与反馈循环机制**

高效的通信不仅是传递消息，更是状态同步与反馈闭环的建立。智能体系统通过感觉、认知和策略层面的反馈循环来持续监控性能 20。这些闭环机制使得智能体能够检测预期结果与实际结果之间的差异，从而启动纠错协议或重新规划任务路径 20。在企业级应用中，这种反馈通常包括：

* **监督式反馈**：来自人类专家的直接修正。  
* **系统生成反馈**：来自日志、传感器或性能指标的硬性数据 21。  
* **自监督反馈**：智能体通过自博弈或内部评估器（Evaluator）产生。

## **第六章 AI 智能体的自演化与技能内化机制**

为了适应动态环境，智能体系统已从静态模型转变为具备“终身学习”（Lifelong Learning）能力的自演化实体。AgentEvolver 框架代表了这一领域的最新进展，它通过三个协同机制实现了能力的自主进化 22。

### **6.1 AgentEvolver：三位一体的自演化路径**

1. **自提问（Self-questioning）**：智能体在探索新环境时，利用 LLM 的语义理解能力自主生成合成任务。这种“好奇心驱动”的探索减少了对人类手工数据集的依赖 22。  
2. **自导航（Self-navigating）**：通过维护经验池（Experience Pool），智能体能够重用过去的成功轨迹，通过混合策略引导探索，极大地提高了样本利用率 22。  
3. **自归因（Self-attributing）**：这是解决长路径信用分配（Credit Assignment）的关键。智能体利用 LLM 作为裁判，对中间状态和动作进行细粒度评估。

在强化学习优化中，优势值（Advantage）的计算至关重要：

![][image2]  
其中 ![][image3] 是轨迹的实际回报，![][image4] 是价值函数估计的基准值 23。自归因机制使得智能体能够识别出哪些特定步骤导致了最终的成功或失败。

### **6.2 技能内化与 StuLife 基准测试**

真正的自演化不仅是 Prompt 层面的微调，更是“技能内化”（Skill Internalization）的过程，即将经验固化到模型权重或持久性存储中 25。StuLife 基准测试模拟了从大一到大四的完整学生生涯，结果显示，即使是最强的模型（如 GPT-5 级别）在需要自驱动探索和长期记忆保留的任务上得分也极低（仅约 17.9/100） 25。这表明，未来的研究重点将是让智能体从“被动响应”转向具有“内在动机”的主动实体 25。

## **第七章 安全性、权限控制与沙箱隔离技术**

随着智能体被赋予更高的自主权，其安全性问题已从“生成内容安全”转向“执行动作安全”。AI 代理不再仅仅是一个用户，而是一个可能引发“访问权限漂移”（Access Privilege Drift）的技术实体 26。

### **7.1 智能体技能生态系统的安全漏洞扫描**

针对 31,132 个独立技能包的大规模扫描揭示了令人担忧的安全现状：26.1% 的技能包含有至少一种安全漏洞 28。

| 威胁类别 | 发现比例 | 典型表现形式 |
| :---- | :---- | :---- |
| **数据窃取** | 13.3% | 未经授权外传 API Key、环境变量或 SSH 密钥 28。 |
| **特权提升** | 11.8% | 尝试通过 sudo/root 执行命令，请求远超其功能的权限 28。 |
| **供应链攻击** | 7.4% | 未锁定依赖版本（Unpinned Dependencies）、运行时下载混淆脚本 28。 |
| **指令注入** | 0.7% | 隐藏在 Markdown 或代码注释中的恶意重写指令 28。 |

研究团队指出，存在显著的“同意鸿沟”（Consent Gap），即用户在安装技能时认为授予了有限权限，但实际执行时技能包却通过语义攻击绕过了限制 28。

### **7.2 多层级沙箱隔离与隔离技术**

为了管理这种执行风险，智能体架构采用了多层级防御：

1. **操作系统层隔离**：使用 macOS Seatbelt、gVisor 或微型虚拟机（Firecracker）实现内核级的隔离。沙箱环境限制了 CPU、内存和文件系统的访问，确保智能体即便被劫持也无法破坏宿主系统 29。  
2. **观察驱动的沙箱（Observability-Driven Sandboxing）**：这是一种运行时的强制执行层。它拦截智能体的每一个工具调用，并将其转换为资源提示，通过预定义的策略（Policy Check）来决定是否允许执行 32。这种方案的优势在于它是“透明的”，每一次拒绝都会反馈给智能体，并生成可审计的记录 32。  
3. **网络与凭据隔离**：通过代理服务器（如 Envoy 或 LiteLLM）管理 API 调用。智能体发出请求，代理服务器在沙箱外注入凭据并进行审计，智能体本身永远无法看到真实的密钥 30。

### **7.3 零信任架构与“有意义的监督”**

新加坡资媒局（IMDA）提出的《智能体 AI 治理框架》强调，仅仅加入一个“人工批准”按钮是不够的，因为频繁的点击会导致“用户习得性忽略（Habitual Approval）” 26。真正的控制需要将 AI 的“访问权”与“行动权”分离。在涉及资金转账、合同签署等高价值环节，系统必须强制触发独立的验证开关，将决策权归还给人类。这种“双重授权”架构是夺回数字世界控制权的关键 26。

## **第八章 企业级落地：AIOps 与未来挑战**

在生产环境中，智能体系统必须跨越“POC（概念验证）”到“生产（Production）”的巨大鸿沟。

### **8.1 生产级 AIOps 的技术瓶颈**

Thoughtworks 的研究表明，2025 年企业级智能体部署面临的最大障碍是缺乏 AI 治理模型和结构化的操作知识 19。

* **上下文熵增问题**：随着对话轮次增加，上下文链条不受控增长，导致推理延迟波动剧烈且成本飙升 19。  
* **可观测性缺失**：现有的 SRE 栈无法有效追踪非确定性问题，如模型产生的语义漂移或逻辑环路 19。  
* **操作知识非 AI 化**：大量的企业运维知识分散在非结构化文档中，标准化的索引搜索已不足以支持复杂的智能体推理 19。

### **8.2 未来发展趋势与建议**

1. **AI 控制平面（AI Control Plane）的崛起**：企业需要一个中心化的层级来管理风险、审计轨迹、执行 AI 评估，并实现人类在环（Human-in-the-loop）的治理 19。  
2. **认知增强优于完全自治**：在短期内，最高价值仍在于协助人类进行根因分析（RCA）和知识检索，而不是完全脱离人工的自主补救，因为后者仍面临问责边界不清晰的问题 19。  
3. **混合确定性系统**：智能体系统正朝着“概率推理+确定性执行”的混合模型发展，即由 LLM 生成逻辑输入，交给确定性的引擎（如技能脚本或传统代码）去执行具体操作 19。

## **结论**

AI 子智能体（Subagent）及其技能（Skill）系统正在重新定义计算的边界。通过将大型任务解构为专业化的子模块，并利用标准化的协议（ACP/MCP）和自演化框架（AgentEvolver），AI 系统已从“黑盒模型”进化为具备强韧性、可扩展性和自主演化能力的“协同生态” 18。

然而，安全性依然是决定这一技术能否在企业级市场大规模普及的生命线。针对技能包生态系统的 26.1% 漏洞率，行业必须建立强制性的安全审查、实施零信任架构，并从传统的沙箱化运行时转向更智能的观察驱动型防护 28。未来的竞争将不再仅仅取决于模型参数的大小，而取决于平台能否通过严谨的层级化规划与透明的反馈机制，在赋予 AI 代理权的同时，确保人类始终拥有最终的“撤销键”。通过持续的技能内化与终身学习，智能体将逐渐从人类的辅助工具转变为能够独立在动态数字环境中生存与进化的数字员工，推动企业迈向真正的“智能自治”时代。

#### **引用的著作**

1. Create custom subagents \- Claude Code Docs, 访问时间为 二月 2, 2026， [https://code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)  
2. Breaking Down Tasks: Master Task Decomposition for AI Agents \- Interactive | Michael Brenndoerfer, 访问时间为 二月 2, 2026， [https://mbrenndoerfer.com/writing/breaking-down-tasks-task-decomposition-ai-agents](https://mbrenndoerfer.com/writing/breaking-down-tasks-task-decomposition-ai-agents)  
3. Subagents in Claude Code: AI Architecture Guide (Divide and Conquer) \- Juan Andrés Núñez — Building at the intersection of Frontend, AI, and Humanism, 访问时间为 二月 2, 2026， [https://wmedia.es/en/writing/claude-code-subagents-guide-ai](https://wmedia.es/en/writing/claude-code-subagents-guide-ai)  
4. AgentOrchestra: A Hierarchical Multi-Agent Framework for General-Purpose Task Solving, 访问时间为 二月 2, 2026， [https://arxiv.org/html/2506.12508v1](https://arxiv.org/html/2506.12508v1)  
5. How we built our multi-agent research system \- Anthropic, 访问时间为 二月 2, 2026， [https://www.anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system)  
6. What are Hierarchical AI Agents? \- IBM, 访问时间为 二月 2, 2026， [https://www.ibm.com/think/topics/hierarchical-ai-agents](https://www.ibm.com/think/topics/hierarchical-ai-agents)  
7. How does AI Agent achieve task decomposition and hierarchical planning? \- Tencent Cloud, 访问时间为 二月 2, 2026， [https://www.tencentcloud.com/techpedia/126570](https://www.tencentcloud.com/techpedia/126570)  
8. Spring AI Agentic Patterns (Part 1): Agent Skills \- Modular, Reusable Capabilities, 访问时间为 二月 2, 2026， [https://spring.io/blog/2026/01/13/spring-ai-generic-agent-skills/](https://spring.io/blog/2026/01/13/spring-ai-generic-agent-skills/)  
9. Agent Skills: The Universal Standard Transforming How AI Agents Work \- Medium, 访问时间为 二月 2, 2026， [https://medium.com/@richardhightower/agent-skills-the-universal-standard-transforming-how-ai-agents-work-fc7397406e2e](https://medium.com/@richardhightower/agent-skills-the-universal-standard-transforming-how-ai-agents-work-fc7397406e2e)  
10. Agent skills explained: An FAQ \- Vercel, 访问时间为 二月 2, 2026， [https://vercel.com/blog/agent-skills-explained-an-faq](https://vercel.com/blog/agent-skills-explained-an-faq)  
11. Hierarchical Task Decomposition in AI Reasoning | by Padmajeet Mhaske \- Medium, 访问时间为 二月 2, 2026， [https://mhaske-padmajeet.medium.com/hierarchical-task-decomposition-in-ai-reasoning-8630500b81c0](https://mhaske-padmajeet.medium.com/hierarchical-task-decomposition-in-ai-reasoning-8630500b81c0)  
12. Building Collaborative AI: A Developer's Guide to Multi-Agent Systems with ADK, 访问时间为 二月 2, 2026， [https://cloud.google.com/blog/topics/developers-practitioners/building-collaborative-ai-a-developers-guide-to-multi-agent-systems-with-adk](https://cloud.google.com/blog/topics/developers-practitioners/building-collaborative-ai-a-developers-guide-to-multi-agent-systems-with-adk)  
13. AutoGen vs. CrewAI vs. LangGraph vs. OpenAI Multi-Agents Framework \- Galileo AI, 访问时间为 二月 2, 2026， [https://galileo.ai/blog/autogen-vs-crewai-vs-langgraph-vs-openai-agents-framework](https://galileo.ai/blog/autogen-vs-crewai-vs-langgraph-vs-openai-agents-framework)  
14. CrewAI vs LangGraph vs AutoGen: Choosing the Right Multi-Agent ..., 访问时间为 二月 2, 2026， [https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)  
15. 访问时间为 二月 2, 2026， [https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen\#:\~:text=CrewAI%20is%20highly%20customizable%20but,is%20less%20formal%20in%20structure.](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen#:~:text=CrewAI%20is%20highly%20customizable%20but,is%20less%20formal%20in%20structure.)  
16. Battle of AI Agent Frameworks: CrewAI vs LangGraph vs AutoGen | by Vikas Kumar Singh, 访问时间为 二月 2, 2026， [https://medium.com/@vikaskumarsingh\_60821/battle-of-ai-agent-frameworks-langgraph-vs-autogen-vs-crewai-3c7bf5c18979](https://medium.com/@vikaskumarsingh_60821/battle-of-ai-agent-frameworks-langgraph-vs-autogen-vs-crewai-3c7bf5c18979)  
17. AI Agent Memory: A Comparative Analysis of LangGraph, CrewAI, and AutoGen, 访问时间为 二月 2, 2026， [https://dev.to/foxgem/ai-agent-memory-a-comparative-analysis-of-langgraph-crewai-and-autogen-31dp](https://dev.to/foxgem/ai-agent-memory-a-comparative-analysis-of-langgraph-crewai-and-autogen-31dp)  
18. The Secret Language of AI: How Agent Communication Protocols ..., 访问时间为 二月 2, 2026， [https://medium.com/@drajput\_14416/agent-communication-protocol-forging-the-future-of-interoperable-ai-agents-e64be058b22d](https://medium.com/@drajput_14416/agent-communication-protocol-forging-the-future-of-interoperable-ai-agents-e64be058b22d)  
19. AIOps: What we learned in 2025 | Thoughtworks United States, 访问时间为 二月 2, 2026， [https://www.thoughtworks.com/en-us/insights/blog/generative-ai/aiops-what-we-learned-in-2025](https://www.thoughtworks.com/en-us/insights/blog/generative-ai/aiops-what-we-learned-in-2025)  
20. How Are Feedback Loops Integrated into Agentic AI Architectures?, 访问时间为 二月 2, 2026， [https://www.womentech.net/how-to/how-are-feedback-loops-integrated-agentic-ai-architectures](https://www.womentech.net/how-to/how-are-feedback-loops-integrated-agentic-ai-architectures)  
21. How to Build Feedback Loops in Agentic AI for Continuous Digital Transformation, 访问时间为 二月 2, 2026， [https://www.amplework.com/blog/build-feedback-loops-agentic-ai-continuous-transformation/](https://www.amplework.com/blog/build-feedback-loops-agentic-ai-continuous-transformation/)  
22. AgentEvolver: Towards Efficient Self-Evolving Agent System \- arXiv, 访问时间为 二月 2, 2026， [https://arxiv.org/html/2511.10395v1](https://arxiv.org/html/2511.10395v1)  
23. AgentEvolver: Towards Efficient Self-Evolving Agent System \- Emergent Mind, 访问时间为 二月 2, 2026， [https://www.emergentmind.com/papers/2511.10395](https://www.emergentmind.com/papers/2511.10395)  
24. AgentEvolver: Towards Efficient Self-Evolving Agent System \- ResearchGate, 访问时间为 二月 2, 2026， [https://www.researchgate.net/publication/397595568\_AgentEvolver\_Towards\_Efficient\_Self-Evolving\_Agent\_System](https://www.researchgate.net/publication/397595568_AgentEvolver_Towards_Efficient_Self-Evolving_Agent_System)  
25. A Benchmark for Self-Evolving Agents via Experience-Driven Lifelong Learning, 访问时间为 二月 2, 2026， [https://openreview.net/forum?id=vznmtmUPmA](https://openreview.net/forum?id=vznmtmUPmA)  
26. AI与人｜AI智能体决策不应架空人类“数字主权” \- 科技日报, 访问时间为 二月 2, 2026， [https://www.stdaily.com/web/gdxw/2026-01/30/content\_468390.html](https://www.stdaily.com/web/gdxw/2026-01/30/content_468390.html)  
27. 什么是AI 智能体安全？ \- IBM, 访问时间为 二月 2, 2026， [https://www.ibm.com/cn-zh/think/topics/ai-agent-security](https://www.ibm.com/cn-zh/think/topics/ai-agent-security)  
28. AI代理技能生态安全大调查：超过四分之一的技能包存在安全漏洞 ..., 访问时间为 二月 2, 2026， [https://www.techwalker.com/2026/0128/3177944.shtml](https://www.techwalker.com/2026/0128/3177944.shtml)  
29. How do intelligent agents isolate themselves in a secure sandbox? \- Tencent Cloud, 访问时间为 二月 2, 2026， [https://www.tencentcloud.com/techpedia/126222](https://www.tencentcloud.com/techpedia/126222)  
30. Securely deploying AI agents \- Claude API Docs, 访问时间为 二月 2, 2026， [https://platform.claude.com/docs/en/agent-sdk/secure-deployment](https://platform.claude.com/docs/en/agent-sdk/secure-deployment)  
31. Sandboxing in the Gemini CLI, 访问时间为 二月 2, 2026， [https://geminicli.com/docs/cli/sandbox/](https://geminicli.com/docs/cli/sandbox/)  
32. How Observability-Driven Sandboxing Secures AI Agents, 访问时间为 二月 2, 2026， [https://arize.com/blog/how-observability-driven-sandboxing-secures-ai-agents/](https://arize.com/blog/how-observability-driven-sandboxing-secures-ai-agents/)  
33. Practical Security Guidance for Sandboxing Agentic Workflows and Managing Execution Risk | NVIDIA Technical Blog, 访问时间为 二月 2, 2026， [https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/](https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAYCAYAAAAYl8YPAAAAXElEQVR4XmNgGAWjYIQABXQBSkArugAlgB+Ig9AFKQEXgVgeXZBcwA3Ei4FYBl1iGhDPIgMvAOJfQNzHgASoahg5AGTYdnRBcsEVBipFgAsQC6ILkguommhHMgAAbC0a/+RrKe8AAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAZCAYAAACsGgdbAAACDUlEQVR4Xu2WzysFURTHj1CKkiwk6m1EsrAQRdnZUCxYUP4AZWlBkbKRlIXERkoWsrGTncVkpfwBVopSFnaKovw4X+dd7/qaNzPMxOZ96lvvfc+dmTP33HvmipQoUSI1laoGVSMpCbj2RFXLgQSUqS5UOQ6EMa96i9Cuqu1zdAE8ZFbVwoEfgHvjJRPzKJYUsyrm95N/JDYTacCLrqu6OFAMJPLKpjIsFtsg/0m1RN5vQIKbYglHUieWyDEHlEOx2JTnNanOxa7LAtx/gk2mU2wg1idzJxar97wB1b4kePuE4P47bDIYcKNqlsJun1Zdi63J6sLQDzB+lDzHmHzffL5QWgbPgYqCkqF0fDOszwVvnKNKbFkMckDpUd1K4aWWJXwJMXj+PZs+KDUG+KUuV72onj3PUaMKJHxHnqrGvf9nYonGEage2PTZFZs5lNrH9U9OJipJBm2tm80QAolJ0pUaZfRxu7qd/KRJ4n6XYus7jkBiknTrj4GHWFib2RPrn1FMyvfeWozIjYMWgkSwsxm3gTBzADPekf89o5rL/w6jQnUgX3trFNgTAZs4QPBuhvyGupb3VvLKebG4Zo6lgPIlKTXAc0bYTAJmuVW1rVqkGGYKn8Ve8h3oDn1sFgGVuhJ78czJ8oDhllHm4FSEFpMGJIfPblaf11D+7NCbFmywLbF1+hOGJN2B+f95B3uPfVM3vYKPAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAZCAYAAABggz2wAAAC5klEQVR4Xu2X24tPURTHl1wi90ZEaoakXKZMihTyorzw4BJ/ggdePJAoo2n+AOXFpCZPSvIiL/LwixdFpEgphZQoKUW5W99Ze42112/vs8+PM1J+n/rWb6+1z+/stfbal0PUpUuXLv8QM117epBlHmty+D2VNc34lA2sV944AZxh3WbNcHa8e4+zRfxIaLfxz2fdcf4jxq88YQ15Y4MgwSdZp1kHWCPBpuxnvTbtJItJArjlHYbHrF5vDGxnHfLGhsH4zle0AcZxzNkiZpM8+Nw7An0kGUsxhXWRtcw7GmQN6x1rrbFhvC3TBrNIJmSRs0fgwY/eyGxhvfBGAzKIZyeKTaxPrB3OnpuYLySJz6Lrz3OTddwbDdconSDPNtZeitdVHc6SjMvO0qRgaxmb8jQoSypQlAzqvor3VL22j5L0Ue5T+1qDUHYpvpP4kSTV4WAbNv2UC9QeR8QHijsg85dI1mAVGMgNbzS8ZF0Ov3Fs4R02UH1v7j2aiJR2mX4Kgq8MFAOymcXm82zcmwfPIIs54MfxBFBy+L3ul3usJPtN24Lg8fwjY8N/jJKcm8uNXSnuGS2SDktJ/uw65cvJUgoUs21nwZ7RJfTYs0fGZpINx29OSjFQre31rI1BdSgFOofkkNdAH7B6oh55NNCdxqalOdfYLMVAcdtBh7skg6kL1ljLG0k2sW8U36IwcJThAmNbydpq2hZUFP4fyVcwxlHT9hQ3I2QNHTC41CLPga08dZ5pZu2ujTNx0LQB3od+WC4pUKYoV9BHctXsHfe2g6WC5GRZxXrLWuEdBXKlgl37BOsNyYXjK+tc1EO4R7JzY7ZT4Gr5meTScMX5UiAxVTM+VianvLEGenPJHQ/YVRFE1UUBSc4FCjA2fEHVAUnvpCI74k8u9ShZ3H6aAOM46I1Ngtl6yFroHTXA7auTzS8Hvk+vUn43bozf/fBeTdVlXZfih3eT4MYz4I1/gSWsfZTfuf8PfgLBvK34g60jjwAAAABJRU5ErkJggg==>