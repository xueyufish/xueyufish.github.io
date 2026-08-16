---
layout:     post
title:      "Claude 图工程：从 0 到图架构师的 14 步路线图"
description: "使用 Claude 进行图工程（Graph Engineering）的 14 步完整路线图：从图基础概念、知识图谱与图数据库入门，到图嵌入、图检索增强生成与图架构设计，逐步进阶成为图架构师。"
date:       2026-07-22
author:     "yuxiumin"
keyword:    "Graph, Graph Engineering, 图工程, 知识图谱, Claude, 图数据库, yuxiumin"
tags:
    - AI
    - AI Agent
    - Graph Engineering
    - Graph
---

***译自： [https://x.com/0xCodez/article/2079165300625330317](https://x.com/0xCodez/article/2079165300625330317)***

![从线性流程到图状结构的路线图](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image.png)

大多数尝试构建多步骤代理的人最终都会得到一条直线。第一步、第二步、第三步——每一步都礼貌地等待前一步完成才开始。

**9/10 注意到其中一半步骤根本不需要等待。**

它们不进行**路由，** 不进行**分支，** 也不进行**并行处理。** 它们只是排队——一次处理一个任务，一个上下文，一件事情，直到窗口填满 Agent 忘记了它正在做的事情。

这是一份包含 **14 个步骤的路线图**，它能将那种单列纵队式的流程转化为一种**图状结构**：这种结构在整个机群中呈放射状展开，能够自行验证所获信息，并最终汇聚成单个智能体凭一己之力无法得出的结论。

![工作形态本身即图](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-1.png)

这就是没人明说的转变。Prompt 就是一个句子，loop 就是一个周期，harness 就是 agent 站立的地面。

然而，**工作本身的形态**——即各项任务的先后顺序、哪些可以并行、哪些必须等待其他任务完成——这种形态就是一个图（graph）。节点负责处理逻辑，而边则负责传递结果。

Claude Code 发布了用于直接构建这些图的工具： **动态工作流** 。

Claude 编写了一个简单的 JavaScript 编排脚本，然后生成一个协调的子代理集群来执行它——而协调本身不需要任何模型令牌，因为它是代码，而不是对话。

## 01. 节点代表工作，边代表流动的信息

图只有两个要素，搞清楚这两点就能消除大部分困惑。 **节点**代表一个工作单元——一个agent、一个有界任务、一个输入和一个输出。

边是一种依赖关系：它表示这个节点的输出为另一个节点的输入提供信息。 **仅**此而已。

![节点代表工作，边代表流动的信息](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-2.png)

错误在于将 “然后” 视为一个边界。“总结文件 ，然后告诉我天气” 这两者之间没有边界——天气信息并不会取代总结的内容。

这是两个不相连的节点，线性脚本不必要地将它们连接起来。只有当数据实际流经该边时，边才存在。

对于智能体中的每一个 “然后”，都要学会问自己： **下一步是否读取了上一步的输出？** 如果没有，就没有边，等待就是浪费时间。

```text
Draw it as boxes and arrows. A box is an agent() call. 
An arrow is a variable passed from one call’s return into another’s 
prompt. If you can’t draw the arrow - if no variable crosses - the two 
boxes are independent, and independence is the thing you’ll exploit 
for the rest of this course.
```

## 02. 你的线性脚本是一个退化图

当你把一个智能体描述成 “先执行 A，再执行 B，再执行 C，最后执行 D” 时，你就画了一个图——一条单一的、没有分支的链。每个节点都恰好有一条入边和一条出边。

它运行正常。但它运行缓慢且脆弱，因为链式调用没有冗余：如果 C 停滞，D 就不会发生，A 的工作就会被困在上游，无处可去。

![线性脚本是退化图](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-3.png)

图论工程的首要技能是**重绘链** 。选取你的线性 agent，并对每个箭头提出第一步提出的问题。

大多数链式结构都有两到三个箭头，这些箭头不承载数据——它们只是你碰巧输入内容的顺序。

切断这些箭头，链条就会坍缩成更宽的东西：几个独立的节点，它们可以同时运行，为需要所有这些节点的单个节点提供动力。

## 03. 给每个节点一个合约

无法进行推理的节点就无法并行化。解决方法是设定一个契约：**输入有限，输出有限，且只能执行一个任务。**

输入是节点读取的任何内容——显式传递，绝不会从共享窗口中假定。输出是已定义的格式，理想情况下经过验证，以便下一个节点无需猜测即可使用。

![给每个节点一个合约](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-4.png)

在工作流程中，这种约定是通过**模式**来强制执行的 。当你向 Claude 发送一个带有 JSON 模式的 agent() 调用时，Claude 生成的子代理会被强制返回经过验证的结构化数据——验证发生在工具调用层，因此 Claude 会在不匹配时重试，而不是返回需要你自行解析和猜测的自由文本。

这就是 Claude 可以将节点连接到图中的节点与只有当人读取其输出时才起作用的节点之间的区别。

```javascript
// A node with a real contract: bounded in, validated out, one job.
const ITEM = {
  type: 'object', additionalProperties: false,
  properties: {
    title:   { type: 'string' },
    url:     { type: 'string' },
    impact:  { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['title', 'url', 'impact'],
};

const result = await agent(source.prompt, {
  label:  \`research:${source.key}\`,
  schema: ITEM,           // forces validated structured output
  agentType: 'general-purpose',
});
// result is now a shape the next node can trust — not free text.
```

## 04. 将边视为数据契约

一条边不仅仅是 “B 在 A 之后”。它还承诺了哪些东西会交叉：A 生成这种形状，而 B 的设计初衷就是为了使用这种形状。当你用数据（而不是顺序）来命名这条边时，两件事就变得更容易了。

![边是数据契约](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-5.png)

你可以一眼看出这条边是否真实（即数据是否真的在传输），而且只要整体形状保持不变，你就可以互换两端的节点，而不会破坏图的结构。

用纯 JavaScript 实现的。扇出和综合之间的简化步骤——展平、去重、过滤——只是对节点返回的形状进行操作的代码。

在实践中，“边”（edge）逻辑是用原生 JavaScript 编写的。位于“扇出”（fan-out）与“合成”（synthesis）步骤之间的处理环节——即扁平化（flatten）、去重（dedupe）和过滤（filter）——本质上就是针对各节点返回的数据结构进行操作的代码。

**无需智能体。** 这是“图思维”带来的一个不那么显眼却极具价值的优势：人们消耗模型 Token 的大量场景，本质上其实是在处理 “边”（edge），而 “边” 的成本是零。

```text
The temptation is to spawn an agent to “combine the results.” Resist 
it. If combining means flatten-and-dedupe, that’s results.flatMap(...) 
and a Set — deterministic, instant, zero tokens. Save agents for 
judgment, not for plumbing. A graph where every edge is an agent is a 
graph paying rent on its own wiring.
```

## 05. 使用 parallel() 进行扇出

这一招能让一切付出都物有所值。当你面对 N 个独立节点时——无论是需要核查的 N 个源头、需要审阅的 N 份文件，还是需要审计的 N 条路径——切勿将它们串联起来。

你指示 Claude 将它们展开并同时运行。在 `parallel()` 工作流中，Claude 接收一个 `thunk`（待执行函数）数组，并为每个 `thunk` 启动一个子代理（subagent）进行并发执行，最后将结果数组返回给你。

![使用 parallel 进行扇出](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-6.png)

两个细节赋予了它稳健性。首先，`parallel()` 充当了**屏障**（barrier）——它会等待所有 thunk 执行完毕才返回，从而确保下一阶段能接收到完整的结果集。其次，如果某个 thunk 抛出异常，其结果会被解析为 `null`，而不会导致整批任务失败；这意味着即便某个代理（agent）不稳定，也不会拖垮整个运行过程。

务必对结果使用 `.filter(Boolean)` 进行过滤。并发数受限于 CPU 核心数及队列容量，因此即便传入上百个 thunk，它们也都能顺利完成——只是会分批次、每次少量地执行。

```javascript
phase('Research');

// Nine sources, nine agents, all at once.
const raw = await parallel(
  SOURCES.map((s) => () =>
    agent(s.prompt, {
      label: \`research:${s.key}\`,
      phase: 'Research',
      schema: ITEM_SCHEMA,     // each node returns validated JSON
      agentType: 'general-purpose',
    }),
  ),
);

const collected = raw.filter(Boolean);  // drop the nulls from failed agents
```

“扇出”（fan-out）逻辑存在于 Claude 编写的代码中，而非模型对话本身。Claude 自身的上下文从未同时容纳九个来源——每个子智能体（subagent）各自处理其专属的来源，最终仅返回最终答案。

正是这一点让 Claude 能够扩展工作流，调用**数十甚至数百个子智能体**，而不会导致会话不堪重负。编排层不消耗任何 Token，因为它并不涉及 Claude 的新一轮思考过程。

## 06. 在屏障处汇入

扇出只有在被某个东西收集时才有用。扇入是边汇聚的节点——一个代理（或一段代码）在这里一次性看到所有上游结果，并执行需要整个数据集的操作：跨源去重、按影响排序、如果结果为空则提前退出。这是屏障真正体现其运行时间成本的地方。

![在屏障处汇入](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-7.png)

保持图（graph）运行高效的准则：**仅当某个阶段确实需要汇总之前的所有结果时，才使用屏障（barrier）。** 需要跨所有数据源进行去重？使用屏障——这是正确的做法。

```javascript
// The edge: plain JS, no agent, zero tokens.
const flat = collected.flatMap((c) => c.items);
log(\`Collected ${flat.length} items\`);

phase('Curate');
// The barrier node: needs the WHOLE set to dedupe + rank.
const curated = await agent(
  \`Dedupe and rank these by impact:\n${JSON.stringify(flat)}\`,
  { phase: 'Curate', schema: CURATED_SCHEMA },
);
```

只是把列表展开？这属于特殊情况，直接在行内处理即可。判断标准既简单又严苛：如果你写出了“并行处理 → 转换 → 并行处理”这样的流程，且中间的转换步骤不涉及跨元素依赖，那么你应该使用流水线（pipeline）模式，从而完全省去中间的同步屏障（barrier）。

## 07. 菱形：拆分 → 执行 → 合并

将“扇出”与“扇入”结合起来，便构成了各类严谨智能体图中的主力拓扑结构：**菱形**。

由一个节点负责拆分任务，多个节点并行执行，最后由一个节点进行汇总。无论是市场扫描、依赖项审计、代码审查还是研究报告，其背后的运作模式都是如此——只需替换数据源和提示词（prompt），这一通用架构便能灵活适配各种场景。

![菱形拓扑：拆分、执行、合并](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-8.png)

这种典型模式有一个值得记住的名称：**分发（fan out）→ 归约（reduce）→ 综合（synthesize）**。先 “分发” 以广集信息，再利用简单代码进行 “归约” 以精简内容，最后由一个智能体进行 “综合” 以撰写答案。

一旦你看到了那个 “钻石” 形状（流程图中的分支与合并结构），你就不再纠结于 “如何让智能体（agent）执行更多步骤”，而是开始思考 “哪里需要分流，哪里需要汇合” ——这才是真正能实现规模化扩展的问题。

## 08 在运行时使用条件路由边缘

并非所有图结构都是固定的。有时，具体选择哪条边取决于节点处理后的结果。**路由节点**会检查结果并决定触发哪条下游路径——例如，对工单进行分类后将其分发给相应的处理程序，或者根据差异的大小决定是进行快速审查还是启动全面审计。

在工作流程中，这只是节点验证输出上的一个 JavaScript if 或 switch 语句，因为控制流存在于代码中。

![条件路由边缘](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-9.png)

这正是 “确定性” 成为一种特性而非局限之处。路由决策可以由 Claude 驱动（由子智能体进行分类），但具体的路由逻辑是由 Claude 编写的代码——这意味着对于相同的分类结果，其执行方式始终如一。

你既能获得 Claude 在节点处的判断能力，又能享有脚本在边缘侧的可靠性。你不会遇到“Claude 擅自跳过审计”这类突发状况——因为若要跳过审计，必须将其明确写入图（graph）逻辑中，而实际并未包含这一步。

```javascript
// Router node: an agent classifies, code picks the edge.
const { severity } = await agent(
  \`Classify this diff's risk:\n${diff}\`,
  { schema: { type: 'object',
      properties: { severity: { enum: ['low', 'high'] } },
      required: ['severity'] } },
);

let review;
if (severity === 'high') {
  // heavy path: full parallel audit
  review = await parallel(FILES.map((f) => () => agent(\`Audit ${f}\`)));
} else {
  // light path: one quick pass
  review = await agent(\`Quick review of ${diff}\`);
}
```

## 09. 在边缘放置一个验证器

图真正的优势不在于拥有更多的智能体，而在于你能围绕它们构建某种结构，从而建立信任。

验证节点位于结果向下游传递前的关键关口，其唯一职责就是试图否决该发现。如果发现能经受住考验，便获准通过；否则，它将无法得出最终结果。

![在边缘放置验证器](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-10.png)

有三种模式值得你掌握。

- **对抗性验证：** 针对每一项发现，指派 N 个独立的质疑者尝试对其进行反驳；仅当多数质疑者未能成功反驳时，才保留该发现。
- **多视角验证：** 为每位验证者设定不同的侧重点——如正确性、安全性、可复现性等——因为这种多样性能够发现那些由 N 次完全相同的检查所无法察觉的故障模式。
- **评审小组：** 从不同角度生成 N 个方案，由多个评审并行评分；选出优胜方案，并融合其他方案中的最佳特质。

这正是让一个真正的团队能够移植 Bun 运行时的模式，其开发流程中内置了对抗性代码审查环节。

## 10. 隔离节点，防止单个故障导致整个图崩溃

在链式结构中，故障会产生连锁反应——C 失败，D 便无法运行，整个流程随之停滞。而在图状结构中，故障应当**局限于其所在的节点**。

这一点在某种程度上已经是事实了：在 `parallel()` 内部抛出异常的 thunk 会解析为 `null`，因此八个正常的代理（agent）仍能返回结果，而那个出错的代理则会退出。你使用的 `.filter(Boolean)` 正是应对这种情况的手段。在设计 “扇入”（fan-in）逻辑时，应确保其能够容忍缺失的输入，而不是预设必须接收到完整的输入集。

![隔离节点防止故障扩散](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-11.png)

一种更隐蔽的故障是各个节点之间发生冲突（互相干扰）。当多个代理（agent）并行写入文件时，可能会产生冲突。解决之道在于 “隔离”，即使用 “工作树”（worktree）机制：让每个代理在独立的 Git 工作树中运行，在沙箱环境中执行任务，最后干净地合并结果。只有在节点确实需要并行写入时，才应采用这种方案；它就像是专为特定拓扑结构配备的安全带，而非每次运行都必须承担的额外负担。

## 11. 添加一个循环——但要确保其收敛

有时，只有真正着手去做，你才会意识到任务的规模有多大：比如在探索过程中发现任务量远超预期，或者在排查 Bug 时，每修复一个又牵扯出另外三个。这就需要一个“**循环**”——即一种受控机制，能让你回溯到之前的某个节点。

危险显而易见：一个无法收敛的循环会演变成无限循环，不断生成智能体，直至耗尽你的预算。

![添加收敛的循环](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-12.png)

最终奏效的模式是 “**持续搜索直至无新发现**”（loop-until-dry）：不断生成搜索器（finder），直到连续 K 轮都一无所获时才停止。其中决定成败的关键细节——也是初次尝试者几乎都会犯的错误——在于你究竟依据什么来进行去重。

去重时应针对所有已见内容，而不仅仅是针对已确认的结果。否则，被拒的发现会在每一轮中卷土重来，导致循环永无止境；最终，你构建的系统只会不断花钱去重复探索那些死胡同。

```javascript
const seen = new Set(); 
const confirmed = []; 
let dry = 0;

while (dry < 2) {                       // stop after 2 empty rounds
  const found = (await parallel(
    FINDERS.map((f) => () => agent(f.prompt, { schema: BUGS }))
  )).filter(Boolean).flatMap((r) => r.bugs);

  const fresh = found.filter((b) => !seen.has(key(b)));
  if (!fresh.length) { dry++; continue; } // nothing new → toward dry
  dry = 0;
  fresh.forEach((b) => seen.add(key(b))); // dedupe vs SEEN, not confirmed

  // diverse-lens verify each fresh finding before it counts
  const judged = await parallel(fresh.map((b) => () =>
    parallel(['correctness', 'security', 'repro'].map((lens) => () =>
      agent(\`Judge "${b.desc}" via ${lens} — real?\`, { schema: VERDICT })))
    .then((v) => ({ b, real: v.filter(Boolean).filter((x) => x.real).length >= 2 }))));

  confirmed.push(...judged.filter((v) => v.real).map((v) => v.b));
}
```

## 12. 对节点上的模型进行分层

并非每个节点都需要你最强大的模型。图结构能以一种单体智能体无法比拟的方式清晰地揭示这一点：有些节点的任务是受限且重复的（例如提取某个字段、对工单进行分类），而另一些节点则承担着真正的判断职能（例如综合分析报告、裁定调查结果）。

在成本较低的机型上运行那些枯燥的节点，将昂贵的算力资源投入到真正需要进行判断的环节。

![对节点上的模型分层](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-13.png)

在工作流中，Claude 派生的每个子智能体都会继承您的会话模型（除非脚本另行指定），因此默认情况下，整个运行过程都将完全按照您的会话层级计费。而在调用单个 `agent()` 时使用模型选项，则是指示 Claude 仅将该特定节点路由至其他模型。

**在大规模运行前先检查 `/model` 设置，** 然后让 Claude 将“扇出”（fan-out）结构中的重复性节点分配给成本更低的模型处理，同时保留“合并”（merge）节点使用原模型。这是在不改变计算图结构的前提下，将一个极度消耗 Token 的流程从高成本转变为经济高效的关键手段。

## 13. 拓扑结构决定了您的成本与延迟

图的形态绝非仅仅关乎外观，它实际上是决定实际运行耗时（wall-clock time）的最关键因素。最容易让人栽跟头的抉择在于：是选择 `parallel()` 还是 `pipeline()`？使用 `parallel()`屏障（barrier）时，后续阶段必须等待所有节点中耗时最长的一个完成后才能开始。

`pipeline()`让每个数据项独立流经所有处理阶段，且不设屏障——这意味着当数据项 B 尚处于第 1 阶段时，数据项 A 可能已进入第 3 阶段。处理速度快的数据项会先行完成，而不会因滞后于处理速度慢的数据项而闲置等待。

![拓扑决定成本与延迟](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-14.png)

## 14. 让 Claude 绘制图表——自路由

最后一步是，对于无法提前规划的任务，停止手工绘制图表。

借助**动态工作流**，您只需描述目标，Claude 便会自行编写编排脚本——包括拆解任务、选择分发策略、启动协同工作的子智能体集群以及汇总最终结果。您将获得专为此轮任务量身定制的流程图，而不再是那种试图“放之四海而皆准”的固定流程图。

![让 Claude 绘制图表](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-15.png)

有三种调用方式。只需在提示词中输入 **“workflow”**（工作流），Claude 就会为该任务生成一个工作流。你也可以运行已保存或内置的工作流——例如 `/deep-research`，这是一个已在生产环境中部署的实际图结构工作流，其核心流程为：界定范围 → 并行搜索 → 获取信息 → 对抗性验证 → 综合汇总，这正是本课程所讲授的架构蓝本。

或者开启 Ultracode 模式，Claude 就会为会话中的每项重要任务规划工作流。如果运行效果理想，只需按下 `s` 键，即可将脚本保存至 `.claude/workflows/` 目录——该脚本支持版本控制，可通过名称重新运行，并构成一个任何克隆了该仓库的人都能启动的工作流图。

```shell
› Run a workflow to audit every route under src/routes/ for missing 
auth. Spawn one agent per route file, then verify each finding before 
reporting. ● Claude wrote an orchestration script · launching in 
background… /workflows — auth-audit · running ✓ Scope 1/1 2.1k tok · 
4s ✓ Fan-out 18/18 one agent per route file ◯ Verify 11/18 3-vote 
skeptics per finding… ○ Synthesize 0/1 waiting on verify session stays 
responsive — keep working while the fleet runs
```

## 本周用 Claude 制作的六个图表

![用 Claude 制作的六个图表示例](https://assets.yuxiumin.com/attachment/graph-engineering-with-claude/image-16.png)

- **针对每条路由进行全方位安全扫描。** Claude 会**为每个路由文件生成一个子代理**，专门搜寻缺失的身份验证检查；随后，验证环节会对所有发现的问题进行确认，确保最终报告的准确性。这种覆盖广度是单一上下文无法容纳的。
- **基于 /deep-research 功能生成的报告。** 该功能利用了 Claude Code 内置的图谱机制：Claude 会将您的问题拆解为不同维度，并行执行搜索并去重，随后在撰写报告前，通过“持怀疑态度的三方投票”机制对每一项主张进行**对抗性验证**。
- **逐个文件地迁移模块。** 遵循与你的代码库规模相匹配的 Bun 处理上限，Claude 将翻译任务分发到各个文件，并运行测试套件作为质量把关，同时针对失败用例进行迭代修正——这种**对抗式审查**能捕捉到单次处理可能遗漏的错误，避免将有缺陷的代码发布出去。
- **针对代码变更（diff）的对抗式评审。** Claude 会根据变更规模采取不同的处理策略：对于小幅改动，仅进行一次快速审查；而对于大幅改动，则会触发**全面的并行审计**——由评审人员分别从正确性、安全性和性能等不同维度进行审查，最后由评审小组综合评估结果。
- 按计划执行生态系统扫描。只需保存一次，即可无限次重复运行。Claude 会并行检查多种来源（如发布公告、博客文章、讨论内容等），根据对特定壁垒的影响力进行排序，并撰写摘要。
**配置受版本控制（位于 `.claude/workflows/` 目录下）**，可通过名称直接启动。
- **发现规模未知。** 你无法预知其中存在多少个 Bug。Claude 会并行运行查找程序，将每次新发现的 Bug **与已发现的所有内容**进行比对以去除重复，验证剩余的 Bug，并持续循环，直到连续两轮都没有新发现为止——随后停止运行。

## 结论：

提词员提出问题。架构师绘制图。

线性智能体绝非能力的上限——它仅仅是最初的形态，也是人们最先想到的形式，因为它契合了我们的打字习惯。 **一行内容，一个焦点，一次只处理一件事。**

一旦能够看清节点与边，你就不再单纯要求智能体承担更多任务，而是转而利用图的特性来扩展工作广度：在任务相互独立之处进行并行展开（fan out），在需要置信度把关的环节设置“门控”（gate），而在无需复杂判断的环节则对模型进行分层处理（tier）。

大多数人只会按部就班地排队前行；**而那些学会绘制图表的人，则会运营起一支庞大的车队**——他们甚至根本不会察觉到，其他人正受困于某种无形的天花板之下。