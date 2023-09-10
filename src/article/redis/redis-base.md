---
date: 2023-09-10
article: true
timeline: true
index: true
title: Redis 基础
category: Redis
tag:
- Redis
---

# 问题的抛出

　　**出现的问题：**

* 海量用户
* 高并发

　　**罪魁祸首——关系型数据库：**

* 性能瓶颈：磁盘IO性能低下
* 扩展瓶颈：数据关系复杂，扩展性差，不便于大规模集群

　　**解决思路：**

* 降低磁盘IO次数，越低越好： 内存存储
* 去除数据间的关系，越简单越好： 不存储关系，只存储数据

# NoSql简介

　　`NoSql`，即`Not-OnlySQL`（泛指非关系型的数据库），作为关系型数据库的补充，应用对于海量用户和海量数据前提吓得数据处理问题。

　　**特征：**

* 可扩容，可伸缩
* 大数据量下得高性能
* 灵活得数据模型
* 高可用

　　**常见**`NoSql`**数据库：**

* Redis
* MemCache
* HBase
* MongoDB

# 解决方案

　　![](https://cdn.jsdelivr.net/gh/1coins/https://cdn.jsdelivr.net/gh/1coins/assets/redis-base/redis-scene.png)

# Redis 简介

　　概念：`Redis(REmote DIctinary Server)`是用`C`语言开发的一个开源的高性能键值对（`key-value`）数据库。

　　特征：

1. 数据间没有必然的关联关系
2. 内部采用单线程机制进行工作
3. 高性能；官方提供测试数据，50 个并发执行 100000 个请求，读的速度是 110000 次/s，写的速度是 81000 次/s
4. 多数据类型支持：`string`（字符串类型）、`list`（列表类型）、`hash`（散列类型）、`set`（集合类型）、`sorted_set`（有序集合类型）
5. 持久化支持，可以进行数据灾难恢复

# Redis 应用

* 为热点数据加速查询（主要场景）、如热点商品、热点新闻、热点资讯、推广类等提高访问量信息等
* 任务队列、如秒杀、抢购、购票等
* 即时信息查询，如各位排行榜、各类网站访问统计、公交到站信息、在线人数信息（聊天室、网站）、设备信号等
* 时效性信息控制，如验证码控制，投票控制等
* 分布式数据共享，如分布式集群构架中的session分离
* 消息队列
* 分布式锁

# Redis 基本操作

　　命令行模式工具使用：

* 功能性命令
* 清除屏幕信息
* 帮助信息查阅
* 退出指令

## 信息添加

* 功能：设置`key-value`数据
* 命令

  ```bash
  set key value
  ```
* 范例

  ```bash
  set name itheima
  ```

## 信息查询

* 功能：根据`key`查询对应的`value`，如果不存在，返回空（`null`)
* 命令

  ```bash
  get key
  ```
* 范例

  ```bash
  get name
  ```
* 功能：清除屏幕中的信息
* 命令

  ```bash
  clear
  ```

## 帮助命令

* 功能：获取命令帮助文档，获取组中所有命令信息名称
* 命令

  ```bash
  help 命令名称
  help @组名
  ```

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/\redis-base/redis-command-help.png)

## 退出客户端命令行模式

* 功能：推出客户端
* 命令

  ```bash
  quit
  exit
  < ESC>(慎用)
  ```

# Redis 部署

## 安装

### 从源代码（建议）

　　使用以下命令下载，提取和编译`Redis`：

```bash
$ wget https://download.redis.io/releases/redis-6.2.1.tar.gz
$ tar xzf redis-6.2.1.tar.gz
$ sudo mv redis-6.2.1 redis
$ sudo mkdir /opt/software
$ sudo mv redis /opt/software
$ cd /opt/software/redis
$ sudo make
$ sudo make install
```

### 来自官方的 Ubuntu PPA

　　可以从`redislabs/redis`软件包存储库中安装`Redis`的最新稳定版本。将存储库添加到`apt`索引，对其进行更新并安装：

```bash
$ sudo add-apt-repository ppa:redislabs/redis
$ sudo apt-get update
$ sudo apt-get install redis
```

## 启动服务

### 服务端

* 直接启动

  ```bash
  $ src/redis-server
  ```
* 指定端口

  ```bash
  redis-server --port 6380
  ```

### 客户端

* 直接启动

  ```bash
  $ src/redis-cli
  ```
* 指定端口

  ```bash
  redis-cli -p 6380
  ```

```bash
redis> set foo bar
OK
redis> get foo
"bar"
```

## 指定配置文件启动服务

### 生成配置文件

```bash
sudo mkdir /etc/redis
sudo cp /opt/software/redis/redis.conf /etc/redis
sudo cp /etc/redis/redis.conf /etc/redis/redis-6379.conf
```

### 编辑 Redis 服务配置文件

```bash
sudo vi /etc/redis/redis-6379.conf

# 配置端口
port 6379
# 配置服务为后台运行，关闭终端窗口后，redis 服务在后台运行
# 以守护进程方式启动，使用本启动方式，redis 将以服务的形式存在，日志将不再打印到命令窗口中
daemonize yes
# 配置日志路径
logfile "/var/log/redis/6379.log"
# 配置 redis 工作目录
dir var/lib/redis
```

### 启动 Redis 服务进程并指定配置文件

```bash
# 指定配置文件启动服务

## 安装 Redis

```bash
wget https://download.redis.io/releases/redis-6.2.1.tar.gz
tar xzf redis-6.2.1.tar.gz
sudo mv redis-6.2.1 redis
sudo mkdir /opt/software
sudo mv redis /opt/software
cd /opt/software/redis
sudo make
sudo make install
```

## 生成配置文件

```bash
sudo mkdir /etc/redis
sudo cp /opt/software/redis/redis.conf /etc/redis
sudo cp /etc/redis/redis.conf /etc/redis/redis-6379.conf
```

## 编辑 redis 服务配置文件

```bash
sudo vi /etc/redis/redis-6379.conf

# 配置端口
port 6379
# 配置服务为后台运行，关闭终端窗口后，redis 服务在后台运行
# 以守护进程方式启动，使用本启动方式，redis 将以服务的形式存在，日志将不再打印到命令窗口中
daemonize yes
# 配置日志路径
logfile "/var/log/redis/6379.log"
# 配置 redis 工作目录
dir var/lib/redis
```

## 启动 redis 服务进程并指定配置文件

```bash
sudo redis-server /etc/redis/redis-6379.conf

# 查看 redis 服务进程
ps -ef | grep redis-
# 启动客户端检查
redis-cli
```sudo redis-server /etc/redis/redis-6379.conf

# 查看 redis 服务进程
ps -ef | grep redis-
# 启动客户端检查
redis-cli
```

## 安装Docker版

```bash
atideas@W11-20220220428:~$ docker pull redis:7.0-rc1
atideas@W11-20220220428:~$ mkdir docker/redis/redis01/conf
atideas@W11-20220220428:~$ mkdir docker/redis/redis01/data
atideas@W11-20220220428:~/docker/redis/redis01$ cd conf/
atideas@W11-20220220428:~/docker/redis/redis01/conf$ vi redis.conf
atideas@W11-20220220428:~/docker/redis/redis01/conf$ cd ../
atideas@W11-20220220428:~/docker/redis/redis01$ docker run -d --privileged=true -p 6379:6379 -v $pwd/conf/redis.conf:/usr/local/etc/redis/redis.conf -v $pwd/data:/data --name redis01 redis:7.0-rc1 redis-server /usr/local/etc/redis/redis.conf --appendonly yes
e13cdaf7d9119e27bc0c81d7c8f57bb778b410928c332e8245b362af0d930eec
```

* `$pwd`：代表当前目录
* `-privileged=true`：容器内的`root`拥有真正`root`权限，否则容器内`root`只是外部普通用户权限
* `-v`：指定数据卷绑定
* `redis-server /usr/local/etc/redis/redis.conf`：指定配置文件启动`redis-server`进程
* `-appendonly yes`：开启数据持久化

```conf
# Redis configuration file example.
#
# Note that in order to read the configuration file, Redis must be
# started with the file path as first argument:
# 
# 开始启动时必须如下指定配置文件

# ./redis-server /path/to/redis.conf

# Note on units: when memory size is needed, it is possible to specify
# it in the usual form of 1k 5GB 4M and so forth:
# 
# 存储单位如下所示

# 1k => 1000 bytes
# 1kb => 1024 bytes
# 1m => 1000000 bytes
# 1mb => 1024*1024 bytes
# 1g => 1000000000 bytes
# 1gb => 1024*1024*1024 bytes

################################## INCLUDES ###################################

# 如果需要使用多配置文件配置redis，请用include
#
# include /path/to/local.conf
# include /path/to/other.conf

################################## MODULES ##################################### modules

# 手动设置加载模块（当服务无法自动加载时设置）
#
# loadmodule /path/to/my_module.so
# loadmodule /path/to/other_module.so

################################## NETWORK #####################################

# Examples:
#
# bind 192.168.1.100 10.0.0.1
# bind 127.0.0.1 ::1
# 
# 设置绑定的ip
bind 0.0.0.0

# 保护模式：不允许外部网络连接redis服务
protected-mode yes

# 设置端口号
port 6379

# TCP listen() backlog.
# 
# TCP 连接数，此参数确定了TCP连接中已完成队列(完成三次握手之后)的长度
tcp-backlog 511

# Unix socket.
# 
# 通信协议设置，本机通信使用此协议不适用tcp协议可大大提升性能
# unixsocket /tmp/redis.sock
# unixsocketperm 700



# TCP keepalive.
# 
# 定期检测cli连接是否存活
tcp-keepalive 300

################################# GENERAL #####################################

# 是否守护进程运行（后台运行）
daemonize yes

# 是否通过upstart和systemd管理Redis守护进程
supervised no

# 以后台进程方式运行redis，则需要指定pid 文件
pidfile /var/run/redis_6379.pid

# 日志级别
# 可选项有： # debug（记录大量日志信息，适用于开发、测试阶段）； # verbose（较多日志信息）； # notice（适量日志信息，使用于生产环境）； 
# warning（仅有部分重要、关键信息才会被记录）。
loglevel notice

# 日志文件的位置
logfile "server_log.txt"

# 数据库的个数
databases 16

# 是否显示logo
always-show-logo yes

################################ SNAPSHOTTING  ################################
#
# Save the DB on disk:
# 
# 持久化操作设置 900秒内触发一次请求进行持久化，300秒内触发10次请求进行持久化操作，60s内触发10000次请求进行持久化操作

save 900 1
save 300 10
save 60 10000

# 持久化出现错误后，是否依然进行继续进行工作
stop-writes-on-bgsave-error yes

# 使用压缩rdb文件 yes：压缩，但是需要一些cpu的消耗。no：不压缩，需要更多的磁盘空间
rdbcompression yes

# 是否校验rdb文件，更有利于文件的容错性，但是在保存rdb文件的时候，会有大概10%的性能损耗
rdbchecksum yes

# dbfilename的文件名
dbfilename dump.rdb

# dbfilename文件的存放位置
dir ./

################################# REPLICATION #################################

# replicaof 即slaveof 设置主结点的ip和端口
# replicaof <masterip> <masterport>

# 集群节点访问密码
# masterauth <master-password>

# 从结点断开后是否仍然提供数据
replica-serve-stale-data yes

# 设置从节点是否只读
replica-read-only yes

# 是或否创建新进程进行磁盘同步设置
repl-diskless-sync no

# master节点创建子进程前等待的时间
repl-diskless-sync-delay 5

# Replicas发送PING到master的间隔，默认值为10秒。
# repl-ping-replica-period 10

# 
# repl-timeout 60

# 
repl-disable-tcp-nodelay no

#
# repl-backlog-size 1mb

#
# repl-backlog-ttl 3600

# 
replica-priority 100

#
# min-replicas-to-write 3
# min-replicas-max-lag 10
#
# replica-announce-ip 5.5.5.5
# replica-announce-port 1234

################################## SECURITY ###################################

# 设置连接时密码
# requirepass 123456

################################### CLIENTS ####################################

# 最大连接数
# maxclients 10000

############################## MEMORY MANAGEMENT ################################

# redis配置的最大内存容量
# maxmemory <bytes>

# 内存达到上限的处理策略
# maxmemory-policy noeviction

# 处理策略设置的采样值
# maxmemory-samples 5

# 是否开启 replica 最大内存限制
# replica-ignore-maxmemory yes

############################# LAZY FREEING ####################################

# 惰性删除或延迟释放
lazyfree-lazy-eviction no
lazyfree-lazy-expire no
lazyfree-lazy-server-del no
replica-lazy-flush no

############################## APPEND ONLY MODE ###############################

# 是否使用AOF持久化方式
appendonly no

# appendfilename的文件名

appendfilename "appendonly.aof"

# 持久化策略
# appendfsync always
appendfsync everysec
# appendfsync no

# 持久化时（RDB的save | aof重写）是否可以运用Appendfsync，用默认no即可，保证数据安全性
no-appendfsync-on-rewrite no

# 设置重写的基准值
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 指定当发生AOF文件末尾截断时，加载文件还是报错退出
aof-load-truncated yes

# 开启混合持久化，更快的AOF重写和启动时数据恢复
aof-use-rdb-preamble yes

################################ REDIS CLUSTER  ###############################

# 是否开启集群
# cluster-enabled yes

# 集群结点信息文件
# cluster-config-file nodes-6379.conf

# 等待节点回复的时限
# cluster-node-timeout 15000

# 结点重连规则参数
# cluster-replica-validity-factor 10

#
# cluster-migration-barrier 1

#
# cluster-require-full-coverage yes

#
# cluster-replica-no-failover no
```

　　注意：不要配置`daemonize yes`，否则无法启动容器，启动后会立即停止。
