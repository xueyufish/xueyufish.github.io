---
layout:     post
title:      "设计模式 - 桥接模式(Bridge)"
date:       2012-06-04
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 桥接模式, Bridge Pattern, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 结构型模式
    - 桥接模式
---

# 定义
将抽象部分与实现部分分离，使它们都可以独立的变化。

# 类型
结构型模式

# 结构
![桥接模式结构](/assets/attachment/design-pattern/1ead1bb0503306630998bba3095d6487.jpg)

桥接模式由以下部分组成：

**抽象类（Abstraction）**: 定义抽象类的接口，维护一个指向实现类接口的指针。
**扩展抽象类（RefinedAbstraction）**: 扩充由 Abstraction 定义的接口
**实现类接口（Implementor）**: 定义实现类接口，该接口不一定要与 Abstraction 接口完全一致；事实上可以完全不同。通常来说，Implementor 接口仅提供基本操作，而 Abstraction 接口则定义了基于这些基本操作的较高层次的操作。
**具体实现类（ConcreteImplementor）**: 实现 Implementor 接口并定义它的具体实现。

# 优点
1. 分离接口及其实现部分。一个实现不一定不变的绑定在一个接口上，抽象类的实现可以在运行时刻进行配置，一个对象甚至可以在运行时刻改变它的实现。将 Abstraction 和 Implementor 分离有助于降低对实现部分编译时刻的依赖性，当改变一个实现类时，不需要重新编译 Abstraction 和他的客户程序。
2. 提高扩展性。桥接模式分离了抽象部分和实现部分，可以独立的对 Abstraction 和 Implementor 层次结构进行扩充。
3. 实现细节对客户端透明，可以对用户隐藏实现细节。

# 缺点
1. 增加了系统的理解和设计难度，由于聚合关联关系建立在抽象层，要求开发者针对抽象进行设计和编程。
2. 要求正确识别出系统中两个独立变化的维度，因此使用范围有一定的局限性。

# 适用性

以下情况适用桥接模式：

1. 如果一个系统需要在构件的抽象化角色和具体化角色之间增加更多的灵活性，避免在两个层次之间建立静态的继承联系，通过桥接模式可以使它们在抽象层建立一个关联关系;
2. 抽象化角色和实现化角色可以以继承的方式独立扩展而互不影响，在程序运行时可以动态将一个抽象化子类的对象和一个实现化子类的对象进行组合，即系统需要对抽象化角色和实现化角色进行动态耦合;
3. 一个类存在两个独立变化的维度，且这两个维度都需要进行扩展;
4. 虽然在系统中使用继承是没有问题的，但是由于抽象化角色和具体化角色需要独立变化，设计要求需要独立管理这两者;
5. 对于那些不希望使用继承或因为多层次继承导致系统类的个数急剧增加的系统，桥接模式尤为适用。

# 桥接模式实现

**实现类接口(Implementor)**
```java
public interface Implementor {
    void operation();
}
```

**具体实现类(ConcreteImplementor)**
```java
public class ConcreateImplementorA implements Implementor {
    @Override
    public void operation() {
        System.out.println("ConcreateImplementorA.operation...");
    }
}

public class ConcreateImplementorB implements Implementor {
    @Override
    public void operation() {
        System.out.println("ConcreateImplementorB.operation...");
    }
}
```

**抽象类(Abstraction)**
```java
@Getter
@Setter
public abstract class Abstraction {
    private Implementor implementor;

    protected void operation() {
        implementor.operation();
    }
}
```

**扩展抽象类(RefinedAbstraction)**
```java
public class RefinedAbstraction extends Abstraction {
    @Override
    protected void operation() {
        super.getImplementor().operation();
    }
}
```

**客户端(Client)**
```java
public class Client {
    public static void main(String... args) {
        new Client().test();
    }

    private void test() {
        Abstraction abstraction = new RefinedAbstraction();

        abstraction.setImplementor(new ConcreateImplementorA());
        abstraction.operation();

        abstraction.setImplementor(new ConcreateImplementorB());
        abstraction.operation();
    }
}
```

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/bridge](https://github.com/xueyufish/design-pattern/tree/master/bridge)