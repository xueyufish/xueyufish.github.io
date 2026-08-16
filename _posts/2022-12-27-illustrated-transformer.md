---
layout:     post
title:      "图解 Transformer"
description: "Jay Alammar 'The Illustrated Transformer' 文章的中文解读。从 self-attention 的直觉出发，图解 Transformer 的编码器-解码器架构、多头注意力、位置编码与训练流程，用直观图示讲透注意力机制如何工作。"
date:       2018-06-27
author:     "yuxiumin"
keyword:    "Transformer, 注意力机制, Self-Attention, NLP, 深度学习, yuxiumin"
tags:
    - AI
    - NLP
    - Transformer
---

***本文翻译自： [https://jalammar.github.io/illustrated-transformer/](https://jalammar.github.io/illustrated-transformer/)***

在 [上一篇文章中，我们探讨了注意力机制](https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/) ——现代深度学习模型中普遍采用的一种方法。注意力机制的概念有助于提升神经机器翻译应用的性能。在本文中，我们将介绍 **Transformer 模型** ——一种利用注意力机制来加速模型训练的模型。Transformer 模型在某些特定任务上的表现优于谷歌神经机器翻译模型。然而，其最大的优势在于 Transformer 模型非常适合并行化。事实上，谷歌云建议使用 Transformer 模型作为参考模型来使用其 [云 TPU](https://cloud.google.com/tpu/) 服务。接下来，我们将深入剖析 Transformer 模型，探究其工作原理。

Transformer 模型最初在论文 [《Attention is All You Need](https://arxiv.org/abs/1706.03762) 》中提出。TensorFlow 中已将其实现，并包含在 [Tensor2Tensor](https://github.com/tensorflow/tensor2tensor) 包中。哈佛大学的自然语言处理小组制作了一份 [指南，用 PyTorch 实现标注了这篇论文](http://nlp.seas.harvard.edu/2018/04/03/attention.html) 。在本文中，我们将尝试对相关概念进行简化，并逐一介绍，希望能帮助那些对该主题没有深入了解的人更容易理解。

**2025 年更新** ：我们制作了一个 [免费的短期课程](https://bit.ly/4aRnn7Z) ，用动画的形式更新了本文的内容：

## 高屋建瓴的视角

我们先将模型视为一个黑盒来分析。在机器翻译应用中，它会接收一个句子（用一种语言），并输出另一种语言的翻译结果。
![](https://jalammar.github.io/images/t/the_transformer_3.png)

让我们来一探“擎天柱”内部的奥秘：可以看到一个编码组件、一个解码组件，以及连接两者的通路。
![](https://jalammar.github.io/images/t/The_transformer_encoders_decoders.png)

编码组件是一叠编码器（图中将六个编码器叠放在一起——数字六并没有什么特别之处，完全可以尝试其他排列方式）。解码组件是一叠相同数量的解码器。
![](https://jalammar.github.io/images/t/The_transformer_encoder_decoder_stack.png)

所有编码器的结构都相同（但它们的权重并不相同）。每个编码器又分为两个子层：
![](https://jalammar.github.io/images/t/Transformer_encoder.png)

编码器的输入首先会经过一个自注意力层——该层可以帮助编码器在编码特定单词的同时，关注输入句子中的其他单词。我们将在本文后面更详细地探讨自注意力机制。

自注意力层的输出被送入前馈神经网络。同一个前馈神经网络被独立地应用于每个位置。

解码器具有这两个层，但在它们之间有一个注意力层，可以帮助解码器专注于输入句子的相关部分（类似于 [seq2seq 模型](https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/) 中的注意力机制）。

![](https://jalammar.github.io/images/t/Transformer_decoder.png)

## 引入张量

现在我们已经了解了模型的主要组成部分，接下来让我们看看各种向量/张量以及它们如何在这些组成部分之间流动，从而将训练好的模型的输入转换为输出。

一般的 NLP 应用一样，我们首先使用 [嵌入算法](https://medium.com/deeper-learning/glossary-of-deep-learning-word-embedding-f90c3cec34ca) 将每个输入词转换为向量。

![](https://jalammar.github.io/images/t/embeddings.png)

每个单词都被嵌入到一个大小为 512 的向量中。我们将用这些简单的方框来表示这些向量。

词嵌入仅在最底层的编码器中进行。所有编码器的共同抽象是，它们都接收一个大小为 512 的向量列表——在最底层的编码器中，该列表包含词嵌入；而在其他编码器中，则包含其下方编码器的输出。该列表的大小是一个可设置的超参数——它基本上等于训练数据集中最长句子的长度。

将单词嵌入到输入序列中后，每个单词都会依次经过编码器的两层。

![](https://jalammar.github.io/images/t/encoder_with_tensors.png)

这里我们开始看到 Transformer 的一个关键特性，即编码器中每个位置的词都沿着各自的路径流动。在自注意力层中，这些路径之间存在依赖关系。然而，前馈层不存在这些依赖关系，因此各个路径可以在流经前馈层时并行执行。

接下来，我们将把例子换成一个更短的句子，并看看编码器的每个子层中发生了什么。

## 现在开始编码！

正如我们之前提到的，编码器接收一个向量列表作为输入。它通过将这些向量传递给 “自注意力” 层来处理该列表，然后再传递给前馈神经网络，最后将输出发送到下一个编码器。

![](https://jalammar.github.io/images/t/encoder_with_tensors_2.png)

每个位置的单词都会经过一个自注意力过程。然后，它们各自进入一个前馈神经网络——同一个网络，只是每个向量分别单独流经该网络。

## 自注意力机制概览

别被我频繁提及 “自注意力” 这个词所迷惑，好像这是个人人都应该熟悉的概念。事实上，在读到《Attention is All You Need》这篇文章之前，我从未接触过这个概念。让我们来详细了解一下它的运作原理。

假设以下句子是我们要翻译的输入句子：

“ `The animal didn't cross the street because it was too tired` 。”

这句话中的 “它” 指的是什么？是指街道还是动物？对人类来说，这是个简单的问题，但对算法来说却并非如此。

当模型处理单词 “它” 时，自我注意力机制使其能够将 “它” 与 “动物” 联系起来。

当模型处理每个单词（输入序列中的每个位置）时，自注意力机制使其能够查看输入序列中的其他位置，寻找有助于更好地编码该单词的线索。

如果你熟悉循环神经网络（RNN），可以想想它如何通过维护隐藏状态，将之前处理过的词/向量的表示融入到当前正在处理的词/向量中。Transformer 使用自注意力机制，将其他相关词的 “理解” 融入到当前正在处理的词中。

![](https://jalammar.github.io/images/t/transformer_self-attention_visualization.png)

由于我们在编码器 #5（堆栈中的顶部编码器）中对单词 “it” 进行编码，注意力机制的一部分集中在 “动物” 上，并将它的一部分表示嵌入到 “it” 的编码中。

请务必查看 [Tensor2Tensor notebook，](https://colab.research.google.com/github/tensorflow/tensor2tensor/blob/master/tensor2tensor/notebooks/hello_t2t.ipynb) 您可以在其中加载 Transformer 模型，并使用此交互式可视化工具对其进行检查。

## 深入解析自注意力机制

我们先来看看如何使用向量计算自注意力，然后再来看看它是如何实际实现的——使用矩阵。

计算自注意力机制的 **第一步** 是根据编码器的每个输入向量（在本例中为每个词的词嵌入）创建三个向量。因此，对于每个词，我们创建一个查询向量、一个键向量和一个值向量。这些向量是通过将词嵌入乘以我们在训练过程中训练的三个矩阵而得到的。

请注意，这些新向量的维度比嵌入向量小。它们的维度为 64，而嵌入向量和编码器输入/输出向量的维度为 512。它们并非必须更小，这是一种架构选择，目的是使多头注意力机制的计算量（基本）保持恒定。

![](https://jalammar.github.io/images/t/transformer_self_attention_vectors.png)

将 x1 乘以 WQ 权重矩阵即可得到 q1，即与该词关联的 “查询” 向量。最终，我们为输入句子中的每个词创建了一个 “查询” 投影、一个 “键” 投影和一个 “值” 投影。

什么是 “查询”、“键” 和 “值”向量？  

它们是用于计算和思考注意力的抽象概念。继续阅读下文了解注意力的计算方法后，你就能掌握每个向量所扮演的角色。

计算自注意力的 **第二步** 是计算得分。假设我们要计算本例中第一个词 “Thinking” 的自注意力。我们需要将输入句子中的每个词与这个词进行比较并给出得分。这个得分决定了在编码特定位置的词时，应该给予输入句子的其他部分多少关注。

得分的计算方法是将查询向量与待评分词的键向量进行点积运算。因此，如果我们正在处理位置 #1 的词的自注意力机制，则第一个得分是 q1 和 k1 的点积。第二个得分是 q1 和 k2 的点积。

![](https://jalammar.github.io/images/t/transformer_self_attention_score.png)

**第三步和第四步** 是将分数除以 8（论文中使用的键向量维度 64 的平方根。这样做可以获得更稳定的梯度。这里可能还有其他值，但这是默认值），然后将结果输入到 softmax 操作中。softmax 操作会将分数归一化，使它们全部为正数且总和为 1。

![](https://jalammar.github.io/images/t/self-attention_softmax.png)

softmax 分数决定了每个词在该位置的出现频率。显然，该位置的词将具有最高的 softmax 分数，但有时关注与当前词相关的其他词也很有用。

**第五步** 是将每个值向量乘以 softmax 得分（为将它们相加做准备）。这里的目的是保持我们想要关注的词的值不变，并消除无关词的影响（例如，通过将它们乘以 0.001 这样的小数）。

**第六步** 是将加权值向量相加。这就产生了该位置（第一个词）自注意力层的输出。

![](https://jalammar.github.io/images/t/self-attention-output.png)

至此，自注意力机制的计算就完成了。我们可以将得到的向量传递给前馈神经网络。然而，在实际实现中，为了加快处理速度，这种计算是以矩阵形式进行的。既然我们已经了解了词级计算的原理，现在让我们来看看矩阵形式的计算。

## 自注意力矩阵计算

**第一步** 是计算查询矩阵、键矩阵和值矩阵。我们通过将词嵌入打包成矩阵 X ，并将其与我们训练的权重矩阵（WQ、WK、WV）相乘来实现这一点。

![](https://jalammar.github.io/images/t/self-attention-matrix-calculation.png)

*X 矩阵中的每一行都对应输入句子中的一个词。我们再次看到词嵌入向量（512，图中对应 4 个方框）与 q/k/v 向量（64，图中对应 3 个方框）的大小差异。*

**最后** ，由于我们处理的是矩阵，我们可以将步骤二到六合并为一个公式来计算自注意力层的输出。

![](https://jalammar.github.io/images/t/self-attention-matrix-calculation-2.png)

矩阵形式的自注意力计算

## 多头怪兽

该论文通过添加一种称为 “多头” 注意力机制，进一步改进了自注意力层。这从两个方面提高了注意力层的性能：

1. 它扩展了模型关注不同位置的能力。是的，在上面的例子中，z1 包含了其他所有编码的部分内容，但它可能主要由单词本身构成。如果我们翻译像 “这只动物因为太累而没有过马路” 这样的句子，那么知道 “它” 指的是哪个词就很有用了。

2. 它为注意力层提供了多个“表示子空间”。正如我们接下来将看到的，使用多头注意力机制，我们不仅拥有一个，而是多个查询/键/值权重矩阵集（Transformer 使用八个注意力头，因此每个编码器/解码器最终都会有八组）。每个矩阵集都是随机初始化的。然后，在训练完成后，每个矩阵集都用于将输入嵌入（或来自较低层编码器/解码器的向量）投影到不同的表示子空间。

![](https://jalammar.github.io/images/t/transformer_attention_heads_qkv.png)

在多头注意力机制中，我们为每个注意力头维护独立的 Q/K/V 权重矩阵，从而得到不同的 Q/K/V 矩阵。与之前一样，我们将 X 乘以 WQ/WK/WV 矩阵，得到 Q/K/V 矩阵。

如果我们重复上述自注意力计算，每次使用不同的权重矩阵，重复八次，最终会得到八个不同的 Z 矩阵。

![](https://jalammar.github.io/images/t/transformer_attention_heads_z.png)

这就给我们带来了一些挑战。前馈层并不期望接收到八个矩阵，它期望的是一个矩阵（每个词对应一个向量）。因此，我们需要一种方法将这八个矩阵合并成一个矩阵。

们该如何实现呢？我们将矩阵连接起来，然后乘以一个额外的权重矩阵 WO。

![](https://jalammar.github.io/images/t/transformer_attention_heads_weight_matrix_o.png)

这就是多头自我关注的基本内容。我意识到，这涉及的矩阵相当多。让我试着把它们全部放在一个图表里，这样我们就可以在一个地方查看它们了。

![](https://jalammar.github.io/images/t/transformer_multi-headed_self-attention-recap.png)

既然我们已经谈到了注意力头，让我们回顾一下之前的例子，看看当我们在例句中对单词 “it” 进行编码时，不同的注意力头分别集中在哪里：

![](https://jalammar.github.io/images/t/transformer_self-attention_visualization_2.png)

当我们对 “它” 这个词进行编码时，一个注意力头主要集中在 “动物” 上，而另一个注意力头则集中在 “疲倦” 上——从某种意义上说，模型对 “它” 这个词的表征包含了 “动物” 和 “疲倦” 的一些表征。

然而，如果我们把所有注意力集中点都加到图中，事情就可能更难解读了：

![](https://jalammar.github.io/images/t/transformer_self-attention_visualization_3.png)

## 使用位置编码表示序列的顺序

到目前为止，我们所描述的模型还缺少一种方法来考虑输入序列中单词的顺序。

为了解决这个问题，Transformer 会给每个输入嵌入添加一个向量。这些向量遵循模型学习到的特定模式，这有助于模型确定每个词的位置，或者说序列中不同词之间的距离。其直观之处在于，将这些值添加到嵌入中，可以在嵌入向量投影为 Q/K/V 向量以及进行点积注意力机制时，提供有意义的距离。

![](https://jalammar.github.io/images/t/transformer_positional_encoding_vectors.png)

为了使模型了解单词的顺序，我们添加了位置编码向量——其值遵循特定的模式。

如果我们假设嵌入的维度为 4，那么实际的位置编码将如下所示：

![](https://jalammar.github.io/images/t/transformer_positional_encoding_example.png)

一个使用 4 的玩具嵌入大小进行位置编码的实际例子

这种模式可能是什么样的？

在下图中，每一行对应一个向量的位置编码。因此，第一行是我们将添加到输入序列中第一个词的嵌入向量中的向量。每一行包含 512 个值，每个值介于 1 和 -1 之间。我们用颜色编码了它们，以便于观察其模式。

![](https://jalammar.github.io/images/t/transformer_positional_encoding_large_example.png)

这是一个包含 20 个词（行）且嵌入大小为 512（列）的位置编码示例。可以看到，它似乎被中间一分为二。这是因为左半部分的值由一个函数（使用正弦函数）生成，右半部分的值由另一个函数（使用余弦函数）生成。然后，它们被连接起来形成每个位置编码向量。

论文（第 3.5 节）中描述了位置编码的公式。您可以在 [`get_timing_signal_1d()`](https://github.com/tensorflow/tensor2tensor/blob/23bd23b9830059fbc349381b70d9429b5c40a139/tensor2tensor/layers/common_attention.py) 函数中看到生成位置编码的代码。这并非位置编码的唯一方法。然而，它的优势在于能够扩展到未见过的序列长度（例如，如果我们的训练模型被要求翻译一个比训练集中任何句子都长的句子）。

**2020 年 7 月更新：** 上面所示的位置编码来自 Transformer 的 Tensor2Tensor 实现。论文中展示的方法略有不同，它并非直接连接两个信号，而是将它们交织在一起。下图展示了这种交织方式的效果。 [以下是生成该编码的代码](https://github.com/jalammar/jalammar.github.io/blob/master/notebookes/transformer/transformer_positional_encoding_graph.ipynb) ：

![](https://jalammar.github.io/images/t/attention-is-all-you-need-positional-encoding.png)

## 残差

在继续之前，我们需要提及编码器架构中的一个细节，即每个编码器中的每个子层（自注意力、ffnn）周围都有一个残差连接，并且之后会进行 [层归一化](https://arxiv.org/abs/1607.06450) 步骤。

![](https://jalammar.github.io/images/t/transformer_resideual_layer_norm.png)

如果要将与自注意力相关的向量和层范数运算可视化，它看起来会像这样：

![](https://jalammar.github.io/images/t/transformer_resideual_layer_norm_2.png)

这同样适用于解码器的子层。如果我们把一个由两个堆叠的编码器和解码器组成的 Transformer 看作是这样的：

![](https://jalammar.github.io/images/t/transformer_resideual_layer_norm_3.png)

## 解码器侧

现在我们已经了解了编码器方面的大部分概念，也基本了解了解码器的各个组成部分是如何工作的。接下来，让我们看看它们是如何协同工作的。

编码器首先处理输入序列。然后，顶层编码器的输出被转换为一组注意力向量 K 和 V。每个解码器在其“编码器-解码器注意力”层中都会使用这些注意力向量，以帮助解码器关注输入序列中的适当位置：

![](https://jalammar.github.io/images/t/transformer_decoding_2.gif)

编码阶段完成后，我们开始解码阶段。解码阶段的每一步都会输出输出序列中的一个元素（在本例中为英文翻译句子）。

接下来的步骤会重复上述过程，直到遇到一个特殊符号，该符号表示 Transformer 解码器已完成输出。每一步的输出都会在下一时间步被送入底层解码器，解码器会像编码器一样向上冒泡输出解码结果。与编码器输入的处理方式相同，我们也会在解码器输入中嵌入并添加位置编码，以指示每个单词的位置。

![](https://jalammar.github.io/images/t/transformer_decoding_2.gif)

解码器中的自注意力层与编码器中的自注意力层的工作方式略有不同：

在解码器中，自注意力层只能关注输出序列中较早的位置。这是通过在自注意力计算的 softmax 步骤之前屏蔽后续位置（将其设置为 `-inf` ）来实现的。

“编码器-解码器注意力”层的工作原理与多头自注意力类似，只是它从下一层创建查询矩阵，并从编码器堆栈的输出中获取键和值矩阵。

## 最终线性层和 Softmax 层

解码器栈输出一个浮点数向量。我们如何将其转换为单词？这就是最后一个线性层的任务，其后紧接着一个 Softmax 层。

线性层是一个简单的全连接神经网络，它将解码器堆栈产生的向量投影到一个更大的向量，称为 logits 向量。

假设我们的模型已经掌握了 10,000 个不同的英文单词（即模型的“输出词汇表”），这些单词是从训练数据集中学习到的。这样，logits 向量就有 10,000 个单元格——每个单元格对应一个单词的得分。这就是我们对模型输出以及后续线性层输出的解读方式。

softmax 层将这些分数转换为概率（全部为正数，总和为 1.0）。选择概率最高的单元格，并将与其关联的单词作为该时间步的输出。

![](https://jalammar.github.io/images/t/transformer_decoder_output_softmax.png)

该图从底部开始，底部显示的是解码器栈的输出向量。然后，该向量被转换成输出字。

## 训练回顾

现在我们已经了解了训练好的 Transformer 的整个前向传播过程，接下来有必要了解一下训练模型的直观原理。

在训练过程中，未经训练的模型也会经历完全相同的前向传播过程。但由于我们是在带有标签的训练数据集上进行训练，因此我们可以将其输出与实际的正确输出进行比较。

为了更直观地说明这一点，我们假设输出词汇表只包含六个单词（“a”、“am”、“i”、“thanks”、“student”和“”。\<eos> ”（“句子结束”的缩写）。

![](https://jalammar.github.io/images/t/vocabulary.png)

模型的输出词汇表是在预处理阶段创建的，甚至在我们开始训练之前就已经创建好了。

定义好输出词汇表后，我们可以使用相同宽度的向量来表示词汇表中的每个单词。这也被称为独热编码。例如，我们可以使用以下向量来表示单词 “am”：

![](https://jalammar.github.io/images/t/one-hot-vocabulary-example.png)

例如：对输出词汇表进行独热编码

回顾完以上内容后，让我们来讨论一下模型的损失函数——我们在训练阶段优化的指标，以期获得一个训练有素且有望非常准确的模型。

## 损失函数

假设我们正在训练模型。假设这是训练阶段的第一步，我们正在用一个简单的例子来训练它——将 “merci” 翻译成 “thanks”。

这意味着我们希望输出结果是一个表示 “谢谢” 一词的概率分布。但由于该模型尚未训练，因此目前不太可能实现这一点。

![](https://jalammar.github.io/images/t/transformer_logits_output_and_label.png)

由于模型的所有参数（权重）都是随机初始化的，因此（未经训练的）模型会生成一个概率分布，其中每个单元格/单词的权重值都是任意的。我们可以将其与实际输出进行比较，然后使用反向传播算法调整模型的所有权重，使输出更接近期望输出。

如何比较两个概率分布？我们只需将一个概率分布减去另一个即可。更多细节，请参阅 [交叉熵](https://colah.github.io/posts/2015-09-Visual-Information/) 和 [库尔贝克-莱布勒散度](https://www.countbayesie.com/blog/2017/5/9/kullback-leibler-divergence-explained) 。

但请注意，这只是一个过于简化的例子。更实际的情况是，我们会使用一个不止一个单词的句子。例如，输入：“je suis étudiant”，预期输出：“i am a student”。这实际上意味着，我们希望模型能够依次输出概率分布，其中：

- 每个概率分布都用一个宽度为 vocab_size 的向量表示（在我们的示例示例中为 6，但更实际的数值可以是 30,000 或 50,000 之类的数字）。
- 第一个概率分布中，与单词 “i” 对应的单元格的概率最高。
- 第二个概率分布在与单词 “am” 相关的单元格处具有最高概率。
- 如此往复，直到第五个输出分布指示 “`<end of sentence>`”符号，该符号还与来自 10,000 个元素的词汇表中的一个单元格相关联。

![](https://jalammar.github.io/images/t/output_target_probability_distributions.png)

我们将针对一个示例句子，在训练示例中训练我们的模型所依据的目标概率分布。

在对模型进行足够长时间、足够大的数据集训练后，我们希望生成的概率分布如下所示：

![](https://jalammar.github.io/images/t/output_trained_model_probability_distributions.png)

希望经过训练后，模型能够输出我们期望的正确翻译。当然，这并不能真正表明该短语是否包含在训练数据集中（参见：[交叉验证](https://www.youtube.com/watch?v=TIgfjmp-4BA) ）。请注意，即使某个位置不太可能是该时间步的输出，它也会获得一定的概率——这是 softmax 函数的一个非常有用的特性，有助于训练过程。

由于模型每次只输出一个单词，我们可以假设模型会从概率分布中选择概率最高的单词，并丢弃其余的单词。这是一种实现方法（称为贪婪解码）。另一种方法是保留概率最高的两个单词（例如“I”和“a”），然后在下一步中运行模型两次：一次假设第一个输出位置是单词“I”，另一次假设第一个输出位置是单词“a”，并保留同时考虑位置 1 和位置 2 时误差最小的版本。我们对位置 2 和位置 3 重复此操作……以此类推。这种方法称为“beam search”，在我们的示例中，`beam_size` 为 2（这意味着始终在内存中保留两个部分假设（未完成的翻译）），`top_beams` 也为 2（这意味着我们将返回两个翻译）。这两个都是您可以尝试调整的超参数。

## 勇往直前，蜕变新生

我希望这篇文章能帮助你初步了解Transformer的主要概念。如果你想深入了解，我建议你按照以下步骤进行：

- 阅读 [《Attention Is All You Need》](https://arxiv.org/abs/1706.03762) 论文、Transformer 博客文章（ [Transformer：一种用于语言理解的新型神经网络架构](https://ai.googleblog.com/2017/08/transformer-novel-neural-network.html) ）以及 [Tensor2Tensor 公告](https://ai.googleblog.com/2017/06/accelerating-deep-learning-research.html) 。
- 观看 [Łukasz Kaiser 的演讲](https://www.youtube.com/watch?v=rBCqOTEfxvg) 了解模型及其细节。
- [使用 Tensor2Tensor 代码库中提供的 Jupyter Notebook](https://colab.research.google.com/github/tensorflow/tensor2tensor/blob/master/tensor2tensor/notebooks/hello_t2t.ipynb) 进行操作
- 探索 [Tensor2Tensor 代码库](https://github.com/tensorflow/tensor2tensor) 。