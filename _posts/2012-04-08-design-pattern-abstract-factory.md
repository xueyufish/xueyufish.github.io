---
layout:     post
title:      "设计模式 - 抽象工厂(Abstract Factory)"
date:       2012-04-08
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 抽象工厂, Abstract Factory, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 创建型模式
---

# 定义
为创建一组相关或相互依赖的对象提供一个接口，而且无需指定他们的具体类

## 类型
创建型模式

# 结构

![抽象工厂结构](http://img.yuxiumin.com/screenshots/design-patterns/023e023818ddba953a3a055e3a7976dd.png)

抽象工厂主要由以下几部分组成：
1. 抽象工厂(AbstractFactory): 声明一个创建抽象产品对象的操作接口
2. 具体工厂(ConcreteFactory): 实现创建具体产品对象的操作
3. 抽象产品(AbstractProduct): 为一类产品对象声明一个接口
4. 具体产品(ConcreteProduct): 定义一个将被相应的具体工厂创建的产品对象，并且实现 `AbstractProduct` 接口
5. 客户端(Client): 使用由 `AbstractFactory` 和 `AbstractProduct` 声明的接口

# 和工厂方法的区别

工厂方法模式针对的是一个产品等级结构，而抽象工厂模式则是针对的多个产品等级结构。在编程中，通常一个产品结构，表现为一个接口或者抽象类，也就是说，工厂方法模式提供的所有产品都是衍生自同一个接口或抽象类，而抽象工厂模式所提供的产品则是衍生自不同的接口或抽象类。

在抽象工厂模式中，有一个产品族的概念：所谓的产品族，是指位于不同产品等级结构中功能相关联的产品组成的家族。抽象工厂模式所提供的一系列产品就组成一个产品族；而工厂方法提供的一系列产品称为一个等级结构。

# 优点

抽象工厂模式除了具有工厂方法模式的优点外，最主要的优点就是可以在类的内部对产品族进行约束，而不必专门引入一个新的类来进行管理。

# 缺点

抽象工厂模式的缺点在于产品族的管理比较困难，如果产品族中需要增加一个新的产品，则几乎所有的工厂类都需要进行修改。这严重违反了[开闭原则](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle)。

# 适用场景

当需要创建的对象是一系列相互关联或相互依赖的产品族时，便可以使用抽象工厂模式。即一个继承体系中，如果存在着多个等级结构（存在着多个抽象类），并且分属各个等级结构中的实现类之间存在着一定的关联或者约束，就可以使用抽象工厂模式。假如各个等级结构中的实现类之间不存在关联或约束，则使用多个独立的工厂来对产品进行创建更合适。

# 代码实现

**抽象工厂**
```java
public abstract class AbstractFactory {
    public abstract AbstractProductA createProductA();
    public abstract AbstractProductB createProductB();
}

```

**具体工厂**
```java
public class ConcreteFactory1 extends AbstractFactory {
    @Override
    public AbstractProductA createProductA() {
        return new ConcreteProductA();
    }

    @Override
    public AbstractProductB createProductB() {
        return new ConcreteProductB();
    }
}

public class ConcreteFactory2 extends AbstractFactory {
    @Override
    public AbstractProductA createProductA() {
        return new ConcreteProductA();
    }

    @Override
    public AbstractProductB createProductB() {
        return new ConcreteProductB();
    }
}

```

**抽象产品**
```java
abstract class AbstractProductA {
    abstract String productA1();

    abstract String productA2();
}

public abstract class AbstractProductB {
    public abstract String productB1();

    public abstract String productB2();
}
```

**具体产品**
```java
public class ConcreteProductA extends AbstractProductA {
    @Override
    public String productA1() {
        return "ConcreteProductA1";
    }

    @Override
    public String productA2() {
        return "ConcreteProductA2";
    }
}


public class ConcreteProductB extends AbstractProductB {
    @Override
    public String productB1() {
        return "ConcreteProductB1";
    }

    @Override
    public String productB2() {
        return "ConcreteProductB2";
    }
}

```

**客户端**
```java
public class Client {
    private Client() {
    }

    public static void main(String[] args) {
        AbstractFactory factory1 = new ConcreteFactory1();
        String productA1 = factory1.createProductA().productA1();
        String productA2 = factory1.createProductA().productA2();

        AbstractFactory factory2 = new ConcreteFactory2();
        String productB1 = factory2.createProductB().productB1();
        String productB2 = factory2.createProductB().productB2();

        System.out.printf("productA1: %s, productA2: %s" + System.lineSeparator(), productA1, productA2);
        System.out.printf("productB1: %s, productB2: %s" + System.lineSeparator(), productB1, productB2);
    }
}
```

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/abstract-factory](https://github.com/xueyufish/design-pattern/tree/master/abstract-factory)
