# **AI 子智能体与技能系统：深度研究问答报告**

## **第一部分：架构与协作逻辑**

**Q1：什么是 AI 子智能体（Subagent），它与普通智能体有何不同？** 子智能体是运行在独立上下文窗口中、拥有专属系统提示词和工具访问权限的专业化 AI 助手 1。与普通智能体相比，它的核心优势在于**关注点分离**：它能将复杂的任务路径从主对话中剥离，在隔离的环境（沙箱）中执行任务，只向主智能体返回高度浓缩的执行结果，从而保护主对话的清洁度并降低 Token 消耗 1。

**Q2：如何以“饭店经营”来具象化理解智能体的角色分工？**

在多智能体架构中，我们可以将饭店角色映射如下：

* **餐厅经理 (Manager Agent)**：负责“仰望星空”，接收顾客总目标（如办婚宴），分析并分发任务，通过自动摘要技术防止大脑被琐事填满。  
* **行政主厨 (Planner Agent)**：负责“战术细化”，利用其专家级背景设定监督后厨，审核菜品质量，并在员工出错时触发纠错循环。  
* **灶台厨师 (Subagent)**：负责“脚踏实地”，在隔离的厨房（沙箱）里专心干活，只需加载特定的“烹饪技能包”即可执行任务 1。

**Q3：经理智能体（Manager Agent）如何确保流程不会跑偏？**

经理智能体充当团队的“大脑”和“质检员”。它通过 planning=True 机制分析全局目标并生成步骤说明。当子智能体提交结果时，经理会依据 TaskOutput（如 JSON 或 Pydantic 对象）进行验证。如果质量不达标，经理可行使职权要求重新处理，确保前一环节的错误不会流入后续步骤。

## **第二部分：技能系统与技术标准**

**Q4：智能体的“技能”（Skill）究竟是如何定义的？** 技能并非一段随意的文本，而是一个**标准化、模块化**的文件夹 4。其核心构成如下：

* **SKILL.md (核心指令)**：包含 YAML 元数据和详细的 Markdown 格式标准作业程序（SOP） 4。  
* **scripts/ (执行脚本)**：包含 Python 或 Bash 脚本，用于执行复杂的财务计算或系统重构，以提高确定性并节省 Token 4。  
* **references/ (知识参考)**：存储长篇文档或法律标准，仅在需要时“按需加载” 4。

**Q5：技能（Skill）与模型上下文协议（MCP）有什么本质区别？**

两者的关系可以类比为“操作手册”与“物理插座”：

* **MCP 是“插座” (Infrastructure Layer)**：一种通信协议，定义 AI 如何物理连接到外部世界（如数据库、Slack），解决的是“如何接入”的问题。  
* **Skill 是“手册” (Methodology Layer)**：一个能力包，定义了执行特定任务的逻辑和决策准则，解决的是“如何做事”的问题。  
* **协作关系**：Skill 通常会指挥 MCP 提供的工具。例如，审计 Skill 定义流程，通过 MCP 连接的数据库工具提取数据。

## **第三部分：上下文管理与安全性**

**Q6：长链路任务中，经理智能体的对话会被子智能体的输出淹没吗？** 这种风险被称为\*\*“上下文熵增”\*\* 5。系统通过以下机制应对：

* **自动摘要 (respect\_context\_window)**：当对话接近 Token 上限时，系统自动对历史任务进行摘要压缩，仅保留关键信息。  
* **物理隔离**：子智能体内部的详细推理过程保留在私有上下文中，主对话仅接收最终的结构化结果。

**Q7：为什么三层架构比两层架构更稳定？** 三层架构引入了**中层智能体**作为“信息过滤器” 6。中层智能体向上汇总结果、向下细化指令，能实现高达 ![][image1] 的上下文压缩率，有效防止高层战略智能体因底层工具调用的琐碎细节而过载。

**Q8：如何保障子智能体执行操作时的安全性？**

随着智能体获得更高的自主权，安全防护必须从“内容”转向“执行”：

* **沙箱隔离**：使用内核级隔离技术（如 gVisor 或 Docker）限制智能体访问宿主系统权限 7。  
* **观察驱动沙箱 (Observability-Driven Sandboxing)**：在执行层拦截每一次工具调用，依据预设策略（如“禁止读写 workspace 外的文件”）决定是否允许执行 10。  
* **双重授权**：在涉及资金划转等高价值环节，系统强制触发“人工批准”开关，将最终决定权归还人类 11。

---

**结论：** 未来智能体的竞争将取决于平台能否通过严谨的层级化规划、高效的上下文压缩和零信任安全架构，在赋予 AI 代理权的同时，确保人类始终拥有最终的“撤销键”。

#### **引用的著作**

1. Create custom subagents \- Claude Code Docs, 访问时间为 二月 2, 2026， [https://code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)  
2. Subagents in Claude Code: AI Architecture Guide (Divide and Conquer) \- Juan Andrés Núñez — Building at the intersection of Frontend, AI, and Humanism, 访问时间为 二月 2, 2026， [https://wmedia.es/en/writing/claude-code-subagents-guide-ai](https://wmedia.es/en/writing/claude-code-subagents-guide-ai)  
3. How we built our multi-agent research system \- Anthropic, 访问时间为 二月 2, 2026， [https://www.anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system)  
4. Agent skills explained: An FAQ \- Vercel, 访问时间为 二月 2, 2026， [https://vercel.com/blog/agent-skills-explained-an-faq](https://vercel.com/blog/agent-skills-explained-an-faq)  
5. AIOps: What we learned in 2025 | Thoughtworks United States, 访问时间为 二月 2, 2026， [https://www.thoughtworks.com/en-us/insights/blog/generative-ai/aiops-what-we-learned-in-2025](https://www.thoughtworks.com/en-us/insights/blog/generative-ai/aiops-what-we-learned-in-2025)  
6. What are Hierarchical AI Agents? \- IBM, 访问时间为 二月 2, 2026， [https://www.ibm.com/think/topics/hierarchical-ai-agents](https://www.ibm.com/think/topics/hierarchical-ai-agents)  
7. How do intelligent agents isolate themselves in a secure sandbox? \- Tencent Cloud, 访问时间为 二月 2, 2026， [https://www.tencentcloud.com/techpedia/126222](https://www.tencentcloud.com/techpedia/126222)  
8. Securely deploying AI agents \- Claude API Docs, 访问时间为 二月 2, 2026， [https://platform.claude.com/docs/en/agent-sdk/secure-deployment](https://platform.claude.com/docs/en/agent-sdk/secure-deployment)  
9. Sandboxing in the Gemini CLI, 访问时间为 二月 2, 2026， [https://geminicli.com/docs/cli/sandbox/](https://geminicli.com/docs/cli/sandbox/)  
10. How Observability-Driven Sandboxing Secures AI Agents, 访问时间为 二月 2, 2026， [https://arize.com/blog/how-observability-driven-sandboxing-secures-ai-agents/](https://arize.com/blog/how-observability-driven-sandboxing-secures-ai-agents/)  
11. AI与人｜AI智能体决策不应架空人类“数字主权” \- 科技日报, 访问时间为 二月 2, 2026， [https://www.stdaily.com/web/gdxw/2026-01/30/content\_468390.html](https://www.stdaily.com/web/gdxw/2026-01/30/content_468390.html)  
12. Practical Security Guidance for Sandboxing Agentic Workflows and Managing Execution Risk | NVIDIA Technical Blog, 访问时间为 二月 2, 2026， [https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/](https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAXCAYAAACmnHcKAAACeElEQVR4Xu2Wv2sVQRDHJ2hA8fcPFEERQQI2igixEbFQrBTBRjBVKntBQbAKkjaIKIghEUvtREQUc2KphYIgJFhEhJA/IMEfhPj9vtnl5s3t3rsnKBb3gS/vZnbvdmdndveJtLS0tPwnHIUmoY3QN2i0u7nDBugRtMU3RG5DL6B1vsExAA1B96G7oh/+Uz5BD4y9HnoKHQj2dWgVuiTlxPk7Dy0FO8k70RdTWgl9BqHX0PZgb3bt/XBG9N2Hxncu+LhgZJvoeJ5CarJCGO1z0RW3+gFdC31OiaZ9TbDJnOgE4mo2YZdoVnwwMRMRllphbDIMHXe+Cs+kWmIXoYPGviU6GPtGLgcfJ9KUD9BhqQZzAvolZenuhd6XzZ1FLYydZauzGcQX5zsCLUMXjK/fYHZAI6Kr7oPZDX2Gdgabe2WmbO7Mp2dWUnAjTnhnAh4cnNR535CAe2FMdO+lgiGsBmaAfT9K+V3ukejvi33QHWn2IidUe7IYCuhKeM4FQ1jue4zNfTJrbGZnGjopDebIkmmy0hyEJxlXsxcclNnm8UvqgvEUUh5C/M5PaFw0wNqxGQQHYf3W8Qr66p0ZWCIvna9pMMwCFy3Csj4dntdCT0xbhbgHOFgO1jw34yHjq+t/TLQU+d2U2MY+Hi5CIWUpbYLeSnff2oNnQXSAHEz3G+fj5cYLz8J6ZtA5uCd6ZYYLZrPCd+alOxieplniCuZg+2Ppvlh52doB4u1+z/g8vYJJnV6pzNwwzxV44+eC4cC+RKJsme0X3aS8T1L4d32ZcZ/4Oy7CP6JTolnn5uffsCzscNM7/zEz0FXvNHwXrYZF6Kxra2n52/wGlbCVHrAUYCsAAAAASUVORK5CYII=>