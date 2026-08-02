---
name: xueyufish-post-creator
description: 为 xueyufish.github.io 博客创建新文章（post）。用户提供中文标题后，自动生成符合本站规范的 post 文件：英文 slug 文件名、完整 front matter（layout/title/description/date/author/keyword/tags）。只生成 front matter 和空正文骨架，不写正文内容。日期等不确定信息需先与用户确认，生成内容必须展示给用户确认后才写入文件。用户说"帮我写篇文章"、"创建 post"、"新文章"、"起个标题"、"写博客"时触发。
---

# xueyufish-post-creator

为 `/Users/yuxiumin/Works/github/xueyufish/xueyufish.github.io` 博客创建新文章骨架。

## 目标

- 用户只提供中文标题（可能附带少量主题信息），其余一切字段由本 skill 生成
- 只生成 front matter + 空正文，**绝不**代写正文内容
- 输出格式与现有文章完全一致（见下），SEO 友好
- 写入 `_posts/` 前必须将完整内容展示给用户确认

## 触发方式

本 skill 通过斜杠命令 `/xueyufish-post-creator` 触发，也支持自然语言触发。

**斜杠命令用法**（命令名即 skill 名）：

```
/xueyufish-post-creator 3万字讲透AI必懂的60个核心概念
```

- 命令后跟的内容作为**标题参数**，直接解析为文章标题
- 例如 `/xueyufish-post-creator 文章标题` → title = "文章标题"
- 若命令后没有参数，则询问用户要创建的文章标题
- 标题后若附带额外信息（如"聚焦XXX"），作为主题参考用于生成 description/keyword/tags

## 文章格式规范（必须严格遵守）

文件名格式：`YYYY-MM-DD-english-slug.md`

front matter 模板（严格按此字段顺序和缩进）：

```yaml
---
layout:     post
title:      "中文标题"
description: "SEO 描述，从主题提炼，50-100字，中文"
date:       YYYY-MM-DD
author:     "yuxiumin"
keyword:    "关键词1, 关键词2, 关键词3, yuxiumin"
tags:
    - 标签1
    - 标签2
---
```

字段说明：

- **layout**: 固定为 `post`
- **title**: 用户提供的中文标题（保留引号）
- **description**: 从标题和主题提炼的 SEO 描述。要点：描述文章内容而非作者、包含核心关键词、50-100 字、有吸引力。参考：`"RESTful API 设计指南：资源组织、命名规范、版本管理、分页过滤、错误处理、安全认证等实战经验总结"`
- **date**: 默认当天（Asia/Shanghai 时区，格式 `YYYY-MM-DD`）。**必须询问用户确认**，不能擅自定
- **author**: 固定 `"yuxiumin"`
- **keyword**: 逗号分隔，3-5 个关键词，**必须以 `yuxiumin` 结尾**。参考：`"分布式, 锁, Lock, 分布式锁, Redis, Mysql, Zookeeper, yuxiumin"`
- **tags**: 2-4 个标签，每行 `    - 标签`（4 空格缩进）。优先复用本站已有标签：设计模式、分布式、Redis、Java、架构设计、区块链、缓存、程序语言、REST、消息队列、工作、生活、AI、Agent、读书笔记、DevOps、比特币、事务、Nginx、Kong、C、Lua、Markdown

## 工作流程

1. **解析输入**：提取用户的中文标题。如果标题表述模糊，追问澄清（例如用户只给了主题没给确切标题时）

2. **生成 slug**：将标题翻译成简洁的英文小写短横线格式。
   - 规则：核心主题词 + 修饰词，一般 2-5 个词，不要过长
   - 参考现有 slug：`raft-protocol-intro`、`api-design-guidelines`、`cache-update-strategy`、`ai-agent-book-reading-chapter-one`
   - 生成后展示给用户，如与预期不符可调整

3. **确认日期**：向用户询问发布日期，给出默认建议（今天），等用户确认

4. **生成 front matter**：按上方模板生成全部字段，description/keyword/tags 由 AI 从标题与主题推断生成

5. **组装完整文件内容**：

```
---
layout:     post
title:      "..."
description: "..."
date:       YYYY-MM-DD
author:     "yuxiumin"
keyword:    "..."
tags:
    - ...
    - ...
---

（此处留空，正文由用户后续自行编写）
```

6. **展示待确认**：将「文件名 + 完整内容」原样展示给用户，明确请用户确认。用户确认前**不写入任何文件**

7. **写入文件**：确认后写入 `_posts/YYYY-MM-DD-english-slug.md`。文件名中 slug 可能与标题中英文词不完全一致，以第 2 步确认过的 slug 为准

## 注意事项

- 不要创建 `_drafts/` 下的文件——用户要的是可直接发布的 post
- 不要在 front matter 中添加本站不认识的字段（如 og-image、edit-date 等，除非用户明确要求）
- 若用户给的标题与已有文章标题重复或高度相似，先提醒用户
- 正文区域留空即可，不要写"待补充"之类的占位符文本
- 展示内容时用代码块包裹，方便用户直接复制比对
