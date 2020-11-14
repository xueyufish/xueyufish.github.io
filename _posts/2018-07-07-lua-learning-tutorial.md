---
layout:     post
title:      "Lua学习参考"
date:       2018-07-07
description: "Lua学习参考"
keyword:    "编程语言, Lua, 余修忞, yuxiumin, xueyufish"
tags:
    - 编程语言
    - Lua
---

之前对 Lua 语言的强大早有耳闻，在 Nginx、Redis 等平台特别是网关和互联网秒杀等场景中发挥了非常重要的作用。可惜一直没有学习，最近因为工作的需要在研究基于 Kong 的网关实现，抽空花了几天时间进行了研究。

### 运行
Lua 是类 C 的，他是大小写字符敏感的, 作为一个扩展式语言，Lua 没有 "main" 程序的概念, 它只能嵌入一个宿主程序中工作。

Lua 可以像 python 一样，在命令行上运行 lua 命令后进入 shell 中执行:
```lua
➜ ~ lua
Lua 5.3.4  Copyright (C) 1994-2017 Lua.org, PUC-Rio
> print("hello world")
hello world
>
```

也可以把脚本存成一个文件，用命令行来运行:

```lua
➜ ~ vim hello.lua
#! /usr/local/bin/lua
print("hello world")
```

```shell
➜ ~ lua hello.lua
hello world
```

```shell
➜ ~ chmod +x hello.lua
➜ ~ ./hello.lua
hello world
```

### 语法

#### 词法约定

**标识符**

Lua 的标识符为字母或者下划线开头的字母、下划线、数字序列，但是最好不要使用下划线加大写字母的标示符。

**保留字**
```lua
and    break    do    else    elseif    end    false    for    function    if
in    local    nil    not    or    repeat    return    then    true    until    while
```

**注释**

Lua 的注释和 C、Java 等语言有所不同，单行注释采用如<code>-- comment --</code>的方式，多行注释如下:

```lua
--[[
multiline comment1
multiline comment2
--]]
```

#### 基本类型

Lua 中有八种基本类型： nil, boolean, number, string, function, userdata, thread, and table.

**Nil**

Nil 类型只有一种值 nil，主要用途用于标识和别的任何值的差异, 通常, 当需要描述一个无意义的值时会用到它。一个全局变量没有被赋值以前默认值为nil, 给全局变量负nil可以删除该变量。

**Boolean**

Boolean 类型只有两种值：false 和 true。在控制结构的条件中除了 false 和 nil 为假，其他值都为真; Lua 认为 数字 0 和空字符串都是真。

**Numbers**

Lua 的数字只有 double 型，64位，通常不必担心 Lua 处理浮点数会慢（除非大于100,000,000,000,000），或是会有精度问题。

**String**

Lua 的字符串是 8 位字节，所以字符串可以包含任何数值字符；Lua 中字符串是不可以修改的, 可以使用单引号或者双引号表示字符串， 还支持C类型的转义, 比如:

```lua
\a -- 响铃       \b -- 后退     \f -- 换页     \n -- 换行     \r -- 回车      \t -- 制表
\v -- 纵向制表   \\ -- 反斜杠    \" -- 双引号   \' -- 单引号   \[ -- 左中括号  \] -- 右中括号
```

#### 局部变量
Lua 中使用 local 创建一个局部变量。使用局部变量的好处在于可以避免命名冲突和访问局部变量的速度比全局变量更快，因尽可能使用局部变量。关于局部变量的使用和作用域，可以参考下面的代码块：

```lua
#! /usr/local/bin/lua

x = 5
local i = 1

while i <= x do
    local x = i * 2
    print('x in while body: ' .. x)
    i = i + 1
end

if i > 5 then
    local x
    x = 10
    print('x in then body: ' .. x + 1)
else
    print('x => ' .. x)
end

print('test end, x: ' .. x)
```

输出为:

```shell
x in while body: 2
x in while body: 4
x in while body: 6
x in while body: 8
x in while body: 10
x in then body: 11
test end, x: 5
```

### 控制结构

**if语句**

```lua
-- 单一 if 形式
if conditions then
    then-part
end

-- if-else 形式
if conditions then
    then-part
else
    else-part
end

-- if-elseif-else 形式
if conditions then
    then-part
elseif conditions then
    elseif-part
else
    else-part
end
```

**while语句**

```lua
while condition do
    statements;
end;
```

**repeat-until语句**
```lua
repeat
    statements;
until conditions;
```

**for循环**

for 循环有两种形式：一种是数字形式，另一种是泛型形式。

```lua
-- 数字形式的 for 循环
for var = exp1, exp2, exp3 do
    loop-part
end
```

需要注意的是：1. 所有三个控制表达式都只被运算一次，表达式的计算在循环开始之前; 2. 控制变量 var 是局部变量自动被声明,并且只在循环内有效; 3. 循环过程中不可以改变控制变量的值，如果要退出循环，使用break语句

```lua
-- 泛型形式的 for 循环
for i, v in ipairs(exp) do
    loop-part
end
```

### 多返回值

Lua 函数可以返回多个结果值，这点和 Go 语言类似。例如:
```lua
function foo () end                   -- returns no results
function bar () return 'a' end        -- returns 1 result
function baz () return 'a','b' end    -- returns 2 results
```

当调用作为表达式最后一个参数或者仅有一个参数时，根据变量个数函数尽可能多地返回多个值，不足补nil，超出舍去；其他情况下，函数调用仅返回第一个值（如果没有返回值为nil）。例如:
```lua
x, y = baz()                -- x = 'a', y = 'b'
x = baz()                   -- x = 'a', 'b' 被丢弃
x, y, z = 10, baz()         -- x = 10, y = 'a', z = 'b'

x, y = foo()                -- x = nil, y = nil
x, y = bar()                -- x = 'a', y = nil
x, y, z = baz()             -- x = 'a', y = 'b', z = nil

x, y = baz(), 20            -- x = 'a', y = 20
x, y = foo(), 20, 30        -- x = 'nil', y = 20, 30 被丢弃
```

### Table

Lua 中的 Table 是一个 Key-value 的数据结构，它很像 Javascript 中的 Object，或是 PHP 中的数组。

#### 基本操作

```lua
tbl1 = {} -- 初始化一个空表
tbl2 = {name="yuxm", hello= "world", age = 33}
tbl3 = {["name"] = "yuxm", ["hello"] = "world", [1] = 2}

tbl2["name"] = "zhangsan"
tbl3.name = "lisi"
tbl3[1] = nil
```

#### 数组

初始化一个数组:

```lua
arr = {}
for i=1, 1000 do
    a[i] = 0
end
```

也可以直接通过构造函数初始化:

```lua
arr = {1, 2, 3, 4, 5}
```

lua 的数组可以不限制元素类型, 以下脚本最终输出<code>nihao</code>:
```lua
#! /usr/local/bin/lua

arr = {"abc", 123, "def", 456, function() print("nihao") end}
arr[5]()
```

需要注意的是，lua 中数组的索引下标从 1 开始，这与其他的语言不一致.

Lua中的变量，如果没有local关键字，全都是全局变量，Lua也是用Table来管理全局变量的，Lua把这些全局变量放在了一个叫 "_G" 的 Table 里。例如，下面代码打印在当前环境中所有的全局变量的名字：
```lua
for n in pairs(_G) do print(n) end
```

可以通过如下方式访问全局变量:
```lua
globalvar = 123
print(_G["globalvar"])  -- output: 123
```

### MetaTable 和 MetaMethod

我们可以对 Lua 中 table 的 key-value 执行加操作，访问 key 对应的 value，遍历所有的 key-value; 但是我们不可以对两个 table 执行加操作，也不可以比较两个表的大小。

Metatables 允许我们改变 table 的行为，例如使用 Metatables 我们可以定义 Lua 如何计算两个 table 的相加操作。当 Lua 试图对两个表进行相加时，他会检查两个表是否有一个表有 Metatable，并且检查 Metatable 是否有 __add 域。如果找到则调用这个 __add 函数（所谓的Metamethod）去计算结果。

Lua 中的每一个表都有其 Metatable，Lua 默认创建一个不带 metatable 的新表:
```lua
tbl = {}
print(getmetatable(tbl))      -- output: nil
```
可以使用setmetatable函数设置或者改变一个表的metatable
```lua
tbl1 = {}
tbl2 = {}
setmetatable(tbl1, tbl2)
print(getmetatable(tbl1) == tbl2)   -- true
```
假如现在有两个 table, 分别为描述两个矩形, 分别计算两个矩形的长和宽之和:
```lua
square1 = {length = 100, width = 80}
square2 = {length = 120, width = 90}

square_op ={}
function square_op.__add(f1, f2)
    ret = {}
    ret.length = f1.length + f2.length
    ret.width = f1.width + f2.width
    return ret
end

setmetatable(square1, square_op)

square = square1 + square2

print('total length: ' .. square.length .. ', total width: ' .. square.width)
```

输出:
```shell
total length: 220, total width: 170
```

类似 __add 这样的 MetaMethod，是 Lua 内建约定的，其它的还有如下的 MetaMethod：
```lua
__add(a, b)                     对应表达式 a + b
__sub(a, b)                     对应表达式 a - b
__mul(a, b)                     对应表达式 a * b
__div(a, b)                     对应表达式 a / b
__mod(a, b)                     对应表达式 a % b
__pow(a, b)                     对应表达式 a ^ b
__unm(a)                        对应表达式 -a
__concat(a, b)                  对应表达式 a .. b
__len(a)                        对应表达式 #a
__eq(a, b)                      对应表达式 a == b
__lt(a, b)                      对应表达式 a < b
__le(a, b)                      对应表达式 a <= b
__index(a, b)                   对应表达式 a.b
__newindex(a, b, c)             对应表达式 a.b = c
__call(a, ...)                  对应表达式 a(...)
```

### 面向对象

Lua 不存在类的概念，可以通过对 __index 的重载来定义对象及行为。所谓__index，说得明确一点，如果我们有两个对象a和b，我们想让b作为a的prototype只需要：
```lua
setmetatable(a, {__index = b})
```

以下为一个操作面向对象的例子：
```lua
User={}

function User:new(p)
    local obj = p
    if (obj == nil) then
        obj = {name="yuxm", age=33}
    end
    self.__index = self
    return setmetatable(obj, self)
end

function User:toString()
    return self.name .." : ".. self.age
end

me = User:new()
print(me:toString())    -- yuxm : 33

kf = User:new{name="xiaoqiang", age=12}
print(kf:toString())    -- xiaoqiang : 12

```

### 模块

可以直接使用 <code>require("model_name")</code>来载入别的 lua 文件，载入的时候就直接执行那个文件了。比如：
我们有一个hello.lua的文件：
```lua
print("Hello, World!")
```
如果我们<code>require(“hello”)</code>，那么就直接输出 <code>Hello, World！</code>了。

注意：
1）require 函数，载入同样的 lua 文件时，只有第一次的时候会去执行，后面的相同的都不执行了。
2）如果你要让每一次文件都会执行的话，你可以使用 dofile("hello") 函数
3）如果你要玩载入后不执行，等你需要的时候执行时，你可以使用 loadfile()函数，如下所示：

```lua
local hello = loadfile("hello")
... ...
... ...
hello()
```

loadfile("hello")后，文件并不执行，我们把文件赋给一个变量hello，当hello()时，才真的执行。

### 参考资料
* [Lua 5.3 Reference Manual](http://www.lua.org/manual/5.3/)
* [Lua 5.1 参考手册](https://www.codingnow.com/2000/download/lua_manual.html)
* [Lua 简明教程](https://coolshell.cn/articles/10739.html)
* [Lua 在线手册](http://manual.luaer.cn/)
* [Lua 程序设计](http://book.luaer.cn/)
