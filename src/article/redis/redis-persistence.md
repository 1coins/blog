---
date: 2023-09-24
article: true
timeline: true
index: true
title: Redis 持久化
category: Redis
tag:
- Redis
---

# 简介

* 什么是持久化？

  * 利用永久性存储介质将数据进行保存，在特定的时间将保存的数据进行恢复的工作机制称为持久化。
* 为什么要进行持久化？

  * 防止数据的意外丢失，确保数据安全性
* 持久化过程保存什么？

  * `RDB`：将当前数据状态进行保存，快照形式，存储数据结果，存储格式简单，关注点在数据
  * `AOF`：将数据的操作过程进行保存，日志形式，存储操作过程，存储格式复杂，关注点在数据的操作过程

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-persistence/rdb-and-aof.png)

# RDB

## 启动方式

　　保存数据即是做一件事，也就是：谁，什么时间，干什么事情。

### 命令执行

* 谁：`Redis`操作者（用户）
* 什么时间：即时（随时进行）
* 干什么事情：保存数据

#### save 指令

* 命令

  ```bash
  save
  ```
* 作用

  * 手动执行一次保存操作
  * 数据默认保存在根目录下的`dump.rdb`

```bash
127.0.0.1:6379> set name 123
OK
127.0.0.1:6379> save
OK
127.0.0.1:6379> set age 39
127.0.0.1:6379> save
```

#### save 指令相关配置

　　配置文件即为`redis-6379.conf`。

* `dbfilename dump.rdb`

  * 说明：设置本地数据库文件名，默认值为`dump.rdb`
  * 经验：通常设置为`dump-端口号.rdb`
* `dir`

  * 说明：设置存储`.rdb`文件的路径
  * 经验：通常设置成存储空间较大的目录中，目录名称`data`
* `rdbcompression yes`

  * 说明：设置存储至本地数据库时是否压缩数据，默认为`yes`，采用`LZF`压缩
  * 经验：通常默认为开启状态，如果设置为`no`，可以节省`CPU`运行时间，但会使存储的文件变大（巨大）
* `rdbchecksum yes`

  * 说明：设置是否进行`RDB`文件格式校验，该校验过程在写文件和读文件过程均进行
  * 经验：通常默认为开启状态，如果设置为`no`，可以节约读写性过程约 10% 时间消耗，但是存储一定的数据损坏风险

#### 数据恢复

　　使用`save`命令保存后，如果突然断电，会在重启时加载`.rdb`文件恢复数据。

#### save 指令工作原理

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-persistence/save-operate-principle.png)

　　注意：`save`指令的执行会阻塞当前`Redis`服务器，直到当前`RDB`过程完成为止，有可能会造成长时间阻塞，线上环境不建议使用。

### 后台执行

　　场景：数据量过大，单线程执行方式造成效率过低

* 谁：`Redis`操作者（用户）发起指令；`Redis`服务器控制指令执行
* 什么时间：即时（发起）；合理的时间（执行）
* 干什么事情：保存

#### bgsave 指令

* 命令

  ```bash
  bgsave
  ```
* 作用

  * 手动启动后台保存操作，但不是立即执行

```bash
127.0.0.1:6379> set name 123
127.0.0.1:6379> save
127.0.0.1:6379> set age 39
127.0.0.1:6379> save
127.0.0.1:6379> set addr beijing
127.0.0.1:6379> bgsave
Background saving started
```

#### bgsave 指令相关配置

* `dbfilename dump.rdb`
* `dir`
* `rdbcompression yes`
* `rdbchecksum yes`
* `stop-writes-on-bgsave-error yes`

  * 说明：后台存储过程中如果出现错误现象，是否停止保存操作
  * 经验：通常默认为开启状态

#### bgsave 指令工作原理

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-persistence/bgsave-operate-principle.png)

　　注意： `bgsave`命令是针对`save`阻塞问题做的优化；`Redis`内部所有涉及到`RDB`操作都采用`bgsave`的方式，`save`命令可以放弃使用。

### 自动执行

　　场景：反复执行保存指令，忘记了怎么办？不知道数据产生了多少变化，何时保存？

* 谁：`Redis`服务器发起指令（基于条件）
* 什么时间：满足条件
* 干什么事情：保存数据

#### save 配置

* 配置

  ```bash
  save second chang
  ```
* 作用

  * 满足限定时间范围内`key`的变化数量达到指定数量即进行持久化
* 参数

  * `second`：监控时间范围
  * `changes`：监控`key`的变化量
* 位置

  * 在`conf`文件中进行配置
* 范例

  ```bash
  save 900 1
  save 300 10
  save 60 10000
  ```

#### save 配置原理

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-persistence/save-config-operate-principle.png)

　　注意：

* `save`配置要根据实际业务情况进行设置，频度过高或过低都会出现性能问题，结果可能是灾难性的
* `save`配置中对于`second`与`changes`设置通常具有互补对应关系，尽量不要设置成包含性关系
* `save`配置启动后执行的是`bgsave`操作

### 三种启动方式对比

|方式|`save`指令|`bgsave`指令|
| :--------------: | :--------: | :--------: |
|读写|同步|异步|
|阻塞客户端指令|是|否|
|额外内存消耗|否|是|
|启动新进程|否|是|

## 特殊启动方式

* 全量复制

  * 把一个`Redis`服务器中的数据复制给别人，要先存储才能复制，而且存储的是全数据，因此`RDB`是解决方案
  * 在主从复制中详细讲解
* 服务器运行过程中重启

  ```bash
  debug reload
  ```
* 关闭服务器时指定保存数据

  ```bash
  shutdown save
  ```

　　注意：默认情况下执行`shutdown`命令时，自动执行`bgsave`（如果没有开启`AOF`持久化功能）

### RDB 优点

* `RDB`是一个紧凑压缩的二进制文件，存储效率较高
* `RDB`内部存储的是`Redis`在某个时间点的数据快照，非常适合用于数据备份，全量复制等场景
* `RDB`恢复数据的速度要比`AOF`快很多
* 应用：服务器中每`X`小时执行`bgsave`备份，并将`RDB`文件拷贝到远程机器中，用于灾难恢复

### RDB 缺点

* `RDB`方式无论是执行指令还是利用配置，无法做到实时持久化，具有较大的可能性丢失数据
* `bgsave`指令每次运行要执行`fork`操作创建子进程，要牺牲掉一些性能
* `Redis`的众多版本中未进行`RDB`文件格式的版本统一，有可能出现各版本服务之间数据格式无法兼容现象

# AOF

## RDB 存储的弊端

* 存储数据量较大，效率较低

  * 基于快照思想，每次读写都是全部数据，当数据量巨大时，效率非常低
* 大数据量下的`IO`性能较低
* 基于`fork`创建子进程，内存产生额外消耗
* 宕机带来的数据丢失风险

### 解决思路

* 不写全数据，仅记录部分数据
* 降低区分数据是否改变的难度，改记录数据为记录操作过程
* 对所有操作均进行记录，排除丢失数据的风险

## AOF 概念

* `AOF`（`append only file`）持久化：以独立日志的方式记录每次写命令，重启时再重新执行`AOF`文件中命令达到恢复数据的目的。与`RDB`相比可以简单描述为**改记录数据为记录数据产生的过程**
* `AOF`的主要作用是解决了数据持久化的实时性，目前已经是`Redis`持久化的主流方式

## AOF 写数据过程

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-persistence/aof-rite-data-process.png)

　　注意：将命令同步到`AOF`文件中时，需要明确一次写多少条数据、多久写一次数据等问题。

## AOF 写数据三种策略（appendfsync）

* `always`（每次）

  * 每次写入操作均同步到AOF文件中，**数据零误差，性能较低**，不建议使用
* `everysec`（每秒）

  * 每秒将缓冲区中的指令同步到`AOF`文件中，**数据准确性较高，性能较高**，但在系统突然宕机的情况下丢失 1 秒内的数据，建议使用，也是默认配置
* `no`（系统控制）

  * 由操作系统控制每次同步到`AOF`文件的周期，整体过程**不可控**

## AOF 功能开启

* 配置

  ```bash
  appendonly yes|no
  ```
* 作用

  * 是否开启AOF持久化功能，默认为不开启状态
* 配置

  ```bash
  appendfsync always|everysec|no
  ```
* 作用

  * `AOF`写数据策略

## AOF 相关配置

* 配置

  ```bash
  appendfilename filename
  ```
* 作用

  * `AOF`持久化文件名，默认文件名为`appendonly.aof`，建议配置为`appendonly-端口号.aof`
* 配置

  ```bash
  dir
  ```
* 作用

  * AOF持久化文件保存路径，与`RDB`持久化文件保持一致即可

## AOF 重写

　　随着命令不断写入`AOF`，文件会越来越大，为了解决这个问题，`Redis`引入了`AOF`重写机制压缩文件体积。`AOF`文件重写是将`Redis`进程内的数据转化为写命令同步到新`AOF`文件的过程。简单说就是**将对同一个数据的若干个条命令执行结果转化成最终结果数据对应的指令进行记录**。

### AOF 重写作用

* 降低磁盘占用量，提高磁盘利用率
* 提高持久化效率，降低持久化写时间，提高IO性能
* 降低数据恢复用时，提高数据恢复效率

### AOF 重写规则

* 进程内已超时的数据不再写入文件
* 忽略无效指令，重写时使用进程内数据直接生成，这样新的`AOF`文件只保留最终数据的写入命令  
  如：`del key1`、 `hdel key2`、`srem key3`、`set key4 111`、`set key4 222`等
* 对同一数据的多条写命令合并为一条命令。如：`lpush list1 a`、`lpush list1 b`、 `lpush list1 c`可以转化为：`lpush list1 a b c`。为防止数据量过大造成客户端缓冲区溢出，对`list`、`set`、`hash`、`zset`等类型，每条指令最多写入 64 个元素

### AOF 重写方式

#### 手动重写

* 命令

  ```bash
  bgrewriteaof
  ```

```bash
127.0.0.1:6379> set name 123
127.0.0.1:6379> set name 234
127.0.0.1:6379> set name 345
127.0.0.1:6379> bgreweiteaof
```

##### bgrewriteaof 指令工作原理

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-persistence/bgrewriteaof-operate-principle.png)

#### 自动重写

* 配置

  * 自动重写触发条件设置

    ```bash
    auto-aof-rewrite-min-size size
    auto-aof-rewrite-percentage percentage
    ```
  * 自动重写触发比对参数（ 运行指令`info Persistence`获取具体信息 ）

    ```bash
    aof_current_size
    aof_base_size
    ```
  * 自动重写触发条件

    $$
    \begin{aligned}
    aof\_current\_size &> auto-aof-rewrite-min-size size \\
    \frac {(aof\_current\_size - aof\_base\_size)} {aof\_base\_size} &\ge auto-aof-rewrite-percentage percentage
    \end{aligned}
    $$

### AOF 重写流程

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-persistence/aof-rewrite-process1.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-persistence/aof-rewrite-process2.png)

　　`AOF`缓冲区同步文件策略，由参数`appendfsync`控制。

　　系统调用`write`和`fsync`说明：

* `write`操作会触发延迟写（`delayed write`）机制，`Linux`在内核提供页缓冲区用来提高硬盘`IO`性能；`write`操作在写入系统缓冲区后直接返回，同步硬盘操作依赖于系统调度机制，列如：缓冲区页空间写满或达到特定时间周期；同步文件之前，如果此时系统故障宕机，缓冲区内数据将丢失
* `fsync`针对单个文件操作（比如`AOF`文件），做强制硬盘同步，`fsync`将阻塞直到写入硬盘完成后返回，保证了数据持久化

　　除了`write`、`fsync`、`Linux`还提供了`sync`、`fdatasync`操作。

# RDB 与 AOF 区别

|持久化方式|`RDB`|`AOF`|
| :------------: | :------------------: | :------------------: |
|占用存储空间|小（数据级：压缩）|大（指令级：重写）|
|存储速度|慢|快|
|恢复速度|快|慢|
|数据安全性|会丢失数据|依据策略决定|
|资源消耗|高/重量级|低/轻量级|
|启动优先级|低|高|

## RDB 与 AOF 的选择

* 对数据非常敏感，建议使用默认的`AOF`持久化方案

  * `AOF`持久化策略使用`everysecond`，每秒钟`fsync`一次。该策略`redis`仍可以保持很好的处理性能，当出现问题时，最多丢失 0-1 秒内的数据。
  * 注意：由于`AOF`文件存储体积较大，且恢复速度较慢
* 数据呈现阶段有效性，建议使用`RDB`持久化方案

  * 数据可以良好的做到阶段内无丢失（该阶段是开发者或运维人员手工维护的），且恢复速度较快，阶段点数据恢复通常采用`RDB`方案
  * 注意：利用`RDB`实现紧凑的数据持久化会使`Redis`降的很低，慎重
* 综合比对

  * `RDB`与`AOF`的选择实际上是在做一种权衡，每种都有利有弊
  * 如不能承受数分钟以内的数据丢失，对业务数据非常敏感，选用`AOF`
  * 如能承受数分钟以内的数据丢失，且追求大数据集的恢复速度，选用`RDB`
  * 灾难恢复选用`RDB`
  * 双保险策略，同时开启`RDB`和`AOF`，重启后，`Redis`优先使用`AOF`来恢复数据，降低丢失数据的量

# 持久化应用场景

* ~~`Tips 1`~~~~：~~~~`redis`~~~~用于控制数据库表主键id，为数据库表主键提供生成策略，保障数据库表的主键唯一性~~
* ~~`Tips 3`~~~~：~~~~`redis`~~~~应用于各种结构型和非结构型高热度数据访问加速~~
* ~~`Tips 4`~~~~：~~~~`redis`~~~~应用于购物车数据存储设计~~
* `Tips 5`：`redis`应用于抢购，限购类、限量发放优惠卷、激活码等业务的数据存储设计
* `Tips 6`：`redis`应用于具有操作先后顺序的数据控制
* `Tips 7`：`redis`应用于最新消息展示
* ~~`Tips 9`~~~~：~~~~`redis`~~~~应用于同类信息的关联搜索，二度关联搜索，深度关联搜索~~
* `Tips 12`：`redis`应用于基于黑名单与白名单设定的服务控制
* `Tips 13`：`redis`应用于计数器组合排序功能对应的排名
* `Tips 15`：`redis`应用于即时任务/消息队列执行管理
* `Tips 16`：`redis`应用于按次结算的服务控制
