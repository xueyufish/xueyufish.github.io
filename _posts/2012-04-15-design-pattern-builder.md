---
layout:     post
title:      "设计模式 - 建造者模式(Builder)"
date:       2012-04-15
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 建造者, Builder, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 创建型模式
---

# 定义
将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示

# 类型
创建型模式

# 结构

![建造者模式结构](/assets/attachment/design-pattern/c73ac087e363fe63156e35d2bca0ae11.png)

建造者模式由以下几部分组成：
1. **建造者 (Builder)**：为创建一个 Product 对象的各个部件指定抽象接口；
2. **具体建造者 (Concrete Builder)**：实现 Builder 接口所定义的方法，并返回一个组建好的对象；
3. **产品类 (Product)**：表示被构造的复杂对象；
4. **导演类 (Director)**：负责调用适当的建造者来组建产品，一般不与产品类发生依赖关系。通常被用来封装程序中易变的部分。

# 优点
1. 易于解耦：将产品本身与产品创建过程进行解耦，可以使用相同的创建过程来得到不同的产品；
2. 易于精确控制对象的创建：将复杂产品的创建步骤分解在不同的方法中，使得创建过程更加清晰；
3. 易于拓展：增加新的具体建造者无需修改原有类库的代码，易于拓展，符合"开闭原则"。

# 缺点
1. 使用范围受到一定的限制：所创建的产品需要具有较多的共同点，组成部分相似；如果产品之间的差异性很大，则不适合使用建造者模式。
2. 如果产品的内部变化复杂，可能会需要定义很多具体建造者类来实现这种变化，导致系统变得很庞大。

# 适用场景
1. 相同的方法，不同的执行顺序，产生不同的事件结果时；
2. 多个部件或零件，都可以装配到一个对象中，但是产生的运行结果又不相同时；
3. 产品类非常复杂，或者产品类中的调用顺序不同产生了不同的效能；
4. 在对象创建过程中会使用到系统中的一些其他对象，这些对象在产品对象的创建过程中不易得到时，也可以采用建造者模式封装该对象的创建过程。

# 代码实现

**产品类(`Product`)**
```java
@Data
public class Product {
    private int wheels;
    private String color;
}
```

**抽象建造者(`Builder`)**
```java
public interface Builder {
    void buildColor(final String color);
    void buildWheels(final int wheels);
    Product getResult();
}
```

**具体建造者(`Concrete Builder`)**
```java
public class ConcreteBuilder implements Builder {
    private Product product;
    public ConcreteBuilder() {
        product = new Product();
    }

    @Override
    public void buildColor(String color) {
        product.setColor(color);
    }

    @Override
    public void buildWheels(int wheels) {
        product.setWheels(wheels);
    }

    @Override
    public Product getResult() {
        return product;
    }
}
```

**导演类(`Director`)**
```java
public class Director {
    private Builder builder;

    public Director(final Builder builder) {
        this.builder = builder;
    }

    public void construct() {
        builder.buildWheels(4);
        builder.buildColor("red");
    }
}
```

## 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/builder](https://github.com/xueyufish/design-pattern/tree/master/builder)