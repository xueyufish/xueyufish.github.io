---
layout:     post
title:      "重温 C 语言 (一)"
date:       2013-02-22
author:     "余修忞(xueyufish)"
keyword:    "程序语言, C, 余修忞, yuxiumin, xueyufish"
tags:
    - 程序语言
    - C
---

作为第一门接触的语言，C 语言在工作以后相对接触的就比较少。随着工作研究的不断深入，接触到的底层知识逐渐增多, 最近花时间重温了一下《C程序设计语言: 现代方法》这本书，对 C 语言相关知识做一个复习，在此也做一些整理。

# Hello World
创建 hello.c 文件
```c
#include <stdio.h>
int main()
{
    printf("Hello world! \n");
    return 0;
}
```
# 运行
使用 GCC 编译器进行编译运行：
```shell
$ gcc -o hello hello.c

$ ls
hello hello.c

$ ./hello
Hello world!
```

在将 C 源码转换成机器可执行程序时，C 语言通常包含预处理、编译、汇编、链接 4 个步骤：

1. **预处理**： 程序被交给预处理器，预处理器处理以`#`开头的指令。执行命令 `gcc -E hello.c -o hello.i`, 生成名为 hello.i 的预处理文件。

2. **编译**: 预处理后的程序进入编译器，编译器把程序翻译成目标代码。执行命令 `gcc -S hello.i -o hello.s`, 生成名为 hello.s 的编译文件。

3. **汇编**: 将汇编代码转变成可以执行的指令，生成目标文件。执行命令 `gcc -c hello.s -o hello.o`, 生成名为 hello.o 的目标文件。

4. **链接**: 把目标代码和所需的附加代码证号在一起，产生完整程序。执行命令 `gcc hello.o -o hello`, 生成名为 hello 的最终执行文件。

# 格式化输入/输出
## printf 函数
```
printf(格式串, 表达式1, 表达式2, ...)
```
`printf()` 函数的格式串中包含转换说明， C 语言不检查转换说明的数量是否和输出项的数量相匹配，也不会检查转换说明是否适合要显示项的数据类型，需要开发者自行保证。

转换说明可以用 `%m.pX`或者 `%-m.pX` 的格式，其中，m 和 p 都是可选的整数常量，X 是字母。如果省略 p, m 和 p 之间的小数点也要去掉。

```c
printf("hello\tworld\n");          // 包含制表符 \t 和 换行符 \n

printf("%d \n", 10);               // 打印整数 10
printf("%10d \n", 10);             // 最少显示 10 个字符, 少于 10 个时在右侧补齐
printf("%-10d \n", 10);            // 最少显示 10 个字符, 少于 10 个时在左侧补齐
printf("%10.3d \n", 10);           // 精度 3 指定了最少显示的数字个数，因为 10 少于 3 个，前面补一个 0

printf("%f \n", 314.52f);          // 打印浮点数, 可能会有精度丢失
printf("%10.3f \n", 314.52f);      // 3 表示了小数点后保留的数字个数 (默认 6 个)
printf("%10e \n", 314.52f);        // 指数表示
```

## scanf 函数
scanf 函数本质上和 printf 函数类似。但是使用时特别需要注意检查转换说明符的数量和输入变量的数量相匹配，还有就是通常需要在变量前加上符号 `&`。

# 选择语句
## if 语句
C 语言的 if 语句和 java 等语言类似:
```c
// if 语句
if (i % 2 == 0) {
    // ...
}

// if-else 语句
if (cond == 1) {
    //...
} else if (cond == 2){
    // ...
} else {
    // ...
}

// 三元表达式
k = (i % 2 == 0) ? i : j;
```

## 布尔值
C89 中，通常通过 TRUE、FALSE 这样的名字定义宏来表示布尔值:
```c
#define TRUE 1
#define FALSE 0
...
if (flag == TRUE) {
    // ...
}
```
C99 中提供了 _Bool 型：
```c
_Bool flag = 1;     // _Bool 是无符号整型, 可被赋值 0 或者 1
```
也可以通过引用 `<stdbool.h>`头来定义:
```c
#include <stdbool.h>
...
bool flag = true;      // 支持赋值 true 或者 false
printf("%d\n", flag);  // 输出 1
```

## switch 语句
```c
switch (i) {
    case 1:
        printf("one");
        break;
    case 2:
        printf("two");
        break;
    case 3:
        printf("three");
        break;
    case 4:
    case 5:
    case 6:
        printf("four, five, six");
        break;
    default:
        printf("invalid value!");
    }
```

# 循环
## while 语句
```c
int i = 1;

while (i < n) {
    i = i * 2;
}
```
还何以通过 `while(1)` 来实现一个无限循环。

## do 语句
```c
int i = 1;

do {
    i = i * 2;
} while (i < n);
```

## for 语句
经典的 for 语句:
```c
int i = 0;
for (i = 0; i < 10; i++) {
    printf("%d \n", i);
}
```
省略第一个表达式:
```c
int i = 0;
for (; i < 10; i++) {
    printf("%d \n", i);
}
```
无限循环:
```c
int i = 10;
for (;;) {
    printf("%d \n", i);
}
```
C99 中的 for 语句可以声明一个用于循环的变量：
```c
for (int i = 0; i < 10; i++) {
    printf("%d \n", i);
}
```

# 基本类型
## 整数类型
整数类型分为有符号整数 (signed) 和无符号整数 (unsigned)。有符号整数如果为正数或零，那么最左边的符号位为 0；如果是负整数，那么最左边的符号位为 1。默认情况下，C 语言中的整型变量都是有符号，最左边保留符号位。

十进制常量包含 0~9 中的数字，但是一定不能以 0 开头；八进制常量包含 0~7 中的数字，必须以 0 开头；十六进制数字 包含 0~9 中的数字和 a~f 中的字面，而且总是以 0x 开头。

C 语言提供了 `int`、`unsigned int`、`short`、`unsigned short`、`long`、`unsigned long` 六标准类型，C99 标准增加了 `long long int` 和 `unsinged long long int`类型。对于每种类型的范围，在标准库 `<limits.h>` 头文件中进行定义。  

定义常量时结尾可以加上字母强制编译器进行处理，规则如下：

| 类型 | 字母 | 说明 |
| ---- | ---- | --- | 
| long | L | 强制编译器把常量当做长整数 | 
| unsigned int | U | 强制编译器把常量当做无符号整数 |
| long long int | LL | 强制编译器把常量当做 long long int类型 | 
| unsigned long long int | ULL | 强制编译器把常量当做无符号 long long int类型 | 

读写整数时，根据类型不同，也需要不同的格式转换符：

| 类型 | 格式转换符 | 举例 |
| ---- | ---- | --- | 
| 无符号十进制数 | `%d` | `printf("%d\n", 10);` | 
| 无符号八进制数 | `%o` | `printf("%o\n", 10);` |
| 无符号六进制数 | `%x` | `printf("%x\n", 10);` | 
| 短整型 | `%hd` | `printf("%hd\n", (short)10);` | 
| 长整型 | `%ld` | `printf("%ld\n", 10L);` | 
| long long int | `%lld` | `printf("%lld\n", 10LL);` | 

## 浮点类型
C 语言提供三种浮点数: `float`(单精度浮点数)、`double`(双精度浮点数)和 `long double`(扩展精度浮点数)。默认情况下使用 `double` 类型。

C99 标准新增复数类型：`float _Complex`、`double _Complex`和 `long double _Complex`。

定义浮点常量时，对于 `float` 类型，可以在结尾增加 `f`,例如: `12.55f`; 对于 `long double` 类型，可在结尾增加 `L`, 例如：`12.55L`。

读写浮点数时，对于 `float` 类型，使用转换符 `%f`；对于 `double` 类型，使用转换符 `%lf`; 对于 `long double` 类型，使用转换符 `%Lf`;

## 类型定义
除了使用宏定义外，还可以使用类型定义:
```c
#define bool int;       // 宏定义方式
typedef int bool;       // 类型定义
int main() {
    bool flag = 1;
    if (falg) {
        ...
    }
}
```

## sizeof 运算符
`sizeof `表达式返回一个 `size_t` 类型，为一个无符号整型，代表指定类型所需空间的大小，类型可以为常量、变量或者表达式。

C89 中，使用 `%lu` 转换说明符打印 `sizeof` 返回的大小；C99 中, 使用 `%zu` 转换说明符。

```c
char a = 'a';
int b = 10;
long c = 1024L;
long long d = 1024LL;
float e = 10.58f;
double f = 12.56;
long double g = 55.77777L;

printf("%zu\n", sizeof(a)); // 1
printf("%zu\n", sizeof(b)); // 4
printf("%zu\n", sizeof(c)); // 8
printf("%zu\n", sizeof(d)); // 8
printf("%zu\n", sizeof(e)); // 4
printf("%zu\n", sizeof(f)); // 8
printf("%zu\n", sizeof(g)); // 16
```

# 数组
## 初始化
数组可以通过列表初始化，C99 中又引入了指定初始化:
```c
int a1[5] = {1, 2, 3, 4, 5};    // 初始化 5 个元素数组, 内容为 1，2，3，4，5        
int a2[5] = {1, 2, 3};          // 初始化 5 个元素数组, 内容为 1，2，3，0，0        
int a3[5] = {0};                // 初始化 5 个元素数组, 内容全部为 0
int a4[] = {1, 2, 3, 4, 5};     // 同 a1，省略长度，编译器根据初始化表达式长度计算
int a5[5] = {1, [2]=3, [4]=6};  // C99 指定初始化，内容为 1, 0, 3, 0, 6
int a6[] = {1, [2]=3, [4]=6};   // 同 a5，省略长度，编译器根据初始化表达式长度计算
```
## 下标操作
```c
for (int i = 0; i < 5; i++) {
    a5[i] = 0;
}

for (int i = 0; i < 5; i++) {
    printf("%d\n", a6[i]);
}
```
## 用于数组的 sizeof 运算符
sizeof 运算符可以被用来确定数组的大小，也可以用来确定数组元素的大小；`数组大小 / 数组元素大小 = 数组元素个数`。
```c
int arr[5] = {1, 2, 3, 4, 5};
unsigned s1 = sizeof(arr);              // 数组长度
unsigned s2 = sizeof(arr[0]);           // 数组元素长度
unsigned length = s1 / s2;              // 数组大小
printf("%d %d %d \n", s1, s2, length);
```
## 多维数组
`int arr[m][n]` 形式，声明一个 m 行 n 列的二维数组。其中 `arr[i]` 表示数组的第 i 行，`arr[i][j]` 表示此行中第 j 个元素。
```c
int arr[3][4] = {
    {1, 2,  3,  4},
    {5, 6,  7,  8},
    {9, 10, 11, 12},
};
for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 3; j++) {
        printf("%d\n", arr[i][j]);
    }
}
```

## 变长数组
C99 中引入变长数组，变长数组的数组长度在程序执行时计算得到，而不是在编译时指定。
```c
int i, n;
int arr[n];
scanf("%d", &n);

for (int i = 0; i < n; i++) {
    scanf("%d", &arr[i]);
}
for (int i = 0; i < n; i++) {
    printf("%d\n", arr[i]);
}
```

# 函数
直接用代码举例:
```c
// 函数定义: add 函数
int add(int a, int b) {
    return a + b;
}

int main() {
    int a ,b, sum;
    scanf("%d%d", &a, &b);

    // 函数调用，调用前面定义的 add 函数
    sum = add(a, b);
    printf("%d\n", sum);

    return 0;
}
```

C语言对于函数定义和调用的顺序没有明确要求，可以把函数定义放在调用之后，需要加上函数声明:
```c
// add 函数声明
int add(int a, int b);

int main() {
    int a ,b, sum;
    scanf("%d%d", &a, &b);

    // 函数调用，调用前面定义的 add 函数
    sum = add(a, b);
    printf("%d\n", sum);

    return 0;
}

// add 函数定义
int add(int a, int b) {
    return a + b;
}
```

main 函数中可以通过执行 `return` 语句退出，也可以调用`exit`函数退出, `exit` 函数在 `stdlib.h` 标准库中进行定义。调用 `exit` 函数时，可以用 `EXIT_SUCEESS` 和 `EXIT_FAILURE` 分别代替 0 和 1；
```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("%d\n", 123);
    exit(EXIT_SUCCESS);
}
```
# 程序结构
## 局部变量
在函数体内部声明的变量称为局部变量:
```c
int add(int a, int b) {
    int sum = a + b;    // 此处 sum 为局部变量
    return sum;
}
```
默认情况下，局部变量具有以下特性：
* **自动存储期限**：变量在函数返回时被回收；
* **块作用域**：变量作用域从声明点开始一直到变量末尾。

在局部变量中放置单词 `static` 可以使变量具有**静态存储期限**，静态存储期限在整个程序执行期间都会保留其值。
```c
void f(void) {
    static int i;   // 静态存储
    ...
}
```

## 外部变量
外部变量具有以下特性：
* **静态存储期限**
* **文件作用域**: 变量作用域从声明点开始一直到文件末尾，外部变量声明后的所有函数都可以访问到。
```c
int i;              // 外部变量
void f(void) {
    i = 10;
    ...
}
void g(void) {
    i = 20;
    ...
}
```

## C 程序构成建议
```
#include 指令
#define 指令
类型定义
外部变量声明
除 main 函数之外的函数原型声明
main 函数定义
除 main 函数之外的函数原型定义
```

***
C 语言的基本特性大概如此，下一篇将整理描述 C 语言的高级特性。