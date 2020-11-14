---
layout:     post
title:      "C++ Primer 学习笔记 (三) - 函数"
date:       2013-06-22
author:     "余修忞(xueyufish)"
keyword:    "程序语言, C++, 读书笔记, 余修忞, yuxiumin, xueyufish"
tags:
    - 程序语言
    - C++
    - 读书笔记
---
本文为整个系列的第三篇，也是《C++ Primer》第六章的关于函数笔记摘要。

# 函数基础
## 局部对象
在 C++ 中，名字有作用域，对象有声明周期: 
* 名字作用域是程序文本的一部分，名字在其中可见；
* 对象声明周期是程序执行过程中该对象存在的一段时间；

形参和函数体内部定义的变量统称为局部变量，它们仅在函数的作用域内可见，同时局部变量还会隐藏在外出作用域中的同名其他声明中。

在所有函数体之外定义的变量存在于程序的整个执行过程中，此类对象在程序启动时被创建，直到程序结束时被销毁。

### 自动对象
自动对象指只存在于块执行期间的对象。当块的执行结束后，块中创建的自动对象的值就变成未定义了。

形参为自动对象，函数开始时形参申请存储空间，一旦函数终止，形参就被销毁。

### 局部静态对象
局部静态对象在程序的执行路径第一次经过对象定义语句时初始化，并且知道程序终止时销毁，在此期间即使对象所在函数结束执行也不对对它有影响。

例如, 以下程序从 1 逐个打印到 10：
```cpp
#include <iostream>
using std::size_t;

size_t calc() {
	static size_t count = 0;
	return ++count;
}

int main() {
	for (size_t i=0;i<10;i++) {
		std::cout << calc() << std::endl;
	}
	return 0;
}
```

# 参数传递
形参的类型决定了形参和实参交互的方式。如果形参是引用类型，它将绑定到对应的实参上; 否则，将实参的值拷贝后赋给形参。

当形参是引用类型时, 我们说它对应的实参被引用传递或者函数被引用调用; 和其他引用一样，引用形参也是它绑定的对象的别名，即它对应的实参的别名。

当实参的值被拷贝给形参时，形参和实参是两个独立的对象，我们说这样的实参被值传递或者函数被值调用。

如下所示：

```cpp
#include <iostream>

using std::cout;
using std::endl;

// 传值参数
void value(int i) {
    i = 100;
}
// 传指针参数
void pointer(int *ip) {
    *ip = 0;
}
// 传引用参数
void ref(int &ref){
    ref = 0;
}

int main() {
    int a = 10;
    value(a);
    std::cout << "a: " << a << std::endl;   // 10

    int b = 10;
    pointer(&b);
    std::cout << "b: " << b << std::endl;   // 0

    int c = 10;
    ref(c);
    std::cout << "c: " << c << std::endl;   // 0
}
```

在实际使用时，因为相比于传值传递引用可以减少对象的复制成本，所以对于大对象应该尽可能使用传引用参数的方式。

## const 形参和实参
因为顶层 const 作用于对象本身，所以当形参为 const 时，用实参初始化形参会忽略掉顶层 const。 

当形参有顶层 const 时，传递给他常量对象或者非常量对象都可以:
```cpp
#include <iostream>
using std::cout;
using std::endl;

void test(const int i) {
    // 此处 i 可以被读取, 不能被写入
    std::cout <<  i << std::endl;
}

int main() {
    int a = 10;
    test(a);

    const int b = 10;
    test(b);
}
```

可以使用非常量初始化一个底层 const 对象，但是反过来不行; 同时一个普通的引用必须用同类型的对象初始化:
```cpp
    int i = 10;
    
    const int *cp = &i;     // 正确, 但是 cp 不能改变 i
    const int &r = i;       // 正确, 但是 r 不能改变 i
    const int &r2 = 42;     // 正确
    int *p = cp;            // 错误, p 的类型和 cp 的类型不匹配
    int &r3 = r;            // 错误, r3 的类型和 r 的类型不匹配
    int &r4 = 42;           // 错误，不能使用字面值初始化一个常量引用
```

## 数组形参
当为函数传递数组参数时，因为不能拷贝数组，所以无法以值传递的方式传递数组；另外，因为数组会被转换为指针，所以当为函数传递一个数组时，实际上传递的是指向数组首元素的指针。

尽管不能以值传递的方式传递数组，但可以把形参写成类似数组的形式:
```cpp
void print(const int*);
void print(const int[]);
void print(const int[10]);
```
上述三个函数是等价的，每个函数的唯一形参都是 `const int*`, 当编译器处理对 print 函数的调用时, 只检查传入的参数是否是 `const int*` 类型。

同样, 当函数不需要对数组进行写入时，应当把数组形参定义成指向 const 的指针; 只有当函数确实要改变元素值的时候，才把形参定义成指向非常量的指针。

因为 C++ 允许将变量定义成数组的引用，所以形参也可以是数组的引用，此时，引用形参绑定到实参上也就是绑定到数组上：
```cpp
#include <iostream>

using std::cout;
using std::endl;

void print(int (&arr)[10]) {
    for (auto elem : arr) {
        cout << elem << endl;
    }
}

int main() {
    int arr[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    print(arr);
}
```

对于多维数组，因为 C++ 中并没有真正意义上的多维数组，给多维数组传递参数时实际传递的是指向数组首元素的指针，例如:
```cpp
void print(int (*martix)[10], int rowSize);
```
上述语句中，martix 指向数组的首元素，该数组的元素是由 10 个整数构成的数组。

需要注意，`*martix` 两端的括号不可少:
```cpp
int *martix[10];        // 10 个指针构成的数组
int (*martix)[10];      // 指向含有 10 个整数的数组的指针
```

## 可变参函数
### initializer_list 形参
如果函数的实参数量未知但全部实参类型相同，可以使用 `initializer_list` 类型的形参。`initializer_list` 是一种标准库类型，用于表示某种特定类型的值的数组，`initializer_list` 定义在同名的头文件中。

与 `vector` 类似，`initializer_list` 也是一种模板类型，定义 `initializer_list` 时必须说明列表中所含元素的类型，也支持 `size()`、`begin()`、`end()` 等函数。不过，`initializer_list` 中的元素永远是常量值，无法改变 `initializer_list` 中元素的值:
```cpp
#include <iostream>

using namespace std;

void print_msg(initializer_list <string> il, int code) {
    for (auto beg = il.begin(); beg != il.end(); beg++) {
        cout << *beg << ", ";
    }
    cout << code;
    cout << endl;
}

int main() {
    print_msg({"a", "b", "c"}, 1);
    print_msg({"d", "e"}, 2);
}
```

### 省略符形参
省略符形参使用了名为 `varargs` 的 C 标准库函数，只能出现在形参列表的最后一个位置。例如:
```cpp
#include <iostream>
#include <cstdarg>

using namespace std;

int test(int count, ...) {
    int result = 0;

    va_list args;
    va_start(args, count);

    for (int i = 0; i < count; ++i)
        result += va_arg(args, int);

    va_end(args);
    return result;
}

int main() {
    cout << test(4, 25, 25, 50, 50) << endl;
    return 0;
}
```

省略符形参应该仅仅用于 C 和 C++ 通用的类型，因为大多数类类型的对象在传递给省略符形参时都无法正确拷贝。
