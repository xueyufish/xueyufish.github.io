---
layout:     post
title:      "Kong Api网关简介(二) 插件"
date:       2018-07-09
author:     "余修忞(xueyufish)"
keyword:    "开源项目, 网关, Gateway, Kong, Nginx, 余修忞, yuxiumin, xueyufish"
description: "Kong Api网关插件简介"
tags:
    - 开源项目
    - Kong
    - Nginx
    - Lua
---

Kong 通过强大的插件机制进行了类似AOP切面的方式操作，提供了日志、认证、限流等操作。官方给出了许多成熟插件可供选择，包括：

1. 认证：[Basic Authentication](https://docs.konghq.com/plugins/basic-authentication/)、[Key Authentication](https://docs.konghq.com/plugins/key-authentication)、[OAuth 2.0 Authentication](https://docs.konghq.com/plugins/oauth2-authentication)、[JWT](https://docs.konghq.com/plugins/jwt)、[LDAP Authentication](https://docs.konghq.com/plugins/ldap-authentication)
2. 安全：[ACL](https://docs.konghq.com/plugins/acl)、[CORS](https://docs.konghq.com/plugins/cors/)、[Dynamic SSL](https://docs.konghq.com/plugins/dynamic-ssl/)、[IP Restriction](https://docs.konghq.com/plugins/ip-restriction/)、[Bot Detection](https://docs.konghq.com/plugins/bot-detection/)
3. 传输控制：[Request Size Limiting](https://docs.konghq.com/plugins/request-size-limiting/)、[Rate Limiting](https://docs.konghq.com/plugins/rate-limiting/)、[Response Rate Limiting](https://docs.konghq.com/plugins/response-rate-limiting/)、[Request Termination](https://docs.konghq.com/plugins/request-termination/)、
4. 分析监控：[Prometheus](https://docs.konghq.com/plugins/prometheus/)、[Zipkin](https://docs.konghq.com/plugins/zipkin/)、[Datadog](https://docs.konghq.com/plugins/datadog/?_ga=2.98021463.993409543.1531102804-1191622050.1530857411)
5. 日志：[TCP Log](https://docs.konghq.com/plugins/tcp-log/)、[UDP Log](https://docs.konghq.com/plugins/udp-log/)、[HTTP Log](https://docs.konghq.com/plugins/http-log/)、[File Log](https://docs.konghq.com/plugins/file-log/)、[StatsD](https://docs.konghq.com/plugins/statsd/)、[Syslog](https://docs.konghq.com/plugins/syslog/)、[Loggly](https://docs.konghq.com/plugins/loggly/)
6. 请求响应调整：[Request Transformer](https://docs.konghq.com/plugins/request-transformer/)、[Response Transformer](https://docs.konghq.com/plugins/response-transformer/)、[Correlation ID](https://docs.konghq.com/plugins/correlation-id/)
7. Serverless：[Serverless Functions](https://docs.konghq.com/plugins/serverless-functions/)、[Azure Functions](https://docs.konghq.com/plugins/azure-functions/)、[AWS Lambda](https://docs.konghq.com/plugins/aws-lambda/)、
[Apache OpenWhisk](https://docs.konghq.com/plugins/openwhisk/)

下面从官网的例子 key-auth 插件来看具体使用

### 插件使用

首先执行命令给 Service 添加一个 key-value 插件。此处假设已经存在了一个名为 baidu-service 的服务，具体服务的创建参见[Kong Api网关简介(一) 安装运行](http://www.yuxiumin.com/2018/07/08/kong-api-gateway-install/)

命令行执行命令：
```shell
$ curl -i -X POST \
>   --url http://127.0.0.1:8001/services/baidu-service/plugins/ \
>   --data 'name=key-auth'
HTTP/1.1 201 Created
Date: Mon, 09 Jul 2018 06:53:31 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Server: kong/0.14.0
Content-Length: 276

{"created_at":1531119211000,"config":{"key_in_body":false,"run_on_preflight":true,"anonymous":"","hide_credentials":false,"key_names":["apikey"]},"id":"4d08e1fd-fb3f-4e5a-8a11-e20ad49c9f4b","enabled":true,"service_id":"edbe2f0f-f11e-493b-9b59-5997e50c3de1","name":"key-auth"}
```

可以通过管理API查看插件的其他管理操作，具体参见[Kong Admin API Plugin Object](https://docs.konghq.com/0.14.x/admin-api/#plugin-object)

这时候再执行上一篇文章中执行的命令访问 8000 端口的接口地址，显示找不到 API key，说明 key-auth 插件已经起作用：
```shell
$ curl -i -X GET \
>   --url http://127.0.0.1:8000/ \
>   --header 'Host: baidu.com'
HTTP/1.1 401 Unauthorized
Date: Mon, 09 Jul 2018 08:47:10 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
WWW-Authenticate: Key realm="kong"
Server: kong/0.14.0
Content-Length: 41

{"message":"No API key found in request"}
```

为了继续测试，我们创建一个consumer，执行命令：
```shell
[xueyufish@izbp13cqwumhn3wzp2j5mqz kong-gateway]$ curl -i -X POST \
>   --url http://127.0.0.1:8001/consumers/ \
>   --data "username=xueyufish"
HTTP/1.1 201 Created
Date: Mon, 09 Jul 2018 08:52:13 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Server: kong/0.14.0
Content-Length: 110

{"custom_id":null,"created_at":1531126333,"username":"xueyufish","id":"580046a0-bbf0-4b9f-91ad-9324976df6be"}
```

Kong 中的消费者对象代表了一个服务的消费者或者一个用户。我们可以使用 Kong 作为消费者数据存储，或者也可以将用户列表映射到数据库，以保持 Kong 与现有主数据存储的一致性；在BFF模型下，也可以为每个业务实现，或者client定义一个消费者，例如：ios、android、pc，或者针对具体不同的业务实现具备不同的消费者，具体根据业务需要而定。

然后，执行命令给创建的消费者添加一个key：
```shell
$ curl -i -X POST \
>   --url http://127.0.0.1:8001/consumers/xueyufish/key-auth/ \
>   --data 'key=123456'
HTTP/1.1 201 Created
Date: Mon, 09 Jul 2018 09:05:59 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Server: kong/0.14.0
Content-Length: 141

{"id":"b18b0c03-4632-4ca5-8f0c-814d04da1022","created_at":1531127160000,"key":"123456","consumer_id":"580046a0-bbf0-4b9f-91ad-9324976df6be"}
```

这时候在访问的请求header中带上apiKey参数，可以发现能够成功访问：
```shell
$ curl -i -X GET \
>   --url http://127.0.0.1:8000 \
>   --header "Host: baidu.com" \
>   --header "apikey: 123456"
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 2381
Connection: keep-alive
Accept-Ranges: bytes
Cache-Control: private, no-cache, no-store, proxy-revalidate, no-transform
Date: Mon, 09 Jul 2018 09:09:15 GMT
Etag: "588604c8-94d"
Last-Modified: Mon, 23 Jan 2017 13:27:36 GMT
Pragma: no-cache
Server: bfe/1.0.8.18
Set-Cookie: BDORZ=27315; max-age=86400; domain=.baidu.com; path=/
X-Kong-Upstream-Latency: 54
X-Kong-Proxy-Latency: 33
Via: kong/0.14.0

<!DOCTYPE html>
<!--STATUS OK--><html>... 省略html内容 ...</html>

```

### 插件分析

#### 文件结构

Kong 插件的文件结构分基本插件模块和完整插件模块两种，基本插件模块结构如下：
```
simple-plugin
├── handler.lua
└── schema.lua
```
其中，handler.lua 是插件核心，它是一个接口实现，其中每个函数将在请求生命周期中的期望时刻运行。schema.lua 用于定义插件配置

完整插件模块结构如下：
```
complete-plugin
├── api.lua
├── daos.lua
├── handler.lua
├── migrations
│   ├── cassandra.lua
│   └── postgres.lua
└── schema.lua
```

其中，api.lua 定义管理API操作接口；daos.lua 定义插件需要并且存储在数据库的实体的DAOs列表；migrations/*.lua 定义了给定数据存储的相应迁移，通常只有当插件必须在数据库中存储自定义实体并通过daos.lua定义的DAO进行交互时，迁移才是必要的。

具体关于文件结构的描述参见[Plugin Development - File Structure](https://docs.konghq.com/0.14.x/plugin-development/file-structure/)

#### 插件配置

Kong 插件通过schema.lua文件定义配置。schema.lua 返回一个Table类型，包含no_consumer、fields、self_check三个属性：

| 属性名 | Lua 类型 | 默认值 | 描述 |
| :---- | :---- | :---- | :---- |
| no_consumer | Boolean | false | 如果为<code>true</code>将不能应用此插件至指定消费者，只能被应用到 Services 或者 Routes, 例如：认证插件 |
| fileds | Table | {} | 插件的 schema，使用一个键值对定义可用属性和他们的规则 |
| self_check | Function | nil | 如果在接受插件配置之前需要进行自定义验证，需要实现此函数 |

schema.lua 文件样本如下：
```lua
return {
  no_consumer = true, -- this plugin will only be applied to Services or Routes,
  fields = {
    -- Describe your plugin's configuration's schema here.
  },
  self_check = function(schema, plugin_t, dao, is_updating)
    -- perform any custom verification
    return true
  end
}
```
更多具体配置参见 [Plugin Development - Store Configuration](https://docs.konghq.com/0.14.x/plugin-development/plugin-configuration/)

从 key-auth 插件的 schema 文件可以看出，定义了五个 field, 其中刚用到的 key_name 默认为必填，类型为 array, 默认值为一个名为default_key_names的function，同时附加了 check_keys function 用于验证header。
```lua
local function check_keys(keys)
  for _, key in ipairs(keys) do
    local res, err = utils.validate_header_name(key, false)

    if not res then
      return false, "'" .. key .. "' is illegal: " .. err
    end
  end

  return true
end


local function default_key_names(t)
  if not t.key_names then
    return { "apikey" }
  end
end

return {
  no_consumer = true,
  fields = {
    key_names = {required = true, type = "array", default = default_key_names, func = check_keys},
    hide_credentials = {type = "boolean", default = false},
    ...
  }
}
```

#### 逻辑实现

Kong 插件可以在请求/响应生命周期中的几个入口点注入自定义逻辑，插件实现者必须在 handler.lua 中实现 base_plugin.lua 文件中的一个或多个接口。
base_plugin.lua 文件中的几个方法如下：

| 函数名 | LUA-NGINX-MODULE Context | 描述 |
| :---- | :---- | :---- |
| :init_worker() | [init_worker_by_lua](https://github.com/openresty/lua-nginx-module#init_worker_by_lua) | 在每个 Nginx 工作进程启动时执行 |
| :certificate() | [ssl_certificate_by_lua](https://github.com/openresty/lua-nginx-module#ssl_certificate_by_lua_block) | 在SSL握手阶段的SSL证书服务阶段执行 |
| :rewrite() | [rewrite_by_lua](https://github.com/openresty/lua-nginx-module#rewrite_by_lua) | 从客户端接收作为重写阶段处理程序的每个请求执行。在这个阶段，无论是API还是消费者都没有被识别，因此这个处理器只在插件被配置为全局插件时执行 |
| :access()	 | [access_by_lua](https://github.com/openresty/lua-nginx-module#access_by_lua) | 为客户的每一个请求而执行，并在它被代理到上游服务之前执行 |
| :header_filter() | [header_filter_by_lua](https://github.com/openresty/lua-nginx-module#header_filter_by_lua) | 从上游服务接收到所有响应头字节时执行 |
| :body_filter() | [body_filter_by_lua](https://github.com/openresty/lua-nginx-module#body_filter_by_lua) | 从上游服务接收的响应体的每个块时执行。由于响应流回客户端，它可以超过缓冲区大小，因此，如果响应较大，该方法可以被多次调用 |
| :log() | [log_by_lua](https://github.com/openresty/lua-nginx-module#log_by_lua) | 当最后一个响应字节已经发送到客户端时执行 |

key-auth 插件的 handler.lua 文件实现了其中的 access() 方法：
```lua
function KeyAuthHandler:access(conf)
  KeyAuthHandler.super.access(self)

  -- check if preflight request and whether it should be authenticated
  if not conf.run_on_preflight and get_method() == "OPTIONS" then
    return
  end

  if ngx.ctx.authenticated_credential and conf.anonymous ~= "" then
    -- we're already authenticated, and we're configured for using anonymous,
    -- hence we're in a logical OR between auth methods and we're already done.
    return
  end

  local ok, err = do_authentication(conf)
  if not ok then
    if conf.anonymous ~= "" then
      -- get anonymous user
      local consumer_cache_key = singletons.dao.consumers:cache_key(conf.anonymous)
      local consumer, err = singletons.cache:get(consumer_cache_key, nil,
                                                 load_consumer,
                                                 conf.anonymous, true)
      if err then
        responses.send_HTTP_INTERNAL_SERVER_ERROR(err)
      end
      set_consumer(consumer, nil)
    else
      return responses.send(err.status, err.message)
    end
  end
end
```

除此之外，Kong 还提供了数据访问、插件缓存、管理API等可以自定义功能，具体参见[Kong Plugin Development](https://docs.konghq.com/0.14.x/plugin-development/)


### 自定义插件

下面创建一个 hello-world 自定义插件，插件本身并没有太大意义，只为了演示流程。

#### 准备

为了更方便测试，先卸载之前镜像，删除本地的postgres数据库重新pull。
```shell
$ docker-compose down
$ sudo rm -rf postgresql/*
```

在 kong-gateway/plugins目录下添加两个文件 handler.lua 和 schema.lua，内容如下:
```lua
-- handler.lua
local BasePlugin = require "kong.plugins.base_plugin"
local HelloWorldHandler = BasePlugin:extend()

local ngx_log = ngx.log
local DEBUG = ngx.DEBUG

HelloWorldHandler.PRIORITY = 3000

function HelloWorldHandler:new()
  HelloWorldHandler.super.new(self, "hello-world")
end

function HelloWorldHandler:access(conf)
  HelloWorldHandler.super.access(self)

  if conf.say_hello then
    ngx_log(DEBUG, "============ Hello World! ============")
    ngx.header["Hello-World"] = "=== Hello World ==="
  else
    ngx_log(DEBUG, "============ Bye World! ============")
    ngx.header["Hello-World"] = "=== Bye World ==="
  end

end

return HelloWorldHandler
```

```lua
-- schema.lua
return {
  no_consumer = true,
  fields = {},
  self_check = function(schema, plugin_t, dao, is_updating)
    return true
  end
}
```

同时，在 kong-gateway/kong.conf 配置文件中增加插件配置:
```conf
plugins = hello-world
```

此时目录结构如下：
```
kong-gateway
| -- config
	| -- kong.conf
| -- plugins
  | -- hello-world
    | -- handler.lua
    | -- schema.lua
| -- postgresql
| -- docker-compose.yml
```

由于在 docker-compose.yml 中指定了 plugins 目录的挂载点为 /etc/kong/plugins，此时可以查看刚添加的 hello-world 目录已经被挂载到 docker 容器中：
```shell
$ docker-compose exec kong ls -la /etc/kong/plugins/hello-world
total 16
drwxrwxr-x    2 1000     1000          4096 Jul 10 02:38 .
drwxrwxr-x    3 1000     1000          4096 Jul 10 02:38 ..
-rw-r--r--    1 1000     1000           822 Jul 10 02:04 handler.lua
-rw-r--r--    1 1000     1000           345 Jul  6 09:25 schema.lua
```

重新迁移数据库，启动 kong:
```shell
$ docker-compose run kong kong migrations up
$ docker-compose up --no-recreate –d
```

容器启动以后，根据[Kong Api网关简介(一) 安装运行](http://www.yuxiumin.com/2018/07/08/kong-api-gateway-install/)中的内容添加Service、Route，再添加插件：
```shell
$ curl -i -X POST \
>   --url http://127.0.0.1:8001/plugins/ \
>   --data 'name=hello-world'
HTTP/1.1 201 Created
Date: Tue, 10 Jul 2018 06:51:12 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Server: kong/0.14.0
Content-Length: 137

{"created_at":1531205473000,"config":{"say_hello":true},"id":"bf733b5a-c49f-46b3-a680-a7e3a75414ac","enabled":true,"name":"hello-world"}
```

#### 运行

上述完成以后，终端执行curl进行测试:
```shell
$ curl -i -X GET \
>   --url http://localhost:8000/ \
>   --header 'Host: baidu.com'
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 2381
Connection: keep-alive
Hello-World: === Hello World ===
Accept-Ranges: bytes
Cache-Control: private, no-cache, no-store, proxy-revalidate, no-transform
Date: Tue, 10 Jul 2018 07:01:31 GMT
Etag: "588604c8-94d"
Last-Modified: Mon, 23 Jan 2017 13:27:36 GMT
Pragma: no-cache
Server: bfe/1.0.8.18
Set-Cookie: BDORZ=27315; max-age=86400; domain=.baidu.com; path=/
X-Kong-Upstream-Latency: 62
X-Kong-Proxy-Latency: 9
Via: kong/0.14.0

<!DOCTYPE html>
<!--STATUS OK--><html>省略 html</html>
```

可以看见 header 中增加了 <code>Hello-world</code> 内容，说明插件生效了。
