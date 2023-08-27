---
date: 2023-08-30
article: true
timeline: true
index: true
title: 面向对象设计的 SOLID 原则
category: OOP
tag:
- OOP
---

`S.O.L.I.D`是面向对象设计和编程（`OOD&OOP`）中几个重要编码原则（`Programming Priciple`）的首字母缩写。

|简称|书籍|名称|
| :-------------------: | :-------------------: | :-------------------: |
|**SRP**|[The Single Responsibility Principle](http://www.objectmentor.com/resources/articles/srp.pdf)<br />|单一责任原则|
|**OCP**|[The Open Closed Principle](http://www.objectmentor.com/resources/articles/ocp.pdf)<br />|开放封闭原则|
|**LSP**|[The Liskov Substitution Principle](http://www.objectmentor.com/resources/articles/lsp.pdf)|里氏替换原则|
|**DIP**|[The Dependency Inversion Principle](http://www.objectmentor.com/resources/articles/dip.pdf)|依赖倒置原则|
|**ISP**|[The Interface Segregation Principle](http://www.objectmentor.com/resources/articles/isp.pdf)|接口分离原则|

　　[Steve Smith](http://stevesmithblog.com/)在5月份的微软TechED 2009上有个[SOLIDify Your ASP.NET MVC](http://stevesmithblog.com/blog/teched-2009-session-aftermath/)的讲座, [derick.bailey](http://www.lostechies.com/members/derick.bailey/default.aspx)的[SOLID Development Principles – In Motivational Pictures](http://www.lostechies.com/blogs/derickbailey/archive/2009/02/11/solid-development-principles-in-motivational-pictures.aspx)很好的解释了SOLID原则。

# 单一责任原则

　　当需要修改某个类的时候原因有且只有一个（`THERE SHOULD NEVER BE MORE THAN ONE REASON FOR A CLASS TO CHANGE`）。换句话说就是让一个类只做一种类型责任，当这个类需要承当其他类型的责任的时候，就需要分解这个类。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/object-oriented-solid/srp.png "Single Responsibility Principle")

# 开放封闭原则

　　软件实体应该是可扩展，而不可修改的。也就是说，对扩展是开放的，而对修改是封闭的。这个原则是诸多面向对象编程原则中最抽象、最难理解的一个。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/object-oriented-solid/ocp.png "Open Closed Principle")

# 里氏替换原则

　　当一个子类的实例应该能够替换任何其超类的实例时，它们之间才具有`is-a`关系。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/object-oriented-solid/lsp.png "Liskov Subtitution Principle")

# 依赖倒置原则

1. 高层模块不应该依赖于低层模块，二者都应该依赖于抽象
2. 抽象不应该依赖于细节，细节应该依赖于抽象

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/object-oriented-solid/dip.png "Dependency Inversion Principle")

# 接口分离原则

　　不能强迫用户去依赖那些他们不使用的接口。换句话说，使用多个专门的接口比使用单一的总接口总要好。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/object-oriented-solid/isp.png "Interface Segregation Principle")

　　这几条原则是非常基础而且重要的面向对象设计原则，正是由于这些原则的基础性，理解、融汇贯通这些原则需要不少的经验和知识的积累，上述的图片很好的注释了这几条原则。

　　‍
