---
date: 2023-08-16
article: true
timeline: true
index: true
title: Git 总结
category: Git
tag:
- Git
---

# 版本控制简介

## 版本控制

　　工程设计领域中使用版本控制管理工程蓝图的设计过程。在`IT`开发过程中也可以使用版本控制思想管理代码的版本迭代。

## 版本控制工具

* 集中式版本控制工具：`CVS`、`SVN`、`VSS`...
* 分布式版本控制工具：`Git`、`Mercurial`、`Bazaar`、`Darcs`…

## 版本控制工具应该具备的功能

* 协同修改

  多人并行不悖的修改服务器端的同一个文件。
* 数据备份

  不仅保存目录和文件的当前状态，还能够保存每一个提交过的历史状态。
* 版本管理

  在保存每一个版本的文件信息的时候要做到不保存重复数据，以节约存储空间，提高运行效率；这方面`SVN`采用的是增量式管理的方式，而`Git`采取了文件系统快照的方式。
* 权限控制

  对团队中参与开发的人员进行权限控制；对团队外开发者贡献的代码进行审核（`Git`独有）。
* 历史记录

  查看修改人、修改时间、修改内容、日志信息；将本地文件恢复到某一个历史状态。
* 分支管理

  允许开发团队在工作过程中多条生产线同时推进任务，进一步提高效率。

# Git 简介

　　`Git`是分布式版本控制系统，它没有中央服务器，每个人的电脑就是一个完整的版本库，这样，工作的时候就不需要联网了，因为版本都是在自己的电脑上。

　　既然每个人的电脑都有一个完整的版本库，那多个人如何协作呢？比如说自己在电脑上改了文件A，其他人也在电脑上改了文件A，这时，只需把各自的修改推送给对方，就可以互相看到对方的修改了。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/distributed-version-control.png)

　　仓库（版本库）：相当于一个专门用来存放代码的目录，这个目录里面的所有文件都可以`Git`管理，每个文件的增删改查都能被`Git`跟踪到。

## Git 简史

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-history.png)

## Git 官网

　　[官网地址](https://git-scm.com/)

## Git 优势

* 大部分操作在本地完成，不需要联网
* 完整性保证
* 尽可能添加数据而不是删除或修改数据
* 分支操作非常快捷流畅
* 与`Linux`命令全面兼容

## Git 安装

* 安装到非中文没有空格的目录下
* 建议用`VIM`编辑器
* 完全不修改`path`变量，仅在`Git Bash`中使用`Git`：`Use Git from Git Bash only`
* `Use the OpenSSL library`
* 行末换行符转换方式，使用默认值：`Checkout Windows-style, commit Unix-style line endings`
* 执行`Git`命令的默认终端，使用默认值：`Use MinTTY`

## Git 结构

* `Git Repository`（`Git`仓库）：最终确定的文件保存到仓库，成为一个新的版本，并对他人可见
* 暂存区：暂存已经修改的文件，最后统一提交到`Git`仓库中
* 工作区（`Working Directoory`）：添加、编辑、修改文件等动作

## Git 和代码托管中心

　　代码托管中心的任务：维护远程库

* 局域网环境下

  * GitLab 服务器
* 外网环境下

  * GitHub
  * 码云

### 本地库和远程库

#### 团队内部协作

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-within-team.png)

#### 跨团队协作

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-across-team.png)

## Git 工作流程

1. 从远程仓库中克隆`Git`资源作为本地仓库
2. 从本地仓库中`checkout`代码然后进行代码修改
3. 在提交前先将代码提交到暂存区
4. 提交修改。提交到本地仓库。本地仓库中保存修改的各个历史版本
5. 在修改完成后，需要和团队成员共享代码时，可以将代码`push`到远程仓库

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-common-command-flow.png)

# Git 操作

## 本地库初始化

```bash
git init
```

　　注意：`.git`目录中存放的是本地库相关的子目录和文件，不要删除，也不要胡乱修改。

## 设置签名

* 形式

  * 用户名：`tom`
  * `Email`地址：`goodMorning@atguigu.com`
* 作用：区分不同开发人员的身份
* 辨析：这里设置的签名和登录远程库（代码托管中心）的账号、密码没有任何关系
* 命令

  * 项目级别/仓库级别：仅在当前本地库范围内有效。

    ```bash
    git config user.name tom_pro
    git config user.email goodMorning_pro@atguigu.com
    ```

    信息保存位置：`./.git/config`文件。
  * 系统用户级别：登录当前操作系统的用户范围

    ```bash
    git config --global user.name tom_glb
    git config --global goodMorning_pro@atguigu.com
    ```

    信息保存位置：`~/.gitconfig`文件。
* 级别优先级

  * 就近原则： 项目级别优先于系统用户级别， 二者都有时采用项目级别的签名
  * 如果只有系统用户级别的签名，就以系统用户级别的签名为准
  * 不允许二者都没有

## 状态查看

　　查看工作区、暂存区状态

```bash
git status
```

## 添加

　　将工作区的“新建/修改”添加到暂存区

```bash
git add [file name]
```

```bash
[root@centos /home/gittest (master)]$ vi test.txt
[root@centos /home/gittest (master)]$ git add test.txt
```

## 提交

　　将暂存区的内容提交到本地库

```bash
git commit -m "commit message" [file name]
```

```bash
[root@centos /home/gittest (master)]$ git commit -m "first commit" test.txt
```

## 查看历史记录

```bash
git log
```

```bash
[root@centos /home/gittest (master)]$ git log
commit f60cd6c (HEAD -> master)
```

```bash
git log --pretty=oneline
```

```bash
git log --oneline
```

```bash
# HEAD@{移动到当前版本需要多少步}
git reflog
```

　　多屏显示控制方式：

* 空格向下翻页
* `b`向上翻页
* `q`退出

## 前进后退

```bash
[root@centos /home/gittest (master)]$ git reflog
ee9b643 (HEAD -> master) HEAD@{0}: commit: test add h
bea03f7 HEAD@{1}: commit: test add g
2237de4 HEAD@{2}: commit: test add f
4e8b43b HEAD@{3}: commit: test add e
c9fe281 HEAD@{4}: commit: test add d
9c4147d HEAD@{5}: commit: test thrid commit 
31eebcc HEAD@{6}: commit: test second commit 
f60cd6c HEAD@{7}: commit: test first commit
```

* 基于索引值操作[**推荐**]

  ```bash
  git reset --hard [局部索引值]
  ```

  ```bash
  [root@centos /home/gittest (master)]$ git reset --hard 9c4147d
  HEAD is now at 9c4147d test thrid commit
  [root@centos /home/gittest (master)]$ git reflog
  9c4147d (HEAD -> master) HEAD@{0}: reset: moving to 9c4147d 
  ee9b643 HEAD@{1}: commit: test add h
  bea03f7 HEAD@{2}: commit: test add g
  2237de4 HEAD@{3}: commit: test add f
  4e8b43b HEAD@{4}: commit: test add e
  c9fe281 HEAD@{5}: commit: test add d
  9c4147d (HEAD -> master) HEAD@{6}: commit (initial): test thrid commit 
  31eebcc HEAD@{7}: commit: test second commit 
  f60cd6c HEAD@{8}: commit: test first commit
  ```
* 使用`^`符号：只能后退

  ```bash
  git reset --hard HEAD^
  ```

  ```bash
  [root@centos /home/gittest (master)]$ git reset --hard HEAD^
  HEAD is now at 31eebcc test second commit
  [root@centos /home/gittest (master)]$ git reflog
  31eebcc (HEAD -> master) HEAD@{0}: reset: moving to HEAD^
  9c4147d HEAD@{1}: reset: moving to 9c4147d
  ee9b643 HEAD@{2}: commit: test add h
  bea03f7 HEAD@{3}: commit: test add g
  2237de4 HEAD@{4}: commit: test add f
  4e8b43b HEAD@{5}: commit: test add e
  c9fe281 HEAD@{6}: commit: test add d
  9c4147d HEAD@{7}: commit: test thrid commit 
  31eebcc (HEAD -> master) HEAD@{8}: commit (initial): test second commit 
  f60cd6c HEAD@{9}: commit: test first commit
  ```

  注：一个`^`表示后退一步，`n`个表示后退`n`步
* 使用`~`符号：只能后退

  ```bash
  git reset --hard HEAD~n
  ```

  ```bash
  [root@centos /home/gittest (master)]$ git reset --hard HEAD~1
  HEAD is now at f60cd6c test first commit
  [root@centos /home/gittest (master)]$ git reflog
  f60cd6c (HEAD -> master) HEAD@{0}: reset: moving to HEAD~1
  31eebcc HEAD@{1}: reset: moving to HEAD^ 
  9c4147d HEAD@{2}: reset: moving to 9c4147d
  ee9b643 HEAD@{3}: commit: test add h
  bea03f7 HEAD@{4}: commit: test add g
  2237de4 HEAD@{5}: commit: test add f
  4e8b43b HEAD@{6}: commit: test add e
  c9fe281 HEAD@{7}: commit: test add d
  9c4147d HEAD@{8}: commit: test thrid commit 
  31eebcc HEAD@{9}: commit: test second commit 
  f60cd6c (HEAD -> master) HEAD@{10}: commit (initial): test first commit
  ```

  注：表示后退`n`步

### reset 命令的三个参数对比

* `--soft`参数

  * 仅仅在本地库移动`HEAD`指针

  ![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-reset-soft.png)
* `--mixed`参数

  * 在本地库移动`HEAD`指针
  * 重置暂存区

  ![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-reset-mixed.png)
* `--hard`参数

  * 在本地库移动`HEAD`指针
  * 重置暂存区
  * 重置工作区

## 删除文件并找回

```bash
[root@centos /home/gittest (master)]$ vi delete.txt
[root@centos /home/gittest (master)]$ git add delete.txt
[root@centos /home/gittest (master)]$ git commit -m "create delete.txt" delete.txt
[root@centos /home/gittest (master)]$ rm delete.txt
[root@centos /home/gittest (master)]$ git add delete.txt
```

* 前提：删除前，文件存在时的状态提交到了本地库。
* 操作：

  ```bash
  git reset --hard [指针位置]
  ```

  * 删除操作已经提交到本地库：指针位置指向历史记录

    ```bash
    [root@centos /home/gittest (master)]$ rm delete.txt
    [root@centos /home/gittest (master)]$ git add delete.txt
    [root@centos /home/gittest (master)]$ git commit -m "delete delete.txt" delete.txt
    [root@centos /home/gittest (master)]$ git reflog
    03b0563 (HEAD -> master) HEAD@{0}: commit: delete delete.txt
    2d75244 HEAD@{1}: commit: create delete.txt
    f60cd6c HEAD@{2}: reset: moving to HEAD~1
    31eebcc HEAD@{3}: reset: moving to HEAD^ 
    9c4147d HEAD@{4}: reset: moving to 9c4147d
    ee9b643 HEAD@{5}: commit: test add h
    bea03f7 HEAD@{6}: commit: test add g
    2237de4 HEAD@{7}: commit: test add f
    4e8b43b HEAD@{8}: commit: test add e
    c9fe281 HEAD@{9}: commit: test add d
    9c4147d HEAD@{10}: commit: test thrid commit 
    31eebcc HEAD@{11}: commit: test second commit 
    f60cd6c HEAD@{12}: commit (initial): test first commit
    [root@centos /home/gittest (master)]$ git reset --hard 2d75244
    [root@centos /home/gittest (master)]$ ll
    ```
  * 删除操作尚未提交到本地库：指针位置使用`HEAD`

    ```bash
    [root@centos /home/gittest (master)]$ ll
    total 2
    delete.txt
    test.txt
    [root@centos /home/gittest (master)]$ rm delete.txt
    [root@centos /home/gittest (master)]$ git add delete.txt
    [root@centos /home/gittest (master)]$ ll
    total 1
    test.txt
    [root@centos /home/gittest (master)]$ git reset --hard HEAD
    [root@centos /home/gittest (master)]$ ll
    total 2
    delete.txt
    test.txt
    ```

## 比较文件差异

* 将工作区中的文件和暂存区进行比较

  ```bash
  git diff [文件名]
  ```

  ```bash
  [root@centos /home/gittest (master)]$ vi test.txt
  [root@centos /home/gittest (master)]$ git diff test.txt
  ```
* 将工作区中的文件和本地库历史记录比较

  ```bash
  git diff [本地库中历史版本] [文件名]
  ```

  ```bash
  [root@centos /home/gittest (master)]$ git diff HEAD^ test.txt
  diff --git a/test.txt b/test.txt
  ```
* 不带文件名比较多个文件

  ```bash
  [root@centos /home/gittest (master)]$ git diff
  ```

## 分支操作

### 什么是分支

　　在版本控制过程中，使用多条线同时推进多个任务。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-branch.png)

### 分支的好处

* 同时并行推进多个功能开发，提高开发效率
* 各个分支在开发过程中，如果某一个分支开发失败，不会对其他分支有任何影响，将失败的分支删除重新开始即可

### 创建分支

```bash
git branch [分支名]
```

```bash
[root@centos /home/gittest (master)]$ git branch hot_fix
```

### 查看分支

```bash
git branch -v
```

### 切换分支

```bash
git checkout [分支名]
```

```bash
[root@centos /home/gittest (master)]$ git checkout hot_fix
```

### 合并分支

```bash
[root@centos /home/gittest (hot_fix)]$ vi aaa.txt
[root@centos /home/gittest (hot_fix)]$ git add aaa.txt
[root@centos /home/gittest (hot_fix)]$ git commit -m "hot_fix" aaa.txt
```

1. 切换到接受修改的分支（被合并，增加新内容）上

    ```bash
    git checkout [被合并分支名]
    ```

    ```bash
    [root@centos /home/gittest (hot_fix)]$ git checkout master
    [root@centos /home/gittest (master)]$ vi aaa.txt
    [root@centos /home/gittest (master)]$ git add aaa.txt
    [root@centos /home/gittest (master)]$ git commit -m "master" aaa.txt
    ```
2. 执行`merge`命令

    ```bash
    git merge [有新内容分支名]
    ```

    ```bash
    [root@centos /home/gittest (master)]$ git merge hot_fix
    ```
3. 解决冲突

    * 冲突的表现

      ```bash
       [root@centos /home/gittest (hot_fix)]$  git merge master
       Auto-merging aaa.txt
       CONFLICT (ontent): Merge conflict in aaa.txt
       Automatic merge failed; fix conflicts and then commit the
      ```
    * 冲突的解决

      ```bash
      # 当前分支内容
      <<<<<<< HEAD
      hot_fix
      =======
      # 另一分支内容
      master
      >>>>>>> master
      ```

      1. 编辑文件，删除特殊符号

          ```bash
          hot_fix

          master
          ```
      2. 把文件修改到满意的程度，保存退出

          ```bash
          hot_fix master
          ```
      3. `git add [文件名]`

          ```bash
          [root@centos /home/gittest (hot_fix|MERGING)]$ git add aaa.txt
          ```
      4. `git commit -m "日志信息"`

          ```bash
          [root@centos /home/gittest (hot_fix|MERGING)]$ git commit -m "hot and master"
          ```
      5. 此时`commit`一定不能带具体文件名

# Git 基本原理

## 哈希

　　哈希是一个系列的加密算法， 各个不同的哈希算法虽然加密强度不同， 但是有以下几个共同点：

1. 不管输入数据的数据量有多大， 输入同一个哈希算法， 得到的加密结果长度固定
2. 哈希算法确定，输入数据确定，输出数据能够保证不变
3. 哈希算法确定，输入数据有变化，输出数据一定有变化，而且通常变化很大
4. 哈希算法不可逆

　　`Git`底层采用的是`SHA-1`算法。

　　哈希算法可以被用来验证文件，原理如下图所示：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-hash-sha1.png)

　　`Git`就是靠这种机制来从根本上保证数据完整性的。

## Git 保存版本的机制

### 集中式版本控制工具的文件管理机制

　　以文件变更列表的方式存储信息，这类系统将它们保存的信息看作是一组基本文件和每个文件随时间逐步累积的差异。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/file-management-mechanism-of-centralized-version-control.png)

### Git 的文件管理机制

　　`Git`把数据看作是小型文件系统的一组快照，每次提交更新时`Git`都会对当前的全部文件制作一个快照并保存这个快照的索引；为了高效，如果文件没有修改，`Git`不再重新存储该文件，而是只保留一个链接指向之前存储的文件；所以`Git`的工作方式可以称之为快照流。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-file-management-mechanism.png)

### Git 文件管理机制细节

* `Git`的提交对象![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-file-management-mechanism-commit1.png)
* 提交对象及其父对象形成的链条![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-file-management-mechanism-commit2.png)

## Git 分支管理机制

### 创建分支

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-create-branch.png)

## 切换分支

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-checkout-branch1.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-checkout-branch2.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-checkout-branch3.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/git-checkout-branch4.png)

# GitHub

## 账号信息

　　[`GitHub`]() [首页](https://github.com/)就是注册页面。

## 创建远程库

　　个人主页`New Repositories`。

## 创建远程库地址别名

* 查看当前所有远程地址别名

  ```bash
  git remote -v
  ```
* 创建远程库地址别名

  ```bash
  git remote add [别名] [远程地址]
  ```

```bash
[root@centos /home/huashan]$ git remote add origin https://github.com/atguigu2018ybuq/huashan.git
[root@centos /home/huashan (master)]$ git remote -v
origin https://github.com/atguigu2018ybuq/huashan.git (fetch)
origin https://github.com/atguigu2018ybuq/huashan.git (push)
```

## 推送

　　开发修改完把本地库的文件推送到远程仓库，前提是提交到了本地库才可以推送。

```bash
git push [别名] [分支名]
```

```bash
[root@centos /home/huashan (master)]$ git push origin master
```

## 克隆

　　完整的把远程库克隆到本地，克隆下来后不要在主分支里面做开发。

　　`clone`进行一次从无到有的过程，更新用`pull`。

```bash
git clone [远程地址]
```

```bash
[root@centos /home/huashan]$ git clone https://github.com/atguigu2018ybuq/huashan.git
```

　　效果：

* 完整的把远程库下载到本地
* 创建`origin`远程地址别名
* 初始化本地库

## 团队成员邀请

　　`Repositories` ->`Setting`->`Colllaboators`->`Add collaborator`->`Copy invite link`。

　　把自己的邀请链接发送给其他人，其他人登录自己的`GitHub`账号，访问邀请链接。

## 拉取

　　`pull=fetch+merge`

* `fetch`只是抓取远程库，不会修改本地，想要查看可以`git checkout origin/master`
* 将`fetch`和`merge`分开来做，可以更方便，先将远程库抓取，查看之后再合并，合并使用`git merge origin/master`
* 直接使用`pull`可能会在其中的`merge`操作发生冲突

```bash
git fetch [远程库地址别名] [远程分支名]
git merge [远程库地址别名/远程分支名]
git pull [远程库地址别名] [远程分支名]
```

## 解决冲突

　　`A`和`B`原本都是同样的文件，`A`修改后推送到`GitHub`上，`B`再修改后推送就不允许了。

* 要点

  * 如果不是基于`GitHub`远程库的最新版所做的修改，不能推送，必须先拉取
  * 拉取下来后如果进入冲突状态，则按照“分支冲突解决”操作解决即可
  * 解决冲突后的提交是不能带文件名的
* 类比

  * 债权人：老王
  * 债务人：小刘
  * 老王说 10 天后归还，小刘接受，双方达成一致
  * 老王媳妇说 5 天后归还，小刘不能接受，老王媳妇需要找老王确认后再执行

## 跨团队协作

1. `Fork`

    自己`Fork`其他人的仓库
2. 自己本地修改，然后推送到远程
3. 自己`Pull Request`->`Create pull request`
4. 对话

    他人和自己对话，询问代码详情。
5. 他人审核代码
6. 他人合并代码`Merge pull request`->`Commit merge`
7. 将远程库修改拉取到本地

## SSH 登录

　　缺点：每台电脑只能登陆一个账号。

1. 进入当前用户的家目录

    ```bash
    cd ~
    ```
2. 删除 `.ssh` 目录

    ```bash
    rm -rvf .ssh
    ```
3. 运行命令生成 `.ssh` 密钥目录

    ```bash
    # 注意：这里 -C 参数是大写的 C
    ssh-keygen -t rsa -C atguigu2018ybuq@aliyun.com
    ```
4. 进入 `.ssh` 目录查看文件列表

    ```bash
    cd .ssh
     ls -lF
    ```
5. 查看 `id_rsa.pub` 文件内容

    ```bash
     cat id_rsa.pub
    ```
6. 复制 `id_rsa.pub` 文件内容， 登录 `GitHub`，点击用户头像 →`Settings`→`SSH and GPG keys`
7. `New SSH Key`
8. 输入复制的密钥信息
9. 回到 `Git bash` 创建远程地址别名

    ```bash
    git remote add origin_ssh git@github.com:atguigu2018ybuq/huashan.git
    ```
10. 推送文件进行测试

# Git 工作流

　　在项目开发过程中使用`Git`的方式。

## 分类

### 集中式工作流

　　像`SVN`一样，集中式工作流以中央仓库作为项目所有修改的单点实体，所有修改都提交到`Master`这个分支上。

　　这种方式与`SVN`的主要区别就是开发人员有本地库。

　　这种方式`Git`很多特性并没有用到。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/centralized-workflow.png)

### GitFlow 工作流

　　`Gitflow`工作流通过为功能开发、发布准备和维护设立了独立的分支，让发布迭代过程更流畅。严格的分支模型也为大型项目提供了一些非常必要的结构。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/gitflow-workflow.png)

# Forking 工作流

　　`Forking`工作流是在`GitFlow`基础上，充分利用了`Git`的`Fork`和`pull request`的功能以达到代码审核的目的。 更适合安全可靠地管理大团队的开发者， 而且能接受不信任贡献者的提交。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/forking-workflow.png)

## GitFlow 工作流详解

### 分支种类

* 主干分支`master`

  主要负责管理正在运行的生产环境代码。 永远保持与正在运行的生产环境完全一致。
* 开发分支`develop`

  主要负责管理正在开发过程中的代码，一般情况下应该是最新的代码。
* `bug`修理分支`hotfix`

  主要负责管理生产环境下出现的紧急修复的代码；从主干分支分出，修理完毕并测试上线后，并回主干分支；并回后，视情况可以删除该分支。
* 准生产分支（预发布分支）`release`

  较大的版本上线前， 会从开发分支中分出准生产分支， 进行最后阶段的集成测试；该版本上线后，会合并到主干分支。生产环境运行一段阶段较稳定后可以视情况删除。
* 功能分支`feature`

  为了不影响较短周期的开发工作， 一般把中长期开发模块， 会从开发分支中独立出来；开发完成后会合并到开发分支。

### GitFlow 工作流举例

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/gitflow-workfllow-example.png)

### 分支实战

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/gitflow-branch-example.png)

# GitLab 服务器

## 官网

* [首页](https://about.gitlab.com/)
* [安装说明](https://about.gitlab.com/installation/)

## 安装

　　[下载地址](https://packages.gitlab.com/gitlab/gitlab-ce/packages/el/7/gitlab-ce-10.8.2-ce.0.el7.x86_64.rpm)。

```bash
sudo yum install -y curl policycoreutils-python openssh-server cronie
sudo lokkit -s http -s ssh
sudo yum install postfix
sudo service postfix start
sudo chkconfig postfix on
curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.rpm.sh | sudo bash
sudo EXTERNAL_URL="http://gitlab.example.com" yum -y install gitlab-ee
```

　　`yum`安装`gitlab-ee`（或`ce`）时，需要联网下载安装文件，非常耗时，所以应提前把所需`RPM`包下载并安装好。

```bash
sudo rpm -ivh /opt/gitlab-ce-10.8.2-ce.0.el7.x86_64.rpm
sudo yum install -y curl policycoreutils-python openssh-server cronie
sudo lokkit -s http -s ssh
sudo yum install postfix
sudo service postfix start
sudo chkconfig postfix on
curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash
sudo EXTERNAL_URL="http://gitlab.example.com" yum -y install gitlab-ce
```

　　步骤完成后重启。

## GitLab 服务操作

* 初始化配置`GitLab`

  ```bash
  gitlab-ctl reconfigure
  ```
* 启动`GitLab`服务

  ```bash
  gitlab-ctl start
  ```
* 停止`GitLab`服务

  ```bash
  gitlab-ctl stop
  ```

## 浏览器访问

　　访问`Linux`服务器`IP`地址即可，如果想访问`EXTERNAL_URL`指定的域名还需要配置域名服务器或本地`hosts` 文件。

　　初次登录时需要为`GitLab`的`root`用户设置密码：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/git-summary/gitllab-page.png)

　　应该会需要停止防火墙服务：

```bash
service firewalld stop
```

　　‍
