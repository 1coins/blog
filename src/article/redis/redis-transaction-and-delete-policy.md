---
date: 2023-09-30
article: true
timeline: true
index: true
title: Redis 事务和删除策略
category: Redis
tag:
- Redis
---

# 事务

## 简介

　　`Redis`执行指令过程中，多条连续执行的指令被干扰，打断，插队。

　　`Redis`事务就是一个命令执行的队列，将一系列预定义命令包装成一个整体（一个队列）。当执行时，一次性按照添加顺序依次执行，中间不会被打断或者干扰。

　　一个队列中，一次性、顺序性、排他性的执行一系列命令。

## 事务基本操作

* 开启事务

  ```bash
  multi
  ```

  * 作用

    * 设定事务的开启位置，此指令执行后，后续的所有指令均加入到事务中
* 执行事务

  ```bash
  exec
  ```

  * 作用

    * 设定事务的结束位置，同时执行事务。与`multi`成对出现，成对使用
* 取消事务

  ```bash
  discard
  ```

  * 作用

    * 终止当前事务的定义，发生在`multi`之后，`exec`之前

```bash
127.0.0.1:6379> multi
Ok
127.0.0.1:6379(TX)> set age 30
QUEUED
127.0.0.1:6379(TX)> get age
QUEUED
127.0.0.1:6379(TX)> set age 31
QUEUED
127.0.0.1:6379(TX)> get age
QUEUED
127.0.0.1:6379(TX)> exec
1) OK
2) "30"
3) OK
4) "31"
127.0.0.1:6379>  
127.0.0.1:6379> multi
Ok
127.0.0.1:6379(TX)> set age 32
QUEUED
127.0.0.1:6379(TX)> get age
QUEUED
127.0.0.1:6379(TX)> set age 33
QUEUED
127.0.0.1:6379(TX)> get age
QUEUED
127.0.0.1:6379(TX)> discard
OK
127.0.0.1:6379> exec
(error) ERR EXEC without MULTI
127.0.0.1:6379> 
```

　　注意：加入事务的命令暂时进入到任务队列中，并没有立即执行，只有执行`exec`命令才开始执行。

### 事务的工作流程

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-transaction-and-delete-policy/transaction-operate-process.png)

### 事务注意事项

* 语法错误（命令格式输入错误）

  * 指命令书写格式有误
  * 处理结果

    * 如果定义的事务中所包含的命令存在语法错误，整体事务中所有命令均不会执行。包括那些语法正确的命令

  ```bash
    127.0.0.1:6379> multi
    127.0.0.1:6379(TX)> set name itheima
    QUEUED
    127.0.0.1:6379(TX)> get name
    QUEUED
    127.0.0.1:6379(TX)> tes name itcast
    (error)
    127.0.0.1:6379(TX)> exec
    (error)
  ```
* 运行错误（命令执行出现错误）

  * 指命令格式正确，但是无法正确的执行，例如对`list`进行`incr`操作
  * 处理结果

    * 能够正确运行的命令会执行，运行错误的命令不会被执行

  ```bash
    127.0.0.1:6379> multi
    127.0.0.1:6379(TX)> set name itheima
    QUEUED
    127.0.0.1:6379(TX)> get name
    QUEUED
    127.0.0.1:6379(TX)> set name itcast
    QUEUED
    127.0.0.1:6379(TX)> get name
    QUEUED
    127.0.0.1:6379(TX)> lpush name a b c
    QUEUED
    127.0.0.1:6379(TX)> get name
    QUEUED
    127.0.0.1:6379(TX)> EXEC
    1) ok
    2) "ITHEIMA"
    3) ok
    4) "itheima"
    5) {error} WRONGTYPE
    6) "itcast"
  ```

　　注意：已经执行完毕的命令对应的数据不会自动回滚，需要程序员自己在代码中实现回滚。

### 手动事务回滚

* 记录操作过程中被影响的数据之前的状态

  * 单数据：`string`
  * 多数据：`hash`、`list`、`set`、`zset`
* 设置指令恢复所有的被修改的项

  * 单数据：直接`set`（注意周边属性，例如时效）
  * 多数据：修改对应值或整体克隆复制

# 锁

## 监视锁

### 业务场景

　　天猫双 11 热卖过程中，对已经售罄的货物追加补货，4 个业务员都有权限进行补货；补货的操作可能是一系列的操作，牵扯到多个连续操作，如何保障不会重复操作？

### 业务分析

* 多个客户端有可能同时操作同一组数据，并且该数据一旦被操作修改后，将不适用于继续操作
* 在操作之前锁定要操作的数据，一旦发生变化，终止当前操作

### 解决方案

* 对`key`添加监视锁，在执行`exec`前如果`key`发生了变化，终止事务执行

  ```bash
  watch key1 [key2……]
  ```
* 取消对所有`key`的监视

  ```bash
  unwatch
  ```

1. 客户端 1  

    ```bash
     127.0.0.1:6379> set name 123
     127.0.0.1:6379> watch name
     OK
     127.0.0.1:6379> multi
     127.0.0.1:6379(TX)> set a a
     QUEUED
     127.0.0.1:6379(TX)> get a
     QUEUED
     127.0.0.1:6379(TX)> EXEC
    ```
2. 客户端 2  

    ```bash
     [echo@centos ~]$ sudo redis-cli
     127.0.0.1:6379> set name 321
     OK
    ```
3. 客户端 1  

    ```bash
     127.0.0.1:6379> set name 123
     127.0.0.1:6379> watch name
     127.0.0.1:6379> multi
     127.0.0.1:6379(TX)> set a a
     QUEUED
     127.0.0.1:6379(TX)> get a
     QUEUED
     127.0.0.1:6379(TX)> exec
     (nil)
     127.0.0.1:6379> 
    ```

### **Tips 21**

　　`Redis`应用基于状态控制的批量任务执行。

## 分布式锁

### 业务场景

　　天猫双 11 热卖过程中，对已经售罄的货物追加补货，且补货完成，客户购买热情高涨，3 秒内将所有商品购买完毕；本次补货已经将库存全部清空，如何避免最后一件商品不被多人同时购买？【超卖问题】

### 业务分析

* 使用`watch`监控一个`key`有没有改变已经不能解决问题，此处要监控的是具体数据
* 虽然`Redis`是单线程的，但是多个客户端对同一数据同时进行操作时，如何避免不被同时修改？

### 解决方案

* 使用`setnx`设置一个公共锁

  ```bash
  setnx lock-key value
  ```

　　利用`setnx`命令的返回值特征，有值则返回设置失败，无值则返回设置成功

* 对于返回设置成功的，拥有控制权，进行下一步的具体业务操作
* 对于返回设置失败的，不具有控制权，排队或等待

　　操作完毕通过`del`操作释放锁。

1. 客户端 1  

    ```baah
     127.0.0.1:6379> set num 10
     127.0.0.1:6379> setnx lock-num 1
     (integer) 1
     127.0.0.1:6379> incrby num -1
     (integer) 9
     127.0.0.1:6379> del lock-num
     (integer) 1
    ```
2. 客户端 2  

    ```bash
     127.0.0.1:6379> setnx lock-num 1
     (integer) 1
    ```
3. 客户端 1  

    ```bash
     127.0.0.1:6379> set num 10
     127.0.0.1:6379> setnx lock-num 1
     (integer) 1
     127.0.0.1:6379> incrby num -1
     (integer) 9
     127.0.0.1:6379> del lock-num
     (integer) 1
     127.0.0.1:6379> 
     127.0.0.1:6379> setnx lock-num 1
     (integer) 0
    ```
4. 客户端 2  

    ```bash
     127.0.0.1:6379> setnx lock-num 1
     (integer) 1
     127.0.0.1:6379> incrby num -1
     (integer) 8
     127.0.0.1:6379> del lock-num
     (integer) 1
    ```
5. 客户端 1  

    ```bash
     127.0.0.1:6379> set num 10
     127.0.0.1:6379> setnx lock-num 1
     (integer) 1
     127.0.0.1:6379> incrby num -1
     (integer) 9
     127.0.0.1:6379> del lock-num
     (integer) 1
     127.0.0.1:6379> 
     127.0.0.1:6379> setnx lock-num 1
     (integer) 0
     127.0.0.1:6379> setnx lock-num 1
     (integer) 1
    ```

　　注意：上述解决方案是一种设计概念，依赖规范保障，具有风险性

### Tips 22

　　`Redis`应用基于分布式锁对应的场景控制。

## 分布式锁改良

### 业务场景

　　依赖分布式锁的机制，某个用户操作时对应客户端宕机，且此时已经获取到锁，如何解决？

### 业务分析

* 由于锁操作由用户控制加锁解锁，必定会存在加锁后未解锁的风险
* 需要解锁操作不能仅依赖用户控制，系统级别要给出对应的保底处理方案

### 解决方案

* 使用`expire`为锁`key`添加时间限定，到时不释放，放弃锁

  ```bash
  expire lock-key second
  pexpire lock-key milliseconds
  ```

1. 客户端 1  

    ```bash
     127.0.0.1:6379> set name 123
     127.0.0.1:6379> setnx lock-num 1
     (integer) 1
     127.0.0.1:6379> expire lock-name 10
     (integer) 1
    ```
2. 客户端 2  

    ```bash
     127.0.0.1:6379> setnx lock-name 1
     (integer) 0
     127.0.0.1:6379> setnx lock-name 1
     (integer) 0
     127.0.0.1:6379> setnx lock-name 1
     (integer) 0
     127.0.0.1:6379> setnx lock-name 1
     (integer) 0
     127.0.0.1:6379> setnx lock-name 1
     (integer) 1
    ```

　　由于操作通常都是微秒或毫秒级，因此该锁定时间不宜设置过大，具体时间需要业务测试后确认：

* 例如：持有锁的操作最长执行时间 127 ms，最短执行时间 7 ms。
* 测试百万次最长执行时间对应命令的最大耗时，测试百万次网络延迟平均耗时
* 锁时间设定推荐：最大耗时 * 120% + 平均网络延迟 * 110 %
* 如果业务最大耗时 << 网络平均延迟，通常为 2 个数量级，取其中单个耗时较长即可

# 删除策略

## 过期数据

### Redis 中的数据特征

　　`Redis`是一种内存级数据库，所有数据均存放在内存中，内存中的数据可以通过`TTL`指令获取其状态：

* `XX`：具有时效性的数据
* -1：永久有效的数据
* -2：已经过期的数据或被删除的数据或未定义的数据

　　过期数据就是那些曾经设置有有效期的数据到达了有效期最终留下的数据。

### 数据删除策略

* 定时删除
* 惰性删除
* 定期删除

## 数据删除策略

### 时效性数据的存储结构

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-transaction-and-delete-policy/time-sensitive-data-storage-structure.png)

### 数据删除策略的目标

　　在内存占用与`CPU`占用之间寻找一种平衡，顾此失彼都会造成整体`Redis`性能的下降，甚至引发服务器宕机或内存泄露。

### 定时删除

　　创建一个定时器，当`key`设置有过期时间，且过期时间到达时，由定时器任务立即执行对键的删除操作。

* 优点：节约内存，到时就删除，快速释放掉不必要的内存占用
* 缺点：`CPU`压力很大，无论`CPU`此时负载量多高，均占用`CPU`，会影响`Redis`服务器响应时间和指令吞吐量

　　总结：用处理器性能换取存储空间（拿时间换空间）。

### 惰性删除

　　数据到达过期时间，不做处理。等下次访问该数据时：如果未过期，返回数据；如果发现已过期，删除，返回不存在（`get`操作与`expireIfNeeded()`函数绑定，在获取数据前先使用`expireIfNeeded()`函数查询数据是否过期）。

* 优点：节约`CPU`性能，发现必须删除的时候才删除
* 缺点：内存压力很大，出现长期占用内存的数据

　　总结：用存储空间换取处理器性能（拿时间换空间）。

### 定期删除

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-transaction-and-delete-policy/delete-regularly.png)

* `Redis`启动服务器初始化时，读取配置`server.hz`的值，默认为 10
* 每秒钟执行`server.hz`次`serverCron()`

  ```chart
  serverCron()
  	|---> databasesCron() 
  		|---> activeExpireCycle()
  ```
* **activeExpireCycle()** 对每个`expires[\*]`逐一进行检测，每次执行`250ms/server.hz`
* 对某个`expires[\*]`检测时，随机挑选`W`个`key`检测

  * 如果`key`超时，删除`key`
  * 如果一轮中删除的`key`的数量 > `W \* 25%`，循环该过程
  * 如果一轮中删除的`key`的数量 ≤ `W \* 25%`，检查下一个`expires[\*]`，0-15 循环（`expire`池有 16 个）
  * `W`取值 = `ACTIVE_EXPIRE_CYCLE_LOOKUPS_PER_LOOP`属性值
* 参数`current_db`用于记录**`activeExpireCycle()`** 进入哪个`expires[\*]`执行
* 如果**`activeExpireCycle()`**执行时间到期，下次从`current_db`继续向下执行

　　周期性轮询`Redis`库中的时效性数据，采用随机抽取的策略，利用过期数据占比的方式控制删除频度。

* 特点1：`CPU`性能占用设置有峰值，检测频度可自定义设置
* 特点2：内存压力不是很大，长期占用内存的冷数据会被持续清理

　　总结：周期性抽查存储空间（随机抽查，重点抽查）。

### 删除策略比对

* 定时删除

  * 节约内存，无占用
  * 不分时段占用`CPU`资源，频度高
  * 拿时间换空间
* 惰性删除

  * 内存占用严重
  * 延时执行，`CPU`利用率高
  * 拿空间换时间
* 定期删除

  * 内存定期随机清理
  * 每秒花费固定的`CPU`资源维护内存
  * 随机抽查，重点抽查

# 逐出算法

## 新数据进入检测

　　当新数据进入`Redis`时，如果内存不足怎么办？

　　`Redis`使用内存存储数据，在执行每一个命令前，会调用**`freeMemoryIfNeeded()`**检测内存是否充足。如果内存不满足新加入数据的最低存储要求，`Redis`要**临时删除一些数据**（数据淘汰/数据逐出）为当前指令清理存储空间。清理数据的策略称为**逐出算法**。

　　注意：逐出数据的过程不是 100 % 能够清理出足够的可使用的内存空间，如果不成功则反复执行。当对所有数据尝试完毕后，如果不能达到内存清理的要求，将出现**错误信息**。

```bash
(error)OOM command not allowed when used memory > 'maxmemory'
```

## 影响数据逐出的相关配置

* 最大可使用内存

  ```bash
  maxmemory
  ```

  占用物理内存的比例，默认值为 0，表示不限制；生产环境中根据需求设定，通常设置在 50% 以上。
* 每次选取待删除数据的个数

  ```bash
  maxmemory-samples
  ```

  选取数据时并不会全库扫描，导致严重的性能消耗，降低读写性能，因此采用随机获取数据的方式作为待检测删除数据
* 删除策略

  ```bash
  maxmemory-policy volatile-lru
  ```

  达到最大内存后的，对被挑选出来的数据进行删除的策略

  * 检测易失数据（可能会过期的数据集`server.db[i].expires`）

    1. `volatile-lru(Least Recently Used)`：挑选最近最少使用（最近没使用）的数据淘汰，**建议使用**
    2. `volatile-lfu(Least Frequently Used)`：挑选最近使用次数最少的数据淘汰
    3. `volatile-ttl`：挑选将要过期的数据淘汰
    4. `volatile-random`：任意选择数据淘汰
  * 检测全库数据（所有数据集`server.db[i].dict`）  
    5. `allkeys-lru`：挑选最近最少使用的数据淘汰  
    6. `allkeys-lfu`：挑选最近使用次数最少的数据淘汰  
    7. `allkeys-random`：任意选择数据淘汰
  * 放弃数据驱逐<br />8. `no-enviction`（驱逐）：禁止驱逐数据（`Redis4.0`中默认策略），会引发错误`OOM(Out Of Memory)`  
    ![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-transaction-and-delete-policy/lru-and-lfu.png)

## 数据逐出策略配置依据

　　使用`INFO`命令输出监控信息，查询缓存`hit`（命中）和`miss`（丢失）的次数，根据业务需求调优`Redis`配置。

　　‍
