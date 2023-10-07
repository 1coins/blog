---
date: 2023-10-03
article: true
timeline: true
index: true
title: Redis 哨兵和集群
category: Redis
tag:
- Redis
---

# 哨兵模式

## 简介

### 主机宕机

　　操作：

* 关闭`master`和所有`slave`
* 找一个`slave`作为`master`
* 修改其他`slave`的配置，连接新的主
* 启动新的`master`与`slave`
* 全量复制 * N + 部分复制 * N

　　问题：

* 关闭期间的数据服务谁来承接？
* 找一个主？怎么找法？
* 修改配置后，原始的主恢复了怎么办？

### 哨兵

　　哨兵（`sentinel`）是一个分布式系统，用于对主从结构中的每台服务器进行监控，当出现故障时通过投票机制选择新的`master`并将所有`slave`连接到新的`master`。

### 哨兵的作用

* 监控

  * 不断的检查`master`和`slave`是否正常运行。
  * `master`存活检测、`master`与`slave`运行情况检测
* 通知（提醒）

  * 当被监控的服务器出现问题时，向其他（哨兵间，客户端）发送通知。
* 自动故障转移

  * 断开`master`与`slave`连接，选取一个`slave`作为`master`，将其他`slave`连接到新的`master`，并告知客户端新的服务器地址

　　注意：

* 哨兵也是一台`Redis`服务器，只是不提供数据服务
* 通常哨兵配置数量为单数

## 启用哨兵模式

### 配置哨兵

* 配置一拖二的主从结构
* 配置三个哨兵（配置相同，端口不同）

  * 参看`sentinel.conf`
* 启动哨兵

  ```
  redis-sentinel sentinel-端口号.conf
  ```

1. 配置哨兵 1  

    ```bash
     [echo@centos ~]$ sudo cp /opt/software/redis/sentinel.conf /etc/redis/sentinel-26379.conf
     [echo@centos ~]$ sudo cp /opt/software/redis/sentinel.conf /etc/redis/sentinel-26380.conf
     [echo@centos ~]$ sudo cp /opt/software/redis/sentinel.conf /etc/redis/sentinel-26381.conf
    ```
2. 配置哨兵 2  

    ```bash
     [echo@centos ~]$ sudo cat /etc/redis/sentinel-26379.conf | grep -v "#" | grep -v "^$"
     port 26379
     daemonize no
     pidfile /var/run/redis-sentinel.pid
     logfile ""
     dir /var/lib/redis
     sentinel monitor mymaster 127.0.0.1 6379 2
     sentinel down-after-milliseconds mymaster 30000
     acllog-max-len 128
     sentinel parallel-syncs mymaster 1
     sentinel failover-timeout mymaster 180000
     sentinel deny-scripts-reconfig yes
     SENTINEL resolve-hostnames no
     SENTINEL announce-hostnames no
    ```
3. `master`

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-6379.conf
    ```
4. `slave1`

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-6380.conf
    ```
5. `slave2`

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-6381.conf
    ```
6. 哨兵 1  

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-26379.conf
    ```
7. 哨兵 2  

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-26380.conf
    ```
8. 哨兵 3  

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-26381.conf
    ```
9. 哨兵客户端 1  

    ```bash
      [echo@centos ~]$ sudo redis-cli -p 26379
      127.0.0.1:6379> set name 123
      (error) ERR unknown command `set`, with args beginning with: `name`, '123',
    ```
10. `master`客户端

     ```bash
       [echo@centos ~]$ sudo redis-cli -p 6379
       127.0.0.1:6379> set name itheima
     ```
11. `slave`客户端

     ```bash
       [echo@centos ~]$ sudo redis-cli -p 6380
       127.0.0.1:6379> get name 
       "itheima"
     ```
12. `master`宕机

     ```bash
       ^C
     ```
13. 哨兵选取新的`master`

     ```bash
       * +slave slave 127.0.0.1:6381 127.0.0.1 6381 @ mymaster 127.0.0.1 6380
       * +slave slave 127.0.0.1:6379 127.0.0.1 6379 @ mymaster 127.0.0.1 6380
       # +sdown slave 127.0.0.1:6379 127.0.0.1 6379 @ mymaster 127.0.0.1 6380
     ```

|                               配置项                                |范例|说明|
|:----------------------------------------------------------------:| :------------------------------------------------: | :------------------------------------------------------------------------------------------------------: |
|             sentinel auth-pass <服务器名称> \<passward\>              |sentinel auth-pass mymaster itcast|连接服务器口令|
| sentinel down-after-milliseconds <自定义服务名称> <主机地址> <端口> <主从服务器总量> |sentinel monitor mymaster 192.168.194.131 6381 1|设置哨兵监听的主服务器信息，最后的参数决定了最终参与选举的服务器数量（-1）|
|        sentinel down-after-milliseconds <服务名称> <毫秒数（整数）>         |sentinel down-after-milliseconds mymaster 3000|指定哨兵在监控 Redis 服务时，判定服务器挂掉的时间周期，默认 30 秒（30000），也是主从切换的启动条件之一|
|            sentinel parallel-syncs <服务名称> <服务器数（整数）>             |sentinel parallel-syncs mymaster 1|指定同时进行主从的 slave 数量，数值越大，要求网络资源越高，要求约小，同步时间约长|
|            sentinel failover-timeout <服务名称> <毫秒数（整数）>            |sentinel failover-timeout mymaster 9000|指定出现故障后，故障切换的最大超时时间，超过该值，认定切换失败，默认3分钟|
|            sentinel notification-script <服务名称> <脚本路径>            ||服务器无法正常联通时，设定的执行脚本，通常调试使用。|

## 哨兵工作原理

### 主从切换

　　哨兵在进行主从切换过程中经历三个阶段：

* 监控
* 通知
* 故障转移

#### 监控阶段

　　用于同步各个节点的状态信息

* 获取各个`sentinel`的状态（是否在线）
* 获取`master`的状态

  * `master`属性

    * `runid`
    * `role：master`
  * 各个`slave`的详细信息
* 获取所有`slave`的状态（根据`master`中的`slave`信息）

  * `slave`属性

    * `runid`
    * `role：slave`
    * `master_host、master_port`
    * `offset`
    * ……

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-sentinel-and-cluster/monitor-phase.png)

#### 通知阶段

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-sentinel-and-cluster/notice-phase.png)

#### 故障转移阶段

##### 主观下线与客观下线

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-sentinel-and-cluster/subjective-offline-and-objective-offline.png)

##### 哨兵竞选

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-sentinel-and-cluster/sentinel-campaign.png)

##### 选取备用 master

　　服务器列表中挑选备选`master`。

　　挑选原则：

* 不在线的`OUT`
* 响应慢的`OUT`
* 与原`master`断开时间久的`OUT`
* 优先原则

  * 优先级
  * `offset`
  * `runid`
* 发送指令（`sentinel`）

  * 向新的`master`发送`slaveof no one`
  * 向其他`slave`发送`slaveof`新`masterIP`端口

#### 总结

* 监控

  * 同步信息
* 通知

  * 保持联通
* 故障转移

  * 发现问题
  * 竞选负责人
  * 优选新`master`
  * 新`master`上任，其他`slave`切换`master`，原`master`作为`slave`故障回复后连接

# 集群

## 简介

### 现状问题

　　业务发展过程中遇到的峰值瓶颈：

* `redis`提供的服务`OPS`可以达到 $10$ 万/秒，当前业务`OPS`已经达到 $10$ 万/秒
* 内存单机容量达到 $256 G$，当前业务需求内存容量 $1 T$
* 使用集群的方式可以快速解决上述问题

### 集群架构

　　集群就是使用网络将若干台计算机联通起来，并提供统一的管理方式，使其对外呈现单机的服务效果。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-sentinel-and-cluster/cluster-architecture.png)

### 集群作用

* 分散单台服务器的访问压力，实现负载均衡
* 分散单台服务器的存储压力，实现可扩展性
* 降低单台服务器宕机带来的业务灾难

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-sentinel-and-cluster/cluster-effect.png)

# 集群结构设计

## 数据存储设计

* 通过算法设计，计算出`key`应该保存的位置
* 将所有的存储空间计划切割成 16384 份，每台主机保存一部分；每份代表的是一个存储空间（**槽**），不是一个`key`的保存空间
* 将`key`按照计算出的保存位置放到对应的存储空间
* 增强可扩展性，当有新的服务器加入事，原来的每个服务器取出自己的一部分槽给新的

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-sentinel-and-cluster/data-storage-design1.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-sentinel-and-cluster/data-storage-design2.png)

## 集群内部通讯设计

* 各个数据库相互通信，保存各个库中槽的编号数据
* 一次命中，直接返回
* 一次未命中，告知具体位置

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-sentinel-and-cluster/cluster-internal-communication-design.png)

## 集群结构搭建

### 搭建方式

* 原生安装（单条命令）

  * 配置服务器（3 主 3 从）
  * 建立通信（`Meet`）
  * 分槽（`Slot`）
  * 搭建主从（`master-slave`）
* 工具安装（批处理）

### Cluster 配置

* 添加节点

  ```bash
  cluster-enabled yes|no
  ```
* `cluster`配置文件名，该文件属于自动生成，仅用于快速查找文件并查询文件内容

  ```bash
  cluster-config-file <filename>
  ```
* 节点服务响应超时时间，用于判定该节点是否下线或切换为从节点

  ```bash
  cluster-node-timeout <milliseconds>
  ```
* `master`连接的`slave`最小数量

  ```bash
  cluster-migration-barrier <count>
  ```

### Cluster 节点操作命令

* 查看集群节点信息

  ```bash
  cluster nodes
  ```
* 进入一个从节点`Redis`，切换其主节点

  ```bash
  cluster replicate <master-id>
  ```
* 发现一个新节点，新增主节点

  ```bash
  cluster meet ip:port
  ```
* 忽略一个没有`solt`的节点

  ```bash
  cluster forget <id>
  ```
* 手动故障转移

  ```bash
  cluster failover
  ```

### redis-trib 命令

* 添加节点

  ```bash
  redis-trib.rb add-node
  ```
* 删除节点

  ```bash
  redis-trib.rb del-node
  ```
* 重新分片

  ```bash
  redis-trib.rb reshard
  ```

1. `cluster`配置

    ```conf
     cluster-enabled yes
     cluster-config-file nodes-6379.conf
     cluster-node-timeout 15000
    ```
2. `master1`

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-6379.conf
    ```
3. `master2`

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-6380.conf
    ```
4. `master3`

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-6381.conf
    ```
5. `slave1`

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-6382.conf
    ```
6. `slave2`

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-6383.conf
    ```
7. `slave3`

    ```bash
     [echo@centos ~]$ sudo redis-server /etc/redis/redis-6384.conf
    ```
8. 已开启的进程

    ```bash
     [echo@centos ~]$ ps -ef | grep redis-
     6379
     6380
     6382
     6383
     6384
     6381
    ```
9. 安装`ruby`和`gem`

    ```bash
      [echo@centos ~]$ ruby -v
      ruby 2.7.0p0
      [echo@centos ~]$ gem -v
      3.1.2
    ```
10. 开启集群 1  

     ```bash
       [echo@centos /]$ sudo ./etc/redis/redis-trib.rb create --replicas 1 127.0.0.1:6379 127.0.0.1:6380 127.0.0.1:6381 127.0.0.1:6382 127.0.0.1:6383 127.0.0.1:6384
       WARNING: redis-trib.rb is not longer available!
     ```
11. 开启集群 2  

     ```bash
       [echo@centos /]$ redis-cli --cluster create 127.0.0.1:6379 127.0.0.1:6380 127.0.0.1:6381 127.0.0.1:6382 127.0.0.1:6383 127.0.0.1:6384 --cluster-replicas 1
     ```
12. `master1`存数据

     ```bash
       [echo@centos ~]$ sudo redis-cli -p 6379
       127.0.0.1:6379> set name itheima
       (error) MOVED 5798 127.0.0.1:6380
       127.0.0.1:6379> QUIT
       [echo@centos ~]$ sudo redis-cli -p 6379 -C
       127.0.0.1:6379> set name itheima
       127.0.0.1:6379> 
     ```
13. `slave1`取数据

     ```bash
       [echo@centos ~]$ sudo redis-cli -c -p 6382
       127.0.0.1:6382> get name
       -> Redirected to slot [5798] located at 127.0.0.1:6380
       "itheima"
     ```
14. `slave1`宕机后重新上线

     ```bash
       * Connection with replica 127.0.0.1:6382 lost
       ...
       * Starting BGSAVE for SYNC with target:disk
       ...
     ```
15. `master1`宕机

     ```bash
       * Connection to MASTER 127.0.0.1:6379
       * MASTER <-> REPLICA sync started
       # Error condition on socket for SYNC: Connection refused
       # Starting a failover election fo epoch 7.
       # Failover election won: I'm the new master
       ...
       # Cluster state changed:ok
     ```
16. `master1`重新上线

     ```bash
       # Cluster state changed:ok
       * Replica 127.0.0.1:6379 asks for synchronization
       ...
       * Starting BGSAVE for SYNC with target:disk
       * Background saving started by pid 5766
       ...
     ```

　　‍
