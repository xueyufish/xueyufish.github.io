---
layout:     post
title:      "设计模式 - 策略模式(Strategy)"
date:       2012-06-29
author:     "xueyufish"
keyword:    "设计模式, 策略模式, Strategy Pattern, xueyufish"
tags:
    - 设计模式
    - 对象行为模式
---

# 定义
定义一系列算法，把它们一个个封装起来，并且使它们可以相互替换。策略模式使得算法可以独立于使用它的客户而变化。

# 类型
对象行为模式

# 结构
![策略模式结构](/assets/attachment/design-pattern/a377258801ec102e4ccf0d07af0e4f37.png)

策略模式由以下部分组成:

1. **抽象策略（Strategy）**: 定义每个策略或算法所必须具备的公共属性的接口，Context 使用此接口来调用 ConcreteStrategy 定义的算法;

2. **具体策略（ConcreteStrategy）**: 实现 Strategy 接口中定义的操作，含有具体算法；

3. **上下文（Context）**: 起承上启下的封装作用，屏蔽高层模块对策略的直接访问，封装可能存在的变化。

# 优点

1. 由于具体策略实现同一个策略接口，不同策略可以自由的切换;
2. 避免使用多重条件判断，如果有多重策略，那么每个策略只需实现自己的方法，至于采用何种策略，可以由调用者决定；
3. 扩展性良好，在现有的系统中加入新的策略，只需实现策略接口。

# 缺点

1. 策略类数量增多，每个策略都是一个类，复用的可能性很小；
2. 所有的策略都需要对外暴露，客户端必须知道有哪些策略，然后才能知道采用哪种策略。

# 适用性

以下情况适用策略模式：

1. 许多相关的类仅仅是行为有异，策略模式提供了一种用多个行为中的一个行为来配置一个类的方法；
2. 需要使用一个算法的不同变体。例如，你可能会定义一些反映不同的空间 / 时间权衡的算法。当这些变体实现为一个算法的类层次时 ,可以使用策略模式；
3. 算法使用客户不应该知道的数据。可使用策略模式以避免暴露复杂的、与算法相关的数据结构；
4. 一个类定义了多种行为, 并且这些行为在这个类的操作中以多个条件语句的形式出现。将相关的条件分支移入它们各自的 Strategy 类中以代替这些条件语句。

# 代码实现

**抽象策略（Strategy）**
```java
public interface Strategy {
    void opetate();
}
```

**具体策略（ConcreteStrategy）**
```java
public class ConcreteStrategyA implements Strategy {
    @Override
    public void opetate() {
        System.out.println("ConcreteStrategyA.opetate...");
    }
}

public class ConcreteStrategyB implements Strategy {
    @Override
    public void opetate() {
        System.out.println("ConcreteStrategyB.opetate...");
    }
}

public class ConcreteStrategyC implements Strategy {
    @Override
    public void opetate() {
        System.out.println("ConcreteStrategyB.opetate...");
    }
}
```

**上下文（Context）**
```java
public class Context {
    private Strategy strategy;

    public Context(Strategy strategy) {
        this.strategy = strategy;
    }

    public void someOperate() {
        strategy.opetate();
    }

    public void setStrategy(Strategy strategy) {
        this.strategy = strategy;
    }
}
```

**客户端（Client）**
```java
public class Client {
    public static void main(String[] args) {
        new Client().test();
    }

    private void test() {
        Context context = new Context(new ConcreteStrategyA());
        context.someOperate();

        context.setStrategy(new ConcreteStrategyB());
        context.someOperate();

        context.setStrategy(new ConcreteStrategyC());
        context.someOperate();

    }
}
```

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/strategy](https://github.com/xueyufish/design-pattern/tree/master/strategy)