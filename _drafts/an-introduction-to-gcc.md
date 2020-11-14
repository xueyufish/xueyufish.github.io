[GCC](https://gcc.gnu.org/) 由 GNU 项目发起人，开源界大佬级人物 Richard Stallman 创建。 初始版本创建于 1987年，主要给类 unix 系统提供了 C 语言环境，后经过不断发展，逐渐增强了 C++、 Fortran、 ADA、 Java、 Objective-C 等多语言支持。

本文主要参考 [An Introduction to GCC](http://lampwww.epfl.ch/~fsalvi/docs/gcc/www.network-theory.co.uk/docs/gccintro/index.html), 对 GCC 的基本操作进行简单介绍。

因为 GCC 版本不断进行升级，本文所有样例使用的版本目前为 gcc 8.2.0 版本，之前版本应该也可以兼容。

# 编译 C 程序

GCC 可用于编译一个独立的 C 源文件，或编译多个 C 源文件，也可使用系统类库或头文件来进行编译。

## 编译简单的 C 文件
仍然从经典的 helloworld 程序开始，新建 `hello.c` 文件，输入以下内容并保存：
```c
#include <stdio.h>

int
main (void)
{
  printf ("Hello, world!\n");
  return 0;
}
``` 

使用 gcc 编译如下:
```shell
$ gcc -Wall hello.c -o hello
```

上述命令将源文件 `hello.c` 编译为机器码并且存储在可执行文件 `hello` 中。 `-o` 选项指定了输出的可执行机器码文件， 通常我们将 `-o` 选项放在所有选项的末尾；这里如果不指定 `-o` 选项，默认生成 `a.out` 文件。如果指定文件已经存在，则新生成的文件将覆盖原有文件。

`-Wall` 选项用于打开常用的编译警告。看下面一个例子：
```c
#include <stdio.h>

int main(void) {
    printf("Two plus two is %f\n", 4);
    return 0;
}
```

新建另一个文件 `bad.c`, 使用 `-Wall` 选项编译结果如下
```shell
$ gcc gcc -Wall bad.c -o bad
bad.c: In function 'main':
bad.c:4:30: warning: format '%f' expects argument of type 'double', but argument 2 has type 'int' [-Wformat=]
     printf("Two plus two is %f\n", 4);
                             ~^     ~
                             %d
```

可以看出，gcc 给出了提示对于整型 4 在格式化输出时不应该使用 `%f` 说明符，而应该使用 `%d`；如果不加 `-Wall` 选项，则程序可以正常编译通过，并生成机器码文件：
```shell
$ gcc bad.c -o bad
$ ./bad
Two plus two is -137971160184088429255252823429643820691423208952068473500493417400787546924332837717822476901603444374374391859252993881330417934039920936088997453728747306338554883197831082281042902891833038064839010590341644598119338184852467002274204969260021929220084042019680363062288451633152.000000
```

但是，从运行结果看，输出结果发出了溢出，这与程序预期不符，也是开发中需要尽量避免的。

所以，gcc 默认在不打卡警告选项时，不会输出任何告警信息。而打开 `-Wall` 选项可以在编译时帮助发现很多错误，通常建议打开此选项。

## 编译多个源文件

假设有头文件 `hello.h`，源文件 `hello.c`、`main.c`，分别定义如下：

`main.c`: 
```c
#include "hello.h"

int main(void) {
	hello("xueyufish");
	return 0;
}
```

`hello.h`:
```c
void hello (const char * name);
```

`hello.c`:
```c
#include <stdio.h>
#include "hello.h"

void hello (const char * name) {
	printf ("Hello, %s!\n", name);
}
```

可以执行以下 gcc 命令编译上述文件: 
```shell
$ gcc -Wall main.c hello.c -o hello
```

编译完成后，在当前目录生成可执行文件 `hello`，运行可在控制台输出 `Hello xueyufish!`

## 独立编译源文件

上例中的 gcc 命令会编译所有的源文件并且新生成 `hello` 文件。也可使用 gcc 进行独立编译和链接:
```shell
$ gcc -Wall -c hello.c   // 生成 hello.o
$ gcc -Wall -c main.c    // 生成 main.o
$ gcc main.o hello.o -o hello  // 生成二进制可执行文件 hello 
```

产生的结果文件 `hello` 与执行 `gcc -Wall main.c hello.c -o hello` 产生的一致。其中第一步和第二步分别编译生成对象文件 `main.o` 和 `hello.o`，最后一步链接 `main.o` 和 `hello.o` 生成可执行文件 `hello`。最后一步不需要 `-Wall` 选项因为 `-Wall` 选项在编译时起作用，对链接时不再需要。


如果只修改了其中某一个文件，比如将 `main.c` 文件中的 `hello("xueyufish");` 修改为 `hello("zhangsan");`，可以通过独立编译的方式来进行：
```shell
$ gcc -Wall -c main.c   // 生成 main.o
$ gcc main.o hello.o -o hello  // 生成二进制可执行文件 hello 
$ ./hello               
Hello, zhangsan!
```

以上命令将 `main.c` 编译生成对象文件 `main.o`，同时重新链接 `main.o` 和 `hello.o` 生成可执行文件 `hello`。由于 `hello.c` 和其依赖的头文件 `hello.h` 文件没有改变，所以此处并没有编译 `hello.c` 文件。在大型项目中，通常通过 [make](https://www.gnu.org/software/make/) 来对于变更文件做出重新编译和链接。

## 链接外部类库

使用 gcc 可以链接外部静态或者动态类库，下面以最简化方式操作一个静态链接库。假设有 `mylib.h` 、`mylib.c`、 `main.c` 文件内容如下：

`mylib.h`:
```c
void hello(const char *name);
```

`mylib.c`:
```c
#include <stdio.h> 

void hello(const char *name) {
  printf("Hello %s! \n", name); 
} 
```

`main.c`:
```c
#include "mylib.h" 

int main(void)  
{ 
  hello("xueyufish"); 
  return 0;
} 
```

首先执行 GCC 命令编译生成名为 `mylib.o` 的对象文件:
```shell
$ gcc -c mylib.c -o mylib.o
```

然后使用 `ar` 工具生成名为 `mylib.a` 的静态链接库文件:
```shell
$ ar rcs mylib.a mylib.o
```

最后，可以通过将生成的静态库链接到 main 文件来生成可执行文件
```shell
$ gcc -Wall -c main.c
$ gcc main.o mylib.a -o main
```

需要注意的是，最后一条执行 `gcc main.o mylib.a -o main` 时，需保证 `main.o` 文件在 `mylib.a` 文件之前，否则某些版本的编译器上可能会因为无法加载类库而报错:
```shell
$ gcc mylib.a main.o -o main
main.o:main.c:(.text+0x15): undefined reference to `hello`
collect2.exe: error: ld returned 1 exit status
``` 

# 指定搜索路径
通常情况下使用 gcc 编译包含头文件的源程序有可能出现以下错误:
* `FILE.h: No such file or directory`: 当标准库中不包含引入的头文件时可能发生此类错误
* `/usr/bin/ld: cannot find library`: 如果用于链接的库不在GCC使用的标准库目录中会发生此错误

默认情况下， gcc 会通过以下目录来查找头文件:
```
/usr/local/include/
/usr/include/
```

同时，会通过以下目录来查找类库文件:
```
/usr/local/lib/
/usr/lib/
``` 

头文件目录列表通常称为包含路径，库目录列表称为库搜索路径或链接路径。头文件和库文件根据以上列表的顺序进行查找，`/usr/local/include/` 目录下的头文件会优于 `/usr/include` 目录查找，`/usr/local/lib` 目录下的库文件会优于 `/usr/lib` 目录查找。如果在其他目录中安装了标准库以外的其他库，则需要扩展搜索路径。编译器选项 `-I` 和 `-L` 分别将新目录添加到头文件目录列表和库搜索路径的开头。

## 指定搜索路径
下面通过一段引用 GDBM 类库的小程序，说明指定搜索路径的用法。假设程序 `dbmain.c` 内容如下：
```c
#include <stdio.h>
#include <gdbm.h>

int
main (void)
{
  GDBM_FILE dbf;
  datum key = { "testkey", 7 };     /* key, length */
  datum value = { "testvalue", 9 }; /* value, length */

  printf ("Storing key-value pair... ");
  dbf = gdbm_open ("test", 0, GDBM_NEWDB, 0644, 0);
  gdbm_store (dbf, key, value, GDBM_INSERT);
  gdbm_close (dbf);
  printf ("done.\n");
  return 0;
}
```

这段程序使用了头文件 `gdbm.h` 和类库 `libgdbm.a`。如果类库被安装在默认位置 `/usr/local/lib` 下，头文件在 `/usr/local/include` 下，可以使用以下命令编译程序：
```shell
$ gcc -Wall dbmain.c -lgdbm
```

但如果类库被安装在其他位置，使用上述命令编译程序时会报错如下:
```shell
$ gcc -Wall dbmain.c -lgdbm    
dbmain.c:1: gdbm.h: No such file or directory
```

例如，如果把 gdbm-1.18 安装包安装在 `/opt/gdbm-1.18` 目录下，则对应的头文件位置为: `/opt/gdbm-1.18/include/gdbm.h`。可以通过以下命令进行编译:
```shell
$ gcc -Wall -I/opt/gdbm-1.18/include dbmain.c -lgdbm
/usr/bin/ld: cannot find -lgdbm
collect2: error: ld returned 1 exit status
```

可以看出，加了 `-I/opt/gdbm-1.18/include` 后通过编译，但是在链接步骤中缺少对应的类库，需要通过增加 `-L` 选项 `-L/opt/gdbm-1.18/lib/` 指定:
```shell
$ gcc -Wall -I/opt/gdbm-1.18/include -L/opt/gdbm-1.18/lib dbmain.c -lgdbm -o dbmain
```

上述命令执行完成后, 会在当前目录生成名为 `dbmain` 的可执行文件。

## 环境变量
除了在执行 gcc 命令是通过 `-I/opt/gdbm-1.18/include` 和 `-L/opt/gdbm-1.18/lib/` 指定头文件列表和库文件搜索路径外，也可以通过环境变量指定对应的头文件和库文件目录：
```shell
$ C_INCLUDE_PATH=/opt/gdbm-1.18/include/
$ export C_INCLUDE_PATH
```

```shell
$ LIBRARY_PATH=/opt/gdbm-1.18/lib/
$ export LIBRARY_PATH
```

设置环境变量后，在执行 gcc 命令时可不再需要指定头文件和库文件目录:
```shell
$ gcc -Wall dbmain.c -lgdbm -o dbmain
```

gcc 在搜索头文件和库文件目录时，会优先检查 `-I` 和 `-L` 选项设置的目录，然后检查环境变量设置的目录，最后检查标准指定的默认目录 (`/usr/local/include/`、`/usr/include`等)。

## 扩展搜索路径
根据 unix 标准，多个目录可在环境变量中通过冒号分隔符连接，并根据从左到右的顺序检索， 并用点号 `.` 来表示当前路径:
```
DIR1:DIR2:DIR3:...
```

例如，下列设置创建对于当前目录(`.`), `/opt/gdbm-1.8.3/include` 和 `/net/include` 的头文件引用，以及对于当前目录(`.`), `/opt/gdbm-1.8.3/lib` 和 `/net/lib` 的链接
```shell
$ C_INCLUDE_PATH=.:/opt/gdbm-1.8.3/include:/net/include
$ LIBRARY_PATH=.:/opt/gdbm-1.8.3/lib:/net/lib
```

在命令行中指定多个搜索路径，与此类似：
```shell
$ gcc -I. -I/opt/gdbm-1.8.3/include -I/net/include -L. -L/opt/gdbm-1.8.3/lib -L/net/lib .....
```

当命令行中存在多个 `-I`、`-L` 选项，且同时存在环境变量时，查询顺序如下：
* 首先从左到右查询命令行选项
* 查询环境变量设置，例如: `C_INCLUDE_PATH`(C 程序)、`CPLUS_INCLUDE_PATH`(C++ 程序)、`LIBRARY_PATH`
* 最后查询系统默认目录：`/usr/local/include/`、`/usr/include`、`/usr/local/lib`、`/usr/local/lib`


## C 语言标准选项
gcc 默认情况下支持基于 gnu 的 c 语言编译标准，可以通过 `-ansi` 选项指定 ansi 标准。

例如，以下程序在 ansi 标准下可以正常编译，但是其中的 `asm` 变量在 gnu 标准下为保留关键字，所以在 gnu 标准下会编译错误：
```c
#include <stdio.h>

int
main (void)
{
  const char asm[] = "6502";
  printf ("the string asm is '%s'\n", asm);
  return 0;
}
```

使用 gnu 默认编译出错:
```shell
$ gcc -Wall ansi.c -o ansi
ansi.c: In function ‘main’:
ansi.c:6:14: error: expected identifier or ‘(’ before ‘asm’
   const char asm[] = "6502";
              ^
ansi.c:7:39: error: expected expression before ‘asm’
   printf ("the string asm is '%s'\n", asm);
                                       ^
```

使用 `-ansi` 选项指定使用 ansi 标准可以正常编译:
```shell
$ gcc -Wall -ansi ansi.c -o ansi
$ ./ansi
the string asm is '6502'
```

对于使用到 gun 宏的程序，除了可以使用默认 gnu 选项编译外，也可以通过命令行参数指定，例如以下程序使用了 `M_PI` 变量，来源于 gnu 预定义宏 `_GNU_SOURCE`:
```c
#include <math.h>
#include <stdio.h>

int 
main (void) 
{
  printf ("the value of pi is %f\n", M_PI);
  return 0;
}
```

如果使用 `-ansi` 选项编译，会报错如下：
```shell
$ gcc -Wall -ansi pi.c -o pi
pi.c: In function ‘main’:
pi.c:7:38: error: ‘M_PI’ undeclared (first use in this function)
   printf ("the value of pi is %f\n", M_PI);
                                      ^
pi.c:7:38: note: each undeclared identifier is reported only once for each function it appears in
```

此时可以去除 `-ansi` 选项，也可以通过命令行指定 `-D_GNU_SOURCE` 选项编译:
```shell
$ gcc -Wall -ansi -D_GNU_SOURCE pi.c -o pi
$ ./pi
the value of pi is 3.141593
```

在执行编译命令时，`-ansi` 选项通常联合使用 `-pedantic` 选项，约束程序拒绝所有 gnu 扩展，严格遵守 ansi 标准。

在执行编译时，gcc 通常通过 `-std` 选项指定对应的 c 语言标准:
* `-ansi`、 `-std=c89`、 `-std=c90`、`-std=iso9899:1990`, 指定使用 `ISO C90` 标准
* `-std=c99`、 `-std=c9x`、`-std=iso9899:1999`、`-std=iso9899:199x`, 指定使用 `ISO C99` 标准
* `-std=c11`、 `-std=c1x`、`-std=iso9899:2011`、`-std=iso9899:199x`, 指定使用 `ISO C11` 标准
* `-std=c17`、 `-std=c18`、`-std=iso9899:2017`、`-std=iso9899:2018`, 指定使用 `ISO C17` 标准, 2018 年发布
* `-std=gnu89`、 `-std=gnu90`, 指定使用 `GNU ISO C90` 标准
* `-std=gnu99`, 指定使用 `GNU ISO C99` 标准
* `-std=gnu11`, 指定使用 `GNU ISO C11` 标准
* `-std=gnu17`, `-std=gnu18`, 指定使用 `GNU ISO C17` 标准

默认情况下，`-ansi` 选项等同于 `-std=c90` 选项。

对于使用 g++ 编译的 c++ 程序，`-std` 选项指定对应的 c++ 语言标准如下:
* `-ansi`, `-std=c++98`、`-std=c++03`, 指定使用 `ISO 1998 C++` 标准;
* `-std=c++11`、`-std=c++0x`, 指定使用 `ISO 2011 C++` 标准;
* `-std=c++14`、`-std=c++1y`, 指定使用 `ISO 2014 C++` 标准;
* `-std=c++17`、`-std=c++1z`, 指定使用 `ISO 2017 C++` 标准;
* `-std=gnu++98`、 `-std=gnu++03`, 指定使用 `GNU ISO 1998 C++` 标准;
* `-std=gnu++11`, `-std=gnu++0x`, 指定使用 `GNU ISO 2011 C++` 标准;
* `-std=gnu++14`, `-std=gnu++1y`, 指定使用 `GNU ISO 2014 C++` 标准;
* `-std=gnu++17`, `-std=gnu++1z`, 指定使用 `GNU ISO 2017 C++` 标准;

默认情况下，`-ansi` 选项等同于 `-std=c++98` 选项。


通常，编译时推荐使用选项如下：
```shell
$ gcc -ansi -pedantic -Wall -W -Wconversion -Wshadow -Wcast-qual -Wwrite-strings
```

# 使用预处理器
预处理器会在编译源文件之前展开源文件中的宏。每当 GCC 处理 C 或 C++ 程序时，都会自动调用它。

## 使用宏定义
例如，下面程序使用 `#ifdef` 宏检测如果 `TEST` 宏被定义则输出 `Test mode`:
```c
#include <stdio.h>

int main (void)
{
#ifdef TEST
  printf ("Test mode\n");
#endif
  printf ("Running...\n");
  return 0;
}

```

执行编译并运行如下:
```shell
$ gcc -Wall -DTEST dtest.c
$ ./a.out
Test mode
Running...
```

如果编译时忽略 `-DTEST` 选项，则不会输出 `Test mode`:
```shell
$ gcc -Wall dtest.c
$ ./a.out
Running...
```

可以通过以下命令查看预定义宏:
```shell
$ cpp -dM /dev/null
#define __DBL_MIN_EXP__ (-1021)
#define __UINT_LEAST16_MAX__ 65535
#define __ATOMIC_ACQUIRE 2
#define __FLT_MIN__ 1.17549435082228750797e-38F
#define __UINT_LEAST8_TYPE__ unsigned char
#define __INTMAX_C(c) c ## L
#define __CHAR_BIT__ 8
#define __UINT8_MAX__ 255
......
```

## 给宏传值
除了被定义之外，宏还可以被赋予一个值。值会在宏出现的每个点插入源代码中, 以下程序使用宏 `NUM` 来表示将要打印的编号：
```c
#include <stdio.h>

int
main (void)
{
  printf ("Value of NUM is %d\n", NUM);
  return 0;
}
```

可以使用 `-D` 命令行选项以 `-DNAME=VALUE` 的形式来定义宏的值。例如，以下命令行定义宏 `NUM` 的值为 100:
```shell
$ gcc -Wall -DNUM=100 dtestval.c
$ ./a.out
Value of NUM is 100
```

除了传递值以外，宏也可以传递其他性质内容，其内容将在预编译阶段被插入到源代码中，例如以下命令行在预编译阶段将 NUM 替换为 `2+2`：
```shell
$ gcc -Wall -DNUM="2+2" dtestval.c
$ ./a.out
Value of NUM is 4
```

上述内容等同于:
```shell
#include <stdio.h>

int
main (void)
{
  printf ("Value of NUM is %d\n", 2+2);
  return 0;
}
```

当宏只被定义 `-D` 选项而未提供值时，将默认赋给值 `1`, 例如:
```shell
$ gcc -Wall -DNUM dtestval.c
$ ./a.out 
Value of NUM is 1
```

## 生成预处理文件
可以通过 `-E` 选项生成预处理文件。例如，下面的程序定义并使用了宏 `TEST`, 使用 `-E` 选项可以看到预编译后的文件内容:
```c
#define TEST "Hello, World!"
const char str[] = TEST;
```

执行 gcc 命令:
```shell
$ gcc -E test.c
# 1 "test.c"
# 1 "<built-in>"
# 1 "<command-line>"
# 31 "<command-line>"
# 1 "/usr/include/stdc-predef.h" 1 3 4
# 32 "<command-line>" 2
# 1 "test.c"

const char str[] = "Hello, World!";
```

可以看出，预编译后宏 `TEST` 被替换成了字符串 `Hello world!`.

默认情况下，预处理器的输出会被导入到标准输出流，可以利用 -o 选项把它导入到某个输出文件：
```shell
$ gcc -E test.c -o test.i
```

如果加上 `-C` 选项，可以阻止预处理器删除源文件和头文件中的注释，便于更好的阅读生成的预处理文件：
```shell
$ gcc -E -C test.c -o test.i
```

