---
layout:     post
title:      "聊聊缓存更新策略"
date:       2018-07-20
author:     "余修忞(xueyufish)"
description: "关于分布式缓存更新策略探讨"
keyword:    "缓存, Cache, 分布式缓存, 分布式, 余修忞, yuxiumin, xueyufish"
tags:
    - 缓存
    - 分布式
---

在分布式场景下，数据库往往是对资源消耗最严重，也是最容易出问题的地方。由于绝大多数情况下的应用还是读远远大于写，对 select 操作执行的频率会非常高；另外，伴随着 select 查询往往会有其他复杂的 join、group、order、like 等语义，对数据库性能消耗会非常大。因此，在实时性要求不是非常高的情况下，我们往往需要缓存对数据库保护，也可以提升查询速度。

此外，在现在的互联网环境下，移动互联网前端应用对后端的访问频率非常高，各种 API 调用非常频繁，理论上 API 层面也需要缓存进行保护，在后端服务短时间因为网络抖动、数据提供不可达等情况发生时，可以呈现相应的结果页面给用户，不至于影响用户体验。从业务场景分析，大多数应用对实时性要求也并不是特别高，所以也可以应用缓存。

这里我们主要讨论缓存和后端数据之间的同步问题，对于缓存的雪崩、穿透等其他问题以及缓存的实现，后面再做分析。

目前业内主要流行的有以下三种模式：

# Cache-Aside 模式
Cache-Aside 是业内最为常用的模式，也就是在业务代码内管理和维护缓存。

在读场景下，先从缓存中获取数据，如果没有命中，则从数据库读取并将数据放入缓存以供下次使用；

在写场景下，先将数据写入到存储系统，写入成功后再将数据写入到缓存；或者写入成功后将缓存数据过期，下次读取时再加载缓存。

![](http://img.yuxiumin.com/screenshots/cache-update-strategy/cce983cbc455596091c6b802a9eb2bb4.png)

![](http://img.yuxiumin.com/screenshots/cache-update-strategy/212f12c3aac659f611fa5a79992d8c37.png)

执行 Cache-Aside 模式的伪码如下：
```java
public V read(K key) {
  V result = cache.getIfPresent(key);
  if (result == null) {
    result = readFromDatabase(key);
    cache.put(key, result);
  }
  return result;
}

public void write(K key, V value) {
  writeToDatabase(key, value);
  cache.invalidate(key);
}
```

使用 Cache-Aside 模式， 理论上会导致脏数据产生。原因是当一个客户端进行读操作，但是没有命中缓存，然后就到数据库中取数据；此时另一个客户端进行写操作，写完数据库后，让缓存失效，然后，之前的那个读操作再把老的数据放进去，所以，会造成脏数据。

在实际场景中，这个情况出现的概率可能非常低，因为这个条件需要发生在读缓存时缓存失效，而且并发着有一个写操作。而实际上数据库的写操作会比读操作慢得多，而且还要锁表，而读操作必需在写操作前进入数据库操作，而又要晚于写操作更新缓存，所有的这些条件都具备的概率基本并不大。

# Read Through 模式

Read Through 模式在查询操作中更新缓存。当缓存没有命中时，Cache Aside 由调用方负责把数据加载入缓存，而 Read Through 则用缓存服务自己来加载，从而对应用方是透明的。

![read-through](http://img.yuxiumin.com/screenshots/cache-update-strategy/read-through.png)

# Write Through 模式

Write Through 模式在更新数据时发生。当有数据更新的时候，如果没有命中缓存，直接更新数据库，然后返回。如果命中了缓存，则更新缓存，然后再由 Cache 自己更新数据库，其中更新缓存和更新数据库是一个同步操作。对应用方而言，操作也是是透明的。

![write-through](http://img.yuxiumin.com/screenshots/cache-update-strategy/write-through.png)

# Write Back 模式

Write back 模式其实就是 Linux 文件系统 Page Cache 的算法。在更新数据的时候，只更新缓存，不更新数据库，而缓存会异步地批量更新数据库。算法的优势在于因为直接操作内存，所以数据的I/O操作比较快；另外因为异步，write back 还可以合并对同一个数据的多次操作，所以性能会得到提升。

Write back 模式带来的问题是，数据不是强一致性的，甚至可能会丢失，并且实现逻辑比较复杂，因为需要对有哪些数据被更新做跟踪。

![write-back](http://img.yuxiumin.com/screenshots/cache-update-strategy/Write-back_with_write-allocation.png)

### 参考资料

* [缓存更新的套路](https://coolshell.cn/articles/17416.html)

* [Cache Usage Patterns](http://www.ehcache.org/documentation/3.5/caching-patterns.html)

* [Caching Strategies and How to Choose the Right One](https://codeahoy.com/2017/08/11/caching-strategies-and-how-to-choose-the-right-one/)
