---
layout:     post
title:      "分布式锁及其实现方式简介"
date:       2018-07-18
author:     "余修忞(xueyufish)"
keyword:    "分布式, 锁, Lock, 分布式锁, Redis, Mysql, Zookeeper, 余修忞, yuxiumin, xueyufish"
description: "分布式锁及其实现方式简介"
tags:
    - 分布式
    - Redis
    - Mysql
    - Zookeeper
---

通常，对于多线程访问共享资源的应用，我们往往需要对共享资源进行加锁保护，防止数据发生错乱；而在分布式场景下，分布式锁对于共享资源的正确性、有效性起着非常重要的作用。使用分布式锁，同样可以防止数据错乱行为的发生；此外，也可以避免不必要的外部请求，从而提升系统效率。

多线程场景下锁的实现各个语言或系统提供了不同的方式，而对于分布式锁，目前比较流行的主要是通过 DB、Redis、Zookeeper 三种方式实现。 Redis官方关于分布式锁的文档中总结了分布式锁需要的三个特点：
1. **安全性**：在任意时刻，只有一个客户端可以获取锁；
2. **无死锁**：客户端最终一定可以获得锁，即使锁住某个资源的客户端在释放锁之前崩溃或网络不可达；
3. **容错性**： 只要锁服务集群中的大部分节点存活，客户端就可以进行加锁解锁操作；

# 基于数据库实现
基于数据库的实现方式很多，主要思想是在数据表上加排他锁。当请求来到时对表记录进行锁检查，如果当前没有占用锁，则可以对共享资源进行操作；等到操作完成后释放锁。

以 MySQL 数据库为例，创建数据表：
```sql
CREATE TABLE `dlock`  (
  `lockId` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `txId` int(11) UNSIGNED NOT NULL COMMENT '锁事务ID',
  `lockName` varchar(32) NOT NULL COMMENT '锁名称',
  `createdAt` timestamp NOT NULL default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`lockId`),
  UNIQUE INDEX `idx_txid`(`txId`)
);
```
具体实现方式：
1. 当请求到来时，先通过 select 语句判断当前事务 ID 是否被占用，即在表中是否已经存在 <code>txId=currentTxId</code> 的记录；
2. 如果存在，则表示当前事务已经被锁定，没办法获取锁；如果不存在，则在数据表中 insert 一条 <code>txId=currentTxId</code> 的记录；
3. 当请求执行完成后，如果需要释放锁，执行 delete 语句删除表中记录。

基于数据库的分布式实现相对而言最简单，不过存在着不少问题，主要包括：

* 对数据库依赖较高，如果需要实现高可用相对比较复杂；
* 没有自动失效功能，一旦解锁操作失败，会导致锁记录一直在数据库中，其他线程无法再获得到锁；
* insert 操作一旦失败会直接报错，没有获得锁的线程并不会进入排队队列，要想再次获得锁就要再次触发获得锁操作；
* 同一个线程在没有释放锁之前无法再次获得该锁, 也就是说是非重入锁。

基于数据库确实在对可用性要求不高场景下可以实现分布式锁。上述的问题也有具体的解决方案，比如：对于数据库高可用的问题，可以通过 master-salve 方式解决；对于不能自动失效的问题，可以通过业务层定时任务实现；对于非阻塞锁的问题，可以通过循环判断的方式解决；而对于非重入锁问题，也可以通过增加字段记录主机和线程号的方式解决。

随着要求逐步提升，数据库方式实现的分布式锁需要业务代码进行保证，而与之相付出的成本增加甚至不一定比其他方式低。另一方面，关系型数据库对 I/O 层面的开销，如果在并发量比较大的情况下，性能也是一个需要考量的因素，特别在需要复制的场景下。

# 基于 Redis 实现
## SET NX 实现
缓存相对于数据库拥有更好的性能优势，比如 Redis，在硬件条件满足的情况下，tps 可以达到 10W 左右，足以支撑分布式锁的需求。Redis 处理分布式锁的简单方式是使用 SET NX 命令:
```shell
SET resource_name my_random_value NX PX 30000
```
* <code>SET NX</code> 命令只会在 key 不存在的情况下给 key 赋值，PX 命令通知 Redis 保存 key 30000ms；
* my_random_value 必须是全局唯一的值。这个随机数在释放锁时保证释放锁操作的安全性；
* PX 操作后面的参数代表这个 key 的存活时间，即锁过期时间。如果资源被锁定超过这个时间，则锁将被自动释放；如果某个客户端获取资源后占用超过这个时间，锁也将被释放，从而引起锁争用。

使用 <code>SET NX</code> 命令只有在某个 key 不存在情况才能 set 成功，这样就达到了多个进程并发去 set 同一个 key，只有一个进程能 set 成功。其他进程因为之前有其他进程把 key 设置成功了，从而会导致获取锁失败。

可以通过以下Lua脚本实现为申请成功的锁解锁：
```lua
if redis.call("get",KEYS[1]) == ARGV[1] then
    return redis.call("del",KEYS[1])
else
    return 0
end
```
使用这种方式释放锁可以避免删除别的客户端获取成功的锁，因为脚本仅会删除 value 等于客户端 A 的 value 的 key。

## Redlock 算法
Redis 作者鉴于 Redis 单点数据丢失的问题，提出了 Redlock 算法，旨在保证分布式锁的高可用。这个算法也引起了一定程度上的争议。

Redlock 算法假设有 N 个 Redis 节点，这些节点互相独立，一般设置为 N=5，这 N 个节点运行在不同的机器上以保持物理层面的独立。算法流程如下：
1. 客户端获取当前 Unix 时间，以毫秒为单位;
2. 客户端依照上文所述方式尝试获取 N 个节点的锁，这 N 个节点以相同的 key 和 value 获取锁。客户端需要设置接口访问超时时间，这个接口超时时间需远远小于锁超时时间，比如锁自动释放的时间是10s，那么接口超时大概设置5-50ms。这样可以在有 redis 节点宕机后，访问该节点时能尽快超时，而减小锁的正常使用。
3. 客户端使用当前时间减去开始获取锁时间（步骤1记录的时间）就得到获取锁使用的时间。当且仅当从大多数（这里是3个节点）的Redis节点都取到锁，并且使用的时间小于锁失效时间时，锁才算获取成功。
4. 如果取到了锁，key 的真正有效时间等于有效时间减去获取锁所使用的时间（步骤3计算的结果）。
5. 如果因为某些原因，获取锁失败（没有在至少 N/2+1 个 Redis 实例取到锁或者取锁时间已经超过了有效时间），客户端应该在所有的Redis实例上进行解锁（即便某些Redis实例根本就没有加锁成功）

使用 Redlock 算法，可以保证在 N/2-1 个客户端实例不可用时，整个分布式锁依然可用。

关于 Redlock 算法，有个作者在其一篇文章[How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)中提出了质疑，作者认为如果发生Full GC或者其他情况的业务暂停导致某个持有锁的应用锁释放，有可能引起数据不一致：

1. 如果 Client1 先获取到了锁；
2. 其他 Client 在等待 Client1 的工作完成；
3. 这时候如果 Client1 被挂在了某些事情上，获取 CPU 被别的进程占满，或是不巧碰上了 FullGC，导致 Client1 花了超过平时几倍的时间；
4. 锁服务在锁超时时间到了以后自动释放锁；
5. Client2 获取锁并且更新资源；
6. 过阵 Client1 处理完密集事务以后再去更新资源，把 Client2 更新的冲掉了。悲剧发生了，数据出错了。

![unsafe-lock](http://img.yuxiumin.com/screenshots/distributed-lock/unsafe-lock.png)

为了解决这个问题，文章作者引入了栅栏(fencing)技术，在每个写请求中附加一个自增的版本号，这就是乐观锁的实现：
* 锁服务需要有一个单调递增的版本号；
* 写数据时，也要带上自己的版本号；
* 数据库服务需要保存数据的版本号，然后对请求做检查。

![fencing-tokens](http://img.yuxiumin.com/screenshots/distributed-lock/fencing-tokens.png)

Redis 作者后来对这篇文章中提出的问题进行了相应的评论，具体参见[Is Redlock safe](http://antirez.com/news/101)这篇文章。不过个人认为，基于 redis 实现的分布式锁，如果需要强一致性保证，还是需要增加版本号做保证，上述文章中提到的问题也切实有可能发生，并且 HBase 中就确实发生过[Hbase and HDFS Understanding filesystem usage in HBase](https://www.slideshare.net/enissoz/hbase-and-hdfs-understanding-filesystem-usage)。

当然，作者提出的如果增加版本号也需要有一个分布式服务来生成单调自增版本号的问题是存在的，也会使得系统的复杂性提升；因为 Redlock 的实现机制实际上是在尽可能的做到分布式一致性，相比较而言，个人觉得基于 Paxos 或者 Raft 等一致性协议实现更适合。

# 基于 Zookeeper 实现

Zookeeper 作为分布式协调服务在业内已经被广泛使用，它基于 zab 协议实现, 对 Zookeeper 写入请求会转发到 leader，leader 写入完成，并同步到其他节点，直到所有节点都写入完成，才返回客户端写入成功。

Zookeeper 实现分布式锁大的致流程如下：
1. 首先创建一个持久化的根节点，假设为 <code>/lock</code>;
2. 客户端连接 Zookeeper，并在根节点 <code>/lock</code> 下创建临时有序的子节点，第一个客户端对应的子节点为 <code>/lock/lock-000</code>，第二个为 <code>/lock/lock-001</code>，以此类推。
3. 客户端获取 <code>/lock</code> 下的子节点列表，判断自己创建的子节点是否为当前子节点列表中序号最小的子节点，如果是则认为获得锁，否则监听自己创建的节点之前一位子节点的删除消息，获得子节点变更通知后重复此步骤直至获得锁；
4. 执行业务代码；
5. 完成业务流程后，删除对应的子节点释放锁。

可以看出，Zookeeper 具备几个特质，让它非常适合作为分布式锁服务：
1. 支持 watcher 机制，这样实现阻塞锁。通过 watch 锁数据，等到数据被删除，Zookeeper 会通知客户端去重新竞争锁;
2. 支持临时节点，即客户端写入的数据是临时数据，在客户端宕机后，临时数据会被删除，这样就实现了锁的异常释放;
3. 节点支持保存数据信息，这样客户端主机名和线程号可以被方便记录，下次想要获取锁的时候和当前最小的节点中的数据比对如果和自己的信息一样，那么自己直接获取到锁，如果不一样就再创建一个临时的顺序节点，参与排队；
4. Zookeeper 天然支持集群部署的特性，只要集群中有半数以上的机器存活，就可以对外提供服务，所以对高可用提供很好的保证；

使用 Zookeeper 也有可能带来并发问题，只是并不常见而已。比如，由于网络抖动等原因客户端 zk 集群的 session 连接断开，zk 以为客户端不可用，就会删除临时节点，这时候其他客户端可以获取到分布式锁，就可能产生并发问题。这个问题不常见是因为 zk 有重试机制，一旦 zk 集群检测不到客户端的心跳，就会重试，Curator 客户端支持多种重试策略，多次重试之后还不行的话才会删除临时节点。

[curator 客户端](http://curator.apache.org/)对 zookeeper 提供了一些包装，可以参考其对分布式锁相关实现的源码。

综合来看，Zookeeper 方式的分布式锁实现，相对于其他两种方式在可用性、正确性等方面更为可靠，复杂度也不高，相比于 redis 的实现方式，唯一不足可能就是在性能方面稍微有所欠缺，不过应该也在可以接受的范围之内。

# 参考资料

1. [Distributed Locks With Redis](https://redis.io/topics/distlock)
2. [How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
3. [Implementation of distributed locks](https://www.alibabacloud.com/forum/read-453)
4. [Is Redlock safe](http://antirez.com/news/101)
5. [ZooKeeper Recipes and Solutions](https://zookeeper.apache.org/doc/r3.4.4/recipes.html)
6. [curator](http://curator.apache.org/)
7. [分布式锁的几种实现方式](http://www.hollischuang.com/archives/1716)
8. [聊一聊分布式锁的设计](http://weizijun.cn/2016/03/17/%E8%81%8A%E4%B8%80%E8%81%8A%E5%88%86%E5%B8%83%E5%BC%8F%E9%94%81%E7%9A%84%E8%AE%BE%E8%AE%A1/)
