---
layout:     post
title:      "设计模式 - 观察者(Observer)"
date:       2012-07-15
author:     "xueyufish"
keyword:    "设计模式, 观察者, Observer Pattern, xueyufish"
tags:
    - 设计模式
    - 对象行为模式
---

# 定义
定义对象间一种一对多的依赖关系，使得当每一个对象改变状态，则所有依赖于它的对象都会得到通知并自动更新。

# 类型
对象行为模式

# 结构
![观察者模式结构](/assets/attachment/design-pattern/ac2f733f8f9dbe2564a6d4c4e358abaf.jpg)

观察者模式由以下几部分组成：

1. **目标（Subject）**: 定义观察者需要实现的职责，提供注册和删除观察者对象的接口。通常被实现为抽象类，仅完成作为观察者所必须实现的职能：管理并通知观察者。
2. **观察者（Observer）**: 为那些在目标发生改变时需获得通知的对象定义一个更新接口。
3. **具体目标（ConcreteSubject）**: 将有关状态存入各具体观察者（ConcreteObserver）对象；当它的状态发生改变时，向它的各个观察者发出通知。
4. **具体观察者（ConcreteObserver）**: 维护一个指向具体目标（ConcreteSubject）对象的引用；存储有关状态，这些状态应与目标的状态保持一致；实现 Observer 的更新接口以使自身状态与目标状态保持一致。

# 优缺点

**优点**
1. 观察者模式在被观察者和观察者之间建立一个抽象的耦合。被观察者角色所知道的只是一个具体现察者聚集，每一个具体现察者都符合一个抽象观察者的接口。被观察者并不认识任何一个具体观察者，它只知道它们都有一个共同的接口。由于被观察者和观察者没有紧密地耦合在一起，因此它们可以属于不同的抽象化层次。
2. 观察者模式支持广播通信，被观察者会向所有的登记过的观察者发出通知。

**缺点**
1. 如果一个被观察者对象有很多直接和间接的观察者的话，将所有的观察者都通知到会花费很多时间。
2. 如果在被观察者之间有循环依赖的话，被观察者会触发它们之间进行循环调用，导致系统崩溃。
3. 如果对观察者的通知是通过另外的线程进行异步投递的话，系统必须保证投递是以自恰的方式进行的。
4. 虽然观察者模式可以随时使观察者知道所观察的对象发生了变化，但是观察者模式没有相应的机制使观察者知道所观察的对象是怎么发生变化的。

# 适用性

以下情况适用观察者模式：

1. 当一个抽象模型有两个方面，其中一个方面依赖于另一个方面，将这二者封装在独立的对象中以使他们可以各自独立地改变和复用。
2. 当对一个对象的改变需要同步改变其他对象，而不知道具体有多少对象有待改变；
3. 当一个对象必须通知其它对象，而它又不能假定其它对象是谁。换言之，你不希望这些对象是紧密耦合的。

# 代码实现

**目标（Subject）**
```java
public interface Subject {
    void registerObserver(Observer o);

    void removeObserver(Observer o);

    void notifyObserver();
}
```

**观察者（Observer）**
```java
@FunctionalInterface
public interface Observer {
    void update();
}
```

**具体目标（ConcreteSubject）**
```java
public class ConcreteSubject implements Subject {

    private List<Observer> observers = new ArrayList<>();

    @Override
    public void registerObserver(Observer o) {
        observers.add(o);
    }

    @Override
    public void removeObserver(Observer o) {
        if (!observers.isEmpty()) {
            observers.remove(o);
        }
    }

    @Override
    public void notifyObserver() {
        observers.forEach(Observer::update);
    }
}
```

**具体观察者（ConcreteObserver）**
```java
@AllArgsConstructor
public class ConcreteObserver1 implements Observer {
    private String name;
    private String message;

    @Override
    public void update() {
        System.out.println("ConcreteObserver1: " + name + " get message " + message);
    }
}

@AllArgsConstructor
public class ConcreteObserver2 implements Observer {
    private String name;
    private String message;

    @Override
    public void update() {
        System.out.println("ConcreteObserver2: " + name + " get message " + message);
    }
}

@AllArgsConstructor
public class ConcreteObserver3 implements Observer {
    private String name;
    private String message;

    @Override
    public void update() {
        System.out.println("ConcreteObserver3: " + name + " get message " + message);
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
        ConcreteSubject subject = new ConcreteSubject();

        Observer observer1 = new ConcreteObserver1("zhangsan", "123");
        Observer observer2 = new ConcreteObserver2("lisi", "456");
        Observer observer3 = new ConcreteObserver3("wangwu", "789");

        subject.registerObserver(observer1);
        subject.registerObserver(observer2);
        subject.registerObserver(observer3);

        subject.notifyObserver();

        subject.removeObserver(observer2);
        subject.notifyObserver();
    }
}
```

**输出**
```
ConcreteObserver1: zhangsan get message 123
ConcreteObserver2: lisi get message 456
ConcreteObserver3: wangwu get message 789
ConcreteObserver1: zhangsan get message 123
ConcreteObserver3: wangwu get message 789
```

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/observer](https://github.com/xueyufish/design-pattern/tree/master/observer)