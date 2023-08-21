---
date: 2023-08-10
article: true
timeline: true
index: true
title: Zookeeper 总结
category: Zookeeper
tag:
- Zookeeper
---

# 简介/快速入门

　　`Zookeeper`是一个集中的服务，用于维护配置信息、命名、提供分布式同步和提供组服务。所有这些类型的服务都以某种形式被分布式应用程序使用。每次它们被实现时，都会有大量的工作来修复不可避免的错误和竞争条件。由于实现这些服务的困难，应用程序最初通常会略过这些服务，这使得它们在出现更改时变得脆弱，并且难以管理。即使正确地执行了这些服务，在部署应用程序时，这些服务的不同实现也会导致管理复杂性。

　　`Zookeeper`由雅虎研究院开发，是`Google Chubby`的开源实现,后来托管到`Apache`,于`2010年11月`正式成为`apache`的顶级项目。

　　大数据生态系统里由很多组件的命名都是某些动物或者昆虫，比如`hadoop`大象，`hive`就是蜂巢，`zookeeper`即管理员，顾名思义就算管理大数据生态系统各组件的管理员，如下所示：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/zookeeper-summary/zookeeper-big-data.png)

# 应用场景

　　`Zookeepepr`是一个经典的**分布式**数据一致性解决方案，致力于为分布式应用提供一个高性能、高可用,且具有严格顺序访问控制能力的分布式协调存储服务。

1. 维护配置信息  
   `Java`编程经常会遇到配置项，比如数据库的`url`、 `schema`、`user`和 `password`等；通常这些配置项我们会放置在配置文件中，再将配置文件放置在服务器上当需要更改配置项时，需要去服务器上修改对应的配置文件。  
   但是随着分布式系统的兴起,由于许多服务都需要使用到该配置文件，因此有**必须保证该配置服务的高可用性**（`highavailability`）和各台服务器上配置数据的一致性。  
   通常会将配置文件部署在一个集群上，然而一个**集群动辄上千台**服务器，此时如果再一台台服务器逐个修改配置文件那将是非常繁琐且危险的的操作，因此就**需要一种服务**，**能够高效快速且可靠地完成配置项的更改等操作**，并能够保证各配置项在每台服务器上的数据一致性。  
   `Zookeeper`**就可以提供这样一种服务**，其使用`Zab`这种一致性协议来保证一致性。现在有很多开源项目使用`Zookeeper`来维护配置，如在 `Hbase`中，客户端就是连接一个 `Zookeeper`，获得必要的`Hbase`集群的配置信息，然后才可以进一步操作。还有在开源的消息队列`Kafka`中，也便用`Zookeeper`来维护`brokers`的信息。在`Alibaba`开源的`soa`框架`Dubbo`中也广泛的使用`Zookeeper`管理一些配置来实现服务治理。  
   ![](https://cdn.jsdelivr.net/gh/1coins/assets/zookeeper-summary/zookeeper-maintain-config.png)
2. 分布式锁服务  
   一个集群是一个分布式系统，由多台服务器组成。为了提高并发度和可靠性，多台服务器上运行着同一种服务。当多个服务在运行时就需要协调各服务的进度，有时候需要保证当某个服务在进行某个操作时，其他的服务都不能进行该操作，即对该操作进行加锁，如果当前机器挂掉后，释放锁并`fail over`到其他的机器继续执行该服务。
3. 集群管理  
   一个集群有时会因为各种软硬件故障或者网络故障，出现棊些服务器挂掉而被移除集群，而某些服务器加入到集群中的情况，`Zookeeper`会将这些服务器加入/移出的情况通知给集群中的其他正常工作的服务器，以及时调整存储和计算等任务的分配和执行等，此外`Zookeeper`还会对故障的服务器做出诊断并尝试修复。  
   ![](https://cdn.jsdelivr.net/gh/1coins/assets/zookeeper-summary/zookeeper-cluster-manager.png)
4. 生产分布式唯一`ID`  
   在过去的单库单表型系统中，通常可以使用数据库字段自带的`auto_ increment`属性来自动为每条记录生成一个唯一的`ID`。但是分库分表后，就无法在依靠数据库的`auto_ Increment`属性来唯一标识一条记录了。此时我们就可以用`Zookeeper`在分布式环境下生成全局唯一`ID`。  
   做法如下:每次要生成一个新`ID`时，创建一个持久顺序节点，创建操作返回的节点序号，即为新`ID`，然后把比自己节点小的删除即可。

# Zookeeper 的设计目标

　　`ZooKeeper`致力于为分布式应用提供一个高性能、高可用，且具有严格顺序访问控制能力的分布式协调服务

* 高性能  
  `Zookeeper`将全量数据存储在**内存**中，并直接服务于客户端的所有非事务请求，尤其用于以读为主的应用场景
* 高可用  
  `Zookeeper`一般以集群的方式对外提供服务，一般`3~5`台机器就可以组成一个可用的`Zookeeper`集群了，每台机器都会在内存中维护当前的服务器状态，井且每台机器之间都相互保持着通信。只要集群中超过一半的机器都能够正常工作，那么整个集群就能够正常对外服务
* 严格顺序访问  
  对于来自客户端的每个更新请求，`Zookeeper`都会分配一个全局唯一的递增编号，这个编号反应了所有事务操作的先后顺序。

# 数据模型

　　`Zookeeper`的数据结点可以视为树状结构（或目录），树中的各个结点被称为`znode `（即`zookeeper node`），一个`znode`可以由多个子结点。`Zookeeper`结点在结构上表现为树状。

　　使用路径`path`来定位某个`znode`，比如`/ns-1/itcast/mysqml/schemal1/table1`，此处`ns-1，itcast、mysql、schemal1、table1`分别是根结点、2 级结点、3 级结点以及 4 级结点；其中`ns-1`是`itcast`的父结点，`itcast`是`ns-1`的子结点，`itcast`是`mysql`的父结点....以此类推。

　　`znode`兼具文件和目录两种特点，即像文件一样维护着数据、元信息、ACL、时间戳等数据结构，又像目录一样可以作为路径标识的一部分。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/zookeeper-summary/znode.png)

　　那么如何描述一个`znode`呢？一个`znode`大体上分为 3 个部分：

- 结点的数据：即`znode data `(结点`path`，结点`data`)的关系就像是`Java map `中的 `key value `关系
- 结点的子结点`children`
- 结点的状态`stat`：用来描述当前结点的创建、修改记录，包括`cZxid`、`ctime`等

## 结点状态 stat 的属性

　　在`zookeeper shell`中使用`get`命令查看指定路径结点的`data`、`stat`信息。

```bash
[zk localhost:2181(CONNECTED) 7] get /ns-1/tenant
```

### 属性说明

　　结点的各个属性如下：[Znodes 属性详解](https://zookeeper.apache.org/doc/r3.4.14/zookeeperProgrammers.html#sc_zkDataModel_znodes)。

　　其中重要的概念是`Zxid(Zookeeper Transaction ID)`，`Zookeeper`结点的每一次更改都具有唯一的`Zxid`，如果`Zxid-1` 小于` Zxid-2` ，则`Zxid-1` 的更改发生在 `Zxid-2 `更改之前。

- `cZxid`：数据结点创建时的事务`ID`——针对于`Zookeeper`数据结点的管理：我们对结点数据的一些写操作都会导致`Zookeeper`自动地为我们去开启一个事务，并且自动地去为每一个事务维护一个事务`ID`
- `ctime`：数据结点创建时的时间
- `mZxid`：数据结点最后一次更新时的事务`ID`
- `mtime`：数据结点最后一次更新时的时间
- `pZxid`：数据节点最后一次修改此`znode`子节点更改的`zxid`
- `cversion`：子结点的更改次数
- `dataVersion`：结点数据的更改次数
- `aclVersion`：结点的`ACL`更改次数——类似`Linux`的权限列表，维护的是当前结点的权限列表被修改的次数
- `ephemeralOwner`：如果结点是临时结点，则表示创建该结点的会话的`SessionID`；如果是持久结点，该属性值为 0
- `dataLength`：数据内容的长度
- `numChildren`：数据结点当前的子结点个数

### 结点类型

　　`Zookeeper`中的结点有两种，分别为**临时结点**和**永久结点**。结点的类型在创建时被确定，并且不能改变。

* 临时节点  
  该节点的生命周期依赖于创建它们的会话。一旦会话（`Session`）结束，临时节点将被自动删除，当然可以也可以手动删除；虽然每个临时的`Znode`都会绑定到一个客户端会话，但他们对所有的客户端还是可见的；另外，`Zookeeper`的临时节点不允许拥有子节点。
* 持久化结点  
  该结点的生命周期不依赖于会话，并且只有在客户端显示执行删除操作的时候，它们才能被删除。

# 单机安装

　　[Zookeeper 镜像](http://archive.apache.org/dist/zookeeper/
)

　　测试系统环境：

* `Centos7.3`
* `Zookeeper:zookeeper-3.4.10.tar.gz`
* `jdk:jdk-8u131-linux-x64.tar.gz`

　　安装步骤：

1. 在`Centos`中使用`root`用户创建`zookeeper`用户，用户名：`zookeeper`密码：`zookeeper`
   ```bash
   useradd zookeeper
   passwd zookeeper
   su zookeeper
   ```
2. `Zookeeper`底层依赖于`jdk`，`Zookeeper`用户登录后，根目录下先进行`jdk`的安装，`jdk`使用 `jdk-8u131-linux-x64.tar.gz`
   ```bash
   tar -zxf tar.gz
   ```
3. 配置`jdk`环境变量
   ```shell
   vi /etc/profile
   JAVA_HOME=/home/zookeeper/jdk1.8.0_131
   export JAVA_HOME

   PATH=$JAVA_HOME/bin:$PATH
   export PATH

   souce /etc/profile
   ```
4. 检测`jdk`安装  
   `java -version` // 如果反馈了Java信息，则成功
5. `Zookeeper` 上传解压
   ```shell
   tar -zxf tar.gz
   ```
6. 为`Zookeeper`准备配置文件
   ```bash
   # 进入 conf 目录
   cd /home/zookeeper/zookeeper-3.4.10/conf
   # 复制配置文件
   cp zoo_sampe.cfg zoo.cfg
   # zookeeper 根目录下创建 data 目录
   mkdir data
   # vi 配置文件中的 dataDir
   # 此路径用于存储 zookeeper 中数据的内存快照、及事务日志文件，虽然 zookeeper 是使用内存的，但是需要持久化一些数据来保证数据的安全，和 redis 一样
   dataDir=/home/zookeeper/zookeeper-3.4.10/data
   ```
7. 启动`Zookeeper`
   ```bash
   # 进入 zookeeper 的 bin 目录
   cd /home/zookeeper/zookeeper-3.4.10/bin
   # 启动 zookeeper
   ./zkServer.sh start

   # 启动: zkServer.sh start
   # 停止: zkServer.sh stop
   # 查看状态：zkServer.sh status

   # 进入 zookeeper 内部
   ./zkCli.sh
   ```

# 常用 shell 命令

　　`zookeeper`——`getting started`——[命令详解](https://zookeeper.apache.org/doc/r3.4.14/zookeeperStarted.html#sc_FileManagement)

## 操作结点

### 查询

* `get /hadoop`：查看结点的数据和属性
* `stat /hadoop`：查看结点的属性

### 创建

　　创建结点并写入数据：

　　`create [-s] [-e] path data`：其中`-s`为有序结点，`-e`临时结点（默认是持久结点）

```bash

create /hadoop "123456"  # 此时，如果 quit 退出后再 ./ZkCient.sh 登入
                         # 再用输入 get /hadoop 获取，结点依然存在(永久结点)
				   
create -s /a "a"         # 创建一个持久化有序结点，创建的时候可以观察到返回的数据带上了一个 id   
create -s /b "b"         # 返回的值，id 递增了

create -s -e /aa "aa"    # 依然还会返回自增的 id，quit 后再进来，继续创建，id 依然是往后推的

create /aa/xx            # 继续创建结点，可以看到 pZxid 变化了
```

　　**更新**

　　更新结点的命令是`set`，可以直接进行修改，如下：

　　`set path [version]`

```bash

set /hadoop "345"        # 修改结点值

set /hadoop "hadoop-x" 1 # 也可以基于版本号进行更改，类似于乐观锁，当传入版本号(dataVersion)
                         # 和当前结点的数据版本号不一致时，zookeeper 会拒绝本次修改
```

### 删除

　　删除结点的语法如下：

　　`delete path [version]`：和`set`方法相似，也可以传入版本号

```bash
delete /hadoop           # 删除结点
delete /hadoop 1         # 乐观锁机制，与 set 方法一致
```

　　要想删除某个结点及其所有后代结点，可以使用递归删除，命令为`rmr path`

### 查看结点列表

```bash
ls /hadoop               # 可以查看结点的列表
ls2 /hadoop              # 可以查看结点的列表以及目标结点的信息

ls /                     # 根节点
```

## 监听器

* `get path [watch] | stat path [watch]`：使用`get path [watch]` 注册的监听器能够在结点**内容发生改变**的时候，向客户端发出通知。需要注意的是`Zookeeper`的触发器是一次性的（`One-time trigger`），即触发一次后就会立即失效
  ```bash
  get /hadoop watch        # get 的时候添加监听器，当值改变的时候，监听器返回消息
  set /hadoop 45678        # 测试
  ```
* `ls\ls2 path [watch]`：使用`ls path [watch] 或 ls2 path [watch] `注册的监听器能够监听该结点下**所有子节点**的**增加**和**删除**操作
  ```bash
  ls /hadoop watch         # 添加监听器
  set /hadoop/node "node"
  ```

## Zookeeper 的 ACL 权限控制

　　[ACL 详解](https://zookeeper.apache.org/doc/r3.4.14/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) [ACL案例](https://zookeeper.apache.org/doc/r3.4.14/zookeeperProgrammers.html#sc_BuiltinACLSchemes)

　　`Zookeeper `类似文件系统，`client`可以创建结点、更新结点、删除结点，那么如何做到结点的权限控制呢？

　　`Zookeeper`的 `access control list` 访问控制列表可以做到这一点，`acl`权限控制，使用`scheme：id：permission `来标识，主要涵盖 3 个方面：

- 权限模式（`scheme`）：授权的策略
- 授权对象（`id`）：授权的对象
- 权限（`permission`）：授予的权限

　　其特性如下：

* `Zookeeper`的权限控制是基于每个`znode`结点的，需要对每个结点设置权限
* 每个`znode`支持多种权限控制方案和多个权限
* 子结点不会继承父结点的权限，客户端无权访问某结点，但可能可以访问它的子结点，例如：

  ```bash
  setAcl /test2 ip:192.168.133.133:crwda # 将结点权限设置为 Ip：192.168.133.133 的客户端可以对节点进行增删改查和管理权限
  ```

### 权限模式

#### 授权方式

|方案|描述|
| --------| --------------------------------------------|
|world|只有一个用户：`anyone`，代表登录 `zookeeper` 所有人(默认)|
|ip|对客户端使用 IP 地址认证|
|auth|使用已添加认证的用户认证|
|digest|使用"用户名：密码"方式认证|

#### 授权对象

　　给谁授予权限：授权对象`ID`是指权限赋予的实体，例如：`IP`地址或用户。

#### 授权权限

　　授予什么权限：`create、delete、read、writer、admin`也就是 增、删、查、改、管理权限，这 5 种权限简写为`c d r w a`。

　　注意：这五种权限中，有的权限并不是对结点自身操作的。

　　例如：`delete`是指对**子结点**的删除权限可以试图删除父结点，但是子结点必须删除干净，所以`delete`的权限也是很有用的

|权限|ACL 简写|描述|
| :------: | :--------: | :----------------------------------: |
|create|c|可以创建子结点|
|delete|d|可以删除子结点(仅下一级结点)|
|read|r|可以读取结点数据以及显示子结点列表|
|write|w|可以设置结点数据|
|admin|a|可以设置结点访问控制权限列表|

##### 授权的相关命令

|命令|使用方式|描述|
| ---------| ----------| ---------------|
|getAcl|getAcl|读取 ACL 权限|
|setAcl|setAcl|设置 ACL 权限|
|addauth|addauth|添加认证用户|

### 案例/远程登录

　　`./zkServer.sh -server 192.168.133.133`可以远程登录

#### world 权限模式

- `getAcl /node`：读取权限信息
- `setAcl /node world:anyone:drwa`：设置权限（禁用创建子结点的权限）

#### ip 模式

　　`./zkServer.sh -server 192.168.133.133`可以远程登录

* `setAcl /hadoop ip:192.168.133.133:drwa`：如果在两台不同的虚拟机中，另一台用远程连接的模式进行这条命令，那么只会有一台被授权
* 需要两台虚拟机一起授权的话需要用**逗号**将授权列表隔开：`setAcl /hadoop ip:192.168.133.133:cdrwa,ip:192.168.133.132:cdrwa`

#### auth 认证用户模式

* `addauth digest <user>:<password>`
* `setAcl <path> auth:<user>:<acl>`

```bash
create /hadoop "hadoop"           # 初始化测试用的结点
addauth digest itcast:123456      # 添加认证用户
setAcl /hadoop auth:itcast:cdrwa  # 设置认证用户
quit                              # 退出后再 ./zkCli.sh 进入
get /hadoop                       # 这个时候就没有权限了，需要再次认证
addauth digest itcast:123456      # 认证，密码错了的话 zookeeper 不会报错，但是不能认证
get /hadoop
```

#### Digest 授权模式

　　`setAcl <path> digest:<user>:<password>:<acl>`：这里的密码是经过`SHA1`以及`BASE64`处理的密文，在`shell`中可以通过以下命令计算：

```bash
echo -n <user>:<password> | openssl dgst -binary -sha1 | openssl base64
```

```bash
# 计算密码
echo -n itcast:12345 | openssl dgst -binary -sha1 | openssl base64
# 获取密码，设置权限列表
setAcl /hadoop digest:itcast:qUFSHxJjItUW/93UHFXFVGlvryY=:cdrwa
# 现在想要 get /hadoop 需要登录了
addauth digest itcast:12345
get /hadoop
```

#### 多种授权模式

　　仅需逗号隔开

```bash
setAcl /hadoop ip:192.168.133.132:cdrwa,auth:hadoop:cdrwa,digest:itcast:673OfZhUE8JEFMcu0l64qI8e5ek=:cdrwa
```

#### ACL 超级管理员

- `Zookeeper`的权限管理模式有一种叫做`super`，该模式提供一个超管，可以方便的访问任何权限的节点  
  假设这个超管是`supper:admin`，需要为超管生产密码的密文：
  ```shell
  echo -n super:admin | openssl dgst -binary -sha1 | openssl base64
  ```
- 那么打开`Zookeeper`目录下`/bin/zkServer.sh`服务器脚本文件，找到如下一行：
  ```shell
   /nohup # 快速查找，可以看到如下
   nohup "$JAVA" "-Dzookeeper.log.dir=${ZOO_LOG_DIR}" "-Dzookeeper.root.logger=${ZOO_LOG4J_PROP}"
  ```
- 这个就算脚本中启动`Zookeeper`的命令，默认只有以上两个配置项，我们需要添加一个超管的配置项
  ```bash
  "-Dzookeeper.DigestAuthenticationProvider.superDigest=super:xQJmxLMiHGwaqBvst5y6rkB6HQs="
  ```
- 修改后命令变成如下
  ```bash
  nohup "$JAVA" "-Dzookeeper.log.dir=${ZOO_LOG_DIR}" "-Dzookeeper.root.logger=${ZOO_LOG4J_PROP}" "-Dzookeeper.DigestAuthenticationProvider.superDigest=super:xQJmxLMiHGwaqBvst5y6rkB6HQs="
  ```
- ```bash
  # 重启后，现在随便对任意节点添加权限限制
  setAcl /hadoop ip:192.168.1.1:cdrwa # 这个 ip 并非本机
  # 现在当前用户没有权限了
  getAcl /hadoop
  # 登录超管
  addauth digest super:admin
  # 强行操作节点
  get /hadoop
  ```

# Zookeeper 的 JavaAPI

```xml
<dependency>
    <groupId>com.101tec</groupId>
    <artifactId>zkclient</artifactId>
    <exclusions>
        <exclusion>
            <artifactId>zookeeper</artifactId>
            <groupId>org.apache.zookeeper</groupId>
        </exclusion>
        <exclusion>
            <artifactId>log4j</artifactId>
            <groupId>log4j</groupId>
        </exclusion>
        <exclusion>
            <artifactId>slf4j-log4j12</artifactId>
            <groupId>org.slf4j</groupId>
        </exclusion>
        <exclusion>
            <artifactId>slf4j-api</artifactId>
            <groupId>org.slf4j</groupId>
        </exclusion>
    </exclusions>
    <version>0.9</version>
</dependency>
<dependency>
    <artifactId>zookeeper</artifactId>
    <exclusions>
        <exclusion>
            <artifactId>log4j</artifactId>
            <groupId>log4j</groupId>
        </exclusion>
        <exclusion>
            <artifactId>slf4j-log4j12</artifactId>
            <groupId>org.slf4j</groupId>
        </exclusion>
    </exclusions>
    <groupId>org.apache.zookeeper</groupId>
    <version>3.4.10</version>
</dependency>
```

　　`zonde`是`Zookeeper`集合的核心组件，`Zookeeper API` 提供了一小组使用`Zookeeper`集群来操作`znode`的所有细节。

　　客户端应该遵循以下步骤，与`Zookeeper`服务器进行清晰和干净的交互：

1. 连接到`Zookeeper`服务器，`Zookeeper`服务器为客户端分配会话`ID`
2. 定期向服务器发送心跳，否则，`Zookeeper`服务器将过期会话`ID`，客户端需要重新连接
3. 只要会话`ID`处于活动状态，就可以获取/设置`znode`
4. 所有任务完成后，断开与`Zookeeper`服务器连接，如果客户端长时间不活动，则`Zookeeper`服务器将自动断开客户端

## 连接到 Zookeeper

　　这部分，官网的解释十分稀少[官网详解](https://zookeeper.apache.org/doc/r3.4.14/zookeeperStarted.html#sc_ConnectingToZooKeeper)

```bash
[zkshell: 0] help
ZooKeeper host:port cmd args
    get path [watch]
    ls path [watch]
    set path data [version]
    delquota [-n|-b] path
    quit
    printwatches on|off
    create path data acl
    stat path [watch]
    listquota path
    history
    setAcl path acl
    getAcl path
    sync path
    redo cmdno
    addauth scheme auth
    delete path [version]
    deleteall path
    setquota -n|-b val path
```

```java
Zookeeper(String connectionString, int sessionTimeout, watcher watcher)
```

- `connectionString`：`Zookeeper`主机
- `sessionTimeout `：会话超时
- `watcher`：  实现"监听器" 对象，`Zookeeper`集合通过监视器对象返回连接状态

```java
public static void main(String[] args) throws IOException, InterruptedException {
        CountDownLatch countDownLatch = new CountDownLatch(1);

        ZooKeeper zookeeper = new ZooKeeper("192.168.133.133:2181", 5000, (WatchedEvent x) -> {
            if (x.getState() == Watcher.Event.KeeperState.SyncConnected) {
                System.out.println("连接成功");
                countDownLatch.countDown();
            }
        });
        countDownLatch.await();
        System.out.println(zookeeper.getSessionId());
        zookeeper.close();
}
```

```java
public class ZookeeperConnection {
    public static void main(String[] args) {
        try {
            // 计数器对象
            CountDownLatch countDownLatch=new CountDownLatch(1);
            // arg1:服务器的 ip 和端口
            // arg2:客户端与服务器之间的会话超时时间  以毫秒为单位的
            // arg3:监视器对象
            ZooKeeper zooKeeper=new ZooKeeper("192.168.60.130:2181", 5000, new Watcher() {
                @Override
                public void process(WatchedEvent event) {
                    if(event.getState()==Event.KeeperState.SyncConnected) {
                        System.out.println("连接创建成功!");
                        countDownLatch.countDown();
                    }
                }
            });
            // 主线程阻塞等待连接对象的创建成功
            countDownLatch.await();
            // 会话编号
            System.out.println(zooKeeper.getSessionId());
            zooKeeper.close();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
```

## 新增节点

```java
// 同步
create(String path, byte[] data, List<ACL> acl, CreateMode createMode)
// 异步
create(String path, byte[] data, List<ACL> acl, CreateMode createMode,
      AsynCallback.StringCallback callBack, Object ctx)
```

|参数|解释|
| :----------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|path|znode 路径|
|data|数据|
|acl|要创建的节点的访问控制列表。Zookeeper API 提供了一个静态接口 ZooDefs.Ids 来获取一些基本的 ACL 列表。例如，ZooDefs.Ids.OPEN_ACL_UNSAFE 返回打开 znode 的 ACL 列表|
|createMode|节点的类型，这是一个枚举|
|callBack|异步回调接口|
|ctx|传递上下文参数|

```java
public class ZKCreate {

    String IP="192.168.60.130:2181";
    ZooKeeper zooKeeper;

    @Before
    public void before()throws Exception{
        // 计数器对象
        CountDownLatch countDownLatch=new CountDownLatch(1);
        // arg1:服务器的 ip 和端口
        // arg2:客户端与服务器之间的会话超时时间  以毫秒为单位的
        // arg3:监视器对象
        zooKeeper=new ZooKeeper(IP, 5000, new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                if(event.getState()==Event.KeeperState.SyncConnected) {
                    System.out.println("连接创建成功!");
                    countDownLatch.countDown();
                }
            }
        });
        // 主线程阻塞等待连接对象的创建成功
        countDownLatch.await();
    }

    @After
    public void after()throws Exception{
        zooKeeper.close();
    }

    /**
     * 枚举的方式
     * @throws Exception
     */
    @Test
    public void create1()throws Exception{
        // arg1:节点的路径
        // arg2:节点的数据
        // arg3:权限列表  world:anyone:cdrwa
        // arg4:节点类型  持久化节点
        zooKeeper.create("/create/node1","node1".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
    }

    @Test
    public void create2() throws Exception {
        // Ids.READ_ACL_UNSAFE world:anyone:r
        zooKeeper.create("/create/node2", "node2".getBytes(), ZooDefs.Ids.READ_ACL_UNSAFE, CreateMode.PERSISTENT);
    }

    /**
     * 自定义的方式
     * @throws Exception
     */
    @Test
    public void create3() throws Exception {
        // world 授权模式
        // 权限列表
        List<ACL> acls = new ArrayList<ACL>();
        // 授权模式和授权对象
        Id id = new Id("world", "anyone");
        // 权限设置
        acls.add(new ACL(ZooDefs.Perms.READ, id));
        acls.add(new ACL(ZooDefs.Perms.WRITE, id));
        zooKeeper.create("/create/node3", "node3".getBytes(), acls, CreateMode.PERSISTENT);
    }

    @Test
    public void create4() throws Exception {
        // ip 授权模式
        // 权限列表
        List<ACL> acls = new ArrayList<ACL>();
        // 授权模式和授权对象
        Id id = new Id("ip", "192.168.60.130");
        // 权限设置
        acls.add(new ACL(ZooDefs.Perms.ALL, id));
        zooKeeper.create("/create/node4", "node4".getBytes(), acls, CreateMode.PERSISTENT);
    }

    /**
     * auth
     * @throws Exception
     */
    @Test
    public void create5() throws Exception {
        // auth 授权模式
        // 添加授权用户
        zooKeeper.addAuthInfo("digest", "itcast:123456".getBytes());
        zooKeeper.create("/create/node5", "node5".getBytes(), ZooDefs.Ids.CREATOR_ALL_ACL, CreateMode.PERSISTENT);
    }

    /**
     * 自定义的 auth
     * @throws Exception
     */
    @Test
    public void create6() throws Exception {
        // auth 授权模式
        // 添加授权用户
        zooKeeper.addAuthInfo("digest", "itcast:123456".getBytes());
        // 权限列表
        List<ACL> acls = new ArrayList<ACL>();
        // 授权模式和授权对象
        Id id = new Id("auth", "itcast");
        // 权限设置
        acls.add(new ACL(ZooDefs.Perms.READ, id));
        zooKeeper.create("/create/node6", "node6".getBytes(), acls, CreateMode.PERSISTENT);
    }

    /**
     * digest
     * @throws Exception
     */
    @Test
    public void create7() throws Exception {
        // digest 授权模式
        // 权限列表
        List<ACL> acls = new ArrayList<ACL>();
        // 授权模式和授权对象
        Id id = new Id("digest", "itheima:qlzQzCLKhBROghkooLvb+Mlwv4A=");
        // 权限设置
        acls.add(new ACL(ZooDefs.Perms.ALL, id));
        zooKeeper.create("/create/node7", "node7".getBytes(), acls, CreateMode.PERSISTENT);
    }

    @Test
    public void create8() throws Exception {
        // 持久化顺序节点
        // Ids.OPEN_ACL_UNSAFE world:anyone:cdrwa
        String result = zooKeeper.create("/create/node8", "node8".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT_SEQUENTIAL);
        System.out.println(result);
    }

    @Test
    public void create9() throws Exception {
        //  临时节点
        // Ids.OPEN_ACL_UNSAFE world:anyone:cdrwa
        String result = zooKeeper.create("/create/node9", "node9".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL);
        System.out.println(result);
    }

    @Test
    public void create10() throws Exception {
        // 临时顺序节点
        // Ids.OPEN_ACL_UNSAFE world:anyone:cdrwa
        String result = zooKeeper.create("/create/node10", "node10".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);
        System.out.println(result);
    }

    /**
     * 异步
     * @throws Exception
     */
    @Test
    public void create11() throws Exception {
        // 异步方式创建节点
        zooKeeper.create("/create/node11", "node11".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT, new AsyncCallback.StringCallback() {
            /**
             * @param rc 状态，0 则为成功，以下的所有示例都是如此
             * @param path 路径
             * @param ctx 上下文参数
             * @param name 路径
             */
            @Override
            public void processResult(int rc, String path, Object ctx, String name) {
                // 0 代表创建成功
                System.out.println(rc);
                // 节点的路径
                System.out.println(path);
                // 节点的路径
                System.out.println(name);
                // 上下文参数
                System.out.println(ctx);

            }
        }, "I am context");
        Thread.sleep(10000);
        System.out.println("结束");
    }
}
```

## 修改节点

　　同样也有两种修改方式（`异步和同步`）

```java
// 同步
setData(String path, byte[] data, int version)
// 异步
setData(String path, byte[] data, int version, StatCallback callBack, Object ctx)
```

|参数|解释|
| ----------| -----------------------------------------------------------------------------------------|
|path|节点路径|
|data|数据|
|version|数据的版本号， -1 代表不使用版本号，乐观锁机制|
|callBack|异步回调 AsyncCallback.StatCallback，和之前的回调方法参数不同，这个可以获取节点状态|
|ctx|传递上下文参数|

```java
public class ZKSet {

    String IP = "192.168.60.130:2181";
    ZooKeeper zooKeeper;

    @Before
    public void before() throws Exception {
        CountDownLatch countDownLatch = new CountDownLatch(1);
        // arg1: Zookeeper 服务器的 ip 地址和端口号
        // arg2: 连接的超时时间  以毫秒为单位
        // arg3: 监听器对象
        zooKeeper = new ZooKeeper(IP, 5000, new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                if (event.getState() == Event.KeeperState.SyncConnected) {
                    System.out.println("连接创建成功!");
                    countDownLatch.countDown();
                }
            }
        });
        // 使主线程阻塞等待
        countDownLatch.await();
    }

    @After
    public void after() throws Exception {
        zooKeeper.close();
    }

    /**
     * 同步
     * @throws Exception
     */
    @Test
    public void set1() throws Exception {
        // arg1: 节点的路径
        // arg2: 修改的数据
        // arg3: 数据版本号 -1 代表版本号不参与更新
        Stat stat = zooKeeper.setData("/set/node1", "node13".getBytes(), -1);
        // 当前节点的版本号
        System.out.println(stat.getVersion());
    }

    /**
     * 异步
     * @throws Exception
     */
    @Test
    public void set2() throws Exception {
        zooKeeper.setData("/set/node1", "node14".getBytes(), -1, new AsyncCallback.StatCallback() {
            @Override
            public void processResult(int rc, String path, Object ctx, Stat stat) {
                // 下面要先判空后才能打印
                // 0 代表修改成功
                System.out.println(rc);
                // 节点的路径
                System.out.println(path);
                // 上下文参数对象
                System.out.println(ctx);
                // 属性描述对象
                System.out.println(stat.getVersion());
            }
        }, "I am Context");
        Thread.sleep(10000);
        System.out.println("结束");
    }
}
```

## 删除节点

　　异步、同步

```java
// 同步
delete(String path, int version)
// 异步
delete(String path, int version, AsyncCallback.VoidCallback callBack, Object ctx)
```

|参数|解释|
| ----------------| ----------------------------------------------------|
|path|节点路径|
|version|版本|
|callBack|数据的版本号， -1 代表不使用版本号，乐观锁机制|
|ctx|传递上下文参数|

```java
public class ZKDelete {
    String IP = "192.168.60.130:2181";
    ZooKeeper zooKeeper;

    @Before
    public void before() throws Exception {
        CountDownLatch countDownLatch = new CountDownLatch(1);
        // arg1: Zookeeper 服务器的 ip 地址和端口号
        // arg2: 连接的超时时间  以毫秒为单位
        // arg3: 监听器对象
        zooKeeper = new ZooKeeper(IP, 5000, new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                if (event.getState() == Event.KeeperState.SyncConnected) {
                    System.out.println("连接创建成功!");
                    countDownLatch.countDown();
                }
            }
        });
        // 使主线程阻塞等待
        countDownLatch.await();
    }

    @After
    public void after() throws Exception {
        zooKeeper.close();
    }

    @Test
    public void delete1() throws Exception {
        // arg1: 删除节点的节点路径
        // arg2: 数据版本信息 -1 代表删除节点时不考虑版本信息
        zooKeeper.delete("/delete/node1",-1);
    }

    @Test
    public void delete2() throws Exception {
        // 异步使用方式
        zooKeeper.delete("/delete/node2", -1, new AsyncCallback.VoidCallback() {
            @Override
            public void processResult(int rc, String path, Object ctx) {
                // 0 代表删除成功
                System.out.println(rc);
                // 节点的路径
                System.out.println(path);
                // 上下文参数对象
                System.out.println(ctx);
            }
        },"I am Context");
        Thread.sleep(10000);
        System.out.println("结束");
    }
}
```

## 查看节点

　　同步、异步

```java
// 同步
getData(String path, boolean watch, Stat stat)
getData(String path, Watcher watcher, Stat stat)
// 异步
getData(String path, boolean watch, DataCallback callBack, Object ctx)
getData(String path, Watcher watcher, DataCallback callBack, Object ctx)
```

|参数|解释|
| ----------------| ----------------------------------|
|path|节点路径|
|boolean|是否使用连接对象中注册的监听器|
|stat|元数据|
|callBack|异步回调接口，可以获得状态和数据|
|ctx|传递上下文参数|

```java
public class ZKGet {

    String IP = "192.168.60.130:2181";
    ZooKeeper zooKeeper;

    @Before
    public void before() throws Exception {
        CountDownLatch countDownLatch = new CountDownLatch(1);
        // arg1: Zookeeper 服务器的 ip 地址和端口号
        // arg2: 连接的超时时间  以毫秒为单位
        // arg3: 监听器对象
        zooKeeper = new ZooKeeper(IP, 5000, new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                if (event.getState() == Event.KeeperState.SyncConnected) {
                    System.out.println("连接创建成功!");
                    countDownLatch.countDown();
                }
            }
        });
        // 使主线程阻塞等待
        countDownLatch.await();
    }

    @After
    public void after() throws Exception {
        zooKeeper.close();
    }

    @Test
    public void get1() throws Exception {
        // arg1: 节点的路径
        // arg3: 读取节点属性的对象
        Stat stat=new Stat();
        byte [] bys=zooKeeper.getData("/get/node1",false,stat);
        // 打印数据
        System.out.println(new String(bys));
        // 版本信息
        System.out.println(stat.getVersion());
        // 判空
        System.out.println(stat.getCtime());
    }

    @Test
    public void get2() throws Exception {
        // 异步方式
        zooKeeper.getData("/get/node1", false, new AsyncCallback.DataCallback() {
            @Override
            public void processResult(int rc, String path, Object ctx, byte[] data, Stat stat) {
                // 0 代表读取成功
                System.out.println(rc);
                // 节点的路径
                System.out.println(path);
                // 上下文参数对象
                System.out.println(ctx);
                // 数据
                System.out.println(new String(data));
                // 属性对象
                System.out.println(stat.getVersion());
                System.out.println(stat.getCzxid());
            }
        },"I am Context");
        Thread.sleep(10000);
        System.out.println("结束");
    }
}
```

## 查看子节点

　　同步、异步

```java
// 同步
getChildren(String path, boolean watch)
getChildren(String path, Watcher watcher)
getChildren(String path, boolean watch, Stat stat)  
getChildren(String path, Watcher watcher, Stat stat)
// 异步
getChildren(String path, boolean watch, ChildrenCallback callBack, Object ctx)  
getChildren(String path, Watcher watcher, ChildrenCallback callBack, Object ctx)
getChildren(String path, Watcher watcher, Children2Callback callBack, Object ctx)  
getChildren(String path, boolean watch, Children2Callback callBack, Object ctx)
```

|参数|解释|
| ----------------| ----------------------------|
|path|节点路径|
|boolean||
|callBack|异步回调，可以获取节点列表|
|ctx|传递上下文参数|

```java
public class ZKGetChid {
    String IP = "192.168.60.130:2181";
    ZooKeeper zooKeeper;

    @Before
    public void before() throws Exception {
        CountDownLatch countDownLatch = new CountDownLatch(1);
        // arg1: Zookeeper 服务器的 ip 地址和端口号
        // arg2: 连接的超时时间  以毫秒为单位
        // arg3: 监听器对象
        zooKeeper = new ZooKeeper(IP, 5000, new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                if (event.getState() == Event.KeeperState.SyncConnected) {
                    System.out.println("连接创建成功!");
                    countDownLatch.countDown();
                }
            }
        });
        // 使主线程阻塞等待
        countDownLatch.await();
    }

    @After
    public void after() throws Exception {
        zooKeeper.close();
    }

    @Test
    public void get1() throws Exception {
        // arg1: 节点的路径
        List<String> list = zooKeeper.getChildren("/get", false);
        for (String str : list) {
            System.out.println(str);
        }
    }

    @Test
    public void get2() throws Exception {
        // 异步用法
        zooKeeper.getChildren("/get", false, new AsyncCallback.ChildrenCallback() {
            @Override
            public void processResult(int rc, String path, Object ctx, List<String> children) {
                // 0 代表读取成功
                System.out.println(rc);
                // 节点的路径
                System.out.println(path);
                // 上下文参数对象
                System.out.println(ctx);
                // 子节点信息
                for (String str : children) {
                    System.out.println(str);
                }
            }
        },"I am Context");
//        TimeUnit.SECONDS.sleep(3);
        Thread.sleep(10000);
        System.out.println("结束");
    }
}
```

## 检查节点是否存在

　　同步、异步

```java
// 同步
exists(String path, boolean watch)
exists(String path, Watcher watcher)
// 异步
exists(String path, boolean watch, StatCallback cb, Object ctx)
exists(String path, Watcher watcher, StatCallback cb, Object ctx)
```

|参数|解释|
| ----------------| ----------------------------|
|path|节点路径|
|boolean||
|callBack|异步回调，可以获取节点列表|
|ctx|传递上下文参数|

```java
public class ZKExists {
    String IP = "192.168.60.130:2181";
    ZooKeeper zooKeeper;

    @Before
    public void before() throws Exception {
        CountDownLatch countDownLatch = new CountDownLatch(1);
        // arg1: Zookeeper 服务器的 ip 地址和端口号
        // arg2: 连接的超时时间  以毫秒为单位
        // arg3: 监听器对象
        zooKeeper = new ZooKeeper(IP, 5000, new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                if (event.getState() == Event.KeeperState.SyncConnected) {
                    System.out.println("连接创建成功!");
                    countDownLatch.countDown();
                }
            }
        });
        // 使主线程阻塞等待
        countDownLatch.await();
    }

    @After
    public void after() throws Exception {
        zooKeeper.close();
    }

    @Test
    public void exists1() throws Exception {
        // arg1: 节点的路径
        Stat stat=zooKeeper.exists("/exists1",false);
        // 节点的版本信息，需判空
        System.out.println(stat.getVersion() + "成功");
    }

    @Test
    public void exists2() throws Exception {
        // 异步方式
        zooKeeper.exists("/exists1", false, new AsyncCallback.StatCallback() {
            @Override
            public void processResult(int rc, String path, Object ctx, Stat stat) {
                // 需判空
                // 0 代表方式执行成功
                System.out.println(rc);
                // 节点的路径
                System.out.println(path);
                // 上下文参数
                System.out.println(ctx);
                // 节点的版本信息
                System.out.println(stat.getVersion());
            }
        },"I am Context");
        Thread.sleep(10000);
        System.out.println("结束");
    }
}
```

# 事件监听机制

## watcher 概念

　　[watcher 概念](https://zookeeper.apache.org/doc/r3.4.14/zookeeperProgrammers.html#sc_WatchRememberThese)

- `Zookeeper`提供了数据的`发布/订阅`功能，多个订阅者可同时监听某一特定主题对象，当该主题对象的自身状态发生变化时例如节点内容改变、节点下的子节点列表改变等，会实时、主动通知所有订阅者
- `Zookeeper`采用了`Watcher`机制实现数据的发布订阅功能。该机制在被订阅对象发生变化时会异步通知客户端，因此客户端不必在`Watcher`注册后轮询阻塞，从而减轻了客户端压力
- `Watcher`机制事件上与观察者模式类似，也可看作是一种观察者模式在分布式场景下的实现方式

## Watcher 架构

　　`Watcher`实现由三个部分组成

- `Zookeeper`服务端
- `Zookeeper`客户端
- 客户端的`ZKWatchManager对象`

　　客户端**首先将****`Watcher`****注册到服务端**，同时将`Watcher`对象**保存到客户端的****`watch`****管理器中**。当`Zookeeper`服务端监听的数据状态发生变化时，服务端会**主动通知客户端**，接着客户端的`Watch`管理器会**触发相关****`Watcher`**来回调相应处理逻辑，从而完成整体的数据`发布/订阅`流程

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/zookeeper-summary/watcher-framework.png)

## Watcher 特性

|特性|说明|
| --------------| ----------------------------------------------------------------------------------------------|
|一次性|`watcher`是**一次性**的，一旦被触发就会移除，再次使用时需要重新注册|
|客户端顺序回调|`watcher`回调是**顺序串行**执行的，只有回调后客户端才能看到最新的数据状态。一个`watcher`回调逻辑不应该太多，以免影响别的`watcher`执行|
|轻量级|`WatchEvent`是最小的通信单位，结构上只包含**通知状态、事件类型和节点路径**，并不会告诉数据节点变化前后的具体内容|
|时效性|`watcher`只有在当前`session`彻底失效时才会无效，若在`session`有效期内快速重连成功，则`watcher`依然存在，仍可接收到通知；|

## Watcher 接口设计

　　`Watcher`是一个接口，任何实现了`Watcher`接口的类就算一个新的`Watcher`。`Watcher`内部包含了两个枚举类：`KeeperState`、`EventType`。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/zookeeper-summary/watcher-interface.png)

### Watcher 通知状态（KeeperState）

　　`KeeperState`是客户端与服务端**连接状态**发生变化时对应的通知类型。路径为`org.apache.zookeeper.Watcher.EventKeeperState`，是一个枚举类，其枚举属性如下：

|枚举属性|说明|
| --------------------| --------------------------|
|SyncConnected|客户端与服务器正常连接时|
|Disconnected|客户端与服务器断开连接时|
|Expired|会话 session 失效时|
|AuthFailed|身份认证失败时|

### Watcher 事件类型（EventType）

　　`EventType`是**数据节点****`znode`****发生变化**时对应的通知类型。**`EventType`****变化时****`KeeperState`****永远处于****`SyncConnected`****通知状态下**；当`keeperState`发生变化时，`EventType`永远为`None`。其路径为`org.apache.zookeeper.Watcher.Event.EventType`，是一个枚举类，枚举属性如下：

|枚举属性|说明|
| -------------------------| ------------------------------------------------------------------|
|None|无|
|NodeCreated|Watcher 监听的数据节点被创建时|
|NodeDeleted|Watcher 监听的数据节点被删除时|
|NodeDataChanged|Watcher 监听的数据节点内容发生更改时(无论数据是否真的变化)|
|NodeChildrenChanged|Watcher 监听的数据节点的子节点列表发生变更时|

　　注意：客户端接收到的相关事件通知中只包含状态以及类型等信息，不包含节点变化前后的具体内容，变化前的数据需业务自身存储，变化后的数据需要调用`get`等方法重新获取

### 捕获相应的事件

　　上面讲到`Zookeeper`客户端连接的状态和`Zookeeper`对`znode`节点监听的事件类型，下面我们来讲解如何建立`Zookeeper`的`Watcher`监听。在`Zookeeper`中采用`zk.getChildren(path,watch)、zk.exists(path,watch)、zk.getData(path,watcher,stat)`这样的方式来为某个`znode`注册监听 。

　　下表以`node-x`节点为例，说明调用的注册方法和可用监听事件间的关系：

|注册方式|created|childrenChanged|Changed|Deleted|
| ----------| ---------| -----------------| ---------| ---------|
|`zk.exists("/node-x",watcher)`|可监控||可监控|可监控|
|`zk.getData("/node-x",watcher)`|||可监控|可监控|
|`zk.getChildren("/node-x",watcher)`||可监控||可监控|

## 注册 Watcher 的方法

### 客户端与服务器端的连接状态

* `KeeperState`：通知状态`SyncConnected`：客户端与服务器正常连接时
* `Disconnected`：客户端与服务器断开连接时
* `Expired`：会话 `session` 失效时
* `AuthFailed`：身份认证失败时
* 事件类型为：`None`

```java
public class ZKConnectionWatcher implements Watcher {

    // 计数器对象
    static CountDownLatch countDownLatch = new CountDownLatch(1);
    // 连接对象
    static ZooKeeper zooKeeper;

    @Override
    public void process(WatchedEvent event) {
        try {
            // 事件类型
            if (event.getType() == Event.EventType.None) {
                if (event.getState() == Event.KeeperState.SyncConnected) {
                    // 正常
                    System.out.println("连接创建成功!");
                    countDownLatch.countDown();
                } else if (event.getState() == Event.KeeperState.Disconnected) {
                    // 可以用 Windows 断开虚拟机网卡的方式模拟
                    // 当会话断开会出现，断开连接不代表不能重连，在会话超时时间内重连可以恢复正常
                    System.out.println("断开连接！");
                } else if (event.getState() == Event.KeeperState.Expired) {
                    // 没有在会话超时时间内重新连接，而是当会话超时被移除的时候重连会走进这里
                    System.out.println("会话超时!");
                    zooKeeper = new ZooKeeper("192.168.60.130:2181", 5000, new ZKConnectionWatcher());
                } else if (event.getState() == Event.KeeperState.AuthFailed) {
                    // 在操作的时候权限不够会出现
                    System.out.println("认证失败！");
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public static void main(String[] args) {
        try {
            // 5000 为会话超时时间
            zooKeeper = new ZooKeeper("192.168.60.130:2181", 5000, new ZKConnectionWatcher());
            // 阻塞线程等待连接的创建
            countDownLatch.await();
            // 会话 id
            System.out.println(zooKeeper.getSessionId());
            // 添加授权用户
            zooKeeper.addAuthInfo("digest1","itcast1:1234561".getBytes());
            byte [] bs=zooKeeper.getData("/node1",false,null);
            System.out.println(new String(bs));
            Thread.sleep(50000);
            zooKeeper.close();
            System.out.println("结束");
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
```

### Watcher 检查节点

#### exists

* `exists(String path, boolean b)`：使用连接对象的监视器
* `exists(String path, Watcher w)`：自定义监视器
* `NodeCreated`：**节点**创建
* `NodeDeleted`：**节点**删除
* `NodeDataChanged`：**节点**内容发生变化

```java
public class ZKWatcherExists {

    String IP = "192.168.60.130:2181";
    ZooKeeper zooKeeper = null;

    @Before
    public void before() throws IOException, InterruptedException {
        CountDownLatch countDownLatch = new CountDownLatch(1);
        // 连接 zookeeper 客户端
        zooKeeper = new ZooKeeper(IP, 6000, new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("连接对象的参数!");
                // 连接成功
                if (event.getState() == Event.KeeperState.SyncConnected) {
                    countDownLatch.countDown();
                }
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
            }
        });
        countDownLatch.await();
    }
  
    @After
    public void after() throws InterruptedException {
        zooKeeper.close();
    }
  
    /**
     * 采用 zookeeper 连接创建时的监听器
     * @throws KeeperException
     * @throws InterruptedException
     */
    @Test
    public void watcherExists1() throws KeeperException, InterruptedException {
        // arg1: 节点的路径
        // arg2: 使用连接对象中的 watcher
        zooKeeper.exists("/watcher1", true);
        Thread.sleep(50000);
        System.out.println("结束");
    }

    /**
     * 自定义监听器
     * @throws KeeperException
     * @throws InterruptedException
     */
    @Test
    public void watcherExists2() throws KeeperException, InterruptedException {
        // arg1: 节点的路径
        // arg2: 自定义 watcher 对象
        zooKeeper.exists("/watcher1", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("自定义watcher");
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
            }
        });
        Thread.sleep(50000);
        System.out.println("结束");
    }

    @Test
    public void watcherExists3() throws KeeperException, InterruptedException {
        // watcher 一次性：一旦被触发就会移除，再次使用时需要重新注册
        Watcher watcher = new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                /*
                System.out.println("自定义 watcher");
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
                */
                // 解决一次性问题
                try {
                    System.out.println("自定义 watcher");
                    System.out.println("path=" + event.getPath());
                    System.out.println("eventType=" + event.getType());
                    zooKeeper.exists("/watcher1", this);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        };
        zooKeeper.exists("/watcher1", watcher);
        Thread.sleep(80000);
        System.out.println("结束");
    }


    @Test
    public void watcherExists4() throws KeeperException, InterruptedException {
        // 注册多个监听器对象
        zooKeeper.exists("/watcher1", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("1");
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
            }
        });
        zooKeeper.exists("/watcher1", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("2");
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
            }
        });
        Thread.sleep(80000);
        System.out.println("结束");
    }
}
```

#### getData

- `getData(String path, boolean b, Stat stat)`：使用连接对象的监视器
- `getData(String path, Watcher w, Stat stat)`：自定义监视器
- `NodeDeleted`：节点删除
- `NodeDataChange`：节点内容发生变化

```java
public class ZKWatcherGetData {

    String IP = "192.168.60.130:2181";
    ZooKeeper zooKeeper = null;

    @Before
    public void before() throws IOException, InterruptedException {
        CountDownLatch countDownLatch = new CountDownLatch(1);
        // 连接 zookeeper 客户端
        zooKeeper = new ZooKeeper(IP, 6000, new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("连接对象的参数!");
                // 连接成功
                if (event.getState() == Event.KeeperState.SyncConnected) {
                    countDownLatch.countDown();
                }
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
            }
        });
        countDownLatch.await();
    }

    @After
    public void after() throws InterruptedException {
        zooKeeper.close();
    }

    /**
     * 采用 zookeeper 连接创建时的监听器
     * @throws KeeperException
     * @throws InterruptedException
     */
    @Test
    public void watcherGetData1() throws KeeperException, InterruptedException {
        // arg1: 节点的路径
        // arg2: 使用连接对象中的 watcher
        zooKeeper.getData("/watcher2", true, null);
        Thread.sleep(50000);
        System.out.println("结束");
    }

    /**
     * 自定义监听器
     * @throws KeeperException
     * @throws InterruptedException
     */
    @Test
    public void watcherGetData2() throws KeeperException, InterruptedException {
        // arg1: 节点的路径
        // arg2: 自定义 watcher 对象
        zooKeeper.getData("/watcher2", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("自定义watcher");
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
            }
        }, null);
        Thread.sleep(50000);
        System.out.println("结束");
    }

    @Test
    public void watcherGetData3() throws KeeperException, InterruptedException {
        // watcher 一次性：一旦被触发就会移除，再次使用时需要重新注册
        Watcher watcher = new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                /*
                System.out.println("自定义 watcher");
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
                */
                // 修复一次性问题，通过 getData 进行 watcher 事件的多次注册
                try {
                    System.out.println("自定义 watcher");
                    System.out.println("path=" + event.getPath());
                    System.out.println("eventType=" + event.getType());
                    // 当节点数据发送变化时重新进行事件注册
                    if(event.getType()==Event.EventType.NodeDataChanged) {
                        zooKeeper.getData("/watcher2", this, null);
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        };
        zooKeeper.getData("/watcher2", watcher, null);
        Thread.sleep(50000);
        System.out.println("结束");
    }

    @Test
    public void watcherGetData4() throws KeeperException, InterruptedException {
        // 注册多个监听器对象
        zooKeeper.getData("/watcher2", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                try {
                    System.out.println("1");
                    System.out.println("path=" + event.getPath());
                    System.out.println("eventType=" + event.getType());
                    if(event.getType()==Event.EventType.NodeDataChanged) {
                        zooKeeper.getData("/watcher2", this, null);
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        },null);
        zooKeeper.getData("/watcher2", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                try {
                    System.out.println("2");
                    System.out.println("path=" + event.getPath());
                    System.out.println("eventType=" + event.getType());
                    if(event.getType()==Event.EventType.NodeDataChanged) {
                        zooKeeper.getData("/watcher2", this, null);
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        },null);
        Thread.sleep(50000);
        System.out.println("结束");
    }
}
```

#### getChildren

- `getChildren(String path, boolean b)`：使用连接对象的监视器
- `getChildren(String path, Watcher w)`：使用自定义的监视器
- `NodeChildrenChanged`：**子节点**发生变化
- `NodeDeleted`：**节点删除**

```java
public class ZKWatcherGetChild {
    String IP = "192.168.60.130:2181";
    ZooKeeper zooKeeper = null;

    @Before
    public void before() throws IOException, InterruptedException {
        CountDownLatch connectedSemaphore = new CountDownLatch(1);
        // 连接 zookeeper 客户端
        zooKeeper = new ZooKeeper(IP, 6000, new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("连接对象的参数!");
                // 连接成功
                if (event.getState() == Event.KeeperState.SyncConnected) {
                    connectedSemaphore.countDown();
                }
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
            }
        });
        connectedSemaphore.await();
    }

    @After
    public void after() throws InterruptedException {
        zooKeeper.close();
    }

    /**
     * 采用 zookeeper 连接创建时的监听器
     * @throws KeeperException
     * @throws InterruptedException
     */
    @Test
    public void watcherGetChild1() throws KeeperException, InterruptedException {
        // arg1: 节点的路径
        // arg2: 使用连接对象中的 watcher
        zooKeeper.getChildren("/watcher3", true);
        Thread.sleep(50000);
        System.out.println("结束");
    }

    /**
     * 自定义监听器
     * @throws KeeperException
     * @throws InterruptedException
     */
    @Test
    public void watcherGetChild2() throws KeeperException, InterruptedException {
        // arg1: 节点的路径
        // arg2: 自定义 watcher
        zooKeeper.getChildren("/watcher3", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("自定义watcher");
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
            }
        });
        Thread.sleep(50000);
        System.out.println("结束");
    }

    @Test
    public void watcherGetChild3() throws KeeperException, InterruptedException {
        // watcher 一次性：一旦被触发就会移除，再次使用时需要重新注册
        Watcher watcher = new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                /*
                System.out.println("自定义 watcher");
                System.out.println("path=" + event.getPath());
                System.out.println("eventType=" + event.getType());
                 */
                // 修复一次性问题，通过 getChildren 进行 watcher 事件的多次注册
                try {
                    System.out.println("自定义 watcher");
                    System.out.println("path=" + event.getPath());
                    System.out.println("eventType=" + event.getType());
                    if (event.getType() == Event.EventType.NodeChildrenChanged) {
                        zooKeeper.getChildren("/watcher3", this);
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        };
        zooKeeper.getChildren("/watcher3", watcher);
        Thread.sleep(50000);
        System.out.println("结束");
    }

    @Test
    public void watcherGetChild4() throws KeeperException, InterruptedException {
        // 多个监视器对象
        zooKeeper.getChildren("/watcher3", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                try {
                    System.out.println("1");
                    System.out.println("path=" + event.getPath());
                    System.out.println("eventType=" + event.getType());
                    if (event.getType() == Event.EventType.NodeChildrenChanged) {
                        zooKeeper.getChildren("/watcher3", this);
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        });

        zooKeeper.getChildren("/watcher3", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                try {
                    System.out.println("2");
                    System.out.println("path=" + event.getPath());
                    System.out.println("eventType=" + event.getType());
                    if (event.getType() == Event.EventType.NodeChildrenChanged) {
                        zooKeeper.getChildren("/watcher3", this);
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        });
        Thread.sleep(50000);
        System.out.println("结束");
    }
}
```

### 配置中心案例

　　工作中有这样的一个场景：数据库用户名和密码信息放在一个配置文件中，应用读取该配置文件，配置文件信息放入缓存。

　　若数据库的用户名和密码改变时候，还需要重新加载媛存，比较麻烦，通过 `Zookeeper`可以轻松完成,当数据库发生变化时自动完成缓存同步。

　　使用事件监听机制可以做出一个简单的配置中心。

　　设计思路：

1. 连接`Zookeeper`服务器
2. 读取`Zookeeper`中的配置信息，注册`Watcher`监听器，存入本地变量
3. 当`Zookeeper`中的配置信息发生变化时，通过`Watcher`的回调方法捕获数据变化事件
4. 重新获取配置信息

```java
public class MyConfigCenter implements Watcher {

    // zk 的连接串
    String IP = "192.168.60.130:2181";
    // 计数器对象
    CountDownLatch countDownLatch = new CountDownLatch(1);
    // 连接对象
    static ZooKeeper zooKeeper;

    // 用于本地化存储配置信息
    private String url;
    private String username;
    private String password;

    @Override
    public void process(WatchedEvent event) {
        try {
            // 捕获事件状态
            if (event.getType() == EventType.None) {
                if (event.getState() == Event.KeeperState.SyncConnected) {
                    System.out.println("连接成功");
                    countDownLatch.countDown();
                } else if (event.getState() == Event.KeeperState.Disconnected) {
                    System.out.println("连接断开!");
                } else if (event.getState() == Event.KeeperState.Expired) {
                    System.out.println("连接超时!");
                    // 超时后服务器端已经将连接释放，需要重新连接服务器端
                    zooKeeper = new ZooKeeper("192.168.60.130:2181", 6000,
                            new ZKConnectionWatcher());
                } else if (event.getState() == Event.KeeperState.AuthFailed) {
                    System.out.println("验证失败!");
                }
                // 当配置信息发生变化时
            } else if (event.getType() == EventType.NodeDataChanged) {
                // 重新获取配置信息
                initValue();
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    // 构造方法
    public MyConfigCenter() {
        initValue();
    }
  
    // 连接 Zookeeper 服务器，读取配置信息
    public void initValue() {
        try {
            // 创建连接对象
            zooKeeper = new ZooKeeper(IP, 5000, this);
            // 阻塞线程，等待连接的创建成功
            countDownLatch.await();
            // 读取配置信息
            this.url = new String(zooKeeper.getData("/config/url", true, null));
            this.username = new String(zooKeeper.getData("/config/username", true, null));
            this.password = new String(zooKeeper.getData("/config/password", true, null));
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
  
    public static void main(String[] args) {
        try {
            MyConfigCenter myConfigCenter = new MyConfigCenter();
            for (int i = 1; i <= 20; i++) {
                Thread.sleep(5000);
                System.out.println("url:"+myConfigCenter.getUrl());
                System.out.println("username:"+myConfigCenter.getUsername());
                System.out.println("password:"+myConfigCenter.getPassword());
                System.out.println("######################################");
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }


    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

### 分布式唯一id案例

　　在过去的单库单表型系统中，通常第可以使用数据库字段自带的`auto_ increment`属性来自动为每条记录生成个唯一的`ID`。但是分库分表后，就无法在依靠数据库的`auto_ increment`属性来唯一标识一条记录了。此时我们就可以用`zookeeper`在分布式环境下生成全局唯一`ID`。

```java
public class IdGenerate {

    private static final String IP = "192.168.133.133:2181";
    private static CountDownLatch countDownLatch = new CountDownLatch(1);
    private static ZooKeeper zooKeeper;

    public static String generateId() throws Exception {
        return zooKeeper.create("/id", new byte[0], ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);
    }


    public static void main(String[] args) throws Exception {
        zooKeeper = new ZooKeeper(IP, 5000, new ZKWatcher());
        countDownLatch.await();
        ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(5, 5, 0, TimeUnit.SECONDS, new ArrayBlockingQueue<>(10));
        for (int i = 0; i < 10; i++) {
            threadPoolExecutor.execute(() -> {
                try {
                    System.out.println(generateId());
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }
        TimeUnit.SECONDS.sleep(50);
        threadPoolExecutor.shutdown();
    }

    static class ZKWatcher implements Watcher {
        @Override
        public void process(WatchedEvent watchedEvent) {
            countDownLatch.countDown();
            System.out.println("zk 的监听器" + watchedEvent.getType());
        }
    }
}
```

```java
public class GloballyUniqueId implements Watcher {
    // zk 的连接串
    String IP = "192.168.60.130:2181";
    // 计数器对象
    CountDownLatch countDownLatch = new CountDownLatch(1);
    // 用户生成序号的节点
    String defaultPath = "/uniqueId";
    // 连接对象
    ZooKeeper zooKeeper;

    @Override
    public void process(WatchedEvent event) {
        try {
            // 捕获事件状态
            if (event.getType() == Event.EventType.None) {
                if (event.getState() == KeeperState.SyncConnected) {
                    System.out.println("连接成功");
                    countDownLatch.countDown();
                } else if (event.getState() == KeeperState.Disconnected) {
                    System.out.println("连接断开!");
                } else if (event.getState() == KeeperState.Expired) {
                    System.out.println("连接超时!");
                    // 超时后服务器端已经将连接释放，需要重新连接服务器端
                    zooKeeper = new ZooKeeper(IP, 6000,
                            new ZKConnectionWatcher());
                } else if (event.getState() == KeeperState.AuthFailed) {
                    System.out.println("验证失败!");
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    // 构造方法
    public GloballyUniqueId() {
        try {
            // 打开连接
            zooKeeper = new ZooKeeper(IP, 5000, this);
            // 阻塞线程，等待连接的创建成功
            countDownLatch.await();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    // 生成 id 的方法
    public String getUniqueId() {
        String path = "";
        try {
            // 创建临时有序节点
            path = zooKeeper.create(defaultPath, new byte[0], Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        // /uniqueId0000000001
        return path.substring(9);
    }

    public static void main(String[] args) {
        GloballyUniqueId globallyUniqueId = new GloballyUniqueId();
        for (int i = 1; i <= 5; i++) {
            String id = globallyUniqueId.getUniqueId();
            System.out.println(id);
        }
    }
}
```

### 分布式锁

　　分布式锁有多种实现方式，比如通过数据库、`Redis`都可实现。作为分布式协同工具`Zookeeper`，当然也有着标准的实现方式。下面介绍在`Zookeeper`中如果实现排他锁.

　　设计思路：

1. 每个客户端往`/Locks`下创建临时有序节点`/Locks/Lock_`，创建成功后`/Locks`下面会有每个客户端对应的节点，如`/Locks/Lock_000000001`
2. 客户端取得`/Locks`下子节点，并进行排序，判断排在前面的是否为自己，如果自己的锁节点在第一位，代表获取锁成功
3. 如果自己的锁节点不在第一位，则监听自己前一位的锁节点。例如，自己锁节点`Lock_000000002`，那么则监听`Lock_000000001`
4. 当前一位锁节点`(Lock_000000001)`对应的客户端执行完成，释放了锁，将会触发监听客户端`(Lock_000000002)`的逻辑
5. 监听客户端重新执行第 $2$ 步逻辑，判断自己是否获得了锁
6. `Zookeeper`是有工具包的（这里采用手写）

```java
// 线程测试类
public class ThreadTest {
    public static void delayOperation(){
        try {
            TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    static interface Runable{
        void run();
    }
    public static void run(Runable runable,int threadNum){
        ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(30, 30,
                0, TimeUnit.SECONDS, new ArrayBlockingQueue<>(10));
        for (int i = 0; i < threadNum; i++) {
            threadPoolExecutor.execute(runable::run);
        }
        threadPoolExecutor.shutdown();
    }

    public static void main(String[] args) {
//        DistributedLock distributedLock = new DistributedLock();
//        distributedLock.acquireLock();
//        delayOperation();
//        distributedLock.releaseLock();
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        // 每秒打印信息
        run(() -> {
            for (int i = 0; i < 999999999; i++) {
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                String format = dateTimeFormatter.format(LocalDateTime.now());
                System.out.println(format);
            }
        },1);
        // 线程测试
        run(() -> {
            DistributedLock distributedLock = new DistributedLock();
            distributedLock.acquireLock();
            delayOperation();
            distributedLock.releaseLock();
        },30);
    }
}
public class DistributedLock {
    private String IP = "192.168.133.133:2181";
    private final String ROOT_LOCK = "/Root_Lock";
    private final String LOCK_PREFIX = "/Lock_";
    private final CountDownLatch countDownLatch = new CountDownLatch(1);
    private final byte[] DATA = new byte[0];

    private ZooKeeper zookeeper;
    private String path;

    private void init(){
        // 初始化
        try {
            zookeeper = new ZooKeeper(IP, 200000, w -> {
                if(w.getState() == Watcher.Event.KeeperState.SyncConnected){
                    System.out.println("连接成功");
                }
                countDownLatch.countDown();
            });
            countDownLatch.await();
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    // 暴露的外部方法，主逻辑
    public void acquireLock(){
        init();
        createLock();
        attemptLock();
    }

    // 暴露的外部方法，主逻辑
    public void releaseLock(){
        try {
            zookeeper.delete(path,-1);
            System.out.println("锁释放了" + path);
        } catch (InterruptedException | KeeperException e) {
            e.printStackTrace();
        }
    }

    private void createLock(){
        try {
            // 创建一个目录节点
            Stat root = zookeeper.exists(ROOT_LOCK, false);
            if(root == null)
                zookeeper.create(ROOT_LOCK, DATA, ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
            // 目录下创建子节点
            path = zookeeper.create(ROOT_LOCK + LOCK_PREFIX, DATA, ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);
        } catch (KeeperException | InterruptedException e) {
            e.printStackTrace();
        }
    }
    private Watcher watcher = new Watcher() {
        @Override
        public void process(WatchedEvent watchedEvent) {
            if (watchedEvent.getType() == Event.EventType.NodeDeleted){
                synchronized (this){
                    this.notifyAll();
                }
            }
        }
    };

    private void attemptLock(){
        try {
            // 获取正在排队的节点，由于是 zookeeper 生成的临时节点，不会出错，这里不能加监视器
            // 因为添加了监视器后，任何子节点的变化都会触发监视器
            List<String> nodes = zookeeper.getChildren(ROOT_LOCK,false);
            nodes.sort(String::compareTo);
            // 获取自身节点的排名
            int ranking = nodes.indexOf(path.substring(ROOT_LOCK.length() + 1));
            // 已经是最靠前的节点了，获取锁
            if(ranking == 0){
                return;
            }else {
                // 并不是靠前的锁，监视自身节点的前一个节点
                Stat status = zookeeper.exists(ROOT_LOCK+"/"+nodes.get(ranking - 1), watcher);
                // 有可能这这个判断的瞬间，0号完成了操作(此时我们应该判断成功自旋才对)，但是上面的status变量已经获取了值并且不为空，1号沉睡
                // 但是，请注意自行测试，虽然1号表面上沉睡了，但是实际上watcher.wait()是瞬间唤醒的
                if(status == null){
                    attemptLock();
                }else {
                    synchronized (watcher){
                        watcher.wait();
                    }
                    attemptLock();
                }
            }
        } catch (KeeperException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

```java
public class MyLock {
    // zk 的连接串
    String IP = "192.168.60.130:2181";
    // 计数器对象
    CountDownLatch countDownLatch = new CountDownLatch(1);
    // ZooKeeper 配置信息
    ZooKeeper zooKeeper;
    private static final String LOCK_ROOT_PATH = "/Locks";
    private static final String LOCK_NODE_NAME = "Lock_";
    private String lockPath;

    // 打开 zookeeper 连接
    public MyLock() {
        try {
            zooKeeper = new ZooKeeper(IP, 5000, new Watcher() {
                @Override
                public void process(WatchedEvent event) {
                    if (event.getType() == Event.EventType.None) {
                        if (event.getState() == Event.KeeperState.SyncConnected) {
                            System.out.println("连接成功!");
                            countDownLatch.countDown();
                        }
                    }
                }
            });
            countDownLatch.await();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    // 获取锁
    public void acquireLock() throws Exception {
        // 创建锁节点
        createLock();
        // 尝试获取锁
        attemptLock();
    }

    // 创建锁节点
    private void createLock() throws Exception {
        // 判断 Locks 是否存在，不存在创建
        Stat stat = zooKeeper.exists(LOCK_ROOT_PATH, false);
        if (stat == null) {
            zooKeeper.create(LOCK_ROOT_PATH, new byte[0], ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
        }
        // 创建临时有序节点
        lockPath = zooKeeper.create(LOCK_ROOT_PATH + "/" + LOCK_NODE_NAME, new byte[0], ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);
        System.out.println("节点创建成功:" + lockPath);
    }

    // 监视器对象，监视上一个节点是否被删除
    Watcher watcher = new Watcher() {
        @Override
        public void process(WatchedEvent event) {
            if (event.getType() == Event.EventType.NodeDeleted) {
                synchronized (this) {
                    notifyAll();
                }
            }
        }
    };

    // 尝试获取锁
    private void attemptLock() throws Exception {
        // 获取 Locks 节点下的所有子节点
        List<String> list = zooKeeper.getChildren(LOCK_ROOT_PATH, false);
        // 对子节点进行排序
        Collections.sort(list);
        // /Locks/Lock_000000001
        int index = list.indexOf(lockPath.substring(LOCK_ROOT_PATH.length() + 1));
        if (index == 0) {
            System.out.println("获取锁成功!");
            return;
        } else {
            // 上一个节点的路径
            String path = list.get(index - 1);
            Stat stat = zooKeeper.exists(LOCK_ROOT_PATH + "/" + path, watcher);
            if (stat == null) {
                attemptLock();
            } else {
                synchronized (watcher) {
                    watcher.wait();
                }
                attemptLock();
            }
        }
    }

    // 释放锁
    public void releaseLock() throws Exception {
            // 删除临时有序节点
            zooKeeper.delete(this.lockPath,-1);
            zooKeeper.close();
            System.out.println("锁已经释放:"+this.lockPath);
    }

    public static void main(String[] args) {
        try {
            MyLock myLock = new MyLock();
            myLock.createLock();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
```

```java
public class TicketSeller {

    private void sell(){
        System.out.println("售票开始");
        // 线程随机休眠数毫秒，模拟现实中的费时操作
        int sleepMillis = 5000;
        try {
            // 代表复杂逻辑执行了一段时间
            Thread.sleep(sleepMillis);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("售票结束");
    }

    public void sellTicketWithLock() throws Exception {
        MyLock lock = new MyLock();
        // 获取锁
        lock.acquireLock();
        sell();
        // 释放锁
        lock.releaseLock();
    }
    public static void main(String[] args) throws Exception {
        TicketSeller ticketSeller = new TicketSeller();
        for(int i=0;i<10;i++){
            ticketSeller.sellTicketWithLock();
        }
    }
}
```

# 集群搭建

　　`zookeeper`官网——`Getting started`——[zookeeper 官网](https://zookeeper.apache.org/doc/r3.4.14/zookeeperStarted.html#sc_RunningReplicatedZooKeeper)

　　完全配置——[完全配置1](https://zookeeper.apache.org/doc/r3.4.14/zookeeperAdmin.html#sc_zkMulitServerSetup)——[完全配置2](https://zookeeper.apache.org/doc/r3.4.14/zookeeperAdmin.html#sc_configuration)

　　运行时复制的`Zookeeper`。

　　**说明**：对于复制模式，至少需要三个服务器，并且强烈建议使用奇数个服务器。如果只有两台服务器，那么您将处于一种情况，如果其中一台服务器发生故障，则没有足够的计算机构成多数仲裁（`zk`采用的是过半数仲裁。因此，搭建的集群要容忍 $n$ 个节点的故障，就必须有 2n+1 台计算机，这是因为宕掉 n 台后，集群还残余 n+1 台计算机，n+1 台计算机中必定有一个最完整最接近`leader`的`follower`，假如宕掉的 n 台都是有完整信息的，剩下的一台就会出现在残余的`zk`集群中。也就是说：`zk`为了安全，必须达到多数仲裁，否则没有`leader`，集群失败，具体体现在`**leader**`**选举**一章）。由于存在两个单点故障，因此两个服务器还**不如**单个服务器稳定。

　　——关于 2n+1 原则，`Kafka`官网有权威的解释（虽然`Kafka`不采用）[设计原则](http://kafka.apache.org/0110/documentation.html#design_replicatedlog)

　　多数仲裁的设计是为了**避免脑裂**（`zk`已经采用了多数仲裁，所以不会出现），和数据一致性的问题

* **脑裂**：由于网络延迟等各种因素，最终导致集群一分为二，各自独立运行（两个`leader`），集群就是坏的
* 如果有两台服务器，两台都认为另外的`zk`宕掉，各自成为`leader`运行（假设可以，实际上选不出`leader`，可以实际搭建一个集群，看看一台zk是否能够成功集群，详见**`leader`****选举**），就会导致数据不一致。
* 如果有三台服务器，一台因为网络分区，无法连接，剩下两台网络正常，选举出了`leader`，集群正常
* 以此类推

  ![](https://cdn.jsdelivr.net/gh/1coins/assets/zookeeper-summary/zookeeper-cluster.png)

  `zk`的设计天生就是`cap`中的`cp`，所以不会出现上述的脑裂和数据一致性问题，我们搭建`zk`仅需保证`2n+1`原则

　　复制模式所需的`conf / zoo.cfg`文件类似于独立模式下使用的文件，但有一些区别。这是一个例子：

```conf
tickTime=2000
dataDir=/var/lib/zookeeper
clientPort=2181
initLimit=5
syncLimit=2
server.1=zoo1:2888:3888 # 这是多机部署
server.2=zoo2:2888:3888
server.3=zoo3:2888:3888
```

- 新的键值`initLimit`是`zookeeper`用于限制选举中`zookeeper`服务连接到`leader`的时间，**`syncLimit`**限制服务器与`leader`的过期时间
- 对于这两个超时，您都可以使用`tickTime`指定时间单位。在此示例中，`initLimit`的超时为 5 个滴答声，即`2000`毫秒/滴答声，即 10 秒
- 表格`server.X`的条目列出了组成`ZooKeeper`服务的服务器。服务器启动时，它通过在数据目录中查找文件`myid`来知道它是哪台服务器。该文件包含`ASCII`的服务器号。
- 最后，记下每个服务器名称后面的两个端口号：2888 和 3888。对等方使用前一个端口连接到其他对等方。这种连接是必需的，以便对等方可以进行通信，例如，以商定更新顺序。更具体地说，**`ZooKeeper`****服务器使用此端口将****`follower`****连接到****`leader`**。当出现新的`leader`者时，`follower`使用此端口打开与`leader`的`TCP`连接。因为默认的`leader`选举也使用`TCP`，所以我们当前需要另一个端口来进行`leader`选举。这是第二个端口。

　　**正文**搭建：单机环境下，`jdk`、`Zookeeper`安装完毕，基于一台虚拟机，进行`Zookeeper`**伪集群搭建**，`Zookeeper`集群中包含 3 个节点，节点对外提供服务端口号，分别为 2181、2182、2183。

1. 基于`zookeeper-3.4.10`复制三份`zookeeper`安装好的服务器文件,目录名称分别为`zookeeper2181`、`zookeeper2182`、`zookeeper2183`

   ```bash
   cp -r zookeeper-3.4.10  zookeeper2181
   cp -r zookeeper-3.4.10  zookeeper2182
   cp -r zookeeper-3.4.10  zookeeper2183

   # cp -r zookeeper-3.1.10 ./zookeeper218{1..3}
   ```
2. 修改`zookeeper2181`服务器对应配置文件

   ```conf
   # 服务器对应端口号
   clientPort=2181
   # 数据快照文件所在路径
   dataDir=/opt/zookeeper2181/data
   # 集群配置信息
      # server:A=B:C:D
      # A:是一个数字，表示这个是服务器的编号
      # B:是这个服务器的ip地址
      # C:Zookeeper服务器之间通信的端口(数据互通，必须的)
      # D:Leader选举的端口
   server.1=192.168.133.133:2287:3387  # 这是伪集群部署，注意端口号  
   server.2=192.168.133.133:2288:3388
   server.3=192.168.133.133:2289:3389
   # 对，这些都是2181的配置文件
   ```
3. 在上一步`dataDir`指定的目录下，创建`myid`文件，然后在该文件添加上一步`server`配置的对应`A`数字

   ```bash
   # zookeeper2181 对应的数字为 1
   # /opt/zookeeper2181/data目录(即dataDir的目录下)下执行命令
   echo "1" > myid
   ```
4. `zookeeper2182、2183`参照 2/3 进行相应配置
5. 分别启动三台服务器，检验集群状态
   检查：`cd`进入`bin`目录`./zkServer status`
   登录命令：

   ```bash
   ./zkCli.sh -server 192.168.60.130:2181
   ./zkCli.sh -server 192.168.60.130:2182
   ./zkCli.sh -server 192.168.60.130:2183
   # 如果启动后没有显示出集群的状态，请自己检查端口和配置文件问题，主要是端口占用和配置文件问题
   # ss -lntpd | grep 2181
   ```

## 一致性协议——zab 协议

　　`zab`协议的全称是`Zookeeper Atomic Broadcast`（`Zookeeper`原子广播）。`Zookeeper`是通过`zab`协议来保证分布式事务的最终一致性

　　基于`zab`协议，`Zookeeper`集群中的角色主要有以下三类，如下所示：

|角色|描述|
| ----------------------------------| --------------------------------------------------------------------------------------------------------------------------------------------------------|
|领导者(Leader)|领导者负责进行投票的发起和决议，更新系统状态|
|学习者(Learner)-跟随者(Follower)|Follower 用于接收客户端请求并向客户端返回结果，在选主过程中参与投票|
|学习者(Learner)-观察者(ObServer)|ObServer 可以接收客户端连接，将写请求转发给 leader 节点。但 ObServer 不参加投票过程，只同步 leader 的状态。ObServer 的目的是为了扩展系统，提高读取速度|
|客户端(Client)|请求发起方|

　　`zab`广播模式工作原理，通过类似两端式提交协议的方式解决数据一致性：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/zookeeper-summary/zab-broadcast.png)

1. `leader`从客户端收**到一个写请求**
2. `leader`**生成一个新的事务**并为这个事务生成一个唯一的`ZXID`
3. `leader`**将事务提议（****`propose`****）发送给所有的****`follows`****节点**
4. `follower`节点将收到的事务请求加入到本地**历史队列（****`history queue`****）中，并发送****`ack`****给****`leader`**，表示确认提议
5. 当`leader`收到大多数`follower`（**半数以上节点**）的`ack(acknowledgement)`确认消息，`leader`会本地提交，并发送`commit`请求
6. 当`follower`**收到****`commit`****请求时，从历史队列中将事务请求****`commit`**

　　因为是半数以上的结点就可以通过事务请求，所以延迟不高。

## leader 选举

### 服务器状态

- `looking`：寻找`leader`状态。当服务器处于该状态时，它会认为当前集群中没有`leader`，因此需要进入`leader`选举状态
- `following`：跟随着状态。表明当前服务器角色是`follower`
- `observing`：观察者状态。表明当前服务器角色是`observer`

　　分为两种选举，**服务器启动时的选举**和**服务器运行时期的选举。**

#### 服务器启动时期的 leader 选举

　　在集群初始化节点，当有一台服务器`server1`启动时，其**单独无法进行和完成****`leader`****选举**，当第二台服务器`server2`启动时，此时两台及其可以相互通信，每台及其都试图找到`leader`，**于是进入****`leader`****选举过程**。选举过程如下：

1. 每个`server`发出一个投票

    由于是初始状态，`server1`和`server2`都会将自己作为`leader`服务器来进行投票，每次投票都会包**含所推举的****`myid`****和****`zxid`****，使用****`(myid，zxid)`**，此时`server1`的投票为 (1, 0)，`server2`的投票为 (2, 0)，然后**各自将这个投票发给集群中的其它机器。**
2. 集群中的**每台服务器都接收来自集群中各个服务器的投票**
3. **处理投票**

    针对每一个投票，服务器都需要将别人的投票和自己的投票进行`pk`，规则如下：

    * 优先检查`zxid`。`zxid`比较大的服务器优先作为`leader`（**`zxid`****较大者保存的数据更多**）
    * 如果`zxid`相同。那么就比较`myid`。`myid`较大的服务器作为`leader`服务器  
      **对于 server1** **而言，它的投票是 (1, 0)，接收 server2** **的投票为 (2, 0)，**首先会比较两者的`zxid`**，均为 0，**再比较`myid`**，此时 server2 的****`myid`****最大，于是更新自己的投票为 (2, 0)**，然后重新投票，**对于 server2 而言，无需更新自己的投票**，只是再次向集群中所有机器发出上一次投票信息即可
4. **统计投票**
5. 每次投票后，服务器都会统计投票信息，判断是否已经有**过半机器接受到相同的投票信息**，对于 server1、server2 而言，都统计出集群中已经有两台机器接受了 (2, 0) 的投票信息，此时便认为已经选举出了`leader`
6. **改变服务器状态**。一旦确定了`leader`,每个服务器就会更新自己的状态，如果是`follower`，那么就变更为`following`，如果是`leader`，就变更为`leading`

　　**举例：如果我们有三个节点的集群，1, 2, 3，启动 1 和 2 后，2 一定会是 ****`leader`****，******** 再加入不会进行选举，而是直接成为****`follower`**—— 仔细观察 一台`zk`无法集群，没有`leader`。

#### 服务器运行时期选举

　　在`zookeeper`运行期间，`leader`与非`leader`服务器各司其职，即使当有非`leader`服务器宕机或者新加入，此时也不会影响`leader`，但是一旦`leader`服务器挂了，那么整个集群将暂停对外服务，进入新一轮`leader`选举，其过程和启动时期的`leader`选举过程基本一致。

　　假设正在运行的有`server1`、`server2`、`server3`三台服务器，当前`leader`是`server2`，若某一时刻`leader`挂了，此时便开始`Leader`选举。选举过程如下：

1. 变更状态。**`leader`****挂后，余下的服务器都会将自己的服务器状态变更为****`looking`**，然后开始进入`leader`选举过程
2. 每个`server`发出一个投票。在运行期间，**每个服务器上的****`zxid`****可能不同**，此时假定`server1`的`zxid`为`122`，`server3`的`zxid`为`122`，**在第一轮投票中，****`server1`****和****`server3`****都会投自己**，产生投票 (1, 122), (3, 122)，然后**各自将投票发送给集群中所有机器**
3. **接收来自各个服务器的投票**。与启动时过程相同
4. **处理投票**。与启动时过程相同，此时，`server3`将会成为`leader`
5. **统计投票**。与启动时过程相同
6. **改变服务器的状态**。与启动时过程相同

### observer 角色及其配置

　　`zookeeper`官网——`Observers Guide`[observer 详解](https://zookeeper.apache.org/doc/r3.4.14/zookeeperObservers.html)。

　　尽管`ZooKeeper`通过使用客户端直接连接到该集合的投票成员表现良好，但是此体系结构使其很难扩展到大量客户端。问题在于，随着我们添加更多的投票成员，写入性能会下降。这是由于以下事实：写操作需要（通常）集合中至少一半节点的同意，因此，随着添加更多的投票者，投票的成本可能会显着增加。

　　我们引入了一种称为`Observer`的新型`ZooKeeper`节点，该节点有助于解决此问题并进一步提高`ZooKeeper`的可伸缩性。观察员是合法的非投票成员，他们仅听取投票结果，而听不到投票结果。除了这种简单的区别之外，观察者的功能与跟随者的功能完全相同-客户端可以连接到观察者，并向其发送读写请求。观察者像追随者一样将这些请求转发给领导者，但是他们只是等待听取投票结果。因此，我们可以在不影响投票效果的情况下尽可能增加观察员的数量。

　　观察者还有其他优点。因为他们不投票，所以它们不是`ZooKeeper`选举中的关键部分。因此，它们可以在不损害`ZooKeeper`服务可用性的情况下发生故障或与群集断开连接。给用户带来的好处是，观察者可以通过比跟随者更不可靠的网络链接进行连接。实际上，观察者可用于与另一个数据中心的`ZooKeeper`服务器进行对话。观察者的客户端将看到快速读取，因为所有读取均在本地提供，并且由于缺少表决协议而需要的消息数量较小，因此写入会导致网络流量最小

　　`ovserver`角色**特点**：

1. **不参与集群的****`leader`****选举**
2. **不参与集群中写数据时的****`ack`****反馈**

　　为了使用`observer`角色，在任何想变成`observer`角色的配置文件中加入如下配置：

```bash
peerType=observer
```

　　并在所有`server`的配置文件中，配置成`observer`模式的`server`的那行配置追加`:observer`，例如：

```shell
server.1=192.168.133.133:2287:3387  # 注意端口号  
server.2=192.168.133.133:2288:3388
server.3=192.168.133.133:2289:3389:observer
```

　　注意` 2n+1`原则——`集群搭建`

### API 连接集群

　　`Zookeeper(String connectionString, int sessionTimeout, Watcher watcher)`

- `connectionString ` ：`Zookeeper`集合主机
- `sessionTimeout`：会话超时(以毫秒为单位)
- `watcher `：实现“监听器”界面的对象，`Zookeeper`集合通过监视器对象返回连接状态

```java
public static void main(String[] args) throws Exception {
        CountDownLatch countDownLatch = new CountDownLatch(1);
        ZooKeeper connection = new ZooKeeper("192.168.133.133:2181,192.168.133.133:2182,192.168.133.133:2183", 5000, watchedEvent -> {
            if (watchedEvent.getState() == Watcher.Event.KeeperState.SyncConnected)
                System.out.println("连接成功");
            countDownLatch.countDown();
        });
        countDownLatch.await();
        connection.create("/hadoop",new byte[0], ZooDefs.Ids.OPEN_ACL_UNSAFE,CreateMode.PERSISTENT);
        System.out.println(connection.getSessionId());
}
```

## Curator 介绍

　　[curator 介绍](https://blog.csdn.net/wo541075754/article/details/68067872)

　　`zkClient `有对`dubbo`的一些操作支持，但是`zkClient`几乎没有文档，下面是`curator`。

### Curator 简介

　　`Curator`是`Netflix`公司开源的一个`Zookeeper`客户端，后捐献给`Apache`，`Curator`框架在`Zookeeper`原生`API`接口上进行了包装，解决了很多`ZooKeeper`客户端非常底层的细节开发，提供`ZooKeeper`各种应用场景（比如：分布式锁服务、集群领导选举、共享计数器、缓存机制、分布式队列等的抽象封装），实现了`Fluent`风格的`APl`接口，是最好用，最流行的`Zookeeper`的客户端。

　　原生`Zookeeper API`的不足：

- 连接对象异步创建，需要开发人员自行编码等待
- 连接没有自动重连超时机制
- `Watcher`一次注册生效一次
- 不支持递归创建树形节点

　　`Curator`特点：

- 解决`session`会话超时重连
- `Watcher`反复注册
- 简化开发`API`
- 遵循`Fluent`风格`API`

```xml
<!-- Zookeeper -->
<dependency>
    <groupId>org.apache.zookeeper</groupId>
    <artifactId>zookeeper</artifactId>
    <version>3.4.10</version>
</dependency>
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-framework</artifactId>
    <version>2.6.0</version>
    <exclustions>
        <exclustion>
            <groupId>org.apache.zookeeper</groupId>
            <artifactId>zookeeper</artifactId>
        </exclustion>
    </exclustions>
</dependency>
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-recipes</artifactId>
    <version>2.6.0</version>
</dependency>
```

### 基础用法

```java
public class CuratorConnection {
    public static void main(String[] args) {
        // 工厂创建，fluent 风格
        CuratorFramework client = CuratorFrameworkFactory.builder()
                // ip 端口号
                .connectString("192.168.133.133:2181,192.168.133.133:2182,192.168.133.133:2183")
                // 会话超时
                .sessionTimeoutMs(5000)
                // 重试机制，这里是超时后 1000 毫秒重试一次
                .retryPolicy(new RetryOneTime(1000))
                // 名称空间，在操作节点的时候，会以这个为父节点
                .namespace("create")
                .build();
        // 打开连接  
        client.start();
        System.out.println(client.getState());
        // 关闭连接
        client.close();
    }
}
```

　　`session`重连策略：

* `RetryPolicy retry Policy = new RetryOneTime(3000);`

  说明：三秒后重连一次，只重连一次
* `RetryPolicy retryPolicy = new RetryNTimes(3,3000);`

  说明：每三秒重连一次，重连三次
* `RetryPolicy retryPolicy = new RetryUntilElapsed(1000,3000);`

  说明：每三秒重连一次，总等待时间超过个`10`秒后停止重连
* `RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000,3)`

  说明：这个策略的重试间隔会越来越长

  公式：`baseSleepTImeMs * Math.max(1,random.nextInt(1 << (retryCount + 1)))`

  * `baseSleepTimeMs` = `1000` 例子中的值
  * `maxRetries` = `3` 例子中的值

```java
public class CuratorConnection {
    public static void main(String[] args) {
        // session 重连策略
        /*
            3 秒后重连一次，只重连 1 次
            RetryPolicy retryPolicy = new RetryOneTime(3000);
        */
        /*
            每 3 秒重连一次，重连 3 次
            RetryPolicy retryPolicy = new RetryNTimes(3,3000);
        */
       /*
            每 3 秒重连一次，总等待时间超过 10 秒后停止重连
            RetryPolicy retryPolicy=new RetryUntilElapsed(10000,3000);
       */
        // 随着重连次数增加，重连间隔也会增长
        // 重连间隔计算公式：baseSleepTimeMs * Math.max(1, random.nextInt(1 << (retryCount + 1)))
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);

        // 工厂创建，fluent 风格
        // 创建连接对象
        CuratorFramework client= CuratorFrameworkFactory.builder()
                // IP 地址端口号
                .connectString("192.168.60.130:2181,192.168.60.130:2182,192.168.60.130:2183")
                // 会话超时时间
                .sessionTimeoutMs(5000)
                // 重连机制，这里是超时后 1000 毫秒重试一次
                .retryPolicy(retryPolicy)
                // 命名空间，在操作节点的时候，会以这个为父节点
                .namespace("create")
                // 构建连接对象
                .build();
        // 打开连接
        client.start();
        System.out.println(client.isStarted());
        // 关闭连接
        client.close();
    }
}
```

#### 创建

```java
public class CuratorCreate {

    String IP = "192.168.60.130:2181,192.168.60.130:2182,192.168.60.130:2183";
    CuratorFramework client;

    @Before
    public void before() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);
        client = CuratorFrameworkFactory.builder()
                .connectString(IP)
                .sessionTimeoutMs(5000)
                .retryPolicy(retryPolicy)
                .namespace("create")
                .build();
        client.start();
    }

    @After
    public void after() {
        client.close();
    }

    /**
     * ids权限
     * @throws Exception
     */
    @Test
    public void create1() throws Exception {
        // 新增节点
        client.create()
                // 节点的类型
                .withMode(CreateMode.PERSISTENT)
                // 节点的权限列表 world:anyone:cdrwa
                .withACL(ZooDefs.Ids.OPEN_ACL_UNSAFE)
                // arg1：节点路径，arg2：节点数据
                .forPath("/node1", "node1".getBytes());
        System.out.println("结束");
    }

    /**
     * 自定义权限列表
     * @throws Exception
     */
    @Test
    public void create2() throws Exception {
        // 权限列表
        List<ACL> list = new ArrayList<ACL>();
        // 授权模式和授权对象
        Id id = new Id("ip", "192.168.60.130");
        list.add(new ACL(ZooDefs.Perms.ALL, id));
        // 新增节点
        client.create()
                // 节点的类型
                .withMode(CreateMode.PERSISTENT)
                // 节点的 acl 权限列表
                .withACL(list)
                // arg1：节点路径，arg2：节点数据
                .forPath("/node2", "node2".getBytes());
        System.out.println("结束");
    }

    /**
     * 递归创建
     * @throws Exception
     */
    @Test
    public void create3() throws Exception {
        // 递归创建节点树
        client.create()
                // 递归节点的创建
                .creatingParentsIfNeeded()
                // 节点的类型
                .withMode(CreateMode.PERSISTENT)
                // 节点的 acl 权限列表
                .withACL(ZooDefs.Ids.OPEN_ACL_UNSAFE)
                // arg1：节点路径，arg2：节点数据
                .forPath("/node3/node31", "node31".getBytes());
        System.out.println("结束");
    }

    /**
     * 异步方式创建节点
     * @throws Exception
     */
    @Test
    public void create4() throws Exception {
        // 新增节点
        client.create()
                .creatingParentsIfNeeded()
                // 节点的类型
                .withMode(CreateMode.PERSISTENT)
                // 节点的 acl 权限列表
                .withACL(ZooDefs.Ids.OPEN_ACL_UNSAFE)
                // 异步回调接口
                .inBackground(new BackgroundCallback() {
                     public void processResult(CuratorFramework curatorFramework, CuratorEvent curatorEvent) throws Exception {
                         System.out.println("异步创建成功");
                         // 节点的路径
                         System.out.println(curatorEvent.getPath());
                         // 时间类型
                         System.out.println(curatorEvent.getType());
                     }
        })
                // arg1：节点路径，arg2：节点数据
                .forPath("/node4","node4".getBytes());
        Thread.sleep(5000);
        System.out.println("结束");
    }
}
```

#### 修改

```java
public class CuratorSet {

    String IP = "192.168.60.130:2181,192.168.60.130:2182,192.168.60.130:2183";
    CuratorFramework client;

    @Before
    public void before() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);
        client = CuratorFrameworkFactory.builder()
                .connectString(IP)
                .sessionTimeoutMs(5000)
                .retryPolicy(retryPolicy)
                .namespace("set").build();
        client.start();
    }

    @After
    public void after() {
        client.close();
    }

    /**
     * 修改节点
     * @throws Exception
     */
    @Test
    public void set1() throws Exception {
        // 更新节点
        client.setData()
                // arg1: 节点的路径
                // arg2: 节点的数据
                .forPath("/node1", "node11".getBytes());
        System.out.println("结束");
    }

    /**
     * 指定版本号修改节点
     * @throws Exception
     */
    @Test
    public void set2() throws Exception {
        client.setData()
                // 指定版本号
                .withVersion(2)
                .forPath("/node1", "node1111".getBytes());
        System.out.println("结束");
    }

    /**
     * 异步方式修改节点数据
     * @throws Exception
     */
    @Test
    public void set3() throws Exception {
        // 异步方式修改节点数据
        client.setData()
                .withVersion(-1)
                // 异步
                .inBackground(new BackgroundCallback() {
                    public void processResult(CuratorFramework curatorFramework, CuratorEvent curatorEvent) throws Exception {
                        // 节点的路径
                        System.out.println(curatorEvent.getPath());
                        // 事件的类型
                        System.out.println(curatorEvent.getType());
                    }
                }).forPath("/node1", "node1".getBytes());
        Thread.sleep(5000);
        System.out.println("结束");
    }
}
```

#### 删除

```java
public class CuratorDelete {

    String IP = "192.168.60.130:2181,192.168.60.130:2182,192.168.60.130:2183";
    CuratorFramework client;

    @Before
    public void before() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);
        client = CuratorFrameworkFactory.builder()
            .connectString(IP)
                .sessionTimeoutMs(10000)
                .retryPolicy(retryPolicy)
                .namespace("delete").build();
        client.start();
}

    @After
    public void after() {
        client.close();
    }

    /**
     * 删除节点
     * @throws Exception
     */
    @Test
    public void delete1() throws Exception {
       // 删除节点
        client.delete()
                // 节点的路径
                .forPath("/node1");
        System.out.println("结束");
    }

    /**
     * 带版本号删除节点
     * @throws Exception
     */
    @Test
    public void delete2() throws Exception {
        client.delete()
                // 版本号
                .withVersion(0)
                .forPath("/node1");
        System.out.println("结束");
    }

    /**
     * 删除包含字节点的节点
     * @throws Exception
     */
    @Test
    public void delete3() throws Exception {
        // 删除包含字节点的节点
        client.delete()
                .deletingChildrenIfNeeded()
                .withVersion(-1)
                .forPath("/node1");
        System.out.println("结束");
    }

    /**
     * 异步方式删除节点
     * @throws Exception
     */
    @Test
    public void delete4() throws Exception {
        // 异步方式删除节点
        client.delete()
                .deletingChildrenIfNeeded()
                .withVersion(-1)
                .inBackground(new BackgroundCallback() {
                    public void processResult(CuratorFramework curatorFramework, CuratorEvent curatorEvent) throws Exception {
                        // 节点路径
                        System.out.println(curatorEvent.getPath());
                        // 事件类型
                        System.out.println(curatorEvent.getType());
                    }
                })
                .forPath("/node1");
        Thread.sleep(5000);
        System.out.println("结束");
    }
}
```

#### 读取节点

```java
public class CuratorGet {

    String IP = "192.168.60.130:2181,192.168.60.130:2182,192.168.60.130:2183";
    CuratorFramework client;

    @Before
    public void before() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);
        client = CuratorFrameworkFactory.builder()
                .connectString(IP)
                .sessionTimeoutMs(10000).retryPolicy(retryPolicy)
                .namespace("get").build();
        client.start();
    }

    @After
    public void after() {
        client.close();
    }

    /**
     * 获取数据
     * @throws Exception
     */
    @Test
    public void get1() throws Exception {
        // 读取节点数据
        byte [] bys=client.getData()
                 // 节点的路径
                .forPath("/node1");
        System.out.println(new String(bys));
    }

    /**
     * 读取数据时读取节点的属性
     * @throws Exception
     */
    @Test
    public void get2() throws Exception {
        // 读取数据时读取节点的属性
        Stat stat=new Stat();
        byte [] bys=client.getData()
                // 读取属性
                .storingStatIn(stat)
                .forPath("/node1");
        System.out.println(new String(bys));
        System.out.println(stat.getVersion());
        System.out.println(stat.getCzxid());
    }

    /**
     * 异步方式读取节点的数据
     * @throws Exception
     */
    @Test
    public void get3() throws Exception {
        // 异步方式读取节点的数据
        client.getData()
                 .inBackground(new BackgroundCallback() {
                     public void processResult(CuratorFramework curatorFramework, CuratorEvent curatorEvent) throws Exception {
                         // 节点的路径
                         System.out.println(curatorEvent.getPath());
                         // 事件类型
                         System.out.println(curatorEvent.getType());
                         // 数据
                         System.out.println(new String(curatorEvent.getData()));
                     }
                 })
                .forPath("/node1");
        Thread.sleep(5000);
        System.out.println("结束");
    }
}
```

#### 读取子节点

```java
public class CuratorGetChild {


    String IP = "192.168.60.130:2181,192.168.60.130:2182,192.168.60.130:2183";
    CuratorFramework client;

    @Before
    public void before() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);
        client = CuratorFrameworkFactory.builder()
                .connectString(IP)
                .sessionTimeoutMs(10000).retryPolicy(retryPolicy)
                .build();
        client.start();
    }

    @After
    public void after() {
        client.close();
    }

    /**
     * 获取数据
     * @throws Exception
     */
    @Test
    public void getChild1() throws Exception {
        // 读取子节点数据
        List<String> list = client.getChildren()
                // 节点路径
                .forPath("/get");
        for (String str : list) {
            System.out.println(str);
        }
    }

    /**
     * 异步方式读取子节点数据
     * @throws Exception
     */
    @Test
    public void getChild2() throws Exception {
        // 异步方式读取子节点数据
        client.getChildren()
                .inBackground(new BackgroundCallback() {
                    public void processResult(CuratorFramework curatorFramework, CuratorEvent curatorEvent) throws Exception {
                        // 节点路径
                        System.out.println(curatorEvent.getPath());
                        // 事件类型
                        System.out.println(curatorEvent.getType());
                        // 读取子节点数据
                        List<String> list=curatorEvent.getChildren();
                        for (String str : list) {
                            System.out.println(str);
                        }
                    }
                })
                .forPath("/get");
        Thread.sleep(5000);
        System.out.println("结束");
    }
}
```

#### 是否存在

```java
public class CuratorExists {

    String IP = "192.168.60.130:2181,192.168.60.130:2182,192.168.60.130:2183";
    CuratorFramework client;

    @Before
    public void before() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);
        client = CuratorFrameworkFactory.builder()
                .connectString(IP)
                .sessionTimeoutMs(10000).retryPolicy(retryPolicy)
                .namespace("get").build();
        client.start();
    }

    @After
    public void after() {
        client.close();
    }

    @Test
    public void exists1() throws Exception {
        // 判断节点是否存在
       Stat stat= client.checkExists()
                 // 节点路径
                .forPath("/node2");
        System.out.println(stat.getVersion());
    }

    @Test
    public void exists2() throws Exception {
        // 异步方式判断节点是否存在
        client.checkExists()
                 .inBackground(new BackgroundCallback() {
                     public void processResult(CuratorFramework curatorFramework, CuratorEvent curatorEvent) throws Exception {
                         // 节点路径
                         System.out.println(curatorEvent.getPath());
                         // 事件类型
                         System.out.println(curatorEvent.getType());
                         System.out.println(curatorEvent.getStat().getVersion());
                     }
                 })
                .forPath("/node2");
        Thread.sleep(5000);
        System.out.println("结束");
    }
}
```

#### Watcher

　　`Curator`提供了两种`Watcher(Cache)`来监听节点变化

* `Node Cache`：只是监听某一个特定的节点，监听节点的新增和修改
* `PathChildren Cache`：监控一个`ZNode`的子节点。当一个子节点增加、更新、删除时，`Path Cache`会改变它的状态，会包含最新的子节点、子节点的数据和状态

```java
public class CuratorWatcher {

    String IP = "192.168.60.130:2181,192.168.60.130:2182,192.168.60.130:2183";
    CuratorFramework client;

    @Before
    public void before() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);
        client = CuratorFrameworkFactory
                .builder()
                .connectString(IP)
                .sessionTimeoutMs(10000)
                .retryPolicy(retryPolicy)
                .build();
        client.start();
    }

    @After
    public void after() {
        client.close();
    }


    @Test
    public void watcher1() throws Exception {
        // 监视某个节点的数据变化
        // arg1: 连接对象
        // arg2: 监视的节点路径
       final NodeCache nodeCache=new NodeCache(client,"/watcher1");
        // 启动监视器对象
        nodeCache.start();
        nodeCache.getListenable().addListener(new NodeCacheListener() {
            // 节点变化时回调的方法
            public void nodeChanged() throws Exception {
                // 路径
                System.out.println(nodeCache.getCurrentData().getPath());
                // 输出节点内容
                System.out.println(new String(nodeCache.getCurrentData().getData()));
            }
        });
        // 时间窗内可以一直监听
        Thread.sleep(100000);
        System.out.println("结束");
        //关闭监视器对象
        nodeCache.close();
    }

    @Test
    public void watcher2() throws Exception {
        // 监视子节点的变化
        // arg1: 连接对象
        // arg2: 监视的节点路径
        // arg3: 事件中是否可以获取节点的数据
        PathChildrenCache pathChildrenCache=new PathChildrenCache(client,"/watcher1",true);
        // 启动监听
        pathChildrenCache.start();
        pathChildrenCache.getListenable().addListener(new PathChildrenCacheListener() {
            // 当子节点方法变化时回调的方法
            public void childEvent(CuratorFramework curatorFramework, PathChildrenCacheEvent pathChildrenCacheEvent) throws Exception {
                // 节点的事件类型
                System.out.println(pathChildrenCacheEvent.getType());
                // 节点的路径
                System.out.println(pathChildrenCacheEvent.getData().getPath());
                // 节点数据
                System.out.println(new String(pathChildrenCacheEvent.getData().getData()));
            }
        });
        // 时间窗内可以一直监听
        Thread.sleep(100000);
        System.out.println("结束");
        // 关闭监听
        pathChildrenCache.close();
    }
}
```

#### 事务

```java
public class CuratorTransaction {

    String IP = "192.168.60.130:2181,192.168.60.130:2182,192.168.60.130:2183";
    CuratorFramework client;

    @Before
    public void before() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);
        client = CuratorFrameworkFactory.builder()
                .connectString(IP)
                .sessionTimeoutMs(10000).retryPolicy(retryPolicy)
                .namespace("create").build();
        client.start();
    }

    @After
    public void after() {
        client.close();
    }

    @Test
    public void tra1() throws Exception {
        // 开启事务
        client.inTransaction()
                .create().forPath("/node1","node1".getBytes())
                .and()
                .create().forPath("/node2","node2".getBytes())
                .and()
                //事务提交
                .commit();
    }

    @Test
    public void tra2() throws Exception{
        /*
        client.inTransaction()
                .create()
                    .withMode(CreateMode.PERSISTENT)
                    .withACL(ZooDefs.Ids.OPEN_ACL_UNSAFE)
                    .forPath("/transaction",new byte[0])
                .and()
                .setData()
                    .forPath("/setData/transaction",new byte[0])
                .and()
                .commit();
        */
        client.create()
                .withMode(CreateMode.PERSISTENT)
                .withACL(ZooDefs.Ids.OPEN_ACL_UNSAFE)
                .forPath("/transaction",new byte[0]);
        client.setData()
                .forPath("/setData/transaction",new byte[0]);
    }
}
```

#### 分布式锁

- `InterProcessMutex`：分布式可重入排它锁
- `InterProcessReadWriteLock`：分布式读写锁

```java
public class CuratorLock {

    String IP = "192.168.60.130:2181,192.168.60.130:2182,192.168.60.130:2183";
    CuratorFramework client;

    @Before
    public void before() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);
        client = CuratorFrameworkFactory
                .builder()
                .connectString(IP)
                .sessionTimeoutMs(10000)
                .retryPolicy(retryPolicy)
                .build();
        client.start();
    }

    @After
    public void after() {
        client.close();
    }

    /**
     * 排他锁
     * @throws Exception
     */
    @Test
    public void lock1() throws Exception {
        System.out.println("排他锁");
        // 排他锁，当两个排他锁对象指向同一个路径时，代表这两个排他锁对象是只有同一爸说
        // arg1: 连接对象
        // arg2: 节点路径
        InterProcessLock interProcessLock = new InterProcessMutex(client, "/lock1");
        System.out.println("等待获取锁对象!");
        // 获取锁
        // 开启两个进程测试，会发现：如果一个分布式排它锁获取了锁，那么直到锁释放为止数据都不会被侵扰
        interProcessLock.acquire();
        for (int i = 1; i <= 10; i++) {
            Thread.sleep(3000);
            System.out.println(i);
        }
        // 释放锁
        interProcessLock.release();
        System.out.println("等待释放锁!");
    }

    /**
     * 读写锁
     * @throws Exception
     */
    @Test
    public void lock2() throws Exception {
        System.out.println("写锁");
        // 读写锁
        InterProcessReadWriteLock interProcessReadWriteLock=new InterProcessReadWriteLock(client, "/lock1");
        // 获取读锁对象
        InterProcessLock interProcessLock=interProcessReadWriteLock.readLock();
        System.out.println("等待获取锁对象!");
        // 获取锁
        // 开启两个进程测试，观察到写写互斥，特性同排它锁
        interProcessLock.acquire();
        for (int i = 1; i <= 10; i++) {
            Thread.sleep(3000);
            System.out.println(i);
        }
        // 释放锁
        interProcessLock.release();
        System.out.println("等待释放锁!");
    }

    /**
     * 读写锁
     * @throws Exception
     */
    @Test
    public void lock3() throws Exception {
        System.out.println("读锁");
        // 读写锁
        InterProcessReadWriteLock interProcessReadWriteLock=new InterProcessReadWriteLock(client, "/lock1");
        // 获取写锁对象
        InterProcessLock interProcessLock=interProcessReadWriteLock.writeLock();
        System.out.println("等待获取锁对象!");
        // 获取锁
        // 开启两个进程测试，观察得到读读共享，两个进程并发进行，注意并发和并行是两个概念，(并发是线程启动时间段不一定一致，并行是时间轴一致的)
        // 再测试两个进程，一个读，一个写，也会出现互斥现象
        interProcessLock.acquire();
        for (int i = 1; i <= 10; i++) {
            Thread.sleep(3000);
            System.out.println(i);
        }
        // 释放锁
        interProcessLock.release();
        System.out.println("等待释放锁!");
    }
}
```

### 四字监控命令/配置属性

　　`Zookeeper`文档——`administrator's Guide`——[四字命令](https://zookeeper.apache.org/doc/r3.4.14/zookeeperAdmin.html#sc_zkCommands) [配置属性](https://zookeeper.apache.org/doc/r3.4.14/zookeeperAdmin.html#sc_configuration)。

　　`Zookeeper`支持某些特定的四字命令与其的交互。它们大多数是查询命令，用来获取`Zookeeper`服务的当前状态及相关信息。用户再客户端可以通过`telnet`或`nc`向`Zookeeper`提交相应的命令。

　　`Zookeeper`常用四字命令见下表所示：

|命令|描述|
| ----------| ----------------------------------------------------------------------------------------------------------------------------------------------------|
|conf|输出相关服务配置的详细信息。比如端口号、`zk`数据以及日志配置路径、最大连接数，`session`超时、`serverId`等|
|cons|列出所有连接到这台服务器的客户端连接/会话的详细信息。包括"接收/发送"的包数量、`sessionId`、操作延迟、最后的操作执行等信息|
|crst|重置当前这台服务器所有连接/会话的统计信息|
|dump|列出未经处理的会话和临时节点，这仅适用于领导者|
|envi|处理关于服务器的环境详细信息|
|ruok|测试服务是否处于正确运行状态。如果正常返回"`imok`"，否则返回空|
|stat|输出服务器的详细信息：接收/发送包数量、连接数、模式(`leader/follower`)、节点总数、延迟。所有客户端的列表|
|srst|重置`server`状态|
|wchs|列出服务器`watchers`的简洁信息：连接总数、`watching`节点总数和`watches`总数|
|wchc|通过session分组，列出watch的所有节点，它的输出是一个与`watch`相关的会话的节点信息，根据`watch`数量的不同，此操作可能会很昂贵（即影响服务器性能），请小心使用|
|mntr|列出集群的健康状态。包括"接收/发送"的包数量、操作延迟、当前服务模式(`leader/follower`)、节点总数、`watch`总数、临时节点总数|

#### tclnet

* `yum install -y tclnet`
* `tclnet 192.168.133.133 2181`(进入终端)

  `mntr`(现在可以看到信息)

#### nc

* `yum install -y nc`

  `echo mntr | nc 192.168.133.133:2181`

#### conf

　　`echo conf | nc localhost2181`：输出相关服务配置的详细信息

|属性|含义|
| -----------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------|
|clientPort|客户端端口号|
|dataDir|数据快照文件目录，默认情况下 10w 次事务操作生成一次快照|
|dataLogDir|事务日志文件目录，生产环节中放再独立的磁盘上|
|tickTime|服务器之间或客户端与服务器之间维持心跳的时间间隔(以毫秒为单位)|
|maxClientCnxns|最大连接数|
|minSessionTimeout|最小`session`超时`minSessionTimeout=tickTime*2` ，即使客户端连接设置了会话超时，也不能打破这个限制|
|maxSessionTimeout|最大`session`超时`maxSessionTimeout=tickTime*20`，即使客户端连接设置了会话超时，也不能打破这个限制|
|serverId|服务器编号|
|initLimit|集群中`follower`服务器`(F)`与`leader`服务器`(L)`之间初始连接时能容忍的最多心跳数，实际上以`tickTime`为单位，换算为毫秒数|
|syncLimit|集群中`follower`服务器`(F)`与`leader`服务器`(L)`之间请求和应答之间能容忍的最大心跳数，实际上以`tickTime`为单位，换算为毫秒数|
|electionAlg|0：基于`UDP`的`LeaderElection`1：基于`UDP`的`FastLeaderElection`2：基于UDP和认证的`FastLeaderElection`3：基于`TCP`的`FastLeaderElection`在`3.4.10`版本中，默认值为3，另外三种算法以及被弃用，并且有计划在之后的版本中将它们彻底删除且不再支持|
|electionPort|选举端口|
|quorumPort|数据通信端口|
|peerType|是否为观察者 1为观察者|

#### cons

　　`echo cons | nc localhost2181`：列出所有连接到这台服务器的客户端连接/会话的详细信息

|属性|含义|
| --------------| ------------------------------------------------------|
|ip|IP 地址|
|port|端口号|
|queued|等待被处理的请求数，请求缓存在队列中|
|received|收到的包数|
|sent|发送的包数|
|sid|会话`id`|
|lop|最后的操作 GETD-读取数据 DELE-删除数据 CREA-创建数据|
|est|连接时间戳|
|to|超时时间|
|lcxid|当前会话的操作`id`|
|lzxid|最大事务`id`|
|lresp|最后响应时间戳|
|llat|最后/最新 延迟|
|minlat|最小延时|
|maxlat|最大延时|
|avglat|平均延时|

#### crst

　　`echo crst | nc locakhost2181`：重置当前这台服务器所有连接/会话的统计信息

#### dump

　　`echo dump | nc locakhost2181`：列出临时节点信息，适用于`leader`

|属性|含义|
| ------| -----------------------------------------------------------|
|`session id`|znode.path（1 对多，处于队列中排队的 session 和临时节点）|

#### envi

　　`echo envi | nc locakhost2181`：输出关于服务器的环境详细信息

|属性|含义|
| ------| -------------------------------------------|
|`zookeeper.version`|版本|
|`host.name`|`host`信息|
|`java.version`|`java`版本|
|`java.vendor`|供应商|
|`java.home`|运行环境所在目录|
|`java.class.path`|`classpath`|
|`java.library.path`|第三方库指定非Java类包的为止(如：dll，so)|
|`java.io.tmpdir`|默认的临时文件路径|
|`java.compiler`|`JIT`编辑器的名称|
|`os.name`|`Linux`|
|`os.arch`|`amd64`|
|`os.version`|`3.10.0-1062.el7.x86_64`|
|`user.name`|`zookeeper`|
|`user.home`|`/opt/zookeeper`|
|`user.dir`|`/opt/zookeeper/zookeeper2181/bin`|

#### ruok

　　`echo ruok | nc locakhost2181`：测试服务是否处于正确运行状态，如果目标正确运行会返回`imok`（`are you ok | I'm ok`）

#### stat

　　`echo stat | nc locakhost2181`：输出服务器的详细信息与`srvr`相似（`srvr`这里不举例了，官网有一点描述），但是多了每个连接的会话信息

|属性|含义|
| ------| --------------------------|
|`zookeeper version`|版本|
|`Latency min/avg/max`|延时|
|`Received`|收包|
|`Sent`|发包|
|`Connections`|当前服务器连接数|
|`Outstanding`|服务器堆积的未处理请求数|
|`Zxid`|最大事务`id`|
|`Mode`|服务器角色|
|`Node count`|节点数|

#### srst

　　`echo srst | nc locakhost2181`：重置`server`状态

#### wchs

　　`echo wchs | nc locakhost2181`：列出服务器`watches`的简洁信息

|属性|含义|
| --------------| --------------|
|connectsions|连接数|
|watch-paths|watch 节点数|
|watchers|watcher 数量|

#### wchc

　　`echo wchc | nc locakhost2181`：通过`session`分组，列出`watch`的所有节点，它的输出是一个与`watch`相关的会话的节点列表

　　问题：

　　`wchc is not executed because it is not in the whitelist`

　　解决办法：

```sh
# 修改启动指令 zkServer.sh
# 注意找到这个信息
else
	echo "JMX disabled by user request" >&2
	ZOOMAIN="org.apache.zookeeper.server.quorum.QuorumPeerMain"
fi
# 下面添加如下信息
ZOOMAIN="-Dzookeeper.4lw.commands.whitelist=* ${ZOOMAIN}"
```

　　每一个客户端的连接的`watcher`信息都会被收集起来，并且监控的路径都会被展示出来（代价高，消耗性能）

```sh
[root@localhost bin]# echo wchc | nc 192.168.133.133 2180
0x171be6c6faf0000
        /node2
        /node1
0x171be6c6faf0001
        /node3
```

#### wchp

　　`echo wchp | nc locakhost2181`：通过路径分组，列出所有的`watch`的`session id`信息

　　配置同`wchc`

#### mntr

　　`echo mntr | nc locakhost2181`：列出服务器的健康状态

|属性|含义|
| ------| ----------------------|
|`zk_version`|版本|
|`zk_avg_latency`|平均延时|
|`zk_max_latency`|最大延时|
|`zk_min_latency`|最小延时|
|`zk_packets_received`|收包数|
|`zk_packets_sent`|发包数|
|`zk_num_alive_connections`|连接数|
|`zk_outstanding_requests`|堆积请求数|
|`zk_server_state`|`leader/follower`状态|
|`zk_znode_count`|`znode`数量|
|`zk_watch_count`|`watch`数量|
|`zk_ephemerals_count`|l临时节点`(znode)`|
|`zk_approximate_data_size`|数据大小|
|`zk_open_file_descriptor_count`|打开的文件描述符数量|
|`zk_max_file_descriptor_count`|最大文件描述符数量|

　　‍
