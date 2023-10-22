---
date: 2023-10-20
article: true
timeline: true
index: true
title: Docker 镜像与容器
category: Docker
tag:
- Docker
---

# Docker概述

## 基本介绍

　　`Docker`是一个开源的应用容器引擎，基于`Go`语言并遵从`Apache2.0`协议开源。

　　`Docker`可以让开发者打包他们的应用以及依赖包到一个轻量级、可移植的容器中，然后发布到任何流行的`Linux`机器上，也可以实现虚拟化。

　　容器是完全使用沙箱机制，相互之间不会有任何接口（类似`iPhone`的`app`）,更重要的是容器性能开销极低。

　　`Docker`从 $17.03$ 版本之后分为`CE`（`Community Edition`：社区版） 和`EE`（`Enterprise Edition`：企业版），一般用社区版就可以了。

　　[官网](https://docs.docker.com/)：`https://docs.docker.com/`。

## 应用场景

* `Web`应用的自动化打包和发布
* 自动化测试和持续集成、发布
* 在服务型环境中部署和调整数据库或其他的后台应用
* 从头编译或者扩展现有的`OpenShift`或`Cloud Foundry`平台来搭建自己的`PaaS`环境

## Docker 的优势

　　`Docker`是一个用于开发，交付和运行应用程序的开放平台。

　　`Docker`能够将应用程序与基础架构分开，从而可以快速交付软件；借助`Docker`，可以与管理应用程序相同的方式来管理基础架构；通过利用`Docker`的方法来快速交付，测试和部署代码，可以大大减少编写代码和在生产环境中运行代码之间的延迟。

1. 快速，一致地交付您的应用程序。  

    `Docker`允许开发人员使用提供的应用程序或服务的本地容器在标准化环境中工作，从而简化了开发的生命周期。  

    容器非常适合持续集成和持续交付（`CI / CD`）工作流程，考虑以下示例方案：

    * 开发人员在本地编写代码，并使用 Docker 容器与同事共享他们的工作。他们使用`Docker`将其应用程序推送到测试环境中，并执行自动或手动测试
    * 当开发人员发现错误时，他们可以在开发环境中对其进行修复，然后将其重新部署到测试环境中，以进行测试和验证
    * 测试完成后，将修补程序推送给生产环境，就像将更新的镜像推送到生产环境一样简单
2. 响应式部署和扩展

    * `Docker`是基于容器的平台，允许高度可移植的工作负载
    * `Docker`容器可以在开发人员的本机上，数据中心的物理或虚拟机上，云服务上或混合环境中运行
    * `Docker`的可移植性和轻量级的特性，还可以轻松地完成动态管理的工作负担，并根据业务需求指示，实时扩展或拆除应用程序和服务
3. 在同一硬件上运行多工作负载

    * `Docker`轻巧快速。它为基于虚拟机管理程序的虚拟机提供了可行、经济、高效的替代方案，因此您可以利用更多的计算能力来实现业务目标
    * `Docker`非常适合于高密度环境以及中小型部署，可以用更少的资源做更多的事情

# 虚拟化技术和容器化技术

## 容器化技术

### 容器官方解释

　　一句话概括容器：容器就是将软件打包成标准化单元，以用于开发、交付和部署。

* 容器镜像是轻量的、可执行的独立软件包，包含软件运行所需的所有内容：代码、运行时环境、系统工具、系统库和设置
* 容器化软件适用于基于`Linux`和`Windows`的应用，在任何环境中都能够始终如一地运行
* 容器赋予了软件独立性，使其免受外在环境差异（例如，开发和预演环境的差异）的影响，从而有助于减少团队间在相同基础设施上运行不同软件时的冲突

### 容器通俗解释

　　容器化技术不是模拟的一个完整的操作系统。

　　通俗地描述容器，容器就是一个存放东西的地方，就像书包可以装各种文具、衣柜可以放各种衣服、鞋架可以放各种鞋子一样。现在所说的容器存放的东西可能更偏向于应用比如网站、程序甚至是系统环境。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-container.png)

## 虚拟化技术

　　`Docker`容器虚拟化技术为基础的软件，什么是虚拟化技术呢？

　　简单的说，虚拟化技术可以这样定义：

> 虚拟化技术是一种资源管理技术，是将计算机的各种实体资源（`CPU`、内存、磁盘空间、网络适配器等），予以抽象、转换后呈现出来并可供分割、组合为一个或多个电脑配置环境。由此，打破实体结构间的不可切割的障碍，使用户可以比原本的配置更好的方式来应用这些电脑硬件资源。这些资源的新虚拟部分是不受现有资源的架设方式，地域或物理配置所限制。一般所指的虚拟化资源包括计算能力和数据存储。

　　虚拟化技术特点：

1. 资源占用多
2. 冗余步骤多
3. 启动很慢

## Docker 基于 LXC 虚拟容器技术

　　`Docker`技术是基于`LXC`（`Linux container`：`Linux`容器）虚拟容器技术的。

> `LXC`，其名称来自`Linux`软件容器（`Linux Containers`）的缩写，一种操作系统层虚拟化（`Operating system–level virtualization`）技术，为`Linux`内核容器功能的一个用户空间接口。它将应用软件系统打包成一个软件容器（`Container`），内含应用软件本身的代码，以及所需要的操作系统核心和库。通过统一的名字空间和共用`API`来分配不同软件容器的可用硬件资源，创造出应用程序的独立沙箱运行环境，使得`Linux`用户可以容易的创建和管理系统或应用容器。

　　`LXC`技术主要是借助`Linux`内核中提供的`CGroup`功能和`namespace`来实现的，通过`LXC`可以为软件提供一个独立的操作系统运行环境。

　　`Docker`和虚拟机的不同：

1. 传统虚拟机，虚拟出硬件，运行一个完整的操作系统，然后在这个系统上安装和运行软件
2. `Docker`容器内的应用直接运行在宿主机的内容，容器是没有自己的内核的，也没有虚拟硬件
3. 每个容器都是相互隔离的，每个容器都有属于自己的文件系统，互不影响

### cgroup 和 namespace

#### 介绍

* `namespace`是`Linux`内核用来隔离内核资源的方式，通过`namespace`可以让一些进程只能看到与自己相关的一部分资源，而另外一些进程也只能看到与它们自己相关的资源，这两拨进程根本就感觉不到对方的存在。具体的实现方式是把一个或多个进程的相关资源指定在同一个`namespace`中；`Linux namespaces`是对全局系统资源的一种封装隔离，使得处于不同`namespace`的进程拥有独立的全局系统资源，改变一个`namespace`中的系统资源只会影响当前 `namespace`里的进程，对其他`namespace`中的进程没有影响
* `CGroup`是`Control Groups`的缩写，是`Linux`内核提供的一种可以限制、记录、隔离进程组 （`process groups`）所使用的物力资源（如`cpu`、`memory`、`i/o`等）的机制

#### 对比

　　两者都是将进程进行分组，但是两者的作用还是有本质区别。

　　`namespace`是为了隔离进程组之间的资源，而`cgroup`是为了对一组进程进行统一的资源监控和限制。

### 容器化的好处

1. 应用更快速的交互和部署

    * 传统：一堆帮助文档，安装程序
    * `Docker`：打包镜像发布测试，一键运行
2. 更便捷的升级和扩容  
    使用`Docker`之后，项目打包为一个镜像，部署应用就像搭积木一样
3. 更简单的系统运维  
    在容器化之后，开发、测试环境都是高度统一的
4. 更高效的计算资源利用  
    `Docker`是内核级别的虚拟化，可以在一个物理机上运行很多的容器实例，服务器的性能可以被压榨到极致

# Docker 基本组成

　　`Docker`中有非常重要的三个基本概念，理解了这三个概念，就理解了`Docker`的整个生命周期。

* 镜像（`Image`）  
  `Docker`镜像就好比是一个模板，可以通过这个模板来创建容器服务，运行`tomcat`镜像 ===> `tomcat01`容器提供`web`服务器服务
* 容器（`Container`）  
  `Docker`利用容器技术，独立运行一个或者一组通过镜像创建的应用
* 仓库（`Repository`）

  * 仓库就是存放镜像的地方
  * 仓库分为公有仓库（`Docker Hub`）和私有仓库

# Docker 的安装与卸载

## 安装

1. 查看系统内核和系统信息

    ```bash
    # 查看系统内核版本
    uname -r   
    # 查看系统版本
    cat /etc/os-release
    ```
2. 卸载旧版本

    ```bash
    yum remove docker \
               docker-client \
               docker-client-latest \
               docker-common \
               docker-latest \
               docker-latest-logrotate \
               docker-logrotate \
               docker-engine
    ```
3. 下载依赖安装包

    ```bash
    yum install -y yum-utils
    ```
4. 配置镜像仓库

    ```bash
    # 国外的地址
    yum-config-manager \
        --add-repo \
        https://download.docker.com/linux/centos/docker-ce.repo  

    # 设置阿里云的 Docker 镜像仓库
    yum-config-manager \
        --add-repo \
        https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    ```
5. 更新`yum`软件包

    ```bash
    yum makecache
    ```
6. 下载`Docker`

    ```bash
    # 安装社区版
    yum install docker-ce docker-ce-cli containerd.io   
    # 安装企业版
    yum install docker-ee docker-ee-cli containerd.io 
    ```

    一般情况下安装社区版

    ```bash
    # CentOS 8 安装 Docker 会和 podman 冲突
    yum erase podman buildah
    ```
7. 启动`Docker`

    ```bash
    # 启动 Docker
    systemctl start docker   
    # 查看当前版本号，是否启动成功
    docker version   
    # 设置开机自启动
    systemctl enable docker  
    ```
8. `Docker`的`HelloWorld`

    ```bash
    docker run hello-world
    # 查看下载的 hello world 镜像
    docker images
    ```

## 卸载

```bash
# 卸载依赖
yum remove docker-ce docker-ce-cli containerd.io  
# 删除资源  . /var/lib/docker 是 docker 的默认工作路径
rm -rf /var/lib/docker   
```

## Docker 容器运行流程和原理

### 运行流程

　　启动一个容器，`Docker`的运行流程如下图：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-run-process.png)

## 底层原理

　　`Docker`是一个`Client-Server`结构的系统，`Docker`的守护进程运行在主机上，通过`Socker`从客户端访问！`Docker Server`接收到`Docker-Client`的指令，就会执行这个指令！

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-underly-principle.png)

### Docker 整体架构

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-overall-framework.png)

　　`Docker`为什么比`VM Ware`快？

1. `Docker`比虚拟机更少的抽象层
2. `Docker`利用宿主机的内核，`VM`需要的是`Guest OS`

　　`Docker`新建一个容器的时候，不需要像虚拟机一样重新加载一个操作系统内核，直接利用宿主机的操作系统，而虚拟机是需要加载`Guest OS`。

　　`Docker`和`VM`的对比如下：

||Docker 容器|LXC|VM|
| ------------| -------------| ------------| ------------|
|虚拟化类型|`OS`虚拟化|`OS`虚拟化|硬件虚拟化|
|性能|物理机性能|物理机性能|$5 \%-20 \%$损耗|
|隔离性|`NS`隔离|`NS`隔离|强|
|`Qos`|`Cgroup`弱|`Cgroup`弱|强|
|安全性|中|差|强|
|`GuestOS`|只支持`Linux`|只支持`Linux`|全部|

# 配置阿里云镜像

1. 进入阿里云官网，搜索容器镜像服务
2. 执行命令

    ```bash
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json <<-'EOF'
    {
      "registry-mirrors": ["https://axvfsf7e.mirror.aliyuncs.com"]
    }
    EOF
    sudo systemctl daemon-reload
    sudo systemctl restart docker
    ```

# Docker 常用命令

## 基础命令

1. 查看`Docker`的版本信息：`docker version`

    ```bash
    [root@localhost ~]# docker version
    Client: Docker Engine - Community
     Version:           20.10.10
     API version:       1.41
     Go version:        go1.16.9
     Git commit:        b485636
     Built:             Mon Oct 25 07:42:56 2021
     OS/Arch:           linux/amd64
     Context:           default
     Experimental:      true

    Server: Docker Engine - Community
     Engine:
      Version:          20.10.10
      API version:      1.41 (minimum version 1.12)
      Go version:       go1.16.9
      Git commit:       e2f740d
      Built:            Mon Oct 25 07:41:17 2021
      OS/Arch:          linux/amd64
      Experimental:     false
     containerd:
      Version:          1.4.11
      GitCommit:        5b46e404f6b9f661a205e28d59c982d3634148f8
     runc:
      Version:          1.0.2
      GitCommit:        v1.0.2-0-g52b36a2
     docker-init:
      Version:          0.19.0
      GitCommit:        de40ad0
    ```
2. 查看`Docker`的系统信息，包括镜像和容器的数量：`docker info`

    ```bash
    [root@localhost ~]# docker info
    Client:
     Context:    default
     Debug Mode: false
     Plugins:
      app: Docker App (Docker Inc., v0.9.1-beta3)
      buildx: Build with BuildKit (Docker Inc., v0.6.3-docker)
      scan: Docker Scan (Docker Inc., v0.9.0)

    Server:
     Containers: 1
      Running: 0
      Paused: 0
      Stopped: 1
     Images: 2
     Server Version: 20.10.10
     Storage Driver: overlay2
      Backing Filesystem: xfs
      Supports d_type: true
      Native Overlay Diff: true
      userxattr: false
     Logging Driver: json-file
     Cgroup Driver: cgroupfs
     Cgroup Version: 1
     Plugins:
      Volume: local
      Network: bridge host ipvlan macvlan null overlay
      Log: awslogs fluentd gcplogs gelf journald json-file local logentries splunk syslog
     Swarm: inactive
     Runtimes: io.containerd.runc.v2 io.containerd.runtime.v1.linux runc
     Default Runtime: runc
     Init Binary: docker-init
     containerd version: 5b46e404f6b9f661a205e28d59c982d3634148f8
     runc version: v1.0.2-0-g52b36a2
     init version: de40ad0
     Security Options:
      seccomp
       Profile: default
     Kernel Version: 4.18.0-305.19.1.el8_4.x86_64
     Operating System: CentOS Linux 8
     OSType: linux
     Architecture: x86_64
     CPUs: 2
     Total Memory: 1.748GiB
     Name: localhost.localdomain
     ID: B5XT:RYL7:BWKX:PBVC:P4UM:VECG:ITI7:S4GJ:J3GP:DR5E:KXT7:III4
     Docker Root Dir: /var/lib/docker
     Debug Mode: false
     Registry: https://index.docker.io/v1/
     Labels:
     Experimental: false
     Insecure Registries:
      127.0.0.0/8
     Registry Mirrors:
      https://axvfsf7e.mirror.aliyuncs.com/
     Live Restore Enabled: false
    ```
3. 帮助命令（可查看可选的参数）：`docker 命令 --help`

    ```bash
    [root@localhost ~]# docker info --help
    Usage:  docker info [OPTIONS]
    Display system-wide information
    Options:
      -f, --format string   Format the output using the given Go template
    ```

　　命令[帮助文档](https://docs.docker.com/engine/reference/commandline/docker/)：`https://docs.docker.com/engine/reference/commandline/docker/`。

## 镜像命令

### 查看本地主机的所有镜像

　　`docker images`

```bash
[root@localhost ~]# docker images
REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
hello-world   latest    d1165f221234   5 months ago   13.3kB
```

　　列表参数介绍：

* `REPOSITORY`： 镜像的仓库源
* `TAG`：镜像的标签
* `IMAGE ID`：镜像的`id`
* `CREATED`：镜像的创建时间
* `SIZE`：镜像的大小

　　可选参数：

* `-a/--all`：列出所有镜像
* `-q/--quiet`：只显示镜像的`id`

### 搜索镜像

　　`docker search`

```bash
[root@localhost ~]# docker search mysql
NAME                              DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
mysql                             MySQL is a widely used, open-source relation…   10308     [OK]
mariadb                           MariaDB is a community-developed fork of MyS…   3819      [OK]
mysql/mysql-server                Optimized MySQL Server Docker images. Create…   754                  [OK]
percona                           Percona Server is a fork of the MySQL relati…   517       [OK]
centos/mysql-57-centos7           MySQL 5.7 SQL database server                   86
mysql/mysql-cluster               Experimental MySQL Cluster Docker images. Cr…   79
centurylink/mysql                 Image containing mysql. Optimized to be link…   60                   [OK]
```

　　可选参数：

* `-f, --filter filter`：根据提供的条件过滤输出

  * 搜索收藏数大于 $3000$ 的镜像

    ```bash
    [root@localhost ~]# docker search mysql --filter=STARS=3000
    NAME      DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
    mysql     MySQL is a widely used, open-source relation…   11603     [OK]
    mariadb   MariaDB Server is a high performing open sou…   4414      [OK]
    ```
* `--format string`：使用`Go`模板的漂亮打印搜索
* `--limit int`：最大搜索结果数量（默认为 $25$）
* `--no-trunc`：不截断输出

### 下载镜像

　　`docker pull 镜像名[:tag]`

```bash
# 如果不写 tag 默认就是 latest，写上 tag 就下载指定版本
[root@localhost ~]# docker pull mysql:5.7
5.7: Pulling from library/mysql
# 分层下载，docker image 的核心-联合文件系统
33847f680f63: Pull complete 
5cb67864e624: Pull complete 
1a2b594783f5: Pull complete 
b30e406dd925: Pull complete 
48901e306e4c: Pull complete 
603d2b7147fd: Pull complete 
802aa684c1c4: Pull complete 
5b5a19178915: Pull complete 
f9ce7411c6e4: Pull complete 
f51f6977d9b2: Pull complete 
aeb6b16ce012: Pull complete 
Digest: sha256:be70d18aedc37927293e7947c8de41ae6490ecd4c79df1db40d1b5b5af7d9596
Status: Downloaded newer image for mysql:5.7
docker.io/library/mysql:5.7
```

### 删除镜像

　　`docker rmi`

1. 查看镜像

    * 查看全部镜像

      ```bash
      [root@localhost ~]# docker images
      REPOSITORY    TAG       IMAGE ID       CREATED       SIZE
      mysql         5.7       938b57d64674   10 days ago   448MB
      hello-world   latest    feb5d9fea6a5   5 weeks ago   13.3kB
      ```
    * 查看全部镜像（只显示`id`）

      ```bash
      [root@localhost ~]# docker images -aq
      938b57d64674
      feb5d9fea6a5
      ```
2. 删除镜像

    * 删除指定的镜像`id`

      ```bash
      [root@localhost ~]# docker rmi -f  镜像id
      ```
    * 删除多个镜像`id`

      ```bash
      [root@localhost ~]# docker rmi -f  镜像id 镜像id 镜像id
      ```
    * 删除全部的镜像`id`

      ```bash
      [root@localhost ~]# docker rmi -f  $(docker images -aq)
      ```

## 容器命令

### 运行容器

　　`docker run [可选参数] image`

```bash
[root@localhost /]# docker run 8cf625070931
2021-08-03 06:48:07+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.35-1debian10 started.
2021-08-03 06:48:07+00:00 [Note] [Entrypoint]: Switching to dedicated user 'mysql'
2021-08-03 06:48:07+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.35-1debian10 started.
2021-08-03 06:48:07+00:00 [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified
    You need to specify one of the following:
    - MYSQL_ROOT_PASSWORD
    - MYSQL_ALLOW_EMPTY_PASSWORD
    - MYSQL_RANDOM_ROOT_PASSWORD
```

　　参数说明：

* `--name="名字"`：指定容器名字
* `-d`：后台方式运行
* `-it`：使用交互方式运行,进入容器查看内容
* `-p`：指定容器的端口

  * `-p ip:主机端口:容器端口`： 配置主机端口映射到容器端口

    * 简化版：`-p 主机端口:容器端口`或`-p 容器端口`
* `-P`：随机指定端口（大写的`P`）

### 进入容器

　　`docker run`

　　`docker run -it [容器ID] /bin/bash`

```bash
[root@localhost ~]# 
[root@localhost ~]# docker run -it centos /bin/bash
Unable to find image 'centos:latest' locally
latest: Pulling from library/centos
a1d0c7532777: Pull complete
Digest: sha256:a27fd8080b517143cbbbab9dfb7c8571c40d67d534bbdee55bd6c473f432b177
Status: Downloaded newer image for centos:latest
[root@25027261f0db /]# ls
bin  dev  etc  home  lib  lib64  lost+found  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
[root@25027261f0db /]#
```

### 退出容器

* `exit`：停止并退出容器（后台方式运行则仅退出）

  ```bash
  [root@950ba2403e4c /]# ls
  bin  dev  etc  home  lib  lib64  lost+found  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
  [root@950ba2403e4c /]# exit
  exit
  [root@localhost ~]#
  ```
* `Ctrl+P+Q`：不停止容器，直接退出

  ```bash
  [root@25027261f0db /]# [root@localhost ~]#
  [root@localhost ~]#
  ```

### 列出容器

　　`docker ps`

```bash
[root@localhost ~]# docker ps
CONTAINER ID   IMAGE     COMMAND       CREATED         STATUS         PORTS     NAMES
25027261f0db   centos    "/bin/bash"   6 minutes ago   Up 6 minutes             hardcore_galileo
[root@localhost ~]#
```

　　参数说明：

* `-a`：列出所有容器的运行记录
* `-n=?`：显示最近创建的`n`个容器
* `-q`：只显示容器的编号

### 删除容器

　　`docker rm`

* 删除指定的容器，不能删除正在运行的容器，强制删除使用`rm -f`

  ```bash
  docker rm 容器id
  ```
* 删除所有的容器

  ```bash
  docker rm -f $(docker ps -aq)
  ```
* 删除所有的容器

  ```bash
  docker ps -a -q|xargs docker rm
  ```

#### 启动和重启容器命令

* 启动容器：`docker start 容器id`

  ```bash
  [root@localhost ~]# docker start 25027261f0db
  25027261f0db
  [root@localhost ~]#
  ```
* 重启容器：`docker restart 容器id`

  ```bash
  [root@localhost ~]# docker restart 25027261f0db
  25027261f0db
  [root@localhost ~]#
  ```
* 停止当前运行的容器：`docker stop 容器id`

  ```bash
  [root@localhost ~]# docker stop 25027261f0db
  25027261f0db
  [root@localhost ~]#
  ```
* 强制停止当前容器：`docker kill 容器id`

  ```bash
  [root@localhost ~]# docker kill 25027261f0db
  25027261f0db
  [root@localhost ~]#
  ```

## 其他命令

### 查看日志

　　`docker logs`

```bash
[root@localhost ~]# docker logs --help

Usage:  docker logs [OPTIONS] CONTAINER

Fetch the logs of a container

Options:
      --details        Show extra details provided to logs
  -f, --follow         Follow log output
      --since string   Show logs since timestamp (e.g. 2013-01-02T13:23:37Z) or relative (e.g. 42m for 42 minutes)
  -n, --tail string    Number of lines to show from the end of the logs (default "all")
  -t, --timestamps     Show timestamps
      --until string   Show logs before a timestamp (e.g. 2013-01-02T13:23:37Z) or relative (e.g. 42m for 42 minutes)
```

　　常用：

* `docker logs -tf 容器id`
* `docker logs --tail number 容器id`

  * `num`为要显示的日志条数

　　`Docker`容器后台运行必须要有一个前台的进程，否则会自动停止；编写`shell`脚本循环执行，使`centos`容器保持运行状态。

```bash
[root@localhost ~]# docker run -d centos /bin/sh -c "while true;do echo hi;sleep 5;done"
4c57edbf79227f256452ebb719716ed2b4b9dcd5170fce1a8a1da10dff225082
[root@localhost ~]# docker ps
CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS     NAMES
4c57edbf7922   centos    "/bin/sh -c 'while t…"   12 seconds ago   Up 11 seconds             xenodochial_lalande
[root@localhost ~]# docker logs -tf --tail 10 4c57edbf7922
2021-10-29T07:12:38.680645208Z hi
2021-10-29T07:12:43.682316339Z hi
2021-10-29T07:12:48.684010465Z hi
2021-10-29T07:12:53.686100268Z hi
2021-10-29T07:12:58.687727415Z hi
2021-10-29T07:13:03.689642682Z hi
2021-10-29T07:13:08.691281535Z hi
2021-10-29T07:13:13.692534177Z hi
2021-10-29T07:13:18.693935678Z hi
2021-10-29T07:13:23.695554000Z hi
^C
[root@localhost ~]#
```

### 查看容器中进程信息

　　`docker top`

```bash
[root@localhost ~]# docker top 4c57edbf7922
UID                 PID                 PPID                C                   STIME               TTY                 TIME                CMD
root                2523                2504                0                   15:12               ?                   00:00:00            /bin/sh -c while true;do echo hi;sleep 5;done
root                2595                2523                0                   15:14               ?                   00:00:00            /usr/bin/coreutils --coreutils-prog-shebang=sleep /usr/bin/sleep 5
[root@localhost ~]#
```

### 查看容器的元数据

　　`docker inspect 容器id`

```bash
[root@localhost ~]# docker inspect 4c57edbf7922
[
    {
        "Id": "4c57edbf79227f256452ebb719716ed2b4b9dcd5170fce1a8a1da10dff225082",
        "Created": "2021-10-29T07:12:38.500368814Z",
        "Path": "/bin/sh",
        "Args": [
            "-c",
            "while true;do echo hi;sleep 5;done"
        ],
        "State": {
            "Status": "running",
            "Running": true,
            "Paused": false,
            "Restarting": false,
            "OOMKilled": false,
            "Dead": false,
            "Pid": 2523,
            "ExitCode": 0,
            "Error": "",
            "StartedAt": "2021-10-29T07:12:38.681818995Z",
            "FinishedAt": "0001-01-01T00:00:00Z"
        },
        "Image": "sha256:5d0da3dc976460b72c77d94c8a1ad043720b0416bfc16c52c45d4847e53fadb6",
        "ResolvConfPath": "/var/lib/docker/containers/4c57edbf79227f256452ebb719716ed2b4b9dcd5170fce1a8a1da10dff225082/resolv.conf",
        "HostnamePath": "/var/lib/docker/containers/4c57edbf79227f256452ebb719716ed2b4b9dcd5170fce1a8a1da10dff225082/hostname",
        "HostsPath": "/var/lib/docker/containers/4c57edbf79227f256452ebb719716ed2b4b9dcd5170fce1a8a1da10dff225082/hosts",
        "LogPath": "/var/lib/docker/containers/4c57edbf79227f256452ebb719716ed2b4b9dcd5170fce1a8a1da10dff225082/4c57edbf79227f256452ebb719716ed2b4b9dcd5170fce1a8a1da10dff225082-json.log",
        "Name": "/xenodochial_lalande",
        "RestartCount": 0,
        "Driver": "overlay2",
        "Platform": "linux",
        "MountLabel": "",
        "ProcessLabel": "",
        "AppArmorProfile": "",
        "ExecIDs": null,
        "HostConfig": {
            "Binds": null,
            "ContainerIDFile": "",
            "LogConfig": {
                "Type": "json-file",
                "Config": {}
            },
            "NetworkMode": "default",
            "PortBindings": {},
            "RestartPolicy": {
                "Name": "no",
                "MaximumRetryCount": 0
            },
            "AutoRemove": false,
            "VolumeDriver": "",
            "VolumesFrom": null,
            "CapAdd": null,
            "CapDrop": null,
            "CgroupnsMode": "host",
            "Dns": [],
            "DnsOptions": [],
            "DnsSearch": [],
            "ExtraHosts": null,
            "GroupAdd": null,
            "IpcMode": "private",
            "Cgroup": "",
            "Links": null,
            "OomScoreAdj": 0,
            "PidMode": "",
            "Privileged": false,
            "PublishAllPorts": false,
            "ReadonlyRootfs": false,
            "SecurityOpt": null,
            "UTSMode": "",
            "UsernsMode": "",
            "ShmSize": 67108864,
            "Runtime": "runc",
            "ConsoleSize": [
                0,
                0
            ],
            "Isolation": "",
            "CpuShares": 0,
            "Memory": 0,
            "NanoCpus": 0,
            "CgroupParent": "",
            "BlkioWeight": 0,
            "BlkioWeightDevice": [],
            "BlkioDeviceReadBps": null,
            "BlkioDeviceWriteBps": null,
            "BlkioDeviceReadIOps": null,
            "BlkioDeviceWriteIOps": null,
            "CpuPeriod": 0,
            "CpuQuota": 0,
            "CpuRealtimePeriod": 0,
            "CpuRealtimeRuntime": 0,
            "CpusetCpus": "",
            "CpusetMems": "",
            "Devices": [],
            "DeviceCgroupRules": null,
            "DeviceRequests": null,
            "KernelMemory": 0,
            "KernelMemoryTCP": 0,
            "MemoryReservation": 0,
            "MemorySwap": 0,
            "MemorySwappiness": null,
            "OomKillDisable": false,
            "PidsLimit": null,
            "Ulimits": null,
            "CpuCount": 0,
            "CpuPercent": 0,
            "IOMaximumIOps": 0,
            "IOMaximumBandwidth": 0,
            "MaskedPaths": [
                "/proc/asound",
                "/proc/acpi",
                "/proc/kcore",
                "/proc/keys",
                "/proc/latency_stats",
                "/proc/timer_list",
                "/proc/timer_stats",
                "/proc/sched_debug",
                "/proc/scsi",
                "/sys/firmware"
            ],
            "ReadonlyPaths": [
                "/proc/bus",
                "/proc/fs",
                "/proc/irq",
                "/proc/sys",
                "/proc/sysrq-trigger"
            ]
        },
        "GraphDriver": {
            "Data": {
                "LowerDir": "/var/lib/docker/overlay2/294a9e60f30995ad07636a45030fc9ac104cfe0f35d3197a6bc7171186f5fe5f-init/diff:/var/lib/docker/overlay2/0ab1d01f204652c7e92e556e2dd1f08093d99ee5ba7a2ee15aeb70324e819ac0/diff",
                "MergedDir": "/var/lib/docker/overlay2/294a9e60f30995ad07636a45030fc9ac104cfe0f35d3197a6bc7171186f5fe5f/merged",
                "UpperDir": "/var/lib/docker/overlay2/294a9e60f30995ad07636a45030fc9ac104cfe0f35d3197a6bc7171186f5fe5f/diff",
                "WorkDir": "/var/lib/docker/overlay2/294a9e60f30995ad07636a45030fc9ac104cfe0f35d3197a6bc7171186f5fe5f/work"
            },
            "Name": "overlay2"
        },
        "Mounts": [],
        "Config": {
            "Hostname": "4c57edbf7922",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/bin/sh",
                "-c",
                "while true;do echo hi;sleep 5;done"
            ],
            "Image": "centos",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": {
                "org.label-schema.build-date": "20210915",
                "org.label-schema.license": "GPLv2",
                "org.label-schema.name": "CentOS Base Image",
                "org.label-schema.schema-version": "1.0",
                "org.label-schema.vendor": "CentOS"
            }
        },
        "NetworkSettings": {
            "Bridge": "",
            "SandboxID": "0a7fdfc5a908ad18bf51398c0328cf7b4e515286df97592d367d80d9290e5033",
            "HairpinMode": false,
            "LinkLocalIPv6Address": "",
            "LinkLocalIPv6PrefixLen": 0,
            "Ports": {},
            "SandboxKey": "/var/run/docker/netns/0a7fdfc5a908",
            "SecondaryIPAddresses": null,
            "SecondaryIPv6Addresses": null,
            "EndpointID": "c68d2781bd2dc7144ea44e21b3c72ebf3058eb0dde2b6523e303dfc9dc3edb0c",
            "Gateway": "172.17.0.1",
            "GlobalIPv6Address": "",
            "GlobalIPv6PrefixLen": 0,
            "IPAddress": "172.17.0.2",
            "IPPrefixLen": 16,
            "IPv6Gateway": "",
            "MacAddress": "02:42:ac:11:00:02",
            "Networks": {
                "bridge": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": null,
                    "NetworkID": "70b9319ee22c471f91a2b307d7444a3e0ffe8ddb4b22340b2e62684cf59fd26d",
                    "EndpointID": "c68d2781bd2dc7144ea44e21b3c72ebf3058eb0dde2b6523e303dfc9dc3edb0c",
                    "Gateway": "172.17.0.1",
                    "IPAddress": "172.17.0.2",
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "MacAddress": "02:42:ac:11:00:02",
                    "DriverOpts": null
                }
            }
        }
    }
]
[root@localhost ~]#
```

#### 进入当前正在运行的容器

1. `docker exec`：进入容器后开启一个新的终端，可以在里面操作

    ```bash
    [root@localhost ~]# docker exec -it  4c57edbf7922 /bin/bash
    [root@4c57edbf7922 /]# ls
    bin  dev  etc  home  lib  lib64  lost+found  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
    [root@4c57edbf7922 /]# ps -es
      UID     PID          PENDING          BLOCKED          IGNORED           CAUGHT STAT TTY        TIME COMMAND
        0      66 0000000000000000 0000000000010000 0000000000380004 000000004b817efb Ss   pts/0      0:00 /bin/bash PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/b
        0      84 0000000000000000 0000000000000000 0000000000000000 00000001f3d1fef9 R+   pts/0      0:00 ps -es LANG=en_US.UTF-8 HOSTNAME=4c57edbf7922 PWD=/ HOME=/root
    [root@4c57edbf7922 /]# ps -ef
    UID          PID    PPID  C STIME TTY          TIME CMD
    root           1       0  0 07:12 ?        00:00:00 /bin/sh -c while true;do echo hi;sleep 5;done
    root          66       0  0 07:17 pts/0    00:00:00 /bin/bash
    root          85       1  0 07:17 ?        00:00:00 /usr/bin/coreutils --coreutils-prog-shebang=sleep /usr/bin/sleep 5
    root          86      66  0 07:17 pts/0    00:00:00 ps -ef
    [root@4c57edbf7922 /]#
    ```
2. `docker attach`：进入容器正在执行的终端，不会启动新的进程

    ```bash
    [root@localhost ~]# docker attach 4c57edbf7922
    ```

### 拷贝容器文件到主机

　　`docker cp 容器id:容器内路径 目的主机路径`

```bash
[root@localhost ~]# docker exec -it 4c57edbf7922 /bin/bash
[root@4c57edbf7922 /]# cd home
[root@4c57edbf7922 home]# ls
[root@4c57edbf7922 home]# touch text.java
[root@4c57edbf7922 home]# ls
text.java
[root@4c57edbf7922 home]# exit
exit
[root@localhost ~]# docker ps
CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS     NAMES
4c57edbf7922   centos    "/bin/sh -c 'while t…"   11 minutes ago   Up 11 minutes             xenodochial_lalande
[root@localhost ~]# docker cp 4c57edbf7922:/home/text.java /home
[root@localhost ~]# ls /home
echo  text.java
[root@localhost ~]#
```

## 常用命令小结

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-commands-diagram.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-commands-summary.png)

## Docker 图形化管理工具

### Docker UI

1. 查找

    ```bash
    [root@localhost ~]# docker search dockerui
    NAME                           DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
    uifd/ui-for-docker             A web interface for Docker, formerly known a…   108                  [OK]
    abh1nav/dockerui               An updated version of crosbymichael/dockerui…   98                   [OK]
    kevan/dockerui                 Deprecated: Use  uifd/ui-for-docker             15                   [OK]
    microbox/dockerui              Trusted Automated dockerui image (16MB size)    9
    madhavkobal/dockerui           Docker Updated Version having Search, Pull, …   7
    mgtsai/dockerui.base-xpra      Provide base docker images for X application…   2
    rediceli/dockerui              Dockerui with nginx for basic auth              1
    navionics/dockerui             Docker UI                                       1                    [OK]
    elegoev/dockerui               dockerui image based on crosbymichael/docker…   1                    [OK]
    levkov/dockerui                dockerui                                        0
    yungsang/dockerui              Docker API Version: v1.8 UI Version: v0.4 Bu…   0
    david510c/dockerui.base-xpra   dockerui.base-xpra with Firefox                 0                    [OK]
    winking/dockerui               The latest DockerUI build, see https://githu…   0
    bbdinc/dockerui                A rebuild of the dockerui-with-auth             0
    devalih/dockerui               To run :  docker pull devalih/dockerui  dock…   0
    bettse/dockerui                Fork of crosbymichael/dockerui                  0
    alexerm/dockerui-auth                                                          0
    drakin/dockerui                                                                0
    cloudaku/dockerui                                                              0                    [OK]
    allincloud/dockerui                                                            0                    [OK]
    psychemedia/dockerui_patch                                                     0
    c0710204/dockerui                                                              0                    [OK]
    pemcconnell/dockerui                                                           0
    biibds/dockerui                                                                0
    wansc/dockerui                                                                 0                    [OK]
    [root@localhost ~]#
    ```
2. 下载

    ```bash
    [root@localhost ~]# docker pull abh1nav/dockerui
    Using default tag: latest
    latest: Pulling from abh1nav/dockerui
    Image docker.io/abh1nav/dockerui:latest uses outdated schema1 manifest format. Please upgrade to a schema2 image for better future compatibility. More information at https://docs.docker.com/registry/spec/deprecated-schema-v1/
    a3ed95caeb02: Pull complete
    5d3df020ecd3: Pull complete
    bebf5a3b4dfb: Pull complete
    e4452c0fe72b: Pull complete
    6167d9726b07: Pull complete
    53ebae19a314: Pull complete
    Digest: sha256:a9c6c5393f561a0f42f41cfa80572b666e745d9b419569c42bac1e5cf9ceda32
    Status: Downloaded newer image for abh1nav/dockerui:latest
    docker.io/abh1nav/dockerui:latest
    [root@localhost ~]#
    ```
3. 运行

    ```bash
    [root@localhost ~]# docker run -d --privileged --name dockerui -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock abh1nav/dockerui
    ee4f62f8a2da81a3f3d7ccf105fb263e9b2bacea0f65e2693e8893e1d87bf6b7
    [root@localhost ~]#
    ```
4. 测试  
    ![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-ui.png)

### Shipyard

### Portainer

1. 查找

    ```bash
    [root@localhost ~]# docker search portainer
    NAME                             DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
    portainer/portainer              This Repo is now deprecated, use portainer/p…   2136
    portainer/portainer-ce           Portainer CE - Making Docker and Kubernetes …   818
    portainer/agent                  An agent used to manage all the resources in…   120
    portainer/templates              App Templates for Portainer http://portainer…   23
    lihaixin/portainer               docker ui                                       15                   [OK]
    greenled/portainer-stack-utils   Bash scripts to deploy/undeploy stacks in a …   6                    [OK]
    portainer/portainer-k8s-beta     Portainer for Kubernetes BETA                   5
    portainerci/portainer            Portainer images automatically created via P…   5
    portainer/golang-builder         Utility to build Golang binaries.               4                    [OK]
    hassioaddons/portainer                                                           2
    portainer/portainer-ee           Portainer EE - Making Docker and Kubernetes …   2
    portainer/base                   Multi-stage build image to create the Portai…   2                    [OK]
    portainer/agent-k8s-beta         Portainer for Kubernetes BETA (agent)           1
    cqkz/portainer-zh                portainer-ce:2.1.1-alpine，汉化文件来自恩山…             1
    softonic/portainer-endpoint      Allows auto register all the swarm nodes in …   1                    [OK]
    portainerci/portainer-ee         Portainer EE CI repository                      0
    xanderstrike/portainer-issue     for illustrating a portainer issue              0
    iconviet/portainer                                                               0
    hassioaddons/portainer-amd64                                                     0
    6053537/portainer-ce             portainer-ce中文汉化版                               0
    portainerci/agent                Portainer agent images automatically created…   0
    helloysd/portainer                                                               0
    antsoftxyz/portainer-api         A portainer api wrapper which can help you C…   0
    11384eb/portainer                                                                0
    nenadilic84/portainer                                                            0
    [root@localhost ~]#
    ```
2. 下载

    ```bash
    [root@localhost ~]# docker pull portainer/portainer
    Using default tag: latest
    latest: Pulling from portainer/portainer
    94cfa856b2b1: Pull complete
    49d59ee0881a: Pull complete
    a2300fd28637: Pull complete
    Digest: sha256:fb45b43738646048a0a0cc74fcee2865b69efde857e710126084ee5de9be0f3f
    Status: Downloaded newer image for portainer/portainer:latest
    docker.io/portainer/portainer:latest
    [root@localhost ~]#
    ```
3. 运行

    ```bash
    [root@localhost ~]# docker run -d --name portainerui -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer
    fb7e6dd2e3296b05868cf17f00902d3da598abde5e9959a0db39c84bb28cdcf6
    [root@localhost ~]#
    ```
4. 测试

    1. 第一次登录设置`admin`用户的密码  
        ![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-portainer-pass.png)
    2. 如果是阿里云服务器记得设置安全组，选择连接本地的`Docker`  
        ![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-portainer-connect.png)

## Docker 镜像详解

### 什么是镜像

　　镜像是一种轻量级、可执行的独立软件包，用来打包软件运行环境和基于运行环境开发的软件，它包含运行某个软件所需要的所有内容，包括代码，运行时（一个程序在运行或者在被执行的依赖）、库，环境变量和配置文件。

### UnionFS（联合文件系统）

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-union-fs-1.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-union-fs-2.png)

* 联合文件系统（`UnionFS`）是一种分层、轻量级并且高性能的文件系统，它支持对文件系统的修改作为一次提交来一层层的叠加，同时可以将不同目录挂载到同一个虚拟文件系统下。联合文件系统是`Docker`镜像的基础。镜像可以通过分层来进行继承，基于基础镜像（没有父镜像），可以制作各种具体的应用镜像。
* 特性：一次同时加载多个文件系统，但从外面看起来只能看到一个文件系统。联合加载会把各层文件系统叠加起来，这样最终的文件系统会包含所有底层的文件和目录。

### 镜像加载原理

　　`Docker`的镜像实际由一层一层的文件系统组成：

* `bootfs`（`boot file system`）主要包含`bootloader`和`kernel`；`bootloader`主要是引导加载`kernel`，完成后整个内核就都在内存中了，此时内存的使用权已由`bootfs`转交给内核，系统卸载`bootfs`，可以被不同的`Linux`发行版公用。
* `rootfs`（`root file system`），包含典型`Linux`系统中的`/dev`，`/proc`，`/bin`，`/etc`等标准目录和文件；`rootfs`就是各种不同操作系统发行版（`Ubuntu`，`Centos`等）。因为底层直接用`Host`的`kernel`，`rootfs`只包含最基本的命令，工具和程序就可以了。

### 分层理解

　　所有的`Docker`镜像都起始于一个基础镜像层，当进行修改或增加新的内容时，就会在当前镜像层之上，创建新的容器层。

　　容器在启动时会在镜像最外层上建立一层可读写的容器层（`R/W`），而镜像层是只读的（`R/O`）。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-layer.png)

　　查看镜像分层的方式可以通过`docker image inspect`命令：

```bash
[root@localhost ~]# docker image inspect tomcat:latest
[
    {
        "Id": "sha256:b0e0b0a92cf96022059ea14d7c0bee5f51cc856f21be4566d435125d6b261a6b",
        "RepoTags": [
            "tomcat:latest"
        ],
        "RepoDigests": [
            "tomcat@sha256:509cf786b26a8bd43e58a90beba60bdfd6927d2ce9c7902cfa675d3ea9f4c631"
        ],
        "Parent": "",
        "Comment": "",
        "Created": "2021-10-22T00:23:10.031482334Z",
        "Container": "3910543988c25e096c2ed3920ba0fd86a1d227fad82651cd6c8176d1427e3cbb",
        "ContainerConfig": {
            "Hostname": "3910543988c2",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "8080/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/tomcat/bin:/usr/local/openjdk-11/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "JAVA_HOME=/usr/local/openjdk-11",
                "LANG=C.UTF-8",
                "JAVA_VERSION=11.0.13",
                "CATALINA_HOME=/usr/local/tomcat",
                "TOMCAT_NATIVE_LIBDIR=/usr/local/tomcat/native-jni-lib",
                "LD_LIBRARY_PATH=/usr/local/tomcat/native-jni-lib",
                "GPG_KEYS=A9C5DF4D22E99998D9875A5110C01C5A2F6059E7",
                "TOMCAT_MAJOR=10",
                "TOMCAT_VERSION=10.0.12",
                "TOMCAT_SHA512=e084fc0cc243c0a9ac7de85ffd4b96d00b40b5493ed7ef276d91373fe8036bc953406cd3c48db6b5ae116f2af162fd1bfb13ecdddf5d64523fdd69a9463de8a3"
            ],
            "Cmd": [
                "/bin/sh",
                "-c",
                "#(nop) ",
                "CMD [\"catalina.sh\" \"run\"]"
            ],
            "Image": "sha256:9b2ff315119c435ad9053c0af16ad0e7b888bb8c78f54428b83de6edac04d00a",
            "Volumes": null,
            "WorkingDir": "/usr/local/tomcat",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": {}
        },
        "DockerVersion": "20.10.7",
        "Author": "",
        "Config": {
            "Hostname": "",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "8080/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/tomcat/bin:/usr/local/openjdk-11/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "JAVA_HOME=/usr/local/openjdk-11",
                "LANG=C.UTF-8",
                "JAVA_VERSION=11.0.13",
                "CATALINA_HOME=/usr/local/tomcat",
                "TOMCAT_NATIVE_LIBDIR=/usr/local/tomcat/native-jni-lib",
                "LD_LIBRARY_PATH=/usr/local/tomcat/native-jni-lib",
                "GPG_KEYS=A9C5DF4D22E99998D9875A5110C01C5A2F6059E7",
                "TOMCAT_MAJOR=10",
                "TOMCAT_VERSION=10.0.12",
                "TOMCAT_SHA512=e084fc0cc243c0a9ac7de85ffd4b96d00b40b5493ed7ef276d91373fe8036bc953406cd3c48db6b5ae116f2af162fd1bfb13ecdddf5d64523fdd69a9463de8a3"
            ],
            "Cmd": [
                "catalina.sh",
                "run"
            ],
            "Image": "sha256:9b2ff315119c435ad9053c0af16ad0e7b888bb8c78f54428b83de6edac04d00a",
            "Volumes": null,
            "WorkingDir": "/usr/local/tomcat",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": null
        },
        "Architecture": "amd64",
        "Os": "linux",
        "Size": 679601323,
        "VirtualSize": 679601323,
        "GraphDriver": {
            "Data": {
                "LowerDir": "/var/lib/docker/overlay2/d790d6db212523ea1193ce0b069697c847cf1f46dd7ee49426dbcd7143e6c178/diff:/var/lib/docker/overlay2/92a2c12ab39fe48f706f82bb5676d1864f599e9ab599d9db39cccbfe92039638/diff:/var/lib/docker/overlay2/407eb8f0c69437754677107d8fd7f17f4a1860145be1efc8b42346ce0fd4dbfe/diff:/var/lib/docker/overlay2/463c9c2a46ab7dd277bd856e02fa289c79c35ec8448d5bd928b9cc5f8c135c20/diff:/var/lib/docker/overlay2/4fece198c14710f63376f1cbad8eeb9d6d96ef2bc0abae8f0151e6f747860e4a/diff:/var/lib/docker/overlay2/bea7f4174b9fed08da36a6410fda3c8ac58f435775b9c421cd99728fff3e9886/diff:/var/lib/docker/overlay2/7067926d50fd10ed3aa0640305af85fa6dcc06a97a5673d7a5e6bc18a0e22fc9/diff:/var/lib/docker/overlay2/f7216c6e8ddb0119daa9c817454fe291cbe2ffdda129215ae36ce4c75f211b3d/diff:/var/lib/docker/overlay2/821accbe6656f334993170bbd8d3eddeef16b7b6aa257612b8dd7f829bbf2786/diff",
                "MergedDir": "/var/lib/docker/overlay2/196ca3b125c83355469032ec19738aa2dc468a29d3ae7877904abc5a06b967a5/merged",
                "UpperDir": "/var/lib/docker/overlay2/196ca3b125c83355469032ec19738aa2dc468a29d3ae7877904abc5a06b967a5/diff",
                "WorkDir": "/var/lib/docker/overlay2/196ca3b125c83355469032ec19738aa2dc468a29d3ae7877904abc5a06b967a5/work"
            },
            "Name": "overlay2"
        },
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:62a747bf1719d2d37fff5670ed40de6900a95743172de1b4434cb019b56f30b4",
                "sha256:0b3c02b5d746e8cc8d537922b7c2abc17b22da7de268d068f2a4ebd55ac4f6d7",
                "sha256:9f9f651e9303146e4dd98aca7da21fd8e21dd1a47d71da3d6d187da7691a6dc9",
                "sha256:ba6e5ff31f235bbfd34aae202da4e6d4dc759f266f284d79018cae755f36f9e3",
                "sha256:36e0782f115904773d06f7d03af94a1ec9ca9ad42736ec55baae8823c457ba69",
                "sha256:62a5b8741e8334844625c513016da47cf2b61afb1145f6317edacb4c13ab010e",
                "sha256:78700b6b35d0ab6e70befff1d26c5350222a8fea49cc874916bce950eeae35a1",
                "sha256:cb80689c9aefc3f455b35b0110fa04a7c13e21a25f342ee2bb27c28f618a0eb5",
                "sha256:5122793ce9cb2007fe52ae7bb8ff25001e7c29c04d081a0a4bb1986d1b06a4cb",
                "sha256:450346f29d28210054da70889add4cf59f9c9f3964a94cfa213f905620ade8e2"
            ]
        },
        "Metadata": {
            "LastTagTime": "0001-01-01T00:00:00Z"
        }
    }
]
[root@localhost ~]#
```

　　这里指示了分层信息：

```bash
"RootFS": {
    "Type": "layers",
    "Layers": [
        "sha256:62a747bf1719d2d37fff5670ed40de6900a95743172de1b4434cb019b56f30b4",
        "sha256:0b3c02b5d746e8cc8d537922b7c2abc17b22da7de268d068f2a4ebd55ac4f6d7",
        "sha256:9f9f651e9303146e4dd98aca7da21fd8e21dd1a47d71da3d6d187da7691a6dc9",
        "sha256:ba6e5ff31f235bbfd34aae202da4e6d4dc759f266f284d79018cae755f36f9e3",
        "sha256:36e0782f115904773d06f7d03af94a1ec9ca9ad42736ec55baae8823c457ba69",
        "sha256:62a5b8741e8334844625c513016da47cf2b61afb1145f6317edacb4c13ab010e",
        "sha256:78700b6b35d0ab6e70befff1d26c5350222a8fea49cc874916bce950eeae35a1",
        "sha256:cb80689c9aefc3f455b35b0110fa04a7c13e21a25f342ee2bb27c28f618a0eb5",
        "sha256:5122793ce9cb2007fe52ae7bb8ff25001e7c29c04d081a0a4bb1986d1b06a4cb",
        "sha256:450346f29d28210054da70889add4cf59f9c9f3964a94cfa213f905620ade8e2"
    ]
},
```

　　举一个简单的例子，加入基于`Ubuntu Linux 16.04`创建一个新的镜像，这就是新镜像的第一层；如果在该镜像中添加`Python`包，就会在基础镜像层之上创建第二个镜像层；如果继续添加一个安全补丁，就会创建第三个镜像层。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-image-package-layer.png)

　　在添加额外镜像层的同时，镜像始终保持是当前所有镜像的组合。下图举了一个简单的例子，每个镜像层包含三个文件，而镜像包含了来自两个镜像层的六个文件。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-image-layer.png)

　　这种情况下，上层镜像层中的文件覆盖了底层镜像层中的文件，这样就使得文件的更新版本作为一个新镜像层添加到镜像当中。

　　`Docker`通过存储引擎（新版本采用快照机制）的方式来实现镜像层堆栈，并保证多镜像层对外展示为统一的文件系统。

　　`Linux`上可用的存储引擎有`AUFS`、`Overlay2`、`Device Mapper`、`Btrfs`以及`ZFS`。顾名思义，每种存储引擎都基于`Linux`中对应的文件系统或者块设备技术，并且每种存储引擎都有其独有的性能特点。

　　`Docker`在`Windows`上仅支持`windowsfilter`一种存储引擎，该引擎基于`NTFS`文件系统之上实现了分层和`CoW`。

　　下图展示了与系统显示相同的三层镜像，所有镜像层堆叠并合并，对外提供统一的视图。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-image-merge-view.png)

　　`Docker`镜像都是只读的，当容器启动时，一个新的可写层被加载到镜像的底部，这一层就是通常说的容器层，容器层之下都叫镜像层。

### 提交镜像

　　使用`docker commit`命令提交容器成为一个新的版本，`docker commit -m=“提交的描述信息”  -a="作者" 容器id 目标镜像名:[TAG]`。

　　由于默认的`Tomcat`镜像的`webapps`文件夹中没有任何内容，需要从`webapps.dist`中拷贝文件到`webapps`文件夹。下面自行制作镜像：就是从`webapps.dist`中拷贝文件到`webapps`文件夹下，并提交该镜像作为一个新的镜像。使得该镜像默认的`webapps`文件夹下就有文件。具体命令如下：

```bash
[root@localhost ~]# docker run -it tomcat /bin/bash
root@36d34cc37920:/usr/local/tomcat# cd webapps
root@36d34cc37920:/usr/local/tomcat/webapps# ls
root@36d34cc37920:/usr/local/tomcat/webapps# cd ../
root@36d34cc37920:/usr/local/tomcat# cp -r webapps.dist/* webapps
root@36d34cc37920:/usr/local/tomcat# cd webapps
root@36d34cc37920:/usr/local/tomcat/webapps# ls
ROOT  docs  examples  host-manager  manager
root@36d34cc37920:/usr/local/tomcat/webapps# [root@localhost ~]#
[root@localhost ~]# docker ps
CONTAINER ID   IMAGE     COMMAND       CREATED              STATUS              PORTS      NAMES
36d34cc37920   tomcat    "/bin/bash"   About a minute ago   Up About a minute   8080/tcp   sweet_meninsky
[root@localhost ~]# docker commit -m="add files to  webapps" -a="echo" 36d34cc37920 mytomcat:1.0
sha256:97a599676bbb23fb8ee80fc9872c07660893560cc5af3450d53b6967cb516611
[root@localhost ~]# docker images
REPOSITORY            TAG       IMAGE ID       CREATED         SIZE
mytomcat              1.0       97a599676bbb   4 seconds ago   684MB
tomcat                latest    b0e0b0a92cf9   8 days ago      680MB
mysql                 5.7       938b57d64674   11 days ago     448MB
nginx                 latest    87a94228f133   2 weeks ago     133MB
hello-world           latest    feb5d9fea6a5   5 weeks ago     13.3kB
centos                latest    5d0da3dc9764   6 weeks ago     231MB
portainer/portainer   latest    580c0e4e98b0   7 months ago    79.1MB
elasticsearch         latest    5acf0e8da90b   3 years ago     486MB
abh1nav/dockerui      latest    6e4d05915b2a   6 years ago     470MB
[root@localhost ~]# docker run -it mytomcat:1.0 /bin/bash
root@3821c6f35992:/usr/local/tomcat# cd webapps
root@3821c6f35992:/usr/local/tomcat/webapps# ls
ROOT  docs  examples  host-manager  manager
root@3821c6f35992:/usr/local/tomcat/webapps#
```

　　　　参数说明：

* `-m`：提交的描述信息
* `-a`：作者
* `:[TAG]`：版本号

# 常见容器部署

## Nginx

1. 查找

    ```bash
    [root@localhost ~]# docker search nginx
    NAME                              DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
    nginx                             Official build of Nginx.                        15725     [OK]
    jwilder/nginx-proxy               Automated Nginx reverse proxy for docker con…   2088                 [OK]
    richarvey/nginx-php-fpm           Container running Nginx + PHP-FPM capable of…   818                  [OK]
    jc21/nginx-proxy-manager          Docker container for managing Nginx proxy ho…   266
    linuxserver/nginx                 An Nginx container, brought to you by LinuxS…   159
    tiangolo/nginx-rtmp               Docker image with Nginx using the nginx-rtmp…   142                  [OK]
    jlesage/nginx-proxy-manager       Docker container for Nginx Proxy Manager        142                  [OK]
    alfg/nginx-rtmp                   NGINX, nginx-rtmp-module and FFmpeg from sou…   110                  [OK]
    nginxdemos/hello                  NGINX webserver that serves a simple page co…   76                   [OK]
    privatebin/nginx-fpm-alpine       PrivateBin running on an Nginx, php-fpm & Al…   59                   [OK]
    nginx/nginx-ingress               NGINX and  NGINX Plus Ingress Controllers fo…   55
    nginxinc/nginx-unprivileged       Unprivileged NGINX Dockerfiles                  54
    staticfloat/nginx-certbot         Opinionated setup for automatic TLS certs lo…   25                   [OK]
    nginxproxy/nginx-proxy            Automated Nginx reverse proxy for docker con…   23
    nginx/nginx-prometheus-exporter   NGINX Prometheus Exporter for NGINX and NGIN…   21
    schmunk42/nginx-redirect          A very simple container to redirect HTTP tra…   19                   [OK]
    centos/nginx-112-centos7          Platform for running nginx 1.12 or building …   15
    centos/nginx-18-centos7           Platform for running nginx 1.8 or building n…   13
    bitwarden/nginx                   The Bitwarden nginx web server acting as a r…   11
    flashspys/nginx-static            Super Lightweight Nginx Image                   11                   [OK]
    mailu/nginx                       Mailu nginx frontend                            9                    [OK]
    sophos/nginx-vts-exporter         Simple server that scrapes Nginx vts stats a…   7                    [OK]
    ansibleplaybookbundle/nginx-apb   An APB to deploy NGINX                          2                    [OK]
    wodby/nginx                       Generic nginx                                   1                    [OK]
    arnau/nginx-gate                  Docker image with Nginx with Lua enabled on …   1                    [OK]
    [root@localhost ~]#
    ```
2. 下载

    ```bash
    [root@localhost ~]# docker pull nginx
    Using default tag: latest
    latest: Pulling from library/nginx
    b380bbd43752: Already exists
    fca7e12d1754: Pull complete
    745ab57616cb: Pull complete
    a4723e260b6f: Pull complete
    1c84ebdff681: Pull complete
    858292fd2e56: Pull complete
    Digest: sha256:644a70516a26004c97d0d85c7fe1d0c3a67ea8ab7ddf4aff193d9f301670cf36
    Status: Downloaded newer image for nginx:latest
    docker.io/library/nginx:latest
    [root@localhost ~]#
    ```
3. 启动

    * `-d`：后台运行
    * `--name`：给容器命名
    * `-p 3334:80`：将宿主机的端口 $3334$ 映射到该容器的 $80$ 端口

    ```bash
    [root@localhost ~]# docker run -d --name nginx -p 9000:80 nginx
    e8eb3635abc7f90fe9e7c75cf863f60682c9220550b76041177e4080292438c3
    [root@localhost ~]#
    ```

    ![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-container-portmap.png)
4. 配置文件  
    进入容器，自定义配置文件

    ```bash
    [root@localhost ~]# docker exec -it nginx /bin/bash
    root@e8eb3635abc7:/# whereis nginx
    nginx: /usr/sbin/nginx /usr/lib/nginx /etc/nginx /usr/share/nginx
    root@e8eb3635abc7:/# cd /etc/nginx
    root@e8eb3635abc7:/etc/nginx# ls
    conf.d  fastcgi_params  mime.types  modules  nginx.conf  scgi_params  uwsgi_params
    root@e8eb3635abc7:/etc/nginx#
    ```
5. 访问测试

    * 本地主机访问测试，`curl`命令发起请求，如果使用阿里云服务器需要设置安全组

      ```bash
      [root@localhost ~]# docker ps
      CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS                                   NAMES
      e8eb3635abc7   nginx     "/docker-entrypoint.…"   19 minutes ago   Up 19 minutes   0.0.0.0:9000->80/tcp, :::9000->80/tcp   nginx
      [root@localhost ~]# curl localhost:9000
      <!DOCTYPE html>
      <html>
      <head>
      <title>Welcome to nginx!</title>
      <style>
      html { color-scheme: light dark; }
      body { width: 35em; margin: 0 auto;
      font-family: Tahoma, Verdana, Arial, sans-serif; }
      </style>
      </head>
      <body>
      <h1>Welcome to nginx!</h1>
      <p>If you see this page, the nginx web server is successfully installed and
      working. Further configuration is required.</p>

      <p>For online documentation and support please refer to
      <a href="http://nginx.org/">nginx.org</a>.<br/>
      Commercial support is available at
      <a href="http://nginx.com/">nginx.com</a>.</p>

      <p><em>Thank you for using nginx.</em></p>
      </body>
      </html>
      [root@localhost ~]#
      ```
    * 浏览器访问  
      ![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-nginx-view.png)

## Tomcat

1. 查找

    ```bash
    [root@localhost ~]# docker search tomcat
    NAME                          DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
    tomcat                        Apache Tomcat is an open source implementati…   3161      [OK]
    tomee                         Apache TomEE is an all-Apache Java EE certif…   93        [OK]
    dordoka/tomcat                Ubuntu 14.04, Oracle JDK 8 and Tomcat 8 base…   58                   [OK]
    kubeguide/tomcat-app          Tomcat image for Chapter 1                      31
    consol/tomcat-7.0             Tomcat 7.0.57, 8080, "admin/admin"              18                   [OK]
    cloudesire/tomcat             Tomcat server, 6/7/8                            15                   [OK]
    aallam/tomcat-mysql           Debian, Oracle JDK, Tomcat & MySQL              13                   [OK]
    arm32v7/tomcat                Apache Tomcat is an open source implementati…   11
    andreptb/tomcat               Debian Jessie based image with Apache Tomcat…   10                   [OK]
    rightctrl/tomcat              CentOS , Oracle Java, tomcat application ssl…   7                    [OK]
    arm64v8/tomcat                Apache Tomcat is an open source implementati…   6
    unidata/tomcat-docker         Security-hardened Tomcat Docker container.      5                    [OK]
    amd64/tomcat                  Apache Tomcat is an open source implementati…   3
    cfje/tomcat-resource          Tomcat Concourse Resource                       2
    fabric8/tomcat-8              Fabric8 Tomcat 8 Image                          2                    [OK]
    oobsri/tomcat8                Testing CI Jobs with different names.           2
    jelastic/tomcat               An image of the Tomcat Java application serv…   2
    chenyufeng/tomcat-centos      tomcat基于centos6的镜像                              1                    [OK]
    picoded/tomcat7               tomcat7 with jre8 and MANAGER_USER / MANAGER…   1                    [OK]
    ppc64le/tomcat                Apache Tomcat is an open source implementati…   1
    99taxis/tomcat7               Tomcat7                                         1                    [OK]
    camptocamp/tomcat-logback     Docker image for tomcat with logback integra…   1                    [OK]
    secoresearch/tomcat-varnish   Tomcat and Varnish 5.0                          0                    [OK]
    s390x/tomcat                  Apache Tomcat is an open source implementati…   0
    softwareplant/tomcat          Tomcat images for jira-cloud testing            0                    [OK]
    [root@localhost ~]#
    ```
2. 下载

    ```bash
    [root@localhost ~]# docker pull tomcat
    Using default tag: latest
    latest: Pulling from library/tomcat
    bb7d5a84853b: Pull complete
    f02b617c6a8c: Pull complete
    d32e17419b7e: Pull complete
    c9d2d81226a4: Pull complete
    fab4960f9cd2: Pull complete
    da1c1e7baf6d: Pull complete
    1d2ade66c57e: Pull complete
    ea2ad3f7cb7c: Pull complete
    d75cb8d0a5ae: Pull complete
    76c37a4fffe6: Pull complete
    Digest: sha256:509cf786b26a8bd43e58a90beba60bdfd6927d2ce9c7902cfa675d3ea9f4c631
    Status: Downloaded newer image for tomcat:latest
    docker.io/library/tomcat:latest
    [root@localhost ~]#
    ```
3. 启动

    ```bash
    [root@localhost ~]# docker run -d --name tomcat -p 9000:8080 tomcat
    3b86e8c4255c9d42448e50cae8b6fd528ab0b801a20e66d2bb79dc702be17fb5
    [root@localhost ~]#
    ```
4. 进入容器

    * 容器中的命令少了
    * 阿里云镜像默认下载的是最小的镜像，保证最小的运行环境

    ```bash
    [root@localhost ~]# docker exec -it tomcat /bin/bash
    root@3b86e8c4255c:/usr/local/tomcat# ls
    BUILDING.txt  CONTRIBUTING.md  LICENSE  NOTICE  README.md  RELEASE-NOTES  RUNNING.txt  bin  conf  lib  logs  native-jni-lib  temp  webapps  webapps.dist  work
    root@3b86e8c4255c:/usr/local/tomcat# cd webapps.dist
    root@3b86e8c4255c:/usr/local/tomcat/webapps.dist# ls
    ROOT  docs  examples  host-manager  manager
    root@3b86e8c4255c:/usr/local/tomcat/webapps.dist# cd ../webapps
    root@3b86e8c4255c:/usr/local/tomcat/webapps# ls
    root@3b86e8c4255c:/usr/local/tomcat/webapps# cp -r /usr/local/tomcat/webapps.dist/* /usr/local/tomcat/webapps/
    root@3b86e8c4255c:/usr/local/tomcat/webapps# ls
    ROOT  docs  examples  host-manager  manager
    root@3b86e8c4255c:/usr/local/tomcat/webapps#
    ```
5. 访问测试

    * 本地主机访问测试，`curl`命令发起请求，如果使用阿里云服务器需要设置安全组

      ```bash
      [root@localhost ~]# curl localhost:9000



      <!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="UTF-8" />
              <title>Apache Tomcat/10.0.12</title>
              <link href="favicon.ico" rel="icon" type="image/x-icon" />
              <link href="tomcat.css" rel="stylesheet" type="text/css" />
          </head>
      [root@localhost ~]#
      ```
    * 浏览器访问  
      ![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-tomcat-view.png)

## ElasticSearch

1. 查找

    ```bash
    [root@localhost ~]# docker search elasticsearch
    NAME                                         DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
    elasticsearch                                Elasticsearch is a powerful open source sear…   5289      [OK]
    nshou/elasticsearch-kibana                   Elasticsearch-7.15.1 Kibana-7.15.1              132                  [OK]
    mobz/elasticsearch-head                      elasticsearch-head front-end and standalone …   81
    elastichq/elasticsearch-hq                   Official Docker image for ElasticHQ: Elastic…   76                   [OK]
    itzg/elasticsearch                           Provides an easily configurable Elasticsearc…   71                   [OK]
    elastic/elasticsearch                        The Elasticsearch Docker image maintained by…   56
    taskrabbit/elasticsearch-dump                Import and export tools for elasticsearch       27                   [OK]
    lmenezes/elasticsearch-kopf                  elasticsearch kopf                              18                   [OK]
    barnybug/elasticsearch                       Latest Elasticsearch 1.7.2 and previous rele…   17                   [OK]
    justwatch/elasticsearch_exporter             Elasticsearch stats exporter for Prometheus     17
    blacktop/elasticsearch                       Alpine Linux based Elasticsearch Docker Image   16                   [OK]
    esystemstech/elasticsearch                   Debian based Elasticsearch packing for Lifer…   15
    monsantoco/elasticsearch                     ElasticSearch Docker image                      11                   [OK]
    mesoscloud/elasticsearch                     [UNMAINTAINED] Elasticsearch                    9                    [OK]
    dtagdevsec/elasticsearch                     elasticsearch                                   4                    [OK]
    centerforopenscience/elasticsearch           Elasticsearch                                   4                    [OK]
    barchart/elasticsearch-aws                   Elasticsearch AWS node                          3
    jetstack/elasticsearch-pet                   An elasticsearch image for kubernetes PetSets   1                    [OK]
    axway/elasticsearch-docker-beat              "Beat" extension to read logs of containers …   1                    [OK]
    thingswise/elasticsearch                     Elasticsearch + etcd2 peer discovery            1                    [OK]
    kuzzleio/elasticsearch                       Elasticsearch container based on Alpine Linu…   1                    [OK]
    phenompeople/elasticsearch                   Elasticsearch is a powerful open source sear…   1                    [OK]
    dsteinkopf/elasticsearch-ingest-attachment   elasticsearch + ingest-attachment to be used…   1                    [OK]
    wreulicke/elasticsearch                      elasticsearch                                   0                    [OK]
    travix/elasticsearch-kubernetes              To run ElasticSearch in kubernetes and expor…   0                    [OK]
    [root@localhost ~]#
    ```
2. 下载

    ```bash
    [root@localhost ~]# docker pull elasticsearch
    Using default tag: latest
    latest: Pulling from library/elasticsearch
    05d1a5232b46: Pull complete
    5cee356eda6b: Pull complete
    89d3385f0fd3: Pull complete
    65dd87f6620b: Pull complete
    78a183a01190: Pull complete
    1a4499c85f97: Pull complete
    2c9d39b4bfc1: Pull complete
    1b1cec2222c9: Pull complete
    59ff4ce9df68: Pull complete
    1976bc3ee432: Pull complete
    5af49e8af381: Pull complete
    42c8b75ff7af: Pull complete
    7e6902915254: Pull complete
    99853874fa54: Pull complete
    596fbad6fcff: Pull complete
    Digest: sha256:a8081d995ef3443dc6d077093172a5931e02cdb8ffddbf05c67e01d348a9770e
    Status: Downloaded newer image for elasticsearch:latest
    docker.io/library/elasticsearch:latest
    [root@localhost ~]#
    ```
3. 运行

    1. 添加 `-e ES_JAVA_OPTS="-Xms128m -Xmx512m"` 配置`ElasticSearch`的虚拟机占用的内存大小

        ```bash
        [root@localhost ~]# docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e ES_JAVA_OPTS="-Xms128m -Xmx512m" elasticsearch
        f0df576e243ccb3d0fffdd85924f3241a9490876783440c5fe237d283c76b82f
        [root@localhost ~]#
        ```
    2. `docker stats`：查看资源占用情况

        ```bash
        [root@localhost ~]# docker ps
        CONTAINER ID   IMAGE           COMMAND                  CREATED              STATUS              PORTS                                                                                  NAMES
        f0df576e243c   elasticsearch   "/docker-entrypoint.…"   About a minute ago   Up About a minute   0.0.0.0:9200->9200/tcp, :::9200->9200/tcp, 0.0.0.0:9300->9300/tcp, :::9300->9300/tcp   elasticsearch
        [root@localhost ~]# docker stats
        CONTAINER ID   NAME            CPU %     MEM USAGE / LIMIT     MEM %     NET I/O     BLOCK I/O     PIDS
        f0df576e243c   elasticsearch   0.05%     280.3MiB / 1.748GiB   15.66%    976B / 0B   0B / 48.1kB   31
        CONTAINER ID   NAME            CPU %     MEM USAGE / LIMIT     MEM %     NET I/O     BLOCK I/O     PIDS
        f0df576e243c   elasticsearch   0.05%     280.3MiB / 1.748GiB   15.66%    976B / 0B   0B / 48.1kB   31
        ^C
        [root@localhost ~]#
        ```
4. 进入容器

    ```bash
    [root@localhost ~]# docker exec -it elasticsearch /bin/bash
    root@f0df576e243c:/usr/share/elasticsearch# ls
    NOTICE.txt  README.textile  bin  config  data  lib  logs  modules  plugins
    root@f0df576e243c:/usr/share/elasticsearch#
    ```
5. 访问

    * 本地主机访问测试，`curl`命令发起请求，如果使用阿里云服务器需要设置安全组

      ```bash
      root@f0df576e243c:/usr/share/elasticsearch# curl localhost:9200
      {
        "name" : "6F1a2UH",
        "cluster_name" : "elasticsearch",
        "cluster_uuid" : "D_t1vzAURlmAP6TwqcjKPA",
        "version" : {
          "number" : "5.6.12",
          "build_hash" : "cfe3d9f",
          "build_date" : "2018-09-10T20:12:43.732Z",
          "build_snapshot" : false,
          "lucene_version" : "6.6.1"
        },
        "tagline" : "You Know, for Search"
      }
      root@f0df576e243c:/usr/share/elasticsearch#
      ```
    * 浏览器访问  
      ![](https://cdn.jsdelivr.net/gh/1coins/assets/docker-image-and-container/docker-elasticsearch-view.png)

　　‍
