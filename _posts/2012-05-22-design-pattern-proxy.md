---
layout:     post
title:      "设计模式 - 代理模式(Proxy)"
date:       2012-05-22
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 代理模式, Proxy, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 结构型模式
---

# 定义
为其他对象提供一个代理，以控制对这个对象的访问。

# 类型
结构型模式

# 结构

![代理模式结构](http://img.yuxiumin.com/screenshots/design-patterns/b808097e7b3af60fdfb9b34a283e587d.png)

代理模式由以下几部分组成：

**抽象主题（Subject）**

定义 RealSubjet 和 Proxy 的共用接口，这样就在任何使用 RealSubject 的地方可以使用 Proxy;

**真实主题（RealSubject）**

定义 Proxy 所代表的实体。

**代理（Proxy）**:

* 保存一个引用使得代理可以访问实体；若 RealSubjet 和 Subject 接口相同，Proxy 会引用 Subject;
* 提供一个与 Subject 接口相同的接口，这样代理可以用它来代替实体;
* 控制对实体的存取，并可能负责创建和删除它;
* 其他功能依赖于代理的类型：
    - 远程代理（Remote Proxy）: 负责对请求及其参数进行编码，并向不同地址空间中的实体发送已编码的请求;
    - 虚代理（Virtual Proxy）: 可以缓存实体的附加信息，以便延迟对它的访问;
    - 保护代理（Protection Proxy）: 检查调用者是否具实现一个请求所必须的访问权限;

# 优点
1. 协调调用者和被调用者，降低了系统的耦合度;
2. 代理对象作为客户端和目标对象之间的中介，起到了保护目标对象的作用。

# 缺点
1. 由于在客户端和真实主题之间增加了代理对象，因此会造成请求的处理速度变慢;
2. 实现代理模式需要额外的工作，从而增加了系统实现的复杂度。

# 使用场景
以下情况适用 Proxy 模式：
1. 远程代理 (Remote Proxy): 为一个对象在不同的地址空间提供局部代表。例如在分布式对象调用的场景，使用一个本地对象代理一个远程地址空间中的远程对象，对本地对象的方法调用可以引起远程对象中的方法调用;
2. 虚代理 (Virtual Proxy): 根据需要创建开销很大的对象;
3. 保护代理 (Protection Proxy): 控制对原始对象的访问。保护代理用于对象应该有不同的访问权限时;
4. 智能指引 (Smart Reference): 取代简单指针，在访问对象时增加了一些附加操作。典型用途包括：(1) 对指向实际引用的对象计数，这样当该对象没有引用时可以自动释放；(2) 当第一次引用一个持久对象时，将它装入内存；(3) 在访问一个持久对象前，检查它是否已经锁定，以确保其他对象不能改变它。


# 代理模式实现

## 静态代理模式 

静态代理模式代理和被代理对象在代理之前都是确定的，他们都实现相同的接口或者继承相同的抽象类。其结构对应上文所示类图。

**抽象主题（Subject）**
```java
public interface Subject {
    void execute();
}
```
**真实主题（RealSubject）**
```java
public class RealSubject implements Subject {
    @Override
    public void execute() {
        System.out.println("RealSubject execute...");
    }
}
```
**代理类（Proxy）**
```java
public class Proxy implements Subject {
    private Subject subject;

    public Proxy(Subject s) {
        this.subject = s;
    }

    @Override
    public void execute() {
        this.subject.execute();
    }
}
```

**客户端（Client）**
```java
public class Client {
    public static void main(String... args) {
        new Client().test();
    }

    private void test() {
        Subject subject = new CustomProxy(new RealSubject());
        subject.execute();
    }
}
```

## 动态代理模式

动态代理指动态的在内存中构建代理对象。

在 Java 中，通过使用反射技术，一个代理类可以为任意类提供代理，代理类必须实现 `InvocationHandler` 接口。对代理实例调用方法时，将对方法调用进行编码并将其指派到它的代理程序的 `invoke` 方法。`invoke` 方法运用反射技术，通过 `java.lang.reflect.Proxy` 类中提供的静态方法 `newProxyInstance(ClassLoader loader, Class<?>[] interfaces, InvocationHandler h)` 返回一个指定接口的代理类实例，该接口可以将方法调用指派到指定的调用处理程序，也就是代理类实现的 `InvocationHandler` 接口中的 `invoke` 方法中。

**抽象主题（Subject）**
```java
public interface Subject {
    void execute();
}
```
**真实主题（RealSubject）**
```java
public class RealSubject implements Subject {
    @Override
    public void execute() {
        System.out.println("RealSubject execute...");
    }
}
```
**代理类（Proxy）**
```java
public class CustomProxy implements InvocationHandler {
    private Object object;

    public CustomProxy(Object obj) {
        this.object = obj;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("proxy execute start");
        Object resultObject = method.invoke(object, args);
        System.out.println("proxy execute end");
        return resultObject;
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
        Subject subject = new RealSubject();
        CustomProxy customProxy = new CustomProxy(subject);
        subject = (Subject) Proxy.newProxyInstance(Client.class.getClassLoader(), subject.getClass().getInterfaces(),
            customProxy);
        subject.execute();
    }
}
```

#### 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/proxy](https://github.com/xueyufish/design-pattern/tree/master/proxy)
