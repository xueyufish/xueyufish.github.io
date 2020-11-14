---
layout:     post
title:      "重温 C 语言 (二)"
date:       2013-03-06
author:     "余修忞(xueyufish)"
keyword:    "程序语言, C, 余修忞, yuxiumin, xueyufish"
tags:
    - 程序语言
    - C
---

# 指针
指针可以说是 C 语言中最让人迷惑也是最迷人的特性了。
## 指针变量
现代计算机将内存分为字节(byte)，每个字节存储8位(bit)信息。每个字节都有其唯一的地址，程序中的每个变量占有一个或多个字节的内存，把第一个字节的地址称为变量地址。

**指针变量**被用来存储地址信息，例如：用指针变量 p 存储变量 i 的地址信息，我们就说"p 指向 i"。更通俗点，指针就是地址，而指针变量就是存储地址的变量。其声明格式如下:
```c
int *p;
```

## 取址运算符
使用取址运算符 `&` 获取变量在内存中的地址：
```c
int i;
int *p = &i;
```
上述语句把 p 指向 i。

## 间接寻址运算符
间接寻址运算符 `*` 用于访问存储在对象中的内容：
```c
int i = 10;
int *p = &i;        // p 指向 i 
printf("%d\n", *p); // 获取 i 的值，输出 10
```

## 指针赋值
C 语言允许对两个相同类型的指针进行赋值操作:
```c
int i = 10, j = 20;
int *p = &i;
int *q = &j;

p = q;
printf("%d %d %d\n", *p, *q, j);    // p 和 q 都指向 j，输出 20 20 20

*p = 30;                            
printf("%d %d %d\n", *p, *q, j);    // 因为 p 和 q 都指向 j，修改 p 指向的变量的值，也就是修改 j 的值, 输出 30 30 30

*q = 40;                            
printf("%d %d %d\n", *p, *q, j);    // 因为 p 和 q 都指向 j，修改 q 指向的变量的值，也就是修改 j 的值, 输出 40 40 40
```

## 指针做为参数
```c
void swap(int *p, int *q);

int main() {
    int i = 10, j = 20;
    swap(&i, &j);
    printf("%d %d \n", i, j);
}

void swap(int *p, int *q) {
    int temp;
    temp = *p;
    *p = *q;
    *q = temp;
}
```
C 语言默认为用值进行参数传递，使用指针可以修改传递给函数的形参的值，在某些情况下非常方便。

可以使用 `const` 来表示函数不会改变指针参数所指向的对象。`const` 应该放置在形式参数声明中，后面紧跟着形式参数的类型声明:
```c
void f(const int *p) {
    *p = 0; // 编译时将报错
}
```

## 指针作为返回值
```c
int *max(int *a, int *b);

int main() {
    int i = 22, j = 33;
    int *k = max(&i, &j);
    printf("%d \n", *k);
}

int *max(int *a, int *b) {
    return *a > *b ? a : b;
}
```

## 指针的算术运算
1. 指针加上整数: 指针 `p` 加上整数 `j` 产生指向特定元素的指针，这个特定元素是 `p` 原先指向的元素的后 `j` 个位置。也就是说，如果指针 `p` 指向数组元素 `a[i]`, 那么 `p + j` 指向 `a[i+j]`;
2. 指针减去整数: 如果 `p` 指向数组元素 `a[i]`, 那么 `p-j` 就指向数组元素 `a[p-j]`;
3. 两个指针相减：两个指针相减，结果为指针之间的距离。因此，如果 `p` 指向 `a[i]` 且 `q` 指向 `a[j]`, 那么 `p-q` 就等于 `i-j`;
4. 指针比较: 当两个指针指向同一个数组时，可以用关系运算符进行指针比较;

## 数组名作为指针
可以用数组的名字作为指向数组第一个元素的指针：
```c
int a[10];
*a = 7;         // 修改数组第一个元素 a[0] 的值为 7
*(a+1) = 12;    // 修改数组第二个元素 a[1] 的值为 12
```
数组名作为指针常用于循环中：
```c
int sum, *p;

int a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
for (p = &a[0]; p < &a[10]; p++) {
    sum += *p;
}
printf("%d \n", sum);
```
可被替换为:
```c
int sum, *p;

int a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
for (p = a; p < a + 10; p++) {
    sum += *p;
}
printf("%d \n", sum);
```
此外，数组在传递给函数时，总是被视为指针，也会引起一些重要的结果：
1. 因为没有对数组本身的复制，所以作为实参的数组是可以被改变的；为了不改变，可以增加 `const` 修饰符 ；
2. 因为数组没有复制，所以传递数组所需的时间与数组大小无关，传递大数组也不会有不利影响；
3. 如果需要，可以把数组形式参数声明为指针；

# 字符串
## 字符串字面量
字符串字面量是一对双引号括起来的字符串序列(其中可以包含转义字符)：
```c
"Hello world!"
```
字符串字面量被做为数组来存储，当编译器遇到长度为 `n` 的字符串字面量时，会为其分配长度为 `n+1` 的内存空间；其中多出来的一个将被用来标志字符串末尾的额外字符(空字符)。空字符是一个所有位都为 `0` 的字符，用转义序列 `\0` 表示。

因为字符串字面量被做为数组存储，所以编译器会把它看做 `char *`类型指针，例如：
```c
char *p;
p = "abc";  // 使 p 指向字符串的第一个字符

char ch;
ch = "abc"[1];  // 取下标运算，ch 的值为 b
```

不同于字符常量，字符串字面量 `"a"` 用指针表示，而字符常量 `\`a`\` 用整数表示。

## 字符串变量
C 语言中对于字符串变量没有类似于 `java` 之类的 string 类型，只要保证字符串以空字符结尾，任何一维的字符数组都可以用来存储字符串。当声明用于存放字符串的字符数组时，要始终保证数组的长度比字符串的长度多一个字符。
```c
#define STR_LEN 80
char str[STR_LEN + 1];
```

字符串变量的初始化与数组类似：
```c
char str1[12] = "hello world";  // 初始化长度为 12 的字符数组，最后一个字符为空
char str2[12] = {'h', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd', '\0'}; // 初始化长度为 12 的字符数组，最后一个字符为空
char str3[] = "hello world";  // 省略长度，编译器自动计算长度
char str4[11] = "hello world";  // 结尾没有预留空字符的长度，不能被初始化为字符串变量
```

## 字符串库
### strcpy 函数
```c
char *strcpy(char *s1, const char *s2);
```
strcpy 函数 `<string.h>` 中声明, 把字符串 `s2` 复制给字符串 `s1`, 返回 `s1`, 即把 `s2` 中的字符复制到 `s1` 中，直到遇到第一个空字符为止。 

strcpy 函数对于 `s1` 的大小没有做有效性检查，如果 `s1` 大小为 `n`, `s2` 只要不大于 `n-1`，就会引起未知错误。

### strlen 函数
```c
size_t *strlen(const char *s);
```
strlen 函数返回字符串 `s` 的长度，即字符串 `s` 中第一个空字符之前字符的个数(不包含空字符)。
```c
int len;
char s[12] = "hello world";
printf("%d \n", strlen(s));     // 11

strcpy(s, "xueyufish");
printf("%d \n", strlen(s));     // 9
```

### strcat 函数
```c
char *strcat(char *s1, const char *s2);
```
strcat函数将字符串 s2 的内容追加到字符串 s1 的末尾，并且返回 s1。同 `strcpy` 函数类似，如果 s1 的长度不足以容纳 s2，将会引起未定义错误。

### strcmp 函数
```c
int strcmp(const char *s1, const char *s2);
```
strcmp 函数比较字符串 s1 和 s2，然后根据 s1 是小于、等于或者大于 s2，返回一个小于、等于或者大于 0 的值。

# 预处理器
预处理器的原理就是对于原始的 c/c++ 语言程序，执行相应的预处理指令，输出给编译器进行编译为机器码。
```
C 程序 -------> 预处理器 ------> 修改后的 C 程序 ----> 编译器 ----> 目标代码
```

## 预处理指令
大多数预处理指令属于下列三个之一：
* 宏定义：`#define` 指令定义一个宏，`#undef` 指令删除一个宏；
* 文件包含：`#include` 指令将一个指定文件的内容被包含到程序中；
* 条件编译：`#if`、`#ifdef`、`#ifndef`、`#elif`、`#else`、`#endif` 指令根据预处理器可以测试的条件来决定是否将文件包含到程序中。

## 宏定义
简单的宏定义如下:
```c
#define 标识符 替换列表

#define TRUE 1
#define STR_LEN 80
```
宏可以带参数：
```c
#define 标识符(x1, x2, x3, ... xn) 替换列表

#define Max(x,y) ((x) > (y) ? (x) : (y))
#define IS_EVEN(x) ((x) % 2 == 0)
```

宏定义可以包含两个专用运算符：`#` 和 `##`。编译器不会识别这两种运算符，他们会在预处理时被执行。

`#` 运算符将宏的一个参数转换为字符串字面量，它仅允许出现在带参数的宏的替换列表中:
```c
#define PRINT_IN(n) printf(#n " = %d\n", n)

int main() {
    int i = 10, j = 5;
    PRINT_IN(i / j);        // i / j = 2
}
```

`##` 运算符可以将两个记号(如标识符)粘合起来，成为一个记号，也被成为 "记号粘合"。如果其中一个操作数是宏参数，“粘合”会在相应的形式参数被相应的实际参数替换后发生, 例如：
```c
#include <stdio.h>

#define CONCATE_NUMBER(param) (10##param)

int main() {

    printf("concate number(123)=%d\n",CONCATE_NUMBER(123));     // output: concate number(123)=10123

    return 0;
}
```

宏的通用属性如下：
* 宏的替换列表可以包含对其他宏的调用：例如，可以用宏 PI 来定义宏 TWO_PI
```c
#define PI 3.14
#define TWO_PI (PI*2)
```

* 预处理器只会替换完整的记号，而不会替换记号的片断；
* 宏定义的作用范围通常到出现这个宏的文件末尾；
* 宏不可被定义两遍，除非新的宏与旧的宏定义一样；
* 宏可以使用 `#undef` 指令"取消定义"。

## 条件编译
条件编译指根据预处理器所执行的测试结果来包含或排除程序的片段。

### #if 指令和 #endif 指令
`#if` 指令的格式如下:
```c
#if 常量表达式
...
#endif
``` 
当处理器遇到 `#if` 指令时，会计算常量表达式的值。如果表达式为 `0`, 那么 `#if` 与 `#endif` 之间的行将在预处理过程中从程序中删除；否则，`#if` 与 `#endif` 之间的行将保留在程序中，继续留给编译器处理。例如：
```c
#define DEBUG 0

int main() {

#if DEBUG
    // DEBUG = 1 时输出, DEBUG = 0 时不输出
    printf("debug \n");     
#endif
    return 0;
}
```
需注意的是，`#if` 指令会把没有定义过的标识符当做是值为 `0` 的宏来对待。因此，上面例子中如果取消对于 `DEBUG` 宏的定义，不会产生错误消息，但是和 `DEBUG=0` 时一样不会显示输出。

### defined 运算符
`defined` 运算符用于条件编译标识符时，如果标识符是一个已经被定义的宏则返回 `1`, 否则返回 `0`。`defined` 运算符通常与 `#if` 指令结合使用，例如:
```c
#define DEBUG 1

int main() {

#if defined DEBUG
    // DEBUG 宏被定义时输出, DEBUG 宏未被定义时不输出
    printf("debug \n");
#endif
    return 0;
}
```

### #ifdef 指令和 #ifndef 指令
`#ifdef` 指令测试一个标识符是否已被定义为宏, `#ifndef` 指令测试一个标识符是否未被定义为宏:
```c
#define DEBUG 1

int main() {

#ifdef DEBUG
    // DEBUG 宏被定义时输出, DEBUG 宏未被定义时不输出
    printf("debug \n");
#endif
    return 0;
}
```
`#ifdef 标识符` 指令等价于 `#if defined(标识符)`, `#ifndef 标识符` 指令等价于 `#if !defined(标识符)`。

### #elif 指令和 #else 指令
`#elif` 指令和 `#else` 指令可与 `#if` 指令、`#ifdef` 指令、`#ifndef` 指令结合，测试一系列表达式：
```c
#if 表达式 1
(表达式 1 为 0 时包含的代码块)
#elif 表达式2
(表达式 1 为 0 但表达式 2 非 0 时包含的代码块)
#else 
(其他情况下包含的代码块)
#endif
```

### 条件编译的应用
以下为条件编译的常见应用场景：
* 编写在多台机器或多个操作系统之间可移植的程序;
  
    ```c
    #include <stdio.h>

    int main() {

    #if defined(__WIN32)
        printf("win32 \n");
    #elif defined(__APPLE__)
        printf("apple \n");
    #elif defined(__linux__)
        printf("linux \n");
    #else
        printf("other \n");
    #endif

        return 0;
    }
    ```

* 编写可用于不同编译器编译的程序；
* 为宏提供默认定义: 条件编译可以检测一个宏当前是否已被定义，如果没有，则提供一个默认定义。

    ```c
    #include <stdio.h>

    #ifndef BUFFER_SIZE
    #define BUFFER_SIZE 256
    #endif

    int main() {
        printf("bufferSize: %d \n", BUFFER_SIZE);
        return 0;
    }
    ```

* 临时屏蔽包含注释的代码(条件屏蔽)；

## 其他指令
### #error 指令
`#error` 指令格式如下: `#error message`。当预处理器遇到 `#error` 指令时，会显示一条包含 `message` 的出错消息。例如：
```c
#include <stdio.h>

#define BUFFER_SIZE 64

#if BUFFER_SIZE < 128
#error Buffer too small
#endif

int main() {
    printf("bufferSize: %d \n", BUFFER_SIZE);
    return 0;
}
```
预处理时会出现以下错误提示:
```shell
$ gcc -E test.c -o test.i
test.c:6:2: error: #error Buffer too small
 #error Buffer too small
  ^~~~~
```
