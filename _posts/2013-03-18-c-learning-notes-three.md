---
layout:     post
title:      "重温 C 语言 (三)"
date:       2013-03-18
author:     "余修忞(xueyufish)"
keyword:    "程序语言, C, 余修忞, yuxiumin, xueyufish"
tags:
    - 程序语言
    - C
---

# 编写大型程序 
## 源文件
根据惯例，源文件的扩展名为 `.c`，每个源文件包含程序的部分内容，主要是函数和变量的定义。其中一个源文件必须包含一个名为 `main` 的函数，此函数作为程序的起始点。

## 头文件
通常, `#include` 指令告诉预处理器打开指定的文件，并且把此文件内容插入到当前文件中。因此，如果想让几个源文件可以访问相同的信息，可以把此信息放入同一个文件中，然后利用 `#include` 指令把该文件的内容带进每个源文件中。我们把按照此种方式包含的文件称为头文件。

### #include 指令
`#include` 指令有两种书写格式:
* `#include <filename>`: 用于 C 语言自身库。编译器定位头时搜索系统头文件所在目录(或多个目录)，例如 UNIX 环境下的 `/usr/include`
* `#include "filename"`: 用于所有其他头文件或自行编写的头文件。编译器定位头时先搜索当前目录，然后搜索头文件所在目录(或多个目录)。

### 共享宏和类型定义
例如，定义头文件 `boolean.h`:
```c
#define TRUE 1
#define FALSE 0
typedef int Bool;
```
另一个源文件引用 `boolean.h` 头文件:
```c
#include <stdio.h>
#include "boolean.h"

int main() {
    if (TRUE) {
        Bool a = 1;
        printf("a: %d", a);
    }
    return 0;
}
```

### 共享函数原型
例如，定义头文件 `func.h`:
```c
char *foo(void);
char *bar(void);
```
另一个源文件引用 `func.h` 头文件:
```c
#include <stdio.h>
#include "func.h"

int main() {
    char *f = foo();
    char *b = bar();

    printf("%s %s", f, b);
    return 0;
}

char *foo(void) {
    return "foo";
}

char *bar(void) {
    return "bar";
}
```

### 保护头文件
为防止头文件被多次包含，可使用 `#ifndef` 和 `#endif` 指令来封闭文件内容。例如，可使用如下方式保护 `boolean.h`:
```c
#ifndef BOOLEAN_H
#define BOOLEAN_H

#define TRUE 1
#define FALSE 0
typedef int Bool;

#endif
```
在首次包含文件时，没有定义宏 `BOOLEAN_H`，所以预处理器允许保留 `#ifndef` 和 `#endif` 之间的内容。但如果再次包含此文件，那么预处理器将把 `#ifndef` 和 `#endif` 之间的内容删除。

# 结构

结构是可能具有不同类型的值(成员)的集合。

## 结构变量

### 结构变量的声明
结构变量可以采用如下方式的声明：
```c
struct {
    char name [NAME_LEN + 1];
    char sex;
    int age;
} person1, person2;
```

### 结构变量的初始化
和数组一样，结构变量也可以在声明的同时初始化。为了对结构进行初始化，需要把待存储到结构中的值的列表准备好并用花括号括起来：
```c
struct {
  char name[NAME_LEN + 1];
  char sex;
  int age;
}
    person1 = {"zhangsan", '0', 12},
    person2 = {"lisi", '1', 22};
```

### 指定初始化
C99 标准支持指定初始化，如下:
```c
struct {
  char name[NAME_LEN + 1];
  char sex;
  int age;
}
    person1 = {.name="zhangsan", .sex= '0', .age= 12},
    person2 = {.name="lisi", '1', .age=22},
    person3 = {.name="wangwu", .age=32};
```

指定初始化中将点号和成员名称的组合称为指示符。式中列出的值前面不一定要有指示符，如 `person2` 所示，没有指示符时编译器默认认为是用于初始化结构中位于 `name` 之后的成员。此外，初始化式中没有涉及的成员将被设为 `0`。

### 对结构的操作
对结构常见的操作是选择成员，结构成员是通过名字来访问的。例如对于上述结构体:
```c
printf("%s \n", person1.name);  // output: zhangsan
printf("%c \n", person2.sex);   // output: 1

person1.age = 13;               // output: 13
person2.age ++;                 // output: 23
```

此外，结构可以进行赋值操作，例如: `person1 = person2`, 相当于把 `person1` 的 `name` 复制到 `person2` 的 `name`, `person1` 的 `sex` 复制到 `person2` 的 `sex`, `person1` 的 `age` 复制到 `person2` 的 `age`。

需注意的是，结构之间除了赋值操作以为，不支持其他用于整个结构的操作。特别不能用运算符 `==` 或 `!=` 来判断两个结构相等或不相等。

## 结构类型
有时需要在程序的不同位置声明结构变量，这是根据 C 语言规则，不同位置声明的变量之间不能进行赋值操作，所以需要引入结构类型。

### 结构类型的声明
结构标记是用于标识某种特定结构的名字，例如：
```c
struct person {
  char name[NAME_LEN + 1];
  char sex;
  int age;
};
```
注意，结尾部分的分号用于表示声明结束，是必不可少的。

一旦创建了结构声明，就可以用他来声明变量:
```c
struct person person1, person2;
```

结构标记和结构变量声明也可以合并在一起：
```c
struct person {
  char name[NAME_LEN + 1];
  char sex;
  int age;
} person1, person2
```

### 结构类型的定义
除了声明结构标记，还可以用 typedef 来定义真实的类型名，例如:
```c
typedef struct {
    char name[NAME_LEN + 1];
    char sex;
    int age;
} Person;

Person person1, person2;
```
注意，使用结构类型定义时与结构标记不同，不允许书写 `struct`。

### 结构作为参数和返回值
结构体可以作为参数和返回值，传递给函数的结构和从函数返回的结构都要求生成结构中所有成员的副本。这样对于比较大的结构体会造成一定数量的开销，所以通常用指针传递是明智的做法。

此外，使用结构体作为参数和返回值，还可以保证结构体在程序中的唯一性。

### 复合字面量
C99 标准引入了结构体的复合字面量，可用于实时创建一个结构而不需要先将其存储在变量中。生成的结构可以像参数一样传递，可以被函数返回，也可以被赋值给变量。例如：

```c
typedef struct {
  char name[NAME_LEN + 1];
  char sex;
  int age;
} Person;

Person p1 = (Person) {.name="zhangsan", .age=12, .sex='1'};
```

## 嵌套的数组和结构
结构和数组的组合没有限制。数组可以有结构作为元素，结构也可以包含数组和结构作为成员。

### 嵌套的结构
```c
#include <stdio.h>

#define  FIRST_NAME_LEN 20
#define  LAST_NAME_LEN 20

typedef struct {
  char first[FIRST_NAME_LEN + 1];
  char last[LAST_NAME_LEN + 1];
} person_name;

typedef struct {
  person_name name;
  char sex;
  int age;
} person;

int main() {

  person_name name = (person_name) {.first = "zhang", .last="san"};
  person person1 = (person) {.name = name, .sex = '1', .age=1};

  printf("%s %s\n", person1.name.first, person1.name.last);

  return 0;
}
```

# 联合
同结构一样，联合也是由一个或多个成员构成，而且这些成员可能有多个不同的类型。但是，编译器只为联合中最大的成员分配足够的内存，联合的成员在这个空间内彼此覆盖。

例如，对于联合 `u` 和结构 `s`:
```c
union {
  int i;
  double d;
} u;

struct {
  int i;
  double d;
} s;
```

在结构 `s` 中，成员 `i` 和成员 `d` 占有不同的内存单元(分别占有 4 和 8 个字节)，总计占用 12 个字节；在联合 `s` 中，成员 `i` 和成员 `d` 相互交迭，所以只占用 8 个字节，且成员 `i` 和成员 `u` 具有相同的内存地址。

联合的性质和结构类似，但是初始化时只有联合的第一个成员可以获得初始值：
```c
union {
  int i;
  double d;
} u = {0};
```