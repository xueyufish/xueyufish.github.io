---
layout:     post
title:      "设计模式 - 单例模式(Singleton)"
date:       2012-04-02
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 创建型模式, 单例模式, 余修忞, yuxiumin, xueyufish"
header-img: "img/post-bg-js-version.jpg"
tags:
    - 设计模式
---

# 定义
确保一个类只有一个实例，并且提供对对象的全局访问点

# 类型
创建型模式

# 结构
![单例模式结构](/assets/attachment/design-pattern/b9f8dd056cceee1cdc014d31580ad071.gif)

# 实现
单例模式的实现主要有懒汉式、饿汉式、双重校验锁、静态内部类、枚举等 5 种，具体如下：

## 饿汉式单例

饿汉式单例通过静态变量的方式在启动时即被初始化, 无线程安全问题, 但相其他方式浪费一定的内存空间。实现代码如下：
```java
public final class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() {}

    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```

## 懒汉式单例

懒汉式单例在被调用时才被初始化, 通过增加 <code>synchronized</code> 关键字保证线程安全

```java
public class Singleton {
    private static final Singleton INSTANCE;
    private Singleton() {}

    public static synchronized Singleton getInstance() {
       if(INSTANCE == null) {
          INSTANCE = new Singleton();
      }
      return INSTANCE;
   }
}
```

## 枚举式单例

枚举式单例是《Effective Java》作者 Josh Bloch 提倡的方式，它不仅能避免多线程同步问题，而且还能防止反序列化重新创建新的对象。不过实际场景中因为表达比较晦涩，被使用的并不多见。

```java
public enum Singleton {
    instance;
    public void someMethod(){
    }
}
```

## 双重校验锁

双重校验锁方式综合了饿汉和懒汉两种方式的优点，将锁定操作放在 if 条件内部, 一定程度提高性能。

```java
public final class Singleton {
    private static volatile Singleton instance = null;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized(Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

## 静态内部类

这种方式同样利用了 classloder 的机制来保证初始化 instance 时只有一个线程，它跟饿汉式不同的是：饿汉式只要 Singleton 类被装载了，那么 instance 就会被实例化（没有达到lazy loading效果），而这种方式是 Singleton 类被装载了，instance 不一定被初始化。因为 LazyHolder 类没有被主动使用，只有显示通过调用 getInstance 方法时，才会显示装载 LazyHolder 类，从而实例化 instance。

如果实例化 instance 很消耗资源，想让他延迟加载，另外一方面，又不希望在 Singleton 类加载时就实例化，那么这种方式相比饿汉式方法就显得更合理。

```java
public class Singleton {
    private Singleton() {}

    private static class LazyHolder {
        static final Singleton INSTANCE = new Something();
    }

    public static Singleton getInstance() {
        return LazyHolder.INSTANCE;
    }
}
```

# 优点

* 在内存中只有一个对象，节省内存空间。
* 避免频繁的创建销毁对象，可以提高性能。
* 避免对共享资源的多重占用。
* 可以全局访问。

# 缺点

* 单例模式一般没有接口，扩展比较困难；
* 不便于测试，很难 mock 出一个对象；
* 单例模式与[单一职责原则](https://en.wikipedia.org/wiki/Single_responsibility_principle)有冲突。

# 适用场景

* 需要频繁实例化然后销毁的对象。
* 创建对象时耗时过多或者耗资源过多，但又经常用到的对象。
* 有状态的工具类对象。
* 频繁访问数据库或文件的对象。

# 注意事项

* 只能使用单例类提供的方法得到单例对象，不要使用反射，否则将会实例化一个新对象。
* 不要做断开单例类对象与类中静态引用的危险操作。
* 多线程使用单例使用共享资源时，注意线程安全问题。

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/singleton](https://github.com/xueyufish/design-pattern/tree/master/singleton)
