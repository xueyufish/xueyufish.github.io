---
layout:     post
title:      "Raft 协议简介"
date:       2017-08-12
author:     "余修忞(xueyufish)"
keyword:    "Raft, 分布式, 分布式协议, 余修忞, yuxiumin, xueyufish"
description: "Raft 协议简介"
tags:
    - Raft
    - 分布式
---

Raft 是一种为了管理复制日志的一致性算法。它提供了和 Paxos 算法相同的功能和性能，但是它的算法结构和 Paxos 不同，使得 Raft 算法更加容易理解并且更容易构建实际的系统。

# 角色
在一个由 Raft 协议组织的集群中有三类角色：
1. **领导人 (Leader)**: 负责处理来自客户端的请求，管理日志复制、以及与 Follower 保持心跳以维持其领导人地位。在一个任期内,领导人一直都会是领导人直到自己宕机了。
2. **追随者 (Follower)**: 刚启动时所有节点为 Follower 状态，响应 Leader 的日志同步请求，响应 Candidate 的请求，把请求到 Follower 的事务转发给 Leader；
3. **候选人 (Candidate)**: 负责选举投票，Raft 刚启动时由一个节点从 Follower 转为 Candidate 发起选举，选举出 Leader 后从 Candidate 转为 Leader  状态；
![Raft协议角色](http://img.yuxiumin.com/screenshots/raft-protocol-intro/e69b90e3e5b3b1faf66e8dc088d780e3.png)

# 任期
Raft 中时间被划分成任意长度的任期 (Term)，每个任期开始都是一次选举。在选举成功后，Leader 会管理整个集群直到任期结束。有时候选举会失败，那么这个任期就会没有 Leader 而结束，一个新的任期（和一次新的选举）会很快重新开始。Raft 保证了在一个给定的任期内，最多只有一个 Leader。针对某个任期的选举有下面几种可能：
1. 如果当前 Term == 2 的任期内没有选举出 Leader 或出现异常，Term 递增为 3，并开始新一轮选举。
2. 此轮 Term == 2 的任期内选举出 Leader 后，如果 Leader 宕机，此时其他 Follower 转为 Candidate，Term 递增，并发起新的选举。
3. 如果 Leader 或 Candidate 发现自己的 Term 比其他 Follower 小，Leader 或 Candidate 转为 Follower，Term 递增。
4. 如果 Follower 发现自己的 Term 比其他 Follower 小，更新 Term 与其他 Follower 保持一致。

![Raft任期](http://img.yuxiumin.com/screenshots/raft-protocol-intro/2c8ab2c4739c177554c72b1979e48328.png)

# Leader 选举
Raft 使用心跳机制来触发 Leader 选举。当服务器程序启动时，他们都是 Follower 身份。一个服务器节点继续保持着 Follower 状态直到他从 Leader 或者 Candidate 处接收到有效的 RPCs。

要开始一次选举过程，Follower 先要增加自己的当前任期号并且转换到 Candidate 状态。然后他会并行的向集群中的其他服务器节点发送请求投票的 RPCs 来给自己投票。Candidate 会继续保持着当前状态直到以下三件事情之一发生：
1. 他自己赢得了选举：从整个集群的大多数服务器节点获得了针对同一个任期号的选票，然后会向其他的服务器发送心跳消息阻止新的 Leader 的产生
2. 其他服务器成为 Leader：如果其他服务器 Leader 的任期号不小于 Candidate 当前的任期号，那么 Candidate 会承认 Leader 合法并回到 Follower 状态；如果比自己小，那么 Follower 就会拒绝并继续保持 Candidate 状态。
3. 无 Candidate 胜出：当前 <code>Term + 1</code> 并且重新开始一轮选举。
选出 Leader 后，Leader 通过定期向所有 Follower 发送心跳信息维持其统治。若 Follower 一段时间未收到 Leader 的心跳则认为 Leader 可能已经挂了再次发起选主过程。

# 日志复制
Raft 协议强依赖 Leader 节点的可用性来确保集群数据的一致性。数据的流向只能从 Leader 节点向 Follower 节点转移。
1. Leader 收到客户端请求后，处于未提交状态（Uncommitted），会将请求内容先添加到本地 Log 记录中，并向其它 Follower 发送 AppendEntries RPCs，让他们复制这条日志条目。
2. 其它 Follower 收到请求后，追加到本地的 Log 中，并给 Leader 发送添加成功的 ACK。
3. Leader 在收到过半数 Follower 添加成功的 ACK 后，将日志置为已提交状态并正式提交日志。通知客户端，并发送 AppendEntries RPC 请求通知 Follower 提交日志。

# 数据一致性保障
正常情况下，Raft 通过领导人选举和日志复制即可完成运行。但是整个过程中 Leader 可能在任意阶段不可用，对于异常情况的处理如下：

### 数据到达 Leader 节点前

这个阶段 Leader 的不可用对整个系统的一致性不造成影响。
![数据到达Leader前的不一致性](http://img.yuxiumin.com/screenshots/raft-protocol-intro/15fdd1dc00280488d6d6b4f3e0e950d7.png)

### 数据到达 Leader 节点，但未复制到 Follower 节点

这个阶段 Leader 不可用，数据属于未提交状态，<code>Client</code> 由于没有收到来自 Leader 的 ACK, 会认为超时失败，可安全发起重试。Follower 节点上没有该数据，重新选主后 <code>Client</code> 尝试重新提交可成功。

原来的 Leader 节点恢复后作为 Follower 加入集群重新从当前任期的新 Leader 处同步数据，强制保持和新选出的 Leader 数据一致。

![数据到达Leader但未复制到Follower节点的不一致性](http://img.yuxiumin.com/screenshots/raft-protocol-intro/e9ccc3837439b3c5661e25f2b004c2e6.png)

### 数据到达 Leader 节点，成功复制到 Follower 所有节点，但还未向 Leader 响应接收

这个阶段 Leader 不可用，虽然数据在 Follower 节点处于未提交状态（Uncommitted）但保持一致，重新选出 Leader 后可完成数据提交，此时 <code>Client</code> 由于不知到底提交成功没有，可重试提交。针对这种情况 Raft 要求 <code>RPC</code> 请求实现幂等性，也就是要实现内部去重机制。

![数据到达Leader节点成功复制到Follower所有节点，但还未向Leader响应接收](http://img.yuxiumin.com/screenshots/raft-protocol-intro/a66543ab00678ff94d1e49d625754419.png)

### 数据到达 Leader 节点，成功复制到 Follower 部分节点，但还未向 Leader 响应接收

这个阶段 Leader 挂掉，数据在 Follower 节点处于未提交状态（Uncommitted）且不一致，Raft 协议要求投票只能投给拥有最新数据的节点。所以拥有最新数据的节点会被选为 Leader 再强制同步数据到 Follower，数据不会丢失并最终一致。

![数据到达Leader成功复制到Follower部分节点但还未向Leader响应接收](http://img.yuxiumin.com/screenshots/raft-protocol-intro/e88920eaab63652ce05de3cd5ad95866.png)

### 数据到达 Leader 节点，成功复制到 Follower 所有或多数节点，数据在 Leader 处于已提交状态，但在 Follower 处于未提交状态

这个阶段 Leader 挂掉，重新选出新 Leader 后的处理流程和阶段 3 一样。

![](http://img.yuxiumin.com/screenshots/raft-protocol-intro/2156a1d771c1adac7336a19f7f42e4b1.png)

### 数据到达 Leader 节点，成功复制到 Follower 所有或多数节点，数据在所有节点都处于已提交状态，但还未响应 Client

这个阶段 Leader 挂掉，集群内部数据其实已经是一致的，<code>Client</code> 重复重试基于幂等策略对一致性无影响。

![](http://img.yuxiumin.com/screenshots/raft-protocol-intro/46e4f2e4521ae00189a4427f7679ebad.png)

### 网络分区导致的脑裂情况，出现双 Leader

网络分区将原先的 Leader 节点和 Follower 节点分隔开，Follower 收不到 Leader 的心跳将发起选举产生新的 Leader。这时就产生了双 Leader，原先的 Leader 独自在一个区，向它提交数据不可能复制到多数节点所以永远提交不成功。向新的 Leader 提交数据可以提交成功，网络恢复后旧的 Leader 发现集群中有更新任期的新 Leader 则自动降级为 Follower 并从新 Leader 处同步数据达成集群数据一致。

![](http://img.yuxiumin.com/screenshots/raft-protocol-intro/8e1cb38a56d86a412289ad1318b40838.png)

# 参考资料

1. [Raft: In search of an Understandable Consensus Algorithm](https://ramcloud.stanford.edu/wiki/download/attachments/11370504/raft.pdf)
2. [Raft 协议中文翻译](https://github.com/maemual/raft-zh_cn/)
3. [The Secret Lives of Data](http://thesecretlivesofdata.com/raft/)
4. [Raft 为什么是更易理解的分布式一致性算法](https://www.cnblogs.com/mindwind/p/5231986.html)
