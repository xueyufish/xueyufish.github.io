---
layout:     post
title:      "设计模式 - 责任链模式(Chain-of-responsibility pattern)"
date:       2012-07-28
author:     "xueyufish"
keyword:    "设计模式, 责任链模式, Chain-of-responsibility pattern, xueyufish"
tags:
    - 设计模式
    - 对象行为模式
---

# 定义
使多个对象有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系。将这些对象连成一条链，并沿着这条链传递该请求，直到有一个对象处理它为止。

# 类型
对象行为模式

# 结构
![责任链模式结构](/assets/attachment/design-pattern/32c83454621f93c07b084f5be74f7339.jpg)

责任链模式由以下几部分组成：

1. **抽象处理者（Handler）**: 定义一个请求的接口。如果需要可以定义个一个方法用来设定和返回后继者对象的引用。
2. **具体处理者（ConcreteHandler）**: 如果可以处理就处理请求，如果不能处理，把请求传给后继者，让后继者处理。也就是说它处理自己能处理的请求且可以访问它的后继者。
3. **客户端（Client）**: 向链上的具体处理者对象提交请求。

# 优点
1. 调用者不需知道具体谁来处理请求，也不知道链的具体结构，降低了节点域节点的耦合度；
2. 可在运行时动态修改链中的对象职责，增强了给对象指派职责的灵活性；

# 缺点

没有明确的接收者，可能传到链的最后，也没得到正确的处理。

# 适用性

以下情况适用责任链模式：

1. 有多个对象可以处理一个请求，哪个对象处理该请求运行时刻自动确定；
2. 想在不明确指定接收者的情况下，向多个对象中的一个提交一个请求；
3. 可处理一个请求的对象集合应该被动态制定；

# 代码实现

**抽象处理者（Handler）**
```java
public interface Chain {
    void setNextChain(Chain higherLevel);
    void solveTheProblem(String levelOfProblem);
}
```

**具体处理者（ConcreteHandler）**
```java
public class Coder implements Chain {
    private Chain nextChain;

    @Override
    public void setNextChain(Chain higherLevel) {
        this.nextChain = higherLevel;
    }

    @Override
    public void solveTheProblem(String levelOfProblem) {
        if (levelOfProblem.equals("Coder")) {
            System.out.println("Coder has solved the problem!");
        } else {
            System.out.println(
                "This problem is above coder seniority. You are being transferred to the higher rank...");
            nextChain.solveTheProblem(levelOfProblem);
        }
    }
}

public class Manager implements Chain {
    private Chain nextChain;

    @Override
    public void setNextChain(Chain higherLevel) {
        this.nextChain = higherLevel;
    }

    @Override
    public void solveTheProblem(String levelOfProblem) {
        if (levelOfProblem.equals("Manager")) {
            System.out.println("Manager has solved the problem!");
        } else {
            System.out.println(
                "This problem is above Manager seniority. You are being transferred to the higher rank...");
            nextChain.solveTheProblem(levelOfProblem);
        }
    }
}

public class CTO implements Chain {
    private Chain nextChain;

    @Override
    public void setNextChain(Chain higherLevel) {
        this.nextChain = higherLevel;
    }

    @Override
    public void solveTheProblem(String levelOfProblem) {
        if (levelOfProblem.equals("CTO")) {
            System.out.println("CTO has solved the problem!");
        } else {
            System.out.println("This problem is above CTO seniority. Find the solution yourself.");
            nextChain.solveTheProblem(levelOfProblem);
        }
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
        Coder coder = new Coder();
        Manager manager = new Manager();
        CTO cto = new CTO();

        coder.setNextChain(manager);
        manager.setNextChain(cto);

        System.out.println("CTO problem: ");
        coder.solveTheProblem("CTO");
        System.out.println("----------------------------------------");
        System.out.println("Coder problem: ");
        coder.solveTheProblem("Coder");
        System.out.println("----------------------------------------");
        System.out.println("Manager problem: ");
        coder.solveTheProblem("Manager");
        System.out.println("----------------------------------------");
    }
}

```

**输出**
```
CTO problem: 
This problem is above coder seniority. You are being transferred to the higher rank...
This problem is above Manager seniority. You are being transferred to the higher rank...
CTO has solved the problem!
----------------------------------------
Coder problem: 
Coder has solved the problem!
----------------------------------------
Manager problem: 
This problem is above coder seniority. You are being transferred to the higher rank...
Manager has solved the problem!
----------------------------------------
```

# 参考代码
[https://github.com/xueyufish/design-pattern-java/tree/master/chain](https://github.com/xueyufish/design-pattern-java/tree/master/chain)