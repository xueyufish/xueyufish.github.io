---
layout:     post
title:      "设计模式 - 迭代器模式(Iterator)"
date:       2012-07-22
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 迭代器模式, Iterator Pattern, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 对象行为模式
---

# 定义
提供一种方法顺序访问一个聚合对象中各个元素，而又不需暴露该对象的内部表示。

# 类型
对象行为模式

# 适用性

以下情况适用迭代器模式：

1. 访问一个聚合对象的内容而无需暴露它的内部表示；
2. 支持对聚合对象的多种遍历；
3. 为遍历不同的聚合结构提供一个统一的接口（即支持多态迭代）

# 结构
![迭代器模式结构](/assets/attachment/design-pattern/d46d4576754fa24c7602524514fb048f.png)

迭代器模式由记下几部分组成：

1. **迭代器（Iterator）**: 定义访问和遍历元素的接口；
2. **具体迭代器（ConcreteIterator）**: 实现迭代器接口，跟踪对聚合遍历时的位置；
3. **聚合（Aggregate）**: 定义创建相应迭代器的接口;
4. **具体聚合（ConcreteAggregate）**: 实现创建相应迭代器对象的接口，该操作返回 ConcreteIterator 的一个适当的实例。

# 优点

1. 简化了遍历方式；
2. 可以提供多种遍历方式；
3. 封装性良好，客户端只需要得到迭代器就可以遍历，而对于遍历算法则不用去关心；

# 缺点

对于比较简单的遍历（像数组或者有序列表），使用迭代器方式遍历较为繁琐

# 代码实现

**迭代器（Iterator）**
```java
public interface Iterator<E> {
    boolean hasNext();
    E next();
}
```

**具体迭代器（ConcreteIterator）**
```java
public class ConcreteIterator implements Iterator {

    private List list;

    private int index;

    public ConcreteIterator(List list) {
        this.list = list;
    }

    @Override
    public boolean hasNext() {
        return index < list.size();
    }

    @Override
    public Object next() {
        Object object = list.get(index);
        index++;
        return object;
    }
}
```

**聚合（Aggregate）**
```java
public interface List<T> {
    void add(T element);

    T get(int index);

    int size();

    Iterator iterator();
}
```

**具体聚合（ConcreteAggregate）**
```java
public class ConcreteAggregate implements List {

    private Object[] list;

    private int size;

    private int index;

    public ConcreteAggregate() {
        list = new Object[100];
    }

    @Override
    public void add(Object obj) {
        list[index++] = obj;
        size++;
    }

    @Override
    public Iterator iterator() {
        return new ConcreteIterator(this);
    }

    @Override
    public Object get(int index) {
        return list[index];
    }

    @Override
    public int size() {
        return size;
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
        List list = new ConcreteAggregate();
        list.add("aaa");
        list.add("bbb");
        list.add("ccc");
        list.add("eee");
        list.add("ddd");

        Iterator it = list.iterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }
    }
}
```

**输出**
```
aaa
bbb
ccc
eee
ddd
```

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/iterator](https://github.com/xueyufish/design-pattern/tree/master/iterator)