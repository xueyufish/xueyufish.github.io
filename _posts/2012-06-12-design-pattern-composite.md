---
layout:     post
title:      "设计模式 - 组合模式(Composite)"
date:       2012-06-12
author:     "xueyufish"
keyword:    "设计模式, 组合模式, Composite Pattern, xueyufish"
tags:
    - 设计模式
    - 结构型模式
---

# 定义
将对象组合成树形结构以表示"整体-部分"的层次结构。组合模式使得用户对单个对象和组合对象的使用具有一致性。

# 类型
结构型模式

# 结构
![组合模式结构](/assets/attachment/design-pattern/42f47ef4e360ab86e6d9b23e8e433510.png)

组合模式由以下几部分组成:

**抽象组件（Component）**: 可以是接口或抽象类，为叶子组件 (Leaf) 和容器组件 (Composite) 声明接口；在适当的情况下，实现所有类共有接口的缺省行为；同时定义了访问及管理它的子构件的方法，如增加子组件、删除子组件、获取子组件等。

**容器组件（Composite）**: 在组合结构中表示容器节点对象。容器节点包含子节点，其子节点可以是叶子节点，也可以是容器节点，它提供一个集合用于存储子节点，实现了在抽象构件中定义的行为，包括那些访问及管理子构件的方法，在其业务方法中可以递归调用其子节点的业务方法。

**叶子组件（Leaf）**: 实现了在抽象组件 (Component) 中定义的行为，其他没有其他分支，是遍历的最小单位。

**客户端（Client）**: 通过抽象组件接口操纵组合部件的对象。

# 优点
1. 可以清楚地定义分层次的复杂对象，表示对象的全部或部分层次，从而让客户端忽略层次的差异，方便对整个层次结构进行控制。
2. 客户端可以一致地使用一个组合结构或其中单个对象而不必关心具体处理的是单个对象还是整个组合结构，简化了客户端代码。
3. 增加新的容器构件和叶子构件时无须对现有类库进行任何修改，符合“开闭原则”。
4. 为树形结构的面向对象实现提供了一种灵活的解决方案，通过叶子对象和容器对象的递归组合，可以形成复杂的树形结构。

# 缺点
在增加新构件时很难对容器中的构件类型进行限制。如果希望一个容器中只能有某些特定类型的对象，使用组合模式时，不能依赖类型系统来施加这些约束，因为它们都来自于相同的抽象层，在这种情况下，必须通过在运行时进行类型检查来实现，这个实现过程较为复杂。

# 适用性

以下情况适用组合(Composite)模式：

1. 当希望表示对象的整体-部分层次结构时；
2. 当希望用户忽略组合对象和单个对象的不同，用户将统一的使用组合结构中的所有对象时；

# 代码实现

**抽象组件(Component)**
```java
public interface Component {

    void add(Component component);

    void remove(Component component);

    Component getChild(int i);

    void print();
}
```

**容器组件(Composite)**
```java
public class Composite implements Component {

    private List<Component> childCompanies = new ArrayList<Component>();

    @Override
    public void add(Component component) {
        childCompanies.add(component);
    }

    @Override
    public void remove(Component component) {
        childCompanies.remove(component);
    }

    @Override
    public Component getChild(int i) {
        return childCompanies.get(i);
    }

    @Override
    public void print() {
        childCompanies.forEach(Component::print);
    }
}
```

**叶子组件(Leaf)**
```java
public class Leaf implements Component {

    private String name;

    public Leaf(String name) {
        this.name = name;
    }

    @Override
    public void add(Component component) throws UnsupportedOperationException {
        throw new UnsupportedOperationException("UnSupport add operation with Leaf obj");
    }

    @Override
    public void remove(Component component) {
        throw new UnsupportedOperationException("UnSupport remove operation with Leaf obj");
    }

    @Override
    public Component getChild(int i) {
        throw new UnsupportedOperationException("UnSupport getChild operation with Leaf obj");
    }

    @Override
    public void print() {
        System.out.println("Leaf：" + name);
    }
}
```

**客户端(Client)**
```java
public class Client {

    public static void main(String[] args) {
        new Client().test();
    }

    private void test() {
        Leaf leaf1 = new Leaf("leaf1");
        Leaf leaf2 = new Leaf("leaf2");
        Leaf leaf3 = new Leaf("leaf3");
        Leaf leaf4 = new Leaf("leaf4");

        Component composite = new Composite();

        Component composite1 = new Composite();
        Component composite2 = new Composite();

        composite1.add(leaf1);
        composite1.add(leaf2);
        composite2.add(leaf3);

        composite2.add(leaf4);

        composite.add(composite1);
        composite.add(composite2);

        composite.print();
    }
}
```

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/composite](https://github.com/xueyufish/design-pattern/tree/master/composite)