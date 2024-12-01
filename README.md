# 源码云功能

[<img height="20" src="https://gitee.com/favicon.ico" alt="Gitee"></img>](https://gitee.com/slightning/Kitten-Cloud-Function) [![Gitee Downloads (all assets, latest release)](https://img.shields.io/github/downloads/S-LIGHTNING/Kitten-Cloud-Function/latest/total)](https://gitee.com/slightning/Kitten-Cloud-Function/releases/latest) [![Gitee Downloads (all assets, latest release)](https://img.shields.io/github/downloads-pre/S-LIGHTNING/Kitten-Cloud-Function/latest/total)](https://gitee.com/slightning/Kitten-Cloud-Function/releases) [![Gitee License](https://img.shields.io/github/license/S-LIGHTNING/Kitten-Cloud-Function)](https://gitee.com/slightning/Kitten-Cloud-Function/blob/main/LICENSE)

[<img height="20" src="https://github.com/favicon.ico" alt="GitHub"></img>](https://github.com/S-LIGHTNING/Kitten-Cloud-Function) [![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/S-LIGHTNING/Kitten-Cloud-Function/latest/total)](https://github.com/S-LIGHTNING/Kitten-Cloud-Function/releases/latest) [![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads-pre/S-LIGHTNING/Kitten-Cloud-Function/latest/total)](https://github.com/S-LIGHTNING/Kitten-Cloud-Function/releases) [![GitHub License](https://img.shields.io/github/license/S-LIGHTNING/Kitten-Cloud-Function)](https://github.com/S-LIGHTNING/Kitten-Cloud-Function/blob/main/LICENSE)

## 一、介绍

### 1.简介

源码云功能是针对编程猫源码云功能（云变量、云列表等）的客户端工具，提供了 CoCo 控件、窜改猴库、（开发中）窜改猴用户脚本这三种使用方式。

### 2.主要功能

- 获取、修改作品云变量；
- 获取在线人数；
- 获取当前登录的用户信息；
- 获取、修改作品云列表。

### 3.其他

- 该工具的默认配置尽可能地与源码编辑器保持一致。

## 二、快速开始

[CoCo 控件版](#coco-控件版)
[窜改猴库版](#窜改猴库版)
[窜改猴用户脚本版（开发中）](#窜改猴用户脚本版)

### CoCo 控件版

#### 1.下载并导入到 CoCo

请到 [release](https://gitee.com/slightning/Kitten-Cloud-Function/releases/latest) 页面下载最新版本的 CoCo 控件。

#### 2.检测用户登陆状态

使用`用户已登录`积木检测用户是否已登录。

#### 3.连接到云

在进行除获取当前登录的用户信息之外的任何操作都需要在连接到云后进行。

使用`连接 到 (0)`积木进行连接，其中`(0)`填写要连接的作品的 ID。

注意：
- 连接后进行依赖于连接的操作时，会自动等待连接完成。
- 连接云时需要处在未连接状态，如果存在连接，上一个连接会自动断开。

#### 4.查看和修改云数据

该操作与源码编辑器的操作类似，在此不再赘述。

### 窜改猴库版

#### 1.安装 Tampermonkey

点击 [这里](https://www.tampermonkey.net/) 下载安装 Tampermonkey 浏览器插件。

#### 2.添加依赖库

在你的脚本元属性加入：<span style="word-wrap: break-word;">`// @require https://update.greasyfork.org/scripts/502406/1420791/编程猫源码云功能.js`</span>。

#### 3.检测用户登陆状态

可以通过尝试获取用户信息来检测用户是否已登录。

```JavaScript
try {
    await coco.user.info.id
    console.log("用户已登录")
} catch(error) {
    console.log("用户未登录")
}
```

#### 4.创建连接

```JavaScript
let connection = new KittenCloudFunction(114514)
```

#### 5.查看和修改云数据

##### ①获取云数据实例

```JavaScript
let connection = new KittenCloudFunction(114514)

// 快速获取云数据实例，不推荐使用
let data = await connection.get("云数据")

// 按照类型获取云数据实例
let privateVariable = await connection.privateVariable.get("私有云变量")
let publicVariable = await connection.publicVariable.get("公有云变量")
let list = await connection.list.get("云列表")
```

##### ②查看和修改云变量

```JavaScript
let connection = new KittenCloudFunction(114514)
let variable = await connection.publicVariable.get("云变量")

// 读取云变量的值
console.log(variable.get())

// 修改云变量的值
variable.set("好耶")
```

##### ③查看私有云变量排行榜

```JavaScript
let connection = new KittenCloudFunction(114514)
let privateVariable = await connection.privateVariable.get("私有云变量")

// 获取私有云变量排行榜逆序排列的前 31 名用户
let rankList = await privateVariable.getRankingList(31, -1)
for (const item of rankList) {
    console.log(item.value, await item.user.info.nickname)
}
```
##### ④查看和修改云列表

```JavaScript
let connection = new KittenCloudFunction(114514)
let list = await connection.list.get("云列表")

// 获取云列表第 1 项，列表索引从 0 开始
console.log(list.get(1))

// 修改云列表第 1 项
list.replace(1, "好耶")

// 添加云列表第 10 项
list.add(10, "好耶")

// 删除云列表第 1 项
list.remove(1)
```

更多云列表操作请参考[源码云功能 API 文档](https://s-lightning.github.io/Kitten-Cloud-Function/classes/module_cloud_data_kitten_cloud_list.KittenCloudList.html)。

#### 6.更多功能

请参考[源码云功能 API 文档](https://s-lightning.github.io/Kitten-Cloud-Function/hierarchy.html)。

### 窜改猴用户脚本版

正在开发中……

## 三、功能配置

### 1.自动重连

当连接异常断开时，如果允许，会在等待指定时间后自动重连。

### 2.本地预更新

在没有开启本地预更新时，每次在本地执行数据更新操作时，都会等到该操作同步到云端并收到来自服务器的反馈后再更新本地的数据，这与普通的变量在修改后立即更新其值并不相同。

如：

```JavaScript
let connection = new KittenCloudFunction(114514)

// 假设该变量初始值为 0
let variable = await connection.publicVariable.get("云变量")

// 此处应输出 0
console.log(variable.get())

// 修改变量的值，要等到该操作同步到云端并收到来自服务器的反馈后才能生效
variable.set(666)

// 此处仍然输出 0，因为对该变量的修改操作还没有同步到云端
console.log(variable.get())
```

开启本地预更新后，本地执行数据更新操作时，会假定该操作同步到云端之前没有其它用户对该数据进行操作，并基于此提前更新本地的数据，如果假定不成立，则会修正本地数据。具体而言，本地执行数据更新操作时，会立即更新本地的数据，如果在当前操作被同步到云端之前收到了来自服务器的反馈的其它更新数据，则会撤销本地对数据的更改，并执行来自云端的更改，最后再执行本地对数据的更改。

### 3.更多功能配置

请参考[源码云功能 API 文档](https://s-lightning.github.io/Kitten-Cloud-Function/classes/module_kitten_cloud_function_config_layer.KittenCloudFunctionConfigLayer.html)。
