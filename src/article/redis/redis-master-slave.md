---
date: 2023-10-01
article: true
timeline: true
index: true
title: Redis 主从复制
category: Redis
tag:
- Redis
---

# 主从复制简介

## 互联网“三高”架构

* 高并发
* 高性能
* 高可用

## Redis 是否高可用

　　**单机`Redis`的风险与问题：**

* 问题 1：机器故障

  * 现象：硬盘故障、系统崩溃
  * 本质：数据丢失，很可能对业务造成灾难性打击
  * 结论：基本上会放弃使用`Redis`
* 问题 2：容量瓶颈

  * 现象：内存不足，从 16G 升级到 64G，从 64G 升级到 128G，无限升级内存
  * 本质：穷，硬件条件跟不上
  * 结论：放弃使用`Redis`

　　结论：为了避免单点`Redis`服务器故障，准备多台服务器，互相连通。将数据复制多个副本保存在不同的服务器上，连接在一起，并保证数据是同步的。即使有其中一台服务器宕机，其他服务器依然可以继续提供服务，实现`Redis`的高可用，同时实现数据冗余备份。

## 多台服务器连接方案

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-master-slave/master-and-slave.png)

* 提供数据方：`master`

  * 主服务器、主节点、主库、主客户端
* 接收数据方：`slave`

  * 从服务器、从节点、从库、从客户端
* 需要解决的问题：数据同步
* 核心工作：`master`的数据复制到`slave`中

## 主从复制

　　主从复制即将`master`中的数据即时、有效的复制到`slave`中。

　　特征：一个`master`可以拥有多个`slave`，一个`slave`只对应一个`master`。

　　职责：

* `master`

  * 写数据
  * 执行写操作时，将出现变化的数据自动同步到`slave`
  * 读数据（可忽略）
* `slave`

  * 读数据
  * 写数据（禁止）

## 主从复制的作用

* 读写分离：`master`写、`slave`读，提高服务器的读写负载能力
* 负载均衡：基于主从结构，配合读写分离，由`slave`分担`master`负载，并根据需求的变化，改变`slave`的数量，通过多个从节点分担数据读取负载，大大提高`Redis`服务器并发量与数据吞吐量
* 故障恢复：当`master`出现问题时，由`slave`提供服务，实现快速的故障恢复
* 数据冗余：实现数据热备份，是持久化之外的一种数据冗余方式
* 高可用基石：基于主从复制，构建哨兵模式与集群，实现`Redis`的高可用方案

# 主从复制工作流程

　　主从复制过程大体可以分为 3 个阶段：

1. 建立连接阶段（即准备阶段）
2. 数据同步阶段
3. 命令传播阶段

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-master-slave/master-slave-operate-process1.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-master-slave/master-slave-operate-process2.png)

## 建立连接阶段

　　建立`slave`到`master`的连接，使`master`能够识别`slave`，并保存`slave`端口号。

### 工作流程

1. 设置`master`的地址和端口，保存`master`信息
2. 建立`socket`连接
3. 发送`ping`命令（定时器任务）
4. 身份验证
5. 发送`slave`端口信息

　　至此，主从连接成功！

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-master-slave/create-connection.png)

　　状态：

* `slave`：保存`master`的地址与端口
* `master`：保存`slave`的端口
* 总体：之间创建了连接的`socket`

### 主从连接（slave 连接 master）

* 方式一：客户端发送命令

  ```bash
  slaveof <masterip> <masterport>
  ```

  1. `slave`客户端

      ```bash
       [echo@centos ~]$ sudo redis-cli -p 6380
       127.0.0.1:6379> slaveof 127.0.0.1 6379
       OK
       127.0.0.1:6379> 
      ```
  2. `master`主机

      ```bash
       Starting BGSAVE for SYNC with target: disk
       Background saving started by pid 4837
       DB saved on disk
       ...
      ```
  3. `master`客户端

      ```bash
       [echo@centos ~]$ sudo redis-cli -p 6379
       127.0.0.1:6379> set name itheima
       OK
       127.0.0.1:6379> 
      ```
  4. `slave`客户端

      ```bash
       [echo@centos ~]$ sudo redis-cli -p 6380
       127.0.0.1:6379> slaveof 127.0.0.1 6379
       OK
       127.0.0.1:6379> get name
       "itheima"
      ```
* 方式二：启动服务器参数

  ```bash
  redis-server -slaveof <masterip> <masterport>
  ```

  1. `slave`客户端

  ```bash
    [echo@centos ~]$ sudo redis-server /etc/redis/redis-6380.conf --slaveof 127.0.0.1 6379
  ```

  2. `master`客户端

  ```bash
    [echo@centos ~]$ sudo redis-cli -p 6379
    127.0.0.1:6379> set name itheima
    127.0.0.1:6379> set name itcast
  ```

  3. `slave`客户端

  ```bash
    [echo@centos ~]$ sudo redis-cli -p 6380
    127.0.0.1:6379> slaveof 127.0.0.1 6379
    127.0.0.1:6379> get name
    "itheima"
    127.0.0.1:6379> get name
    "itcast"
  ```
* 方式三：服务器配置

  ```bash
  slaveof <masterip> <masterport>
  ```

  ```bash
  # 在 redis-6379.conf 中添加配置
  slaveof 127.0.0.1 6379
  ```

  1. `master`客户端

  ```bash
    [echo@centos ~]$ sudo redis-cli -p 6379
    127.0.0.1:6379> set name itheima
    127.0.0.1:6379> set name itcast
    127.0.0.1:6379> set name it
  ```

  2. `slave`客户端

  ```bash
    [echo@centos ~]$ sudo redis-cli -p 6380
    127.0.0.1:6379> get name
    "itheima"
    127.0.0.1:6379> get name
    "itcast"
    127.0.0.1:6379> get name
    "it"
  ```
* `slave`系统信息

  * `master_link_down_since_seconds`
  * `masterhost`
  * `masterport`
* `master`系统信息

  * `slave_listening_port`（多个）

### 主从断开连接

* 客户端发送命令

  ```bash
  # slave 客户端发送命令
  slaveof no one
  ```

  说明：`slave`断开连接后，不会删除已有数据，只是不再接受`master`发送的数据

### 授权访问

* `master`客户端发送命令设置密码

  ```bash
  requirepass <password>
  ```
* `master`配置文件设置密码

  ```bash
  config set requirepass <password>
  config get requirepass
  ```
* `slave`客户端发送命令设置密码

  ```bash
  auth <password>
  ```
* `slave`配置文件设置密码

  ```bash
  masterauth <password>
  ```
* `slave`启动服务器设置密码

  ```bash
  redis-server –a <password>
  ```

## 数据同步阶段

　　在`slave`初次连接`master`后，复制`master`中的所有数据到`slave`，将`slave`的数据库状态更新成`master`当前的数据库状态。

### 工作流程

1. 请求同步数据
2. 创建`RDB`同步数据
3. 恢复`RDB`同步数据
4. 请求部分同步数据
5. 恢复部分同步数据

　　至此，数据同步工作完成！

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-master-slave/data-sync.png)

　　状态：

* `slave`：具有`master`端全部数据，包含`RDB`过程接收的数据
* `master`：保存`slave`当前数据同步的位置
* 总体：之间完成了数据克隆

### 数据同步阶段 master 说明

1. 如果`master`数据量巨大，数据同步阶段应避开流量高峰期，避免造成`master`阻塞，影响业务正常执行
2. 复制缓冲区大小设定不合理，会导致数据溢出。如进行全量复制周期太长，进行部分复制时发现数据已经存在丢失的情况，必须进行第二次全量复制，致使`slave`陷入死循环状态

    ```bash
    # 配置文件中修改缓冲区大小
    repl-backlog-size 1mb
    ```
3. `master`单机内存占用主机内存的比例不应过大，建议使用 50% - 70% 的内存，留下 30% - 50% 的内存用于执行`bgsave`命令和创建复制缓冲区

### 数据同步阶段 slave 说明

1. 为避免`slave`进行全量复制、部分复制时服务器响应阻塞或数据不同步，建议关闭此期间的对外服务

    ```bash
    # 配置文件中关闭 slave 服务器对外服务
    slave-serve-stale-data yes|no
    ```
2. 数据同步阶段，`master`发送给`slave`信息可以理解`master`是`slave`的一个客户端，主动向`slave`发送命令
3. 多个`slave`同时对`master`请求数据同步，`master`发送的`RDB`文件增多，会对带宽造成巨大冲击，如果`master`带宽不足，因此数据同步需要根据业务需求，适量错峰
4. `slave`过多时，建议调整拓扑结构，由一主多从结构变为树状结构，中间的节点既是`master`，也是`slave`；注意使用树状结构时，由于层级深度，导致深度越高的`slave`与最顶层`master`间数据同步延迟较大，数据一致性变差，应谨慎选择

## 命令传播阶段

　　当`master`数据库状态被修改后，导致主从服务器数据库状态不一致，此时需要让主从数据同步到一致的状态，同步的动作称为**命令传播**。

　　`master`将接收到的数据变更命令发送给`slave`，`slave`接收命令后执行命令。

### 命令传播阶段的部分复制

* 命令传播阶段出现了断网现象

  * 网络闪断闪连		操作：忽略
  * 短时间网络中断	操作：部分复制
  * 长时间网络中断	操作：全量复制
* 部分复制的三个核心要素

  * 服务器的运行`id(run id)`
  * 主服务器的复制积压缓冲区
  * 主从服务器的复制偏移量

### 服务器运行 ID（RunID）

* 概念：服务器运行`ID`是每一台服务器每次运行的身份识别码，一台服务器多次运行可以生成多个运行`ID`
* 组成：运行`ID`由 40 位字符组成，是一个随机的十六进制字符。例如：`fdc9ff13b9bbaab28db42b3d50f852bb5e3fcdce`
* 作用：运行`ID`被用于在服务器间进行传输，识别身份。如果想两次操作均对同一台服务器进行，必须每次操作携带对应的运行`ID`，用于对方识别
* 实现方式：运行`ID`在每台服务器启动时自动生成的，`master`在首次连接`slave`时，会将自己的运行`ID`发送给`slave`，`slave`保存此`ID`，通过`info server`命令，可以查看节点的`RunID`

### 复制缓冲区

　　复制缓冲区，又名复制积压缓冲区，是一个先进先出（`FIFO`）的队列，用于存储服务器执行过的命令，每次传播命令，`master`都会将传播的命令记录下来，并存储在复制缓冲区。

　　复制缓冲区默认数据存储空间大小是 1M，由于存储空间大小是固定的，当入队元素的数量大于队列长度时，最先入队的元素会被弹出，而新元素会被放入队列。

* 由来：每台服务器启动时，如果开启有`AOF`或被连接成为`master`节点，即创建复制缓冲区
* 作用：用于保存`master`收到的所有指令（仅影响数据变更的指令，例如`set`，`select`）
* 数据来源：当`master`接收到主客户端的指令时，除了将指令执行，会将该指令存储到缓冲区中

#### 复制缓冲区内部工作原理

　　组成：

* 偏移量
* 字节值

　　工作原理：

* 通过`offset`区分不同的`slave`当前数据传播的差异
* `master`记录已发送的信息对应的`offset`
* `slave`记录已接收的信息对应的`offset`

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-master-slave/copy-buffer-operate-principle.png)

### 主从服务器复制偏移量（offset）

　　是一个数字，描述复制缓冲区中的指令字节位置。

　　分类：

* `master`复制偏移量：记录发送给所有`slave`接收的指令字节对应的位置（多个）
* `slave`复制偏移量：记录`slave`接收`master`发送过来的指令字节对应的位置（一个）

　　数据来源：

* `master`端：发送一次记录一次
* `slave`端：接收一次记录一次

　　作用：同步信息，比对`master`与`slave`的差异，当`slave`断线后，恢复数据使用

## 数据同步+命令传播阶段工作流程

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-master-slave/data-sync-and-command-propagation.png)

## 心跳机制

　　进入命令传播阶段候，`master`与`slave`间需要进行信息交换，使用心跳机制进行维护，实现双方连接保持在线。

　　`master`心跳：

* 指令：`ping`
* 周期：由`repl-ping-slave-period`决定，默认 10 秒
* 作用：判断`slave`是否在线
* 查询：`INFO replication`获取`slave`最后一次连接时间间隔，`lag`项维持在 0 或 1 视为正常

　　`slave`心跳：

* 指令：`REPLCONF ACK {offset}`
* 周期：1 秒
* 作用 1：汇报`slave`自己的复制偏移量，获取最新的数据变更指令
* 作用 2：判断`master`是否在线

### 心跳阶段注意事项

* 当`slave`多数掉线，或延迟过高时，`master`为保障数据稳定性，将拒绝所有信息同步操作

  ```bash
  min-slaves-to-write 2
  min-slaves-max-lag 8
  ```

  `slave`数量少于 2 个，或者所有`slave`的延迟都大于等于 10 秒时，强制关闭`master`写功能，停止数据同步。
* `slave`数量由`slave`发送`REPLCONF ACK`命令做确认
* `slave`延迟由`slave`发送`REPLCONF ACK`命令做确认

## 主从复制工作流程（完整）

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-master-slave/master-slave-operate-process.png)

# 主从复制常见问题

## 频繁的全量复制

　　伴随着系统的运行，`master`的数据量会越来越大，一旦`master`重启，`runid`将发生变化，会导致全部`slave`的全量复制操作。

　　内部优化调整方案：

1. `master`内部创建`master_replid`变量，使用`runid`相同的策略生成，长度 41 位，并发送给所有`slave`
2. 在`master`关闭时执行命令`shutdown save`，进行`RDB`持久化,将`runid`与`offset`保存到`RDB`文件中

    * `repl-id		repl-offset`
    * 通过`redis-check-rdb`命令可以查看该信息
3. `master`重启后加载`RDB`文件，恢复数据  
    重启后，将`RDB`文件中保存的`repl-id`与`repl-offset`加载到内存中

    * `master_repl_id = repl		master_repl_offset = repl-offset`
    * 通过`info`命令可以查看该信息

　　作用：本机保存上次`runid`，重启后恢复该值，使所有`slave`认为还是之前的`master`。

　　总结：

* 问题现象：网络环境不佳，出现网络中断，`slave`不提供服务
* 问题原因：复制缓冲区过小，断网后`slave`的`offset`越界，触发全量复制
* 最终结果：`slave`反复进行全量复制
* 解决方案：修改复制缓冲区大小

  ```bash
  repl-backlog-size
  ```
* 建议设置如下：

  1. 测算从`master`到`slave`的重连平均时长`second`
  2. 获取`master`平均每秒产生写命令数据总量`write_size_per_second`
  3. 最优复制缓冲区空间 = `2 \* second \* write_size_per_second`

## 频繁的网络中断

　　问题现象：`master`的`CPU`占用过高或`slave`频繁断开连接。

　　问题原因：

* `slave`每 1 秒发送`REPLCONF ACK`命令到`master`
* 当`slave`接到了慢查询时（`keys *`，`hgetall`等），会大量占用`CPU`性能
* `master`每 $1$ 秒调用复制定时函数`replicationCron()`，比对`slave`发现长时间没有进行响应

　　最终结果：`master`各种资源（输出缓冲区、带宽、连接等）被严重占用。

　　解决方案：

* 通过设置合理的超时时间，确认是否释放`slave`

  ```bash
  repl-timeout
  ```

  该参数定义了超时时间的阈值（默认 60 秒），超过该值，释放`slave`。

　　问题现象：`slave`与`master`连接断开。

　　问题原因：

* `master`发送`ping`指令频度较低
* `master`设定超时时间较短
* `ping`指令在网络中存在丢包

　　解决方案：

* 提高`ping`指令发送的频度

  ```bash
  repl-ping-slave-period
  ```

　　超时时间`repl-time`的时间至少是`ping`指令频度的 5 到 10 倍，否则`slave`很容易判定超时。

## 数据不一致

　　问题现象：多个`slave`获取相同数据不同步

　　问题原因：网络信息不同步，数据发送有延迟

　　解决方案：

* 优化主从间的网络环境，通常放置在同一个机房部署，如使用阿里云等云服务器时要注意此现象
* 监控主从节点延迟（通过`offset`）判断，如果`slave`延迟过大，暂时屏蔽程序对该`slave`的数据访问

  ```bash
  slave-serve-stale-data yes|no
  ```
  开启后仅响应`info`、`slaveof`等少数命令（慎用，除非对数据一致性要求很高）。
