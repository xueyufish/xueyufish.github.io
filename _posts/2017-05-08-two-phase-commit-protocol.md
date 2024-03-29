---
layout:     post
title:      "两阶段提交协议"
date:       2017-05-08
author:     "xueyufish"
keyword:    "分布式, 分布式系统, 分布式协议, 两阶段提交协议, 2PC, xueyufish"
description: "两阶段提交协议"
tags:
    - 2PC
    - 分布式
---

两阶段提交协议（two phase commit protocol，2PC）可以保证数据的强一致性，许多分布式关系型数据管理系统采用此协议来完成分布式事务。它是协调所有分布式原子事务参与者，并决定提交或取消（回滚）的分布式算法。同时也是解决一致性问题的一致性算法。该算法能够解决很多的临时性系统故障（包括进程、网络节点、通信等故障），被广泛地使用。

在两阶段提交协议中，系统一般包含两类机器（或节点）：一类为协调者（coordinator），通常一个系统中只有一个；另一类为事务参与者（participants，cohorts或workers），一般包含多个，在数据存储系统中可以理解为数据副本的个数。协议中假设每个节点都会记录写前日志（write-ahead log）并持久性存储，即使节点发生故障日志也不会丢失。协议中同时假设节点不会发生永久性故障而且任意两个节点都可以互相通信。

# 运行过程

## 预备阶段(Prepare phase)：

	>1.1 事务询问：协调者向所有的参与者发送事务执行请求，并等待参与者反馈事务执行结果。
  >
	>1.2 执行事务：事务参与者收到请求之后，执行事务，但不提交，并记录事务日志。
  >
	>1.3 反馈响应：参与者将自己事务执行情况反馈给协调者，同时阻塞等待协调者的后续指令。

## 提交阶段(Commit phase)

	在第一阶段协调者的询盘之后，各个参与者会回复自己事务的执行情况，这时候存在三种可能:

	>2.1 所有的参与者回复能够正常执行事务
  >
	>2.2 一个或多个参与者回复事务执行失败
  >
	>2.3 协调者等待超时。

	对于第一种情况，协调者将向所有的参与者发出提交事务的通知，具体步骤如下：

	> 2.1.1 协调者向各个参与者发送 commit 通知，请求提交事务。
  >
	> 2.1.2 参与者收到事务提交通知之后，执行 commit 操作，然后释放占有的资源。
  >
	> 2.1.3 参与者向协调者返回事务 commit 结果信息。

	对于第二、三种情况，协调者均认为参与者无法正常成功执行事务，为了整个集群数据的一致性，所以要向各个参与者发送事务回滚通知，具体步骤如下：

	> 2.2.1 协调者向各个参与者发送事务 rollback 通知，请求回滚事务。
  >
	> 2.2.2 参与者收到事务回滚通知之后，执行 rollback 操作，然后释放占有的资源。
  >
	> 2.2.3 参与者向协调者返回事务 rollback 结果信息。

![2PC](/assets/attachment/two-phase-commit-protocol/07717718-1230-4347-aa18-2041c315e670.jpg)

需要注意的是，在准备阶段，参与者执行了事务，但是还未提交。只有在提交阶段协接收到协调者发来的通知后，才进行提交或者回滚。

# 优缺点

## 优点
两阶段提交协议的优点：原理简单，实现方便。

## 缺点

**1、同步阻塞**

执行过程中，所有参与节点都是事务阻塞型的。当参与者占有公共资源时，其他第三方节点访问公共资源不得不处于阻塞状态。

**2、单点故障**

如果协调者不可用，那么参与者将不能正常完成事务，比如在第二阶段中，如果协调者因为故障不能正常发送事务提交或回滚通知，那么参与者们将一直处于阻塞状态，整个数据库集群将无法提供服务。

**3、数据不一致**

两阶段提交协议仍然存在数据不一致性的可能，比如在第二阶段中，假设协调者发出了事务 commit 的通知，但是因为网络问题该通知仅被一部分参与者所收到并执行了 commit 操作，其余的参与者则因为没有收到通知一直处于阻塞状态，这时候就产生了数据的不一致性。
