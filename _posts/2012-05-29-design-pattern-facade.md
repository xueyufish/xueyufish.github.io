---
layout:     post
title:      "设计模式 - 外观模式(Facade)"
date:       2012-05-29
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 外观模式, Facade Pattern, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 结构型模式
---

# 定义
为子系统中的一组接口提供一个一致的界面，Facade 模式定义了一个高层接口，这个接口使得子系统更加容易使用。

# 类型
结构型模式

# 结构
![外观模式结构](http://img.yuxiumin.com/screenshots/design-patterns/b6ba224734afb621a00e84dcf3572a16.png)

外观模式结构比较简单，由以下两部分组成：

**外观（Facade）**: 理解哪些子系统负责处理请求，并将客户的请求代理给适当的子系统对象。

**子系统（Subsystem）**: 实现子系统功能，并且处理由 Facade 对象指派的任务。此处子系统可以是一个或多个子系统，每个子系统可以是一个或多个类或者一个类型的集合。

# 优点

1. 对客户端屏蔽子系统组件，因而减少了客户处理的对象数目，使得子系统使用更加方便；
2. 实现了子系统与客户之间的松耦合关系，使子系统的组件变化不会影响客户端。

# 缺点

增加新的子系统可能需要修改外观类或客户端的源代码，违背了 “开—闭原则”。

# 适用性

以下情况适用外观模式：

1. 当需要为一个复杂的子系统提供一个简单的接口时；
2. 客户端与抽象类的实现部分存在很大依赖性时，引入外观模式将子系统与客户及其他子系统进行分离，可以提高子系统的独立性和可移植性；
3. 当需要构建一个层次结构的子系统时，可以使用 Facade 定义子系统中每层的入口点。如果子系统间是相互依赖的，可以让他们仅通过 Facade 进行通讯，从而简化他们的依赖关系。

# 外观模式实现

**子系统(Subsystem)**
```java
public class SubsystemA {
    public void execute() {
        System.out.println("Execute SubsystemA");
    }
}

public class SubsystemB {
    public void execute() {
        System.out.println("Execute SubsystemB");
    }
}

public class SubsystemC {
    public void execute() {
        System.out.println("Execute SubsystemC");
    }
}
```

**外观(Facade)**
```java
public class Facade {
    private SubsystemA systemA;
    private SubsystemB systemB;
    private SubsystemC systemC;

    public Facade() {
        systemA = new SubsystemA();
        systemB = new SubsystemB();
        systemC = new SubsystemC();
    }

    public void execute() {
        systemA.execute();
        systemB.execute();
        systemC.execute();
    }
}
```

**客户端(Client)**
public class Client {

    public static void main(String... args) {
        new Client().test();
    }

    void test() {
        Facade facade = new Facade();
        facade.execute();
    }
}

#### 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/facade](https://github.com/xueyufish/design-pattern/tree/master/facade)