---
date: 2023-08-05
article: true
timeline: true
index: true
title: Nginx 总结
category: Nginx
tag:
- Nginx
---

# 简介

## Nginx 概述

　　`Nginx`是一个高性能的`HTTP`和反向代理服务器，特点是占有内存少，并发能力强。事实上`Nginx`的并发能力确实在同类型的网页服务器中表现较好，中国大陆使用`Nginx`网站用户有：百度、京东、新浪、网易、腾讯、淘宝等。

## Nginx 作为 web 服务器

　　`Nginx`可以作为静态页面的`Web`服务器，同时还支持`CGI`协议的动态语言，比如`perl`、`php`等。但是不支持`Java`。`Java`程序只能通过与`Tomcat`配合完成。`Nginx`专为性能优化而开发，性能是其最重要的考量，实现上非常注重效率 ，能经受高负载的考验,有报告表明能支持高达 $50000$ 个并发连接数。

　　`https://lnmp.org/nginx.html`

## 正向代理

　　`Nginx`不仅可以做反向代理，实现负载均衡。还能用作正向代理来进行上网等功能。

　　正向代理：如果把局域网外的`Internet`想象成一个巨大的资源库，则局域网中的客户端要访问`Internet`，则需要通过代理服务器来访问，这种代理服务就称为正向代理。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/forward-proxy.png)

## 反向代理

　　反向代理，其实客户端对代理是无感知的，因为客户端不需要任何配置就可以访问，只需要将请求发送到反向代理服务器，由反向代理服务器去选择目标服务器获取数据后，在返回给客户端，此时反向代理服务器和目标服务器对外就是一个服务器，暴露的是代理服务器地址，隐藏了真实服务器`IP`地址。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/reverse-proxy.png)

## 负载均衡

　　客户端发送多个请求到服务器，服务器处理请求，有一些可能要与数据库进行交互，服务器处理完毕后，再将结果返回给客户端。

　　这种架构模式对于早期的系统相对单一，并发请求相对较少的情况下是比较适合的，成本也低。但是随着信息数量的不断增长，访问量和数据量的飞速增长，以及系统业务的复杂度增加，这种架构会造成服务器相应客户端的请求日益缓慢，并发量特别大的时候，还容易造成服务器直接崩溃。很明显这是由于服务器性能的瓶颈造成的问题，那么如何解决这种情况呢？

　　首先想到的可能是升级服务器的配置，比如提高`CPU`执行频率，加大内存等提高机器的物理性能来解决此问题，但是应该知道由于摩尔定律的日益失效，硬件的性能提升已经不能满足日益提升的需求了。最明显的一个例子，天猫双十一当天，某个热销商品的瞬时访问量是极其庞大的，那么类似上面的系统架构，将机器都增加到现有的顶级物理配置，都是不能够满足需求的。那么怎么办呢？

　　通过上面的分析，去掉了增加服务器物理配置来解决问题的办法，也就是说纵向解决问题的办法行不通了，那么横向增加服务器的数量呢？这时候集群的概念产生了，单个服务器解决不了，就增加服务器的数量，然后将请求分发到各个服务器上，将原先请求集中到单个服务器上的情况改为将请求分发到多个服务器上，将负载分发到不同的服务器，也就是所说的负载均衡。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/load-balance.png)

## 动静分离

　　为了加快网站的解析速度，可以把动态页面和静态页面由不同的服务器来解析，加快解析速度。降低原来单个服务器的压力。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/dynamic-static-separate.png)

# 安装

## 普通版

1. 进入`Nginx`[官网](http://nginx.org/)下载
2. 安装`Nginx`
   1. 安装`openssl`、`zlib`、`gcc`依赖

      ```
      [root@localhost home]# yum -y install make zlib zlib-devel gcc-c++ libtool openssl openssl-devel
      ```
   2. 安装`pcre`

      ```bash
      [root@localhost home]# wget http://downloads.sourceforge.net/project/pcre/pcre/8.45/pcre-8.45.tar.gz
      [root@localhost home]# tar -xvf pcre-8.45.tar.gz
      [root@localhost home]# cd pcre-8.45/
      [root@localhost pcre-8.45]# ./configure
      [root@localhost pcre-8.45]# make && make install
      ```
   3. 安装`nginx`

      ```bash
      [root@localhost home]# tar -xvf nginx-1.21.4.tar.gz
      [root@localhost home]# cd nginx-1.21.4/
      [root@localhost nginx-1.21.4]# ./configure
      [root@localhost nginx-1.21.4]# make && make install
      ```
   4. 进入目录`/usr/local/nginx/sbin/nginx`启动服务

      * 因为防火墙问题，在`windows`系统中访问`linux`中的`nginx`，默认不能访问的
        1. 查看开放的端口号
           ```bash
           [root@localhost nginx-1.21.4]# firewall-cmd --list-all
           public (active)
             target: default
             icmp-block-inversion: no
             interfaces: ens160
             sources:
             services: cockpit dhcpv6-client ssh
             ports:
             protocols:
             masquerade: no
             forward-ports:
             source-ports:
             icmp-blocks:
             rich rules:
           [root@localhost nginx-1.21.4]#
           ```
        2. 设置开放的端口号
           ```bash
           [root@localhost nginx-1.21.4]# firewall-cmd --add-port=80/tcp --permanent
           success
           ```
        3. 重启防火墙
           ```bash
           [root@localhost nginx-1.21.4]# firewall-cmd --add-port=80/tcp --permanent
           success
           [root@localhost nginx-1.21.4]# firewall-cmd -–reload
           ```

## Docker 版

　　见 [Docker-镜像与容器](assets/01.镜像与容器-20220116221224-5423vi3.md)

　　此外，运行容器时要挂载目录：

```bash
[root@localhost container]# docker run -d -p 80:80 --name nginx01 nginx:latest
[root@localhost container]# docker stop 8bea

[root@localhost home]# mkdir -p /home/docker/nginx/{log,ssl,html,conf/conf.d}
[root@localhost home]# docker cp nginx01:/etc/nginx/nginx.conf /home/docker/nginx/conf/nginx.conf
[root@localhost home]# docker cp nginx01:/etc/nginx/conf.d/default.conf /home/docker/nginx/conf/conf.d/default.conf

[root@localhost container]# docker ps
[root@localhost container]# rm -rf *

[root@localhost home]# docker run --name nginx01 -d --restart=always --privileged=true \
-v /home/docker/nginx/html:/usr/share/nginx/html \
-v /home/docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf \
-v /home/docker/nginx/conf/conf.d/default.conf:/etc/nginx/conf.d/default.conf \
-v /home/docker/nginx/log:/var/log/nginx \
-v /home/docker/nginx/ssl:/ssl/ \
-p 443:443 -p 80:80 nginx
```

# 常用命令和配置文件

## 常用命令

1. 查看版本号
   * 在`/usr/local/nginx/sbin`目录下执行`./nginx -v`
2. 启动
   * 在`/usr/local/nginx/sbin`目录下执行`./nginx`
3. 关闭
   * 在`/usr/local/nginx/sbin`目录下执行`./nginx -s stop`
4. 重新加载
   * 在`/usr/local/nginx/sbin`目录下执行`./nginx-sreload`

## 配置文件

```bash
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}
```

### 配置文件位置

* 默认的配置文件都放在`Nginx`安装目录下的`conf`目录下
* `/usr/local/nginx/conf/nginx.conf`

### 配置文件中的内容

#### 全局块

　　配置服务器整体运行的配置指令。

　　从配置文件开始到`events`块之间的内容，主要会设置一些影响`Nginx`服务器整体运行的配置指令，主要包括配置运行`Nginx`服务器的用户（组）、允许生成的`worker_process`数，进程`PID`存放路径、日志存放路径和类型以及配置文件的引入等。

```bash
worker_processes auto;
```

　　`worker_processes`是`Nginx`服务器并发处理服务的关键配置，`worker_processes`值越大，可以支持的并发处理量也越多，但是会受到硬件、软件等设备的制约。

#### events 块

　　影响`Nginx`服务器与用户的网络连接。

　　`events`块涉及的指令主要影响`Nginx`服务器与用户的网络连接，常用的设置包括是否开启对多`work_process`下的网络连接进行序列化，是否允许同时接收多个网络连接，选取哪种事件驱动模型来处理连接请求，每个`work_process`可以同时支持的最大连接数等。

```bash
events {
    worker_connections  1024;
}
```

　　上述例子就表示每个`work_process`支持的最大连接数为 1024。这部分的配置对`Nginx`的性能影响较大，在实际中应该灵活配置。

#### http块

```bash
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}
```

　　`http`块算是`Nginx`服务器配置中最频繁的部分，代理、缓存和日志定义等绝大多数功能和第三方模块的配置都在这里。  
需要注意的是，`http`块包括`http`全局块和`server`块。

##### http 全局块

　　`http`全局块配置的指令包括文件引入、`MIME-TYPE`定义、日志自定义、连接超时时间、单链接请求数上限等。

##### server 块

　　`server`块和虚拟主机有密切关系，虚拟主机从用户角度看，和一台独立的硬件主机是完全一样的，该技术的产生是为了节省互联网服务器硬件成本。  

　　每个`http`块可以包括多个`server`块，而每个`server`块就相当于一个虚拟主机。而每个 `server`块也分为全局`server`块，以及可以同时包含多个`locaton`块。

* 全局`server`块  
  最常见的配置是本虚拟机主机的监听配置和本虚拟主机的名称或IP配置。
* `locaton`块  
  一个`server`块可以配置多个`location`块。  
  这块的主要作用是基于`Nginx`服务器接收到的请求字符串（例如`server_name/uri-string`），对虚拟主机名称（也可以是`IP`别名）之外的字符串（例如前面的`/uri-string`）进行匹配，对特定的请求进行处理。地址定向、数据缓存和应答控制等功能，还有许多第三方模块的配置也在这里进行。

# 实例

## 反向代理

### 案例 1

#### 实现效果

　　打开浏览器，在浏览器地址栏输入地址 [www.123.com](http://www.123.com/)，跳转到`Liunx`系统`Tomcat`主页面中。

#### 实现步骤

1. 在`Liunx`系统安装`Tomcat`，使用默认端口 $8080$

    * 普通版

      1. `Tomcat`安装文件放到`Liunx`系统中，解压
      2. 进入`Tomcat`的`bin`目录中，`./startup.sh`启动`tomcat`服务器
    * `Docker`版

      见 [Docker-镜像与容器](assets/01.镜像与容器-20220116221224-f8q6z2d.md)，此外，在运行容器时要挂载卷。

      ```bash
      [root@localhost home]# mkdir -p docker/tomcat/{webapps,logs}
      [root@localhost home]# docker run -d --name=tomcat01 -p 8080:8080 -v /home/docker/tomcat/webapps:/usr/local/tomcat/webapps -v /home/docker/tomcat/logs/:/usr/local/tomcat/logs tomcat
      3a53c13628d1e4e6572979e0a60c91b5f1799e27a68ebf23e97f18ad0e542343
      [root@localhost home]#
      ```
2. 对外开放访问的端口

    ```bash
    # 对外开放访问的端口
    [root@localhost home]# firewall-cmd --add-port=8080/tcp --permanent
    success
    # 重启防火墙
    [root@localhost home]# firewall-cmd --reload
    success
    # 查看已经开放的端口号
    [root@localhost home]# firewall-cmd --list-all
    public (active)
      target: default
      icmp-block-inversion: no
      interfaces: ens160
      sources:
      services: cockpit dhcpv6-client ssh
      ports: 80/tcp 8080/tcp
      protocols:
      masquerade: no
      forward-ports:
      source-ports:
      icmp-blocks:
      rich rules:
    [root@localhost home]#
    ```
3. 在`Windows`系统的`C:\Windows\System32\drivers\et\host`文件进行域名和`ip`对应关系的配置  
    配置完成之后，就可以通过 [www.123.com:8080](www.123.com:8080) 访问到第一步出现的`Tomcat`初始界面；再通过`Nginx`的反向代理，只需要输入 [www.123.com](http://www.123.com/) 就可以跳转到`Tomcat`初始界面。

    ```bash
    # Copyright (c) 1993-2009 Microsoft Corp.
    #
    # This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
    #
    # This file contains the mappings of IP addresses to host names. Each
    # entry should be kept on an individual line. The IP address should
    # be placed in the first column followed by the corresponding host name.
    # The IP address and the host name should be separated by at least one
    # space.
    #
    # Additionally, comments (such as these) may be inserted on individual
    # lines or following the machine name denoted by a '#' symbol.
    #
    # For example:
    #
    #      102.54.94.97     rhino.acme.com          # source server
    #       38.25.63.10     x.acme.com              # x client host

    # localhost name resolution is handled within DNS itself.
    #	127.0.0.1       localhost
    #	::1             localhost
    #屏蔽 BandiZip 联网验证
    0.0.0.0 secure.bandisoft.com
    0.0.0.0 secure-backup.bandisoft.com
    # nginx 配置本地服务器
    192.168.30.128 www.123.com
    ```
4. 在`Nginx`进行请求转发的配置（反向代理配置）

    如下配置，监听 80 端口，访问域名为 [www.123.com](http://www.123.com/)，不加端口号时默认为 80 端口，故访问该域名时会跳转到`192.168.30.128:8080`路径上。

    ```conf
    server {
        listen       80;
        listen  [::]:80;
        # 修改监听的服务器地址
        server_name  192.168.30.128;

        #access_log  /var/log/nginx/host.access.log  main;

        location / {
            root   /usr/share/nginx/html;
            # 增加代理转发的地址
            proxy_pass http://192.168.30.128:8080;
            index  index.html index.htm;
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}

    ```
5. 通过浏览器访问[www.123.com](http://www.123.com/)

#### 访问过程分析

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/access-process-analysis.png)

### 案例 2

* 实现效果
  * 使用`Nginx`反向代理，根据访问的路径跳转到不同端口的服务中，`Nginx`监听端口为 80  
    * 访问 [http://192.168.30.128:80/edu/](http://192.168.30.128:80/edu/) 直接跳转到 [192.168.30.128:8080](192.168.30.128:8080)
    * 访问 [http://192.168.30.128:80/vod/](http://192.168.30.128:80/vod/) 直接跳转到 [192.168.30.128:8081](192.168.30.128:8081)
* 实现步骤
  1. 准备一台服务器安装两个`Tomcat`，一个 8080 端口，一个 8081 端口

     ```bash
     [root@localhost home]# mkdir -p docker/tomcat/tomcat01/{webapps,logs}
     [root@localhost home]# mkdir -p docker/tomcat/tomcat02/{webapps,logs}
     [root@localhost home]# docker run -d --restart=always --name=tomcat0 1 -p 8080:8080 -v /home/docker/tomcat/tomcat01/webapps:/usr/local/tomcat/webapps -v /home/docker/tomcat/tomcat01/logs/:/usr/local/tomcat/logs tomcat
     708bd330e05141098575b4ebbfdbfe5a15970f76c115819fc5b6c56848707135
     [root@localhost home]# docker run -d --restart=always --name=tomcat02 -p 8081:8080 -v /home/docker/tomcat/tomcat02/webapps:/usr/local/tomcat/webapps -v /home/docker/tomcat/tomcat02/logs/:/usr/local/tomcat/logs tomcat
     6ab3d133356e3ea3b551452debfb7caa888b656f92187d78887d2d61e13e4876
     [root@localhost home]#
     ```
  2. 创建文件夹和测试页面

     ```bash
     [root@localhost conf.d]# cd /home/docker/tomcat/
     [root@localhost tomcat]# ls
     tomcat01  tomcat02
     [root@localhost tomcat]# cd tomcat01/webapps/
     [root@localhost webapps]# mkdir edu
     [root@localhost webapps]# cd edu/
     [root@localhost edu]# vi index.html
     [root@localhost edu]# cd ../../../
     [root@localhost tomcat]# cd tomcat02/webapps/
     [root@localhost webapps]# mkdir vod
     [root@localhost webapps]# cd vod/
     [root@localhost vod]# vi index.html
     [root@localhost vod]#
     ```
  3. 开放对外访问的端口号 80、8080、8081  

     ```bash
     [root@localhost home]# firewall-cmd --add-port=8081/tcp --permanent
     success
     [root@localhost home]# firewall-cmd --reload
     success
     [root@localhost home]# firewall-cmd --list-all
     public (active)
       target: default
       icmp-block-inversion: no
       interfaces: ens160
       sources:
       services: cockpit dhcpv6-client ssh
       ports: 80/tcp 8080/tcp 8081/tcp
       protocols:
       masquerade: no
       forward-ports:
       source-ports:
       icmp-blocks:
       rich rules:
     [root@localhost home]#
     ```
  4. 配置`Nginx`反向代理
     在`http`块中添加`server{}`

     ```conf
     server {
         listen       80;
         listen  [::]:80;
         server_name  182.168.30.128;

         #access_log  /var/log/nginx/host.access.log  main;

         location ~ /edu/ {
             proxy_pass http://192.168.30.128:8080;
         }

         location ~ /vod/ {
             proxy_pass http://192.168.30.128:8081;
         }
     }
     ```

     `location`指令说明：该指令用于匹配`URL`
     语法如下：

     ```bash
     location [ = | ~ | ~* | ^~ ] uri {
     }
     ```

     * `=`：用于不含正则表达式的`uri`前，要求请求字符串与`uri`严格匹配，如果匹配成功，就停止继续向下搜索并立即处理该请求
     * `~`：用于表示`uri`包含正则表达式，并且区分大小写
     * `~*`：用于表示`uri`包含正则表达式，并且不区分大小写
     * `^~`：用于不含正则表达式的`uri`前，要求`Nginx`服务器找到标识`uri`和请求字符串匹配度最高的`location`后，立即使用此`location`处理请求，而不再使用`location`块中的正则`uri`和请求字符串做匹配

     注意：如果`uri`包含正则表达式，则必须要有`~`或`~*`标识
  5. 访问[http://192.168.30.128:80/edu/](http://192.168.30.128:80/edu/)、[http://192.168.30.128:80/vod/](http://192.168.30.128:80/vod/)测试

## 负载均衡

　　随着互联网信息的爆炸性增长，负载均衡（`load balance`）已经不再是一个很陌生的话题，  顾名思义，负载均衡即是将负载分摊到不同的服务单元，既保证服务的可用性，又保证响应  足够快，给用户很好的体验。快速增长的访问量和数据流量催生了各式各样的负载均衡产品，  很多专业的负载均衡硬件提供了很好的功能，但却价格不菲，这使得负载均衡软件大受欢迎，`Nginx`就是其中的一个，在`Linux`下有`Nginx`、`LVS`、`Haproxy`等等服务可以提供负载均衡服  务，而且`Nginx`提供了几种分配方式（策略）。

### 实现效果

　　浏览器地址栏输入地址 [http://192.168.30.128/edu/index.html](http://192.168.30.128/edu/index.html)，实现负载均衡效果，平均访问 8080 和 8081 端口。

### 实现步骤

1. 准备一台服务器安装两个`Tomcat`，端口分别是 8080 和 8081  

    ```bash
    [root@localhost home]# mkdir -p docker/tomcat/tomcat01/{webapps,logs}
    [root@localhost home]# mkdir -p docker/tomcat/tomcat02/{webapps,logs}
    [root@localhost home]# docker run -d --restart=always --name=tomcat0 1 -p 8080:8080 -v /home/docker/tomcat/tomcat01/webapps:/usr/local/tomcat/webapps -v /home/docker/tomcat/tomcat01/logs/:/usr/local/tomcat/logs tomcat
    708bd330e05141098575b4ebbfdbfe5a15970f76c115819fc5b6c56848707135
    [root@localhost home]# docker run -d --restart=always --name=tomcat02 -p 8081:8080 -v /home/docker/tomcat/tomcat02/webapps:/usr/local/tomcat/webapps -v /home/docker/tomcat/tomcat02/logs/:/usr/local/tomcat/logs tomcat
    6ab3d133356e3ea3b551452debfb7caa888b656f92187d78887d2d61e13e4876
    [root@localhost home]#
    ```
2. 在两台`Tomcat`的`webapps`目录中，创建名称是`edu`的文件夹，在`edu`文件夹中创建页面`index.html`，用于测试

    ```bash
    [root@localhost ~]# cd /home/docker/tomcat/tomcat02/webapps/
    [root@localhost webapps]# ls
    vod
    [root@localhost webapps]# mkdir edu
    [root@localhost webapps]# vi edu/index.html
    ```
3. 在`Nginx`的配置文件中进行负载均衡的配置

    ```conf
    http {
        ...
        upstream myserver{
            server 192.168.30.128:8080;
            server 192.168.30.128:8081;
        }

        server {
            listen       80;
            listen  [::]:80;
            server_name  182.168.30.128;

            #access_log  /var/log/nginx/host.access.log  main;

            location ~ /edu/ {
                proxy_pass http://myserver;
            }
        }
    }
    ```

### 策略说明

1. 轮询（默认）

    每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器`down`掉，能自动剔除。
2. `weight`

    * `weight`代表权重，默认为 $1$，权重越高被分配的客户端越多
    * 可以指定轮询几率，`weight`和访问比率成正比，用于后端服务器性能不均的情况

    ```dsconfig
    upstream server_pool{ 
        server 192.168.5.21 weight=10; 
        server 192.168.5.22 weight=10; 
    }
    ```
3. `ip_hash`

    每个请求按访问`ip`的`hash`结果分配，这样每个访客固定访问一个后端服务器。

    ```dsconfig
    upstream server_pool{ 
        ip_hash; 
        server 192.168.5.21:80; 
        server 192.168.5.22:80; 
    }
    ```
4. `fair`

    按后端服务器的响应时间来分配请求，响应时间短的优先分配。

    ```dsconfig
    upstream server_pool{ 
        server 192.168.5.21:80; 
        server 192.168.5.22:80; 
        fair; 
    }
    ```

## 动静分离

　　`Nginx`动静分离简单来说就是把动态跟静态请求分开，不能理解成只是单纯的把动态页面和静态页面物理分离。严格意义上说应该是动态请求跟静态请求分开，可以理解成使用`Nginx`处理静态页面，`Tomcat`处理动态页面。

　　动静分离从目前实现角度来讲大致分为两种：

1. 纯粹把静态文件独立成单独的域名，放在独立的服务器上，也是目前主流推崇的方案
2. 动态跟静态文件混合在一起发布，通过`Nginx`分开，配置`location`指定不同的后缀名实现不同的请求转发，`expires`参数设置浏览器缓存过期时间，减少与服务器之前的请求和流量。

　　`Expires`具体定义：是给一个资源设定一个过期时间，也就是说无需去服务端验证，直接通过浏览器自身确认是否过期即可，所以不会产生额外的流量。此种方法非常适合不经常变动的资源，如果经常更新的文件，不建议使`Expires`来缓存。设置`3d`，表示在 3 天之内访问这个`URL`，发送一个请求，比对服务器该文件最后更新时间没有变化，则不会从服务器抓取，返回状态码 304，如果有修改，则直接从服务器重新下载，返回状态码 200。

### 实现效果

　　静态资源存放在`Nginx`服务器中，动态资源存放在`Tomcat`服务器中，访问静态资源时直接从`Nginx`服务器中获取。

### 实现步骤

1. 在`Liunx`系统中准备静态资源，用于进行访问

   ```conf
   [root@localhost conf]# cd /home/docker/nginx/
   [root@localhost nginx]# ls
   conf  html  log  ssl
   [root@localhost nginx]# cd /home/docker/nginx/html/
   [root@localhost html]# ls
   [root@localhost html]# mkdir -p {image,www}
   [root@localhost html]# cd image
   [root@localhost image]# ls
   cover.jpg
   [root@localhost image]# cd ../www/
   [root@localhost www]# vi index.html
   ```
2. 在`Nginx`配置文件中进行配置

   ```conf
   server {
       listen       80;
       listen  [::]:80;
       server_name  182.168.30.128;

       #access_log  /var/log/nginx/host.access.log  main;

       location /www/ {
           root /usr/share/nginx/html/;
           index index.html index.htm;
       }

       location /image/ {
           root /usr/share/nginx/html/;
           autoindex on;
       }
   }
   ```
3. 访问`192.168.30.128/image.cover.jpg`测试

   参数`autoindex on`效果：  
   ![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/autoindex-on.png)

## 高可用集群

### 什么是 Nginx 高可用

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/nginx-high-available.png)

### 准备工作

* 两台服务器 [192.168.30.129](192.168.30.129) 和 [192.168.30.130](192.168.30.130)
* 在两台服务器安装`Nginx`
* 在两台服务器安装`keepalived`

### 单主单从

1. 安装`keepalived`和`Nginx`
   * 安装`Nginx`
   * 安装`keepalived`
     ```
     [root@localhost /]# yum install keepalived -y
     ```
2. 修改`/etc/keepalived/keepalivec.conf`配置文件
   * `master`
     ```conf
     ! Configuration File for keepalived

     global_defs {
         # 全局定义
         notification_email {
             acassen@firewall.loc
             failover@firewall.loc
             sysadmin@firewall.loc
         }
         notification_email_from Alexandre.Cassen@firewall.loc
         smtp_server 192.168.30.129
         smtp_connect_timeout 30
         # 唯一不重复
         router_id LVS_DEVEL
     }
     # 脚本配置
     vrrp_script chk_http_port {
         # 检测脚本的位置及名称
         script "/usr/local/src/nginx_check.sh"
         # 检测脚本执行的间隔
         interval 2
         # 权重，设置当前服务器的权重，此处的配置说明：当前服务器如果宕机了，那么该服务器的权重降低 2
         weight 2
     }
     # 虚拟 IP 配置
     vrrp_instance VI_1 {
         # 备份服务器上将 MASTER 改为 BACKUP
         state MASTER 
         # 网卡，通过 ifconfig 查看
         interface ens160
         # 主、备机的 virtual_router_id 必须相同
         virtual_router_id 51
         # 主、备机取不同的优先级，主机值较大，备份机值较小
         priority 100
         # 时间间隔。每隔多少秒发送一次心跳检测服务器是否还活着，默认 1 秒发送一次心跳
         advert_int 1
         authentication {
             auth_type PASS
             auth_pass 1111
         }
         virtual_ipaddress {
             # VRRP H 虚拟 IP 地址，网段要和 linux 的网段一致，可以绑定多个虚拟 ip
             192.168.30.60
         }
     }
     ```
   * `salve`
     ```conf
     ! Configuration File for keepalived
     global_defs {
         # 全局定义
         notification_email {
             acassen@firewall.loc
             failover@firewall.loc
             sysadmin@firewall.loc
         }
         notification_email_from Alexandre.Cassen@firewall.loc
         smtp_server 192.168.30.130
         smtp_connect_timeout 30
         # 唯一不重复
         router_id LVS_DEVEL
     }

     vrrp_script chk_http_port {
         # 检测脚本的位置
         script "/usr/local/src/nginx_check.sh"
         # 检测脚本执行的间隔
         interval 2
         # 权重，设置当前服务器的权重，此处的配置说明：当前服务器如果宕机了，那么该服务器的权重降低 2
         weight 2
     }
     vrrp_script chk_http_port {
         # 检测脚本的位置
         script "/usr/local/src/nginx_check.sh"
         # 检测脚本执行的间隔
         interval 2
         weight 2
     }
     # 虚拟 IP 配置
     vrrp_instance VI_1 {
         # 备份服务器上将 MASTER 改为 BACKUP
         state BACKUP
         # 网卡
         interface ens160
         # 主、备机的 virtual_router_id 必须相同
         virtual_router_id 51
         # 主、备机取不同的优先级，主机值较大，备份机值较小
         priority 90
         # 时间间隔。每隔多少秒发送一次心跳检测服务器是否还活着，默认 1 秒发送一次心跳
         advert_int 1
         authentication {
             auth_type PASS
             auth_pass 1111
         }
         virtual_ipaddress {
             # VRRP H 虚拟 IP 地址,网段要和 linux 的网段一致，可以绑定多个虚拟 ip
             192.168.30.60
         }
     }
     ```
3. 在两天服务器的`/usr/local/src/`中编写`Nginx`检测脚本`nginx_check.sh`
   ```conf
   [root@9e672b8dd7cd /]# vi /usr/local/src/nginx_check.sh
   [root@9e672b8dd7cd /]# cat /usr/local/src/nginx_check.sh
   #!/bin/bash
   A=`ps -C nginx –no-header |wc -l`
   if [ $A -eq 0 ];then
       /usr/local/nginx/sbin/nginx
       sleep 2
       if [ `ps -C nginx --no-header |wc -l` -eq 0 ];then
           killall keepalived
       fi
   fi
   [root@localhost /]#
   ```
4. 在所有节点上面进行配置
   ```conf
   # 关闭防火墙
   [root@localhost home]# systemctl stop firewalld 
   # 关闭 selinux，重启生效
   [root@localhost home]# sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/sysconfig/selinux
   # 关闭 selinux，临时生效
   [root@localhost home]# setenforce 0
   # 时间同步
   [root@localhost home]# ntpdate 0.centos.pool.ntp.org
   ```
5. 把两台服务器上`Nginx`和`keepalived`启动
   ```
   [root@localhost keepalived]# cd /usr/local/nginx/sbin/
   [root@localhost sbin]# ./nginx
   [root@localhost sbin]# systemctl start keepalived.service
   [root@localhost sbin]#
   ```
6. 最终测试
   * 在浏览器地址栏输入虚拟`ip`地址 [192.168.30.60](192.168.30.60)，可以访问
   * 把主服务器（[192.168.60.129](192.168.60.129)）`Nginx`和`keepalived`停止，再输入 [192.168.30.60](192.168.30.60)，仍然可以访问

     ```bash
     [root@localhost keepalived]# cd /usr/local/nginx/sbin/
     [root@localhost sbin]# ./nginx -s stop
     [root@localhost sbin]# systemctl stop keepalived.service
     [root@localhost sbin]# systemctl status keepalived.service
     ● keepalived.service - LVS and VRRP High Availability Monitor
        Loaded: loaded (/usr/lib/systemd/system/keepalived.service; disabled; vendor preset: disabled)
        Active: inactive (dead)
     ```

### 双主双从

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/both-master-and-slave.png)

1. 修改配置
   * `master`
     ```conf
     ! Configuration File for keepalived
     global_defs {
        notification_email {
          acassen@firewall.loc
          failover@firewall.loc
          sysadmin@firewall.loc
        }
        notification_email_from Alexandre.Cassen@firewall.loc
        smtp_server 192.168.30.129
        smtp_connect_timeout 30
        router_id LVS_DEVEL
     }

     vrrp_script chk_http_port {
         # 检测脚本的位置
         script "/usr/local/src/nginx_check.sh"
         # 检测脚本执行的间隔
         interval 2
         weight 2
     }

     vrrp_instance VI_1 {
         state MASTER
         interface ens160
         virtual_router_id 51
         priority 100
         advert_int 1
         authentication {
             auth_type PASS
             auth_pass 1111
         }
         virtual_ipaddress {
             192.168.10.30/24
         }
     }

     vrrp_instance VI_2 {
         state BACKUP
         interface ens160
         virtual_router_id 52
         priority 90
         advert_int 1
         authentication {
             auth_type PASS
             auth_pass 2222
         }
         virtual_ipaddress {
             192.168.10.60/24
         }
     }
     ```
   * `slave`
     ```conf
     ! Configuration File for keepalived
     global_defs {
        notification_email {
          acassen@firewall.loc
          failover@firewall.loc
          sysadmin@firewall.loc
        }
        notification_email_from Alexandre.Cassen@firewall.loc
        smtp_server 192.168.30.130
        smtp_connect_timeout 30
        router_id LVS_DEVEL
     }

     vrrp_script chk_http_port {
         # 检测脚本的位置
         script "/usr/local/src/nginx_check.sh"
         # 检测脚本执行的间隔
         interval 2
         weight 2
     }

     vrrp_instance VI_1 {
         state BACKUP
         interface ens160
         virtual_router_id 51
         priority 90
         advert_int 1
         authentication {
             auth_type PASS
             auth_pass 1111
         }
         virtual_ipaddress {
             192.168.10.30/24
         }
     }

     vrrp_instance VI_2 {
         state MASTER
         interface ens160
         virtual_router_id 52
         priority 100
         advert_int 1
         authentication {
             auth_type PASS
             auth_pass 2222
         }
         virtual_ipaddress {
             192.168.10.60/24
         }
     }
     ```
2. 重启
   * 重启`master`
     ```bash
     [root@localhost keepalived]# cd /usr/local/nginx/sbin/
     [root@localhost sbin]# ./nginx
     [root@localhost sbin]# systemctl restart keepalived.service
     [root@localhost sbin]# systemctl status keepalived.service
     ● keepalived.service - LVS and VRRP High Availability Monitor
        Loaded: loaded (/usr/lib/systemd/system/keepalived.service; disabled; vendor preset: disabled)
        Active: active (running) since Tue 2021-11-16 04:40:13 EST; 4s ago
       Process: 22700 ExecStart=/usr/sbin/keepalived $KEEPALIVED_OPTIONS (code=exited, status=0/SUCCESS)
      Main PID: 22701 (keepalived)
         Tasks: 2 (limit: 4755)
        Memory: 1.7M
        CGroup: /system.slice/keepalived.service
                ├─22701 /usr/sbin/keepalived -D
                └─22702 /usr/sbin/keepalived -D
     ```
   * 重启`slave`
     ```bash
     [root@localhost keepalived]# systemctl restart keepalived.service
     [root@localhost keepalived]# systemctl status nginx.service
     Unit nginx.service could not be found.
     [root@localhost keepalived]# systemctl status keepalived.service
     ● keepalived.service - LVS and VRRP High Availability Monitor
        Loaded: loaded (/usr/lib/systemd/system/keepalived.service; disabled; vendor preset: disabled)
        Active: active (running) since Tue 2021-11-16 04:41:00 EST; 18s ago
       Process: 15982 ExecStart=/usr/sbin/keepalived $KEEPALIVED_OPTIONS (code=exited, status=0/SUCCESS)
      Main PID: 15983 (keepalived)
         Tasks: 2 (limit: 4755)
        Memory: 1.7M
        CGroup: /system.slice/keepalived.service
                ├─15983 /usr/sbin/keepalived -D
                └─15984 /usr/sbin/keepalived -D

     ```
3. 测试
   * 在浏览器地址栏输入虚拟`ip`地址 [192.168.10.30](192.168.10.30)、[192.168.10.60](192.168.10.60)，可以访问
   * 把主服务器（[192.168.60.129](192.168.60.129)）`Nginx`和`keepalived`停止，再输入 [192.168.10.30、192.168.10.60](192.168.30.60)，仍然可以访问

     ```bash
     [root@localhost keepalived]# cd /usr/local/nginx/sbin/
     [root@localhost sbin]# ./nginx -s stop
     [root@localhost sbin]# systemctl stop keepalived.service
     [root@localhost sbin]# systemctl status keepalived.service
     ● keepalived.service - LVS and VRRP High Availability Monitor
        Loaded: loaded (/usr/lib/systemd/system/keepalived.service; disabled; vendor preset: disabled)
        Active: inactive (dead)

     ```

   测试可以发现访问`keepalived`中配置的两个`VIP`都可以正常调度等，当停止任意一台`keepalived`节点，同样还是正常访问；到此，`keepalived+nginx`高可用集群（双主模式）就搭建完成了。

# 原理

## Master 和 Worker机制

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/master-and-worker-one.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/master-and-worker-two.png)

### 优点

1. 可以使用`nginx –s reload`热部署，利用`Nginx`进行热部署操作
2. 对于每个`worker`进程来说，独立的进程，不需要加锁，省掉了锁带来的开销，同时在编程以及问题查找时会方便很多
3. 每个`woker`是独立的进程，如果有其中的一个`woker`出现问题，其他`woker`独立的，继续进行争抢，实现请求过程，不会造成服务中断

### worker 数量

　　`Nginx`同`Redis`类似都采用了`io`多路复用机制，每个`worker`都是一个独立的进程，但每个进程里只有一个主线程，通过异步非阻塞的方式来处理请求，即使是千上万个请求也不在话下。

　　每个`worker`的线程可以把一个`CPU`的性能发挥到极致。所以`worker`数和服务器的`CPU`数相等是最为适宜的。设少了会浪费`CPU`，设多了会造成`CPU`频繁切换上下文带来的损耗。

```conf
worker_processes 4
#work 绑定 cpu(4 work 绑定 4cpu)
worker_cpu_affinity 0001 0010 0100 1000

#work 绑定 cpu (4 work 绑定 8cpu 中的 4 个) 
worker_cpu_affinity 0000001 00000010 00000100 00001000
```

## 连接数

　　`worker_connection`表示每个`worker`进程所能建立连接的最大值，所以，一个`Nginx`能建立的最大连接数，应该是`worker_connections * worker_processes`。

　　当然，这里说的是最大连接数，对于`HTTP`请 求 本 地 资 源 来 说 ， 能 够 支 持 的 最 大 并 发 数 量 是`worker_connections * worker_processes`，如果是支持`HTTP1.1`的浏览器每次访问要占两个连接，所以普通的静态访问最大并发数是：`worker_connections * worker_processes / 2`，而如果是`HTTP`作为反向代理来说，最大并发数量应该是`worker_connections * worker_processes / 4`。因为作为反向代理服务器，每个并发会建立与客户端的连接和与后端服务的连接，会占用两个连接。

### 问题

1. 发送请求，占用了`woker`的几个连接数？
   * 2 或者 4 个
2. `Nginx`有一个`master`，四个`woker`，每个`woker`支持的最大连接数是 1024，那么支持的最大并发数是多少？
   * 普通的静态访问最大并发数是：`worker_connections * worker_processes /2`
   * 而如果是`HTTP`作为反向代理来说，最大并发数量应该是`worker_connections * worker_processes / 4`

## 配置文件结构

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/nginx-summary/nginx-conf-structure.png)
