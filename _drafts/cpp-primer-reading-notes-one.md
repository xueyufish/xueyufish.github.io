---
layout:     post
title:      "C++ Primer 学习笔记 (一) - 变量和基本类型"
date:       2013-06-15
author:     "余修忞(xueyufish)"
keyword:    "程序语言, C++, 读书笔记, 余修忞, yuxiumin, xueyufish"
tags:
    - 程序语言
    - C++
    - 读书笔记
---

前阵对 C 语言进行了一下复习，最近紧接着对着《C++ Primer》重温了下 C++ 相关知识，继续用几篇文章做个笔记。逐渐也发现越接近底层越让人兴奋。

本文为整个系列的第二篇，也是《C++ Primer》第二章的笔记摘要。

# 基本内置类型
C++ 定义了一套包含算术类型和空类型在内的基本数据类型。
## 算术类型
算术类型分为两类: 整型(包含字符和布尔型) 和浮点型。算术类型的尺寸在不同机器上有所差别，下表列出了 C++ 标准规定的尺寸最小值，允许编译器赋予这些类型更大尺寸。

| 类型 | 含义 | 最小尺寸 |
| ---- | ---- | --- | 
| bool  | 布尔类型 | 未定义 | 
| char  | 字符 | 8 位 | 
| wchar_t | 宽字符 | 16 位 | 
| char16_t | Unicode 字符 | 16 位 | 
| char32_t | Unicode 字符 | 32 位 | 
| short | 短整型 | 16 位 | 
| int | 整型 | 16 位 | 
| long | 长整型 | 32 位 | 
| long long | 长整型 | 64 位 | 
| float  | 单精度浮点数 | 6 位有效数字 | 
| double  | 双精度浮点数 | 10 位有效数字 | 
| long double  | 扩展精度浮点数 | 10 位有效数字 | 

其中，`wchar_t` 类型用于确保可以存放机器最大扩展字符集中的任意一个字符；`char16_t` 和 `char32_t` 用来为 Unicode 字符集服务, 其他大致与 C 语言数据类型一致。

## 字面值常量
整型字面值、字符字面值、字符串字面值等与 C 中定义类似，参加下表：

**字符和字符串字面值**

| 前缀 | 含义 | 类型 |
| ---- | ---- | --- | 
| u | Unicode 16 字符 | char16_t | 
| U | Unicode 32 字符 | char32_t | 
| L | 宽字符 | wchar_t | 
| u8 | UTF-8(仅用于字符串字面常量) | char | 

**整型字面值**

| 后缀 | 最小匹配类型 |
| ---- | ---- | 
| u 或 U | unsigned |
| l 或 L | long | 
| ll 或 LL | long long | 

**浮点型字面值**

| 后缀 | 最小匹配类型 |
| ---- | ---- | 
| f 或 F | float |
| l 或 L | long double | 

true 和 false 是布尔类型的字面值，nullptr 是指针类型字面值。

# 变量
## 变量定义

c++ 语言的变量定义和其他语言差别不大，从 c++11 以后，开始支持列表初始化，比如声明一个名为 num 的 int 类型变量，可以如下：
```c++
int num = 0;
int num = {0};
int num{0};
int num(0);
```

关于默认初始化，需要注意的是内置类型变量未被显示初始化，它的值由定义的位置决定。定义于函数体外的变量初始化为 0，定义在函数体内部的内置类型变量不被初始化。一个未被初始化的内置类型变量的值是未定义的，如果试图访问或者以其他形式访问此类值将引发错误。

所以，**通常情况下建议初始化每一个内置类型的变量**。

## 变量声明和定义的关系

声明规定了变量的类型和名字，使得名字为程序所知；定义则负责创建与名字关联的实体，同时申请空间，也可能会为变量赋予初始值。

可以通过在变量前添加 extern 关键字来表示声明一个变量而不是定义：
```c++
extern int i;   // 声明 i 而非定义 i
int j;          // 声明并定义 j
```
对于 extern 关键字标记的变量，可以给与初始值，但是这样就抵消了 extern 的作用，也就不再是声明而是定义了:
```c++
extern int i = 10;  // 定义
```
此外，在函数体内部，如果试图初始化一个由 extern 关键字标记的变量，将引发错误。

## 标识符
C++ 标识符由字母、数字、下划线组成，标准对标识符长度没有严格限制，但对**大小写敏感**。

自定义标识符中不能连续出现两个下划线，也不能以 "下划线 + 大写字母" 的方式开头。此外，定义在函数体外的标识符不能以下划线开头。

# 复合类型
复合类型指基于其他类型定义的类型。这里先介绍引用和指针两种。

### 引用
引用为对象起了另外一个名字，引用类型引用另外一种类型。通过将声明符写成 `&d` 的形式来定义引用类型，其中 `d` 是声明的变量名:
```c
int i = 1024;
int &ref1 = i;   // ref1 指向 i (是 i 的另外一个名字)
int &ref2;       // 错误: 引用必须被初始化
```
定义引用时，程序会把引用和它的初始值绑定在一起，而不是像一般变量的初始化一样拷贝到新建的对象中。一旦初始化完成，引用将和它的初始值对象一直绑定在一起。因为无法令引用重新绑定到另一个对象，所以**引用必须初始化**。

**引用本身并非对象**，它只是已经存在的对象所起的另一个名字，给引用赋值，实际上是把值赋给了引用绑定的对象。同理，也不能定义引用的引用。

### 指针
指针是指向另外一种类型的复合类型。与引用类似，指针也提供了对其他对象的间接访问，指针与引用的不同之处主要如下：

* 指针本身就是一个对象，允许对指针赋值和拷贝，而且在指针的生命周期内可以先后指向几个不同的对象；
* 指针无须在定义时赋初始值。

定义指针类型的方法将指针写成 `*p` 的形式，其中 `p` 是变量名:
```c
int p, *ptr;  // p 是 int 类型对象，ptr 是指向 int 类型对象的指针
```

指针存放某个对象的地址，如果需要获取该地址需要使用取址运算符 `&`：
```c++
int i = 10;
int *ptr = &i;  // p 存放 i 的地址，或者说 p 为指向变量 i 的指针
```

指针的值 (地址) 应属于下列 4 种状态之一，试图拷贝或者以其他方式访问无效指针的值都将引发错误：

1. 指向一个对象；
2. 指向紧邻对象所占空间的下一个位置；
3. 空指针，即指针没有指向任何对象；
4. 无效指针，即上述情况外的其他值。

如果指针指向一个对象，可以使用解引用符 (操作符 *) 来访问该对象：
```c++
int i = 10;
int *p = &i;        // p 存放 i 的地址，或者说 p 为指向变量 i 的指针
cout << *p << endl; // 由符号 * 得出指针 p 所指的对象, 输出 10
cout << i << endl;  // 输出 10
```

如果给解引用的对象赋值，实际上也就是给指针所指向的对象赋值：
```c++
int i = 10;
int *p = &i;
*p = 20;            // 解引用对象 p 赋值 20
cout << *p << endl; // 输出 20
cout << i << endl;  // 输出 20，指针所指向的对象 i 也被赋值
```

只要指针具有合法值，就可以应用在条件表达式中：如果指针值是 0, 条件为 false, 否则为 true。

对比两个类型相同的指针，可以使用相等操作符 (=) 和不相等操作符 (!=)，比较结果是布尔类型。

如果两个指针存放地址相同，则它们相等；反之则不相等。对于地址相等，通常包含三种情况：
1. 都为空
2. 都指向同一个对象 (3) 
3. 都指向同一个对象的下一个地址。

**空指针 (null pointer)** 不指向任何对象，在使用一个指针前代码可以先检查它是否为空。可以通过以下几种方法生成空指针。

* 通过 C++11 中的 `nullptr` 字面值初始化 (推荐)：
```c
int *p = nullptr;
``` 
* 直接将指针初始化为字面常量 0:
```c
int *p = 0;
```
* 通过预处理变量 `NULL`:
```c++
#include <cstdlib.h>
int *p = NULL;
```

`void*` 是一种特殊类型的指针，可用于存放任意对象地址。利用 `void*` 指针，可以用来和其他指针相比较、作为函数的输入输出，赋给另外一个 `void*` 类型指针。但是不能直接操作 `void*` 类型指针所指的对象。

可以用 `**` 表示指向指针的指针，`***` 表示指向指针的指针的指针，以此类推：
```c
int i = 10;                 
int *ptr = &i;              // ptr 为指向 int 类型的数
int **pptr = &ptr;          // pptr 为指向 int 类型的指针

cout << i << endl;          // 输出 int 类型数，等于 10
cout << *ptr << endl;       // 解引用 int 类型指针得到 int 类型数，输出 10
cout << **pptr << endl;     // 解引用指向指针的指针得到一个指针，再次解引用得到 int 类型数，输出 10
```

因为指针本身也是对象，所以存在对指针的引用：
```c
int i = 10;
int *p;                     // p 为指向 int 类型指针
int *&r = p;                // r 是一个对指针 p 的引用

r = &i;                     // 因为 r 引用了一个指针，所以给 r 赋值 &i 就是令 p 指向 i
*r = 20;                    // 解引用 r 得到 i, 也就是 p 指向的对象，再将 i 的值改为 20

cout << *r << endl;         // 此时解引用 r 的值为 20
cout << *p << endl;         // 此时解引用 p 的值为和 r 一样，也为 20
cout << i << endl;          // 此时 i 的值也为 20
```

## const 限定符
C++ 中使用 `const` 限定符定义的变量必须被初始化。

默认情况下，`const` 对象被设定为仅在文件内有效。当多个文件中出现了同名的 `const` 变量时，等同于在不同文件中分别定义了独立变量。如果想在多个文件之间共享 `const` 对象，必须在变量的定义之前添加 `extern` 关键字。

### const 引用
把引用绑定到 const 对象上，称为对常量的引用。与普通引用不同，**对常量的引用不能被用作修改它所绑定的对象**。
```c++
int i = 10;
const int ci = 1024;    
const int &r1 = ci;     // 正确, 引用及其对应的对象都是常量
const int &r2 = i;      // 正确, 允许将常量引用绑定非常量对象、字面值甚至一般表达式
r1 = 42;                // 错误, r1 是对常量的引用
int &r3 = ci;           // 错误, 试图让一个非常量引用指向一个常量对象
```

### 指针和 const
类似于常量引用，**指向常量的指针**不能用于改变其所指对象的值。要想存放常量对象地址，只能使用指向常量的指针：
```c
const double pi = 3.14;     // pi 为 double 类型常量
double *ptr = &pi;          // 错误: ptr 为普通类型指针
const double *cptr = &pi;   // 正确
*cptr = 42;                 // 错误: 不能给 *cptr 赋值
```
和常量引用一样，指向常量的指针也没有规定其所指对象必须是一个常量。

所谓指向常量的指针仅仅要求不能通过该指针改变对象的值，而没有规定对象的值不能通过其他途径改变：
```c
double pi = 3.14;           
const double *ptr = &pi;    // 正确, 指向常量的指针也可以指向非常量对象
pi = 3.24;                  // 正确, 不可以通过常量指针修改对象的值，但是可以修改常量指针指向非常量对象的值
```

同其他类型一样，允许把指针定义为常量。**常量指针**必须初始化, 且一旦初始化完成以后它的值(存放在指针中的地址)就不能再改变。

把 `*` 放在 `const` 关键字之前用来说明指针是一个常量：
```c
int i = 10;
int *const ptr = &i;            // ptr 将一直指向 i
const double pi = 3.14;
const double *const pip = &pi;  // pip 是一个指向常量对象的常量指针
```

### 顶层 const
顶层 const 表示指针本身是个常量，而底层 const 表示指针所指的对象是个常量。更一般的，顶层 const 可以表示任意的对象是常量，这一点对任何数据类型都使用，如算术类型、类、指针等。底层 const 则与指针和引用等复合类型的基本类型部分有关。比较特殊的是指针既可以是顶层 const 又可以是底层 const。
```c++
int i = 0;
int *const p1 = &i;         // 不能改变 p1 的值，为顶层 const
const int ci = 42;          // 不能改变 ci 的值，为顶层 const
const int *p2 = &ci;        // p2 为指向产量的指针，允许改变 p2 的值，为底层 const
const int *const p3 = p2;   // 右边的 const 是顶层 const， 左边 const 是底层 const
const int &r = ci;          // 用于声明引用的 const 都是底层 const
```

当执行对象拷贝操作时，常量是顶层 const 还是底层 const 区别明显。顶层 const 执行拷贝操作不会改变被拷贝对象的值，因此拷入和拷出的对象是否是常量都没什么影响:
```c++
i = ci;     // 正确，拷贝 ci 的值，ci 是一个顶层 const，对此操作无影响
p2 = p3;    // 正确, p2 和 p3 指向的对象类型相同，p3 顶层 const 的部分不受影响
```
但是，对底层 const 执行拷贝操作时，拷入和拷出的对象必须具有相同的底层 const 资格，或者两个对象的数据类型必须能够转换；一般来说，非常量可以转换为常量，反之则不行:
```c++
int *p = p3;                // 错误，p3 包含底层 const 定义，而 p 没有
p2 = p3;                    // 正确，p2 和 p3 都是底层 const
p2 = &i;                    // 正确，int* 能转换成 const int*
int &r = ci;                // 错误，普通的 int& 不能绑定到 int 常量上
const int &r2 = i;          // 正确，const int& 可以绑定到一个普通的 int 上
```

### constexpr 和常量表达式
常量表达式指值不会改变并且在编译过程就能得到计算结果的表达式。

一个对象(或表达式)是不是常量表达式由它的数据类型和初始值共同决定，例如：
```cpp
const int max_files = 20;       // max_files 是常量表达式
const int limit = max_files;    // limit 是常量表达式
int staff_size = 30;            // staff_size 不是常量表达式
const int sz = get_size();      // sz 不是常量表达式
```

C++11 中，允许将变量声明为 `constexpr` 类型以便由编译器来验证变量的值是否是一个常量表达式。声明为 `constexpr` 的变量一定是一个常量，而且必须用常量表达式初始化:
```cpp
constexpr int mf = 20;          // 20 是常量表达式
constexpr int limit = mf + 1;   // mf + 1 是常量表达式
constexpr int sz = size();      // 只有当 size 是一个 constexpr 函数时才是一条正确的声明
```

通常情况下，如果认定变量是一个常量表达式，就应当把它声明成 `constexpr` 类型。

对于指针来说，一个 `constexpr` 指针的初始值必须是 `nullptr` 或者 `0`, 或者是存储于某个固定地址中的对象。

函数体内定义的变量一般并非存放在固定的地址中，因此 `constexpr` 指针不能指向这样的变量；相反，定义于所有函数体之外的对象其地址固定不变，能用来初始化 `constexpr` 指针。

在 `constexpr` 声明中如果定义了一个指针，限定符 `constexpr` 仅对指针有效，与指针所指对象无关：
```cpp
const int *p = nullptr;         // p 是一个指向整型常量的指针
constexpr int *q = nullptr;     // q 是一个指向整数的常量指针 (顶层const)
```

## 处理类型
### 类型别名
类型别名是一个名字，它是某种类型的同义词。有两种方法定义类型别名：

1. 传统方法, 使用 `typedef` 关键字: 
```cpp
typedef int *int_ptr
int_ptr p = nullptr;   //Int_Ptr是一个int指针类型，这里定义了一个int型指针P
```  

2. 使用别名声明, 把等号左侧的名字规定成等号右侧类型的别名:
```cpp
using int_ptr = int*;
int_ptr p = nullptr; 
```

如果某个类型别名指代的是复合类型或常量，使用时需要特别注意。例如下面的声明语句用到了类型 pstring，它实际上是类型 `char*` 的别名：
```cpp
typedef char *pstring;  
const pstring cstr = 0; // cstr 是指向 char 的常量指针  
const pstring *ps;      // ps 是一个指针，它的对象是指向 char 的常量指针
```
上述两条声明语句的基本数据类型都是 const pstring，const 是对给定类型的修饰。pstring 实际上是指向 char 的指针，因此，const pstring 就是指向 char 的常量指针，而非指向常量字符的指针。当遇到一条使用了类型别名的声明语句时，往往会错误地尝试把类型别名替换成它本来的样子，以理解该语句的含义：
```cpp
const char *cstr = 0;   // 是对 const pstring cstr 的错误理解 
```
这种理解是错误的。声明语句中用到 pstring 时，其基本数据类型是指针。可是用 char* 重写了声明语句后，数据类型就变成了char，*成为了声明符的一部分。这样改写的结果是，const char成了基本数据类型。前后两种声明含义截然不同，前者声明了一个指向 char 的常量指针，改写后的形式则声明了一个指向 const char 的指针。

### auto 类型说明符
C++11 标准引入了 auto 类型说明符，使得编译器能够替我们通过初始值来推算变量的类型:
```cpp
//由 vall 和 vall2 相加的结果可以推断出 item 的类型
auto item = vall + vall2;	// item 初始化为 vall 和 vall2 相加的结果
```

使用 auto 也能在一条语句中声明多个变量，因为一条声明语句只能有一个基本数据类型, 所以语句中所有变量的初始基本数据类型都必须一样:
```cpp
auto i = 0, *p=&i;	        // 正确:i 是整数, p 是整形指针
auto sz=0, pi=3.14;	        // 错误: sz 和 pi 的类型不一致
```

编译器推断出来的 auto 类型有时候和初始值的类型并不完全一样，编译器会适当的改变结果类型来符合初始规则:

* 当对引用使用 auto，因为使用引用其实是使用引用的对象，特别是当引用作为初始值时，真正参与初始化的是引用对象的值，此时编译器以引用对象的类型作为 auto 的类型：
```cpp
int i = 0, &r = i;    
auto a = r;                 // a是一个整数(r是i的别名，而i是一个整数)
```

* auto 一般会忽略顶层 const，保留底层 const:
```cpp
const int ci = i, &cr = ci;
auto b = ci;                // b是一个整数(ci的顶层const特性被忽略)
auto c = cr;                // c是一个整数(cr是ci的别名, ci本身是一个顶层const)
auto d = &i；               // d是一个整型指针(整数的地址就是指向整数的指针)
auto e = &ci;               // e是一个指向整数常量的指针(对常量取址是一种底层const)
```

* 如果希望 auto 推断出来的类型是一个顶层const，则需要明确指出:
```cpp
const auto f = ci;          // ci 的推演类型是 int, f 是 const int
```

* 对于引用的类型设为 auto，原来的初始化规则依然适用：
```cpp
auto &g = ci;               // g是一个整型常量引用，绑定到ci
auto &h = 42;               // 错误: 不能为非常量引用绑定字面值
const auto &j = 42;         // 正确，可以为常量引用绑定字面值
```

设置一个类型为 auto 引用时，初始值中的顶层 const 属性仍然保留。如果给初始值绑定一个引用，则此时的常量就不是顶层常量了。

### decltype 类型指示符
C++11 标准引入了类型说明符 `decltype`，它的作用是选择并返回操作数的数据类型。在此过程中，编译器分析表达式并得到它的类型，却不实际计算表达式的值：
```cpp
decltype(f()) sum=x;            // sum 的类型就是函数f的返回类型
```

decltype 处理顶层 const 和引用的方式与 auto 有些不同。如果 decltype 使用的表达式是一个变量，则 decltype 返回该变量的类型(包括顶层const和引用在内)：
```cpp
const int ci = 0, &cj = ci;
decltype(ci) x = 0;             // x 的类型是 const int
decltype(cj) y = x;             // y 的类型是 const int&, y 绑定到变量 x
decltype(cj) z;                 // 错误，z是一个引用const int&, 必须初始化
```

因为cj是一个引用，decltype(cj)的结果就是引用类型，因此作为引用的z必须被初始化。

如果decltype使用的表达式不是一个变量，则decltype返回表达式结果对应的类型。有些表达式将向decltype返回一个引用类型。一般来说当这种情况发生时，意味着该表达式的结果对象能作为一条赋值语句的左值：

```cpp
int i = 42, *p = &i, &r = i;
decltype(r+0) b;    //正确：加法的结果是int，因此b是一个（未初始化的）int
decltype(*p) c;     //错误，c是int&，必须初始化
```
因为r是一个引用，因此decltype(r)的结果是引用类型。如果想让结果是r所指的类型，可以把r作为表达式的一部分，如r+0，显然这个表达式的结果将是一个具体值而非一个引用。

另一方面，如果表达式的内容是解引用操作，则decltype将得到引用类型。正如我们所熟悉的那样，解引用指针可以得到指针所指的对象，而且还能给这个对象赋值。因此，decltype(*p)的结果类型就是int&，而非int。

decltype和auto的另一个重要的区别是，decltype的结果类型与表达式密切相关。有一种情况需要特别注意：对于decltype所用的表达式来说，如果变量加上了一对括号，则得到的类型与不加括号时会有很大的不同。如果decltype使用的是一个不加括号的变量，则得到的结果就是该变量的类型；如果给变量加上一层或多层括号，编译器就会把它当成是一个表达式。变量是一种可以作为赋值语句左值的特殊表达式，所以这样的decltype就会得到引用类型：
```cpp
//decltype的表达式如果是加上括号的变量，结果将是引用
decltype((i)) d;     //错误：d是int&，必须初始化
decltype(i)   e;     //正确：e是一个（未初始化的）int
```

切记: decltype((variable))（注意是双括号）的结果永远是引用，而decltype(variable)结果只有当variable本身是一个引用时才是引用。