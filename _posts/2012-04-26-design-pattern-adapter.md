---
layout:     post
title:      "设计模式 - 适配器模式(Adapter)"
date:       2012-04-26
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 适配器模式, Adapter Pattern, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 结构性模式
---

# 定义
将某个类的接口转换成客户端期望的另一个接口表示。适配器模式让原本因接口不匹配不能一起工作的两个类可以协同工作。

# 类型
结构性模式

# 结构

适配器模式可分为两种结构，分别为类适配器结构和对象适配器结构。对象适配器依赖多重继承实现，对象适配器通过对象间组合实现。相比较而言，对象适配器更被广泛使用。具体实现结构图下：

类适配器使用多重继承对一个接口和另一个接口进行匹配：
![类适配器结构](http://img.yuxiumin.com/screenshots/design-patterns/c5e8c04358811533c7b401e6aebbc807.jpg)

对象适配器依赖于对象组合：
![对象适配器结构](http://img.yuxiumin.com/screenshots/design-patterns/0a2674c1ed96e10fc538b15084f75174.jpg)

适配器模式主要由以下部分组成:
1. **目标角色(Target)**: 定义 Client 使用的与特定领域相关的接口；
2. **源角色(Adaptee)**: 定义一个已经存在的接口，这个接口需要适配；
3. **适配器角色(Adapter)**: 对 Adaptee 接口与 Target 接口进行适配.
4. **客户端(Client)**: 与符合 Target 的对象协同;

# 使用场景

以下情况适用适配器模式：

1. 希望使用一个已经存在的类，而它的接口不符合需求；
2. 希望创建一个可以复用的类，该类可以与其他不相关的类或不可预见的类（即那些接口可能不一定兼容的类）协同工作； 
3. 希望使用一些已经存在的子类，但是不可能对每一个子类都进行子类化以匹配他们的接口。（仅适用于对象 Adapter, 对象 Adapter 可以适配它的父类接口）

# 代码样例

以下为对象适配器模式的代码样例：

**源角色(Adaptee)**
```java
public class Adaptee {
    public void specificRequest() {
        System.out.println("specificRequest");
    }
}
```

**目标角色(Target)**
```java
public interface Target {
    void requesst();
}
```

**适配器角色(Adapter)**
Adapter 扩展源角色，实现目标角色，从而使得目标角色改动时候，不用改动源角色，只要改动适配器
```java
public class Adapter implements Target {
    private Adaptee adaptee;

    public Adapter(Adaptee adaptee) {
        this.adaptee = adaptee;
    }

    @Override
    public void requesst() {
        adaptee.specificRequest();
    }
}
```

**客户端**
```java
public class Client {
    public static void main(String[] args) {
        new Client().test();
    }

    private void test() {
        Target adapter = new Adapter(new Adaptee());
        adapter.requesst();
    }
}
```

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/adapter](https://github.com/xueyufish/design-pattern/tree/master/adapter)