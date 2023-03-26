---
layout:     post
title:      "Markdown 语法总结"
date:       2012-12-16
author:     "xueyufish"
keyword:    "程序语言, Markdown, xueyufish"
tags:
    - Markdown
---

# 基础语法 

## 斜体和粗体

使用 * 和 ** 表示斜体和粗体。

示例：

这是 *斜体*，这是 **粗体**。

## 分级标题
使用 # 表示一级标题，使用 ## 表示二级标题，使用 ### 表示三级标题，

示例：
```
# 这是一个一级标题

## 这是一个二级标题

### 这是一个三级标题
```

## 外链接
使用 \[描述](链接地址) 为文字增加外链接。 

示例：

点击 [这里](http://www.yuxiumin.com) 。

## 无序列表
使用 *，+，- 表示无序列表。 

示例：

- 无序列表项 一
- 无序列表项 二
- 无序列表项 三

### 有序列表
使用数字和点表示有序列表。 

示例：

1. 有序列表项 一
2. 有序列表项 二
3. 有序列表项 三

## 文字引用
使用 > 表示文字引用。 

示例：

> 野火烧不尽，春风吹又生。

## 行内代码块
使用 \`代码` 表示行内代码块。 

示例：

我的博客地址是 `http://www.yuxiumin.com/`。

## 代码块
使用 四个缩进空格 表示代码块。

示例：

    这是一个代码块，此行左侧有四个不可见的空格。

## 插入图像
使用 \!\[描述](图片链接地址) 插入图像。

示例：

![我的头像](http:/assets/image/logo.png)


# 高阶语法

## 内容目录

在段落中填写 `[TOC]` 以显示全文内容的目录结构。

[TOC]

## 删除线
使用 ~~ 表示删除线。

示例：

~~这是一段错误的文本。~~

## 注脚
使用 [^keyword] 表示注脚。

示例：

这是一个注脚[^footnote]的样例。

这是第二个注脚[^footnote2]的样例。

## LaTeX 公式
$ 表示行内公式： 

质能守恒方程可以用一个很简洁的方程式 $E=mc^2$ 来表达。

$$ 表示整行公式：

$$\sum_{i=1}^n a_i=0$$

$$f(x_1,x_x,\ldots,x_n) = x_1^2 + x_2^2 + \cdots + x_n^2 $$

$$\sum^{j-1}_{k=0}{\widehat{\gamma}_{kj} z_k}$$

访问 [MathJax](http://meta.math.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference) 参考更多使用方法。

## 加强的代码块
支持四十一种编程语言的语法高亮的显示，行号显示。

非代码示例：

```
$ sudo apt-get install vim-gnome
```

Python 示例：

```python
@requires_authorization
def somefunc(param1='', param2=0):
    '''A docstring'''
    if param1 > param2: # interesting
        print 'Greater'
    return (param2 - param1 + 1) or None

class SomeClass:
    pass

>>> message = '''interpreter
... prompt'''
```

JavaScript 示例：

``` javascript
/**
* nth element in the fibonacci series.
* @param n >= 0
* @return the nth element, >= 0.
*/
function fib(n) {
  var a = 1, b = 1;
  var tmp;
  while (--n >= 0) {
    tmp = a;
    a += b;
    b = tmp;
  }
  return a;
}

document.write(fib(10));
```

## 表格支持

| 项目        | 价格   |  数量  |
| --------   | -----:  | :----:  |
| 计算机      | \$1600 |   5     |
| 手机        |   \$12   |   12   |
| 管线        |    \$1    |  234  |

## Html 标签
可以在 Markdown 语法中嵌套 Html 标签，例如，可以用 Html 写一个纵跨两行的表格：

    <table>
        <tr>
            <th rowspan="2">值班人员</th>
            <th>星期一</th>
            <th>星期二</th>
            <th>星期三</th>
        </tr>
        <tr>
            <td>李强</td>
            <td>张明</td>
            <td>王平</td>
        </tr>
    </table>


<table>
    <tr>
        <th rowspan="2">值班人员</th>
        <th>星期一</th>
        <th>星期二</th>
        <th>星期三</th>
    </tr>
    <tr>
        <td>李强</td>
        <td>张明</td>
        <td>王平</td>
    </tr>
</table>

## 待办事宜 Todo 列表

使用带有 [ ] 或 [x] （未完成或已完成）项的列表语法撰写一个待办事宜列表，并且支持子列表嵌套以及混用Markdown语法，例如：

    - [ ] **Cmd Markdown 开发**
        - [ ] 改进 Cmd 渲染算法，使用局部渲染技术提高渲染效率
        - [ ] 支持以 PDF 格式导出文稿
        - [x] 新增Todo列表功能 [语法参考](https://github.com/blog/1375-task-lists-in-gfm-issues-pulls-comments)
        - [x] 改进 LaTex 功能
            - [x] 修复 LaTex 公式渲染问题
            - [x] 新增 LaTex 公式编号功能 [语法参考](http://docs.mathjax.org/en/latest/tex.html#tex-eq-numbers)
    - [ ] **七月旅行准备**
        - [ ] 准备邮轮上需要携带的物品
        - [ ] 浏览日本免税店的物品
        - [x] 购买蓝宝石公主号七月一日的船票
        
对应显示如下待办事宜 Todo 列表：
        
- [ ] **Cmd Markdown 开发**
    - [ ] 改进 Cmd 渲染算法，使用局部渲染技术提高渲染效率
    - [ ] 支持以 PDF 格式导出文稿
    - [x] 新增Todo列表功能 [语法参考](https://github.com/blog/1375-task-lists-in-gfm-issues-pulls-comments)
    - [x] 改进 LaTex 功能
        - [x] 修复 LaTex 公式渲染问题
        - [x] 新增 LaTex 公式编号功能 [语法参考](http://docs.mathjax.org/en/latest/tex.html#tex-eq-numbers)
- [ ] **七月旅行准备**
    - [ ] 准备邮轮上需要携带的物品
    - [ ] 浏览日本免税店的物品
    - [x] 购买蓝宝石公主号七月一日的船票
       
# 数学公式

数学公式有两种：行中公式和独立公式。行中公式放在文中与其它文字混编，独立公式单独成行。

行中公式可以表示为： 
```
$ 数学公式 $
```

独立公式可以表示为： 
```
$$ 数学公式 $$
```

## 输入上下标
`^` 表示上标, `_`表示下标。 如果上下标的内容多于一个字符，需要用 `{}` 将这些内容括成一个整体。 上下标可以嵌套，也可以同时使用。

例如：
```
$$ x^{y^z}=(1+{\rm e}^x)^{-2xy^w} $$
```

显示：
$$ x^{y^z}=(1+{\rm e}^x)^{-2xy^w} $$

此外，如果要在左右两边都有上下标，可以用 \sideset 命令。

例如：
```
$$ \sideset{^1_2}{^3_4}\bigotimes $$
```
显示：
$$ \sideset{^1_2}{^3_4}\bigotimes $$

## 输入分数
通常使用 `\frac {分子} {分母}` 命令产生一个分数，分数可嵌套。 

便捷情况可直接输入 `\frac{a}{b}` 来快速生成一个 \frac{a}{b}。 

如果分式很复杂，亦可使用 `分子 \over 分母` 命令，此时分数仅有一层。

例如：
```
$$\frac{a-1}{b-1} \quad and \quad {a+1\over b+1}$$
```
显示：

$$\frac{a-1}{b-1} \quad and \quad {a+1\over b+1}$$

## 输入开方
使用 `\sqrt [根指数，省略时为2] {被开方数}` 命令输入开方。

例如：
```
$$\sqrt{2} \quad and \quad \sqrt[n]{3}$$
```
显示：
$$\sqrt{2} \quad and \quad \sqrt[n]{3}$$

## 输入省略号
数学公式中常见的省略号有两种，`\ldots` 表示与文本底线对齐的省略号，`\cdots` 表示与文本中线对齐的省略号。

例如：
```
$$f(x_1,x_2,\underbrace{\ldots}_{\rm ldots} ,x_n) = x_1^2 + x_2^2 + \underbrace{\cdots}_{\rm cdots} + x_n^2$$
```
显示：
$$f(x_1,x_2,\underbrace{\ldots}_{\rm ldots} ,x_n) = x_1^2 + x_2^2 + \underbrace{\cdots}_{\rm cdots} + x_n^2$$

## 输入矢量
使用 `\vec{矢量}` 来自动产生一个矢量。也可以使用 `\overrightarrow` 等命令自定义字母上方的符号。

例如：
```
$$\vec{a} \cdot \vec{b}=0$$
```
显示：
$$\vec{a} \cdot \vec{b}=0$$

```
$$\overleftarrow{xy} \quad and \quad \overleftrightarrow{xy} \quad and \quad \overrightarrow{xy}$$
```

显示：
$$\overleftarrow{xy} \quad and \quad \overleftrightarrow{xy} \quad and \quad \overrightarrow{xy}$$

## 输入积分
使用 `\int_积分下限^积分上限 {被积表达式}` 来输入一个积分。

例如：
```
$$\int_0^1 {x^2} \,{\rm d}x$$
```
显示：
$$\int_0^1 {x^2} \,{\rm d}x$$

本例中 `\`, 和 `{\rm d}` 部分可省略，但建议加入，能使式子更美观。

9．如何输入极限运算
使用 `\lim_{变量 \to 表达式}` 表达式 来输入一个极限。如有需求，可以更改 `\to` 符号至任意符号。

例如：
```
$$ \lim_{n \to +\infty} \frac{1}{n(n+1)} \quad and \quad \lim_{x\leftarrow{示例}} \frac{1}{n(n+1)} $$
```
显示：
$$ \lim_{n \to +\infty} \frac{1}{n(n+1)} \quad and \quad \lim_{x\leftarrow{示例}} \frac{1}{n(n+1)} $$

## 输入累加、累乘运算
使用 `\sum_{下标表达式}^{上标表达式} {累加表达式}` 来输入一个累加。 

与之类似，使用 `\prod \bigcup \bigcap` 来分别输入累乘、并集和交集。 

此类符号在行内显示时上下标表达式将会移至右上角和右下角。

例如：
```
$$\sum_{i=1}^n \frac{1}{i^2} \quad and \quad \prod_{i=1}^n \frac{1}{i^2} \quad and \quad \bigcup_{i=1}^{2} R$$
```
显示：
$$\sum_{i=1}^n \frac{1}{i^2} \quad and \quad \prod_{i=1}^n \frac{1}{i^2} \quad and \quad \bigcup_{i=1}^{2} R$$

## 输入希腊字母
输入 `\小写希腊字母英文全称` 和 `\首字母大写希腊字母英文全称` 来分别输入小写和大写希腊字母。 
对于大写希腊字母与现有字母相同的，直接输入大写字母即可。

例如：

| 输入  | 显示 |  输入  | 显示 |
| ----- | :-----: | :----: | :----: |
| \alpha | $\alpha$ | \beta | $\beta$ |
| \gamma | $\gamma$ | \delta | $\delta$ |
| \epsilon | $\epsilon$ | \zeta | $\zeta$ | 
| \eta  | $\eta$ | \theta | $\theta$ |  
| \iota | $\iota$ | \kappa | $\kappa$ |
| \lambda | $\lambda$ | \mu | $\mu$ |
| \nu  | $\nu$ | \xi  | $\xi$ |
| \pi  | $\pi$ | \rho  | $\rho$ |
| \sigma | $\sigma$ | \sigma | $\sigma$ |
| \tau | $\tau$ | \upsilon | $\upsilon$ |
| \phi | $\phi$ | \chi | $\chi$ |
| \psi | $\psi$ | \omega | $\omega$ |
