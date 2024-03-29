---
layout:     post
title:      "重温 C 语言 (四)"
date:       2013-03-18
author:     "xueyufish"
keyword:    "程序语言, C, xueyufish"
tags:
    - 程序语言
    - C
---

# 存储分配与回收
## 动态存储分配
### 内存分配函数
为了动态分配存储空间，需要调用三种分配函数中的一种，这些函数都是声明在 `<stdlib.h>` 头中。

* `malloc` 函数：分配内存块，但是不对内存块进行初始化； 
* `calloc` 函数：分配内存块，并且对内存块清零； 
* `realloc` 函数：调用先前分配的内存块大小。

三种函数中，`malloc` 函数是最常用的一种, 因为 `malloc` 函数不需要对分配的内存块清零，所以比 `calloc` 更高效。

当为申请内存块而调用内存分配函数时，由于函数无法知道存储在内存块中的数据是什么类型的，所以无法返回 int 类型、char 类型等普通类型的指针。函数会返回 `void *` 类型的指针，`void *` 类型指针是通用指针，本质上只是内存地址。

### 空指针
当调用内存分配函数的时候，有时会找不到满足需要的足够大的内存块，对于此类问题，函数会返回**空指针(null pointer)**。空指针指不指向任何地方的指针。

空指针用名为 `NULL` 的宏来定义，在 `<locale.h>`、`<stedef.h>`、`<stdio.h>`、`<stdlib.h>`、`<string.h>` 和 `<time.h>` 中有定义。可以用以下方式测试 `malloc` 函数的返回值：
```c
p = malloc(1000);
if (p == NULL) {
    ...
}
```

## 动态分配字符串
因为 C 语言保证 `char` 类型值需要一个字节内存，所以给 n 个字节长的字符串分配内存可以使用 `malloc` 完成:
```c
p = malloc(n + 1);
```
其中 `p` 为 `char *` 类型变量，参数 `n+1` 表示给空字符预留空间。

`malloc` 函数的原型为: 
```c
void *malloc(size_t size);
```
 
由于使用 `malloc` 分配的内存不需要清零或者进行任何初始化，所以 `p` 指向带有 `n+1` 个字符的未初始化的字符数组。如需对数组进行初始化，可调用 `strcpy` 函数:
```c
strcpy(p, "abc");
```
初始化后，数组中前四个字符分别为 `a`、`b`、`c`、`\0`；

## 动态分配数组
### 使用 malloc 函数动态分配数组
与动态分配字符串类似，也可以使用 `malloc` 函数动态分配数组。区别在于字符串中固定了一个字符占用一个字节长度，数组元素需要通过 `sizeof` 运算符计算具体的长度。
例如，分配 n 个整数构成的数组：
```c
int *a;
a = malloc(n * sizeof(int));
```
需要注意，计算数组空间时始终需要 `sizeof` 运算符。

### calloc 函数
`calloc` 函数的原型为: 
```c
void *calloc(size_t nmemb, size_t size);
```

`calloc` 函数为 `nmemb` 个元素的数组分配内存空间，其中每个元素的长度为 `size` 个字节，如果请求空间无效，返回空指针。在分配内存之后，`calloc` 会通过把所有位设置为 `0` 的方式进行初始化。

例如：下面的`calloc` 函数为 `n` 个整数的数组分配存储空间，并且保证所有整数初始值均为零:
```c
a = calloc(n, sizeof(int));
```

`calloc` 函数有时也可用于为不同于数组的对象分配内存，通过调用 1 为第一个实参的 `calloc` 函数，可以为任何类型的数据项分配内存空间：
```c
struct point {int x, y;} *p;
p = calloc(1, sizeof(struct point));
```
上述语句中 p 指向一个结构，此结构成员 x、y 都会被清零。

### realloc 函数
`realloc` 函数可以用于调整数组大小。函数原型定义在 `<stdlib.h>` 中:
```c
void *realloc(void *ptr, size_t size);
```
当调用 `realloc` 函数时，`ptr` 必须指向先前通过 `malloc`、`calloc` 或 `realloc` 函数调用获得的内存块。size 表示内存块的新尺寸，新尺寸可能会大于或小于原有尺寸。

C 标准列出了几条关于 `realloc` 函数的原则:
* 当扩展内存块是，`realloc` 函数不会对扩展进内存块的字节进行初始化；
* 如果 `realloc` 函数不能按要求扩大内存块，那么它会返回空指针，并且在原有内存块中的数据不会改变；
* 如果 `realloc` 函数被调用时以空指针作为第一个参数，那么它的行为就和 `malloc` 函数一样；
* 如果 `realloc` 函数被调用时以 0 作为第二个参数，那么它会释放掉内存块；

## 释放内存空间
malloc 函数和其他内存分配函数所获得的内存块来自于堆，过于频繁的调用有可能耗尽堆而导致函数返回空指针。另外，程序有可能分配了内存，然后又丢失了块记录，导致空间浪费，例如：
```c
p = malloc(...);
q = malloc(...);
p = q;
```
上述前两条语句，p 和 q 分别指向一个内存块，第三条语句使得 p 和 q 指向同一个内存块，会造成原有的一个内存块再也无法被使用。对程序而言，不可再访问到的内存块被称为垃圾，留有垃圾的程序被称为存在内存泄漏。

### free 函数
`free` 函数原型定义在 `<stdlib.h>` 中:
```c
void free(void *ptr);
```
使用 `free` 函数只需把不再使用的内存块指针传递给函数，释放后的内存块可被 `malloc` 函数或其他内存分配函数重新使用。

需注意，`free` 函数的参数必须是之前由内存分配函数返回的指针。

### 悬空指针
`free` 函数可以释放不再使用的内存，但是会带来悬空指针问题。例如：
```c
char *p = malloc(4);
...
free(p);
...
strcpy(p, "abc");
```
调用 `free(p)` 释放 p 指向的内存块，但是不会改变 p 本身，这时如果忘记了 p 不再指向有效的内存块，就会引起错误。

# 声明
通常声明的格式为: `声明说明符 声明符;`

声明说明符包括：
1. **存储类型**:  包含 `auto`、`static`、`extern`、`register` 四种，在声明说明符中最多可以出现一种；
2. **类型限定符**: 包含 `const`、`volatile`、`restrict`(C99)三种，声明中可以包含多个类型限定符；
3. **类型说明符**: 关键字 `void`、`char`、`short`、`int`、`long`、`float`、`double`、`signed`、`unsigned`等，以及结构、联合、枚举的声明和 `typedef` 创建的类型名都是类型说明符，可以组合使用。
4. **函数说明符**: C99中引入，只有一个 `inline`。

上述说明符中，存储类型必须放在第一个，类型限定符和类型说明符跟在存储类型后面，对顺序没有强制要求，通常情况下将类型限定符放在类型说明符前面，即:
```
存储类型 -- 类型限定符 -- 类型说明符
```
例如：
```c
extern const unsigned long int a[10];  
```

## 存储类型
存储类型可用于变量及较小范围的函数和形式参数的说明。

### 变量的性质
C 程序中的每个变量具有以下 3 个性质：
1. **存储期限**：决定了为变量预留和内存被释放的时间。具有**自动存储期限**的变量在所属块被执行时获得内存单元，并在块终止时释放内存单元；具有**静态存储期限**的变量在程序运行期间一直占有同一个存储单元，允许变量无限期保留它的值。
2. **作用域**：指可以引用变量的程序文本范围。**块作用域**的变量从声明的地方一直到所在块的末尾都是可见的，**文件作用域**的变量从声明的地方一直到所在文件的末尾都是可见的。
3. **链接**：确定了程序不同部分可以共享变量的范围。具有**外部链接**的变量可以被程序中几个文件共享；具有**内部链接**的变量只能属于单独一个文件，但此文件中的函数可以共享变量；**无链接**变量不能被共享，只能属于某个函数。

变量的默认存储期限、作用域和链接依赖于变量声明的位置：
* 在块(包括函数体)内部声明的变量具有自动存储期限、块作用域，并且无链接；
* 在程序最外层声明的变量具有静态存储期限、文件作用域和外部链接。

例如：
```c
int i;  // 静态存储期限、文件作用域、外部链接
void f(void) {
    int j;  // 自动存储期限、块作用域、无链接
}
```

### auto 存储类型
`auto` 存储类型只对属于块的变量有效。

`auto` 存储类型具有自动存储期限、块作用域、无链接，对于在块内部声明的变量是默认的，通常不需要明确指明。

### static 存储类型
`static` 存储类型可用于全部变量。

在块外部，单词 `static` 说明变量具有内部链接；在块内部，`static` 把变量的存储期限从自动变成了静态。例如：
```c
static int i; // 静态存储期限、文件作用域、内部链接
void f(void) {
    static int j; // 静态存储期限、块作用域、无链接
}
```

### 函数的存储类型
函数的存储类型只可为 `extern` 或者 `static`。当函数存储类型为 `extern` 时，表示函数具有外部链接，允许其他文件调用此函数；当函数存储类型为 `static` 时，说明是内部链接，只能在定义函数的内部调用此函数。如果不指明函数的存储类型，那么会假设存储类型为外部链接。例如：
```c
extern int f(int i);    // 外部链接
static int g(int i);    // 内部链接
int h(int i);           // 外部链接
```

函数的形参具有和 `auto` 变量相同的性质：自动存储期限、块作用域、无链接。唯一能作用于形参的存储类型是 `register`。

### 小结
```c
int a;
extern int b;
static int c;

void f(int d, register int e) {
    auto int g;
    int h;
    static int i;
    extern int j;
    register int k;
}
```

| 名字  | 存储期限 |  作用域  | 链接 |
| ----- | :-----: | :----: | :----: |
|   a   |  静态   |  文件   | 外部   |
|   b   |  静态   |  文件   |        |
|   c   |  静态   |  文件   | 内部   |
|   d   |  自动   |  块     | 无     |
|   e   |  自动   |  块     | 无     |
|   f   |  自动   |  块     | 无     |
|   g   |  自动   |  块     | 无     |
|   h   |  自动   |  块     | 无     |
|   i   |  静态   |  块     | 无    |
|   j   |  静态   |  块     |       |
|   k   |  自动   |  块     | 无     |
