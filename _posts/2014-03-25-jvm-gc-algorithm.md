---
layout:     post
title:      "JVM 垃圾收集 - 垃圾收集算法"
keyword:    "Java, JVM, GC"
date:       2014-03-25
author:     "xueyufish"
tags:
    - Java
---

JVM中，垃圾收集算法主要分为复制、标记清除、标记整理、分代收集几种：

### 标记-清除算法

将需要回收的对象进行标记，然后清除
![标记清除法.jpg](/assets/attachment/jvm-gc-algorithm/a4248c4b-6c1d-4fb8-a557-86da92d3a294.jpg)

**不足:**

1. 标记和清除过程效率都不高
2. 会产生大量碎片

之后的算法都是基于该算法进行改进。

### 复制算法

将内存划分为大小相等的两块，每次只使用其中一块，当这一块内存用完了就将还存活的对象复制到另一块上面，然后再把使用过的内存空间进行一次清理。
![复制算法.jpg](/assets/attachment/jvm-gc-algorithm/e6b733ad-606d-4028-b3e8-83c3a73a3797.jpg)

**优点:**
* 由于是每次都对整个半区进行内存回收，内存分配时不必考虑内存碎片问题。
* 只要移动堆顶指针，按顺序分配内存即可，实现简单，运行高效。

**缺点：**
* 内存减少为原来的一半，非常浪费。
* 对象存活率较高的时候就要执行较多的复制操作，效率变低。
* 如果不使用 50% 的对分策略，老年代需要考虑的空间担保策略。

现在的商业虚拟机都采用这种收集算法来回收新生代，但是并不是将内存划分为大小相等的两块，而是分为一块较大的 Eden 空间和两块较小的 Survior 空间，每次使用 Eden 空间和其中一块 Survivor。在回收时，将 Eden 和 Survivor 中还存活着的对象一次性复制到另一块 Survivor 空间上，最后清理 Eden 和 使用过的那一块 Survivor。HotSpot 虚拟机的 Eden 和 Survivor 的大小比例默认为 8:1，保证了内存的利用率达到 90 %。如果每次回收有多于 10% 的对象存活，那么一块 Survivor 空间就不够用了，此时需要依赖于老年代进行分配担保，也就是借用老年代的空间。

### 标记-整理算法

让所有存活的对象都向一端移动，然后直接清理掉端边界以外的内存。

![标记-整理算法.jpg](/assets/attachment/jvm-gc-algorithm/902b83ab-8054-4bd2-898f-9a4a0fe52830.jpg)

这种方法可以解决内存碎片问题，但是会增加停顿时间。

### 分代收集算法

现在的商业虚拟机采用分代收集算法，它根据对象存活周期将内存划分为几块，不同块采用适当的收集算法。

![分代收集算法.jpg](/assets/attachment/jvm-gc-algorithm/341412-20170310111906594-1376910719.png)

上面可以看到堆分成三个区域：

* 新生代(Young Generation)：用于存放新创建的对象，采用复制回收方法，如果在 S0 和 S1 之间复制一定次数后，转移到年老代中。这里的垃圾回收叫做 minor GC;
* 年老代(Old Generation)：这些对象垃圾回收的频率较低，采用的标记整理方法，这里的垃圾回收叫做 major GC。
* 永久代(Permanent Generation)：存放 Java 本身的一些数据，当类不再使用时，也会被回收。

在新生代中，分为三个区：Eden, from survivor, to survior。

* 当触发 minor GC 时，会先把 Eden 中存活的对象复制到 to Survivor 中；
* 然后再看 from survivor，如果次数达到年老代的标准，就复制到年老代中；如果没有达到则复制到 to survivor中；如果 to survivor 满了，则复制到年老代中。
* 然后调换 from survivor 和 to survivor 的名字，保证每次 to survivor 都是空的等待对象复制到那里的。
