---
date: 2023-10-15
article: true
timeline: true
index: true
title: 发布确认与交换机
category: RabbitMQ
tag:
- RabbitMQ
---

# 发布确认

## 发布确认原理

　　生产者将信道设置成`confirm`模式，一旦信道进入`confirm`模式，所有在该信道上面发布的消息都将会被指派一个唯一的`ID`（从 1 开始），一旦消息被投递到所有匹配的队列之后，`broker`就会发送一个确认给生产者（包含消息的唯一`ID`），这就使得生产者知道消息已经正确到达目的队列了；如果消息和队列是可持久化的，那么确认消息会在将消息写入磁盘之后发出，`broker`回传给生产者的确认消息中`delivery-tag`域包含了确认消息的序列号，此外`broker`也可以设`basic.ack` 的`multiple`域，表示到这个序列号之前的所有消息都已经得到了处理。

　　`confirm`模式最大的好处在于他是异步的，一旦发布一条消息，生产者应用程序就可以在等信道返回确认的同时继续发送下一条消息，当消息最终得到确认之后，生产者应用便可以通过回调方法来处理该确认消息，如果`RabbitMQ`因为自身内部错误导致消息丢失，就会发送一条`nack`消息，生产者应用程序同样可以在回调方法中处理该`nack`消息。

## 发布确认的策略

### 开启发布确认的方法

　　发布确认默认是没有开启的，如果要开启需要调用方法`confirmSelect`，每当你要想使用发布确认，都需要在`channel`上调用该方法。

```java
Channel channel = connection.createChannel()
channel.confirmSelect();
```

### 单个确认发布

　　这是一种简单的确认方式，它是一种同步确认发布的方式，也就是发布一个消息之后只有它被确认发布，后续的消息才能继续发布，`waitForConfirmsOrDie(long)`这个方法只有在消息被确认的时候才返回，如果在指定时间范围内这个消息没有被确认那么它将抛出异常。

　　这种确认方式有一个最大的缺点就是:发布速度特别的慢，因为如果没有确认发布的消息就会阻塞所有后续消息的发布，这种方式最多提供每秒不超过数百条发布消息的吞吐量，当然对于某些应用程序来说这可能已经足够了。

```java
public class Task {

    // 队列名称
    private static final String TASK_QUEUE_NAME = "ack_queue";
    // 消息条数
    private static final int MESSAGE_COUNT = 1000;

    /**
     * 分别测试 单个确认发布、批量确认发布、异步确认发布 消耗的时间
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {

        // 单个确认发布 消耗时间为：发布 1000 个单独确认消息,耗时 184 ms
        publishMessageIndividually();
    }

    /**
     * 单个确认发布
     * @throws Exception
     */
    public static void publishMessageIndividually() throws Exception {

        try (Channel channel = RabbitMqUtils.getChannel()) {
            // 随机取名
            String queueName = UUID.randomUUID().toString();
            channel.queueDeclare(queueName, false, false, false, null);
            // 开启发布确认
            channel.confirmSelect();
            // 开始时间
            long begin = System.currentTimeMillis();
            for (int i = 0; i < MESSAGE_COUNT; i++) {
                String message = i + "";
                channel.basicPublish("", queueName, null, message.getBytes());
                // 单个确认发发布
                // 服务端返回 false 或超时时间内未返回，生产者可以消息重发
                boolean flag = channel.waitForConfirms();
                if(flag){
                    System.out.println("消息发送成功");
                }
            }
            // 结束时间
            long end = System.currentTimeMillis();

            System.out.println("发布 " + MESSAGE_COUNT + " 个单独确认消息,耗时 " + (end - begin) + " ms");
        }
    }
}
```

### 批量确认发布

　　上面那种方式非常慢，与单个等待确认消息相比，先发布一批消息然后一起确认可以极大地提高吞吐量；当然这种方式的缺点就是：当发生故障导致发布出现问题时，不知道是哪个消息出现问题了，必须将整个批处理保存在内存中，以记录重要的信息而后重新发布消息；当然这种方案仍然是同步的，也一样阻塞消息的发布。

```java
public class Task {

    // 队列名称
    private static final String TASK_QUEUE_NAME = "ack_queue";
    // 消息条数
    private static final int MESSAGE_COUNT = 1000;

    /**
     * 分别测试 单个确认发布、批量确认发布、异步确认发布 消耗的时间
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {

        // 单个确认发布 消耗时间为：发布 1000 个单独确认消息,耗时 184 ms
        // publishMessageIndividually();
        // 批量确认发布 消耗时间为：发布 1000 个批量确认消息,耗时 41 ms
        publishMessageBatch();
    }

    /**
     * 批量确认发布
     * @throws Exception
     */
    public static void publishMessageBatch() throws Exception {
        try (Channel channel = RabbitMqUtils.getChannel()) {
            String queueName = UUID.randomUUID().toString();
            channel.queueDeclare(queueName, false, false, false, null);
            // 开启发布确认
            channel.confirmSelect();
            // 批量确认消息 批量大小
            int batchSize = 100;
            // 未确认消息个数
            int outstandingMessageCount = 0;
            // 开始时间
            long begin = System.currentTimeMillis();
            for (int i = 0; i < MESSAGE_COUNT; i++) {
                String message = i + "";
                channel.basicPublish("", queueName, null, message.getBytes());
                // 未确认消息个数 + 1
                outstandingMessageCount++;
                // 未确认消息个数达到 100 时，发布确认
                if (outstandingMessageCount == batchSize) {
                    channel.waitForConfirms();
                    outstandingMessageCount = 0;
                }
            }
            // 为了确保还有剩余没有确认消息 再次确认
            if (outstandingMessageCount > 0) {
                channel.waitForConfirms();
            }

            // 结束时间
            long end = System.currentTimeMillis();
            System.out.println("发布 " + MESSAGE_COUNT + " 个批量确认消息,耗时 " + (end - begin) + " ms");
        }
    }
}
```

### 异步确认发布

　　异步确认虽然编程逻辑比上两个要复杂，但是性价比最高，无论是可靠性还是效率都没得说，它是利用回调函数来达到消息可靠性传递的，这个中间件也是通过函数回调来保证是否投递成功，下面就来详细讲解异步确认是怎么实现的。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/asynchronous-confirme-release.png)

```java
public class Task {

    // 队列名称
    private static final String TASK_QUEUE_NAME = "ack_queue";
    // 消息条数
    private static final int MESSAGE_COUNT = 1000;

    /**
     * 分别测试 单个确认发布、批量确认发布、异步确认发布 消耗的时间
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {

        // 单个确认发布 消耗时间为：发布 1000 个单独确认消息, 耗时 184 ms
        // publishMessageIndividually();
        // 批量确认发布 消耗时间为：发布 1000 个批量确认消息, 耗时 41 ms
        // publishMessageBatch();
        // 异步确认发布 消耗时间为：发布 1000 个异步确认消息, 耗时 23 ms
        publishMessageAsync();
    }

    /**
     * 异步发布确认
     * @throws Exception
     */
    public static void publishMessageAsync() throws Exception {
        try (Channel channel = RabbitMqUtils.getChannel()) {
            String queueName = UUID.randomUUID().toString();
            channel.queueDeclare(queueName, false, false, false, null);
            // 开启发布确认
            channel.confirmSelect();
            /**
             * 线程安全有序的一个哈希表，适用于高并发的情况
             * 1. 将序号与消息进行关联
             * 2. 只要给到序列号，可以批量删除条目
             * 3. 支持并发访问
             */
            ConcurrentSkipListMap<Long, String> outstandingConfirms = new ConcurrentSkipListMap<>();
            /**
             * 确认收到消息的一个回调
             * 1. 消息序列号
             * 2. true 可以确认小于等于当前序列号的消息，false 确认当前序列号消息
             */
            ConfirmCallback ackCallback = (sequenceNumber, multiple) -> {
                // 是否批量发布
                if (multiple) {
                    // 批量发布
                    // 返回的是小于等于当前序列号的未确认消息 是一个 map
                    ConcurrentNavigableMap<Long, String> confirmed = outstandingConfirms.headMap(sequenceNumber, true);
                    // 清除该部分未确认消息
                    confirmed.clear();
                } else {
                    // 只清除当前序列号的消息
                    outstandingConfirms.remove(sequenceNumber);
                }
            };
            // 未确认消息的回调函数
            ConfirmCallback nackCallback = (sequenceNumber, multiple) -> {
                String message = outstandingConfirms.get(sequenceNumber);
                System.out.println("发布的消息 " + message + " 未被确认，序列号 " + sequenceNumber);
            };

            /**
             * 添加一个异步确认的监听器
             * 1. 确认收到消息的回调
             * 2. 未收到消息的回调
             */
            channel.addConfirmListener(ackCallback, null);

            // 开始时间
            long begin = System.currentTimeMillis();
            for (int i = 0; i < MESSAGE_COUNT; i++) {
                String message = "消息" + i;
                /**
                 * channel.getNextPublishSeqNo() 获取下一个消息的序列号
                 * 将序列号与消息体进行关联
                 * 全部都是未确认的消息体
                 */
                outstandingConfirms.put(channel.getNextPublishSeqNo(), message);
                channel.basicPublish("", queueName, null, message.getBytes());
            }
            // 结束时间
            long end = System.currentTimeMillis();
            System.out.println("发布 " + MESSAGE_COUNT + " 个异步确认消息,耗时 " + (end - begin) + " ms");
        }
    }
}
```

### 如何处理异步未确认消息

　　最好的解决的解决方案就是把未确认的消息放到一个基于内存的能被发布线程访问的队列，比如说用`ConcurrentLinkedQueue`这个队列在`confirm callbacks`与发布线程之间进行消息的传递。

```java
            /**
             * 线程安全有序的一个哈希表，适用于高并发的情况
             * 1. 将序号与消息进行关联
             * 2. 只要给到序列号，可以批量删除条目
             * 3. 支持并发访问
             */
            ConcurrentSkipListMap<Long, String> outstandingConfirms = new ConcurrentSkipListMap<>();
            /**
             * 确认收到消息的一个回调
             * 1. 消息序列号
             * 2. true 可以确认小于等于当前序列号的消息，false 确认当前序列号消息
             */
            ConfirmCallback ackCallback = (sequenceNumber, multiple) -> {
                // 是否批量发布
                if (multiple) {
                    // 批量发布
                    // 返回的是小于等于当前序列号的未确认消息 是一个 map
                    ConcurrentNavigableMap<Long, String> confirmed = outstandingConfirms.headMap(sequenceNumber, true);
                    // 清除该部分未确认消息
                    confirmed.clear();
                } else {
                    // 只清除当前序列号的消息
                    outstandingConfirms.remove(sequenceNumber);
                }
            };
            // 未确认消息的回调函数
            ConfirmCallback nackCallback = (sequenceNumber, multiple) -> {
                String message = outstandingConfirms.get(sequenceNumber);
                System.out.println("发布的消息 " + message + " 未被确认，序列号 " + sequenceNumber);
            };

            /**
             * 添加一个异步确认的监听器
             * 1. 确认收到消息的回调
             * 2. 未收到消息的回调
             */
            channel.addConfirmListener(ackCallback, null);  
```

### 以上 3 种发布确认速度对比

* 单独发布消息  
  同步等待确认，简单，但吞吐量非常有限。
* 批量发布消息  
  批量同步等待确认，简单，合理的吞吐量，一旦出现问题但很难推断出是那条消息出现了问题。
* 异步处理  
  最佳性能和资源使用，在出现错误的情况下可以很好地控制，但是实现起来稍微难些。

# 交换机

　　在上一节中创建了一个工作队列。

　　假设的是工作队列背后，每个任务都恰好交付给一个消费者（工作进程），在这一部分将做一些完全不同的事情：将消息传达给多个消费者。这种模式称为“发布/订阅”。

　　为了说明这种模式，将构建一个简单的日志系统，它由两个程序组成：第一个程序将发出日志消息，第二个程序是消费者。

　　启动两个消费者，其中一个消费者接收到消息后把日志存储在磁盘，另外一个消费者接收到消息后把消息打印在屏幕上，事实上第一个程序发出的日志消息将广播给所有消费者。

## Exchanges

### Exchanges 概念

　　`RabbitMQ`消息传递模型的核心思想是：生产者生产的消息从不会直接发送到队列；实际上，通常生产者甚至都不知道这些消息传递传递到了哪些队列中。

　　相反，生产者只能将消息发送到交换机（`Exchange`），交换机工作的内容非常简单，一方面它接收来自生产者的消息，另一方面将它们推入队列；交换机必须确切知道如何处理收到的消息，是应该把这些消息放到特定队列还是说把他们到许多队列中还是说应该丢弃它们，这就的由交换机的类型来决定。

### Exchanges 的类型

　　总共有以下类型：

* 直接（`direct`）
* 主题（`topic`）
* 标题（`headers`）
* 扇出（`fanout`）

### 无名 Exchange

　　在前面部分对`Exchange`一无所知，但仍然能够将消息发送到队列。之前能实现的原因是因为使用的是默认交换，通过空字符串（`""`）进行标识。

```java
channel.basicPublish("","hello", null, message.getBytes("UTF-8"));
```

　　第一个参数是交换机的名称。空字符串表示默认或无名称交换机：消息能路由发送到队列中其实是由`routingKey(bindingkey)`绑定`key`指定的，如果它存在的话。

## 临时队列

　　之前使用的是具有特定名称的队列（`hello`和`ack_queue`）。队列的名称至关重要——需要指定消费者去消费哪个队列的消息。

　　每当连接到`Rabbit`时，都需要一个全新的空队列，为此可以创建一个具有随机名称的队列，或者能让服务器选择一个随机队列名称那就更好了，其次一旦断开了消费者的连接，队列将被自动删除。

　　创建临时队列的方式如下：

```java
String queueName = channel.queueDeclare().getQueue();
```

　　创建出来之后长成这样：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/temporary-queue.png)

## 绑定（bindings）

　　什么是`bingding`呢，`binding`其实是`exchange`和`queue`之间的桥梁，它告诉我们`exchange`和那个队列进行了绑定关系。比如说下面这张图告诉我们的就是`X`与`Q1`和`Q2`进行了绑定。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/queue-binding-exchange.png)

## Fanout

### Fanout 介绍

　　`Fanout`这种类型非常简单。正如从名称中猜到的那样，它是将接收到的所有消息广播到它知道的所有队列中。

　　系统中默认有些`exchange`类型：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/default-fanout.png)

### Fanout 实战

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/fanout-lloog-binding-example-1.png)

　　`Logs`和临时队列的绑定关系如下图：

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/fanout-lloog-binding-example-2.png)

* `Receive01`将接收到的消息打印在控制台

  ```java
  public class Receive01 {

      private static final String EXCHANGE_NAME = "logs";

      public static void main(String[] argv) throws Exception {

          Channel channel = RabbitMqUtils.getChannel();
          channel.exchangeDeclare(EXCHANGE_NAME, "fanout");

          /**
           * 生成一个临时的队列 队列的名称是随机的
           * 当消费者断开和该队列的连接时 队列自动删除
           */
          String queueName = channel.queueDeclare().getQueue();
          // 把该临时队列绑定 exchange，其中 RoutingKey（也称之为 binding key）为空字符串
          channel.queueBind(queueName, EXCHANGE_NAME, "");

          System.out.println("等待接收消息,把接收到的消息打印在屏幕........... ");

          DeliverCallback deliverCallback = (consumerTag, delivery) -> {
              String message = new String(delivery.getBody(), "UTF-8");
              System.out.println("控制台打印接收到的消息"+message);
          };

          // 接收消息
          channel.basicConsume(queueName, true, deliverCallback, consumerTag -> { });
      }
  }

  ```
* `Receive02`将接收到的消息存储在磁盘

  ```java
  public class Receive02 {

      private static final String EXCHANGE_NAME = "logs";

      public static void main(String[] argv) throws Exception {

          Channel channel = RabbitMqUtils.getChannel();
          channel.exchangeDeclare(EXCHANGE_NAME, "fanout");

          /**
           * 生成一个临时的队列 队列的名称是随机的
           * 当消费者断开和该队列的连接时 队列自动删除
           */
          String queueName = channel.queueDeclare().getQueue();
          // 把该临时队列绑定 exchange，其中 RoutingKey（也称之为 binding key）为空字符串
          channel.queueBind(queueName, EXCHANGE_NAME, "");

          System.out.println("等待接收消息,把接收到的消息写到文件........... ");

          DeliverCallback deliverCallback = (consumerTag, delivery) -> {
              String message = new String(delivery.getBody(), "UTF-8");
              File file = new File("rabbitmq_info.txt");
              FileUtils.writeStringToFile(file,message,"UTF-8");
              System.out.println("数据写入文件成功");
          };

          // 接收消息
          channel.basicConsume(queueName, true, deliverCallback, consumerTag -> { });
      }
  }
  ```
* `EmitLog`发送消息给两个消费者接收

  ```java
  public class Emit {

      private static final String EXCHANGE_NAME = "logs";

      public static void main(String[] argv) throws Exception {
          try (Channel channel = RabbitMqUtils.getChannel()) {

              /**
               * 声明一个 exchange
               * 1. exchange 的名称
               * 2. exchange 的类型
               */
              channel.exchangeDeclare(EXCHANGE_NAME, "fanout");

              Scanner sc = new Scanner(System.in);
              System.out.println("请输入信息");
              while (sc.hasNext()) {
                  String message = sc.nextLine();
                  channel.basicPublish(EXCHANGE_NAME, "", null, message.getBytes("UTF-8"));
                  System.out.println("生产者发出消息：" + message);
              }
          }
      }
  }
  ```

```java
public class Emit {

    private static final String EXCHANGE_NAME = "logs";

    public static void main(String[] argv) throws Exception {
        try (Channel channel = RabbitMqUtils.getChannel()) {

            /**
             * 声明一个 exchange
             * 1. exchange 的名称
             * 2. exchange 的类型
             */
            channel.exchangeDeclare(EXCHANGE_NAME, "fanout");

            Scanner sc = new Scanner(System.in);
            System.out.println("请输入信息");
            while (sc.hasNext()) {
                String message = sc.nextLine();
                channel.basicPublish(EXCHANGE_NAME, "", null, message.getBytes("UTF-8"));
                System.out.println("生产者发出消息：" + message);
            }
        }
    }
}
```

## Direct Exchange

### 回顾

　　在上一节中构建了一个简单的日志记录系统，能够向许多接收者广播日志消息；在本节我们向其中添加一些特别的功能：比方说只让某个消费者订阅发布的部分消息，例如只把严重错误消息定向存储到日志文件（以节省磁盘空间），同时仍然能够在控制台上打印所有日志消息。

　　再次来回顾一下什么是`bindings`，绑定是交换机和队列之间的桥梁关系。也可以这么理解：队列只对它绑定的交换机的消息感兴趣。

　　绑定用参数：`routingKey`来表示，也可称该参数为`binding key`，创建绑定用代码：`channel.queueBind(queueName, EXCHANGE_NAME, "routingKey");`，绑定之后的意义由其交换类型决定。

### Direct Exchange 介绍

　　上一节中的日志系统将所有消息广播给所有消费者，对此想做一些改变，例如希望将日志消息写入磁盘的程序仅接收严重错误（`errros`），而不存储那些警告（`warning`）或信息（`info`）日志消息避免浪费磁盘空间。

　　`Fanout`这种交换类型并不能带来很大的灵活性——它只能进行无意识的广播，在这里将使用`direct`这种类型来进行替换，这种类型的工作方式是，消息只去到它绑定的`routingKey`队列中去。

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/direct-log-binding.png)

　　在上面这张图中，可以看到`X`绑定了两个队列，绑定类型是`direct`。队列`Q1`绑定键为`orange`，队列`Q2`绑定键有两个：一个绑定键为`black`，另一个绑定键为`green`。

　　在这种绑定情况下，生产者发布消息到`exchange`上，绑定键为`orange`的消息会被发布到队列`Q1`。绑定键为`black`和`green`的消息会被发布到队列`Q2`，其他消息类型的消息将被丢弃。

### 多重绑定

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/direct-binding-more.png)

　　当然如果`exchange`的绑定类型是`direct`，但是它绑定的多个队列的`key`如果都相同，在这种情况下虽然绑定类型是`direct`，但是它表现的就和`fanout`有点类似了，就跟广播差不多，如上图所示。

### 实战

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/direct-binding-example-1.png)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/direct-binding-example-2.png)

* 消费者

  ```java
  public class ReceiveDirect01 {

      private static final String EXCHANGE_NAME = "direct_logs";

      public static void main(String[] argv) throws Exception {

          Channel channel = RabbitMqUtils.getChannel();
          channel.exchangeDeclare(EXCHANGE_NAME, BuiltinExchangeType.DIRECT);

          String queueName = "disk";
          channel.queueDeclare(queueName, false, false, false, null);
          channel.queueBind(queueName, EXCHANGE_NAME, "error");

          System.out.println("等待接收消息........... ");

          DeliverCallback deliverCallback = (consumerTag, delivery) -> {
              String message = new String(delivery.getBody(), "UTF-8");
              message="接收绑定键:"+delivery.getEnvelope().getRoutingKey()+",消息:"+message;
              File file = new File("../rabbitmq_info.txt");
              FileUtils.writeStringToFile(file,message,"UTF-8");
              System.out.println("错误日志已经接收");
          };

          channel.basicConsume(queueName, true, deliverCallback, consumerTag -> {});
      }
  }
  ```

  ```java
  public class ReceiveDirect02 {

      private static final String EXCHANGE_NAME = "direct_logs";

      public static void main(String[] argv) throws Exception {

          Channel channel = RabbitMqUtils.getChannel();
          channel.exchangeDeclare(EXCHANGE_NAME, BuiltinExchangeType.DIRECT);

          String queueName = "console";
          channel.queueDeclare(queueName, false, false, false, null);
          channel.queueBind(queueName, EXCHANGE_NAME, "info");
          channel.queueBind(queueName, EXCHANGE_NAME, "warning");

          System.out.println("等待接收消息........... ");

          DeliverCallback deliverCallback = (consumerTag, delivery) -> {
              String message = new String(delivery.getBody(), "UTF-8");
              System.out.println(" 接收绑定键："+delivery.getEnvelope().getRoutingKey()+"，消息："+message);
          };
          channel.basicConsume(queueName, true, deliverCallback, consumerTag -> {});
      }
  }
  ```
* 生产者

  ```java
  public class EmitDirect {

      private static final String EXCHANGE_NAME = "direct_logs";

      public static void main(String[] argv) throws Exception {

          try (Channel channel = RabbitMqUtils.getChannel()) {
              channel.exchangeDeclare(EXCHANGE_NAME, BuiltinExchangeType.DIRECT);
              // 创建多个 bindingKey
              Map<String, String> bindingKeyMap = new HashMap<>();
              bindingKeyMap.put("info", "普通 info 信息");
              bindingKeyMap.put("warning", "警告 warning 信息");
              bindingKeyMap.put("error", "错误 error 信息");
              // debug 没有消费这接收这个消息 所有就丢失了
              bindingKeyMap.put("debug", "调试 debug 信息");
              for (Map.Entry<String, String> bindingKeyEntry : bindingKeyMap.entrySet()) {
                  String bindingKey = bindingKeyEntry.getKey();
                  String message = bindingKeyEntry.getValue();
                  channel.basicPublish(EXCHANGE_NAME, bindingKey, null, message.getBytes("UTF-8"));
                  System.out.println("生产者发出消息：" + message);
              }
          }
      }
  }
  ```

## Topics

### 之前类型的问题

　　在上一个小节中改进了日志记录系统，没有使用只能进行随意广播的`fanout`交换机，而是使用了`direct`交换机，从而有能实现有选择性地接收日志。

　　尽管使用`direct`交换机改进了系统，但是它仍然存在局限性：比方说想接收的日志类型有`info.base`和`info.advantage`，某个队列只想`info.base`的消息，那这个时候`direct`就办不到了。这个时候就只能使用`topic`类型。

### Topic 的要求

　　发送到类型是`topic`，交换机的消息的`routing_key`不能随意写，必须满足一定的要求，它必须是一个单词列表，以点号分隔开，这些单词可以是任意单词，比如说：`stock.usd.nyse`，`nyse.vmw`，`quick.orange.rabbit`这种类型的。当然这个单词列表最多不能超过 255 个字节。

　　在这个规则列表中，其中有两个替换符是需要注意的：

* `*`（星号）可以代替一个单词
* `#`（井号）可以替代零个或多个单词

### Topic 匹配案例

　　下图绑定关系如下：

* `Q1`绑定的是

  * 中间带`orange`带 3 个单词的字符串（`*.orange.*`）
* `Q2`绑定的是

  * 最后一个单词是`rabbit`的 3 个单词（`*.*.rabbit`）
  * 第一个单词是`lazy`的多个单词（`lazy.#`）

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/topic-match.png)

　　上图是一个队列绑定关系图，来看看他们之间数据接收情况是怎么样的：

* `quick.orange.rabbit`被队列`Q1`、`Q2`接收到
* `lazy.orange.elephant`被队列`Q1`、`Q2`接收到
* `quick.orange.fox`被队列`Q1`接收到
* `lazy.brown.fox`被队列`Q2`接收到
* `lazy.pink.rabbit`虽然满足两个绑定但只被队列`Q2`接收一次
* `quick.brown.fox`不匹配任何绑定不会被任何队列接收到会被丢弃
* `quick.orange.male.rabbit`是四个单词不匹配任何绑定会被丢弃
* `lazy.orange.male.rabbit`是四个单词但匹配`Q2`

　　当队列绑定关系是下列这种情况时需要引起注意：

* **当一个队列绑定键是****`#`****，那么这个队列将接收所有数据，就有点像****`fanout`****了**
* **如果队列绑定键当中没有****`#`****和****`*`****出现，那么该队列绑定类型就是****`direct`****了**

　　**如果队列绑定键当中没有****`#`****和****`*`****出现，那么该队列绑定类型就是****`direct`****了**

### 实战

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/topic-match-example.png)

* 消费者

  ```java
  public class ReceiveTopic01 {

      private static final String EXCHANGE_NAME = "topic_logs";

      public static void main(String[] argv) throws Exception {

          Channel channel = RabbitMqUtils.getChannel();
          channel.exchangeDeclare(EXCHANGE_NAME, "topic");

          // 声明 Q1 队列与绑定关系
          String queueName="Q1";
          channel.queueDeclare(queueName, false, false, false, null);
          channel.queueBind(queueName, EXCHANGE_NAME, "*.orange.*");

          System.out.println("等待接收消息........... ");

          DeliverCallback deliverCallback = (consumerTag, delivery) -> { 
              String message = new String(delivery.getBody(), "UTF-8");
              System.out.println("接收队列："+queueName+"绑定键："+delivery.getEnvelope().getRoutingKey()+",消息:"+message);
          };

          channel.basicConsume(queueName, true, deliverCallback, consumerTag -> {});
      }
  }
  ```

  ```java
  public class ReceiveTopic02 {

      private static final String EXCHANGE_NAME = "topic_logs";

      public static void main(String[] argv) throws Exception {

          Channel channel = RabbitMqUtils.getChannel();
          channel.exchangeDeclare(EXCHANGE_NAME, "topic");

          // 声明 Q2 队列与绑定关系
          String queueName="Q2";
          channel.queueDeclare(queueName, false, false, false, null);
          channel.queueBind(queueName, EXCHANGE_NAME, "*.*.rabbit");
          channel.queueBind(queueName, EXCHANGE_NAME, "lazy.#");

          System.out.println("等待接收消息........... ");

          DeliverCallback deliverCallback = (consumerTag, delivery) -> { 
              String message = new String(delivery.getBody(), "UTF-8");
              System.out.println("接收队列："+queueName+"绑定键:"+delivery.getEnvelope().getRoutingKey()+"，消息："+message);
          };
          channel.basicConsume(queueName, true, deliverCallback, consumerTag -> {});
      }
  }
  ```
* 生产者

  ```java
  public class EmitTopic {

      private static final String EXCHANGE_NAME = "topic_logs";

      public static void main(String[] argv) throws Exception {

          try (Channel channel = RabbitMqUtils.getChannel()) {
              channel.exchangeDeclare(EXCHANGE_NAME, "topic");
              /**
               * Q1 绑定的是 中间带 orange 带 3 个单词的字符串（*.orange.*）
               * Q2 绑定的是 最后一个单词是 rabbit 的 3 个单词（*.*.rabbit），第一个单词是 lazy 的多个单词（lazy.#）
               */
              Map<String, String> bindingKeyMap = new HashMap<>();
              bindingKeyMap.put("quick.orange.rabbit","被队列 Q1 Q2 接收到");
              bindingKeyMap.put("lazy.orange.elephant","被队列 Q1 Q2 接收到");
              bindingKeyMap.put("quick.orange.fox","被队列 Q1 接收到");
              bindingKeyMap.put("lazy.brown.fox","被队列 Q2 接收到");
              bindingKeyMap.put("lazy.pink.rabbit","虽然满足两个绑定但只被队列 Q2 接收一次");
              bindingKeyMap.put("quick.brown.fox","不匹配任何绑定不会被任何队列接收到会被丢弃");
              bindingKeyMap.put("quick.orange.male.rabbit","是四个单词不匹配任何绑定会被丢弃");
              bindingKeyMap.put("lazy.orange.male.rabbit","是四个单词但匹配 Q2");
              for (Map.Entry<String, String> bindingKeyEntry : bindingKeyMap.entrySet()) {
                  String bindingKey = bindingKeyEntry.getKey();
                  String message = bindingKeyEntry.getValue();
                  channel.basicPublish(EXCHANGE_NAME,bindingKey, null, message.getBytes("UTF-8"));
                  System.out.println("生产者发出消息：" + message);
              }
          }
      }
  }
  ```

# 发布确认高级

　　在生产环境中由于一些不明原因，会导致`RabbitMQ`重启，在`RabbitMQ`重启期间生产者消息投递失败，导致消息丢失，需要手动处理和恢复。

　　那么，如何才能进行`RabbitMQ`的消息可靠投递呢？特别是在这样比较极端的情况，`RabbitMQ`集群不可用的时候，无法投递的消息该如何处理呢？

```bash
应 用 [xxx] 在 [08-1516:36:04] 发 生 [ 错 误 日 志 异 常 ] ， alertId=[xxx] 。 由
[org.springframework.amqp.rabbit.listener.BlockingQueueConsumer:start:620] 触 发 。
应用 xxx 可能原因如下
服 务 名 为 ：
异 常 为 ： org.springframework.amqp.rabbit.listener.BlockingQueueConsumer:start:620,
产 生 原 因 如 下 :1.org.springframework.amqp.rabbit.listener.QueuesNotAvailableException:
Cannot prepare queue for listener. Either the queue doesn't exist or the broker will not
allow us to use it.||Consumer received fatal=false exception on startup:
```

## 发布确认 SpringBoot 版本

### 确认机制方案

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/release-coonfirme-scheme.png)

### 代码架构图

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/release-coonfirme-code-framework.png)

### 配置

* 配置文件  
  在配置文件当中需要添加：

  ```properties
  spring.rabbitmq.publisher-confirm-type=correlated
  ```

  * `NONE`：禁用发布确认模式，是默认值
  * `CORRELATED`：发布消息成功到交换器后会触发回调方法
  * `SIMPLE`：经测试有两种效果

    * 效果和`CORRELATED`值一样会触发回调方法
    * 在发布消息成功后使用`rabbitTemplate`调用`waitForConfirms`或`waitForConfirmsOrDie`方法等待`broker`节点返回发送结果，根据返回结果来判定下一步的逻辑，要注意的点是`waitForConfirmsOrDie`方法如果返回`false`则会关闭`channel`，则接下来无法发送消息到`broker`

  ```properties
  spring.rabbitmq.host=192.168.30.129
  spring.rabbitmq.port=5672
  spring.rabbitmq.username=admin
  spring.rabbitmq.password=admin
  spring.rabbitmq.publisher-confirm-type=correlated
  ```
* 配置类

  ```java
  @Configuration
  public class ConfirmConfig {

      public static final String CONFIRM_EXCHANGE_NAME = "confirm.exchange";
      public static final String CONFIRM_QUEUE_NAME = "confirm.queue";

      /**
       * 声明业务 Exchange
       * 确认交换机
       * @return
       */
      @Bean("confirmExchange")
      public DirectExchange confirmExchange(){
          return new DirectExchange(CONFIRM_EXCHANGE_NAME);
      }

      /**
       * 声明确认队列
       * @return
       */
      @Bean("confirmQueue")
      public Queue confirmQueue(){
          return QueueBuilder.durable(CONFIRM_QUEUE_NAME).build();
      }

      /**
       * 声明确认队列绑定关系
       * @param queue
       * @param exchange
       * @return
       */
      @Bean
      public Binding queueBinding(@Qualifier("confirmQueue") Queue queue,
                                  @Qualifier("confirmExchange") DirectExchange exchange){
          return BindingBuilder.bind(queue).to(exchange).with("key1");
      }
  }
  ```
* 消息生产者

  ```java
  @Slf4j
  @RestController
  @RequestMapping("/confirm")
  public class Producer {

      public static final String CONFIRM_EXCHANGE_NAME = "confirm.exchange";

      @Autowired
      private RabbitTemplate rabbitTemplate;
      @Autowired
      private MyCallBack myCallBack;

      /**
       * 先依赖注入 rabbitTemplate，之后再设置它的回调对象
       * 在初始化是设置回调对象，这样当消息发送到交换机时才能触发发布确认
       */
      @PostConstruct
      public void init(){
          rabbitTemplate.setConfirmCallback(myCallBack);
      }

      @GetMapping("sendMessage/{message}")
      public void sendMessage(@PathVariable String message){
          // 指定消息 id 为 1
          CorrelationData correlationData1=new CorrelationData("1");
          String routingKey="key1";
          rabbitTemplate.convertAndSend(CONFIRM_EXCHANGE_NAME,routingKey,message+routingKey,correlationData1);

          CorrelationData correlationData2=new CorrelationData("2");
          routingKey="key2";
          rabbitTemplate.convertAndSend(CONFIRM_EXCHANGE_NAME,routingKey,message+routingKey,correlationData2);

          log.info("发送消息内容:{}",message);
      }
  }
  ```
* 回调接口

  ```java
  /**
   * 回调接口实现类
   * 发布确认回调：当发布消息成功到交换器后会触发回调方法，给生产者发确认信息
   */
  @Slf4j
  @Component
  public class MyCallBack implements RabbitTemplate.ConfirmCallback{

      /**
       * 交换机不管是否收到消息的一个回调方法
       * CorrelationData
       * 消息相关数据
       * ack
       * 交换机是否收到消息
       */
      @Override
      public void confirm(CorrelationData correlationData, boolean ack, String cause) {

          String id=correlationData!=null?correlationData.getId():"";
          if(ack){
              log.info("交换机已经收到 id 为:{}的消息",id);
          }else{
              log.info("交换机还未收到 id 为:{}消息,由于原因:{}",id,cause);
          }
      }
  }
  ```
* 消息消费者

  ```java
  @Slf4j
  @Component
  public class ConfirmConsumer {

      public static final String CONFIRM_QUEUE_NAME = "confirm.queue";

      @RabbitListener(queues =CONFIRM_QUEUE_NAME)
      public void receiveMsg(Message message) { 
          String msg=new String(message.getBody());
          log.info("接受到队列 confirm.queue 消息:{}",msg);
      }
  }
  ```

### 结果分析

　　访问：[127.0.0.1:8080/confirm/sendMessage/111](http://127.0.0.1:8080/confirm/sendMessage/111)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/release-coonfirme-result.png)

　　可以看到，发送了两条消息，第一条消息的`RoutingKey`为`key1`，第二条消息的`RoutingKey`为`key2`，两条消息都成功被交换机接收，也收到了交换机的确认回调，但消费者只收到了一条消息，第二条消息因为交换机没有和队列绑定，也没有其它队列能接收这个消息，所以第二条消息被直接丢弃了。

## 回退消息

### Mandatory 参数

　　**在仅开启了生产者确认机制的情况下，交换机接收到消息后，会直接给消息生产者发送确认消息，如果发现该消息不可路由，那么消息会被直接丢弃，此时生产者是不知道消息被丢弃这个事件的。**

　　那么如何处理无法被路由的消息？最起码通知生产者一声，让它自己处理，通过设置`mandatory`参数可以在当消息传递过程中不可达目的地时将消息返回给生产者。

* 消息生产者

  ```java
  @Slf4j
  @RestController
  @RequestMapping("/confirm")
  public class MessageProducer {

      @Autowired
      private RabbitTemplate rabbitTemplate;
      @Autowired
      private MyCallBack myCallBack;

      /**
       * 先将 rabbitTemplate 注入，之后就设置回调函数等
       */
      @PostConstruct
      private void init() {

          rabbitTemplate.setConfirmCallback(myCallBack);
          /**
           * 设置 Mandatory 参数
           * true：
           * 交换机无法将消息进行路由时，会将该消息返回给生产者
           * false：
           * 如果发现消息无法进行路由，则直接丢弃
           */
          rabbitTemplate.setMandatory(true);
          // 设置回退消息交给谁处理
          rabbitTemplate.setReturnCallback(myCallBack);
      }

      @GetMapping("sendMessage")
      public void sendMessage(String message){
          // 让消息绑定一个 id 值
          CorrelationData correlationData1 = new CorrelationData(UUID.randomUUID().toString());
          rabbitTemplate.convertAndSend("confirm.exchange","key1",message+"key1",correlationData1);
          log.info("发送消息 id 为:{}内容为{}",correlationData1.getId(),message+"key1");

          CorrelationData correlationData2 = new CorrelationData(UUID.randomUUID().toString());
          rabbitTemplate.convertAndSend("confirm.exchange","key2",message+"key2",correlationData2);
          log.info("发送消息 id 为:{}内容为{}",correlationData2.getId(),message+"key2");
      }
  }
  ```
* 回调接口

  ```java
  /**
   * 回调接口实现类
   * 发布确认回调：当发布消息成功到交换器后会触发回调方法，给生产者发确认信息
   */
  @Slf4j
  @Component
  public class MyCallBack implements RabbitTemplate.ConfirmCallback, RabbitTemplate.ReturnCallback{

      /**
       * 交换机不管是否收到消息的一个回调方法
       * CorrelationData
       * 消息相关数据
       * ack
       * 交换机是否收到消息
       */
      @Override
      public void confirm(CorrelationData correlationData, boolean ack, String cause) {

          String id=correlationData!=null?correlationData.getId():"";
          if(ack){
              log.info("交换机已经收到 id 为:{}的消息",id);
          }else{
              log.info("交换机还未收到 id 为:{}消息,由于原因:{}",id,cause);
          }
      }

      /**
       * 当消息无法路由的时候的回调方法
       * @param message
       * @param replyCode
       * @param replyText
       * @param exchange
       * @param routingKey
       */
      @Override
      public void returnedMessage(Message message, int replyCode,
                                  String replyText, String exchange, String routingKey) {
          log.error("消息 {}, 被交换机 {} 退回，退回原因：{}, 路由 key：{}",
                  new String(message.getBody()),exchange,replyText,routingKey);
      }
  }
  ```

### 结果分析

　　访问：[127.0.0.1:8080/confirm/sendMessage](http://127.0.0.1:8080/confirm/sendMessage)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/returned-message-result.png)

## 备份交换机

　　有了`mandatory`参数和回退消息，获得了对无法投递消息的感知能力，有机会在生产者的消息无法被投递时发现并处理；但有时候并不知道该如何处理这些无法路由的消息，最多打个日志，然后触发报警，再来手动处理。

　　而通过日志来处理这些无法路由的消息是很不优雅的做法，特别是当生产者所在的服务有多台机器的时候，手动复制日志会更加麻烦而且容易出错；而且设置`mandatory`参数会增加生产者的复杂性，需要添加处理这些被退回的消息的逻辑。如果既不想丢失消息，又不想增加生产者的复杂性，该怎么做呢？

　　前面在设置死信队列的文章中，提到过可以为队列设置死信交换机来存储那些处理失败的消息，可是这些不可路由消息根本没有机会进入到队列，因此无法使用死信队列来保存消息。

　　在`RabbitMQ`中，有一种备份交换机的机制存在，可以很好的应对这个问题。

　　什么是备份交换机呢？

　　备份交换机可以理解为`RabbitMQ`中交换机的“备胎”，当为某一个交换机声明一个对应的备份交换机时，就是为它创建一个备胎，当交换机接收到一条不可路由消息时，将会把这条消息转发到备份交换机中，由备份交换机来进行转发和处理。

　　通常备份交换机的类型为`Fanout`，这样就能把所有消息都投递到与其绑定的队列中，然后在备份交换机下绑定一个队列，这样所有那些原交换机无法被路由的消息，就会都进入这个队列了。

　　当然，还可以建立一个报警队列，用独立的消费者来进行监测和报警。

### 代码架构图

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/backup-exchange-code-framework.png)

### 配置

* 配置类

  ```java
  @Configuration
  public class ConfirmConfig {

      public static final String CONFIRM_EXCHANGE_NAME = "confirm.exchange";
      public static final String CONFIRM_QUEUE_NAME = "confirm.queue";
      public static final String BACKUP_EXCHANGE_NAME = "backup.exchange";
      public static final String BACKUP_QUEUE_NAME = "backup.queue";
      public static final String WARNING_QUEUE_NAME = "warning.queue";

      /**
       * 声明确认队列
       * @return
       */
      @Bean("confirmQueue")
      public Queue confirmQueue(){
          return QueueBuilder.durable(CONFIRM_QUEUE_NAME).build();
      }

      /**
       * 声明确认队列绑定关系
       * @param queue
       * @param exchange
       * @return
       */
      @Bean
      public Binding queueBinding(@Qualifier("confirmQueue") Queue queue,
                                  @Qualifier("confirmExchange") DirectExchange exchange){
          return BindingBuilder.bind(queue).to(exchange).with("key1");
      }

      /**
       * 声明备份 Exchange
       * @return
       */
      @Bean("backupExchange")
      public FanoutExchange backupExchange(){
          return new FanoutExchange(BACKUP_EXCHANGE_NAME);
      }

      /**
       * 声明确认 Exchange 交换机的备份交换机
       * @return
       */
      @Bean("confirmExchange")
      public DirectExchange confirmExchange() {
          ExchangeBuilder exchangeBuilder = ExchangeBuilder
                  .directExchange(CONFIRM_EXCHANGE_NAME)
                  .durable(true)
                  // 设置该交换机的备份交换机
                  .withArgument("alternate-exchange", BACKUP_EXCHANGE_NAME);

          return (DirectExchange)exchangeBuilder.build();
      }

      /**
       * 声明警告队列
       * @return
       */
      @Bean("warningQueue")
      public Queue warningQueue(){
          return QueueBuilder.durable(WARNING_QUEUE_NAME).build();
      }

      /**
       * 声明报警队列绑定关系
       * @param queue
       * @param backupExchange
       * @return
       */
      @Bean
      public Binding warningBinding(@Qualifier("warningQueue") Queue queue,
                                    @Qualifier("backupExchange") FanoutExchange
                                            backupExchange){
          return BindingBuilder.bind(queue).to(backupExchange);
      }

      /**
       * 声明备份队列
       * @return
       */
      @Bean("backQueue")
      public Queue backQueue(){
          return QueueBuilder.durable(BACKUP_QUEUE_NAME).build();
      }

      /**
       * 声明备份队列绑定关系
       * @param queue
       * @param backupExchange
       * @return
       */
      @Bean
      public Binding backupBinding(@Qualifier("backQueue") Queue queue,
                                   @Qualifier("backupExchange") FanoutExchange backupExchange){
          return BindingBuilder.bind(queue).to(backupExchange);
      }
  }
  ```
* 报警消费者

  ```java
  @Slf4j
  @Component
  public class WarningConsumer {

      public static final String WARNING_QUEUE_NAME = "warning.queue";

      @RabbitListener(queues = WARNING_QUEUE_NAME)
      public void receiveWarningMsg(Message message) {

          String msg = new String(message.getBody());
          log.error("报警发现不可路由消息：{}", msg);
      }
  }
  ```

### 测试注意事项

　　重新启动项目的时候需要把原来的`confirm.exchange`删除，因为修改了其绑定属性，不然报以下错：

```bash
inequivalent arg 'alternate-exchange' for exchange 'confirm.exchange' in vhost '/': received the value 'backup.exchange' of type 'longstr' but current is none, class-id=40, method-id=10)
```

### 结果分析

　　访问：[127.0.0.1:8080/confirm/sendMessage/111](http://127.0.0.1:8080/confirm/sendMessage/111)

　　![](https://cdn.jsdelivr.net/gh/1coins/assets/rabbitmq-release-confirme-and-switch/backup-exchange-result.png)

　　`mandatory`参数与备份交换机可以一起使用的时候，如果两者同时开启，消息究竟何去何从？谁优先级高，经过上面结果显示答案是备份交换机优先级高。

　　‍
