---
layout:     post
title:      "发布至生产环境的准备事项(译)"
date:       2017-12-22
author:     "xueyufish"
keyword:    "DevOps, 架构"
tags:
    - DevOps
    - 架构
---

系统发布至生产环境前准备必须经过仔细的检查，下面是github上的一个server端，这里做个简单的翻译备注。

# Serverside checklist

## Legal (法律条款)

> Licences of my application's 3rd-party dependencies are not violated

应用不违反第三方依赖的Licences声明。

> My application does not violate cryptography policies and laws

应用不违反加密策略和声明。

> My app is compliant according to the organisation standards

应用符合所在组织的标准和规范。

## Resiliency (弹性)

> My application can retain reasonable functionality in isolation

应用在隔离部署时可以保持原有的合理功能

> My application can recover from being under heavy load

应用在高负载环境下可以恢复运行

> My application can reestablish all lost connections

应用在连接全部丢失的情况下可以重建连接

> My application can not cause Cascading Failures to propagate through the system

应用不会导致系统级联性的失败传播

## Load balancing （负载均衡）

> My project can run on multiple CPUs

项目可以在多核CPU环境下运行

> My project can run behind the load balancer

项目可以在负载均衡器调度下运行

> I can add a new node without system downtime

可以在不停机的情况下添加新的节点

## Transparent deployment （透明部署）

> I can add a new node without stopping the application

可以在不停止应用的情况下加入新的节点

> I can add a new node without user sessions being lost/destroyed

可以添加新的节点而不会导致用户会话丢失

> I can make a rolling upgrades for my service

可以对服务进行回滚升级

## Supervising (监督)

> My application can survive a server restart

应用可以监督服务的重启

> My application is restarted automatically after the crash

应用可以在crash以后自动重启

## Logging (日志)

> My application logs all errors (even "swallowed")

应用记录所有错误日志

> My application produces log output to rotated files

> 1. Streams with different log levels are separated from each other

应用产生日志输出至回滚文件

> My logs are aggregated to a log analysing service

日志被聚合直日志分析服务

## Monitoring (监控)

> I have configured the alerts for abnormal activity
> 1. Application restart events
> 2. Error rate threshold reached
> 3. Server resources are soon to be exhausted (CPU, memory, IO > 90%)
> 4. HTTP requests timeouts
> 5. HTTP responses with 500 status codes

对于异常活动，已经配置相应的告警：

1. 应用重启事件
2. 错误频率阈值到达
3. 服务器资源即将被耗尽(CPU、内存、IO > 90%)
4. HTTP 请求超时
5. HTTP 500 响应

> I have health checks for all parts of my system

对于系统的所有部分，都已经配置健康检查

## Metrics （指标）

> I can observe different events from my app over time
> 1. Number of requests for endpoints
> 2. Duration of requests for endpoints
> 3. Duration of business-logic operations

随着时间推移，可以观察应用的不同指标：
1. 端点请求数
2. 端点请求周期
3. 业务逻辑操作周期

## High Availability (高可用)
 I can run my services in different independent Data Centers

 服务可以运行在不同的独立数据中心上

## Testing (测试)
> I have performed stress tests for my application
> I have performed network partitioning tests for my application

已经对应用进行过压力测试

已经对应用进行过网络分区测试

## Backuping (备份)
> I can restore all my data from backups

可以从备份文件中恢复所有数据

## Security (安全性)
> I have audited my system against OWASP Top 10 Vulnerabilities

已经参考[OWASP Top 10](https://www.owasp.org/images/7/72/OWASP_Top_10-2017_%28en%29.pdf.pdf)对系统进行过审查

> I use TLS for all endpoints

对于所有端点都使用安全传输层协议(TLS)

> I have added relevant security headers to app HTTP endpoints
> 1. X-Frame-Options
> 2. X-Content-Type-Options
> 3. Content-Security-Policy
> 4. X-XSS-Protection
> 5. Strict-Transport-Security
> 6. Public-Key-Pins

对于应用HTTP端点已经添加相关安全头, 包括:
 1. X-Frame-Options
 2. X-Content-Type-Options
 3. Content-Security-Policy
 4. X-XSS-Protection
 5. Strict-Transport-Security
 6. Public-Key-Pins

# 原文地址

1. [serverside-checklist](https://github.com/mtdvio/going-to-production/blob/master/serverside-checklist.md)
2. [spa-checklist](https://github.com/mtdvio/going-to-production/blob/master/spa-checklist.md)
