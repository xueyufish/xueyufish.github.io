---
layout:     post
title:      "设计模式 - 原型模式(Prototype)"
date:       2012-04-18
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 原型模式, Prototype Pattern, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 创建型模式
---

# 定义
用原型实例指定创建对象的种类，并通过拷贝这些原型创建新的对象

# 类型
创建型模式

# 结构

![原型模式结构](/assets/attachment/design-pattern/560883237ff644668f99af1c053a5ff3.png)

原型模式由以下几部分组成：

1. **原型(`Prototype`)**: 声明一个克隆自身的接口；
2. **具体原型(`Concrete Prototype`)**: 实现一个克隆自身的操作；
3. **客户端(`Client`)**: 让一个原型克隆自身从而创建一个新的对象。

# 优点
1. 当创建新的对象比较复杂时，可以简化对象的创建过程，同时也能够提高效率；
2. 可以使用深克隆保持对象的状态，同时也能逃避构造函数约束；

# 缺点
1. 实现深克隆可能相对比较复杂。
2. 需要为每一个类配备一个克隆方法。

# 使用场景
1. 对于创建新对象成本较大的情况，可以利用已有的对象进行复制来获得。
2. 如果系统要保存对象的状态，而对象的状态变化很小，或者对象本身占内存不大，可以使用原型模式配合备忘录模式来应用；相反，如果对象的状态变化很大，或者对象占用的内存很大，那么采用状态模式会比原型模式更好。 

# 注意事项
1. Java 中，使用原型模式复制对象不会调用类的构造方法，因为对象的复制是通过调用 Object 类的 `clone()` 方法来完成的。
2. 不但构造方法中的代码不会执行，访问权限对原型模式也无效。单例模式中，只要将构造方法的访问权限设置为 private 就可以实现单例。但是 `clone()` 方法无视构造方法的权限，所以某种意义上单例模式与原型模式是冲突的。
3. 深拷贝与浅拷贝。Object 类的 `clone()` 方法只会拷贝对象中的基本的数据类型，对于数组、容器对象、引用对象等都不会拷贝，这就是浅拷贝。如果要实现深拷贝，必须将原型模式中的数组、容器对象、引用对象等另行拷贝。（Java 中，会发生深拷贝的有 8 种基本类型以及他们的封装类型，另外还有 String 类型，其余的都是浅拷贝）

#### 代码实现
**具体原型**
```java
public class User implements Cloneable {
    private String userName;
    private String password;

    public User() {
        System.out.println("user constructor.");
    }

    @Override
    public Object clone() {
        User user = null;
        try {
            user = (User) super.clone();
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
        }
        return user;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

**客户端**
```java
public static void main(String... args) {
        User user1 = new User();
        user1.setUserName("user1");
        user1.setPassword("123456");

        User user2 = (User) user1.clone();

        System.out.println("user1 == user2 " + (user1 == user2));
        System.out.println("user1.getClass() == user2.getClass() " + (user1.getClass() == user2.getClass()));
        System.out.println("user1.equals(user2) " + (user1.equals(user2)));
    }
```

#### 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/prototype](https://github.com/xueyufish/design-pattern/tree/master/prototype)