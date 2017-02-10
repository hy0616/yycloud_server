
**参考视频教程:**

[Redis的常用命令及高级应用](http://bbs.lampbrother.net/read-htm-tid-132445.html)

[Redis的高级应用之事务处理、持久化操作、pub_sub、虚拟内存](http://www.56.com/u45/v_MTIwOTY1OTc4.html)


### 基本操作


> select num       -> num 为 0-15

> move mykey num   -> 将 key 移动到 num 数据库

> dbsize               数据库key的数量

> info                 服务器信息

> config get xxx       相关参数的信息

> flushdb              删除当前数据库中的所有key

> flashall             删除所有数据库的所有键值

> 查询:  keys my* 

> exists mykey  -> 0/1

> del mykey 

> expire mykey time    -> time(sec)
> ttl mykey            -> 查询剩余时间,过期返回 -1
> persist mykey        -> 取消过期时间，mykey 依然存在

> rename mykey mykey2  -> 重命名key 相当于move



### 进阶操作


##### `安全性`

> 设置密码：                     在 /usr/local/etc/redis.conf 里加入 requirepass xxx-xxxx

> 启动server的时候指定配置文件： redis-server /usr/local/etc/redis.conf 

> 登陆授权:                      redis-cli -a  xxx-xxxx

> 或者输入密码，进入cli:         auth xxx-xxxx 


##### `主从复制`

> 配置slave服务器,在配置文件中加入:   

> slaveof 192.168.x.x 6379  # 指定 master 的 ip 和端口

> masterauth xxx-xxxx       # 指定主机密码

> 如果是同一台机器需要改 slave.conf 的默认监听端口6379

> master 和 slave 可以在 info 命令中查看


##### `事务处理`

> multi 进入事务上下文 此时所输入的命令被 QUEUED 输入 exec 批量执行

> discard 清空当前事务队列并退出事务上下文，即事务回滚

> 事务中的某一个命令执行错误整个事务不会回滚 -- `缺陷`


##### `持久化机制`

> snapshotting(快照,默认): 

> aof


##### `发布与订阅`

> SUBSCRIBE tv1 tv2  # 订阅

> PUBLISH tv1 xym    # 发布






