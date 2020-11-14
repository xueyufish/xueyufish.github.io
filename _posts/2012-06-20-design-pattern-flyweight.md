---
layout:     post
title:      "设计模式 - 享元模式(Flyweight)"
date:       2012-06-20
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 享元模式, Flyweight Pattern, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 结构型模式
---

# 定义
运用共享技术有效的支持大量细粒度对象。

# 类型
结构型模式

# 结构
![享元模式结构](http://img.yuxiumin.com/screenshots/design-patterns/8352b0abbac97a61f526ffac5318b091.jpeg)

## 内部状态与外部状态

享元模式为了解决对象数量多且性质相近的问题，将对象信息分为内部对象和外部对象两个部分：
1. **内部状态（intrinsic）**: 指对象可共享出来的信息，存储在享元对象内部并且不会随环境改变而改变。
2. **外部状态（extrinsic）**: 指对象得以依赖的一个标记，是随环境的改变而改变、不可共享的状态。

## 组成：

1. **抽象享元角色（Flyweight）**: 享元接口，通过这个接口 Flyweight 可以接受并作用于外部状态；
2. **具体享元角色（ConcreteFlyweight）**: 实现 Flyweight 接口，并为内部状态（如果有的话）增加存储空间。 ConcreteFlyweight 必须是可共享的，它所存储的是与环境无关的内部状态。
3. **复合享元角色（UnsharableFlyweight）**: 非共享的享元实现对象，非共享的享元对象通常是享元对象的组合对象； 
4. **享元工厂角色（FlyweightFactoiy）**: 主要用来创建并管理共享的享元对象。通常构造一个池容器，同时提供从池中获得对象的方法。
5. **客户端（Client）**: 维持一个对 Flyweight 的引用，计算或存储一个（或多个） Flyweight 的外部状态。

# 优点
1. 可以极大减少内存中对象的数量，使得相同对象或相似对象在内存中只保存一份。
2. 外部状态相对独立，而且不会影响其内部状态，从而使得享元对象可以在不同的环境中被共享。

# 缺点
1. 使得系统更加复杂，需要分离出内部状态和外部状态，这使得程序的逻辑复杂化。
2. 为了使对象可以共享，享元模式需要将享元对象的状态外部化，而读取外部状态使得运行时间变长。

# 适用性
以下情况适用享元模式：

1. 一个应用程序使用了大量对象，并且由于使用了大量的对象，造成很大的存储开销；
2. 对象的大多数状态都可变为外部状态，并且如果删除对象的外部状态可以用相对较少的共享对象取代很多组对象；
3. 应用程序不依赖于对象标识。由于 Flyweight 对象可以被共享，对于概念上明显有别的对象，标识测试将返回真值。

# 代码实现

**抽象享元（Flyweight）**
```java
public interface Flyweight {
    void operation(String extrinsicState);
}
```

**具体享元（ConcreteFlyweight）**
```java
public class ConcreteFlyweight implements Flyweight {
    private String intrinsicState;

    public ConcreteFlyweight(String intrinsicState) {
        this.intrinsicState = intrinsicState;
    }

    @Override
    public void operation(String extrinsicState) {
        System.out.println("ConcreteFlyweight.intrinsicState: " + intrinsicState);
        System.out.println("ConcreteFlyweight.extrinsicState: " + extrinsicState);
    }
}
```

**复合享元（UnsharableFlyweight）**
```java
public class UnsharedConcreteFlyweight implements Flyweight {
    private String allState;

    public UnsharedConcreteFlyweight(String allState) {
        this.allState = allState;
    }

    @Override
    public void operation(String extrinsicState) {
        System.out.println("UnsharedConcreteFlyweight.allState" + allState);
        System.out.println("UnsharedConcreteFlyweight.extrinsicState" + extrinsicState);
    }
}
```

**享元工厂（FlyweightFactoiy）**
```java
public class FlyweightFactory {
    private static Map<String, Flyweight> flyweights = new HashMap<>();

    public static Flyweight getFlyweight(String key) {
        if (flyweights.containsKey(key)) {
            return flyweights.get(key);
        } else {
            Flyweight flyweight = new ConcreteFlyweight(key);
            flyweights.put(key, flyweight);
            return flyweight;
        }
    }

    public static int size() {
        return flyweights.size();
    }

}
```

**客户端（Client）**
```java
public class Client {

    public static void main(String[] args) {
        new Client().test();
    }

    void test() {
        Stream.of("1", "1", "2", "2", "3").forEach(key -> {
            Flyweight flyweight = FlyweightFactory.getFlyweight(key);
            flyweight.operation("test: " + key);
        });

        System.out.println("size: " + FlyweightFactory.size());
    }

}
```

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/flyweight](https://github.com/xueyufish/design-pattern/tree/master/flyweight)