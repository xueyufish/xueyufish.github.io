---
layout:     post
title:      "Redis 学习笔记 - 基本使用"
date:       2018-04-05
author:     "xueyufish"
keyword:    "Redis, 缓存, 分布式缓存, xueyufish"
description: "Redis 基本使用学习笔记"
tags:
    - Redis
    - 缓存
---

Redis 作为开源的第三方存储中间件已经被大规模应用在各大领域中，之前对 Redis 的使用虽然非常多，但是一直停留在 use 的范畴，没有做过认真的梳理和小结。最近正好有时间，希望分基本使用、持久化、复制、哨兵、集群等几个维度来对 redis 进行归纳总结。本文首先对基本的使用进行相关介绍。

# 基本特性和场景
Redis 的基本特性其实不用多说，主要包括:
1. 简单稳定，速度快性能好；
2. 基于 K-V 的数据存储，支持多种数据类型；
3. 支持持久化；
4. 支持主从复制；
5. 支持高可用和分布式；
6. 丰富的客户端语言；

Redis 的使用场景也非常丰富，包括但不限于: 缓存、排行榜系统、计数器应用、社交网络、消息队列系统等。

但是，任何事物总有它的局限性，Redis 同样也不是万能的。往往对于大规模数据的存储、对于不需要经常频繁操作的冷数据等等，我们需要认真对待，考察是否应该使用 Redis 来处理，还是有更好的可替代方案。

# 基本命令
## 全局命令
这里的全局命令为对于 redis 中所有 key 都通用的一些命令，如下:

| 命令 | 时间复杂度 | 说明 |
| ---- | ---- | ---- |
| KEYS pattern | O(N), N 为 db 中所有键的数量 | 返回模式匹配的所有键，在生产环境中需谨慎使用 |
| DBSIZE |  | 返回当前选择 db 中的键总数 |
| EXISTS key [key ...] | O(1) | 判断 key 是否存在, 存在返回1, 不存在返回0 |
| DEL key [key ...] | O(N), N 为被删除的键的数量 | 删除 db 中指定的键 |
| EXPIRE key seconds | O(1) | 给键设置过期时间，达到过期时间后键将被自动删除 |
| TYPE key | O(1) | 返回键的数据结构类型 |

## 字符串

| 命令 | 时间复杂度 | 说明 |
| ---- | ---- | ---- |
| SET key value <br> [expiration EX seconds\|PX milliseconds] <br> [NX\|XX] | O(1) | 设置值 EX: 过期时间(秒), PX: 过期时间(毫秒) NX: 只在 key 不存在的时候设置 XX: 只在 key 存在的时候设置 |
| GET key | O(1) | 根据 key 获取 value |
| MSET key value [key value …] | O(N), N为设置的key的数量 | 批量设置值 |
| MGET key value [key value …] | O(N), N为接收的key的数量 | 批量获取值 |
| INCR Key | O(1) | 给存储在 key 里面的数加1 |
| APPEND key value | O(1) | 在字符串结尾追加值 |
| STRLEN key | O(1) | 返回字符串长度 |
| GETSET key value | O(1) | 设置并返回原值 |
| SETRANGE key offset value | O(1) | 设置指定位置的字符 |
| GETRANGE key start end | O(N), N为返回的字符串长度 | 获取部分字符串 |

## 哈希

| 命令 | 时间复杂度 | 说明 |
| ---- | ---- | ---- |
| HSET key field value | O(1) | 设置值 |
| HGET key field | O(1) | 获取值 |
| HDEL key field [field ...]  | O(N), N为被删除的字段数 | 删除字段 |
| HLEN key |  O(1) | 计算字段个数 |
| HMSET key field value [field value ...] | O(N), N为被设置的字段数 | 批量设置字段值 |
| HMGET key field [field ...] | O(N), N为被请求的字段数 | 批量设置字段值 |
| HEXISTS key field | O(1) | 判断字段在 hash 中是否存在 |
| HKEYS key | O(N), N为哈希的大小数量 | 获取 hash 中所有的字段名称 |
| HVALS key | O(N), N为哈希的大小数量 | 获取 hash 中所有的值 |
| HGETALL key | O(N), N为哈希的大小数量 | 获取 hash 中所有的字段和值 |
| HINCRBY key field increment | O(1) | 给存储在 hash 中字段的计数增加整数值 |
| HINCRBYFLOAT key field increment | O(1) | 给存储在 hash 中字段的计数增加浮点值 |
| HSTRLEN key field | O(1) | 计算 value 的字符串长度 |

**需要注意**，在使用 HGETALL 时如果哈希元素个数比较多，会存在阻塞 Redis 的可能。如果开发人员只需要获取部分字段，可以使用 HMGET，如果一定要获取全部字段和值，可以使用 HSCAN 命令，该命令会渐进式遍历哈希类型。

## 列表

| 命令 | 时间复杂度 | 说明 |
| ---- | ---- | ---- |
| HRPUSH key value [value ...] | O(1) | 插入指定的 value 到列表的尾部 |
| LPUSH key value [value ...] | O(1) | 插入指定的 value 到列表的头部 |
| LINSERT key BEFORE\|AFTER pivot value | O(n), 其中 n 为 pivot 距离列表头或尾的距离 | 向某个元素前或者后插入元素 |
| LRANGE key start stop | O(S+N), S 是 start 的偏移量，N 是 start 到 end 的距离 | 获取指定范围内的元素列表 |
| LINDEX key index | O(N)，N 为索引偏移量 | 获取列表指定索引下标的元素 |
| LLEN key | O(1) | 获取列表长度 |
| LPOP key | O(1) | 移除并返回第一个元素 |
| RPOP key | O(1) | 移除并返回最后一个元素 |
| LREM key count value | O(N), N 为列表长度 | 移除指定元素，count>0时从头到尾移除; count<0时从尾到头移除; count=0时移除所有等于value的元素 |
| LTRIM key start stop | O(N), N 为被裁剪的数量 | 按照索引范围修剪列表 |
| LSET key index value | O(N), N 为索引偏移量 | 设置指定索引下标元素的值 |
| BLPOP key [key ...] timeout | O(1) | 从列表左侧阻塞弹出 |
| BRPOP key [key ...] timeout | O(1) | 从列表右侧阻塞弹出 |

## 集合

集合类型也是用来保存多个的字符串元素，但和列表类型不一样的是，集合中不允许有重复元素，并且集合中的元素是无序的，不能通过索引下标获取元素。一个集合最多可以存储 2^32-1 个元素。

| 命令 | 时间复杂度 | 说明 |
| ---- | ---- | ---- |
| SADD key member [member ...] | O(1) | 添加元素 |
| SREM key member [member ...] | O(N), N 为被移除的数量 | 删除元素 |
| SCARD key | O(1) | 计算元素个数 |
| SISMEMBER key member | O(1) | 判断元素是否在集合中 |
| SRANDMEMBER key [count] | 当没有count参数时算法复杂度 O(1), 当有count参数时算法复杂度为 O(N), N为count数量 | 随机从集合返回指定个数元素 |
| SPOP key [count] | O(1) | 从集合随机弹出元素 |
| SMEMBERS key | O(N), N为集合容量 | 获取集合中所有元素 |
| SINTER key [key ...] | O(N*M), N为最小集合基数，M为集合中元素数量 | 求多个集合的交集 |
| SUNION key [key ...] | O(N), N为集合的总元素数量 | 求多个集合的交集 |
| SDIFF key [key ...] | O(N), N为集合的总元素数量 | 求多个集合的差集 |
| SINTERSTORE destination key [key ...] | O(N*M), N为最小集合个数，M为集合中元素数量 | 求多个集合的交集并将结果保存 |
| SUNIONSTORE destination key [key ...] | O(N), N为给定集合的总元素数量 | 求多个集合的并集并将结果保存 |
| SDIFFSTORE destination key [key ...] | O(N), N为给定集合的总元素数量 | 求多个集合的差集并将结果保存 |

## 有序集合
有序集合保留了集合不能有重复成员的特性，但不同的是，有序集合中的元素可以排序。和列表使用索引下标作为排序依据不同，它给每个元素设置一个分数 (score) 作为排序的依据。有序集合中的元素不能重复，但是 score 可以重复。

| 命令 | 时间复杂度 | 说明 |
| ---- | ---- | ---- |
| ZADD key [NX\|XX] [CH] [INCR] <br> score member [score member ...] | O(log(N)), N为有序集合成员个数 | 添加成员 <br> NX：member必须不存在，才可以设置成功，用于添加 <br> xx：member必须存在，才可以设置成功，用于更新 <br> ch：返回此次操作后，有序集合元素和分数发生变化的个数  <br> incr：对score做增加 |
| ZCARD key | O(1)| 计算成员个数 |
| ZSCORE key member | O(1)| 计算某个成员的分数 |
| ZRANK key member | O(log(N)), N为有序集合成员个数 | 计算成员的排名, 从低到高排序 |
| ZREVRANK key member | O(log(N)), N为有序集合成员个数 | 计算成员的排名, 从高到低排序 |
| ZREM key member [member ...] | O(M*log(N)), M 为被删除的元素数量，N为有序集合成员个数 | 删除成员 |
| ZINCRBY key increment member | O(log(N)), N为有序集合成员个数 | 增加成员的评分 |
| ZRANGE key start stop [WITHSCORES] | O(log(N)+M)，N为有序集合大小，M为返回的元素数量 | 返回指定排名范围的成员, 从低到高排序 |
| ZREVRANGE key start stop [WITHSCORES] | O(log(N)+M)，N为有序集合大小，M为返回的元素数量 | 返回指定排名范围的成员, 从高到低排序 |
| ZRANGEBYSCORE key min max <br> [WITHSCORES] [LIMIT offset count] | O(log(N)+M)，N为有序集合大小，M为返回的元素数量 | 返回指定分数范围的成员, 从低到高排序 |
| ZREVRANGEBYSCORE key min max <br> [WITHSCORES] [LIMIT offset count] | O(log(N)+M)，N为有序集合大小，M为返回的元素数量 | 返回指定分数范围的成员, 从高到低排序 |
| ZCOUNT key min max | O(log(N))，N为有序集合成员个数 | 返回指定分数范围成员个数 |
| ZREMRANGEBYRANK key start stop | O(log(N)+M)，M 为被删除的元素数量，N为有序集合成员个数 | 删除指定排名内的升序元素 |
| ZREMRANGEBYSCORE key min max | O(log(N)+M)，M 为被删除的元素数量，N为有序集合成员个数 | 删除指定分数范围的成员 |

## 慢查分析
最后一个命令关于慢查分析，其实不属于几个主要数据类型。不过对于我们查找性能问题非常有帮助，特别列出。

Redis 使用了一个列表来存储慢查询日志，一个新的命令满足慢查询条件时被插入到这个列表中，当慢查询日志列表已处于其最大长度时，最早插入的一个命令将从列表中移出。Redis 提供了 <code>slowlog-log-slower-than</code> 和 <code>slowlog-max-len</code> 配置，<code>slowlog-log-slower-than</code> 为慢查询日志的预设阈值，<code>slowlog-max-len</code> 指定了慢查询日志最多存储多少条。

可以通过 <code>slowlog get [n]</code> 命令获取最近的 n 条慢查日志，通过 <code>slowlog len</code> 命令获取慢查询日志列表当前的长度，通过 <code> slowlog reset</code> 命令重置慢查询日志。线上建议调大慢查询列表，对于高 OPS 场景 <code>slowlog-log-slower-than</code> 建议配置为 1ms。

Redis 客户端执行一条命令分为如下4个部分：(1) 发送命令；(2) 命令排队；(3) 命令执行；(4) 返回结果。慢查询只统计第三步命令执行的时间，所以没有慢查询并不代表客户端没有超时问题。

# 数据结构和内部编码

Redis 中包含 string、hash、list、set、zset 等基本数据结构，可以通过 type 命令返回当前键的数据结构类型；但这些只是 Redis 对外的数据结构。每种数据结构实际上都有两种或两种以上的内部编码实现，可以通过 <code>object encoding</code> 命令查询内部编码。

## 字符串
字符串类型的内部编码有 3 种：
1. int: 8 个字节的长整型。
2. embstr: 小于等于 39 个字节的字符串。
3. raw: 大于 39 个字节的字符串。
Redis 会根据当前值的类型和长度决定使用哪种内部编码实现。

## 哈希
哈希类型的内部编码有两种：
1. ziplist: 当哈希类型元素个数小于 <code>hash-max-ziplist-entries</code> 配置 (默认 512 个)、同时所有值都小于 <code>hash-max-ziplist-value</code> 配置 (默认 64 字节) 时，Redis 会使用 ziplist 作为哈希的内部实现。ziplist 使用更加紧凑的结构实现多个元素的连续存储，所以在节省内存方面比 hashtable 更加优秀。
2. hashtable: 当哈希类型无法满足 ziplist 的条件时，Redis 会使用 hashtable 作为哈希的内部实现，因为此时 ziplist 的读写效率会下降，而 hashtable 的读写时间复杂度为 O(1);

## 列表
列表类型的内部编码有两种：
1. ziplist: 当列表的元素个数小于 <code>list-max-ziplist-entries</code> 配置 (默认 512 个)，同时列表中每个元素的值都小于 <code>list-max-ziplist-value</code> 配置时 (默认 64 字节) ，Redis 会选用 ziplist 来作为列表的内部实现来减少内存的使用；
2. linkedlist: 当列表类型无法满足 ziplist 的条件时，Redis 会使用 linkedlist 作为列表的内部实现。

## 集合
集合类型的内部编码有两种：
1. intset: 当集合中的元素都是整数且元素个数小于 <code>set-max-intset-entries</code> 配置（默认512个）时，Redis 会选用 intset 来作为集合的内部实现，从而减少内存的使用。
2. hashtable: 当集合类型无法满足 intset 的条件时，Redis 会使用 hashtable 作为集合的内部实现。

## 有序集合
有序集合类型的内部编码有两种：
1. ziplist: 当有序集合的元素个数小于 <code>zset-max-ziplist-entries</code> 配置（默认 128 个），同时每个元素的值都小于 <code>zset-max-ziplist-value</code> 配置（默认 64 字节）时，Redis 会用 ziplist 来作为有序集合的内部实现，ziplist 可以有效减少内存的使用。
3. skiplist: 当 ziplist 条件不满足时，有序集合会使用 skiplist 作为内部实现，因为此时 ziplist 的读写效率会下降。

# 单线程架构

Redis 使用了单线程架构和 I/O 多路复用模型来实现高性能的内存数据库服务。

单线程能带来的好处主要包括：
1. 可以简化数据结构和算法的实现。
2. 避免了线程切换和竞态产生的消耗，对于服务端开发来说，锁和线程切换通常是性能杀手。

Redis 使用单线程模型能够保持良好性能的原因主要有：
1. 纯内存访问
2. 非阻塞 I/O，Redis 使用 epoll 作为 I/O 多路复用技术的实现，再加上 Redis 自身的事件处理模型将 epoll 中的连接、读写、关闭都转换为事件，不在网络 I/O 上浪费过多的时间；
3. 单线程避免了线程切换和竞态产生的消耗；

**不过，在单线程架构下，对于每个命令的执行时间是有要求的。如果某个命令执行过长，会造成其他命令的阻塞，这点尤其需要引起注意。**
