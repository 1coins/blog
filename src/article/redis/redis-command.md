---
date: 2023-09-20
article: true
timeline: true
index: true
title: Redis 通用命令
category: Redis
tag:
- Redis
---

# Key 通用指令

## Key 特征

　　`key`是一个字符串，通过`key`获取`Redis`中保存的数据。

## Key 应该设计那些操作？

* 对于`key`自身状态的相关操作，例如：删除，判定存在，获取类型等
* 对于`key`有效性控制相关操作，例如：有效期设定，判定是否有效，有效状态的切换等
* 对于`key`快速查询操作，例如：按指定策略查询`key`

## Key 基本操作

* 删除指定`key`

  ```bash
  del key
  ```
* 获取`key`是否存在

  ```bash
  exists key
  ```
* 获取`key`的类型

  ```bash
  type key
  ```

```bash
127.0.0.1:6379> set str str
OK
127.0.0.1:6379> hset hash1 hash1 hash1
(integer) 0
127.0.0.1:6379> lpush list1 list1
(integer) 2
127.0.0.1:6379> sadd set1 set1
(integer) 0
127.0.0.1:6379> zadd zset1 1 zsete1
(integer) 1
127.0.0.1:6379> tpe zset1
zset
127.0.0.1:6379> type str
string
127.0.0.1:6379> type hash1 
hash
127.0.0.1:6379> exists str
(integer) 1
127.0.0.1:6379> del zset1
(integer) 1
127.0.0.1:6379> del zset1
(integer) 0127.0.0.1:6379> exists zset1
(integer) 0
127.0.0.1:6379> 
```

## Key 扩展操作（时效性控制）

* 为指定`key`设置有效期

  ```bash
  Windows 系统中使用：
  expire key seconds
  pexpire key milliseconds

  Linux 系统中使用：
  expireat key timestamp
  pexpireat key millinseconds-timestamp
  ```
* 获取`key`有效时间

  ```bash
  ttl key
  pttl key

  ttl key：
  如果一个 key 不存在，返回值是 -2
  如果一个 key 存在，返回值是 -1
  如果一个 key 设置了有效期，就返回现在的有效时长
  ```
* 切换`key`从时效性转换为永久性

  ```bash
  persist key
  ```

```bash
127.0.0.1:6379> set str str 
OK
127.0.0.1:6379> lpush list1 list1
(integer) 3
127.0.0.1:6379> lpush list2 list2
(integer) 1
127.0.0.1:6379> expire str 3
(integer) 1
127.0.0.1:6379> get str
"str"
127.0.0.1:6379> get str
(nil)
127.0.0.1:6379> expire list1 30
(integer) 1
127.0.0.1:6379> ttl list1
(integer) 27
127.0.0.1:6379> ttl list1
(integer) 23
127.0.0.1:6379> ttl str
(integer) -2
127.0.0.1:6379> ttl list1
(integer) -2
127.0.0.1:6379> get list1
(nil)
127.0.0.1:6379> ttl list2
(integer) -1
127.0.0.1:6379> persist list2
(integer) 0
127.0.0.1:6379> expire list2 60
(integer) 1
127.0.0.1:6379> ttl list2
(integer) 56
127.0.0.1:6379> persist list2
(integer) 1
127.0.0.1:6379> ttl list2
(integer) -1
127.0.0.1:6379> persist str
(integer) 0
127.0.0.1:6379> 
```

## Key 扩展操作（查询模式）

* 查询`key`

  ```bash
  keys pattern
  ```

### 查询模式规则

```bash
* 匹配任意数量的任意符号
? 配合一个任意符号
[] 匹配一个指定符号

keys * 查询所有
keys it* 查询所有以 it 开头
keys *heima 查询所有以 heima 结尾
keys ??heima 查询所有前面两个字符任意，后面以 heima 结尾
keys user:? 查询所有以 user: 开头，最后一个字符任意
keys u[st]er:1 查询所有以 u 开头，以 er:1 结尾，中间包含一个字母，s 或 t
```

```bash
127.0.0.1:6379> keys *
(empty list or set)
127.0.0.1:6379> set str str
OK
127.0.0.1:6379> set str1 str1
OK
127.0.0.1:6379> keys *
1) "str1"
2) "str"
127.0.0.1:6379> set name itheima
OK
127.0.0.1:6379> set itheima name
OK
127.0.0.1:6379> keys *
1) "itheima"
2) "name"
3) "str1"
4) "str"
127.0.0.1:6379> keys it*
1) "itheima"
127.0.0.1:6379> keys s*
1) "str1"
2) "str"
127.0.0.1:6379> keys 1?heima
1) "itheima"
127.0.0.1:6379> set smr smr
OK
127.0.0.1:6379> keys s?r
1) "str"
2) "smr"
127.0.0.1:6379> keys ????
1) "str1"
2) "name"
127.0.0.1:6379> keys n[abc]me
1) "name"
127.0.0.1:6379> set nbme nbme
OK
127.0.0.1:6379> set nwme nwme
OK
127.0.0.1:6379> keys n[aw]me
1) "nwme"
2) "name"
127.0.0.1:6379> 
```

## Key 其他操作

* 为`key`改名

  ```bash
  # 如果已经有 newkey 的数据，直接覆盖
  rename key newkey 
  # 如果已经有，则失败
  renamenx key newkey 
  ```
* 对所有`key`排序

  ```bash
  sort
  ```
* 其他`key`通用操作

  ```bash
  help @generic
  ```

```bash
127.0.0.1:6379> set str str
127.0.0.1:6379> set str1 str1
127.0.0.1:6379> set str2 str2
127.0.0.1:6379> rename str str3
OK
127.0.0.1:6379> keys *
1) "nbme"
2) "nwme"
3) "name"
4) "str3"
5) "str2"
6) "str1"
7) "smr"
8) "itheima"
127.0.0.1:6379> get str 
(nil)
127.0.0.1:6379> rename str3 str2
OK
127.0.0.1:6379> get *
1) "nbme"
2) "nwme"
3) "name"
4) "str2"
5) "str1"
6) "smr"
7) "itheima"
127.0.0.1:6379> get str2
"str"
127.0.0.1:6379> renamenx str1 str2
(integer) 0
127.0.0.1:6379> renamenx str1 str3
(integer) 1
127.0.0.1:6379> sort str1
(empty list or set)
127.0.0.1:6379> help sort
127.0.0.1:6379> lpush aa 123
(integer) 1
127.0.0.1:6379> lpush aa 321
(integer) 2
127.0.0.1:6379> lpush aa 222
(integer) 3
127.0.0.1:6379> lrange aa 0 -1
1) "222"
2) "321"
3) "123"
127.0.0.1:6379> sort aa
1) "123"
2) "222"
3) "321"
127.0.0.1:6379> lrange aa 0 -1
1) "222"
2) "321"
3) "123"
127.0.0.1:6379> sort aa desc
1) "321"
2) "222"
3) "123"
```

# 数据库通用操作

## Key 重复问题

* `key`是由程序员定义的
* `Redis`在使用过程中，伴随着操作数据量的增加，会出现大量的数据以及对应的`key`
* 数据不区分种类，类别混杂在一起，极易出现重复或冲突

## 解决方案

* `Redis`为每个服务器提供有 16 个数据库，编号从 0-15
* 每个数据库之间的数据互相独立

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-command/redis-batabase.png)

## db 基本操作

* 切换数据库

  ```bash
  select index
  ```
* 其他操作

  ```bash
  quit
  ping
  echo message
  ```
* 数据移动

  ```bash
  move key db
  ```
* 数据清除

  ```bash
  dbsize
  flushdb
  flushall
  ```

```bash
127.0.0.1:6379> select 1
OK
127.0.0.1:6379[1]> select 15
OK
127.0.0.1:6379[15]> select 0
OK
127.0.0.1:6379> echo abcdefg
"abcdefg"
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> ping abc
"abc"
127.0.0.1:6379> quit

127.0.0.1:6379> set name itheima
OK
127.0.0.1:6379> select 1
OK
127.0.0.1:6379[1]> get name
(nil)
127.0.0.1:6379[1]> select 0
127.0.0.1:6379> move name 1
(integer) 1
127.0.0.1:6379> get name
(nil)
127.0.0.1:6379> select 1
127.0.0.1:6379[1]> get name
"itheima"
127.0.0.1:6379[1]> select 1
127.0.0.1:6379[1]> select 0
127.0.0.1:6379> move name 2
(integer) 0
127.0.0.1:6379> set name itcast
OK
127.0.0.1:6379> move name 1
(integer) 0
127.0.0.1:6379> get name
"itcast"
127.0.0.1:6379> select 1
OK
127.0.0.1:6379> get name
"itheima"  
127.0.0.1:6379> select 2
127.0.0.1:6379[2]> set name heihei
127.0.0.1:6379[2]> select 0
127.0.0.1:6379> set name itheima
127.0.0.1:6379> key *
1) "name"
127.0.0.1:6379> flushdb
OK
127.0.0.1:6379> keys *
(empty list or set)
127.0.0.1:6379> select 2
127.0.0.1:6379[2]> keys *
1) "name"
2) "names"
127.0.0.1:6379[2]> select 1
127.0.0.1:6379[1]> set name itcast
127.0.0.1:6379[1]> hlushall
OK
127.0.0.1:6379[1]> select 2
127.0.0.1:6379[2]> keys *
(empyt list or set)
127.0.0.1:6379[2]> dbsize
(integer) 0
127.0.0.1:6379[2]> set name 123
127.0.0.1:6379[2]> dbsize
(integer) 1
127.0.0.1:6379[2]> set names 321
127.0.0.1:6379[2]> dbsize
(integer) 2
```

# 服务器基础配置

## 服务器端设定

* 设置服务器以守护进程的方式运行

  ```bash
  daemonize yes|no
  ```
* 绑定主机地址

  ```bash
  bind 127.0.0.1
  ```
* 设置服务器端口号

  ```bash
  port 6379
  ```
* 设置数据库数量

  ```bash
  databases 16
  ```

## 日志配置

* 设置服务器以指定日志记录级别

  ```bash
  loglevel debug|verbose|notice|warning
  ```
* 日志记录文件名

  ```bash
  logfile 端口号.log
  ```

　　注意：日志级别开发期设置为`verbose`即可，生产环境中配置为`notice`，简化日志输出量，降低写日志`IO`的频度

## 客户端配置

* 设置同一时间最大客户端连接数，默认无限制。当客户端连接到达上限，`Redis`会关闭新的连接

  ```bash
  maxclients 0
  ```
* 客户端闲置等待最大时长，达到最大值后关闭连接。如需关闭该功能，设置为 $0$

  ```bash
  timeout 300
  ```

## 多服务器快捷配置

* 导入并加载指定配置文件信息，用于快速创建`redis`公共配置较多的`redis`实例配置文件，便于维护

  ```bash
  # 一般用相对路径
  include /path/server-端口号.conf
  ```

# Jedis

## 简介

* `Java`语言连接`Redis`服务

  * `Jedis`
  * `SpringData Redis`
  * `Lettuce`
* `C`、`C++`、`C#`、`Erlang`、`Lua`、`Objective-C`、`Perl`、`PHP`、`Python`、`Ruby`、`Scala`
* 可视化连接`Redis`客户端

  * `Redis Desktop Manager`
  * `Redis Client`
  * `Redis Studio`

## 准备工作

* `jar`包导入

  * [下载地址](https://mvnrepository.com/artifact/redis.clients/jedis)
* 基于`maven`

  ```xml
  <dependency>
  	<groupId>redis.clients</groupId>
  	<artifactId>jedis</artifactId>
  	<version>2.9.0</version>
  </dependency>
  ```

## 客户端连接 Redis

* 连接`Redis`

  ```java
  Jedis jedis = new Jedis("localhost", 6379);
  ```
* 操作`Redis`

  ```java
  jedis.set("name", "itheima");
  jedis.get("name");
  ```
* 关闭`Redis`连接

  ```java
  jedis.close();
  ```
* [API文档](http://xetorthio.github.io/jedis/)

## 读写 Redis 数据

### 案例：服务调用次数控制

　　人工智能领域的语义识别与自动对话将是未来服务业机器人应答呼叫体系中的重要技术，百度自研用户评价语义识别服务，免费开放给企业试用，同时训练百度自己的模型。现对试用用户的使用行为进行限速，限制每个用户每分钟最多发起 10 次调用。

#### 案例要求

1. 设定`A`、`B`、`C`三个用户
2. `A`用户限制 10 次/分调用，`B`用户限制 30 次/分调用，`C`用户不限制

#### 需求分析

1. 设定一个服务方法，用于模拟实际业务调用的服务，内部采用打印模拟调用
2. 在业务调用前服务调用控制单元，内部使用`Redis`进行控制，参照之前的方案
3. 对调用超限使用异常进行控制，异常处理设定为打印提示信息
4. 主程序启动 3 个线程，分别表示 3 种不同用户的调用

#### 实现步骤

1. 设定业务方法

    ```java
    void business(String id,long num){

    	System.out.println("用户"+id+"发起业务调用，当前第"+num+"次");
    }
    ```
2. 设定多线类，模拟用户调用

    ```java
    public void run(){

    	while(true){

    		jd.service(id);
    		//模拟调用间隔，设定为1.x秒
    		try{
    			Random r = new Random();
    			Thread.sleep(1000+ r.nextInt(200));
    		}catch (InterruptedException e){
    			e.printStackTrace();;
    		}
    	}
    }
    ```
3. 设计`Redis`控制方案

    ```java
    void service(String id){

    	Jedis jedis = new Jedis("localhost", 6379);
    	String value = jedis.get("compid:" + id);
    	//判定是否具有调用计数控制，利用异常进行控制处理
     	if(value == null) {
     		//没有控制，创建控制计数器
     		jedis.setex("compid:" + id, 20, ""+(Long.MAX_VALUE-10));
     	}else{
     		//有控制，自增，并调用业务
    		try{
     			Long val = jedis.incr("compid:"+id);
     			business(id,10+val-Long.MAX_VALUE);
     		}catch (JedisDataException e){
     			//调用次数溢出，弹出提示
     			System.out.println("用户："+id+"使用次数已达到上限，请稍后再试，或升级VIP会员");
     			return;
     		}finally{
     			jedis.close();
     		}
     	}
    }
    ```
4. 设计启动主程序

    ```java
    public static void main(String[] args) {

    	MyThread t1 = new MyThread("初级用户");
    	t1.start();
    }
    ```

　　后续 1：对业务控制方案进行改造，设定不同用户等级的判定

　　后续 2：将不同用户等级对应的信息、限制次数等设定到`Redis`中，使用`hash`保存

## 简易工具类开发

### 基于连接池获取

　　`JedisPool`：`Jedis`提供的连接池技术。

* `poolConfig`：连接池配置对象
* `host`：`redis`服务地址
* `port`：`redis`服务端口号

```java
public JedisPool(GenericObjectPoolConfig poolConfig, String host, int port) {

	this(poolConfig, host, port, 2000, (String)null, 0, (String)null);
}
```

### 封装连接参数

　　`jedis.properties`。

```properties
jedis.host=localhost
jedis.port=6379
jedis.maxTotal=30
jedis.maxIdle=10
```

### 加载配置信息

　　静态代码块初始化资源。

```java
static{
	//读取配置文件 获得参数值
	ResourceBundle rb = ResourceBundle.getBundle("jedis");
	host = rb.getString("jedis.host");
	port = Integer.parseInt(rb.getString("jedis.port"));
	maxTotal = Integer.parseInt(rb.getString("jedis.maxTotal"));
	maxIdle = Integer.parseInt(rb.getString("jedis.maxIdle"));
	poolConfig = new JedisPoolConfig();
	poolConfig.setMaxTotal(maxTotal);
	poolConfig.setMaxIdle(maxIdle);
	jedisPool = new JedisPool(poolConfig,host,port);
}
```

### 获取连接

　　对外访问接口，提供`Jedis`连接对象，连接从连接池获取。

```java
public static Jedis getJedis(){

	Jedis jedis = jedisPool.getResource();
	return jedis;
}
```

# 可视化客户端

　　`Redis Desktop Manager`。

　　‍
