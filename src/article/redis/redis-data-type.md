---
date: 2023-09-15
article: true
timeline: true
index: true
title: Redis 数据类型
category: Redis
tag:
- Redis
---

# Redis 数据类型的形成

## 作为缓存使用

1. 原始业务功能设计

    * 秒杀
    * 618 活动
    * 双十一活动
    * 排队购票
2. 运营平台监控到的突发高频访问数据

    * 突发市政要闻，被强势关注围观
3. 高频、复杂的统计数据

    * 在线人数
    * 投票排行榜

## 附加功能

　　系统功能优化或升级

* 单服务器升级集群
* `Session`管理
* `Token`管理

# Redis 数据类型（5 种常用）

* `string --> String`
* `hash --> Hashmap`
* `list --> LinkList`
* `set --> HashSet`
* `sorted_set --> TreeSet`

# String

## 数据存储格式

* `Redis`自身是一个`Map`，其中所有的数据都是采用`key:value`的形式存储
* 数据类型指的是存储的数据的类型，也就是`value`部分的类型，`key`部分永远都是字符串

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/redis-storage1.png)

## `string`类型

* 存储的数据：单个数据，最简单的数据存储类型，也是最常用的数据存储类型
* 存储数据的格式：一个存储空间保存一个数据
* 存储内容：通常使用字符串，如果字符串以整数的形式展示，可以作为数字操作使用

  ![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/redis-storage2.png)

## 基本操作

* 添加/修改数据

  ```bash
  set key value
  ```
* 获取数据

  ```bash
  get key
  ```
* 删除数据

  ```bash
  del key
  ```
* 添加/修改多个数据

  ```bash
  mset key1 value1 key2 value2 …
  ```
* 获取多个数据

  ```bash
  mget key1 key2 …
  ```
* 获取数据字符个数（字符串长度）

  ```bash
  strlen key
  ```
* 追加信息到原始信息后部（如果原始信息存在就追加，否则新建）

  ```bash
  append key value
  ```

```bash
127.0.0.1:6379> set name itheima
OK
127.0.0.1:6379> get name
"itheima"
127.0.0.1:6379> set age 100
OK
127.0.0.1:6379> get age
"100"
127.0.0.1:6379> del age
(integer) 1
127.0.0.1:6379> get age
(nil)
127.0.0.1:6379> del age
(integer) 0
127.0.0.1:6379> mset a 1 b 2 c 3
OK
127.0.0.1:6379> get a
"1"
127.0.0.1:6379> get b
"2"
127.0.0.1:6379> get c
"3"
127.0.0.1:6379> mget a b c
1) "1"
2) "2"
3) "3"
127.0.0.1:6379> mset d 5 b 6
OK
127.0.0.1:6379> get b
"6"
127.0.0.1:6379> mget a b c
1) "1"
2) "6"
3) "3"
127.0.0.1:6379> mget a w c
1) "1"
2) (nil)
3) "3"
127.0.0.1:6379> set age 2000
OK
127.0.0.1:6379> strlen age
(integer) 4
strlen name
(integer) 7
127.0.0.1:6379> get name
"itheima"
127.0.0.1:6379> append age 200
(integer) 7
127.0.0.1:6379> get age
"2000200"
127.0.0.1:6379> append nm 300
(integer) 3
127.0.0.1:6379> get mn
"300"
127.0.0.1:6379> 
```

### 单数据操作与多数据操作的选择

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/string-set-mset.png)

## 扩展操作

### 数据表主键不重复

#### 业务场景

　　大型企业级应用中，分表操作是基本操作，使用多张表存储同类型数据，但是对应的主键`id`必须保证统一性，不能重复；`Oracle`数据库具有`sequence`设定，可以解决该问题，但是`MySql`数据库并不具有类似的机制，那么如何解决？

#### 解决方案

* 设置数值数据增加指定范围的值

  ```bash
  incr key
  incrby key increment
  incrbyfloat key increment
  ```
* 设置数值数据减少指定范围的值

  ```bash
  decr key
  decrby key increment
  ```

> 注：`increment`可正可负

```bash
127.0.0.1:6379> set num 1
OK
127.0.0.1:6379> incr num
(integer) 2
127.0.0.1:6379> get num
"2"
127.0.0.1:6379> incr num
(integer) 3
127.0.0.1:6379> get num
"3"
127.0.0.1:6379> decr num
(integer) 2
127.0.0.1:6379> get num
"2"
127.0.0.1:6379> incrby num 10
(integer) 12
127.0.0.1:6379> get num
"12"
127.0.0.1:6379> incrbyfloat num 1.5
"13.5"
127.0.0.1:6379> 
```

#### `string`作为数值操作

* `string`在`Redis`内部存储默认就是一个字符串，当遇到增减类操作`incr`、`decr`时会转成数值型进行计算
* `Redis`所有的操作都是原子性的，采用单线程处理所有业务，命令是一个一个执行的，因此无需考虑并发带来的数据影响。

　　注意：**按数值进行操作的数据，如果原始数据不能转成数值，或超过了****`Redis`****数值上线范围，将会报错；**`Java`中`long`型数据最大值，`Long.MAX_VALUE=9223372036854775807`。

#### Tips 1

* `Redis`用于控制数据库表主键`id`，为数据库表主键提供生成策略，保障数据库表的主键唯一性
* 此方案适用于所有数据库，且支持数据库

### 数据时效性设置

#### 业务场景

　　场景一：“最强女生”，启动海选投票，只能通过微信投票，每个微信号每4个小时只能投 1 票。

　　场景二：电商商家开启热门商品推荐，热门商品不能一直处于热门期，每种商品热门期维持 3 天，3 天后自动取消热门

　　场景三：新闻网站会出现热点新闻，热点新闻最大的特征是对时效性，如何自动控制热点新闻的时效性

#### 解决方案

* 设置数据具有指定的声明周期

  ```bash
  setex key seconds value
  psetex key milliseconds value

  setex key seconds value
  set key value
  上述操作会覆盖value值并洗掉设置的seconds
  ```

```bash
127.0.0.1:6379> setex tel 10 1
OK
127.0.0.1:6379> get tel
"1"
127.0.0.1:6379> get tel
"1"
127.0.0.1:6379> get tel
(nil)
127.0.0.1:6379> setex tel 10 1
OK
127.0.0.1:6379> set tel 2
OK
127.0.0.1:6379> 
127.0.0.1:6379> get tel
"2"
127.0.0.1:6379> 
```

#### Tips 2

　　`Redis`控制数据的生命周期，通过数据是否失效控制业务行为，适用于所有具有时效性限定控制的操作。

## 注意事项

* 数据操作不成功的反馈与数据正常操作之间的差异

  1. 表示运行结果是否成功

      * `(integer)0–>false` 失败
      * `(integer)1–>true` 成功
  2. 表示运行结果值

      * `(integer)3–>3` 3 个
      * `(integer)1–>1` 1 个
* 数据未获取到

  * `(nil)`等同于`null`
* 数据最大存储量

  * 512 MB
* 数值计算最大范围（`Java`中的`long`的最大值）

  * 92233720368547758

## 应用场景

### 微博主页显示粉丝数与微博数量

#### 业务场景

　　主页高频访问信息显示控制，例如新浪微博大V主页显示粉丝数与微博数量。

#### 解决方案

* 在`Redis`中为大 V 用户设定用户信息，以用户主键和属性值作为`key`，后台设定定时刷新策略即可

  * `[user]:[id]:3506728370:fans → 12210947`
  * `user:id:3506728370:blogs → 6164`
  * `user:id:3506728370:focuss → 83`
* 在`Redis`中以`json`格式存储大V用户信息，定时刷新（也可以使用`hash`类型）

  * `user:id:3506728370 → {"id":3506728370,"name":"春晚","fans":12210862,"blogs":6164, "focus":83}`

　　注：第二种方案中的数据不好修改

```bash
127.0.0.1:6379> set user:id:00789:fans 123456789
Ok
127.0.0.1:6379> set user:id:0789:blogs 789
OK
127.0.0.1:6379> set user:id:00789 {id:00789,blogs:789,fans:123456789}
OK
127.0.0.1:6379> incr user:id:00789:fans
(integer) 123456790
127.0.0.1:6379> 
```

#### Tips 3

　　`Rredis`应用于各种结构型和非结构型高热度数据访问。

#### `key`的设置约定

　　数据库中的热点数据`key`命名惯例：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/hot-key-names.png)

# Hash

## 存储的困惑

　　对象类数据的存储如果具有较为频繁的更新需求操作会显得笨重：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/object-awalys-update.png)

## `hash`类型

* 新的存储需求：对一系列存储的数据进行编组，方便管理，典型应用---存储对象信息
* 需要的内存结构：一个存储空间保存多少个键值对数据
* `hash`类型：底层使用哈希表结构实现数据存储

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/redis-hash.png)

## 基本操作

* 添加/修改数据

  ```bash
  hset key field value
  ```
* 获取数据

  ```bash
  hget key field
  hgetall key
  ```
* 删除数据

  ```bash
  hdel key field1 [field2]
  ```
* 添加/修改多个数据

  ```bash
  hmset key field1 value1 field2 value2
  ```
* 获取多个数据

  ```bash
  hmget key field1 field2 …
  ```
* 获取哈希表中字段的数量

  ```bash
  hlen key
  ```
* 获取哈希表中是否存在指定的字段

  ```bash
  hexists key field
  ```

```bash
127.0.0.1:6379> hset user name zhangsan
(integer) 1
127.0.0.1:6379> hset user age 38
(integer) 1
127.0.0.1:6379> hset user weight 80
(integer) 1
127.0.0.1:6379> hgetall user
1) "name"
2) "zhangsan"
3) "age"
4) "38"
5) "weight"
6) "80"
127.0.0.1:6379> hget user name
"zhangsan"
127.0.0.1:6379> hdel user weight
(integer) 1
127.0.0.1:6379> hgetall user
1) "name"
2) "zhangsan"
3) "age"
4) "38"
127.0.0.1:6379> hmget user name age
1) "zhangsan"
2) "38"
127.0.0.1:6379> hmset user name zhangsanfeng weight 68
OK
127.0.0.1:6379> hgetall user
1) "name"
2) "zhangsanfeng"
3) "age"
4) "38"
5) "weight"
6) "68"
127.0.0.1:6379> hlen user
(integer) 3
127.0.0.1:6379> hexists user age
(integer) 1
127.0.0.1:6379> hexists user heght
(integer) 0
127.0.0.1:6379> 
```

## 扩展操作

* 获取哈希表中所有的字段名和字段值

  ```bash
  hkeys key
  hvals key
  ```
* 设置指定字段的数值数据增加指定范围的值

  ```bash
  hincrby key field increment
  hincrbyfloat key field increment
  ```

```bash
127.0.0.1:6379> hgetall user
1) "name"
2) "zhangsanfeng"
3) "age"
4) "38"
5) "weight"
6) "68"
127.0.0.1:6379> hkeys user
1) "name"
2) "age"
3) "weight"
127.0.0.1:6379> hvals user
1) "zhangsanfeng"
2) "38"
3) "68"
127.0.0.1:6379> hset user weight 38
(integer) 0
127.0.0.1:6379> hvals user
1) "zhangsanfeng"
2) "38"
3) "38"
127.0.0.1:6379> hset user2 name zs
(integer) 1
127.0.0.1:6379> hkeys user2
1) "name"
127.0.0.1:6379> hincrby user age 1
(integer) 39
127.0.0.1:6379> 
```

## 注意事项

* `hash`类型下的`value`只能存储字符串，不允许存储其他类型数据，不存在嵌套现象；如果数据未获取到，对应的值为（`nil`）
* 每个`hash`可以存储 $2^{32}-1$ 个键值对
* `hash`类型十分贴近对象的数据存储形式，并且可以灵活添加删除对象属性；但`hash`设计初中不是为了存储大量对象而设计的，切记不可滥用，更不可以将`hash`作为对象列表使用
* `hgetall`操作可以获取全部属性，如果内部`fiekd`过多，遍历整体数据效率就会很低，有可能成为数据访问瓶颈，用那个拿那个

## 应用场景

### 购物车

#### 业务场景

　　电商网站购物车设计与实现。

#### 业务分析

* 仅分析购物车的`redis`存储模型  
  添加、浏览、更改数量、删除、清空
* 购物车于数据库间持久化同步（不讨论）
* 购物车于订单间关系（不讨论）

  * 提交购物车：读取数据生成订单
  * 商家临时价格调整：隶属于订单级别
* 未登录用户购物车信息存储（不讨论）

  * `cookie`存储

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/shopping-cart-data-structure.png)

#### 解决方案

* 以客户`id`作为`key`，每位客户创建一个`hash`存储结构存储对应的购物车信息
* 将商品编号作为`field`，购买数量作为`value`进行存储
* 添加商品：追加全新的`field`与`value`
* 浏览：遍历`hash`
* 更改数量：自增/自减，设置`value`值
* 删除商品：删除`field`
* 清空：删除`key`
* 此处仅讨论购物车中的模型设计
* 购物车与数据库间持久化同步、购物车与订单间关系、未登录用户购物车信息存储不进行讨论

```bash
127.0.0.1:6379> hmset 001 g01 100 g02 200
OK
127.0.0.1:6379> hmset 002 g02 1 g04 7 g05 100
OK
127.0.0.1:6379> hset 001 g03 5
(integer) 1
127.0.0.1:6379> hgetall 001
1) "g01"
2) "100"
3) "g02"
4) "200"
5) "g03"
6) "5"
127.0.0.1:6379> hdel 001 g01
(integer) 1
127.0.0.1:6379> hgetall 001
1) "g02"
2) "200"
3) "g03"
4) "5"
127.0.0.1:6379> hincrby 001 g03 1
(integer) 6
127.0.0.1:6379> hgetall 001
1) "g02"
2) "200"
3) "g03"
4) "6"
127.0.0.1:6379> 
```

#### 当前设计是否加速了购物车的呈现

　　当前仅仅是将数据存储到`redis`中，并没有起到加速的所用，因为商品信息还需要二次查询数据库。

* 每条购物车中的商品记录保存成两条`field`
* `field1`专用于保存购买数量

  1. 命名格式：`商品id:nums`
  2. 保存数据：数值
* `field2`专用于保存购物车中显示的信息，包含文字描述，图片地址，所属商家信息等

  1. 命名格式：`商品id:info`
  2. 保存数据：`json`

```bash
127.0.0.1:6379> hmset 003 g01:name 100 g01:info {...}
OK
127.0.0.1:6379> hgetall 003
1) "g01:name"
2) "100"
3) "g01:info" 
4) "{...]"
127.0.0.1:6379> hmset 004 g01:num 5 g01:info {...}
OK
127.0.0.1:6379> hgetall 004
1) "g01:num"
2) "5"
3) "g01:info" 
4) "{...]"
127.0.0.1:6379> 
```

　　可以看出来又具有了大量的信息重复，所以我们可以把`field2`的内容变成一个固定的`hash`，但是所有的商品信息都放在一个`hash`也很麻烦，可以用类别再做小的区分，让它们分散到不同的`hash`里。

* 修改数据，如果`fileld`有值就什么都不做，如果没有就加进去

  ```bash
  hsetnx key field value
  ```

```bash
127.0.0.1:6379> hset 003 g01:name 200
(integer) 1
127.0.0.1:6379> hgetall 003
1) "g01:name"
2) "100"
3) "g01:info" 
4) "{...]"
5) "g01:nums"
6) "200"
127.0.0.1:6379> hsetnx 003 g01:name 400
(integer) 0
127.0.0.1:6379> hsetnx 003 g05:nums 1
(integer) 1
127.0.0.1:6379> hgetall 03
1) "g01:name"
2) "100"
3) "g01:info" 
4) "{...]"
5) "g01:nums"
6) "1"
127.0.0.1:6379> 
```

#### Tips 4

　　`Redis`应用于购物车数据存储。

### 抢购

### 业务场景

　　双十一活动日，销售手机充值卡的商家对移动、联通、电信的 30 元、50 元、100 元商品推出抢购活动，每种商品抢购上限 100。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/rush-to-purchase.png)

#### 解决方案

* 以商家`id`作为`key`
* 将参与抢购的商品`id`作为`field`
* 将参与抢购的商品数量作为对应的`value`
* 抢购时使用降至的方式控制产品数量
* 实际业务中还有超卖等实际问题，这里不做

```bash
127.0.0.1:6379> hmset p01 c30 1000 c50 1000 c100 1000
OK
127.0.0.1:6379> hincrby p01 c50 -1
(integer) 999
127.0.0.1:6379> hincrby p01 c100 -20
(integer) 980
127.0.0.1:6379> hgetall p01
1) "c30"
2) "1000"
3) "c50"
4) "999"
5) "c100"
6) "980"
127.0.0.1:6379> 
```

#### Tips 5

　　`Redis`应用于抢购，限购类、限量发放优惠卷、激活码等业务的数据存储

### `string`与`hash`

#### 业务场景

　　`string`存储对象（`json`）与`hash`存储。

#### 解决方案

* `string`（`json`）讲究整体性，数据以整体操作，要么一次性更新，要么一次性获取，以读为主
* `hash`以`filed`将属性隔离，以更新为主
* 更新操作多用`hash`，把数据对外包装出去用`string`

# List 类型

* 数据存储需求：存储多个数据，并对数据进入存储空间的顺序进行区分
* 需要的存储数据：一个存储空间保存多个数据，且通过数据可以体现进入顺序
* `list`类型：保存多个数据，底层使用双向链表存储结构实现

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/list.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/redis-list.png)

## 基本操作

* 添加/修改数据

  ```bash
  lpush key value1 [value2] …
  rpush key value1 [value2] …
  ```
* 获取数据

  ```bash
  lrange key start stop
  lindex key index
  llen key

  当不知道有多少个数据是时，可以使用
  lrange list1 0 -1
  0代表首个，-1表示倒数第一个
  ```
* 删除并移除数据

  ```bash
  lpop key
  rpop key
  ```

```bash
(integer) 1
127.0.0.1:6379> lpush list1 apple
(integer) 2
127.0.0.1:6379> lpush list1 microsoft
(integer) 3
127.0.0.1:6379> lrange ;ist1 0 2
1) "microsoft"
2) "apple"
3) "huawei"
127.0.0.1:6379> rpush list2 a b c
(integer) 3
127.0.0.1:6379> lrange list2 0 2
1) "a"
2) "b"
3) "c"
127.0.0.1:6379> lrange list1 0 -1
1) "microsoft"
2) "apple"
3) "huawei"
127.0.0.1:6379> lrange list1 0 -2
1) "microsoft"
2) "apple"
127.0.0.1:6379> lindex list 0
"microsoft"
127.0.0.1:6379> lindex list1 2
"huawei"
127.0.0.1:6379> llen list1
(integer) 3
127.0.0.1:6379> 
127.0.0.1:6379> lpush list3 a b c
(integer) 3
127.0.0.1:6379> lpop list3
"c"
127.0.0.1:6379> llen list3
(integer) 2
127.0.0.1:6379> lpop list3
"b"
127.0.0.1:6379> lpop list3
"a"
127.0.0.1:6379> lpop list3
(nil)
127.0.0.1:6379> 
```

## 扩展操作

* 规定时间内获取并移除数据

  ```bash
  blpop key1 [key2] timeout
  brpop key1 [key2] timeout
  ```

　　阻塞式获取，获取值如果还没有的时候可以等，如果有值就可以获取到。

* 移除指定数据

  ```bash
  lrem key count value
  ```

### 业务场景

　　微信朋友圈点赞，要求按照点赞顺序显示点赞好友信息，如果取消点赞，移除对应好友信息。

```bash
127.0.0.1:6379> rpush dq a b c d e
(integer) 5
127.0.0.1:6379> lrange dq 0 -1
1) "a"
2) "b"
3) "c"
4) "d"
5) "e"
127.0.0.1:6379> lrem dq 1 d
(integer) 1
127.0.0.1:6379> lrange dq 0 -1
1) "a"
2) "b"
3) "c"
4) "e"
127.0.0.1:6379> rpush dq a b a b c d a c e
(integer) 13
127.0.0.1:6379> ;rem dq 3 a
(integer) 3
127.0.0.1:6379> lrange dq 0 -1
1) "b"
2) "c"
3) "e"
4) "b"
5) "b"
6) "c"
7) "d"
8) "a"
9) "c"
10) "e"
127.0.0.1:6379> 
```

### Tips 6

* `redis`应用于具有操作线后顺序的数据控制

## 注意事项

* `list`中保存的数据都是`string`类型的，数据总容量式有限的，最多 $2^{32}-1$ 个元素（4294967295）
* `list`具有索引的概念，但是操作数据时候通常以队列的形式进行入队出队操作，或以栈的形式进入栈出栈的操作
* 获取全部数据操作结束索引设置为 -1
* `list`可以对数据进行分页操作，通过第一页的信息来自`list`，第 2 页及更多的信息通过数据库的形式加载

## 应用场景

### 业务场景

　　`twitter`、新浪微博、腾讯微博中个人用于的关注列表需要按照用户的关注顺序进行展示，粉丝列表需要将最近关注的粉丝列在前面，新闻、资讯类网站如何将最新的新闻或资讯按照发生的事件顺序展示，企业运营过程中，系统将产生出大量的运营数据，如何保障堕胎服务器操作日志的统一顺序输出？

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/redis-list-sort.png)

### 解决方案

* 依赖`list`的数据具有顺序的特征对信息进行管理
* 使用队列模型解决多路信息汇总合并的问题
* 使用栈模型解决最新消息的问题

### Tips 7

　　`Redis`应用于最新消息。

# Set 类型

* 新的存储需求：存储大量的数据，在查询方面提供更高的效率
* 需要的存储结构：能够保存大量的数据，高效的内部存储机制，便于查询
* `set`类型：与`hash`存储结构完全相同，仅存储键，不存储值（`nil`），并且值式不允许重复的

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/redis-set.png)

## 基本操作

* 添加数据

  ```bash
  sadd key menber1 [member2]
  ```
* 获取全部数据

  ```bash
  smembers key
  ```
* 删除数据

  ```bash
  srem key member1 [member2]
  ```
* 获取集合数据总量

  ```bash
  scard key
  ```
* 判断集合中是否包含指定数据

  ```bash
  sismember key member
  ```

```bash
127.0.0.1:6379> sadd users zs
(integer) 1
127.0.0.1:6379> sadd users ls
(integer) 1
127.0.0.1:6379> sadd users ww
(integer) 1
127.0.0.1:6379> smembers users
1) "ww"
2) "ls"
3) "zs"
127.0.0.1:6379> srem users ww
(integer) 1
127.0.0.1:6379> smembers users
1) "ls"
2) "zs"
127.0.0.1:6379> scard users
(integer) 2
127.0.0.1:6379> sismember users zs
(integer) 1
127.0.0.1:6379> simember users menber
(integer) 0
127.0.0.1:6379> 
```

## 扩展操作

### 业务场景

　　每位用户首次使用进入头条时候会设置 $3$ 项爱好的内容，但是后期为了增加用户的活跃度，兴趣点，必须让用户对其他信息类别逐渐产生兴趣，增加客户留存度，如何实现？

### 业务分析

* 系统分析出各个分类的最新或最热点信息条目并组织成`set`集合
* 随机挑选其中部分信息
* 配合用户关注信息分类中的热点信息组织展示的全信息集合

### 解决方案

* 随机获取集合中指定数量的数据

  ```bash
  srandmember key [count]
  ```
* 随机获取集合中的某个数据并将该数据移出集合

  ```bash
  spop key
  ```

```bash
127.0.0.1:6379> sadd news n1
(integer) 1
127.0.0.1:6379> sadd news n2
(integer) 1
127.0.0.1:6379> sadd news n3
(integer) 1
127.0.0.1:6379> sadd news n4
(integer) 1
127.0.0.1:6379> srandmember news 1
1) "n4"
127.0.0.1:6379> srandmember news 1
1) "n3"
127.0.0.1:6379> scard news
(integer) 4
127.0.0.1:6379> srandmember news 3
1) "n1"
2) "n3"
3) "n2"
127.0.0.1:6379> spop news 
"n2"
127.0.0.1:6379> smembers news
1) "n3"
2) "n1"
3) "n4"
127.0.0.1:6379> spop news 2
1) "n4"
2) "n1"
127.0.0.1:6379> smembers news
1) "n3"
127.0.0.1:6379> 
```

### Tips 8

　　`Redis`应用于随机推荐类信息检索，例如热点歌单推荐，热点新闻推荐，热点旅游线路，应用`APP`推荐，大 V 推荐等。

## 扩展操作

### 业务场景

　　脉脉为了促进用户间的交流，保障业务成单率的提升，需要让每位用户拥有大量的好友，事实上职场新人不具有更多的职场好友，如何快速为用户积累更多的好友？

　　新浪微博为了增加用户热度，提高用户留存性，需要微博用户在关注更多的人，以此获得更多的信息或热门话题，如何提高用户关注他人的总量？

　　`QQ`新用户入网年龄越来越低，这些用户的朋友圈交际圈非常小，往往集中在一所学校甚至一个班级中，如何帮助用户快速积累好友用户带来更多的活跃度？

　　微信公众号是微信信息流通的渠道之一，增加用户关注的公众号成为提高用户活跃度的一种方式，如何帮助用户积累更多关注的公众号？

　　美团外卖为了提升成单量，必须帮助用户挖掘美食需求，如何推荐给用户最适合自己的美

### 解决方案

* 求两个集合的交、并、差集

  ```bash
  sinter key1 [key2]
  sunion key1 [key2]
  sdiff key1 [key2]
  ```
* 求两个集合的交、并、差集并存储到指定集合中

  ```bash
  sinterstore destination key1 [key2]
  sunionstore destination key1 [key2]
  sdiffstore destination key1 [key2]
  ```
* 将指定数据从原始集合移动到目标集合中

  ```bash
  smove source destination member
  ```

```bash
127.0.0.1:6379> sadd u1 a1
(integer) 1
127.0.0.1:6379> sadd u1 s1
(integer) 1
127.0.0.1:6379> sadd u1 b1
(integer) 1
127.0.0.1:6379> sadd u2 s1
(integer) 1
127.0.0.1:6379> sadd u2 w1
(integer) 1
127.0.0.1:6379> sinter u1 u2
1) "s1"
127.0.0.1:6379> sunion u1 u2
1) "a1"
2) "b1"
3) "w1"
4) "s1"
127.0.0.1:6379> sdiff u1 u2
1) "a1"
2) "b1"
127.0.0.1:6379> sdiff u2 u1
1) "w1"
127.0.0.1:6379> sinterstore u3 u1 u2
(integer) 1
127.0.0.1:6379> smembers u3
1) "s1"
127.0.0.1:6379> smove u2 u1 w1
(integer) 1
127.0.0.1:6379> smembers u1
1) "b1"
2) "a1"
3) "w1"
4) "s1"
127.0.0.1:6379> 
```

### Tips 9

* `Redis`应用于同类信息的关联搜索，二度关联搜索，深度关联搜索
* 显示共同关注（一度）
* 显示共同好友（一度）
* 由用户`A`出发，获取到好友用户`B`的好友信息列表（一度）
* 由用户`A`出发，获取到好友用户`B`的购物清单列表（二度）
* 由用户`A`出发，获取到好友用户`B`的游戏充值列表（二度）

## 注意事项

* `set`类型不允许数据重复，如果添加的数据在`set`中已经存在，将只保留一份
* `set`虽然与`hash`的存储结构相同，但是无法启用`hash`中存储值的空间

## 应用场景

### 权限校验

#### 业务场景

　　集团公司共具有 12000 名员工，内部`OA`系统中具有 700 多个角色，3000 多个业务操作，23000 多种数据，每位员工具有一个或多个角色，如何快速进行业务操作的权限校验？

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/oa-authentication.png)

#### 解决方案

* 依赖`set`集合数据不重复的特征，依赖`set`集合`hash`存储结构特征完成数据过滤与快速查询
* 根据用户`id`获取用户所有角色
* 根据用户所有角色获取用户所有操作权限放入`set`集合
* 根据用户所有觉得获取用户所有数据全选放入`set`集合

```bash
127.0.0.1:6379> asdd rid:001 getall
(integer) 1
127.0.0.1:6379> sadd rid:001 getById
(integer) 1
127.0.0.1:6379> sadd rid:002 getCount
(integer) 1
127.0.0.1:6379> sadd rid:002 getall
(integer) 1
127.0.0.1:6379> sadd rid:002 insert
(integer) 1
127.0.0.1:6379> sunionstore uid:007 rid:001 rid:002
(integer) 4
127.0.0.1:6379> smembers uid:007
1) "getCount"
2) "getById"
3) "insert"
4) "getall"
127.0.0.1:6379> sismember uid:007 insert
(integer) 1
127.0.0.1:6379> 
```

#### 校验工作

　　`Redis`提供基础数据还是提供校验结果？

　　一般只让`Redis`提供基础数据，将业务逻辑放在程序中

#### Tips 10

　　`Redis`应用于同类型不重复数据的合并操作

### 网站访问量统计

#### 业务场景

　　公司对旗下新的网站做推广，统计网站的`PV`（访问量），`UV`（独立访客），`IP`（独立`IP`）。

* `PV`：网站被访问次数，可通过刷新页面提高访问量
* `UV`：网站被不同用户访问的次数，可通过`cookie`统计访问量，相同用户切换`IP`地址，`UV`不变
* `IP`：网站被不同`IP`地址访问的总次数，可通过`IP`地址统计访问量，相同`IP`不同用户访问，`IP`不变

#### 解决方案

* 利用`set`集合的数据去重特征，记录各种访问数据
* 建立`string`类型数据，利用`incr`统计日访问量（`PV`)
* 建立`set`模型，记录不同`cookie`数量（`UV`)
* 建立`set`模型，记录不用`IP`数量（`IP`)

#### Tips 11

　　`Redis`应用于同类型数据的快速去重。

### 网站黑白名单

#### 业务场景

　　**黑名单**

　　资讯类信息类网站追求高访问量，但是由于其信息的价值，往往容易被不法分子利用，通过爬虫技术，快速获取信息，个别特种行业网站信息通过爬虫获取分析后，可以转换成商业机密进行出售；例如第三方火车票、机票、酒店刷票代购软件，电商刷评论、刷好评。

　　同时爬虫带来的伪流量也会给经营者带来错觉，产生错误的决策，有效避免网站被爬虫反复爬取成为每个网站都要考虑的基本问题。在基于技术层面区分出爬虫用户后，需要将此类用户进行有效的屏蔽，这就是**黑名单**的典型应用。

　　PS：不是说爬虫一定做摧毁性的工作，有些小型网站需要爬虫为其带来一些流量。

　　**白名单**

　　对于安全性更高的应用访问，仅仅靠黑名单是不能解决安全问题的，此时需要设定可访问的用户群体，依赖**白名单**做更为苛刻的访问验证。

#### 解决方案

* 基于经营战略设定问题用户发现、鉴别规则
* 周期性更行满足规则的用户黑名单，加入`set`集合
* 用户行为信息达到后与黑名单进行比比对，确认行为去向
* 黑名单过滤`IP`地址：应用于开放游客访问权限的信息源
* 黑名单过滤设备信息：应用于限定访问设备的信息源
* 黑名单过滤用户：应用于基于访问权限的信息源

#### Tips 12

　　`Redis`应用于基于黑名单与白名单设定的服务控制。

　　‍

# Sorted_set（Zset）

* 新的存储需求：根据排序有利于数据的有效显示，需要提供一种可以根据自身特征进行排序的方式
* 需要的存储结构：新的存储模型，可以保存可排序的数据
* `sorted_set`类型：在`set`的存储结构基础上添加可排序字段

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/edis-sorted-set.png)

## 基本操作

* 添加数据

  ```bash
  zadd key score1 member1 [score2 member2]
  ```
* 获取全部数据

  ```bash
  zrange key start stop [WITHSCORES]
  zrevrange key start stop [WITHSCORES]
  ```
* 删除数据

  ```bash
  zrem key member [member …]
  ```
* 按条件获取数据

  ```bash
  zrangebyscore key min max [WITHSCORES] [LIMIT]
  zrevrangebyscore key max min [WITHSCORES]
  ```
* 条件删除

  ```bash
  zremrangebyrank key start stop
  zremrangebyscore key min max
  ```

　　**注意**：

* `min`与`max`用于限定搜索查询的条件
* `start`与`stop`用于限定查询范围，作用于索引，表示开始和结束索引
* `offset`与`count`用于限定查询范围，作用于查询结果，表示开始位置和数据总量
* 获取集合数据总量

  ```bash
  zcard key
  zcount key min max
  ```
* 集合交、并操作

  ```bash
  zinterstore destination numkeys key [key …]
  zunionstore destination numkeys key [key …]
  ```

```bash
127.0.0.1:6379> zadd scores 100 ls
(integer) 1
127.0.0.1:6379> zadd scores 60 ww
(integer) 1
127.0.0.1:6379> zadd scores 47 zl
(integer) 1
127.0.0.1:6379> zrange scores 0 -1
1) "zl"
2) "ww"
3) "ls"
127.0.0.1:6379> zrange scores 0 -1 withscores
1) "zl"
2) "47"
3) "ww"
4) "60"
5) "ls"
6) "100"
127.0.0.1:6379> zrevrange scores 0 -1
1) "ls"
2) "ww"
3) "zl"
127.0.0.1:6379> zrem scores ww
(integer) 1
127.0.0.1:6379> zrevrange scores 0 -1 withscores
1) "ls"
2) "100"
3) "zl"
4) "47"
127.0.0.1:6379> zrange scores 0 -1 withscores
1) "wangwu"
2) "45"
3) "zhangsan"
4) "67"
5) "zhouqi"
6) "71"
7) "qiamba"
8) "92"
9) "lisi"
10) "99"
11) "zhaoliu"
12) "100"
127.0.0.1:6379> zrangebyscore scores 50 80 withscores
1) "zhangsan"
2) "67"
3) "zhouqi"
4) "71"
127.0.0.1:6379> zrangebyscore scores 50 99 withscores
1) "zhangsan"
2) "67"
3) "zhouqi"
4) "71"
5) "qiamba"
6) "92"
7) "lisi"
8) "99"
127.0.0.1:6379> zrangebyscore scores 50 90 limit 0 3 withscores
1) "zhangsan"
2) "67"
3) "zhouqi"
4) "71"
5) "qiamba"
6) "92"
127.0.0.1:6379> zremrangebyscore scores 50 70
(integer) 1
127.0.0.1:6379> zrange scores 0 -1 withscores
1) "wangwu"
2) "45"
3) "zhouqi"
4) "71"
5) "qiamba"
6) "92"
7) "lisi"
8) "99"
9) "zhaoliu"
10) "100"
127.0.0.1:6379> zremrangebyrank scores 0 1
(integer) 2
127.0.0.1:6379> zrange scores 0 -1 withscores
1) "qiamba"
2) "92"
3) "lisi"
4) "99"
5) "zhaoliu"
6) "100"
127.0.0.1:6379> zcard scores
(integer) 3
127.0.0.1:6379> zcount scores 99 200
(integer) 2
127.0.0.1:6379> zadd s1 50 aa 60 bb 70 cc
(integer) 3
127.0.0.1:6379> zadd s2 60 aa 40 bb 90 dd
(integer) 3
127.0.0.1:6379> zadd s3 70 aa 20 bb 100 dd
(integer) 3
127.0.0.1:6379> zinterstore ss 3 s1 s2 s3
(integer) 2
127.0.0.1:6379> zrange ss 0 -1 withscores
1) "bb"
2) "120"
3) "aa"
4) "180"
127.0.0.1:6379> zinterstore sss 3 s1 s2 s3 aggregate max
(integer) 2
127.0.0.1:6379> zrange sss 0 -1 withscores
1) "b"
2) "60"
3) "aa"
4) "70"
127.0.0.1:6379> 
```

## 扩展操作

### 排行榜

#### 业务场景

* 票选广东十大杰出青年
* 各类综艺选秀海选投票各类资源网站TOP10（电影，歌曲，文档，电商，游戏等）
* 聊天室活跃度
* 统计游戏好友亲密度

#### 业务分析

　　为所有参与排名的资源建立排序。

#### 解决方案

* 获取数据对应的索引（排名）

  ```bash
  zrank key member
  zrevrank key member
  ```
* `score`值获取与修改

  ```bash
  zscore key member
  zincrby key increment member
  ```

```bash
127.0.0.1:6379> zadd movies 143 aa 97 bb 201 cc
(integer) 3
127.0.0.1:6379> zrank movies bb
(integer) 0
127.0.0.1:6379> zrevrank movies bb
(integer) 2
127.0.0.1:6379> zscore movies aa
"143"
127.0.0.1:6379> zincrby movies 1 aa
"144"
127.0.0.1:6379> zscore movies aa
"144"
127.0.0.1:6379> 
```

#### Tips 13

　　`Redis`应用于计数器组合排序功能对应的排名。

## 注意事项

* `score`保存的数据存储空间是 64 位，如果是整数范围是 -9007199254740992~9007199254740992
* `score`保存的数据也可以是一个双精度的`double`值，基于双精度浮点数的特征，可能会丢失精度，使用时侯要慎重
* `sorted_set`底层存储还是基于`set`结构的，因此数据不能重复，如果重复添加相同的数据，`score`值将被反复覆盖，保留最后一次修改的结果

```bash
127.0.0.1:6379> zadd test1 ll aa
(integer) 1
127.0.0.1:6379> zrange test1 0 -1 withscores
1) "aa"
2) "ll"
127.0.0.1:6379> zadd test1 22 aa
(integer) 0
127.0.0.1:6379> zrange test1 0 -1 withscores
1) "aa"
2) "22"
127.0.0.1:6379> zadd test1 33 aa
(integer) 0
127.0.0.1:6379> zrange test1 0 -1 withscores
1) "aa"
2) "33"
127.0.0.1:6379> 
```

## 应用场景

### 时效性任务管理

#### 业务场景

　　基础服务+增值服务类网站会设定各位会员的试用，让用户充分体验会员优势。例如观影试用`VIP`、游戏`VIP`体验、云盘下载体验`VIP`、数据查看体验`VIP`。当`VIP`体验到期后，如果有效管理此类信息。即便对于正式`VIP`用户也存在对应的管理方式。

　　网站会定期开启投票、讨论，限时进行，逾期作废。如何有效管理此类过期信息。

#### 解决方案

* 对于基于时间线限定的任务处理，将处理时间记录位`score`值，利用排序功能区分处理的先后顺序
* 记录下一个要处理的事件，当到期后处理对应的任务，移除`redis`中的记录，并记录下一个要处理的时间
* 当新任务加入时，判定并更新当前下一个要处理的任务时间
* 为提升`sorted_set`的性能，通常将任务根据特征存储成若干个`sorted_set`，例如 1 小时内，1 天内，年度等，操作时逐渐提升，将即将操作的若干个任务纳入到 1 小时内处理队列中
* 获取当前系统时间

  ```bash
  time
  ```

```bash
127.0.0.1:6379> zadd tx 1509802345 uid:001
(integer) 1
127.0.0.1:6379> zadd tx 1509802390 uid:007
(integer) 1
127.0.0.1:6379> zadd tx 1510384284 uid:888
(integer) 1
127.0.0.1:6379> zrange tx 0 -1 withscores
1) "uid:001"
2) "1509802345"
3) "uid:007"
4) "1509802390"
5) "uid:888"
6) "1510384284"
127.0.0.1:6379> time
1) "1600740116"
2) "829561"
127.0.0.1:6379> time
1) "1600740121"
2) "110002"
127.0.0.1:6379> time
1) "1600740124"
2) "112972"
127.0.0.1:6379> 
```

#### Tips 14

　　`Redis`应用于定时任务执行顺序管理或任务过期管理。

### 带有权重的任务管理

#### 业务场景

　　任务/消息权重设定应用：当任务或者消息待处理，形成了任务队列或消息队列时，对于高优先级的任务要保障对其优先处理，如何实现任务权重管理。

#### 解决方案

* 对于带有权重的任务，优先处理权重高的任务，采用`score`记录权重即可  
  多条件任务权重设定：  
  如果权重条件过多时，需要对排序`score`值进行处理，保障`score`值能够兼容2条件或者多条件，例如外贸订单优先于国内订单，总裁订单优先于员工订单，经理订单优先于员工订单。
* 因`score`长度受限，需要对数据进行截断处理，尤其是时间设置为小时或分钟级即可（折算后）
* 先设定订单类别，后设定订单发起角色类别，整体`score`长度必须是统一的，不足位补 0，第一排序规则首位不得是 0

  * 例如外贸 101，国内 102，经理 004，员工 008
  * 员工下的外贸单`score`值为 101008（优先）
  * 经理下的国内单`score`值为 1020
* 对于带有权重的任务，优先处理权重高的任务，采用`score`记录权重即可

```bash
127.0.0.1:6379> zadd tasks 4 order:id:005
(integer) 1
127.0.0.1:6379> zadd tasks 1 order:id:425
(integer) 1
127.0.0.1:6379> zadd tasks 9 order:id:345
(integer) 1
127.0.0.1:6379> zrevrange tasks 0 -1 withscores
1) "order:id:345"
2) "9"
3) "order:id:005"
4) "4"
5) "order:id:425"
6) "1"
127.0.0.1:6379> zrevrange tasks 0 0
1) "order:id:345"
127.0.0.1:6379> zrem tasks order:id:345
(integer) 1
127.0.0.1:6379> zrevrange tasks 0 -1 withscores
1) "order:id:005"
2) "4"
3) "order:id:425"
4) "1"
127.0.0.1:6379> zadd tt 102004 order:id:1
(integer) 1
127.0.0.1:6379> zadd tt 101008 order:id:2
(integer) 1
127.0.0.1:6379> zrevrange tt 0 -1 withscores
1) "order:id:1"
2) "102004"
3) "order:id:2"
4) "101008"
127.0.0.1:6379> zrange tt 0 -1
1) "order:id:2"
2) "order:id:1"
127.0.0.1:6379> 
127.0.0.1:6379> zadd ts 14 order:id:3
(integer) 1
127.0.0.1:6379> zadd ts 1332 order:id:4
(integer) 1
127.0.0.1:6379> 
```

#### Tips 15

　　`Redis`应用于即时任务/消息队列执行管理。

# Redis 数据类型综合实践案例

## 计数器

### 业务场景

　　人工智能领域的语义识别与自动对话将是未来服务业机器人应答呼叫体系中的重要技术，百度自研用户评价语义识别服务，免费开放给企业试用，同时训练百度自己的模型。现对试用用户的使用行为进行限速，限制每个用户每分钟最多发起 10 次。

### 解决方案

* 设计计数器，记录调用次数，用于控制业务执行次数。以用户`id`作为`key`,使用此时作为`value`
* 在调用前获取次数，判断是否超过限定次数，不超过次数的情况下，每次调用计数 +1，业务调用失败，计数 -1
* 为了计数器设置生命周期为指定周期，例如 1 秒/分钟，自动清空周期内使用次数

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/counter1.png)

```bash
127.0.0.1:6379> get 415
(nil)
127.0.0.1:6379> setex 415 60 1
OK
127.0.0.1:6379> get 415
"1"
127.0.0.1:6379> incr 415
(integer) 2
127.0.0.1:6379> get 415
"2"
127.0.0.1:6379> incr 415
(integer) 3
127.0.0.1:6379> incrby 415 7
(integer) 10
127.0.0.1:6379> get 415
"10"
127.0.0.1:6379> get 415
"10"
127.0.0.1:6379> get 415
"10"
127.0.0.1:6379> get 415
(nil)
127.0.0.1:6379> 
```

### 解决方案改良

* 取消最大值的判定，利用`incr`操作超过最大值抛出异常的形式替代每次判断是否大于最大值
* 判断是否为`nil`，如果是，设置为`Max-次数`，如果不是，计数 $+1$，业务调用失败，计数 $-1$
* 遇到异常即 $+$ 操作超过上限，视为使用达到

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/counter2.png)

```bash
127.0.0.1:6379> get 415
(nil)
127.0.0.1:6379> setex 415 60 9223372036854775797
OK
127.0.0.1:6379> get 415
"9223372036854775797"
127.0.0.1:6379> incr 415
"9223372036854775798"
127.0.0.1:6379> get 415
"9223372036854775798"
127.0.0.1:6379> incr 415
"9223372036854775799"
127.0.0.1:6379> incr 415
"9223372036854775800"
127.0.0.1:6379> incr 415
"9223372036854775801"
127.0.0.1:6379> incr 415
"9223372036854775802"
127.0.0.1:6379> incr 415
"9223372036854775803"
127.0.0.1:6379> incr 415
"9223372036854775804"
127.0.0.1:6379> incr 415
(integer) 1
127.0.0.1:6379> 
```

### Tips 16

　　`Redis`应用于限时按次结算的服务控制。

## 微信会话

### 业务场景

　　使用微信的过程中，当微信接收消息后，会默认将最近接收的消息置顶，当多个好友及关注的订阅号同时发送消息时，该排序会不停的进行交替。同时还可以将重要的会话设置为置顶。一旦用户离线后，再次打开微信时，消息该按照什么样的顺序显示？

### 业务分析

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/session-top.png)

### 解决方案

* 依赖`list`的数据具有顺序的特征对消息进行管理，将`list`结构作为栈使用
* 对指定与普通会话分别创建独立的`list`分别管理
* 当某个`list`中接收到用户消息后，将消息发送方的`id`从`list`的一侧加入`list`（此处设定左侧）
* 多个相同`id`发出的消息反复入栈会出现问题，在入栈之前无论是否具有当前`id`对应得消息，先删除对应`id`
* 推送消息时先推送顶置会话`list`，再推送普通会话`list`，推送完成的`list`清除所有数据
* 消息的数量，也就是微信用户对话数量采用计数器的思想另行记录，伴随`list`操作同步更新

```bash
127.0.0.1:6379> lrem 100 1 200
(integer) 0
127.0.0.1:6379> lpush 100 200
(integer) 1
127.0.0.1:6379> lrem 100 1 300
(integer) 0
127.0.0.1:6379> lpush 100 300
(integer) 2
127.0.0.1:6379> lrem 100 1 400
(integer) 0
127.0.0.1:6379> lpush 100 400
(integer) 3
127.0.0.1:6379> lrem 100 1 200
(integer) 1
127.0.0.1:6379> lpush 100 200
(integer) 3
127.0.0.1:6379> lrem 100 1 300
(integer) 1
127.0.0.1:6379> lpush 100 300
(integer) 3
127.0.0.1:6379> lrange 100 0 -1
1) "300"
2) "200"
3) "400"
127.0.0.1:6379> 
```

# 解决方案列表

* `Tips 1`：`Redis`用于控制数据库表主键`id`，为数据库表主键提供生成策略，保障数据库表的主键唯一性
* `Tips 2`：`Redis`控制数据的生命周期，通过数据是否失效控制业务行为，适用于所有具有时效性限定控制的操作
* `Tips 3`：`Redis`应用于各种结构型和非结构型高热度数据访问加速
* `Tips 4`：`Redis`应用于购物车数据存储设计
* `Tips 5`：`Redis`应用于抢购，限购类、限量发放优惠卷、激活码等业务的数据存储设计
* `Tips 6`：`Redis`应用于具有操作先后顺序的数据控制
* `Tips 7`：`Redis`应用于最新消息展示
* `Tips 8`：`Redis`应用于随机推荐类信息检索，例如热点歌单推荐，热点新闻推荐，热卖旅游线路，应用`APP`推荐，大V推荐等
* `Tips 9`：`Redis`应用于同类信息的关联搜索，二度关联搜索，深度关联搜索
* `Tips 10`：`Redis`应用于同类型不重复数据的合并、取交集操作
* `Tips 11`：`Redis`应用于同类型数据的快速去重
* `Tips 12`：`Redis`应用于基于黑名单与白名单设定的服务控制
* `Tips 13`：`Redis`应用于计数器组合排序功能对应的排名
* `Tips 14`：`Redis`应用于定时任务执行顺序管理或任务过期管理
* `Tips 15`：`Redis`应用于及时任务/消息队列执行管理
* `Tips 16`：`Redis`应用于按次结算的服务控制
* `Tips 17`：`Redis`应用于基于时间顺序的数据操作，而不关注

# 高级数据类型

## Bitmaps

　　并不是一个全新的数据类型，而是`String`中二进制位的操作`API`。

### Bitmaps 类型的基础操作

* 获取指定`key`对应偏移量上的`bit`值

  ```bash
  getbit key offset
  ```
* 设置指定`key`对应偏移量上的`bit`值，`value`只能是 1 或 0  

  ```bash
  setbit key offset value
  ```

  ```bash
    127.0.0.1:6379> setbit bits 0 1
    (integer) 1
    127.0.0.1:6379> getbit bits 0
    (integer) 1
    127.0.0.1:6379> getbit bits 10
    (integer) 0
  ```

### Bitmaps 类型的扩展操作

#### 业务场景

　　电影网站：

* 统计每天某一部电影是否被点播
* 统计每天有多少部电影被点播
* 统计每周/月/年有多少部电影被点播
* 统计年度哪部电影没有被点播

#### 业务分析

* 统计每天某一部电影是否被点播：如果某部电影被观看，就将二进制位设为 1，保存的`key`为当天的日期
* 统计每天有多少部电影被点播：统计有多少个二进制位值为 1
* 统计每周/月/年有多少部电影被点播：将每天保存的数据进行或操作，然后统计有多少个二进制位值为 1
* 统计年度哪部电影没有被点播：将每天保存的数据进行或操作，然后统计有多少个二进制位值为 0

#### 扩展操作

* 对指定`key`按位进行交、并、非、异或操作，并将结果保存到`destKey`中

  ```bash
  bitop option destKey key1 [key2]...
  ```

  * `and`：交
  * `or`：并
  * `not`：非
  * `xor`：异或
* 统计指定`key`中 1 的数量

  ```bash
  bitcount key [start end]
  ```

  ```bash
    127.0.0.1:6379> setbit 20880808 0 1
    (integer) 0
    127.0.0.1:6379> setbit 20880808 4 1
    (integer) 0
    127.0.0.1:6379> setbit 20880808 8 1
    (integer) 0
    127.0.0.1:6379> setbit 20880809 0 1
    (integer) 0
    127.0.0.1:6379> setbit 20880809 5 1
    (integer) 0
    127.0.0.1:6379> setbit 20880809 8 1
    (integer) 0
    127.0.0.1:6379> bitcount 20880808
    (integer) 3
    127.0.0.1:6379> bitcount 20880809
    (integer) 3
    127.0.0.1:6379> setbit 20880808 0 1
    (integer) 0
    127.0.0.1:6379> bitcount 20880808
    (integer) 4
    127.0.0.1:6379> bitop or 08-09 20880808 20880809
    (integer) 2
    127.0.0.1:6379> bitcout 08-09
    (integer) 5
  ```

#### Tips 18

　　`Redis`应用于信息状态统计。

## HyperLogLog

### 统计独立UV

* 原始方案：`set`

  * 存储每个用户的`id`（字符串）
* 改进方案：`Bitmaps`

  * 存储每个用户状态（`bit`）
* 全新的方案：`Hyperloglog`

### 基数

　　基数是数据集去重后元素个数，`HyperLogLog`是用来做基数统计的，运用了`LogLog`的算法。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/redis-data-type/base-quota.png)

### HyperLogLog 类型的基本操作

* 添加数据

  ```bash
  pfadd key element [element ...]
  ```
* 统计数据

  ```bash
  pfcount key [key ...]
  ```
* 合并数据

  ```bash
  pfmerge destkey sourcekey [sourcekey...]
  ```

```bash
127.0.0.1:6379> pfadd hll 001
(integer) 1
127.0.0.1:6379> pfadd hll 001
(integer) 0
127.0.0.1:6379> pfadd hll 001
(integer) 0
127.0.0.1:6379> pfadd hll 001
(integer) 0
127.0.0.1:6379> pfadd hll 001
(integer) 0
127.0.0.1:6379> pfadd hll 002
(integer) 1
127.0.0.1:6379> pfadd hll 002
(integer) 0
127.0.0.1:6379> pfcounr hll
(integer) 2
```

### Tips 19

　　**`redis`****应用于独立信息统计**

### 相关说明

* 用于进行基数统计，不是集合，不保存数据，只记录数量而不是具体数据
* 核心是基数估算算法，最终数值存在一定误差
* 误差范围：基数估计的结果是一个带有 0.81% 标准错误的近似值
* 耗空间极小，每个`hyperloglog key`占用了 12K 的内存用于标记基数
* `pfadd`命令不是一次性分配 12K 内存使用，会随着基数的增加内存逐渐增大
* `Pfmerge`命令合并后占用的存储空间为 12K，无论合并之前数据量多少

## GEO

### GEO 类型的基本操作

* 添加坐标点

  ```bash
  geoadd key longitude latitude member [longitude latitude member ...]
  ```
* 获取坐标点

  ```bash
  geopos key member [member ...]
  ```
* 计算坐标点距离

  ```bash
  geodist key member1 member2 [unit]
  ```
* 添加坐标点

  ```bash
  georadius key longitude latitude radius m|km|ft|mi [withcoord] [withdist] [withhash] [count count]
  ```
* 获取坐标点

  ```bash
  georadiusbymember key member radius m|km|ft|mi [withcoord] [withdist] [withhash] [count count]
  ```
* 计算经纬度

  ```bash
  geohash key member [member ...]
  ```

```bash
127.0.0.1:6379> geoadd geos 1 1 a
(integer) 1
127.0.0.1:6379> geoadd geos 2 2 b
(integer) 1
127.0.0.1:6379> geopos geos a
1) 1) "0.99999994039535522"
   2) "0.99999945914297683"
127.0.0.1:6379> geodist geos a b
"157270.0561"
127.0.0.1:6379> geodist geos a b m
"157270.0561"
127.0.0.1:6379> geodist geos a b km
"157.2701"
127.0.0.1:6379> 
127.0.0.1:6379> geoadd geos 1 1 1,1
(integer) 1
127.0.0.1:6379> geoadd geos 1 2 1,2
(integer) 1
127.0.0.1:6379> geoadd geos 1 3 1,3
(integer) 1
127.0.0.1:6379> geoadd geos 2 1 2,1
(integer) 1
127.0.0.1:6379> geoadd geos 2 2 2,2
(integer) 1
127.0.0.1:6379> geoadd geos 2 3 2,3
(integer) 1
127.0.0.1:6379> geoadd geos 3 1 3,1
(integer) 1
127.0.0.1:6379> geoadd geos 3 2 3,2
(integer) 1
127.0.0.1:6379> geoadd geos 3 3 3,3
(integer) 1
127.0.0.1:6379> geoadd geos 5 5 5,5
(integer) 1
127.0.0.1:6379> 
127.0.0.1:6379> georadiusbymember geos 2,2 180 km
1) "1,1"
2) "2,1"
3) "1,2"
4) "2,2"
5) "3,1"
6) "3,2"
7) "1,3"
8) "2,3"
9） "3.3"
127.0.0.1:6379> georadiusbymember geos 2,2 120 km
1) "1,1"
2) "2,2"
3) "2,3"
4) "2,1"
127.0.0.1:6379> georadiusbymember geos 2,2 1800 km
1) "1,1"
2) "2,1"
3) "1,2"
4) "2,2"
5) "3,1"
6) "3,2"
7) "1,3"
8) "2,3"
9） "3.3"
10) "55"
127.0.0.1:6379> 
127.0.0.1:6379> georadius geos 1.5 1.5 90 km
1) "1,2"
2) "2,2"
3) "1,1"
4) "2,1"
127.0.0.1:6379> geohash geos 2,2
1) "s037ms06g70"
127.0.0.1:6379> 
```

### Tips 20

　　`Redis`应用于地理位置计算。

　　‍
