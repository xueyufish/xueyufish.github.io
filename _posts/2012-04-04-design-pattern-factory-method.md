---
layout:     post
title:      "设计模式 - 工厂方法(Factory Method)"
date:       2012-04-04
author:     "xueyufish"
keyword:    "设计模式, 创建型模式, 工厂方法, Factory Method, xueyufish"
tags:
    - 设计模式
---

# 定义
定义一个用于创建对象的接口，让子类决定实例化哪一个类，工厂方法使一个类的实例化延迟到其子类

# 类型
创建型模式

# 结构

![工厂方法结构](/assets/attachment/design-pattern/92aa5402b066887668e352dbe53dd3e6.png)

工厂方法主要由以下几部分组成：

1. **工厂接口(Factory)**：工厂方法模式的核心，与调用者交互用来提供产品。在实际编程中，有时候也会使用一个抽象类来作为与调用者交互的接口。
2. **工厂实现(ConcreteFactory)**：决定如何实例化产品，返回具体产品，是实现扩展的途径。需要有多少种产品，就需要有多少个具体的工厂实现。
3. **产品接口(Product）**：主要目的是定义产品的规范，所有的产品实现都必须遵循产品接口定义的规范，同样，产品接口也可以用抽象类来代替。
4. **产品实现(ConcreteProduct)**：实现产品接口的具体类，决定了产品在客户端中的具体行为。

# 代码实现

**工厂接口**
```java
public interface Factory {
  Product build();
}
```

**工厂实现**
```java
public class FactoryA implements Factory {
    @Override
    public Product build() {
        return new ProductA();
    }
}

public class FactoryB implements Factory {
    @Override
    public Product build() {
        return new ProductB();
    }
}
```

**产品接口**
```java
public interface Product {
  String name();
}
```

**产品实现**
```java
public class ProductA implements Product {
    @Override
    public String name() {
        return "productA";
    }
}

public class ProductB implements Product {
    @Override
    public String name() {
        return "productB";
    }
}
```

# 优点
1. 良好的封装性，代码结构清晰。如果一个调用者需要一个具体的产品对象，只要知道这个产品的类名，降低模块间的耦合;
2. 良好的扩展性。如果需要增加产品类，只需要适当地修改具体的工厂类或扩展一个工厂类;
3. 屏蔽产品类。调用者不需要关心产品类的实现如何变化，只需要关心产品的接口，只要接口保持不变，系统中的上层模块就不发生变化;
4. 实现了框架间的解耦。高层模块只需要知道产品的抽象类，其他的实现类都不用关心，符合[迪米特法则](https://en.wikipedia.org/wiki/Law_of_Demeter)；也符合[依赖倒置原则](https://en.wikipedia.org/wiki/Dependency_inversion_principle)，只依赖产品类的抽象；同时也符合[里氏替换原则](https://en.wikipedia.org/wiki/Liskov_substitution_principle)，使用产品子类替换产品父类。

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/factory-method](https://github.com/xueyufish/design-pattern/tree/master/factory-method)
