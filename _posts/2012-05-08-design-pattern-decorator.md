---
layout:     post
title:      "设计模式 - 装饰器模式(Decorator)"
date:       2012-05-08
author:     "xueyufish"
keyword:    "设计模式, 装饰器模式, Decorator Pattern, xueyufish"
tags:
    - 设计模式
    - 结构型模式
---

# 定义
动态给一个对象添加一些额外的职责。就增加功能来说，装饰模式比生成子类更为灵活。

# 类型
结构型模式

# 结构

![装饰器结构](/assets/attachment/design-pattern/68af332773f45dc1447601343535f646.png)

装饰器模式由以下几部分组成：

1. **抽象组件(Component)**: 一个接口或抽象类，定义最原始、最核心的对象；
2. **具体组件(ConcreteComponent)**: 最原始、最核心的接口或抽象类的实现，通常被视为装饰器模式装饰的对象；
3. **抽象装饰器(Decorator)**: 维持一个指向 Component 对象的指针，并定义一个与< Component 接口一致的接口。Java 中通常为抽象类。
4. **具体装饰器(ConcreteDecorator)**: 用于向组件添加职责；

# 优点
1. 装饰类和被装饰类可以独立发展，不会相互耦合。Component 类无须知道 Decorator 类，Decorator 类从外部来扩展 Component 类的功能，而 Decorator 类也不用知道具体的构件。
2. 装饰模式是继承关系的一种替代方。Decorator 类无论有多少层，返回的对象都是 Component，实现的都是 is-a 关系。
3. 装饰模式可以动态扩展一个实现类的功能。

# 缺点
多层装饰比较复杂。

# 适用性

以下情况适用装饰器模式：

1. 需要扩展一个类型的功能，或给一个类增加附加功能；
2. 需要动态的给一个对象增加功能，这些功能可以动态撤销；
3. 需要为一批兄弟类进行改装或加装功能；

# 代码样例
**1. 组件对象接口(Component)**
```java
public abstract class Component {
    public abstract void operate();
}
```

**2.具体组件(ConcreteComponent)**
```java
public class ConcreteComponent extends Component {
    @Override
    public void operate() {
        System.out.println("ConcreteComponent.operate!");
    }
}
```

**3.抽象装饰器(Decorator)**
```java
public abstract class Decorator extends Component {
    private Component component = null;

    public Decorator(Component component) {
        this.component = component;
    }

    @Override
    public void operate() {
        System.out.println("Decorator.operate!");
    }
}
```

**4.具体装饰器(ConcreteDecorator)**
```java
public class ConcreteDecorator1 extends Decorator {
    public ConcreteDecorator1(Component component) {
        super(component);
    }

    @Override
    public void operate() {
        decoratorMethod1();
        super.operate();
    }

    private void decoratorMethod1() {
        System.out.println("decoratorMethod1.");
    }
}

public class ConcreteDecorator2 extends Decorator {
    public ConcreteDecorator2(Component component) {
        super(component);
    }

    @Override
    public void operate() {
        decoratorMethod2();
        super.operate();
    }

    private void decoratorMethod2() {
        System.out.println("decoratorMethod2.");
    }
}
```

**4.客户端(Client)**
```java
public class Client {
    public static void main(String... args) {
        Component component = new ConcreteComponent();
        // 第一次修饰
        component = new ConcreteDecorator1(component);
        component.operate();
        // 第二次修饰
        component = new ConcreteDecorator2(component);
        component.operate();
    }
}
```

#### 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/decorator](https://github.com/xueyufish/design-pattern/tree/master/decorator)