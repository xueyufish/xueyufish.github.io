---
layout:     post
title:      "去哪儿网SQL Agent智能取数落地与提效实践"
description: "去哪儿网 SQL Agent 智能取数落地与提效实战：AI Agent 自动理解业务问题、生成 SQL、查询数据库并返回结果，覆盖架构设计、Prompt 工程、Schema 理解、SQL 安全审计、权限控制与效果评估，提升数据团队取数效率。"
date:       2026-07-16
author:     "yuxiumin"
keyword:    "SQL Agent, 去哪儿网, 智能取数, Text-to-SQL, 数据分析, yuxiumin"
tags:
    - AI
    - Agent
    - AI Agent
---

***转自： [准确率85%+！去哪儿网SQL Agent智能取数落地与提效实践](https://mp.weixin.qq.com/s?__biz=MzkzMjYzNjkzNw==&mid=2247637095&idx=1&sn=397bd7b8a576c91fd20765ece79bed4e&chksm=c3241e008696d998c6fd86ed591360da9910f003da4a4ed8186f2cee45f6a46e4b4cbcef4d6a&mpshare=1&scene=1&srcid=0715dydmUcHxsWXR2MgHi5uV&sharer_shareinfo=3c0096445437808a20655cade64b7761&sharer_shareinfo_first=3c0096445437808a20655cade64b7761#rd)***

## 一、项目背景

2025年是AI Agent元年，去哪儿也开始进行各种场景的Agent探索，SQL Agent是去哪儿落地的典型应用场景。目前，去哪儿已经发展到3.0阶段，运营团队规模较大，反而数据分析师的人员配置相对偏少。

### 1、传统流程

AI 出现之前，传统流程如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/giamgWvCHDYbSze7zGjyY4gwS06A5yVgdTUyL0s6wULNsPvxiajliah5licwDlwyDyM0SiaibKHhpvhCZtIjjAibicdmPHo8uibwhcw76zyMJTR6Id7A/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1)

产运人员会频繁提出大量取数需求，例如向数分人员查询昨日机票订单量、平均票价等基础信息。由于多数产运同事不具备编写SQL的能力，这类需求只能交由数分人员处理。数分人员在接到大量需求后，会先与产品人员进行简要沟通，确定人力排期；若现有的表无法满足取数需求，还需通过脚本清洗数据表，再编写对应的SQL查询，最终向产运人员反馈完整的报告。整个流程中，很多产运人员无法及时获取所需数据，整体协作效率十分低下。

### 2、问题与挑战

![](https://mmbiz.qpic.cn/sz_mmbiz_png/giamgWvCHDYYGopYuDYv1fXPOvG4GegOJdNe2ZibvXR4rWFnibLIctjenUBIibpQo9gvQibNwLdBa5PiaUyX6ibMiaBxoyJpsmq5cban0iakaRZT9ZbA/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=2)

基于以上流程，有以下问题和挑战：

**1）查数难**

我们的底表数据体量十分庞大，同时数据管理较为混乱，业务口径也缺乏统一规范。受历史遗留问题影响，还存在大量脏数据。

**2）取数难**

大部分产运人员都不具备SQL编写能力，即便学会写，也仅能完成简单查询，完全无法处理复杂SQL。同时，复杂SQL编写难度也较高，且现有SQL的改造维护也很复杂。

**3）使用难**

从获取SQL语句，到在专用数据平台执行跑数、等待结果，最后再返回。整个过程耗时较长，交互流程复杂，使用体验较差。

图中表格是我们2024年Q4针对国内机票业务做的数据统计。可以看到，人均跑数个数达到188个，同时跑数失败率、人均跑数时长、P60耗时等指标表现都非常夸张，整体存在很大的提升空间。基于上述一系列问题，我们需要对其进行归类分析。

### 3、破题思路

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYYaH8mjB0dX8NYh3CUVhceeUiaIqYCP4dTHV0uzn3Gqia1NojeJQWcicV3bjhrcnwPERzSE1bqUrGiciacGm8ic6lNILfprAEQ0DLwX4/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=3)

上述问题本质上可归为两类：
- 数据有很大的可治理空间；
- SQL的产生方式。

基于上述两个问题，有两个对应提效点：
- 投入人力进行数据治理，规范数据；
- 利用Agent能力取出规范的数据，生成标准SQL，并将其返回给对应需求的人员。

## 二、方案演进与设计
### 1、AI基建概览

![](https://mmbiz.qpic.cn/sz_mmbiz_png/giamgWvCHDYY6sfMGHeSVU0v1BtmbeubPm66gMrdO8nSsw6hFLfM6qVD6NoUSGEfseHLNLhnBicIo7MNLE1ibSu99L8W3j9cILsuU7FUnjNvWI/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=4)

1）模型层

目前公司内部已部署Deepseek系列大模型，同时也可使用已签约厂商的模型服务，包括Gemini系列、GPT系列以及其它国产大模型。

2）框架层

去哪儿的技术栈以Java为主，因此基于langchain4j与langgraph4j进行二次开发。

3）平台层

我们自研了内部Q MOSS智能体平台，有知识库、工作流、MCP插件、Prompt管理及行业内主流的Skill等能力；同时也基于开源Dify完成了内部部署。

4）Agent层

平台层之上是各类智能体应用，本次重点介绍的是SQL Agent。

5）用户层

支持通过网页端或飞书客户端的使用。

### 2、数据是基石

![](https://mmbiz.qpic.cn/sz_mmbiz_png/giamgWvCHDYbKuk3vick7RpZScYzHtVPcB9Ar1Xa0ic4O88vyRMyV5XZfpjqdpYjSUPMjib4h65xkmnEFz5jI4CDZq47vIegpNBibJ2FtG42jRRg/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=5)

数据治理方面做的工作如下：

这个项目最初与国内机票业务合作，在国内机票场景落地并取得良好效果后，其他部门看到成效也希望接入。但在实际接入过程中我们发现，部分部门接入后的使用效果并不理想。为此我们回溯分析了效果不佳的原因，最终发现问题出在底层数据治理薄弱：相关部门未开展清晰规范的数据治理，即便上层应用能力再强，由于底层数据混乱，也无法生成高质量的SQL。

机票业务团队为此所做的相关工作有：

- 针对缺失字段进行沟通并补齐；
- 完善底表基建工作，包括数据清洗、口径治理、缺失字段埋点，并构建大量轻量级中间表与数据模型；
- 构建统一的数据字典，以此规范各类业务口径。

### 3、SQL Agent初探

初期我们并未做过于复杂的设计，而是采用较为简单的方式，直接将各类相关知识注入给SQL Agent。

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYaLPcFoOEZvqZk2zqoxuQISgXIkZ4lnibvDM0WVMejWHdMPPqRbwnNlNerNbFGHPiaHiaibtqrHcmHHM3yGPRxWoy927ibEjv9xnuxA/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=6)

整体流程如下：

初步判断用户提出的问题是否为SQL相关问题，若非SQL问题则直接驳回；

根据用户所属部门，获取其对应的业务知识库。不同用户对应的业务知识存在差异，因此需要做权限与范围隔离；

拿到业务知识库后，结合具体问题判断是否需要补充业务信息，如果信息不完整则进入反问环节，与用户确认关键条件；

信息明确后，系统会自动筛选出所需用到的表集合，查询对应表的元数据，并获取相关默认补充条件；

基于以上信息自动生成SQL语句，随后自动运行SQL，最终将结果返回给用户。

### 4、暴露的问题

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYYicg9s563ymzmFYVg4MhzL7z4xkwMjTichIo3hdUViboMrA6CGro80x0Aicn8BY0cjBic9BbGgyZM09qiaR0xr7oODI6qibs0yWnVr5g/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=7)

在POC的过程中，暴露出以下问题：

第一，“丢三落四”的现象严重。我们为模型设定了十条规则，但它第一次可能只遵守前八条、遗漏后两条，第二次可能遵循后八条、漏掉前两条，两种结果均不满足要求，导致整体生成准确率非常低。

第二，给Agent输入的信息过载。既要求它生成SQL，又叠加了大量优化SQL的任务，最终频繁出现优化遗忘的问题。

第三，用户在实际使用中习惯使用行业黑话，而模型对此缺乏相关认知。

针对这些问题，我们最初尝试通过提示工程进行优化，例如采用分阶段提醒、显式约束提示，或是在优化前后告知Agent需执行的操作，并要求输出过程报告等。虽然这些方式有一定效果，但整体收效甚微，完全无法满足生产环境的使用要求。

### 5、首次拆分-优化Agent

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYYCEia8KicK70OZqWJ67UKsYKDI3vMhCCruWErlEJFMkadIPdDgvpQ1A1r8sb3g19xjb9OLiaY3ARrMTR22loEdQmQ6qZztxoy6XI/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=8)

针对以上问题，我们决定对Agent进行拆分。

初期将原先的单体Agent拆分为“生成Agent”与“优化Agent”。原先大部分功能都集中在生成Agent中，拆分后其职责变得简单：只负责生成SQL，无需关注SQL和语法是否正确，只需将生成结果交付给优化Agent即可。

优化Agent在接收到SQL后，会统一进行格式修正、语法校验、补充额外条件，并执行其它内置约束逻辑，最终输出可直接运行的标准SQL。

图片左侧为实际落地效果图：页面上方会先生成SQL，并提示用户“正在优化”；随后系统自动补充默认查询条件，并对SQL格式进行统一优化。

### 6、存在的问题

![](https://mmbiz.qpic.cn/sz_mmbiz_png/giamgWvCHDYavWpzHtklrZFZBL3Au8UpkfUc4kpcAlyclba5XlCibLiav8SPD1spes9B947mDu7cfCqgkibXmdLLxH7U7m7CxGAlJibxqFpIOUh0/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=9)

不过，这仍然存在一些问题：

1）尽管已将SQL优化拆分为独立Agent，但在生成过程中仍有小概率出现语法问题；

2）整个Agent流程会调用大量工具，而很多工具仅靠单次调用无法满足实际业务场景；

3）由于任务比较复杂，整体流程缺少清晰的任务规划。

针对这些问题，我们当时尚未引入React机制。后续在社区中发现React机制已较为成熟且热门，于是决定引入该机制并进行相关测试。

### 7、React机制

![](https://mmbiz.qpic.cn/sz_mmbiz_png/giamgWvCHDYZcJc7uXLTCfTC9ydJia9K9CWt83wSKZ9dD198AhmXdibxb2ygP0WndSef0GPQ87xEXC8D9yjONCD4pEwib1fGQTzwvHVcsyJv7iag/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=10)

React机制如下：

首先，用户提出问题后，模型会先进行思考。在思考过程中，模型会根据需要调用查询表结构、查询元数据等工具，完成SQL的生成。生成SQL后，会调用语法检查工具进行校验。随后，模型会结合生成的SQL和语法检查工具返回的信息，决定下一步动作：如果SQL没有问题，则结束流程；如果存在语法问题，则重新生成SQL。另外，我们设置了重试阈值，不会让模型无限循环执行。

### 8、规则确认

![](https://mmbiz.qpic.cn/sz_mmbiz_png/giamgWvCHDYaRrficEjgMU59wricMKHRRgjUGpzHJf48icADLF4DgCw2lCdPE5xBiadoO8FkvsuPjZF5nKuCCKBmJRvl55WtwgDg8JUf1DNHhmMo/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=11)

还有一个问题，即SQL是明确且具体的，而自然语言是模糊的。从一个模糊的自然语言需求，到一个具有明确规则的SQL，这个转换过程存在较大的不确定性。

### 9、意图模块拆分

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYaN6C06Az3U2yl49D5U6JIpucsbkuMRwCOCz3aLEHeLeSnEibLYffIvdUYMaBD4N9BVOTMH1XibLQkLNjqHqV3sAEicGd6iasr4LV4/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=12)

基于该问题，我们进一步拆分生成Agent，在生成Agent前增加一个需求细化Agent。该Agent的主要职责是按照预定义的规则模板，对用户的自然语言进行补充和细化，明确用户隐含的查询字段、分组条件、时间范围、筛选条件，以及多表关联等信息。完成需求细化后，再将补充完善后的自然语言交给生成Agent生成SQL。

### 10、表达二义性

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYZ6bliaeItxkbFeeLhs8lpqKRwQX6DfIe8eKTuY4lWjiaL5jeUMSLJvE8RdI5GNnltEVGe4M5En8YxzvMyicB3z4lPiaAuGRhTq3yw/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=13)

由于项目启动较早，我们当时还没有意识到意图识别是一个独立的问题。

以下是一个较为典型的案例：

用户的问题是：“查询昨天积分第二名的代理商”。按照常规理解，应该先对所有代理商的积分进行聚合，再按积分排序，返回排名第二的代理商，所以第一种SQL是正确的。但多次提问同一个问题后，模型有时会生成第二种SQL。早期由于Agent的能力还不够成熟，所以我们一直认为这是AI输出不稳定导致的。随着这类问题不断积累，进行综合分析后发现或许是用户的问题本身存在歧义。

歧义具体体现在：用户的问题是“查询昨天积分第二名的代理商”。

第一种理解，也是最常规的理解：查询昨天积分总量排名第二的代理商。也就是说，先按代理商汇总昨天的积分，再进行排序。但是，实际的数据表结构并不是按代理商汇总存储的，而是一条积分记录对应一条数据。Agent在获取到表结构后，会以纯理性的角度理解用户的问题。因此，它认为第二种理解同样是合理的，即查询昨天单笔积分排名第二对应的代理商。

这两种理解在语义上都说得通，而用户的问题本身并没有明确说明是“积分总量”还是“单笔积分”，因此导致模型生成了不同的SQL。

### 11、意图确认Agent

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYZicna0q4mNpowtOOaR8JXN6yq2zoAYiajSxnwse8wcEZibqWAfiaKXEhJpAlKcR4MUPhGzvk2etPnS7NM0ibMAs4I4kwe0LbtJzEGc/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=14)

发现这个问题后，我们抽离出一个意图识别模块。该模块的作用是对用户的问题进行改写，并在必要时进行反问，进一步确认用户的真实意图。只有当用户意图被明确、问题不存在歧义后，才会进入后续的SQL生成流程。

完成Agent迭代之后，我们又开始思考另外两个问题：

1）如何提升稳定性

例如，如何保证同一个问题连续问十次，都能够稳定地生成同样正确的SQL。

2）如何学习新知识

知识库不可能保持100%实时和准确。有些运营提出的问题可能涉及全新的业务知识。通过与Agent的多轮对话，这些新知识能够被当前会话学习。但如果重新开启一个新的会话，Agent又无法记住这些知识。因此，需要考虑如何将这些新学习到的知识沉淀下来，并在后续会话中继续使用。

### 12、不断成长与学习Agent

基于上述两个问题，我们引入了RAG，流程如下：

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYbVp8T1XSiboe8Fp5OTyjjF0k3UygNiaoCyf70CNc7Ts0iafSQvYc6eSVM1qpjR3N7jopOFXxq1qY87VJYMgVIgPBwib1aCOAN1EBg/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=15)

首先，用户提出问题后，会先到QA库中检索历史问答，召回Top2最相似的问答作为参考，并放入上下文中，供Agent学习和参考。Agent会结合这些历史知识生成最终结果。如果用户认为生成结果是正确的，可以进行点赞。点赞后会触发一个事件，将这次正确的问答沉淀到RAG知识库中。当后续用户再提出类似的问题时，就可以再次召回这些高质量的历史案例作为参考模板，帮助Agent更稳定准确地生成结果。

### 13、知识库设计

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYZ19ROia7ibSIEb6Asgl9NIyEiba6iaWcBoHkHD43qfWicXdI7wzkDsMibDmKXexZUGHDqXET3K2YuA090bgbdkfL2aYxf5aEKhqs16E/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=16)

初版知识库中只有一个业务知识库。该知识库会维护指标名称以及该指标在业务上的含义。同时也会维护字段定义，例如指标的枚举值、是否由公式计算得出等信息都会统一放在指标定义中。此外，在知识库中还会记录指标对应的来源表，以及来源表的业务中文名。我们也会针对来源表维护一些基础信息，例如表ID、表名以及其它相关信息。

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYZhexxfick7vjuGCicQh0k7vNUkDpNaYXX3WmOWt6yJ251OyuhE6eSqfkCZ3OGVbrhWpd5BdIZ20vNPCUwyMahhUeiczqvIfzWiciaY/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=17)

初版知识库上线之后，我们发现还存在3个问题：

1）知识库中灌入很多无效信息。对于模型来说，这些内容不仅会消耗Token，还会引入大量噪音。

2）用户的表述中存在很多业务黑话和行业术语，模型难以准确理解。

3）数分人员提到，他们日常查数时会默认带上一些查询条件。这些条件属于团队默认约定，一般不会明确写出来，因此模型无法感知。此外，还有一些关联知识等隐含信息也是缺失的。

基于以上问题，我们对知识库进行瘦身，并补充了相关业务知识。

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYbtZJmSNrRDtGerjUh2WC8ZSzxialrxpqa2rdQW44phSSLzvib25lkCScmonFs7b6icgmvOhfTq9kr28WvkrdNwIzlYzuQCXGdemQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=18)

重新设计的知识库主要包含以下6个模块：
- 字段语义：用于记录业务语义相关的知识；
- 表结构信息：记录表中的字段信息；
- 术语库：用来维护行业黑话和专业术语；
- 模板库：针对一些业务中高频且复杂的SQL场景，我们专门沉淀了一套思考模板。用户提问时，我们会将对应的思考模板作为知识注入到大模型的上下文中，引导模型按照模板进行思考，从而生成更加准确的SQL；
- 表限制条件：用于记录每张表各种个性化的默认限制条件。不同的业务场景对应的默认条件可能并不相同，例如用户A查询某类业务时需要使用一套默认条件，而用户B查询另一类业务时又需要使用另一套默认条件。因此，我们专门设计了表限制条件模块来维护这些规则；
- 表关联知识：用于记录多表之间的关联关系，指导模型正确完成多表关联查询。

### 14、迭代机制与运营方案

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYbxXDy1gnx2WqZMvmaiaOicQCwVXEjicNqI2HibBv2uLjhRxd9OOaFdQ7LraEjziafJZO6Iq2lNU6mfgibfkzvVN3IXfiaYIXvXIJ4sUc/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=19)

迭代机制和运营方案具体如下：

首先，Case集有两种补充方式：第一种是人工补充，第二种是在业务日常使用过程中持续沉淀大量真实Case。随后会通过评测Agent定时对整个Case集进行评测，并生成报告。开发人员会根据评测报告进行分析，如果问题是由于知识缺失导致的，就补充知识库；如果问题出在Agent本身，就针对Agent进行优化和修复。

### 15、Prompt设计

![](https://mmbiz.qpic.cn/sz_mmbiz_png/giamgWvCHDYbMHNEhkeP31bCPMtqS7eX1gqibH1ysj1xbGzxVGuJaZUJ05xcPr0UaicPx0SN8cMKxc1f6iaVviboYjSTtDu2RjetHjQ0Kzz7tiaGc/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=20)

整体而言，Prompt设计没有太多复杂的地方，大部分都是一些常规内容。在此重点介绍上下文信息的设计，我们主要维护三部分内容：

- 通用信息
- 业务知识
- 个性化提示词

之所以增加个性化提示词，是因为不同业务线都会有一些自身特有的要求。因此，我们专门预留了一部分配置空间，让各个业务线能够自行维护自己的个性化提示词。

### 16、整体架构一览

![](https://mmbiz.qpic.cn/sz_mmbiz_png/giamgWvCHDYay8XpUY6Ey6iboZYd4iakPP2as933LFAndqKoAus5vzqPvHYzBm70SfZjUj1NBGU8KLQ6xTrzN2nbTZic9iapia2MFHAyUd8bU1ia18/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=21)

前期，我们进行了数据预处理，包括中间表设计、字段规范化等工作。同时，搭建业务知识库，其中包含业务术语、搜索模板、计算公式等相关知识。之后，用户开始进行问题提问。虽然我们提供了一个按钮，允许用户手动开启新的会话，但在实际使用过程中，用户几乎不会主动开启新的会话，这就导致了两个问题：

**1）上下文不断累积，导致上下文越来越长**

因为用户没有主动开启新的会话，历史对话一直保留，不仅增加了Token消耗，还会引入大量噪音。

**2）准确性下降**

很多用户反馈生成的SQL与自己的预期差距很大，而开发人员在测试时却很难复现。后续分析发现，主要原因是历史上下文没有及时清理，导致模型受到大量无关历史信息的干扰。

因此我们增加了一个追问Agent，主要解决以下问题：

判断什么时候需要清空上下文；

判断当前问题是对上一个问题的追问，还是用户认为上一条SQL不理想，希望在原SQL的基础上进行修复。

基于以上场景，追问Agent会结合用户当前的问题，生成一条全新的自然语言描述。随后，该问题会进入问题改写模块。该模块主要负责意图明确，它会结合行业规划和名词知识，对用户的自然语言进行改写，将其转换成一个没有歧义、表达清晰的问题。接着问题会进入规则补充模块。规则补充模块会将自然语言补充完善，映射成更接近SQL表达方式的自然语言描述。然后进入知识召回模块，基于补充后的问题，在RAG知识库中进行关键词匹配和相似度匹配，召回相关知识。

召回相关的QA后，将这些QA对放入上下文中，供生成Agent参考。生成Agent会结合这些信息生成SQL，并进行一次简单的自检。自检完成后再将SQL交给优化Agent。优化Agent会负责补充默认条件、替换语法，并调用语法检查工具进行语法校验。如果发现语法错误，就会根据错误信息不断修正SQL。另外，我们设置了重试阈值，如果达到阈值后仍然无法修复，优化Agent就会认为这是一条不合格的SQL，并直接打回给生成Agent，由生成Agent重新生成SQL，再继续后续流程。

在最终的展示层中，我们会向用户展示生成的SQL、SQL执行后的结果以及结果下载地址。同时还提供结果反馈入口，后续的数据分析流程也可以通过对应的按钮进入。

## 三、落地效果与经验总结

### 1、落地效果

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYbBN18ia0Y7r6AGWgF4lCiaKwbicZ6A1hk0zFwQWia4Gl3vicnLdr7HiazuOrGTrNWDicpzvnNs1e34va1WMU9ZOHicUefnXzRcZxTicSics/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=22)

原来的流程是业务方先提出取数需求，由业务方和商分进行口径对齐、取数方案对齐。每周三统一进行需求评审，评审通过后进入排期，等到排期时间再进行开发和数据交付，最后由业务方进行数据验收。整个流程下来，平均每个需求需要1.9天。

有了九章AI之后，业务方只需要通过自然语言描述自己的取数需求，九章AI就会自动生成SQL，并执行SQL，最终返回查询结果。整个流程由原来的七个步骤简化为一步，实现了零协作、零等待，业务方可以立即获取所需的数据。

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYaMrtoQBFU32dnocIWkLIOqREcdq7ZY7xjoN2gw0dUJDZ6vW1WulZmLOl66LBTibwb1OpwN8XgBueRE5Q79DIpiaoxFrAicMN0FDs/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=23)

在没有九章AI之前，数分团队大约有四分之一的时间都花在处理这类重复性的取数需求上。有了九章AI之后，数分团队基本已经不再承接日常取数需求，可以将更多的人力投入到更有价值的数据分析工作中。目前，SQL整体准确率已经达到85%以上。

### 2、经验总结

![](https://mmbiz.qpic.cn/sz_mmbiz_png/giamgWvCHDYYGoLMfbkmRjn3JMoU9X35njl58SmFeaFdZ9oACN452LBnFvGBJsfibXgzc1x0waicoNHFKg0hIsibRj5p6ObTtGKAbSHOJf8deyA/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=24)

**1）验证数据的准备**

在项目初期，我们曾让业务方提供100个自然语言问题，以及对应的SQL。虽然业务方每天都有很多取数需求，但真正让他们整理时，提供的大多都是比较简单的问题，对应的SQL也较简单。这类数据的覆盖面不够，泛化能力较差，导致基于这些数据进行调优后的效果并不具有代表性，在真实业务场景中的表现也不理想。

基于这个问题，我们调整了数据准备方式，从数据平台反向获取用户历史实际执行过的SQL，再让业务方根据这些SQL补充对应的自然语言问题。通过这种方式，我们沉淀了大量贴近真实业务场景的Case集。

**2）Single Agent、Multi-Agent和 Workflow 的选择**

建议在项目初期先使用一个单一的 Agent。当在实际使用过程中发现问题后，再根据具体情况决定是拆分成多个Agent，还是通过Workflow将流程固化。这本身就是一个持续迭代的过程，需要平衡开发成本、时间成本和维护复杂度，而不是一开始就拆分出很多模块。

**3）用户体验**

建议尽可能展示整个执行过程。因为整个生成过程可能需要一定时间，如果用户只能看到最终结果，等待过程会比较枯燥，体验也会比较差。因此，我们会尽量将思考、生成、优化等关键过程展示给用户，让用户清楚地知道系统当前执行到了哪一步，从而提升整体使用体验。

**4）AI项目一定要避免闭门造车**

因为AI项目和传统需求不一样，传统需求通常是产品经理提出需求、完成方案设计，开发上线后基本就结束了。而AI项目中的很多问题，在开发阶段其实是发现不了的。只有真正上线，并在小范围内让用户持续使用后，各种问题才会逐渐暴露出来。因此，建议尽早上线、小范围推广，通过真实用户反馈不断迭代和优化，而不是等到所有功能都做完之后再一次性上线。

**5）模型选择**

不能只依赖单一模型，而是要根据不同的业务场景选择最合适的模型。虽然能力更强的模型通常效果更好，但在实际应用中，还需要综合考虑模型成本、响应速度以及效果等因素，进行整体权衡，选择性价比最高的方案。

## 四、未来展望

![](https://mmbiz.qpic.cn/mmbiz_png/giamgWvCHDYaE7gyjreVWQCm64xMZsXibsoRhjW3jCoTVrGpk2g5HTGtQTmjq6LXuGd5vmQ4lYmRxWjz6zdf9RCpIYj6uKib8DViaQyrb8gZ4uk/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=25)

### 1、分析决策终态

目前我们的能力还主要停留在SQL生成阶段，而数据分析才是最终目标。现在酒店、机票等各个业务部门，已经将我们的SQL生成能力作为底层基础能力，在上层搭建了各种数据分析功能，通过调用SQL生成和取数能力，支撑更多的数据分析场景。

### 2、业务域的自动选择

虽然底层划分了很多业务域，但用户提出的问题并不一定只属于某一个固定的业务域，因此不能让用户手动选择业务域。基于这个问题，我们增加了一个业务域Agent。它会结合用户的历史问题以及沉淀的业务规则，自动判断用户是否有权限访问对应的业务域，以及当前问题属于哪个业务域。通过这种方式，实现业务域的自动识别，避免用户手动选择业务域。

### 3、更快的响应速度

我们计划将这套能力以API和Skill的形式对外提供，因此现有的响应速度还需要进一步提升，以满足更多业务场景的要求。

### 4、知识库的运维成本

目前机票业务维护了大量业务白皮书，每张表都会维护血缘关系、业务说明等大量知识，这部分知识的维护成本非常高。因此，后续也会重点考虑如何降低知识库的运维成本。

## Q&A

### Q1：相关安检相系统是否连互联网？如何保障网络安全性？

A1：最底层数据的安全由数据团队负责维护。在上层应用层面，我们做了表级别、字段级别的白名单控制，哪些用户能看哪些表、哪些字段，都是通过规则严格限定的。用户提问时，系统会根据权限直接屏蔽无权限访问的表和字段，模型本身根本感知不到这些敏感表和字段的存在。


### Q2：取数过程会涉及去哪儿网大量用户隐私数据，这些数据对安检系统是全部开放吗？

A2：关于数据安全和隐私，我们有专门的算法团队做处理。用户手机号、身份证号等敏感信息，在进入模型之前就已经被彻底屏蔽，模型完全不会接触到这类核心隐私数据。同时，我们满足网络安全等级保护三级及以上要求，每年都会开展密评，这是大型互联网平台的基本合规要求。

### Q3：智能查询如果生成的数据有问题，导致业务决策出错，责任怎么界定？

A3：用户用自然语言提问，系统生成的SQL未必完全符合真实意图，如果业务方基于错误数据做决策，就会出现责任问题。只要准确率达不到100%，哪怕是90%，剩下10%的兜底和保障机制就非常关键。

目前我们建立了多种保障机制：

1）每天安排值班人员负责巡检。当系统生成SQL后，会第一时间查看这条SQL是否正确；

2）提供反馈按钮，如果运营人员认为生成的SQL存在任何问题，都可以直接反馈。系统收到反馈后会触发告警事件，我们收到消息后会立即查看并处理这条SQL；

3）每天通过评测Agent对当天生成的所有SQL进行自动评测，识别其中存在问题的SQL，并及时反馈给业务方进行处理。虽然不是实时处理，但基本能够做到当天发现、当天反馈。

### Q4：如何评估数据准确率？

A4：我们每天都会对系统进行自动化评测，之后由专业的数据分析师人工核对结果。项目早期，每天都会逐条校验SQL是否正确，人工打分、统计正确率与错误Case。目前，最后一道质量关卡仍然是人工审核。

### Q5：准确率有持续提升和优化机制吗？

A5：一方面通过RAG不断沉淀业务知识，持续优化知识库与口径；另一方面，我们会接入新模型，比如现在比较火的Skills，不断迭代优化系统效果。