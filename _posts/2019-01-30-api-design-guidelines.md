---
layout:     post
title:      "REST API 设计指南"
date:       2019-01-30
author:     "xueyufish"
keyword:    "架构设计, REST, API, xueyufish"
tags:
    - 架构设计
    - REST
---

REST(Representational State Transfer) 是在 2000 年由 Roy Fielding 起草的 web services 设计方法。虽然 REST 本身是协议无关的，但是长久以来, 一直用 HTTP 协议作为底层协议使用。

作为使用 HTTP 协议的 RESTful API，主要遵循以下几个设计原则:
 1. REST API 主要围绕资源进行设计，包含任意类型的对象、数据、或者可以被客户端访问的服务;
 2. 每一个资源通常有一个资源标识符，唯一的标识了资源, 例如: `http://example.xueyufish.com/users/1`;
 3. 客户端通过交换资源来表示与服务端的交互，例如，大多数应用使用 JSON 作为交换格式，也有通过 XML 或者 Protobuf 进行交互;
 4. REST API 使用统一接口帮助解耦客户端和服务端实现，最通用的操作包括 GET, POST, PUT, PATCH, 和 DELETE.
 5. REST API 使用无状态请求模型。HTTP 请求应该是独立并且可能以任何顺序发生的，所以不能在请求之间保留瞬时状态信息，唯一可以存储信息的地方是资源本身，每个请求都应该是一个原子操作。
 6. REST API 通过资源中的超文本链接来进行驱动.

# 围绕资源来组织 API
REST API 通常围绕资源来组织，在业务系统中，从架构设计出发，通常会聚焦在业务实体或者领域对象的聚合上。我们在组织资源的 URI 时，应当尽可能的使用资源本身的名词而非基于资源操作的动词。例如，对于订单创建的操作：

```
POST https://example.xueyufish.com/orders //  (1) Good

POST https://example.xueyufish.com/create-order // (2) Bad
```

请求 (1) 使用 POST 方式创建订单(基于订单资源本身的名词)，请求 (2) 基于动词，更加推荐使用第一种。在复杂业务场景中，API 和下游数据库的实体往往不是一一对应的，更好的做法应该是和 DDD 中领域对象的聚合相对应。

此外，推荐在 API 中采用统一风格的命名习惯，保留一致性的结构层次。例如：
```
GET https://example.xueyufish.com/orders    // (3)

GET https://example.xueyufish.com/orders/{id}   // (4)
```
请求 (3) 查询所有的订单列表，请求 (4) 查询具体 id 的订单信息。在 URI 中，通常推荐复数形式。

也可以使用类似的层级关系来表达更深层的逻辑含义，例如：
```
GET https://example.xueyufish.com/orders/1/customers    // (5)

GET https://example.xueyufish.com/customers/10/orders   // (6)
```
请求 (5) 查询订单 1 下所关联的所有客户信息，而请求 (6) 则查询客户 10 下所关联的所有订单信息。

对于一些非 CRUD 的操作，也可以采用类似的方法，例如 Github API 中的 ([star a gist](http://developer.github.com/v3/gists/#star-a-gist)) 和 ([unstar](http://developer.github.com/v3/gists/#unstar-a-gist)) 分别执行 `PUT /gists/:id/star` 和 `DELETE /gists/:gist_id/star` 操作。

# 根据 HTTP 方法定义操作
HTTP 协议定义了为请求分配语义级别含义的方法，大多数 RESTful API 使用的常见 HTTP 方法包括：
* GET: 用于从指定的 URI 接收资源.
* POST: 用于从指定的 URI 创建资源或触发某种操作.
* PUT: 用于从指定的 URI 创建或者更新资源
* PATCH: 用于从指定的 URI 对资源进行部分更新
* DELETE: 用于从指定的 URI 对资源移除

以订单和客户举例如下:

| Resource | POST | GET | PUT | PATCH | DELETE |
| ---- | ---- | ---- | ---- | ---- | ---- | 
| /customers | 创建新客户 | 获取所有客户 | 批量更新客户 |  删除所有客户 | 
| /customers/1 | -- | 获取客户 1 详情 | 如果客户 1 存在则更新 | 删除客户 1 |
| /customers/1/orders | 为客户 1 创建新订单 | 获取客户 1 的所有订单 | 批量更新客户 1 的所有订单 | 删除客户 1 的所有订单 |

其中 POST、PUT 和 PATCH 常常会被混淆，主要区别如下:
* POST 主要被用来向服务申请创建资源。在 REST 中，主要被应用于集合类型，也可以被用做提交数据给服务做处理。
* PUT 用于更新资源。请求体中包含资源的完整描述，在 REST 中，更多被应用于独立的元素。服务端判断如果请求的资源已经存在，就用新的资源取代它，否则创建一个新的资源(具体是否创建依赖于服务实现)。
* PATCH 用来对资源进行部分更新操作，请求体中通常只包含需要变更的部分内容。如果服务实现需要支持，请求的资源如果不存在 PATCH 也可以创建新的资源。

# 遵循 HTTP 语义实现
设计 REST API 时，应当尽可能遵循 HTTP 语义，以下列出了几点需要注意的：

## Media types 
在 HTTP 协议中，API 消费者和服务通过请求和响应来交换资源，而交互格式通过 `MIME types` 来定义。例如，对于 JSON 格式使用 `media type = application/json`, 对于 XML 格式使用 `media type = application/xml`。请求和响应的 `Content-Type` 头包含了具体的资源格式，例如以下 POST 请求包含 JSON 格式数据：
```
POST https://example.xueyufish.com/orders HTTP/1.1
Content-Type: application/json; charset=utf-8
Content-Length: 57

{"Id":1,"Name":"xueyufish","Category":"Widgets","Price":1.99}
```
如果服务端不支持指定的媒体类型，将返回 HTTP 状态码 `415(Unsupported Media Type)`。

客户端也可以在请求头中包含一个 Accept 字段指定期望从服务端接收的媒体类型的列表，例如：
```
GET https://example.xueyufish.com/orders HTTP/1.1
Accept: application/json
```
如果服务端不能匹配任何媒体类型，将返回 HTTP 状态码 `406(Not Acceptable)`。

## GET 方法
* 查询成功: 返回 HTTP 状态码 `200(OK)`
* 不能找到指定资源: 返回 HTTP 状态码 `404(Not Found)`

## POST 方法
* 成功创建新资源: 返回 HTTP 状态码 `201(Created)`。新创建资源的 URI 将包含在响应头的 Location 字段中，响应体包含新创建资源的内容；
* 进行其他处理操作: 返回 HTTP 状态码 `200(OK)`, 并将操作结果包含在响应体中一起返回；如果操作没有返回结果，返回 HTTP 状态码 `204(No Content)`
* 请求体包含无效数据: 返回 HTTP 状态码 `400(Bad Request)`, 响应体包含额外的错误信息或者 URI。

## PUT 方法
* 成功创建新资源: 和 POST 类似，返回 HTTP 状态码 `201(Created)`
* 成功更新资源: 返回 HTTP 状态码 `200(OK)` 或者 `204 (No Content)`. 

## PATCH 方法
PATCH 方法规范([RFC 5789](https://tools.ietf.org/html/rfc5789))对于 PATCH 方法的格式没有做出特殊定义，具体格式需要依赖于实现的媒体类型。对于 JSON 格式，可分为 `JSON patch` 和 `JSON merge patch` 两种。

JSON merge patch 从结构上相对简单。PATCH 方法的格式和原始的 JSON 资源格式类似，内容上为原始 JSON 的子集，包含需要增加或修改的内容，对于需要删除的内容标记为 `null`。例如，如下：
```json
{
    "name":"gizmo",
    "category":"widgets",
    "color":"blue",
    "price":10
}
```
对应的 PATCH 方法资源为：
```json
{
    "price":12,
    "color":null,
    "size":"small"
}
```
这个 PATCH 方法告诉服务修改 price 字段，删除 color 字段，并且增加 size 字段。对于 JSON merge patch, 媒体类型为 `application/merge-patch+json`，详情可见 [RFC 7396](https://tools.ietf.org/html/rfc7396)。

对于 JSON merge patch 来说，缺点在于原始 JSON 文档中不能包含 null 值，并且无法指定 update 操作的顺序，而 JSON patch 提供了更加灵活的方式，详情可参见 [RFC 6902](https://tools.ietf.org/html/rfc6902)。

## DELETE 方法
* 成功删除资源: 返回 HTTP 状态码 `204(No Content)`
* 资源不存在: 返回 HTTP 状态码 `404(Not Found)`

## 异步操作
有时请求发送给服务端以后，服务端需要一段较长时间来进行处理，此时如果客户端一直等待响应消息，会导致延迟非常长。所以，比较理想的选择是将消息转化为异步处理。

进行异步操作时，服务端对于异步请求会响应 HTTP 状态码 `202 (Accepted)` 表示当前请求已经被接收处理但是尚未完成。

服务端可以提供一个状态接口返回异步请求的状态，客户端通过轮询此接口来查询当前异步请求状态情况。通常状态接口的地址会随着 HTTP 状态码 202 一起返回，例如：
```http
HTTP/1.1 202 Accepted
Location: /api/status/12345
```
如果客户端后续发送一个 GET 请求至状态接口，状态接口响应中应当包含异步操作的当前状态，也可以包含预计完成时间和取消操作的链接地址，例如：
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status":"In progress",
    "link": { "rel":"cancel", "method":"delete", "href":"/api/status/12345" }
}
```
如果异步操作创建了一个新的资源，状态接口应当返回 HTTP 状态码 `303(See Other)`，同时在 Location 头中包含新资源的 URI，例如：
```http
HTTP/1.1 303 See Other
Location: /api/orders/12345
``` 

# 结果筛选、排序和搜索

在 API 设计过程中应当尽可能的保证原始基准 URI 的简单清晰。对于复杂的筛选、排序和搜索请求，可以通过在查询字符串中添加条件来实现：

## 筛选
对实现筛选的每个字段使用唯一的查询参数。

例如，当从 `/orders` 接口请求订单列表时，可能希望将其限制为仅查询状态为已完成，这时可以通过 `GET /orders?status=finished` 之类的请求来完成。这里，`state` 是一个实现过滤器的查询参数。

## 排序
类似于筛选，排序可以通过参数 `sort` 来描述。

sort 参数可以接受逗号分隔的字段列表来适应复杂的排序要求，每个字段都可能有一元负数，以表示降序排序顺序，例如：

* `GET /customers?sort=-age`, 表示按客户的年龄降序排列
* `GET /customers?sort=-age, name`, 表示按客户的年龄降序排列, 按姓名升序排列

## 搜索
当使用类似 Elasticsearch 之类的全文搜索进行搜索时，通常在查询字符串中增加参数 `q` 以表示为字段为全文搜索类型，字段将被传递给搜索引擎处理

## 限制字段返回
有时 API 的客户端消费者并不总是需要资源的完整表示，选择返回部分字段的能力可以在很大程度上使 API 使用者最小化网络流量。

可以在查询字符串中添加接受逗号分隔的字段列表的 `fields` 参数来达到这个目的。例如：

```
GET /customers?fields=id,name,age,updated_at&state=open&sort=-updated_at
```

服务端接收到上述请求后，将只返回 `id,name,age,updated_at` 字段。

# 版本化
给 RESTful APIs 添加版本主要有以下几种方式：

## URI 版本
URI 版本的方式直接在请求 URI 中添加版本号，是相对简单的方式，但是依赖服务端路由请求到指定的 endpoint。例如：

```
https://example.xueyufish.com/v2/customers/3
```

但是，当 Web API 经过多次迭代时，它可能变得难以操作，并且服务器必须支持许多不同的版本。同时这个方案还会使得 HATEOAS 的实现复杂化，因为所有链接都需要包含版本号。

## 查询字符串版本
查询字符串版本的方式就是将版本号放在 URI 的查询字符串中，如下：
```
https://example.xueyufish.com/customers/3?version=2
```
这种方法具有语义上的优势，即总是从相同的URI中检索相同的资源，但它依赖于处理请求的代码来解析查询字符串并返回适当的HTTP响应。同样，这个方案也会使得 HATEOAS 的实现复杂化，因为所有链接都需要包含版本号。

## 头部版本
头部版本指客户端将版本号添加在自定义头中，随请求一起发送给服务端，例如：
```
GET https://exmaple.xueyufish.com/customers/3 HTTP/1.1
Custom-Header: api-version=1
```
相比较前两种，此种方式实现 HATEOAS 需要在链接中包含自定义头。

## 媒体类型版本
媒体类型版本值客户端发起请求时将版本号放置在 Accept 头中。客户端通过 Accept 头来指定期望从服务端接收的媒体类型的列表，例如：
```
GET https://exmaple.xueyufish.com/customers/3 HTTP/1.1
Accept: application/vnd.example-xueyufish.v1+json
```
上述请求的 Accept 头中 `vnd.example-xueyufish.v1` 告诉服务端返回版本 1 的资源，同时 json 元素通知服务端响应体以 json 格式返回。

web 服务端接收请求后，以 `Content-Type` 头返回:
```http
HTTP/1.1 200 OK
Content-Type: application/exmaple.xueyufish.com.v1+json; charset=utf-8

{"id":3,"name":"Contoso LLC","address":"1 Microsoft Way Redmond WA 98053"}
```
如果 Accept 头为指定任何媒体类型或者不匹配，服务端将返回 HTTP 状态码 `406(Not Acceptable)`。

相比较而言，此种方法应该是 RESTful APIs 版本实现中最好的一种，对 HATEOAS 支持也最好。

# 安全性
## SSL
无论在什么情况下，都启用 SSL，在今天的互联网上是最保险的。始终使用 SSL 的另一个优点是因为可以使用简单的访问令牌而无需对每个 API 请求进行签名校验，从而简化了身份验证工作。

要注意的是对 API URL 的非 SSL 访问，不可以重定向到它们的 SSL 对应端，而应当抛出一个错误。

## 认证
RESTful API 应该是无状态的，意味着请求身份验证不应依赖于 cookie 或者 session 来实现。相反，每个请求都应该带有某种类型的身份验证凭据。

通过始终使用 SSL，可以将身份验证凭据简化为随机生成的访问令牌，该令牌在 [HTTP Basic Auth](https://en.wikipedia.org/wiki/Basic_access_authentication) 的用户名字段中提供。它可以通过浏览器进行交互，如果从服务器接收到 HTTP 状态码 `401 Unauthorized`，浏览器可以弹出一个询问凭据的提示。

但是，上述这种方式只有在需要将 access_token 从管理接口复制到 API 消费者环境的情况下才适用。在不可能这样做的情况下，例如对于第三方应用，应该使用 [OAuth2](http://oauth.net/2/) 向第三方提供安全令牌传输。OAuth2 使用 [Bearer Token](https://tools.ietf.org/html/rfc6750)，它的底层传输加密还依赖于 SSL。

对于需要支持 JSONP 请求的 API，因为 JSONP 请求无法发送 `HTTP Basic Auth` 凭证或`Bearer token`，在这种情况下，可以在查询字符串中添加 `access_token` 参数。

# 缓存
HTTP 协议本身提供了内置的缓存框架，通常我们只需要包含一些额外的出站响应头，并在收到一些入站请求头时进行一些验证。常见的方式包括 [ETag](https://en.wikipedia.org/wiki/HTTP_ETag) 和 [Last-Modified](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.29)

## Etag
当生成响应时，在 HTTP Etag 头中包含一个 hash 或者响应内容的校验和，如果响应内容发生改变，那么 Etag 值也将发生改变。如果入站请求包含一个携带匹配 Etag 值的 `If-None-Match` 头，API 将返回 HTTP 状态码 `304 Not Modified`.

## Last-Modified
与 Etag 类似，不同在于使用 timestamps 来表示。Last-Modified 响应头包含一个 [RFC 1123](http://www.ietf.org/rfc/rfc1123.txt) 格式的时间戳，在内容修改后根据 `If-Modified-Since` 进行校验

# 频率限制
为了防止 API 被滥用或攻击，标准做法是添加某种速率限制, [RFC6585](http://tools.ietf.org/html/rfc6585) 引入了 HTTP 状态码 `429(Too Many Requests)`。

目前比较常用的方式是服务端在 API 响应中加入以下自定义头：
* X-Rate-Limit-Limit: 表示时间窗内允许的最大请求数
* X-Rate-Limit-Remaining: 表示当前时间窗内的剩余请求数
* X-Rate-Limit-Reset: 表示当前时间窗剩余的秒数
  
可参见[Github Rate Limiting](https://developer.github.com/v3/#rate-limiting)

# 错误处理
API 应始终返回合理的 HTTP 状态代码。API 错误通常分为两种类型：客户端错误返回 4xx 系列状态码, 服务端错误范围 5xx 系列状态码。对于 API ，应该将所有 4xx 错误都带有可标准化的 JSON 错误表示。如果可能的化（即如果负载均衡器和反向代理可以创建自定义的错误体），应该对 5xx 系列状态码也进行标准化错误表示。

当错误发生时，JSON 类型的错误体应当为开发者提供以下错误信息：一条有用的错误消息、一个唯一的错误代码以及尽可能的详细描述。例如：
```json
{
  "code" : 1234,
  "message" : "Something bad happened :(",
  "description" : "More details about the error here"
}
```

PUT、PATCH 和 POST 请求的验证错误需要字段细分，对于验证失败，最好使用固定的顶级错误代码进行，并在其他错误字段中提供详细的错误，例如：
```json
{
  "code" : 1024,
  "message" : "Validation Failed",
  "errors" : [
    {
      "code" : 5432,
      "field" : "first_name",
      "message" : "First name cannot have fancy characters"
    },
    {
       "code" : 5622,
       "field" : "password",
       "message" : "Password cannot be blank"
    }
  ]
}
```

# HTTP 状态码
HTTP 协议定义了一系列有意义的状态代码([List of HTTP status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes))，这些代码可以从 API 返回，用来帮助 API 使用者路由或者处理他们的响应。结合上文所述，其中主要常用的状态码总结如下：
* `200 OK`: 成功的 GET, PUT, PATCH 或者 DELETE 请求响应，也可用于非资源创建场景下的 POST 请求。
* `201 Created`: 响应创建新资源的 POST 请求，应同时包含 `Location` 头指向一个新创建的资源 URI。
* `204 No Content`: 对不会返回正文的成功请求的响应。
* `304 Not Modified`: 当 HTTP 缓存头被使用时返回。
* `400 Bad Request`: 请求的格式不正确，例如请求的 body 部分无法解析
* `401 Unauthorized`: 表示未提供身份验证详细信息或提供的身份验证详细信息无效。如果从浏览器使用 API，可以触发弹出请求认证窗口
* `403 Forbidden`: 表示身份验证成功但经过身份验证的用户无权访问资源
* `404 Not Found`: 表示请求一个不存在的资源
* `405 Method Not Allowed`: 表示请求的方法对当前请求的资源不支持。例如对一个创建资源的 POST 方法发起 GET 请求。
* `410 Gone`: 用于表示请求资源不可用并且在未来版本中也不会再支持，常被用于旧 API 版本的总体响应。
* `415 Unsupported Media Type`: 请求实体具有服务器或资源不支持的媒体类型
* `422 Unprocessable Entity`: 请求的格式正确，但由于语义错误而无法执行，主要用于验证错误
* `429 Too Many Requests`: 请求由于流量限制被拒绝


# 参考资料

[API design](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design)

[Heroku Platform API Guidelines](https://geemus.gitbooks.io/http-api-design/content/en/)

[Best Practices for Designing a Pragmatic RESTful API](https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)

[Github API v3](tttps://developer.github.com/v3/)