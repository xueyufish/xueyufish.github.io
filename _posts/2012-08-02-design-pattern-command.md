---
layout:     post
title:      "设计模式 - 命令模式(Command pattern)"
date:       2012-08-02
author:     "余修忞(xueyufish)"
keyword:    "设计模式, 命令模式, Command pattern, 余修忞, yuxiumin, xueyufish"
tags:
    - 设计模式
    - 对象行为模式
---

# 定义
将一个请求封装为一个对象，从而使你可用不同的请求对客户进行参数化；对请求排队或记录请求日志，以及支持可撤销的操作。

# 类型
对象行为模式

# 结构
![命令模式结构](/assets/attachment/design-pattern/c2f716888f08330d27f595c5b405d555.png)

命令模式由以下几部分组成：

1. **抽象命令类（Command）**: 声明执行操作的接口。调用接收者相应的操作，以实现执行的方法 Execute<;
2. **具体命令类（ConcreteCommand）**: 创建一个具体命令对象并设定它的接收者。通常会持有接收者，并调用接收者的功能来完成命令要执行的操作。 
3. **接收者（Receiver）**: 知道如何实施与执行一个请求相关的操作。任何类都可能作为一个接收者,只要它能够实现命令要求实现的相应功能。 
4. **调用者（Invoker）**: 要求该命令执行这个请求。通常会持有命令对象，可以持有很多的命令对象。
5. **客户端（Client）**: 创建具体的命令对象，并且设置命令对象的接收者。真正使用命令的客户端是从 Invoker 来触发执行。 

# 优点
1. 降低系统的耦合度: Command 模式将调用操作的对象与知道如何实现该操作的对象解耦;
2. Command 是头等的对象，它们可像其他的对象一样被操纵和扩展；
3. 组合命令: 可将多个命令装配成一个组合命令，即可以比较容易地设计一个命令队列和宏命令。一般说来，组合命令是 Composite 模式的一个实例。
4. 增加新的 Command 很容易，因为这无需改变已有的类。
5. 可以方便地实现对请求的 undo 和 redo。

# 缺点

可能会导致某些系统有过多的具体命令类。因为针对每一个命令都需要设计一个具体命令类，因此某些系统可能需要大量具体命令类，这将影响命令模式的使用。

# 适用性

以下情况适用命令模式：

1. 系统需要将请求调用者和请求接收者解耦，使得调用者和接收者不直接交互；
2. 系统需要在不同的时间指定请求、将请求排队和执行请求；
3. 系统需要支持命令的撤销 (undo) 操作和恢复 (redo)操作；
4. 系统需要将一组操作组合在一起，即支持宏命令。

# 命令模式实现

**抽象命令类（Command）**
```java
public interface Command {
    void execute();
}
```

**具体命令类（ConcreteCommand）**
```java
public class TurnOnCommand implements Command{
    private Receiver receiver;

    public TurnOnCommand(Receiver receiver) {
        this.receiver = receiver;
    }

    @Override
    public void execute() {
        this.receiver.turnOn();
    }
}

public class TurnOffCommand implements Command {
    private Receiver receiver;

    public TurnOffCommand(Receiver receiver) {
        this.receiver = receiver;
    }

    @Override
    public void execute() {
        this.receiver.turnOff();
    }
}
```

**接收者（Receiver）**
```java
public class Receiver {
    public void turnOn() {
        System.out.println("Receiver.turnOn()");
    }

    public void turnOff() {
        System.out.println("Receiver.turnOff()");
    }
}
```

**调用者（Invoker）**
```java
public class Invoker {
    public void execute(Command command){
        command.execute();
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
        Receiver receiver = new Receiver();
        Invoker invoker = new Invoker();

        Command turnOn = new TurnOnCommand(receiver);
        Command turnOff = new TurnOffCommand(receiver);

        invoker.execute(turnOn);
        invoker.execute(turnOff);
    }
}
```

**输出**
```
Receiver.turnOn()
Receiver.turnOff()
```

# 参考代码
[https://github.com/xueyufish/design-pattern/tree/master/command](https://github.com/xueyufish/design-pattern/tree/master/command)