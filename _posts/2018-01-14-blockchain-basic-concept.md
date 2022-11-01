---
layout:     post
title:      "区块链基本概念"
subtitle:   ""
date:       2018-01-14
author:     "余修忞(xueyufish) "
tags:
    - 区块链
---

### 定义

```
	A blockchain, originally block chain, is a continuously growing list of
	records, called blocks, which are linked and secured using
	cryptography.Each block typically contains a cryptographic hash of the
	previous block, a timestamp and transaction data.By design, a blockchain
	is inherently resistant to modification of the data. It is "an open,
	distributed ledger that can record transactions between two parties
	efficiently and in a verifiable and permanent way".For use as a
	distributed ledger, a blockchain is typically managed by a peer-to-peer
	network collectively adhering to a protocol for validating new blocks.
	Once recorded, the data in any given block cannot be altered
	retroactively without the alteration of all subsequent blocks, which
	requires collusion of the network majority.
```

区块链是首个自带对账功能的数字记账技术实现。跟传统的记账技术相比，其特点应该包括：

* 维护一条不断增长的链，只可能添加记录，而发生过的记录都不可篡改；
* 去中心化，或者说多中心化，无需集中的控制而能达成共识，实现上尽量分布式；
* 通过密码学的机制来确保交易无法抵赖和破坏，并尽量保护用户信息和记录的隐私性。

从技术特点上，可以现在区块链技术的三种典型应用场景：

| 定位 | 功能 | 智能合约 | 一致性 | 权限 | 类型 | 性能 | 代表 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 公信的数字货币 | 记账功能 | 不带有或较弱 | PoW | 无 | 公有链 | 较低 | 比特币 |
| 公信的交易处理 | 智能合约 | 图灵完备 | PoW、PoS | 无 | 公有链 | 受限 | 以太坊 |
| 带权限的交易处理 | 商业处理 | 多种语言，图灵完备 | 多种，可插拔 | 支持 | 联盟链 | 可扩展 | Hyperledger |

### 基本原理
区块链的基本原理包括：

* 交易（Transaction）：一次操作，导致账本状态的一次改变，如添加一条记录；
* 区块（Block）：记录一段时间内发生的交易和状态结果，是对当前账本状态的一次共识；
* 链（Chain）：由一个个区块按照发生顺序串联而成，是整个状态变化的日志记录。

如果把区块链作为一个状态机，则每次交易就是试图改变一次状态，而每次共识生成的区块，就是参与者对于区块中所有交易内容导致状态改变的结果进行确认。
![simpleBlockchain](/assets/attachment/blockchain-basic-concept/simpleBlockchain.png)

在实现上，首先假设存在一个分布式的数据记录本（这方面的技术相对成熟），这个记录本只允许添加、不允许删除。其结构是一个线性的链表，由一个个“区块”串联组成，这也是其名字“区块链”的来源。新的数据要加入，必须放到一个新的区块中。而这个块（以及块里的交易）是否合法，可以通过一些手段快速检验出来。维护节点都可以提议一个新的区块，然而必须经过一定的共识机制来对最终选择的区块达成一致。

在比特币中，客户端发起一项交易后，会广播到网络中并等待确认。网络中的节点会将一些等待确认的交易记录打包在一起（此外还要包括此前区块的哈希值等信息），组成一个候选区块。然后，试图找到一个 nonce 串放到区块里，使得候选区块的 hash 结果满足一定条件（比如小于某个值）。一旦算出来这个区块在格式上合法了，就可以进行全网广播。大家拿到提案区块，进行验证，发现确实符合约定条件了，就承认这个区块是一个合法的新区块，被添加到链上。

比特币的这种基于算力的共识机制被称为 Proof of Work（PoW）。目前，要让 hash 结果满足一定条件并无已知的启发式算法，只能进行暴力尝试。尝试的次数越多，算出来的概率越大。通过调节对 hash 结果的限制，比特币网络控制约 10 分钟平均算出来一个合法区块。算出来的节点将得到区块中所有交易的管理费和协议固定发放的奖励费，也即俗称的挖矿。

很自然会有人问，能否进行恶意操作来破坏整个区块链系统或者获取非法利益。比如不承认别人的结果，拒绝别人的交易等。实际上，因为系统中存在大量的用户，而且用户默认都只承认他看到的最长的链。只要不超过一半（概率意义上越少肯定越难）的用户协商，最终最长的链将很大概率上是合法的链，而且随着时间增加，这个概率会越大。

### 分类
根据参与者的不同，可以分为公开（Public）链、联盟（Consortium）链和私有（Private）链。

* 公开链: 任何人都可以参与使用和维护，典型的如比特币区块链，信息是完全公开的。
* 私有链: 集中管理者进行限制，只能得到内部少数人可以使用，信息不公开。
* 联盟链: 介于公开链和私有链之间，由若干组织一起合作维护一条区块链，该区块链的使用必须是有权限的管理，相关信息会得到保护，典型如银联组织。

### 账本

#### 账本演化

账本科技从古至今的演化过程大致分为四个阶段：简单账本、复式账本、数字化账本、分布式账本。各个阶段的时期和特点如下:

阶段 | 时期 | 主要特点
--- | --- | ---
阶段一：简单账本 | 约公元前 3500 年 ~ 15 世纪 | 使用原始的单式记账法（Single Entry Bookkeeping）
阶段二：复式账本 | 15 世纪 ~ 20 世纪中期 | 现代复式记账法（Double Entry Bookkeeping）出现和应用
阶段三：数字化账本 | 20 世纪中期 ~ 21 世纪初 | 物理媒介账本演化到数字化账本
阶段四：分布式账本 | 2009 年至今 | 以区块链为代表的分布式账本相关思想和技术出现

#### 分布式记账
自电子计算机发明以来，数字化账本因为其便捷高效的特性很快就成为最主要的记账媒介。然而，数字化账本仍然是中心化的形式，这就意味着参与商业活动的多方首先要寻找一个能共同信任的第三方来记账，以确保交易记录的准确。

随着商业活动的规模越来越大，商业过程愈加动态和复杂（例如供应链领域动辄涉及来自多个行业的数百家参与企业），很多时候难以找到同时满足共同信任和隐私安全的第三方记账方，即便存在也往往需要较高的使用成本。这就需要探讨在多方分布式场景下进行协同记账的可能性。

分布式记账的三个方案：

**1、简单分布式记账结构**

该方案中，账本为一个记录队列，由多方共同维护，多个参与方均对账本中记录拥有操作权限，并相互约定：一旦发生新的交易即追加到账本上，已发生的交易记录不得进行篡改。

缺陷：这种情况下，如果参与多方均诚实可靠依照约定执行，则该记账方案可以正常工作。但是一旦有参与方恶意操作，篡改已发生过的记录，则无法确保账本记录的正确性，并且他人无法获知篡改是否发生。

![简单分布式记账](/assets/attachment/blockchain-basic-concept/a5926e8ae4bbac0b1f5411db55ee6c4b.png)

**2、带有数字摘要验证的分布式记账**

每次当有新的交易记录被追加到账本上时，参与各方可以使用约定的摘要算法对完整的交易历史计算数字摘要，获取当前交易历史的“指纹”。此后任意时刻，任何参与方都可以随时对交易历史重新计算摘要，一旦发现指纹不匹配，则说明交易记录被篡改过。同时，通过追踪指纹改变位置，还可以定位到被篡改的交易记录。

缺陷：由于每次校验需要从头对所有的历史数据计算数字摘要，当账本中存有大量历史交易时，数字摘要计算成本将变得很高。而且，随着新交易的发生，计算耗费将越来越大，该方案将无法支撑大规模的记账情形。

![带有数字摘要验证的分布式](/assets/attachment/blockchain-basic-concept/ed0aa8f87f0ea7629daafa204543f970.png)

**3、带有数字摘要验证的可扩展分布式记账**

每次摘要时实际上已经确保了从头开始到摘要位置的历史的正确性，因此当新的交易发生后，实际上需要进行额外验证的只是新发生的若干交易，即增量部分。因此，计算摘要的过程可以改进为对旧的摘要值以及增量交易内容进行验证。这样就既解决了防篡改问题，又解决了可扩展性问题。

![带有数字摘要验证的可扩展的分布式](/assets/attachment/blockchain-basic-concept/6019e73b9c32054acf2316faa20822f3.png)

实际上，方案三账本结构就是一个区块链结构。

![区块链结构](/assets/attachment/blockchain-basic-concept/4125dd96bdd5a60dc6fa3d3b4d06fbd1.png)

### 参考资料

1. [Wikipedia](https://en.wikipedia.org/wiki/Blockchain)
1. [区块链技术指南](https://github.com/yeasy/blockchain_guide)