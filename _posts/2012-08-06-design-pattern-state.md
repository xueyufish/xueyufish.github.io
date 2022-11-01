---
layout:     post
title:      "设计模式 - 状态模式(State pattern)"
date:       2012-08-06
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 状态模式, State pattern, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 对象行为模式
---

# 定义
允许一个对象在其内部状态改变时改变它的行为，对象看起来似乎修改了它的类。

# 类型
对象行为模式

# 结构
![命令模式结构](/assets/attachment/design-pattern/088a4e330cd72f998b9174caa9006fbd.png)

命令模式由记下几部分组成：

1. **上下文（Context）**: 定义客户感兴趣的接口，维护一个 ConcreteState 子类的实例，这个实例定义当前状态;
2. **抽象状态（State）**: 定义一个接口以封装与 Context 的一个特定状态相关的行为；
3. **具体状态（ConcreteState）**: 每一个子类实现一个与 Context 的一个状态相关的行为。

# 优点

1. 封装了转换规则；
2. 枚举可能的状态，在枚举状态之前需要确定状态种类；
3. 将所有与某个状态有关的行为放到一个类中，并且可以方便地增加新的状态，只需要改变对象状态即可改变对象的行为；
4. 允许状态转换逻辑与状态对象合成一体，而不是某一个巨大的条件语句块；
5. 可以让多个环境对象共享一个状态对象，从而减少系统中对象的个数；

# 缺点

1. 会增加系统类和对象的个数；
2. 结构与实现都较为复杂，如果使用不当将导致程序结构和代码的混乱；
3. 对“开闭原则”的支持并不太好，对于可以切换状态的状态模式，增加新的状态类需要修改那些负责状态转换的源代码，否则无法切换到新增状态；而且修改某个状态类的行为也需修改对应类的源代码；

# 适用性

以下情况适用状态模式：

1. 一个对象的状态取决于它的行为，并且它必须在运行时刻根据状态改变它的行为；
2. 一个操作中含有庞大的多分支的条件语句，且这些分支依赖于该对象的状态，这些状态通常由一个或多个枚举常量表示。通常，有多个操作包含这一相同的条件结构。<code>State</code>模式将每一个条件分支放入一个独立的类中，这使得可以根据对象自身的情况将对象的状态作为一个对象，这一对象可以不依赖于其他对象而独立变化。

# 命令模式实现

**抽象状态（State）**
```java
public interface State {
    void handle(String param);
}
```

**具体状态（ConcreteState）**
```java
public class ConcreteStateA implements State {
    @Override
    public void handle(String param) {
        System.out.println("ConcreteStateA handle ：" + param);
    }
}

public class ConcreteStateB implements State {
    @Override
    public void handle(String param) {
        System.out.println("ConcreteStateB handle ：" + param);
    }
}
```

**上下文（Context）**
```java
public class Context {
    private State state;

    public Context(State state) {
        this.state = state;
    }

    public void request(String param) {
        state.handle(param);
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
        Context context;

        State stateA = new ConcreteStateA();
        context = new Context(stateA);
        context.request("testA");

        State stateB = new ConcreteStateA();
        context = new Context(stateB);
        context.request("testB");
    }
}
```

**输出**
```
ConcreteStateA handle ：testA
ConcreteStateA handle ：testB
```

#### 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/state](https://github.com/xueyufish/design-pattern/tree/master/state)