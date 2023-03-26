---
layout:     post
title:      "C++ Primer 学习笔记 (二) - 字符串、向量和数组"
date:       2013-06-22
author:     "xueyufish"
keyword:    "程序语言, C++, 读书笔记, xueyufish"
tags:
    - 程序语言
    - C++
    - 读书笔记
---
本文为整个系列的第二篇，也是《C++ Primer》第三章的笔记摘要。

# 名字空间的 using 声明
除了使用 `#include` 指令外，还可以使用 `using` 声明引入命名空间成员，例如:
```cpp
#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main() {
  int a, b;
  cin >> a >> b;
  cout << "The sum of" << a << " and " << b << " is " << a + b << endl;
  return 0;
};
```
需要注意的，每个名字(上例中的 `cin`、`cout`、`endl`)都需要独立的声明，也不应该在头文件中包含 `using` 声明。

# 标准库类型 string
标准库类型 `string` 表示可变长的字符序列。使用 `string` 类型必须包含 `string` 头文件。作为标准一部分，`string` 定义在命名空间 `std` 中:
```cpp
#include <string>
using std::string
```

## 定义和初始化string对象
初始化string对象的方式如下：
```cpp
string s1;                  // 默认初始化, s1是一个空串
string s2(s1);              // s2是s1的副本
string s2 = s1;             // 等价于s2(s1)，s2是s1的副本
string s3("value");         // s3是字面值"value"的副本, 除了字面值最后的那个空字符外
string s3 = "value";        // 等价于s3("value)，s3是字面值"value"的副本
string s4(n, 'c');          // 把s4初始化为由连续n个字符c组成的串
```

如果使用等号初始化一个变量，执行的是拷贝初始化，编译器把等号右侧的初始值拷贝到新创建的对象中；如果不使用等号，执行的是直接初始化。

当初始值只有一个时，使用直接初始化或拷贝初始化都行。如果像上面 s4 那样初始化需要用到的值有多个，一般来说使用直接初始化，因为此时如果使用拷贝初始化需要显示的创建一个临时对象用于拷贝。例如，假设创建10个字符的拷贝初始化，则实际操作为：
```cpp
string temp(10, 'c');
string s4 = temp;
```

## string 对象上的操作
string 上的操作主要如下:

| 操作 | 说明 | 
| ---- | ---- | 
| os << s | 将s写到输出流os中，返回os |
| is >> s | 从is中读取字符串赋给s, 字符串以空白分隔，返回is |
| getline(is, s) | 从is中读取一行赋给s, 返回is |                   
| s.empty() | s为空返回true, 否则返回false | 
| s.size() | 返回s中字符的个数 |
| s[n] | 返回s中第n个字符的引用，位置n从0计起 |
| s1 + s2 | 返回s1和s2连接后的结果 |
| s1 = s2 | 用s2的副本代替s1中原来的字符 |
| s1 == s2 | 如果s1和s2中所含的字符完全一样，则他们相等; string 对象的相等性判断对大小写敏感 |
| s1 != s1 | |
| <, <=, >, >= | 利用字符在字典中的顺序进行比较，且对字母的大小写敏感 |

### 读写string对象
string 对象可以使用 I/O 操作符来进行读写。在使用标准输入进行读取时，`string` 对象会自动忽略开头的空白(空格符、换行符、制表符等)，并从第一个真正的字符开始读起，直到遇见下一处空白为止：
```cpp
#include <iostream>
using std::cin;
using std::cout; using std::endl;
using std::string;

int main(void) {
  string s;               // 空字符串
  cin >> s;               // 将 string 对象读入 s, 直到空白停止
  cout << s << endl;      // 输出 s
  return 0;
}
```
对于以上程序，输入 "aaa bbb ccc", 终端将输出 "aaa"

### 读取未知数量的string对象
```cpp
#include <iostream>
using std::cin;
using std::cout; using std::endl;
using std::string;

int main(void) {
  string word;
  while (cin >> word) {
    cout << word << endl;
  }
  return 0;
}
```
可以使用 `while` 循环持续读取输入的 string 对象，当遇到结束标记或者非法输入时结束。如果输入中包含空白符，输出中将换行。

### 使用 getline 读取一整行
如果希望能在最终得到的字符串中包含空白字符，应该用 `getline` 函数代替原来的 `>>` 运算符。`getline` 函数的参数是一个输入流和一个 `string` 对象，函数从给定的输入流读取内容，直到遇到换行符为止(换行符也被读入), 然后把所读的内容存入到那个 `string` 对象中(不存换行符)。

`getline` 只要一遇到换行符就结束读取操作并返回结果，如果一开始就是换行符，那么所得的结果是个空的 `string`。

例如:
```cpp
#include <iostream>
using std::cin;
using std::cout; using std::endl;
using std::string;

int main(void) {
  string line;
  while (getline(cin, line)) {
    cout << line << endl;
  }
  return 0;
}
```

### string::size_type 类型
`size` 函数可以返回 string 对象的长度(即string对象中字符的个数), `size` 函数的返回是一个 `size_type` 类型的值。`size_type` 类型是一个无符号类型的值，所有用于存放 string 类的 `size` 函数返回值的变量，都应该是 `string::size_type` 类型的。

在 C++11 标准中，可以通过 `auto` 或者 `decltype` 来推断变量类型：
```cpp
auto len = line.size();     // len 类型是 string::size_type
```
由于 `size` 函数返回的是一个无符号整数，因此，如果在表达式中混用了带符号数和无符号数可能产生意向不到的结果。所以，**如果一条表达式中已经有了 size() 函数，就不要再使用 int 了, 这样可以避免混用 int 和 unsigned 可能带来的问题**。

### 比较 string 对象
string 类定义了几种比较字符串的运算符，这些运算符逐一比较字符串对象中的字符，并且对大小写敏感:
* 相等运算符 ( `==` 和 `!=`) 分别检验两个 string 对象相等或不相等，string 对象相等意味着长度相等并且所包含的字符也完全相同；
* 关系运算符 ( `>`、`>=`、`<`、`<=`) 按照大小写敏感的字典顺序比较：
    1. 如果两个 string 长度不同，且较短的每个字符都与较长的 string 对应位置上字符相同，就说较短的 string 对象小于较长的 string 对象；
    2. 如果两个 string 对象在某些对应位置上不一致，则 string 对象比较的结果就是 string 对象中第一个相异字符比较的结果。

例如：
```cpp
#include <iostream>
using std::cout; using std::endl;
using std::string;

int main(void) {
  string s1("Hello");
  string s2("Hello world");
  string s3("Haha");
  cout << (s1 < s2) << endl;        // 1
  cout << (s1 < s3) << endl;        // 0
  cout << (s2 < s3) << endl;        // 0
  return 0;
}
```

### string 对象相加
两个 string 对象相加可以得到另一个 string 对象。
当把 string 对象和字符字面值及字符串字面值相加时，必须确保每个加法运算符两侧的对象至少有一个是 string:
```cpp
string s1 = "hello", s2 = "world";
string s3 = s1 + ", " + s3;
string s4 = s1 + ",";               // 合法
string s5 = "hello " + ", ";        // 非法，两个运算对象都不是 string
```

## 处理 string 对象中的字符
在 `cttype` 头中定义了一组标准库函数，用于处理单个字符，主要如下：

| 函数名 | 说明 | 
| ---- | ---- | 
| isalnum(c) | 当 c 是字母或数字时为真 |
| isalpha(c) | 当 c 是字母时为真 |
| iscntrl(c) | 当 c 是控制字符时为真 |
| isdigit(c) | 当 c 是数字时为真 |
| isgraph(c) | 当 c 不是空格但可打印时为真 |
| islower(c) | 当 c 是小写字母时为真 |
| isprint(c) | 当 c 是可打印字符时为真 |
| ispunct(c) | 当 c 是标点符号时为真 |
| isspace(c) | 当 c 是空白时为真 |
| isupper(c) | 当 c 是大写字母时为真 |
| isxdigit(c) | 当 c 是十六进制数字时为真 |
| tolower(c) | 如果 c 是大写字母，输出对应的小写字母，否则原样输出 c |
| toupper(c) | 如果 c 是小写字母，输出对应的大写字母，否则原样输出 c |

如果要对 string 对象中的每个字符进行操作，最好是使用 C++11 中提供的 **范围 for** 语句。例如：
```cpp
#include <iostream>
using std::cout; using std::endl;
using std::string;

int main(void) {
  string s("Hello world!!");
  decltype(s.size()) punct_cnt = 0;
  for (auto c : s) {
    if (ispunct(c)) {
      ++punct_cnt;
    }
  }
  cout << punct_cnt << " punctuation characters in " << s << endl;
  return 0;
}
```
也可以使用范围 for 来改变字符串中的字符，例如：
```cpp
#include <iostream>
using std::cout; using std::endl;
using std::string;

int main(void) {
  string s("hello world!");
  for (auto &c:s) {            // &c 为引用
    c = toupper(c);
  }
  cout << s << endl;            // HELLO WORLD
  return 0;
}
```

# 标准库类型 vector
标准库类型 vector 表示对象的集合，其中所有对象的类型都相同。集合中的每个对象都有一个与之对应的索引，索引用于访问对象。 vector 常被称作容器。

要使用 vector, 必须包含必要的头文件如下:
```cpp
#include <vector>
using std::vector
```

vector 能容纳绝大多数类型的对象作为其元素，但因为引用不是对象，所以不存在包含引用的 vector。除此之外，其他大多数内置类型都可以构成 vector 对象，甚至组成 vector 的元素也可以是 vector。

## 定义和初始化 vector
定义 vector 对象的常用方法如下：
```cpp
vector<T> v1;               // v1 是一个空 vector, 它潜在的元素是 T 类型, 执行默认初始化
vector<T> v2(v1);           // v2 中包含 v1 中所有元素的副本
vector<T> v2 = v1;          // 等价于 v2(v1), v2 中包含 v1 中所有元素的副本
vector<T> v3(n, val);       // v3 包含了 n 个重复的元素, 每个元素的值都是 val
vector<T> v4(n);            // v4 包含了 n 个重复地执行了值初始化的对象
vector<T> v5{a,b,c...};     // v5 包含了初始值个数的元素, 每个元素被赋予相应的初始值
vector<T> v5={a,b,c...};    // 等价于 v5{a,b,c...}
```

C++11 中允许通过列表初始化方法对 vector 进行初始化:
```cpp
vector<string> articles = {"a", "an", "the"};
```

## 向 vector 中添加元素
除了直接初始化以为，更常见的方式是创建一个空的 vector，在运行时利用 vector 的成员函数 push_back 向其中添加元素。例如：
```cpp
vector<int> v;
for(int i=0; i!=100; ++i) {
  v.push_back(i);
}
```
需注意，如果循环体内部包含有向 vector 对象添加元素的语句，则不能使用范围 for 循环。

# 迭代器
类似于指针，迭代器也提供了对对象的间接访问。迭代器对象是容器中的元素或 string 对象中的字符。迭代器有有效和无效之分，有效的迭代器指向某个元素，或者容器中尾元素的下一个位置，其他情况都属于无效。

## 使用迭代器
拥有迭代器的类型都拥有名为 begin 和 end 的成员，其中 begin 成员返回指向第一个元素(或第一个字符)的迭代器，end 成员返回指向容器尾元素下一位置的迭代器。

标准容器迭代器支持以下运算符：

| 操作名 | 说明 | 
| ---- | ---- | 
| *iter | 返回迭代器 iter 所指元素的引用 |
| iter -> mem | 解引用 iter 并获取该元素名为 mem 的成员，等价于 (*iter).mem |
| ++iter | 令 iter 指向容器中的下一个元素 |
| --iter | 令 iter 指向容器中的上一个元素 |
| iter1 == iter2 | 判断两个迭代器是否相等，如果两个迭代器指向同一个元素或者是同一个容器的尾后迭代器，则相等; 否则不相等 |

例如，下列程序作为演示，使用迭代器将字符串首字母改为大写，并且逐字符打印:
```cpp
#include <iostream>
using std::cout; using std::endl;
using std::string;

int main() {
  string s("hello world");
  if (s.begin() != s.end()) {
    auto it = s.begin();
    *it = toupper(*it);
  }
  for (auto it = s.begin(); it != s.end(); it++) {
    cout << *it << endl;
  }
  return 0;
}
```

拥有迭代器的标准库类型使用 `iterator` 和 `const_iterator` 来表示迭代器类型。`const_iterator` 能读取但不能修改它所指的元素值，`iterator` 可读可写。例如：
```cpp
vector<int>::iterator it;          // it 能读写 vector<int> 的元素
string::iterator it2;              // it2 能读写 string 对象中的字符

vector<int>::const_iterator it3;  // it3 只能读元素, 不能写元素
string::const_iterator it4;       // it4 只能读字符, 不能写字符
```

begin 和 end 返回的具体类型由对象是否是常量决定，如果是常量，begin 和 end 返回 `const_iterator`; 如果不是常量，返回 `iterator`。例如：
```cpp
vector<int> v;
const vector<int> cv;
auto it1 = v.begin();   // it1 的类型是 vector<int>::iterator
auto it2 = cv.begin();  // it2 的类型是 vector<int>::const_iterator
```
为了便于专门得到 const_iterator 类型的返回值，C++11 引入了两个新函数，分别是 cbegin 和 cend:
```cpp
auto it3 = v.cbegin();  // it3 的类型是 vector<int>::const_iterator
```

需注意，但凡使用了迭代器的循环体，都不要向迭代器所属的容器添加元素。

## 迭代器运算
所有标准库容器都支持递增运算的迭代器，也能用 `==` 和 `!=` 对任意标准库类型的两个迭代器进行比较。

string 和 vector 的迭代器额外提供了更多的运算符，包括: `iter + n`、`iter - n`、`iter += n`、`iter -= n`、`iter1 - iter2`、`>`、`>=`、`<`、`<=`。

# 数组
数组也是被用来存放类型相同的对象的容器。与 vector 不同，数组本身大小确定不变，不能随意像数组中增加元素。

通常如果不确定元素的确切个数，推荐使用 vector。

## 定义和初始化内置数组
数组中的元素个数作为数组类型的一部分，在编译时是已知的，所以维度必须是常量表达式：
```cpp
unsigned cnt = 42;
constexpr unsigned sz = 42;
int arr[10];              // 含有 10 个整数的数组
int *parr[sz];            // 含有 42 个整型指针的数组
string bad[cnt];          // 错误: cnt 不是常量表达式
string strs[get_size()];  // 当 get_size() 是 constexpr 时正确，否则错误
```

和内置类型变量一样，如果再函数内部定义了某种内置类型的数组，那么默认初始化会另数组含有未定义的值。

定义数组的时候必须指定数组类型，不允许使用 auto 关键字由初始值列表推断类型。另外和 vector 一样，数组的元素应为对象，因此不存在引用的数组。

## 显示初始化数组元素
可以对数组的元素进行列表初始化，此时允许忽略数组的维度。
* 如果在声明时没有指明维度，编译器会根据初始值的数量计算维度大小;
* 如果指明了初始值的大小，那么初始值的数量不应该超出指定大小;
* 如果维度比提供的初始值数量大，则用提供的初始值初始化靠前的元素，剩下的元素被初始化成默认值。

例如: 
```cpp
const unsigned sz = 3;
int ia1[sz] = {0, 1, 2};      // 含有 3 个元素的数组，元素值分别为 0, 1, 2
int a2[] = {0, 1, 2};         // 维度是 3 的数组
int a3[5] = {0, 1, 2};        // 等价于 a3[] = {0, 1, 2, 0, 0}
string a4[3] = {"hi", "bye"}; // 等价于 a4[] = {"hi", "bye", ""}
int a5[2] = {0, 1, 2};        // 错误, 初始值过多
```

## 字符数组
对于字符数组，可以使用字符串字面值进行初始化。当使用此种方式时，需注意字符串末尾有一个空白字符，这个空字符会像其他字符一样被拷贝至字符数组中。例如:
```cpp
char a1[] = {'C', '+', '+'};        // 列表初始化, 没有空白字符
char a2[] = {'C', '+', '+', '\0'};  // 列表初始化, 结尾包含空白字符
char a3[] = "C++";                  // 自动添加表示字符串结束的空白字符
const char a4[5] = "Hello";         // 错误, 没有足够空间
```

## 不允许拷贝和赋值
不允许将数组的内容拷贝给其他数组做为初始值, 也不能用数组为其他数组赋值:
```cpp
int a1[] = {0, 1, 2};
int a2 = a1;            // 错误, 不允许使用一个数组初始化另一个数组
a2 = a;                 // 错误, 不能把一个数组直接赋给另一个数组
```

## 复杂的数组声明
```cpp
int *ptrs[10];        // ptrs 是含有 10 个整型指针的数组
int &refs[10] = ?;    // 错误, 不存在引用的数组
int (*Parray)[10] = &arr; // Parray 指向一个含有 10 个元素的数组
int (&arrRef)[10] = arr;  // arrRef 引用一个含有 10 个元素的数组
```

默认情况下，类型修饰符采取由右向左的方式绑定。对于 `*ptrs[10]`, 首先知道是一个大小为 10 个元素的数组，然后数组名字为 `ptrs`，最后知道数组中放的元素为指向 `int` 的指针;

对于 `(*Parray)[10]`, 更适用于由内向外的理解方式。首先是圆括号括起来的部分，`*Parray` 意味着 `Parray` 是个指针, 接下来看右边知道 `Parray` 是个指向大小为 10 的数组的指针, 最后观察左边知道数组中元素类型为 int。

## 访问数组元素
与 vector 和 string 一样，数组类型也能通过范围 for 或下标运算符来访问。

数组下标通常被定义为 `size_t` 类型。在 `cstddef` 头中定义了 `size_t` 类型，这个文件是 C 标准库 `stddef.h` 头文件的 C++ 版本。

此外，和 vector 和 string 一样，数组的下标是否在合理范围（大于等于 0 并且小于数组的大小）内由程序员负责检查。

## 指针和数组
通常情况下，使用取地址运算符来获取指向某个对象的地址，取地址运算符可用于任何对象。数组的元素也是对象，对数组的元素使用取地址运算符能得到指向该元素的指针：
```cpp
string nums = {"one", "two", "three};
string *p = &nums[0];   // p 指向 nums 的第一个元素
```

此外，在很多用到数组名字的地方，编译器会自动将其替换成一个指向数组首元素的指针:
```cpp
string *p2 = nums;      // 等价于 p2 = &nums[0]
```

类似于使用迭代器遍历 vector 中的元素, 使用指针也能遍历数组中的元素, 例如：
```cpp
#include <iostream>
using std::cout; using std::endl;
using std::string;

int main() {
	int arr[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
	for (int *i = arr; i!= &arr[10]; i++) {
		cout << *i << endl;	
	}
	return 0;
}
```

## 标准库函数 begin 和 end
C++11 中引入了名为 begin 和 end 的函数，这两个函数的功能与 vector 中同名函数类似，不过对于数组不是成员函数，而需要将数组作为它们的参数：
```cpp
int arr[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
int *first = begin(arr);    // 指向 arr 首元素的指针
int *last = end(arr);       // 指向 arr 尾元素下一个位置的指针
```
begin 和 end 函数定义在 `iterator` 头文件中，使用它们遍历数组如下:
```cpp
#include <iostream>
#include <iterator>

using std::cout; using std::endl;
using std::begin; using std::end;

int main() {
	int arr[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};

	int *pfirst = begin(arr);
	int *plast = end(arr);

	for (; pfirst != plast; pfirst++) {
		cout << "pfirst: " << *pfirst << ", plast: " << *plast << endl;
	}
	return 0;
}
```

使用指针数值和 end 函数时特别需要注意的是，尾后指针不能执行解引用和递增操作。

## 指针运算
指向数组的指针可以执行所有迭代器运算，包括解引用、递增、比较、与整数相加、两个指针相减等. 
* 给（从）一个指针加上（减去）某整数值, 结果仍是指针, 新指针指向的元素与原来的指针比前进（后退）了该整数个位置;
* 给指针加上一个整数, 得到的新指针仍指向同一数组的其他元素, 或者指向同一数组的尾元素的下一位置;
* 两个指针相减的结果是他们之间的距离. 两个指针相减的结果是 `ptrdiff_t` 标准库类型, 和 `size_t` 一样 `ptrdiff_t` 也定义在 `cstddef` 头文件中, 因为差值可能为负, 所以 `ptrdiff_t` 是带符号整数;
* 只要两个指针指向同一数组的元素, 或者指向该数组的尾元素的下一位置, 就能利用关系运算符对其进行比较; 如果两个指针指向不相关的两个对象, 则不能比较它们.

## C 风格字符串
C++ 支持 C 风格字符串，C 风格字符串存放在字符数组中并且以空字符结束（在字符串最后跟着一个空字符 `\0`）, 一般利用指针来操作这类字符串。

C 标准库提供了一组函数用来操作 C 风格字符串, 定义在 `cstring` 头文件中, `cstring` 头文件是 C 语言头文件 `string.h` 的 C++ 版本，如下：

| 函数名 | 说明 | 
| ---- | ---- | 
| strlen(p) | 返回 p 的长度, 空字符不计算在内 |
| strcmp(p1, p2) | 比较 p1 和 p2 的相等性. 如果 p1 == p2, 返回 0; 如果 p1 > p2, 返回一个正值; 如果 p1 < p2, 返回一个负值 |
| strcat(p1, p2) | 将 p2 附加到 p1 之后, 返回 p1 |
| strcpy(p1, p2) | 将 p2 拷贝给 p1, 返回 p1 |

比较 string 对象的时候可以用普通的关系运算符和相等性运算符, 但是如果把这些运算符用在 C 风格字符串上，实际比较的将是指针而非字符串本身:
```cpp
string s1 = "sample string";
string s2 = "another string";
if (s1 < s2) {
  ...
}

const char c1 = "sample string";
const char c2 = "another string";
if (c1 < c2) {
  // 错误, 视图比较两个无关地址
}
```
如果需要比较两个 C 风格字符串，需要使用 `strcmp` 函数。

如果需要连接或者拷贝 C 风格字符串，同样不能使用 string 对象的类似方式。例如，要把两个 string 对象连接起来，可以使用如下方式:
```cpp
string s = s1 + " " + s2;
```
对于 C 风格字符串，不能把同样的操作应用到两个数组上, 所以需要使用 `strcat` 和 `strcpy` 函数: 
```cpp
strcpy(str, s1);    // 把 s1 拷贝给 str
strcat(str, " ");   // 在 str 的末尾加上一个空白字符
strcat(str, s2);    // 把 s2 连接到 str 末尾
```

**对大多数应用来说，使用标准库 string 要比使用 C 风格字符串更安全、更高效**
