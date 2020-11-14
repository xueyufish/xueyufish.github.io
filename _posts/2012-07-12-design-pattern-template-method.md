---
layout:     post
title:      "设计模式 - 模板方法(Template Method)"
date:       2012-07-12
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 模板方法, Template Method, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 对象行为模式

---

# 定义
定义一些操作中的算法骨架，而将一些步骤延迟到子类中。模板方法使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。

# 类型
对象行为模式

# 结构
![模板方法结构](http://img.yuxiumin.com/screenshots/design-patterns/3416bcdb8fa046b6e804b4561d59c97d.png)

模板方法由以下两部分组成：
1. **抽象类（AbstractClass）**: 定义抽象的原语操作。它的方法包括两类：
* 基本方法：是由子类实现的方法，并且在模板方法被调用。
* 模板方法：可以有一个或几个，一般是一个具体方法，也就是一个框架，实现对基本方法的调度，完成固定的逻辑。

2. **具体子类（ConcreteClass）**: 实现原语操作以完成算法中与特定子类相关的步骤。

# 优点
1. 容易扩展。一般来说，抽象类中的模版方法是不易产生改变的部分，而抽象方法是容易发生变化的部分，因此通过增加实现类一般可以很容易实现功能的扩展，符合开闭原则。
2. 便于维护。对于模版方法模式来说，正是由于他们的主要逻辑相同，才使用了模版方法，假如不使用模版方法，任由这些相同的代码散乱的分布在不同的类中，维护起来是非常不方便的。
3. 比较灵活。因为有钩子方法，因此，子类的实现也可以影响父类中主逻辑的运行。但是，在灵活的同时，由于子类影响到了父类，违反了里氏替换原则，也会给程序带来风险。这就对抽象类的设计有了更高的要求。

# 缺点
每个不同的实现都需要定义一个子类，这会导致类的个数增加，系统更加庞大，设计也更加抽象，但是更加符合单一职责原则，使得类的内聚性得以提高。

# 使用场景
以下情况适用模板方法模式：
1. 多个子类有公有的方法，并且逻辑基本相同时;
2. 各子类中公共的行为应被提取出来并集中到一个公共父类中以避免代码重复。
3. 控制子类扩展。模板方法只在特定点调用 “hook” 操作 ，这样就只允许在这些点进行扩展

# 代码实现

**抽象类（AbstractClass）**
```java
public abstract class AbstractClass {
    final void templateMethod() {
        primitiveOperation1();
        primitiveOperation2();
    }

    void primitiveOperation1() {
        System.out.println("AbstractClass.primitiveOperation1");
    }

    void primitiveOperation2() {
        System.out.println("AbstractClass.primitiveOperation2");
    }
}
```

**具体子类（ConcreteClass）**
```java
public class ConcreteClass1 extends AbstractClass {
    @Override
    void primitiveOperation1() {
        System.out.println("ConcreteClass1.primitiveOperation1");
    }

    @Override
    void primitiveOperation2() {
        System.out.println("ConcreteClass1.primitiveOperation2");
    }
}

public class ConcreteClass2 extends AbstractClass {
    @Override
    void primitiveOperation1() {
        System.out.println("ConcreteClass2.primitiveOperation1");
    }

    @Override
    void primitiveOperation2() {
        System.out.println("ConcreteClass2.primitiveOperation2");
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
        AbstractClass concrete1 = new ConcreteClass1();
        concrete1.templateMethod();

        AbstractClass concrete2 = new ConcreteClass2();
        concrete2.templateMethod();
    }
}
```

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/template-method](https://github.com/xueyufish/design-pattern/tree/master/template-method)
