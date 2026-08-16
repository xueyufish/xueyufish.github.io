---
layout:     post
title:      "AI 系统中的上下文检索"
description: "上下文检索（Contextual Retrieval）深入解读：结合上下文嵌入、BM25 混合检索与重排序，在检索增强生成（RAG）流程中为 AI 系统提供精准相关的上下文信息，大幅提升问答与生成质量。"
date:       2024-11-08
author:     "yuxiumin"
keyword:    "上下文检索, Contextual Retrieval, RAG, 检索增强生成, AI, yuxiumin"
tags:
    - AI
    - NLP
    - Contextual Retrieval
    - RAG
---

***译自： [https://www.anthropic.com/engineering/contextual-retrieval](https://www.anthropic.com/engineering/contextual-retrieval)***

人工智能模型要想在特定场景下发挥作用，通常需要获取背景知识。例如，客服聊天机器人需要了解其所服务的特定业务，而法律分析机器人则需要了解大量的过往案例。

开发人员通常利用检索增强生成（RAG）技术来增强 AI 模型的知识储备。RAG 是一种从知识库中检索相关信息并将其附加到用户提示词（prompt）中的方法，能够显著提升模型的响应质量。然而，传统 RAG 方案在对信息进行编码时往往会丢失上下文信息，这常导致系统无法从知识库中检索到相关内容。

本文介绍了一种能显著优化 RAG（检索增强生成）中检索环节的方法。该方法被称为“上下文检索”（Contextual Retrieval），包含“上下文嵌入”（Contextual Embeddings）和“上下文 BM25”（Contextual BM25）两项子技术。该方法可将检索失败率降低 49%；若结合重排序（reranking）技术使用，降幅更可达 67%。这些成果标志着检索准确性的显著提升，进而直接转化为下游任务性能的改善。

您可以借助 [我们的示例手册，](https://platform.claude.com/cookbook/capabilities-contextual-embeddings-guide) 轻松地使用 Claude 部署您自己的上下文检索解决方案。

## 关于仅使用更长提示词的说明

有时，最简单的解决方案往往是最好的。如果你的知识库规模小于 200,000 个 Token（约 500 页资料），你可以直接将整个知识库包含在发送给模型的提示词（Prompt）中，而无需使用 RAG 或类似方法。

几周前，我们为 Claude 推出了[提示词缓存（prompt caching）](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)功能，使得这种方法在速度和成本效益上都有了显著提升。开发者现在可以在 API 调用之间缓存常用的提示词，从而将延迟降低两倍以上，并将成本最高降低 90%（您可以查阅我们的[提示词缓存指南](https://platform.claude.com/cookbook/misc-prompt-caching)以了解其工作原理）。

然而，随着知识库的不断扩展，您将需要一种更具可扩展性的解决方案。这时，上下文检索（Contextual Retrieval）便能派上用场。

## RAG 入门：扩展至更大规模的知识库

对于无法完全放入上下文窗口的大型知识库，RAG 是典型的解决方案。RAG 通过以下步骤预处理知识库来发挥作用：

1. 将知识库（文档“语料库”）拆分为较小的文本片段，通常每个片段不超过几百个 Token；
2. 使用嵌入模型将这些数据块转换为编码了语义的向量嵌入；
3. 将这些嵌入向量存储在支持基于语义相似度进行搜索的向量数据库中。

在运行时，当用户向模型输入查询时，系统会利用向量数据库，根据语义相似度找出与该查询最相关的文本片段；随后，这些最相关的片段会被加入到发送给生成式模型的提示词（prompt）中。

尽管嵌入模型在捕捉语义关系方面表现出色，但它们可能会遗漏关键的精确匹配。幸运的是，有一种较早期的技术可以在这些情况下提供帮助。BM25（Best Matching 25）是一种利用词汇匹配来查找精确单词或短语匹配的排序函数；对于包含唯一标识符或技术术语的查询，它尤为有效。

BM25 算法建立在 TF-IDF（词频-逆文档频率）概念之上。TF-IDF 用于衡量某个词对于集合中某篇文档的重要性；BM25 则在此基础上进行了改进，它考虑了文档长度，并对词频应用了饱和函数，从而有助于防止高频词主导搜索结果。

在语义嵌入（semantic embeddings）失效的场景下，BM25 却能发挥作用，具体情况如下：假设用户在技术支持数据库中查询 “Error code TS-999”。嵌入模型可能会检索到关于错误代码的通用内容，却可能漏掉与 “TS-999” 完全匹配的结果；而 BM25 则会针对这一特定文本字符串进行查找，从而定位到相关的文档。

RAG 解决方案通过结合向量嵌入（embeddings）与 BM25 技术，并采用以下步骤，能够更准确地检索出最适用的文本片段：

1. 将知识库（文档“语料库”）拆分为较小的文本片段，通常每个片段不超过几百个 Token；
2. 为这些数据块创建 TF-IDF 编码和语义嵌入；
3. 使用 BM25 根据精确匹配查找排名靠前的文本块；
4. 利用嵌入（embeddings）根据语义相似度查找排名靠前的文本块；
5. 利用排名融合技术，合并并去重步骤 (3) 和 (4) 的结果；
6. 将 Top-K 数据块添加到提示词中以生成回复。

通过结合 BM25 和嵌入模型，传统的 RAG 系统能够提供更全面、更准确的结果，从而在精确的关键词匹配与更广泛的语义理解之间实现平衡。

![标准 RAG 系统架构：结合向量嵌入与 BM25 检索](https://assets.yuxiumin.com/attachment/contextual-retrieval-in-ai-systems/image.png)

一种同时利用向量嵌入（embeddings）和 BM25（Best Match 25）算法来检索信息的标准检索增强生成（RAG）系统。TF-IDF（词频-逆文档频率）用于衡量词语的重要性，并构成了 BM25 算法的基础。

这种方法使您能够以经济高效的方式扩展至海量知识库，其规模远超单个提示词（prompt）所能容纳的范围。然而，这些传统的 RAG 系统存在一个显著局限：它们往往会破坏上下文信息。

### 传统 RAG 中的上下文难题

在传统的 RAG 中，文档通常会被切分成较小的片段，以便进行高效检索。尽管这种方法适用于许多应用场景，但当单个片段缺乏足够的上下文信息时，可能会引发问题。

某个相关片段可能包含这样一段文字：“*该公司的收入较上一季度增长了 3%。*”然而，仅凭这一片段本身，无法明确具体是指哪家公司或涉及哪个时间段，这使得检索正确信息或有效利用该信息变得困难。

## 引入上下文检索

“上下文检索”（Contextual Retrieval）通过以下方式解决了这一问题：在对每个数据块进行向量化（即生成“上下文嵌入”/Contextual Embeddings）及构建 BM25 索引（即“上下文 BM25”/Contextual BM25）之前，先在该数据块前添加一段针对该数据块的解释性上下文信息。

让我们回到之前提到的 SEC 申报文件集合示例。以下是一个数据块（chunk）如何进行转换的示例：

```text
original_chunk = "The company's revenue grew by 3% over the previous quarter."

contextualized_chunk = "This chunk is from an SEC filing on ACME corp's performance in Q2 2023; the previous quarter's revenue was $314 million. The company's revenue grew by 3% over the previous quarter."
```

值得注意的是，过去也曾有人提出过其他利用上下文信息提升检索效果的方法。其他方案包括： [在文档块中添加通用文档摘要](https://aclanthology.org/W02-0405.pdf) （我们进行了实验，发现效果非常有限）、 [假设文档嵌入](https://arxiv.org/abs/2212.10496) 以及 [基于摘要的索引](https://www.llamaindex.ai/blog/a-new-document-summary-index-for-llm-powered-qa-systems-9a32ece2f9ec) （我们进行了评估，发现性能不佳）。这些方法与本文提出的方法有所不同。

### 实现上下文检索

当然，若要手动标注知识库中成千上万甚至数百万个数据块，工作量将极其巨大。为了实现“上下文检索”（Contextual Retrieval），我们借助了 Claude。我们编写了一个提示词（prompt），指示模型基于整篇文档的背景信息，为每个数据块生成简洁且针对该数据块的上下文描述。我们使用了以下针对 Claude 3 Haiku 的提示词来为每个数据块生成上下文：

```text
<document> 
{{WHOLE_DOCUMENT}} 
</document> 
Here is the chunk we want to situate within the whole document 
<chunk> 
{{CHUNK_CONTENT}} 
</chunk> 
Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk. Answer only with the succinct context and nothing else.
```

由此生成的上下文文本（通常包含 50 到 100 个 token）会被添加到数据块（chunk）之前，随后再进行嵌入（embedding）和构建 BM25 索引。

以下是实际应用中的预处理流程：

![上下文检索预处理流程](https://assets.yuxiumin.com/attachment/contextual-retrieval-in-ai-systems/image-1.png)

上下文检索是一种旨在提高检索准确性的预处理技术。

如果您对使用上下文检索感兴趣，可以从 [我们的操作指南](https://platform.claude.com/cookbook/capabilities-contextual-embeddings-guide) 开始。

### 利用提示词缓存降低上下文检索成本

得益于前文提到的 “提示词缓存”（prompt caching）这一独特功能，使用 Claude 可以低成本地实现 “上下文感知检索”（Contextual Retrieval）。利用提示词缓存，您无需在处理每个文本块时都重新传入参考文档；只需将文档加载到缓存中一次，后续即可直接引用已缓存的内容。若按文本块大小为 800 token、文档总长 8k token、上下文指令 50 token 以及每个文本块包含 100 token 上下文信息来计算，**生成此类具备上下文信息的文本块，其一次性成本为每百万文档 token 1.02 美元**。

#### 方法论

我们针对不同的知识领域（代码库、小说、ArXiv 论文、科学论文）、嵌入模型、检索策略及评估指标进行了实验。我们在[附录 II](https://assets.anthropic.com/m/1632cded0a125333/original/Contextual-Retrieval-Appendix-2.pdf) 中列举了各领域所使用的部分问答示例。

#### 性能提升

我们的实验表明：

- **上下文嵌入（Contextual Embeddings）将前20个数据块（top-20-chunk）的检索失败率降低了35%**（从5.7%降至3.7%）。
- **结合上下文嵌入（Contextual Embeddings）与上下文 BM25，将前 20 个数据块（top-20-chunk）的检索失败率降低了 49%**（从 5.7% 降至 2.9%）。

![上下文嵌入与上下文 BM25 的性能提升（失败率降低 35% 与 49%）](https://assets.yuxiumin.com/attachment/contextual-retrieval-in-ai-systems/image-2.png)

#### 实施考量

在实施上下文检索时，有几个注意事项需要牢记：

1. **分块边界：** 需考量如何将文档切分为数据块。数据块的大小、边界及重叠部分的设置，均会影响检索性能 <sup>1</sup>。

2. **嵌入模型：** 尽管“上下文检索”（Contextual Retrieval）能提升我们测试的所有嵌入模型的性能，但某些模型从中获益更为显著。我们发现 [Gemini](https://ai.google.dev/gemini-api/docs/embeddings) 和 [Voyage](https://www.voyageai.com/) 的嵌入模型效果尤为出色。

3. **自定义语境化提示词：** 虽然我们提供的通用提示词效果良好，但针对特定领域或使用场景量身定制提示词，往往能获得更佳效果（例如，包含一份关键术语表，其中涵盖了仅在知识库的其他文档中才有定义的术语）。

4. **分块数量：** 在上下文窗口中加入更多数据块，能增加包含相关信息的几率。然而，过多的信息可能会干扰模型，因此数量是有限度的。我们测试了提供 5 个、10 个和 20 个数据块的情况，发现 20 个的效果最好（对比数据见附录），但建议针对您的具体应用场景进行实验。

**务必进行评估：** 通过传入包含上下文信息的文本块，并区分上下文与文本块本身，可以改善回复生成的效果。

## 利用重排序进一步提升性能

最后，我们可以将上下文检索与其他技术相结合，以进一步提升性能。在传统的 RAG（检索增强生成）流程中，AI 系统会在知识库中搜索潜在的相关信息片段。面对大型知识库时，这种初步检索往往会返回大量片段——有时多达数百个——而这些片段的相关性和重要性各不相同。

重排序（Reranking）是一种常用的过滤技术，旨在确保仅将最相关的块（chunks）传递给模型。由于模型处理的信息量减少，重排序不仅能带来更优质的响应，还能降低成本并缩短延迟。其关键步骤如下：

1. 执行初步检索，获取排名靠前且可能相关的文本片段（我们使用了排名前 150 个片段）；
2. 将 Top-N 块（chunks）连同用户的查询一起输入重排序模型；
3. 利用重排序模型，根据每个数据块与提示词的相关性及重要性为其评分，随后选出得分最高的 K 个数据块（我们选取了前 20 个）；
4. 将 Top-K 个数据块作为上下文输入模型，以生成最终结果。

![重排序流程示意图](https://assets.yuxiumin.com/attachment/contextual-retrieval-in-ai-systems/image-3.png)

### 性能提升

市面上有多种重排序（reranking）模型。我们在测试中使用了 [Cohere reranker](https://cohere.com/rerank)。Voyage [也提供重排序模型](https://docs.voyageai.com/docs/reranker)，不过我们尚未对其进行测试。实验结果表明，在不同领域中，增加重排序步骤都能进一步优化检索效果。

具体而言，我们发现 “重排序上下文嵌入”（Reranked Contextual Embedding）和 “上下文 BM25”（Contextual BM25）将前 20 个数据块（chunk）的检索失败率降低了 67%（从 5.7% 降至 1.9%）。

![重排序 + 上下文检索的性能（失败率降低 67%）](https://assets.yuxiumin.com/attachment/contextual-retrieval-in-ai-systems/image-4.png)

#### 成本与延迟方面的考量

在进行重排序（reranking）时，一个重要的考量因素是其对延迟和成本的影响，尤其是在处理大量数据块（chunks）的情况下。由于重排序在运行时增加了一个额外步骤，即便重排序模型能够并行评估所有数据块，也不可避免地会带来少许延迟。在“重排序更多数据块以获得更佳性能”与“重排序较少数据块以降低延迟和成本”之间，存在着一种内在的权衡。我们建议针对您的具体应用场景尝试不同的配置，以找到最佳平衡点。

## 结论

我们在多种不同类型的数据集上进行了大量测试，比较了上述各种技术（包括嵌入模型、BM25、上下文检索、重排序模型以及检索到的 Top-K 结果总数）的不同组合。以下是我们的发现总结：

1. Embeddings+BM25 优于单独使用 Embeddings；
2. 在我们测试的模型中，Voyage 和 Gemini 拥有最佳的嵌入（embeddings）；
3. 将排名前 20 的块（chunks）输入模型，比仅输入前 10 或前 5 个更为有效；
4. 为块（chunks）添加上下文能显著提高检索准确率；
5. 进行重排序优于不进行重排序；
6. **所有这些好处叠加**：为了最大限度地提高性能，我们可以将上下文嵌入（来自 Voyage 或 Gemini）与上下文 BM25 结合起来，再加上重新排名步骤，并将 20 个块添加到提示中。

我们鼓励所有使用知识库的开发人员使用 [我们的操作指南](https://platform.claude.com/cookbook/capabilities-contextual-embeddings-guide) 来尝试这些方法，以释放新的性能水平。

## 附录一

以下是针对“Retrievals @ 20”（检索前 20 个结果）的各项结果细分，涵盖了数据集、向量嵌入（embedding）提供商、是否结合 BM25 与向量嵌入、是否使用上下文检索以及是否使用重排序（reranking）等维度。

有关第 10 次和第 5 次检索的详细分类，以及每个数据集的示例问题和答案，请参阅 [附录 II](https://assets.anthropic.com/m/1632cded0a125333/original/Contextual-Retrieval-Appendix-2.pdf) 。

![跨数据集与嵌入提供商的 Recall@20 对比](https://assets.yuxiumin.com/attachment/contextual-retrieval-in-ai-systems/image-5.png)

跨数据集和嵌入提供商的“1 减去 Recall@20”结果。

## 致谢

Research and writing by Daniel Ford. Thanks to Orowa Sikder, Gautam Mittal, and Kenneth Lien for critical feedback, Samuel Flamini for implementing the cookbooks, Lauren Polansky for project coordination and Alex Albert, Susan Payne, Stuart Ritchie, and Brad Abrams for shaping this blog post. 