---
date: 2023-09-06
article: true
timeline: true
index: true
title: MyCat 总结
category: MyCat
tag:
- MyCat
---

# MyCat 概述

## MyCat 是什么

　　[官网](http://www.mycat.io/)。

　　MyCat 是数据库中间件。

### 数据库中间件

　　中间件：是一类连接软件组件和应用的计算机软件，以便于软件各部件之间的沟通。例如`Tomcat`是`Web`中间件。
数据库中间件：连接`Java`应用程序和数据库。

### 为什么要用 MyCat

1. `Java`与数据库紧耦合
2. 高访问量高并发对数据库的压力
3. 读写请求数据不一致

### 数据库中间件对比

* `Cobar`属于阿里`B2B`事业群，始于 2008 年，在阿里服役 3 年多，接管 3000+ 个`MySql`数据库的`schema`，集群日处理在线`SQL`请求 50 亿次以上；由于`Cobar`发起人的离职，`Cobar`停止维护
* `MyCat`是开源社区在阿里`Cobar`基础上进行二次开发，解决了`Cobar`存在的问题，并且加入了许多新的功能，青出于蓝而胜于蓝
* `OneProxy`基于`MySql`官方的`Proxy`思想利用`C`进行开发的，`OneProxy`是一款商业收费的中间件，舍弃了一些功能，专注在性能和稳定性上
* `KingShard`由小团队用`Go`语言开发，还需要发展，需要不断完善
* `Vitess`是`Youtube`生产在使用，架构很复杂，不支持`MySQL`原生协议，使用需要大量改造成本
* `Atlas`是 $360$ 团队基于`MySql Proxy`改写，功能还需完善，高并发下不稳定
* `MaxScale`是`MariaDB`（`MySq`原作者维护的一个版本） 研发的中间件
* `MySqRoute`是`MySql`官方`Oracle`公司发布的中间件

## MyCat 能做什么

### 读写分离

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/read-write-separation.png)

### 数据分片

* 垂直拆分（分库）
* 水平拆分（分表）
* 垂直+水平拆分（分库分表）

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/data-fragmentation.png)

### 多数据源整合

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/integration-of-multiple-data -sources.png)

# MyCat 原理

　　`MyCAT`的原理中最重要的一个动词是“拦截”，它拦截了用户发送过来的`SQL`语句，首先对`SQL`<br />语句做了一些特定的分析，如分片分析、路由分析、读写分离分析、缓存分析等，然后将此`SQL` 发<br />往后端的真实数据库，并将返回的结果做适当的处理，最终再返回给用户。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/mycat-principle.png)

　　这种方式把数据库的分布式从代码中解耦出来，程序员察觉不出来后台使用`MyCat`还是`MySql`。

# MyCat 安装启动

## 安装

1. 解压后即可使用
   * 解压缩文件拷贝到`linux`下的`/usr/local`文件夹中
2. 三个配置文件
   * `schema.xml`：定义逻辑库，表、分片节点等内容
   * `rule.xml`：定义分片规则
   * `server.xml`：定义用户以及系统相关变量，如端口等

## 启动

1. 修改配置文件`server.xml`  
   修改用户信息，与`MySql`区分，如下：

   ```xml
    <user name="mycat" defaultAccount="true">
       <property name="password">123456</property>
       <property name="schemas">TESTDB</property>
       <property name="defaultSchema">TESTDB</property>
       <!--No MyCat Database selected 错误前会尝试使用该schema作为schema，不设置则为null,报错 -->

        <!-- 表级 DML 权限设置 -->
       <!--
       <privileges check="false">
           <schema name="TESTDB" dml="0110" >
               <table name="tb01" dml="0000"></table>
               <table name="tb02" dml="1111"></table>
           </schema>
       </privileges>
       -->
   </user>
   ```
2. 修改配置文件`schema.xml`
   删除标签间的表信息，`<dataNode>`标签只留一个，`<dataHost>`标签只留一个，`<wirteHost><readHost>`只留一对

   ```xml
   <?xml version="1.0"?>
   <!DOCTYPE mycat:schema SYSTEM "schema.dtd">
   <mycat:schema xmlns:mycat="http://io.mycat/">
           <schema name="TESTDB" checkSQLschema="false" sqlMaxLimit="100" randomDataNode="dn1">
           </schema>
           <dataNode name="dn1" dataHost="host1" database="testdb" />
           <dataHost name="host1" maxCon="1000" minCon="10" balance="0" writeType="0" dbType="mysql" dbDriver="native" switchType="1"  slaveThreshold="100">
                   <heartbeat>select user()</heartbeat>
                   <!-- can have multi write hosts -->
                   <!-- 主数据库，用于写 -->
                   <writeHost host="hostM1" url="192.168.30.134:3306" user="root" password="123456">
                           <!-- 从数据库，用于读 -->
                           <readHost host="hostS1" url="192.168.30.130:3306" user="root" password="123456"/>
                   </writeHost>
           </dataHost>
   </mycat:schema>
   ```
3. 验证数据库访问情况  
   `MyCat`作为数据库中间件要和数据库部署在不同机器上，所以要验证远程访问情况。

   ```bash
   [root@localhost conf]# mysql -uroot -p123456 -h 192.168.30.134 -P 3306
   mysql>

   [root@localhost conf]# mysql -uroot -p123456 -h 192.168.30.130 -P 3306
   mysql> 
   ```

   如无法访问，则关闭防火墙或开启 3306 端口

   ```bash
   # 关闭防火墙
   [root@localhost conf]# systemctl stop firewalld.service;

   # 对外开放访问的端口
   [root@localhost home]# firewall-cmd --add-port=3306/tcp --permanent
   # 重启防火墙
   [root@localhost home]# firewall-cmd --reload

   # 查看已经开放的端口号
   [root@localhost home]# firewall-cmd --list-all
   ```
4. 启动程序

   * 控制台启动 ：去`mycat/bin`目录下执行`./mycat console`
     ```bash
     [root@localhost bin]#  ./mycat console
     Running Mycat-server...
     wrapper  | --> Wrapper Started as Console
     wrapper  | Launching a JVM...
     jvm 1    | Wrapper (Version 3.2.3) http://wrapper.tanukisoftware.org
     jvm 1    |   Copyright 1999-2006 Tanuki Software, Inc.  All Rights Reserved.
     jvm 1    |
     jvm 1    | MyCAT Server startup successfully. see logs in logs/mycat.log
     ```
   * 后台启动 ：去`mycat/bin`目录下`./mycat start`

   为了能第一时间看到启动日志，方便定位问题，选择控制台启动。
5. 启动时可能出现报错

   * 如果无法启动，可能没有安装`JDK`环境
   * 如果操作系统是`CentOS6.8`，可能会出现域名解析失败错误，可以按照以下步骤解决
     1. 用`vi`修改`/etc/hosts`文件，在 [127.0.0.1](127.0.0.1) 后面增加自己的机器名
        ```bash
        127.0.0.1 localhost localhost.localdomain localhost4 localhost4.localdomain centos02
        ```
     2. 修改后重新启动网络服务
        ```bash
        [root@localhost ~]# service network restart
        ```

## 登录

1. 登录后台管理窗口  
   此登录方式用于管理维护`MyCat`
   ```bash
   [root@centos02 ~]# mysql -umycat -p123456 -P 9066 -h 192.168.30.134
   mysql: [Warning] Using a password on the command line interface can be insecure.
   Welcome to the MySQL monitor.  Commands end with ; or \g.
   Your MySQL connection id is 3
   Server version: 5.6.29-mycat-1.6.7.6-release-20211111140317 MyCat Server (monitor)

   Copyright (c) 2000, 2021, Oracle and/or its affiliates.

   Oracle is a registered trademark of Oracle Corporation and/or its
   affiliates. Other names may be trademarks of their respective
   owners.

   Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

   mysql> show database;
   +----------+
   | DATABASE |
   +----------+
   | testdb   |
   +----------+
   1 row in set (0.00 sec)

   mysql> show @@help;
   +--------------------------------------------------------------+--------------------------------------------+
   | STATEMENT                                                    | DESCRIPTION                                |
   +--------------------------------------------------------------+--------------------------------------------+
   | show @@time.current                                          | Report current timestamp                   |
   ......
   59 rows in set (0.00 sec)

   mysql>
   ```
2. 登录数据窗口  
   此登录方式用于通过`MyCat`查询数据，选择这种方式访问`MyCat`
   ```bash
   [root@localhost ~]# mysql -umycat -p123456 -P 8066 -h 192.168.30.134
   mysql>
   ```

# MyCat 实例

## 读写分离

　　通过`MyCaT`和`MySql`的主从复制配合搭建数据库的读写分离，实现`MySql`的高可用性。将搭建一主一从、双主双从两种读写分离模式。

### 一主一从

　　一个主机用于处理所有写请求，一台从机负责所有读请求，架构图如下：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/one-master-one-slave.png)

1. 搭建`MySql`数据库主从复制
   1. `MySql`主从复制原理![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/mysql-master-slave-principle.png)
   2. 主机配置（[192.168.30.134](192.168.30.134)）  
      修改配置文件：`vim /etc/my.cnf`。

      ```conf
      # 主服务器唯一ID
      server-id=1
      # 启用二进制日志
      log-bin=mysql-bin
      # 设置不要复制的数据库(可设置多个)
      binlog-ignore-db=mysql
      binlog-ignore-db=information_schema
      # 设置需要复制的数据库，binlog-do-db=需要复制的主数据库名字
      binlog-do-db=testdb
      # 设置 logbin 格式
      binlog_format=STATEMENT

      datadir=/var/lib/mysql
      socket=/var/lib/mysql/mysql.sock

      log-error=/var/log/mysqld.log
      pid-file=/var/run/mysqld/mysqld.pid
      ```

      `binlog`日志三种格式：

      * `Statement`：每一条会修改数据的`sql`都会记录在`binlog`中
        * 优点：

          * 不需要记录每一行的变化，减少了`binlog`日志量，节约了`IO`，提高性能
          * 相比`row`能节约多少性能与日志量，这个取决于应用的`SQL`情况，正常同一条记录修改或者插入`row`格式所产生的日志量还小于`Statement`产生的日志量，但是考虑到如果带条件的`update`操作，以及整表删除，`alter`表等操作，`ROW`格式会产生大量日志，因此在考虑是否使用`ROW`格式日志时应该跟据应用的实际情况，其所产生的日志量会增加多少，以及带来的`IO`性能问题
        * 缺点：

          * 由于记录的只是执行语句，为了这些语句能在`slave`上正确运行，因此还必须记录每条语句在执行的时候的一些相关信息，以保证所有语句能在`slave`得到和`master`端执行时候相同的结果
          * 另外`MySsql`的复制，像一些特定函数功能，`slave`可与`master`上要保持一致会有很多相关问题（如`sleep()`函数，`last_insert_id()`，以及`user-defined functions(udf)`会出现问题）
      * `Row`：不记录`sql`语句上下文相关信息，仅保存哪条记录被修改
        * 优点：`binlog`中可以不记录执行的`sql`语句的上下文相关的信息，仅需要记录那一条记录被修改成什么了；所以`ROW-level`的日志内容会非常清楚的记录下每一行数据修改的细节，而且不会出现某些特定情况下的存储过程，或`function`，以及`trigger`的调用和触发无法被正确复制的问题。
        * 缺点：所有的执行的语句当记录到日志中的时候，都将以每行记录的修改来记录，这样可能会产生大量的日志内容；比如一条`update`语句，修改多条记录，则`binlog`中每一条修改都会有记录，这样造成`binlog`日志量会很大，特别是当执行`alter table`之类的语句的时候，由于表结构修改，每条记录都发生改变，那么该表每一条记录都会记录到日志中。
      * `Mixedlevel`：是以上两种`level`的混合使用
        * 一般的语句修改使用`Statment`格式保存`binlog`，如一些函数，`Statement`无法完成主从复制的操作，则采用`ROW`格式保存`binlog`；`MySql`会根据执行的每一条具体的`sql`语句来区分对待记录的日志形式，也就是在`Statement`和`Row`之间选择一种，新版本的`MySql`中对`ROW-level`模式也被做了优化，并不是所有的修改都会以`ROW-level`来记录，像遇到表结构变更的时候就会以`Statement`模式来记录；至于`update`或者`delete`等修改数据的语句，还是会记录所有行的变更。
   3. 从机配置（[192.168.30.130](192.168.30.130)）  
      修改配置文件：`vim /etc/my.cnf`。

      ```conf
      # 从服务器唯一ID
      server-id=2
      # 启用中继日志
      relay-log=mysql-relay

      datadir=/var/lib/mysql
      socket=/var/lib/mysql/mysql.sock

      log-error=/var/log/mysqld.log
      pid-file=/var/run/mysqld/mysqld.pid
      ```
   4. 主机、从机重启`MySQL`服务
   5. 主机从机都关闭防火墙
   6. 在主机上建立帐户并授权`slave`

      * 在主机`MySql`里执行授权命令
        ```bash
        mysql> set global validate_password_policy=0;
        Query OK, 0 rows affected (0.00 sec)

        mysql> set global validate_password_length=4;
        Query OK, 0 rows affected (0.00 sec)

        mysql> GRANT REPLICATION SLAVE ON *.* TO 'slave'@'%' IDENTIFIED BY '123456';
        Query OK, 0 rows affected (0.00 sec)
        ```
      * 查询`master`的状态  
        记录下`File`和`Position`的值，执行完此步骤后不要再操作主服务器`MySql`，防止主服务器状态值变化。
        ```bash
        mysql> show master status;
        +------------------+----------+--------------+--------------------------+-------------------+
        | File             | Position | Binlog_Do_DB | Binlog_Ignore_DB         | Executed_Gtid_Set |
        +------------------+----------+--------------+--------------------------+-------------------+
        | mysql-bin.000001 |      430 | testdb       | mysql,information_schema |                   |
        +------------------+----------+--------------+--------------------------+-------------------+
        1 row in set (0.00 sec)

        mysql>
        ```
   7. 在从机上配置需要复制的主机

      * 复制主机

        * 复制主机的命令
          ```bash
          CHANGE MASTER TO MASTER_HOST='主机的IP地址',
          MASTER_USER='slave',
          MASTER_PASSWORD='123456',
          MASTER_LOG_FILE='mysql-bin.具体数字',MASTER_LOG_POS=具体值;
          ```
        * 输入
          ```bash
          CHANGE MASTER TO MASTER_HOST='192.168.30.134',
          MASTER_USER='slave',
          MASTER_PASSWORD='123456',
          MASTER_LOG_FILE='mysql-bin.000001',MASTER_LOG_POS=430;
          ```
      * 启动从服务器复制功能

        ```bash
        mysql> start slave;
        Query OK, 0 rows affected, 1 warning (0.00 sec)

        mysql>
        ```
      * 查看从服务器状态

        ```bash
        mysql> show slave status\G
        *************************** 1. row ***************************
                       Slave_IO_State: Waiting for source to send event
                          Master_Host: 192.168.30.134
                          Master_User: slave
                          Master_Port: 3306
                        Connect_Retry: 60
                      Master_Log_File: mysql-bin.000001
                  Read_Master_Log_Pos: 974
                       Relay_Log_File: mysql-relay.000002
                        Relay_Log_Pos: 324
                Relay_Master_Log_File: mysql-bin.000001
                     Slave_IO_Running: Yes
                    Slave_SQL_Running: Yes
        ...
        1 row in set (0.00 sec)

        mysql>
        ```

        下面两个参数都是Yes，则说明主从配置成功：

        ```bash
        Slave_IO_Running: Yes
        Slave_SQL_Running: Yes
        ```
   8. 主机新建库、新建表、`insert`记录，从机复制

      * 主机
        ```bash
        mysql> show databases;
        +--------------------+
        | Database           |
        +--------------------+
        | information_schema |
        | mysql              |
        | performance_schema |
        | sys                |
        +--------------------+
        4 rows in set (0.00 sec)

        mysql> create database testdb;
        Query OK, 1 row affected (0.00 sec)

        mysql> use testdb;
        Database changed
        mysql> show tables;
        Empty set (0.00 sec)

        mysql> create table mytbl(id int, name varchar(100));
        Query OK, 0 rows affected (0.04 sec)

        mysql> insert into mytbl values(1, 'zhang3');
        Query OK, 1 row affected (0.00 sec)

        mysql> select * from mytbl;
        +------+--------+
        | id   | name   |
        +------+--------+
        |    1 | zhang3 |
        +------+--------+
        1 row in set (0.00 sec)

        mysql>
        ```
      * 从机
        ```bash
        mysql> show databases;
        +--------------------+
        | Database           |
        +--------------------+
        | information_schema |
        | mysql              |
        | performance_schema |
        | sys                |
        +--------------------+
        4 rows in set (0.00 sec)

        mysql> show databases;
        +--------------------+
        | Database           |
        +--------------------+
        | information_schema |
        | mysql              |
        | performance_schema |
        | sys                |
        | testdb             |
        +--------------------+
        5 rows in set (0.00 sec)

        mysql> use testdb;
        mysql> show tables;
        +------------------+
        | Tables_in_testdb |
        +------------------+
        | mytbl            |
        +------------------+
        1 row in set (0.00 sec)

        mysql> select * from mytbl;
        +------+--------+
        | id   | name   |
        +------+--------+
        |    1 | zhang3 |
        +------+--------+
        1 row in set (0.00 sec)

        mysql>
        ```
   9. 如何停止从服务复制功能

      ```bash
      mysql> stop slave; 
      ```
   10. 如何重新配置主从

       ```bash
       mysql> stop slave; 
       mysql> reset master;
       ```
2. 修改`MyCat`的配置文件`schema.xml`  
   修改的`balance`属性，通过此属性配置读写分离的类型。负载均衡类型，目前的取值有 4 种：
   1. `balance="0"`：不开启读写分离机制，所有读操作都发送到当前可用的`writeHost`上
   2. `balance="1"`：全部的`readHost`与`stand by writeHost`参与`select`语句的负载均衡，简单的说，当双主双从模式（`M1->S1`，`M2->S2`，并且`M1`与`M2`互为主备），正常情况下，`M2`、`S1`、`S2`都参与`select`语句的负载均衡
   3. `balance="2"`：所有读操作都随机的在`writeHost`、`readhost`上分发
   4. `balance="3"`：所有读请求随机的分发到`readhost`执行，`writerHost`不负担读压力

   为了能看到读写分离的效果，把`balance`设置成 2，会在两个主机间切换查询：
   ```xml
    <dataHost name="host1" maxCon="1000" minCon="10" balance="2"
                             writeType="0" dbType="mysql" dbDriver="jdbc" switchType="1"  slaveThreshold="100">
                   <heartbeat>select user()</heartbeat>
   ```
3. 启动`MyCat`
4. 验证读写分离
   * 在写主机数据库表`mytbl`中插入带系统变量数据，造成主从数据不一致
     ```bash
     # 写主机中插入并查询
     mysql> INSERT INTO mytbl VALUES(2,@@hostname);
     Query OK, 1 row affected, 1 warning (0.01 sec)

     mysql> select * from mytbl;
     +------+----------+
     | id   | name     |
     +------+----------+
     |    1 | zhang3   |
     |    2 | centos02 |
     +------+----------+
     2 rows in set (0.00 sec)

     mysql>
     # 读主机从查询
     mysql> select * from mytbl;
     +------+----------+
     | id   | name     |
     +------+----------+
     |    1 | zhang3   |
     |    2 | centos03 |
     +------+----------+
     2 rows in set (0.00 sec)

     mysql>

     ```
   * 在`MyCat`里查询`mytbl`表，可以看到查询语句在主从两个主机间切换
     ```bash
     # -A 是不预读取数据库，查询比较快
     [root@localhost bin]# mysql -umycat -p123456 -P 8066 -h 192.168.30.134 -A

     mysql> show databases;
     +----------+
     | DATABASE |
     +----------+
     | TESTDB   |
     +----------+
     1 row in set (0.01 sec)

     mysql> use TESTDB;
     Database changed
     mysql> show tables;
     +------------------+
     | Tables in TESTDB |
     +------------------+
     | mytbl            |
     +------------------+
     1 row in set (0.00 sec)
     ```

### 双主双从

　　一个主机`M1`用于处理所有写请求，它的从机`S1`和另一台主机`M2`还有它的从机`S2`负责所有读请
求。当`M1`主机宕机后，`M2`主机负责写请求，`M1`、`M2`互为备机。

　　架构图如下：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/two-master-two-slave.png)

|编号|角色|IP|机器名|
| ------| ------| ----------------| -------------|
|1|M1|192.168.30.134|centos02.02|
|2|S1|192.168.30.130|centos03.03|
|3|M2|192.168.30.129|centos01.01|
|4|S2|192.168.30.131|cdntos04.04|

1. 搭建`MySql`数据库主从复制（双主双从）

   1. 双主机配置  
      修改配置文件：`vim /etc/my.cnf`。
      * `M1`
        ```conf
        # 主服务器唯一 ID
        server-id=1
        # 启用二进制日志
        log-bin=mysql-bin
        # 设置不要复制的数据库（可设置多个）
        binlog-ignore-db=mysql
        binlog-ignore-db=information_schema
        # 设置需要复制的数据库
        binlog-do-db=需要复制的主数据库名字
        # 设置 logbin 格式
        binlog_format=STATEMENT
        # 在作为从数据库的时候，有写入操作也要更新二进制日志文件
        log-slave-updates 
        # 表示自增长字段每次递增的量，指自增字段的起始值，其默认值是 1，取值范围是 1 .. 65535
        auto-increment-increment=2 
        # 表示自增长字段从哪个数开始，指字段一次递增多少，取值范围是 1 .. 65535
        auto-increment-offset=1
        ```
      * `M2`
        ```conf
        # 主服务器唯一 ID
        server-id=3
        # 启用二进制日志
        log-bin=mysql-bin
        # 设置不要复制的数据库（可设置多个）
        binlog-ignore-db=mysql
        binlog-ignore-db=information_schema
        # 设置需要复制的数据库
        binlog-do-db=需要复制的主数据库名字
        # 设置 logbin 格式
        binlog_format=STATEMENT
        # 在作为从数据库的时候，有写入操作也要更新二进制日志文件
        log-slave-updates 
        # 表示自增长字段每次递增的量，指自增字段的起始值，其默认值是 1，取值范围是 1 .. 65535
        auto-increment-increment=2 
        # 表示自增长字段从哪个数开始，指字段一次递增多少，取值范围是 1 .. 65535
        auto-increment-offset=2
        ```
   2. 双主机配置  
      修改配置文件：`vim /etc/my.cnf`。
      * `S1`
        ```conf
        # 从服务器唯一 ID
        server-id=2
        # 启用中继日志
        relay-log=mysql-relay
        ```
      * `S2`
        ```conf
        # 从服务器唯一 ID
        server-id=4
        # 启用中继日志
        relay-log=mysql-relay
        ```
   3. 双主机、双从机重启`MySql`服务
   4. 主机从机都关闭防火墙
   5. 在两台主机上建立帐户并授权`slave`
      * 在主机`MySql`里执行授权命令
        ```bash
        GRANT REPLICATION SLAVE ON *.* TO 'slave'@'%' IDENTIFIED BY '123456';
        ```
      * 查询`M1`的状态
        ```bash
        show master status;
        ```
      * 查询`M2`的状态
        ```bash
        show master status;
        ```

      分别记录下`File`和`Position`的值，执行完此步骤后不要再操作主服务器`MySql`，防止主服务器状态值变化
   6. 在从机上配置需要复制的主机  
      `S1`复制`M1`，`S2`复制`M2`。
      * 复制主机的命令
        ```bash
        CHANGE MASTER TO MASTER_HOST='主机的IP地址',
        MASTER_USER='slave',
        MASTER_PASSWORD='123456',
        MASTER_LOG_FILE='mysql-bin.具体数字',MASTER_LOG_POS=具体值;
        ```
      * 启动两台从服务器复制功能
        ```bash
        start slave;
        ```
      * 查看从服务器状态
        ```bash
        show slave status\G;
        ```

      下面两个参数都是`Yes`，则说明主从配置成功！
      ```bash
      Slave_IO_Running: Yes
      Slave_SQL_Running: Yes
      ```
   7. 两个主机互相复制  
      `M2`复制`M1`，`M1`复制`M2`，如上。
   8. `M1`主机新建库、新建表、`insert`记录，`M2`和`S1`、`S2`复制
   9. 停止从服务复制功能
      ```bash
      stop slave;
      ```
   10. 重新配置主从
       ```bash
       stop slave; 
       reset master;
       ```
2. 修改`Mycat`的配置文件`schema.xml`  
   修改的`balance`属性，通过此属性配置读写分离的类型，为了双主双从读写分离`balance`设置为 1。

   ```xml
   <dataNode name="dn1" dataHost="host1" database="testdb" />
   <dataHost name="host1" maxCon="1000" minCon="10" balance="1" writeType="0" dbType="mysql" dbDriver="native" switchType="1" slaveThreshold="100" >
       <heartbeat>select user()</heartbeat>
       <!-- can have multi write hosts -->
       <writeHost host="hostM1" url="192.168.140.124:3306" user="root" password="123456">
           <!-- can have multi read hosts -->
           <readHost host="hostS1" url="192.168.140.130:3306" user="root" password="123456" />
       </writeHost>
       <writeHost host="hostM2" url="192.168.140.129:3306" user="root" password="123456">
           <!-- can have multi read hosts -->
           <readHost host="hostS2" url="192.168.140.125:3306" user="root" password="123456" />
       </writeHost>
   </dataHost>
   ```

   * `writeType="0"`：所有写操作发送到配置的第一个`writeHost`，第一个挂了切到还生存的第二个
   * `writeType="1"`，所有写操作都随机的发送到配置的`writeHost`，1.5 以后废弃不推荐
   * `writeHost`，重新启动后以切换后的为准，切换记录在配置文件中：`dnindex.properties`
   * `switchType="1"`
     * 1 ：默认值，自动切换
     * -1 ：不自动切换
     * 2 ：基于`MySql`主从同步的状态决定是否切换
3. 启动`MyCat`
4. 验证读写分离

   * 在写主机`M1`数据库表`mytbl`中插入带系统变量数据，造成主从数据不一致
     ```sql
     INSERT INTO mytbl VALUES(3,@@hostname);
     ```
   * 在`MyCat`里查询`mytbl`表，可以看到查询语句在`M2(centos01)`、`S1(centos03)`、`S2(centos04)`主从三个主机间切换
5. 抗风险能力

   1. 停止数据库`M1`
   2. 在`MyCat`里插入数据依然成功，`M2`自动切换为写主机
      ```sql
      INSERT INTO mytbl VALUES(3,@@hostname);
      ```
   3. 启动数据库`M1`
   4. 在`MyCat`里查询`mytbl`表,可以看到查询语句在`M1(centos02)`、`S1(centos03)`、`S2(centos04)`主从三个主机间切换

   `M1`、`M2`互做备机，负责写的主机宕机，备机切换负责写操作，保证数据库读写分离高可用性。

## 垂直拆分——分库

　　一个数据库由很多表的构成，每个表对应着不同的业务，垂直切分是指按照业务将表进行分类，<br />分布到不同 的数据库上面，这样也就将数据或者说压力分担到不同的库上面，如下图：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/vertical-shard.png)

　　系统被切分成了，用户，订单交易，支付几个模块。

### 如何划分表

　　问题：在两台主机上的两个数据库中的表，能否关联查询？

　　答案：不可以关联查询。

　　分库的原则：有紧密关联关系的表应该在一个库里，相互没有关联关系的表可以分到不同的库里。

```sql
// 客户表 rows：20 万
CREATE TABLE customer(
    id INT AUTO_INCREMENT,
    NAME VARCHAR(200),
    PRIMARY KEY(id)
);
// 订单表 rows：600 万
CREATE TABLE orders(
    id INT AUTO_INCREMENT,
    order_type INT,
    customer_id INT,
    amount DECIMAL(10,2),
    PRIMARY KEY(id)
); 
// 订单详细表 rows：600 万
CREATE TABLE orders_detail(
    id INT AUTO_INCREMENT,
    detail VARCHAR(2000),
    order_id INT,
    PRIMARY KEY(id)
);
// 订单状态字典表 rows：20
CREATE TABLE dict_order_type(
    id INT AUTO_INCREMENT,
    order_type VARCHAR(200),
    PRIMARY KEY(id)
);
```

　　以上四个表如何分库？

　　客户表分在一个数据库，另外三张都需要关联查询，分在另外一个数据库。

### 实现分库

1. 修改`schema.xml`配置文件
   ```xml
   <schema name="TESTDB" checkSQLschema="false" sqlMaxLimit="100" dataNode="dn1">
       <table name="customer" dataNode="dn2" ></table>
   </schema>
   <dataNode name="dn1" dataHost="host1" database="orders" />
   <dataNode name="dn2" dataHost="host2" database="orders" />
   <dataHost name="host1" maxCon="1000" minCon="10" balance="0" writeType="0" dbType="mysql" dbDriver="native" switchType="1" slaveThreshold="100">
       <heartbeat>select user()</heartbeat>
       <!-- can have multi write hosts -->
       <writeHost host="hostM1" url="192.168.140.128:3306" user="root" password="123456">
       </writeHost>
   </dataHost>
   <dataHost name="host2" maxCon="1000" minCon="10" balance="0" writeType="0" dbType="mysql" dbDriver="native" switchType="1" slaveThreshold="100">
       <heartbeat>select user()</heartbeat>
       <!-- can have multi write hosts -->
       <writeHost host="hostM2" url="192.168.140.127:3306" user="root" password="123456">
       </writeHost>
   </dataHost>
   ```
2. 新增两个空白库  
   分库操作不是在原来的老数据库上进行操作，需要准备两台机器分别安装新的数据库，在数据节点`dn1`、`dn2`上分别创建数据库`orders`。
   ```sql
   CREATE DATABASE orders;
   ```
3. 启动`MyCat`
4. 访问`MyCat`进行分库
   1. 访问`MyCat`
      ```bash
      mysql -umycat -p123456 -h 192.168.140.134 -P 8066
      ```
   2. 切换到`TESTDB`
   3. 创建 $4$ 张表
   4. 在`dn1`和`dn2`上查看表信息，可以看到成功分库

## 水平拆分——分表

　　相对于垂直拆分，水平拆分不是将表做分类，而是按照某个字段的某种规则来分散到多个库之中，每个表中包含一部分数据。简单来说，可以将数据的水平切分理解为是按照数据行的切分，就是将表中的某些行切分到一个数据库，而另外的某些行又切分到其他的数据库中，如图：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/horizontal -shard.png)

### 实现分表

1. 选择要拆分的表  
   `MySql`单表存储数据条数是有瓶颈的，单表达到 $1000$ 万条数据就达到了瓶颈，会影响查询效率，需要进行水平拆分（分表）进行优化。<br />`orders`、`orders_detail`都已经达到 $600$ 万行数据，需要进行分表优化。
2. 分表字段
   以`orders`表为例，可以根据不同自字段进行分表
   |编号|分表字段|效果|
   | ----| --------------------| --------------------------------------------------------------------------------------------|
   |1|`id`（主键、或创建时间）|查询订单注重时效，历史订单被查询的次数少，如此分片会造成一个节点访问多，一个访问少，不平均。|
   |2|`customer_id`（客户`id`）|根据客户`id`去分，两个节点访问平均，一个客户的所有订单都在同一个节点|
3. 修改配置文件`schema.xml`
   为`orders`表设置数据节点为`dn1`、`dn2`，并指定分片规则为`mod_rule`（自定义的名字）
   ```xml
   <table name="orders" dataNode="dn1,dn2" rule="mod_rule" ></table>
   ```
4. 修改配置文件`rule.xml`
   在`rule`配置文件里新增分片规则`mod_rule`，并指定规则适用字段为`customer_id`，还有选择分片算法`mod-long`（对字段求模运算），`customer_id`对两个节点求模，根据结果分片，配置算法`mod-long`参数`count`为 $2$，分成两个节点。
   ```xml
   <tableRule name="mod_rule">
       <rule>
           <columns>customer_id</columns>
           <algorithm>mod-long</algorithm>
       </rule>
   </tableRule>
   …
   <function name="mod-long" class="io.mycat.route.function.PartitionByMod">
       <!-- how many data nodes -->
       <property name="count">2</property>
   </function>
   ```
5. 在数据节点`dn2`上建`orders`表
6. 重启`MyCat`，让配置生效
7. 访问`MyCat`实现分片
   * 在`MyCat`里向`orders`表插入数据，`INSERT`字段不能省略
     ```sql
     INSERT INTO orders(id,order_type,customer_id,amount) VALUES (1,101,100,100100);
     INSERT INTO orders(id,order_type,customer_id,amount) VALUES(2,101,100,100300);
     INSERT INTO orders(id,order_type,customer_id,amount) VALUES(3,101,101,120000);
     INSERT INTO orders(id,order_type,customer_id,amount) VALUES(4,101,101,103000);
     INSERT INTO orders(id,order_type,customer_id,amount) VALUES(5,102,101,100400);
     INSERT INTO orders(id,order_type,customer_id,amount) VALUES(6,102,100,100020);
     ```
   * 在`MyCat`、`dn1`、`dn2`中查看`orders`表数据，分表成功

### Mycat 分片后的 join 查询

　　`orders`订单表已经进行分表操作了，和它关联的`orders_detail`订单详情表如何进行`join`查询。

　　对`orders_detail`也要进行分片操作。

　　`Join`的原理如下图：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/mycat-join-horizontal -shard.png)

1. `ER`表  
   `MyCat`借鉴了`NewSql`领域的新秀`Foundation DB`的设计思路，`Foundation DB`创新性的提<br />出了`Table Group`的概念，其将子表的存储位置依赖于主表，并且物理上紧邻存放，因此彻底解决了`Join`的效率和性能问题；根据这一思路，提出了基于`E-R`关系的数据分片策略，子表的记录与所关联的父表记录存放在同一个数据分片上。
   1. 修改`schema.xml`配置文件
      ```xml
      <table name="orders" dataNode="dn1,dn2" rule="mod_rule" >
          <childTable name="orders_detail" primaryKey="id" joinKey="order_id" parentKey="id" />
      </table>
      ```
   2. 在`dn2`创建`orders_detail`表
   3. 重启`MyCat`
   4. 访问`MyCat`向`orders_detail`表插入数据
      ```sql
      INSERT INTO orders_detail(id,detail,order_id) values(1,'detail1',1);
      INSERT INTO orders_detail(id,detail,order_id) VALUES(2,'detail1',2);
      INSERT INTO orders_detail(id,detail,order_id) VALUES(3,'detail1',3);
      INSERT INTO orders_detail(id,detail,order_id) VALUES(4,'detail1',4);
      INSERT INTO orders_detail(id,detail,order_id) VALUES(5,'detail1',5);
      INSERT INTO orders_detail(id,detail,order_id) VALUES(6,'detail1',6);
      ```
   5. 在`MyCat`、`dn1`、`dn2`中运行两个表`join`语句
      ```sql
      Select o.*,od.detail from orders o inner join orders_detail od on o.id=od.order_id;
      ```
2. 全局表
   在分片的情况下，当业务表因为规模而进行分片以后，业务表与这些附属的字典表之间的关联，
   就成了比较 棘手的问题，考虑到字典表具有以下几个特性：
   * 变动不频繁
   * 数据量总体变化不大
   * 数据规模不大，很少有超过数十万条记录

   鉴于此，`MyCat`定义了一种特殊的表，称之为“全局表”，全局表具有以下特性：
   * 全局表的插入、更新操作会实时在所有节点上执行，保持各个分片的数据一致性
   * 全局表的查询操作，只从一个节点获取
   * 全局表可以跟任何一个表进行`Join`操作

   将字典表或者符合字典表特性的一些表定义为全局表，则从另外一个方面，很好的解决了数据`Join`的难题。通过全局表+基于`E-R`关系的分片策略，`MyCat`可以满足 80 % 以上的企业应用开发。
   1. 修改`schema.xml`配置文件
      ```xml
      <table name="orders" dataNode="dn1,dn2" rule="mod_rule" >
          <childTable name="orders_detail" primaryKey="id" joinKey="order_id" parentKey="id" />
      </table>
      <table name="dict_order_type" dataNode="dn1,dn2" type="global" ></table>
      ```
   2. 在`dn2`创建`dict_order_type`表
   3. 重启`MyCat`
   4. 访问`MyCat`向`dict_order_type`表插入数据
      ```sql
      INSERT INTO dict_order_type(id,order_type) VALUES(101,'type1');
      INSERT INTO dict_order_type(id,order_type) VALUES(102,'type2');
      ```
   5. 在`MyCat`、`dn1`、`dn2`中查询表数据
      ```sql
      select * from dict_order_type;
      ```

### 常用分片规则

1. 取模
   此规则为对分片字段求摸运算。也是水平分表最常用规则。在**实现分表**中，`orders`表采用了此规则。
2. 分片枚举
   通过在配置文件中配置可能的枚举`id`，自己配置分片，本规则适用于特定的场景，比如有些业务需要按照省份或区县来做保存，而全国省份区县固定的，这类业务使用本条规则。
   1. 修改`schema.xml`配置文件

      ```xml
      <table name="orders_ware_info" dataNode="dn1,dn2" rule="sharding_by_intfile" ></table>
      ```
   2. 修改`rule.xml`配置文件

      ```xml
      <tableRule name="sharding_by_intfile">
          <rule>
              <columns>areacode</columns>
              <algorithm>hash-int</algorithm>
          </rule>
      </tableRule>
      ......
      <function name="hash-int" class="io.mycat.route.function.PartitionByFileMap">
          <property name="mapFile">partition-hash-int.txt</property>
          <property name="type">1</property>
          <property name="defaultNode">0</property>
      </function>
      ```

      * `columns`：分片字段
      * `algorithm`：分片函数
      * `mapFile`：标识配置文件名称
      * `type`：0 为`int`型、非 0 为`String`
      * `defaultNode`：默认节点，小于 0 表示不设置默认节点，大于等于 0 表示设置默认节点，设置默认节点如果碰到不识别的枚举值，就让它路由到默认节点，如不设置不识别就报错
   3. 修改`partition-hash-int.txt`配置文件

      ```xml
      110=0
      120=1
      ```
   4. 重启`MyCat`
   5. 访问`MyCat`创建表

      ```sql
      // 订单归属区域信息表
      CREATE TABLE orders_ware_info(
          `id` INT AUTO_INCREMENT comment '编号',
          `order_id` INT comment '订单编号',
          `address` VARCHAR(200) comment '地址',
          `areacode` VARCHAR(20) comment '区域编号',
          PRIMARY KEY(id)
      );
      ```
   6. 插入数据

      ```sql
      INSERT INTO orders_ware_info(id, order_id,address,areacode) VALUES (1,1,'北京','110');
      INSERT INTO orders_ware_info(id, order_id,address,areacode) VALUES (2,2,'天津','120');
      ```
   7. 查询`MyCat`、`dn1`、`dn2`可以看到数据分片效果

      ```sql
      select * from orders_ware_info;
      ```
3. 范围约定
   此分片适用于，提前规划好分片字段某个范围属于哪个分片。
   1. 修改`schema.xml`配置文件

      ```xml
      <table name="payment_info" dataNode="dn1,dn2" rule="auto_sharding_long" ></table>
      ```
   2. 修改`rule.xml`配置文件

      ```xml
      <tableRule name="auto_sharding_long">
          <rule>
              <columns>order_id</columns>
              <algorithm>rang-long</algorithm>
          </rule>
      </tableRule>
      ......
      <function name="rang-long" class="io.mycat.route.function.AutoPartitionByLong">
          <property name="mapFile">autopartition-long.txt</property>
          <property name="defaultNode">0</property>
      </function>
      ```

      * `columns`：分片字段
      * `algorithm`：分片函数
      * `mapFile`：标识配置文件名称
      * `defaultNode`：默认节点，小于 0 表示不设置默认节点，大于等于 0 表示设置默认节点，设置默认节点如果碰到不识别的枚举值，就让它路由到默认节点，如不设置不识别就报错
   3. 修改`autopartition-long.txt`配置文件

      ```txt
      0-102=0
      103-200=1
      ```
   4. 重启`MyCat`
   5. 访问`MyCat`创建表

      ```sql
      // 支付信息表 
      CREATE TABLE payment_info(
          `id` INT AUTO_INCREMENT comment '编号',
          `order_id` INT comment '订单编号',
          `payment_status` INT comment '支付状态',
          PRIMARY KEY(id)
      );
      ```
   6. 插入数据

      ```sql
      INSERT INTO payment_info (id,order_id,payment_status) VALUES (1,101,0);
      INSERT INTO payment_info (id,order_id,payment_status) VALUES (2,102,1);
      INSERT INTO payment_info (id,order_id ,payment_status) VALUES (3,103,0);
      INSERT INTO payment_info (id,order_id,payment_status) VALUES (4,104,1);
      ```
   7. 查询`MyCat`、`dn1`、`dn2`可以看到数据分片效果

      ```sql
      select * from payment_info;
      ```
4. 按日期（天）分片
   此规则为按天分片。设定时间格式、范围
   1. 修改`schema.xml`配置文件

      ```xml
      <table name="login_info" dataNode="dn1,dn2" rule="sharding_by_date" ></table>
      ```
   2. 修改`rule.xml`配置文件

      ```xml
      <tableRule name="sharding_by_date">
          <rule>
              <columns>login_date</columns>
              <algorithm>shardingByDate</algorithm>
          </rule>
      </tableRule>
      ......
      <function name="shardingByDate" class="io.mycat.route.function.PartitionByDate">
          <property name="dateFormat">yyyy-MM-dd</property>
          <property name="sBeginDate">2019-01-01</property>
          <property name="sEndDate">2019-01-04</property>
          <property name="sPartionDay">2</property> 
      </function>
      ```

      * `columns`：分片字段
      * `algorithm`：分片函数
      * `dateFormat`：日期格式
      * `sBeginDate`：开始日期
      * `sEndDate`：结束日期,则代表数据达到了这个日期的分片后循环从开始分片
      * `sPartionDay`：分区天数，即默认从开始日期算起，分隔 2 天一个分区
   3. 重启`MyCat`
   4. 访问`MyCat`创建表

      ```sql
      // 用户信息表 
      CREATE TABLE login_info(
          `id` INT AUTO_INCREMENT comment '编号',
          `user_id` INT comment '用户编号',
          `login_date` date comment '登录日期',
          PRIMARY KEY(id)
      );
      ```
   5. 插入数据

      ```sql
      INSERT INTO login_info(id,user_id,login_date) VALUES (1,101,'2019-01-01');
      INSERT INTO login_info(id,user_id,login_date) VALUES (2,102,'2019-01-02');
      INSERT INTO login_info(id,user_id,login_date) VALUES (3,103,'2019-01-03');
      INSERT INTO login_info(id,user_id,login_date) VALUES (4,104,'2019-01-04');
      INSERT INTO login_info(id,user_id,login_date) VALUES (5,103,'2019-01-05');
      INSERT INTO login_info(id,user_id,login_date) VALUES (6,104,'2019-01-06');
      ```
   6. 查询`MyCat`、`dn1`、`dn2`可以看到数据分片效果

      ```sql
      select * from login_info;
      ```

### 全局序列

　　在实现分库分表的情况下，数据库自增主键已无法保证自增主键的全局唯一；为此，`MyCat`提供了全局`sequence`，并且提供了包含本地配置和数据库配置等多种实现方式。

1. 本地文件  
    此方式`MyCat`将`sequence`配置到文件中，当使用到`sequence`中的配置后，`MyCat`会更下`classpath`中的`sequence_conf.properties`文件中`sequence`当前的值。

    * 优点：本地加载，读取速度较快C
    * 缺点：抗风险能力差，`MyCat`所在主机宕机后，无法读取本地文件
2. 数据库方式  
    利用数据库一个表 来进行计数累加。但是并不是每次生成序列都读写数据库，这样效率太低。

    `MyCat`会预加载一部分号段到`MyCat`的内存中，这样大部分读写序列都是在内存中完成的，如果内存中的号段用完了`MyCat`会再向数据库要一次。  
    问：如果`MyCat`崩溃了，那内存中的序列岂不是都没了？<br />答：是的。如果是这样，那么`MyCat`启动后会向数据库申请新的号段，原有号段会弃用；也就是说如果`MyCat`重启，那么损失是当前的号段没用完的号码，但是不会因此出现主键重复。

    1. 建库序列脚本

        1. 在`dn1`上创建全局序列表

            ```sql
            CREATE TABLE MYCAT_SEQUENCE (NAME VARCHAR(50) NOT NULL,current_value INT NOT
            NULL,increment INT NOT NULL DEFAULT 100, PRIMARY KEY(NAME)) ENGINE=INNODB;
            ```
        2. 创建全局序列所需函数

            ```sql
            DELIMITER $$ 
            CREATE FUNCTION mycat_seq_currval(seq_name VARCHAR(50)) RETURNS VARCHAR(64)
            DETERMINISTIC 
            BEGIN
            DECLARE retval VARCHAR(64);
            SET retval="-999999999,null";
            SELECT CONCAT(CAST(current_value AS CHAR),",",CAST(increment AS CHAR)) INTO retval FROM MYCAT_SEQUENCE WHERE NAME = seq_name;
            RETURN retval;
            END $$
            DELIMITER;
            DELIMITER $$
            CREATE FUNCTION mycat_seq_setval(seq_name VARCHAR(50),VALUE INTEGER) RETURNS 
            VARCHAR(64)
            DETERMINISTIC
            BEGIN
            UPDATE MYCAT_SEQUENCE
            SET current_value = VALUE
            WHERE NAME = seq_name;
            RETURN mycat_seq_currval(seq_name);
            END $$
            DELIMITER;
            DELIMITER $$
            CREATE FUNCTION mycat_seq_nextval(seq_name VARCHAR(50)) RETURNS VARCHAR(64) 
            DETERMINISTIC
            BEGIN
            UPDATE MYCAT_SEQUENCE
            SET current_value = current_value + increment WHERE NAME = seq_name;
            RETURN mycat_seq_currval(seq_name);
            END $$
            DELIMITER;
            ```
        3. 初始化序列表记录

            ```sql
            INSERT INTO MYCAT_SEQUENCE(NAME,current_value,increment) VALUES ('ORDERS', 400000, 100);
            ```
    2. 修改`MyCat`配置

        1. 修改`sequence_db_conf.properties`  
            意思是`orders`这个序列在`dn1`这个节点上，具体`dn1`节点是哪台机子，请参考`schema.xml`

            ```properties
            # sequence_db_conf.properties
            GLOBAL=dn1
            COMPANY=dn1
            CUSTOMER=dn1
            ORDERS=dn1
            ```
        2. 修改`server.xml`  
            全局序列类型：

            * 0：本地文件
            * 1：数据库方式
            * 2：时间戳方式

            此处应该修改成 1。

            ```xml
            <property name="sequnceHandlerType">1</property>
            <!--<property name="useCompression">1</property>-->
            ```
        3. 重启`MyCat`
    3. 验证全局序列

        1. 登录`MyCat`，插入数据

            ```sql
            insert into orders(id,amount,customer_id,order_type) values(next value for MYCATSEQ_ORDERS, 1000, 101, 102);
            ```
        2. 查询数据

            ```sql
            select * from orders;
            ```
        3. 重启`MyCat`后，再次插入数据，再查询
3. 时间戳方式  
    全局序列`ID= 64`位二进制  
    42（毫秒）+ 5（机器 ID）+ 5（业务编码）+ 12（重复累加）换算成十进制为 18 位数的`long`类型，每毫秒可以并发 12 位二进制的累加。

    * 优点：配置简单
    * 缺点：18 位`ID`过长
4. 自主生成全局序列  
    可在`Java`项目里自己生成全局序列，如下：

    1. 根据业务逻辑组合
    2. 可以利用`Redis`的单线程原子性`incr`来生成序列，但，自主生成需要单独在工程中用`Java` 代码实现，还是推荐使用`MyCat`自带全局序列

## 基于 HA 机制的 MyCat 高可用

　　在实际项目中，`MyCat`服务也需要考虑高可用性，如果`MyCat`所在服务器出现宕机，或`MyCat`服<br />务故障，需要有备机提供服务，需要考虑`MyCat`集群。

### 高可用方案

　　可以使用`HAProxy + Keepalived`配合两台`MyCat`搭起`MyCat`集群，实现高可用性。`HAProxy`实现了`MyCat`多节点的集群高可用和负载均衡，而`HAProxy`自身的高可用则可以通过`Keepalived`来实现。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/mycat-haproxy-keepalived.png)

|编号|角色|`IP`地址|机器名|
| ------| ----------------------| -----------------| --------|
|1|Mycat1|192.168.140.128|host79|
|2|Mycat2<br />|192.168.140.127|host80|
|3|HAProxy（master）|192.168.140.126|host81|
|4|Keepalived（master）|192.168.140.126|host81|
|5|HAProxy（backup）|192.168.140.125|host82|
|6|Keepalived（backup）|192.168.140.125|host82|

### 安装配置 HAProxy

1. 安装`HAProxy`
   1. 准备好`HAProxy`安装包，传到`/opt`目录下
   2. 解压到`/usr/local/src`

      ```bash
      tar -zxvf haproxy-1.5.18.tar.gz -C /usr/local/src
      ```
   3. 进入解压后的目录，查看内核版本，进行编译

      ```bash
      cd /usr/local/src/haproxy-1.5.18
      uname -r
      make TARGET=linux310 PREFIX=/usr/local/haproxy ARCH=x86_64
      ```

      * `ARGET=linux310`：内核版本，使用`uname -r`查看内核，如：`3.10.0-514.el7`，此时该参数就为`linux310`
      * `ARCH=x86_64`：系统位数
      * `PREFIX=/usr/local/haprpxy`：`/usr/local/haprpxy`，为`HAPrpxy`安装路径
   4. 编译完成后，进行安装

      ```bash
      make install PREFIX=/usr/local/haproxy
      ```
   5. 安装完成后，创建目录、创建`HAProxy`配置文件

      ```bash
      mkdir -p /usr/data/haproxy/
      vim /usr/local/haproxy/haproxy.conf
      ```
   6. 向配置文件中插入以下配置信息,并保存

      ```conf
      global
          log 127.0.0.1 local0
          #log 127.0.0.1 local1 notice
          #log loghost local0 info
          maxconn 4096
          chroot /usr/local/haproxy
          pidfile /usr/data/haproxy/haproxy.pid
          uid 99
          gid 99
          daemon
          #debug
          #quiet
      defaults
          log global
          mode tcp
          option abortonclose
          option redispatch
          retries 3
          maxconn 2000
          timeout connect 5000
          timeout client 50000
          timeout server 50000
      listen proxy_status 
          bind :48066
              mode tcp
              balance roundrobin
              server mycat_1 192.168.140.128:8066 check inter 10s
              server mycat_2 192.168.140.127:8066 check inter 10s
      frontend admin_stats 
          bind :7777
              mode http
              stats enable
              option httplog
              maxconn 10
              stats refresh 30s
              stats uri /admin
              stats auth admin:123123
              stats hide-version
              stats admin if TRUE
      ```
2. 启动验证
   1. 启动`HAProxy`
      ```bash
      /usr/local/haproxy/sbin/haproxy -f /usr/local/haproxy/haproxy.conf
      ```
   2. 查看`HAProxy`进程
      ```bash
      ps -ef|grep haproxy
      ```
   3. 打开浏览器访问`http://192.168.140.125:7777/admin`
      * 在弹出框输入用户名：`admin`密码：`123456`
      * 如果`MyCat`主备机均已启动，则可以看到如下图（`MyCat1`和`MyCat2`全绿）
   4. 验证负载均衡，通过`HAProxy`访问`MyCat`
      ```bash
      mysql -umycat -p123456 -h 192.168.140.126 -P 48066
      ```

### 配置 Keepalived

1. 安装`Keepalived`
   1. 准备好`Keepalived`安装包，传到`/opt`目录下
   2. 解压到`/usr/local/src`

      ```bash
      tar -zxvf keepalived-1.4.2.tar.gz -C /usr/local/src
      ```
   3. 安装依赖插件

      ```bash
      yum install -y gcc openssl-devel popt-devel
      ```
   4. 进入解压后的目录，进行配置，进行编译

      ```bash
      cd /usr/local/src/keepalived-1.4.2
      ./configure --prefix=/usr/local/keepalived
      ```
   5. 进行编译，完成后进行安装

      ```bash
      make && make install
      ```
   6. 运行前配置

      ```bash
      cp /usr/local/src/keepalived-1.4.2/keepalived/etc/init.d/keepalived /etc/init.d/
      mkdir /etc/keepalived
      cp /usr/local/keepalived/etc/keepalived/keepalived.conf /etc/keepalived/
      cp /usr/local/src/keepalived-1.4.2/keepalived/etc/sysconfig/keepalived /etc/sysconfig/
      cp /usr/local/keepalived/sbin/keepalived /usr/sbin/
      ```
   7. 修改配置文件

      ```bash
      vim /etc/keepalived/keepalived.conf
      ```

      ```conf
      # 修改内容如下
      ! Configuration File for keepalived
      global_defs {
          notification_email {
              xlcocoon@foxmail.com
          }
          notification_email_from keepalived@showjoy.com
          smtp_server 127.0.0.1
          smtp_connect_timeout 30
          router_id LVS_DEVEL
          vrrp_skip_check_adv_addr
          vrrp_garp_interval 0
          vrrp_gna_interval 0
      }
      vrrp_instance VI_1 {
          # 主机配 MASTER，备机配 BACKUP
          state MASTER
          # 所在机器网卡
          interface ens33
          virtual_router_id 51
          # 数值越大优先级越高
          priority 100
          advert_int 1
          authentication {
              auth_type PASS
              auth_pass 1111
          }
          virtual_ipaddress {
              # 虚拟 IP
              192.168.140.200
          }
      }
      virtual_server 192.168.140.200 48066 {
          delay_loop 6
          lb_algo rr
          lb_kind NAT
          persistence_timeout 50
          protocol TCP
          real_server 192.168.140.125 48066 {
              weight 1
              TCP_CHECK {
                  connect_timeout 3
                  retry 3
                  delay_before_retry 3
              }
          }
          real_server 192.168.140.126 48600 {
              weight 1
              TCP_CHECK {
                  connect_timeout 3
                  nb_get_retry 3
                  delay_before_retry 3
              }
          }
      }
      ```
2. 启动验证
   1. 启动`Keepalived`
      ```bash
      service keepalived start
      ```
   2. 登录验证
      ```bash
      mysql -umycat -p123456 -h 192.168.140.200 -P 48066
      ```

### 测试高可用

1. 关闭`MyCat`
2. 通过虚拟`IP`查询数据
   ```bash
   mysql -umycat -p123456 -h 192.168.140.200 -P 48066
   ```

# MyCat 安全设置

## 权限配置

### user 标签权限控制

　　目前`MyCat`对于中间件的连接控制并没有做太复杂的控制，目前只做了中间件逻辑库级别的读<br />写权限控制。是通过`server.xml`的`user`标签进行配置。

```xml
<!-- server.xml 配置文件 user 部分 -->
<user name="mycat">
    <property name="password">123456</property>
    <property name="schemas">TESTDB</property>
</user>
<user name="user">
    <property name="password">user</property>
    <property name="schemas">TESTDB</property>
    <property name="readOnly">true</property>
</user>
```

#### 配置说明

|标签属性|说明|
| ----------| ----------------------------------------------------------------|
|`name`|应用连接中间件逻辑库的用户名|
|`password`|该用户对应的密码|
|`TESTDB`|应用当前连接的逻辑库中所对应的逻辑表，`schemas`中可以配置一个或多个|
|`readOnly`|应用连接中间件逻辑库所具有的权限<br />`true`为只读，`false`为读写都有，默认为`false`<br />|

#### 测试案例一

　　使用`user`用户，权限为只读（`readOnly：true`），验证是否可以查询出数据，验证是否可以写入数据。

1. 用`user`用户登录
   ```bash
   mysql -uuser -puser -h 192.168.140.128 -P8066
   ```
2. 切换到`TESTDB`数据库，查询`orders`表数据
   ```sql
   use TESTDB
   select * from orders;
   ```
3. 执行插入数据`sql`，可看到运行结果，插入失败，只有只读权限
   ```sql
   insert into orders(id,order_type,customer_id,amount) values(7,101,101,10000);
   ```

#### 测试案例二

　　使用`mycat`用户，权限为可读写（`readOnly：false`），验证是否可以查询出数据，验证是否可以写入数据。

1. 用`mycat`用户登录
   ```bash
   mysql -umycat -p123456 -h 192.168.140.128 -P8066
   ```
2. 切换到`TESTDB`数据库，查询`orders`表数据
   ```sql
   use TESTDB
   select * from orders;
   ```
3. 执行插入数据`sql`，可看到运行结果，插入成功
   ```sql
   insert into orders(id,order_type,customer_id,amount) values(7,101,101,10000);
   ```

### privileges 标签权限控制

　　在`user`标签下的`privileges`标签可以对逻辑库（`schema`）、表（`table`）进行精细化的`DML`权限控制。<br />`privileges`标签下的`check`属性，如为`true`开启权限检查，为`false`不开启，默认为`false`。

　　由于`Mycat`一个用户的`schemas`属性可配置多个逻辑库（`schema`） ，所以`privileges`的下级节点`schema`节点同样可配置多个，对多库多表进行细粒度的`DML`权限控制。

```xml
<!-- server.xml 配置文件 privileges 部分 -->
<!-- 配置 orders 表没有增删改查权限 -->
<user name="mycat">
    <property name="password">123456</property>
    <property name="schemas">TESTDB</property>
    <!-- 表级 DML 权限设置 -->
    <privileges check="true">
        <schema name="TESTDB" dml="1111" >
            <table name="orders" dml="0000"></table>
            <!--<table name="tb02" dml="1111"></table>-->
        </schema>
    </privileges>
</user>
```

#### 配置说明

|`DML`权限|增加（`insert`）|更新（`update`）|查询（`select`）|删除（`delete`）|
| ------| ----------| ----------| ----------| ----------|
|0000|禁止|禁止|禁止|禁止|
|0010|禁止<br />|禁止|可以|禁止|
|1110|可以|禁止|禁止|禁止|
|1111|可以|可以|可以|可以|

#### 测试案例一

　　使用`mycat`用户，`privileges`配置`orders`表权限为禁止增删改查（`dml="0000"`），验证是否可以查询出数据，验证是否可以写入数据。

1. 重启`MyCat`，用`mycat`用户登录
   ```bash
   mysql -umycat -p123456 -h 192.168.140.128 -P8066
   ```
2. 切换到`TESTDB`数据库，查询`orders`表数据，发现禁止该用户查询数据
   ```sql
   use TESTDB
   select * from orders;
   ```
3. 执行插入数据`sql`，可看到运行结果，禁止该用户插入数据
   ```sql
   insert into orders(id,order_type,customer_id,amount) values(8,101,101,10000);
   ```

#### 测试案例二

　　使用`mycat`用户，`privileges`配置`orders`表权限为可以增删改查（`dml="1111"`），验证是否可以查询出数据，验证是否可以写入数据。

1. 重启`MyCat`，用`mycat`用户登录
   ```bash
   mysql -umycat -p123456 -h 192.168.140.128 -P8066
   ```
2. 切换到`TESTDB`数据库，查询`orders`表数据
   ```sql
   use TESTDB
   select * from orders;
   ```
3. 执行插入数据`sql`，可看到运行结果，插入成功
   ```sql
   insert into orders(id,order_type,customer_id,amount) values(8,101,101,10000);
   ```
4. 执行删除数据`sql`，可看到运行结果，删除成功
   ```sql
   delete from orders where id in (7,8);
   ```

## SQL 拦截

　　`firewall`标签用来定义防火墙；`firewall`下`whitehost`标签用来定义`IP`白名单，`blacklist`用来定义`SQL`黑名单。

### 白名单

　　可以通过设置白名单，实现某主机某用户可以访问`MyCat`，而其他主机用户禁止访问。

1. 设置白名单
   ```xml
   <!-- server.xml 配置文件 firewall 标签 -->
   <~-- 配置只有 192.168.140.128 主机可以通过 mycat 用户访问 -->
   <firewall>
       <whitehost>
           <host host="192.168.140.128" user="mycat"/>
       </whitehost>
   </firewall>
   ```
2. 重启`MyCat`后，`192.168.140.128`主机使用`mycat`用户访问，可以正常访问，使用`user`用户访问，禁止访问；在`192.168.140.127`主机用`mycat`用户访问，禁止访问
   ```bash
   mysql -umycat -p123456 -h 192.168.140.128 -P 8066
   ```

### 黑名单

　　可以通过设置黑名单，实现`MyCat`对具体`SQL`操作的拦截，如增删改查等操作的拦截。

1. 设置黑名单
   ```xml
   <!-- server.xml 配置文件 firewall 标签 -->
   <!-- 配置禁止 mycat 用户进行删除操作 -->
   <firewall>
       <whitehost>
           <host host="192.168.140.128" user="mycat"/>
       </whitehost>
       <blacklist check="true">
           <property name="deleteAllow">false</property>
       </blacklist>
   </firewall>
   ```
2. 重启`MyCat`后，`192.168.140.128`主机使用`mycat`用户访问，可以正常访问
   ```bash
   mysql -umycat -p123456 -h 192.168.140.128 -P 8066
   ```
3. 切换`TESTDB`数据库后，执行删除数据语句，发现已禁止删除数据
   ```sql
   delete from orders where id=7;
   ```

　　可以设置的黑名单`SQL`拦截功能列表：

|配置项|缺省值|描述|
| --------| --------| ------------------|
|`selelctAllow`|`true`|是否允许执行`SELECT`语句|
|`deleteAllow`|`true`|是否允许执行`DELETE`语句|
|`updateAllow`|`true`|是否允许执行`UPDATE`语句|
|`insertAllow`|`true`<br />|是否允许执行`INSERT`语句|
|`createTableAllow`|`true`|是否允许创建表|
|`setAllow`|`true`|是否允许使用`SET`语法|
|`alterTableAllow`|`true`|是否允许执行`Alter Table`语句|
|`dropTableAllow`|`true`|是否允许修改表|
|`commitAllow`|`true`|是否允许执行`commit`操作|
|`rollbackAllow`|`true`|是否允许执行`roll back`操作|

# MyCat 监控工具

## MyCat-Web 简介

　　`Mycat-Web`是`MyCat`可视化运维的管理和监控平台，弥补了`MyCat`在监控上的空白。帮`MyCat`分<br />担统计任务和配置管理任务。`Mycat-Web`引入了`ZooKeeper`作为配置中心，可以管理多个节点。

　　`Mycat-Ceb`主要管理和监控`MyCat`的流量、连接、活动线程和内存等，具备`IP`白名单、邮件告警等模块，还可以统计`SQL`并分析慢`SQL`和高频`SQL`等。为优化`SQL`提供依据。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/mycat-summary/mycat-web.png)

## MyCat-Web 配置使用

1. `ZooKeeper`安装
   1. [下载安装包](http://zookeeper.apache.org/
      )
   2. 安装包拷贝到`Linux`系统`/opt`目录下，并解压
      ```bash
      tar -zxvf zookeeper-3.4.11.tar.gz
      ```
   3. 进入`ZooKeeper`解压后的配置目录（`conf`），复制配置文件并改名
      ```bash
      cp zoo_sample.cfg zoo.cfg
      ```
   4. 进入`ZooKeeper`的命令目录（`bin`），运行启动命令
      ```bash
      ./zkServer.sh start
      ```
   5. `ZooKeeper`服务端口为 $2181$，查看服务已经启动
      ```bash
      netstat -ant | grep 2181
      ```
2. `MyCat-Web`安装
   1. [下载安装包](http://www.mycat.io
      )
   2. 安装包拷贝到`Linux`系统`/opt`目录下，并解压
      ```bash
      tar -zxvf Mycat-web-1.0-SNAPSHOT-20170102153329-linux.tar.gz
      ```
   3. 拷贝`mycat-web`文件夹到`/usr/local`目录下
      ```bash
      cp -r mycat-web /usr/local
      ```
   4. 进入`mycat-web`的目录下运行启动命令
      ```bash
      cd /usr/local/mycat-web/
      ./start.sh &
      ```
   5. `MyCat-Web`服务端口为 8082，查看服务已经启动
      ```bash
      netstat -ant | grep 8082
      ```
   6. 通过地址访问服务`http://192.168.140.127:8082/mycat/`
3. `MyCat-Web`配置
   1. 在注册中心配置`ZooKeeper`地址，配置后刷新页面
   2. 新增`MyCat`监控实例

## Mycat 性能监控指标

　　在`Mycat-web`上可以进行`Mycat`性能监控，例如：内存分享、流量分析、连接分析、活动线程分析等等。
