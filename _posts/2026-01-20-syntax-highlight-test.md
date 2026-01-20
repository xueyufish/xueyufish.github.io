---
layout: post
title: "代码语法高亮测试"
date: 2026-01-20 13:45:00
categories: testing
tags: [测试, 代码, 语法高亮]
---

这是一篇测试文章，用于验证代码块语法高亮功能。

## Python 代码示例

```python
def fibonacci(n):
    """生成斐波那契数列"""
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# 打印前 10 个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

## JavaScript 代码示例

```javascript
// 异步函数示例
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// 使用示例
fetchUserData(123).then(user => {
  console.log('User:', user.name);
});
```

## CSS 代码示例

```css
/* 卡片组件样式 */
.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}
```

## Bash 代码示例

```bash
#!/bin/bash

# 批量重命名文件
for file in *.txt; do
  mv "$file" "${file%.txt}.md"
  echo "Renamed: $file"
done

echo "All files renamed successfully!"
```

## 行内代码示例

在文本中使用 `行内代码` 可以高亮显示关键字。例如：使用 `git commit` 提交代码，使用 `Ctrl+C` 复制内容。

## 深色模式

语法高亮还支持深色模式！如果你的系统设置为深色模式，代码块会自动使用深色主题。

---

**总结**: 语法高亮功能正常工作，支持多种编程语言，美观且易读！
