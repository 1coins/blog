---
date: 2023-08-23
article: true
timeline: true
index: true
title: MarkDdown 链接小卡片
category: MarkDdown
tag:
- MarkDdown
---

提醒：需要会写基本的`Markdown`语法（当然，如果只想学会链接小卡片的话会写图片和链接的语法就可以了）。

# 什么是链接小卡片

　　实际上叫`badge`，翻译过来是徽标的意思。

　　因为我每次用这个都是用作链接，而它长得有点像小卡片，所以贴心地起名叫“链接小卡片”。

# 使用方法

　　链接小卡片本质上是借助 ![](https://img.shields.io/badge/Shields.io-八月?color=222&logo=shieldsdotio)[https://img.shields.io/](https://img.shields.io/) 这个网站来实现的图片，所以会用到`Markdown`图片语法，如果想做成链接，还需用到 Markdown 链接语法。

　　所有参数值未加特殊说明均不可省略！

　　由于是通过其他网站实现显示图片，所以要想正常显示，必须确保有网。

## 单内容链接小卡片

　　我把只有一个内容项的称为**单内容链接小卡片**。

### 语法

```markdown
![](https://img.shields.io/badge/内容-防伪值?color=颜色值)
```

### 示例

```markdown
![](https://img.shields.io/badge/乾元-1coins?color=000000)
```

　　效果：![](https://img.shields.io/badge/乾元-1coins?color=000000)

### 注意事项

* 使用时替换语法代码部分中的汉字内容即可
* 颜色值可省略（从`?`开始省略）
* 颜色值均指背景颜色，字体颜色会自动调整，无法自定义字体颜色
* 颜色值若使用 16 进制，不要加`#`号
* 默认的颜色是：![](https://img.shields.io/badge/绿的-未央)
* 防伪值只是我是这么叫的，因为它不会显示
* 只要出现防伪值，防伪值均不可省略，下同

## 双内容链接小卡片

　　我把有两个内容项的称为**双内容链接小卡片**。

### 语法

```markdown
![](https://img.shields.io/badge/前内容-后内容-后内容颜色值)
```

### 示例

```markdown
![](https://img.shields.io/badge/乾元-1coins-fff)
```

　　效果：![](https://img.shields.io/badge/乾元-1coins-fff)

### 注意事项

* 所有内容均不可省略，包括颜色值
* 这里的颜色值只能修改**后内容**的颜色值

## 图标链接小卡片

　　我把带有小图标的称为**图标链接小卡片**。

　　图标链接小卡片又分为**内置图标链接小卡片**和**自定义图标链接小卡片**。

### 内置图标链接小卡片

　　内置图标可以直接使用。所有内置图标可以在这里找到（点击传送）：![](https://img.shields.io/badge/Simple%20Icons-八月?color=222&logo=simpleicons)[https://simpleicons.org/](https://simpleicons.org/)

#### 语法

```markdown
1. 单内容
![](https://img.shields.io/badge/内容-防伪值?color=颜色&logo=内置图标名)

2. 双内容
![](https://img.shields.io/badge/前内容-后内容-后内容颜色值?logo=内置图标名)
```

#### 示例

```markdown
1. 单内容
![](https://img.shields.io/badge/QQ-乾元?color=4ab7f5&logo=tencentqq)

2. 双内容
![](https://img.shields.io/badge/macOS-10.13+-367aff?logo=apple)
```

　　效果：

1. 单内容：![](https://img.shields.io/badge/QQ-乾元?color=4ab7f5&logo=tencentqq)
2. 双内容：![](https://img.shields.io/badge/macOS-10.13+-367aff?logo=apple)

#### 修改内置图标颜色

* 部分内置图标默认是白色的，比如上面的示例
* 部分内置图标默认自带颜色，比如：![](https://img.shields.io/badge/WeChat-八月?color=fff&logo=wechat) 和 ![](https://img.shields.io/badge/支付宝-八月?color=fff&logo=alipay)
* 哪些默认带颜色，哪些默认不带，需要自己试
* 内置图标的颜色可以修改

##### 语法

```markdown
1. 单内容
![](https://img.shields.io/badge/内容-防伪值?color=颜色&logo=内置图标名&logoColor=内置图标颜色值)

2. 双内容
![](https://img.shields.io/badge/前内容-后内容-后内容颜色值?logo=内置图标名&logoColor=内置图标颜色值)
```

##### 示例

```markdown
1. 单内容
![](https://img.shields.io/badge/QQ-乾元?color=fff&logo=tencentqq&logoColor=4ab7f5)

2. 双内容
![](https://img.shields.io/badge/macOS-10.13+-367aff?logo=apple&logoColor=f9d694)
```

　　效果：

1. 单内容：![](https://img.shields.io/badge/QQ-乾元?color=fff&logo=tencentqq&logoColor=4ab7f5)
2. 双内容：![](https://img.shields.io/badge/macOS-10.13+-367aff?logo=apple)

#### 自定义图标链接小卡片

　　自定义图标需将图片转换成`Base64`编码（这样的工具很多），同时需要原图片的长和宽均 ≥ 14px。

##### 语法

```markdown
1. 单内容
![](https://img.shields.io/badge/内容-防伪值?color=颜色&logo=内置图标名&logoColor=内置图标颜色值)

2. 双内容
![](https://img.shields.io/badge/前内容-后内容-后内容颜色值?logo=内置图标名&logoColor=内置图标颜色值)
```

##### 示例

　　我把自己的头像转换成了`Base64`编码作为示例，不过编码太长了，放进来严重影响性能，所以就省略不放了。

```markdown
1. 单内容
![](https://img.shields.io/badge/乾元-1coins?color=fff&logo=data:image/png;base64,AAA...A==)

2. 双内容
![](https://img.shields.io/badge/乾元-1coins-fff?logo=data:image/png;base64,AAA...A==)
```

　　效果：

1. 单内容：![](https://img.shields.io/badge/乾元-1coins?color=fff&logo=data:image/png;base64,AAA...A==)
2. 双内容：![](https://img.shields.io/badge/乾元-1coins-fff?color=fff&logo=data:image/jpg;base64,9j)

## 双内容自定义颜色

　　前面提及双内容链接小卡片的语法和示例中可修改的颜色值都只能修改后内容的颜色。

　　本小节将演示如何分别控制双内容的颜色。

### 语法

```markdown
![](https://img.shields.io/badge/后内容-防伪值?label=前内容&colorA=前内容颜色值&colorB=后内容颜色值)
```

### 示例

```markdown
![](https://img.shields.io/badge/macOS-乾元?label=AppStore&colorA=fff&colorB=367aff&logo=appstore)
```

　　效果：![](https://img.shields.io/badge/macOS-乾元?label=AppStore&colorA=fff&colorB=367aff&logo=appstore)

### 注意事项

* 注意图片语法链接中的“前内容”跑到后面去了，“后内容”跑到前面去了，不要搞反了
* 如果要加上图标，比如上面的示例，直接在图片语法链接末尾加上`&logo=图标名`即可，注意`&`不要忘了
* 如果还要修改图标颜色，再继续在链接末尾继续加上`&logoColor=图标颜色值`即可

## 增加超链接

　　链接小卡片是可以点的，这是因为在`Markdown`图片语法外层又套娃了一层超链接语法。

### 语法

```markdown
[链接小卡片图片显示](超链接地址)
```

### 示例

　　就是把`§ 2.1 ~ § 2.4`学到的放在超链接语法的`[]`里就行。

```markdown
[![](https://img.shields.io/badge/乾元-1coins?color=fff&logo=data:image/png;base64,AAA...A==)](https://1coins.github.io/)
```

　　效果：![](https://img.shields.io/badge/乾元-1coins?color=fff&logo=data:image/png;base64,AAA...A==)[https://1coins.github.io/](https://1coins.github.io/)

### 注意事项

* 注意图片语法链接中的“前内容”跑到后面去了，“后内容”跑到前面去了，不要搞反了
* 如果要加上图标，比如上面的示例，直接在图片语法链接末尾加上`&logo=图标名`即可，注意`&`不要忘了
* 如果还要修改图标颜色，再继续在链接末尾继续加上`&logoColor=图标颜色值`即可

　　其他的可以自行尝试。

## 样式

　　有五种样式可供选择。

### 立体胶质圆角矩形

```markdown
![](https://img.shields.io/badge/style=plastic-乾元?label=Git&colorA=fff&colorB=f14d28&logo=git&style=plastic)
```

　　效果：![](https://img.shields.io/badge/style=plastic-乾元?label=Git&colorA=fff&colorB=f14d28&logo=git&style=plastic)

### 扁平圆角矩形（默认）

　　如果什么都不加，默认就相当于`&style=flat`。

```markdown
![](https://img.shields.io/badge/style=flat-乾元?label=Git&colorA=fff&colorB=f14d28&logo=git&style=flat)
```

　　效果：![](https://img.shields.io/badge/style=flat-乾元?label=Git&colorA=fff&colorB=f14d28&logo=git&style=flat)

### 扁平直角矩形

```markdown
![](https://img.shields.io/badge/style=flat--square-乾元?label=Git&colorA=fff&colorB=f14d28&logo=git&style=flat-square)
```

　　效果：![](https://img.shields.io/badge/style=flat--square-乾元?label=Git&colorA=fff&colorB=f14d28&logo=git&style=flat-square)

### 大扁平圆角矩形 - 字母全大写

```markdown
![](https://img.shields.io/badge/style=for--the--badge-乾元?label=Git&colorA=fff&colorB=f14d28&logo=git&style=for-the-badge)
```

　　效果：![](https://img.shields.io/badge/style=for--the--badge-乾元?label=Git&colorA=fff&colorB=f14d28&logo=git&style=for-the-badge)

### GitHub 交流样式

```markdown
![](https://img.shields.io/badge/style=social-乾元?label=Git&colorA=fff&colorB=f14d28&logo=git&style=social)
```

　　效果：![](https://img.shields.io/badge/style=social-乾元?label=Git&colorA=fff&colorB=f14d28&logo=git&style=social)

## 动态内容

　　动态内容即显示的内容为可变的，主要用于`GitHub`等网站的某些数据显示。

　　这里的动态内容只介绍与`GitHub`相关的一部分，想了解更多可以去官网查询。

　　以`Linux`之父林纳斯·托瓦斯的`Linux`源代码仓库`torvalds/linux`为示例。

### Watch

　　语法：

```markdown
![](https://img.shields.io/github/watchers/用户名/仓库名?style=social&label=Watch)
```

　　示例：

```markdown
![](https://img.shields.io/github/watchers/torvalds/linux?style=social&label=Watch)
```

　　效果：![](https://img.shields.io/github/watchers/torvalds/linux?style=social&label=Watch)

### Star

　　语法：

```markdown
![](https://img.shields.io/github/stars/用户名/仓库名?style=social)
```

　　示例：

```markdown
![](https://img.shields.io/github/stars/torvalds/linux?style=social&label=star)
```

　　效果：![](https://img.shields.io/github/stars/torvalds/linux?style=social&label=star)

### Fork

　　语法：

```markdown
![](https://img.shields.io/github/forks/用户名/仓库名?style=social&label=Fork)
```

　　示例：

```markdown
![](https://img.shields.io/github/forks/torvalds/linux?style=social&label=Fork)
```

　　效果：![](https://img.shields.io/github/forks/torvalds/linux?style=social&label=Fork)

　　其他的可以自行尝试。

# 特殊符号问题

　　有时候需要空格或者其他的特殊符号，直接打在链接里可能会导致结果不符合预期。

　　解决方法其实很简单，就是把特殊符号转换成`url`编码即可。

## 空格示例

　　之前`App Store`那个示例中是没有空格的，现在添加空格（空格的`url`编码是`%20`）：

```markdown
![](https://img.shields.io/badge/macOS-乾元?label=App%20Store&colorA=fff&colorB=367aff&logo=appstore)
```

　　效果：![](https://img.shields.io/badge/macOS-乾元?label=App%20Store&colorA=fff&colorB=367aff&logo=appstore)

## 短横 - 符号示例

　　短横符号`-`比较特殊，它没有`url`编码，或者说它的`url`编码就是它本身。 要想在小卡片中显示它也很简单，写两遍就行。

```markdown
![](https://img.shields.io/badge/----everything--is--local-乾元?label=git&colorA=fff&colorB=f14d28&logo=git)
```

　　效果：![](https://img.shields.io/badge/----everything--is--local-乾元?label=git&colorA=fff&colorB=f14d28&logo=git)
