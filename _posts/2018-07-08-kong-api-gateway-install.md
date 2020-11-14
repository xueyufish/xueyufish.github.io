---
layout:     post
title:      "Kong Api网关简介(一) 安装运行"
date:       2018-07-08
author:     "余修忞(xueyufish)"
keyword:    "开源项目, 网关, Gateway, Kong, Nginx, 余修忞, yuxiumin, xueyufish"
description: "Kong Api网关安装运行简介"
tags:
    - 开源项目
    - Kong
    - Nginx
    - Lua
---

Kong 是 Mashape 开源的高性能高可用 API 网关和 API 管理服务层。它基于 OpenResty 进行 API 管理，并提供了插件实现 API 的 AOP。最近因工作的需要研究了 Kong 的相关应用实现。

### 准备

kong 的官方文档提供了基于不同平台的安装方式，为了方便，这里使用 docker-compose 进行。

```shell
$ mkdir kong-gateway && cd kong-gateway
$ touch docker-compose.yml
$ mkdir config plugins postgresql
```

上述创建名为 kong-gateway 的目录并且进入，然后在 kong-gateway 目录中创建 docker-compose.yml 文件，并且创建了 config、 plugins、 postgresql 三个文件夹。其中, config 文件夹用于存放 kong 网关配置, plugins 文件夹用于存放自定义插件, postgresql 文件夹用于存放 postgresql 数据文件，这三个文件夹将被挂载到 docker 容器中。 docker-compose.yml 文件定义如下：

```yml
version: '3'

services:
  postgres:
    image: postgres:9.6
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=kong
      - POSTGRES_DB=kong
      - POSTGRES_PASSWORD=kong
      - PGDATA=/var/lib/postgresql/data
    container_name: kong-database
    volumes:
      - ./postgresql/data:/var/lib/postgresql/data
  kong:
    image: kong:latest
    container_name: kong
    environment:
      - KONG_DATABASE=postgres
      - KONG_PG_HOST=kong-database
      - KONG_PG_USER=kong
      - KONG_PG_PASSWORD=kong
      - KONG_CASSANDRA_CONTACT_POINTS=kong-database
      - KONG_PROXY_ACCESS_LOG=/dev/stdout
      - KONG_ADMIN_ACCESS_LOG=/dev/stdout
      - KONG_PROXY_ERROR_LOG=/dev/stderr
      - KONG_ADMIN_ERROR_LOG=/dev/stderr
    ports:
      - "8000:8000"
      - "8001:8001"
      - "8443:8443"
      - "7946:7946"
      - "7946:7946/udp"
    volumes:
      - ./config:/etc/kong
      - ./plugins:/etc/kong/plugins
    depends_on:
      - postgres
```

config 文件夹下放置 kong 的配置文件 kong.conf，简单定义如下：
```conf
prefix = /etc/kong/

log_level = debug

proxy_listen = 0.0.0.0:8000, 0.0.0.0:8443 ssl
admin_listen = 0.0.0.0:8001, 0.0.0.0:8444 ssl

database = postgres
pg_host = 127.0.0.1
pg_port = 5432
pg_user = kong
pg_password = kong
pg_database = kong
pg_ssl = off
pg_ssl_verify = off
```

上述准备好后的 kong-gateway文件夹目录如下:
```
kong-gateway
| -- config
	| -- kong.conf
| -- plugins
| -- postgresql
| -- docker-compose.yml
```

### 启动

首先准备数据库，执行下面命令：
```shell
$ docker-compose run kong kong migrations up
```

执行过程中将拉取 docker-compose.yml 中定义的 postgres:9.6 镜像和 kong:latest镜像，并执行数据库迁移操作。

迁移完成后，执行下面命令，启动 kong 网关:

```shell
$ docker-compose up --no-recreate -d
Starting kong-database ... done
Creating kong          ... done

$ docker-compose ps
    Name                   Command               State                                                                Ports
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
kong            /docker-entrypoint.sh kong ...   Up      0.0.0.0:7946->7946/tcp, 0.0.0.0:7946->7946/udp, 0.0.0.0:8000->8000/tcp, 0.0.0.0:8001->8001/tcp, 0.0.0.0:8443->8443/tcp, 8444/tcp
kong-database   docker-entrypoint.sh postgres    Up      0.0.0.0:5432->5432/tcp
```

这时候控制台执行 <code>curl http://127.0.0.1:8001/status</code>可以看到管理端口输出的状态json。

### 运行

#### Servie Object

Kong 中的 Service 对象代表了上游服务的一个抽象，主要由协议、主机名、端口、路径等组成。Service 和路由关联(一个Service可能会被关联至多个路由)。更多参见[Kong Admin Api Service Object](https://docs.konghq.com/0.14.x/admin-api/#service-object)。

我们首先执行命令创建一个 Service, 这个 Service 名称为 baidu-service，对应的 url 地址为 <code>http://www.baidu.com</code>:
```shell
$ curl -i -X POST \
>   --url http://127.0.0.1:8001/services/ \
>   --data 'name=baidu-service' \
>   --data 'url=http://www.baidu.com'
HTTP/1.1 201 Created
Date: Mon, 09 Jul 2018 05:53:13 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Server: kong/0.14.0
Content-Length: 259

{"host":"www.baidu.com","created_at":1531115593,"connect_timeout":60000,"id":"edbe2f0f-f11e-493b-9b59-5997e50c3de1","protocol":"http","name":"baidu-service","read_timeout":60000,"port":80,"path":null,"updated_at":1531115593,"retries":5,"write_timeout":60000}
```

可以通过以下命令查看所有已创建的 Service:
```shell
$ curl -i -X GET --url http://127.0.0.1:8001/services/
HTTP/1.1 200 OK
Date: Mon, 09 Jul 2018 05:55:44 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Server: kong/0.14.0
Content-Length: 282

{"next":null,"data":[{"host":"www.baidu.com","created_at":1531115593,"connect_timeout":60000,"id":"edbe2f0f-f11e-493b-9b59-5997e50c3de1","protocol":"http","name":"baidu-service","read_timeout":60000,"port":80,"path":null,"updated_at":1531115593,"retries":5,"write_timeout":60000}]}
```

也可以根据 serviceId 查看某个具体的 Service:
```shell
$ curl -i -X GET --url http://127.0.0.1:8001/services/edbe2f0f-f11e-493b-9b59-5997e50c3de1
HTTP/1.1 200 OK
Date: Mon, 09 Jul 2018 05:57:30 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Server: kong/0.14.0
Content-Length: 259

{"host":"www.baidu.com","created_at":1531115593,"connect_timeout":60000,"id":"edbe2f0f-f11e-493b-9b59-5997e50c3de1","protocol":"http","name":"baidu-service","read_timeout":60000,"port":80,"path":null,"updated_at":1531115593,"retries":5,"write_timeout":60000}
```

#### Route Object

路由定义了匹配客户端请求的规则，每一个路由关联一个 Service，每一个 Service 有可能被多个路由关联，每一个匹配到指定的路由请求将被代理到它关联的 Service 上。
更多参见[Kong Admin Api Route Object](https://docs.konghq.com/0.14.x/admin-api/#route-object)。

首先创建一个Route：
```shell
$ curl -i -X POST \
>   --url http://localhost:8001/services/baidu-service/routes \
>   --data 'hosts[]=baidu.com'
HTTP/1.1 201 Created
Date: Mon, 09 Jul 2018 06:24:11 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Server: kong/0.14.0
Content-Length: 288

{"created_at":1531117451,"strip_path":true,"hosts":["baidu.com"],"preserve_host":false,"regex_priority":0,"updated_at":1531117451,"paths":null,"service":{"id":"edbe2f0f-f11e-493b-9b59-5997e50c3de1"},"methods":null,"protocols":["http","https"],"id":"92b5b7b7-49a9-4cb5-a595-2544e86ee519"}
```

可以通过以下命令查看所有已创建的 Routes:
```shell
$ curl -i -X GET --url http://localhost:8001/routes
HTTP/1.1 200 OK
Date: Mon, 09 Jul 2018 06:25:58 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Server: kong/0.14.0
Content-Length: 311

{"next":null,"data":[{"created_at":1531117451,"strip_path":true,"hosts":["baidu.com"],"preserve_host":false,"regex_priority":0,"updated_at":1531117451,"paths":null,"service":{"id":"edbe2f0f-f11e-493b-9b59-5997e50c3de1"},"methods":null,"protocols":["http","https"],"id":"92b5b7b7-49a9-4cb5-a595-2544e86ee519"}]}
```

也可以根据 routeId 查看某个具体的 Route:
```shell
$ curl -i -X GET --url http://127.0.0.1:8001/routes/92b5b7b7-49a9-4cb5-a595-2544e86ee519
HTTP/1.1 200 OK
Date: Mon, 09 Jul 2018 06:27:32 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Server: kong/0.14.0
Content-Length: 288

{"created_at":1531117451,"strip_path":true,"hosts":["baidu.com"],"preserve_host":false,"regex_priority":0,"updated_at":1531117451,"paths":null,"service":{"id":"edbe2f0f-f11e-493b-9b59-5997e50c3de1"},"methods":null,"protocols":["http","https"],"id":"92b5b7b7-49a9-4cb5-a595-2544e86ee519"}
```

#### 运行

先执行如下命令执行:
```shell
$ curl -i -X GET --url http://127.0.0.1:8000/
HTTP/1.1 404 Not Found
Date: Mon, 09 Jul 2018 06:33:31 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Server: kong/0.14.0
Content-Length: 58

{"message":"no route and no API found with those values"}
```
发现返回的是<code>404 Not Found</code>，因为我们在 route 中定义了 host，所以需要在 header 中指定 host。 根据 Kong Admin Api 要求，添加 Route 时，methods、hosts、path三者至少选择一个。修改请求如下：

```shell
[xueyufish@izbp13cqwumhn3wzp2j5mqz kong-gateway]$ curl -i -X GET \
>   --url http://127.0.0.1:8000/ \
>   --header 'Host: baidu.com'
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 2381
Connection: keep-alive
Accept-Ranges: bytes
Cache-Control: private, no-cache, no-store, proxy-revalidate, no-transform
Date: Mon, 09 Jul 2018 06:38:22 GMT
Etag: "588604c8-94d"
Last-Modified: Mon, 23 Jan 2017 13:27:36 GMT
Pragma: no-cache
Server: bfe/1.0.8.18
Set-Cookie: BDORZ=27315; max-age=86400; domain=.baidu.com; path=/
X-Kong-Upstream-Latency: 63
X-Kong-Proxy-Latency: 34
Via: kong/0.14.0

<!DOCTYPE html>
<!--STATUS OK--><html>... 省略html内容 ...</html>
```

至此，一个简单的 kong 网关运行成功。但是正如 kong 官网所描述，它具备很多其他特性，后续将对重要的继续介绍。
