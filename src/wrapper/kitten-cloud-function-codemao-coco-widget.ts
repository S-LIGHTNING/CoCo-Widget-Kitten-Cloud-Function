import { KittenCloudFunction } from "../kitten-cloud-function"
import { CodemaoWork } from "../codemao/work/codemao-work"
import { None } from "../utils/other"
import { KittenCloudVariable, KittenCloudVariableChangeMessageObject, KittenCloudVariableValue } from "../module/cloud-data/kitten-cloud-variable"
import { KittenCloudData } from "../module/cloud-data/kitten-cloud-data"
import { CodemaoUser } from "../codemao/user/codemao-user"
import { KittenCloudPrivateVariable, KittenCloudPrivateVariableRankingListItemObject } from "../module/cloud-data/kitten-cloud-private-variable"
import { KittenCloudList, KittenCloudListAddMessageObject, KittenCloudListEmptyMessageObject, KittenCloudListItemValue, KittenCloudListPopMessageObject, KittenCloudListPushMessageObject, KittenCloudListRemoveMessageObject, KittenCloudListReplaceLastMessageObject, KittenCloudListReplaceMessageObject, KittenCloudListUnshiftMessageObject } from "../module/cloud-data/kitten-cloud-list"
import { KittenCloudPublicVariable } from "../module/cloud-data/kitten-cloud-public-variable"
import { KittenCloudOnlineUserNumber, KittenCloudOnlineUserNumberChangObject } from "../module/kitten-cloud-online-user-number"
import { KittenCloudPrivateVariableGroup } from "../module/cloud-data/group/kitten-cloud-private-variable-group"
import { KittenCloudPublicVariableGroup } from "../module/cloud-data/group/kitten-cloud-public-variable-group"
import { KittenCloudListGroup } from "../module/cloud-data/group/kitten-cloud-list-group"
import { Color, InvisibleWidget, SLIGHTNINGExport, SLIGHTNINGTypesObject, SLIGHTNINGWidgetSuper, ValueType } from "slightning-coco-widget"
const { project } = require("../../project")

const VariableValueType: ValueType[] = [ ValueType.NUMBER, ValueType.STRING ]
const ListItemValueType: ValueType[] = [ ValueType.NUMBER, ValueType.STRING ]

const types: SLIGHTNINGTypesObject = {
    type: "SLIGHTNING_KITTEN_CLOUD_FUNCTION_WIDGET",
    title: project.name,
    author: project.author,
    icon: "icon-widget-cloud-room",
	version: project.version,
    license: project.license,
    docs: project.docs,
    isInvisibleWidget: true,
    isGlobalWidget: true,
    properties: [],
    methods: [
        {
            line: "global",
            callMethodLabel: false
        }, {
            line:  "连接",
            color: Color.PURPLE
        }, {
            key: "connect",
            label: "连接到",
            params: [
                {
                    key: "workID",
                    valueType: ValueType.NUMBER,
                    defaultValue: 0
                }
            ]
        }, {
            key: "close",
            label: "关闭连接",
            params: []
        }, {
            key: "isConnected",
            label: "已连接",
            params: [],
            valueType: ValueType.BOOLEAN
        }, {
            key: "connectedWorkID",
            label: "已连接作品编号",
            params: [],
            valueType: ValueType.NUMBER,
            blockOptions: {
                space: 40
            }
        }, {
            key: "getConnectionConfigValue",
            label: "获取连接",
            params: [
                {
                    key: "type",
                    dropdown: [
                        { label: "自动重连间隔时间", value: "autoReconnectIntervalTime" },
                        { label: "本地预更新", value: "localPreupdate" },
                        { label: "缓存时间", value: "cacheTime" },
                        { label: "上传间隔时间", value: "uploadIntervalTime" },
                        { label: "字符串长度限制", value: "stringLengthLimit" },
                        { label: "列表长度限制", value: "listLengthLimit" }
                    ]
                }
            ],
            valueType: [ValueType.NUMBER, ValueType.BOOLEAN]
        }, {
            key: "setConnectionConfig",
            label: "设置连接",
            params: [
                {
                    key: "type",
                    dropdown: [
                        { label: "自动重连间隔时间", value: "autoReconnectIntervalTime" },
                        { label: "本地预更新", value: "localPreupdate" },
                        { label: "缓存时间", value: "cacheTime" },
                        { label: "上传间隔时间", value: "uploadIntervalTime" },
                        { label: "字符串长度限制", value: "stringLengthLimit" },
                        { label: "列表长度限制", value: "listLengthLimit" }
                    ]
                }, {
                    key: "value",
                    label: "为",
                    valueType: [ValueType.NUMBER, ValueType.BOOLEAN],
                    defaultValue: 0
                }
            ]
        }, {
            line:  "云变量",
            color: Color.BROWN
        }, {
            key: "getPrivateVariableList",
            label: "私有云变量列表",
            params: [],
            valueType: ValueType.ARRAY
        }, {
            key: "getPrivateVariableConfigValue",
            label: "获取私有云变量",
            params: [
                {
                    key: "type",
                    dropdown: [
                        { label: "本地预更新", value: "localPreupdate" },
                        { label: "缓存时间", value: "cacheTime" },
                        { label: "上传间隔时间", value: "uploadIntervalTime" },
                        { label: "字符串长度限制", value: "stringLengthLimit" }
                    ]
                }
            ],
            valueType: [ValueType.NUMBER, ValueType.STRING]
        }, {
            key: "setPrivateVariableConfig",
            label: "设置私有云变量",
            params: [
                {
                    key: "type",
                    dropdown: [
                        { label: "本地预更新", value: "localPreupdate" },
                        { label: "缓存时间", value: "cacheTime" },
                        { label: "上传间隔时间", value: "uploadIntervalTime" },
                        { label: "字符串长度限制", value: "stringLengthLimit" }
                    ]
                }, {
                    key: "value",
                    label: "为",
                    valueType: [ValueType.NUMBER, ValueType.STRING],
                    defaultValue: 0
                }
            ],
            blockOptions: {
                space: 40
            }
        }, {
            key: "getPublicVariableList",
            label: "公有云变量列表",
            params: [],
            valueType: ValueType.ARRAY
        }, {
            key: "getPublicVariableConfigValue",
            label: "获取公有云变量",
            params: [
                {
                    key: "type",
                    dropdown: [
                        { label: "本地预更新", value: "localPreupdate" },
                        { label: "缓存时间", value: "cacheTime" },
                        { label: "上传间隔时间", value: "uploadIntervalTime" },
                        { label: "字符串长度限制", value: "stringLengthLimit" }
                    ]
                }
            ],
            valueType: [ValueType.NUMBER, ValueType.STRING]
        }, {
            key: "setPublicVariableConfig",
            label: "设置公有云变量",
            params: [
                {
                    key: "type",
                    dropdown: [
                        { label: "本地预更新", value: "localPreupdate" },
                        { label: "缓存时间", value: "cacheTime" },
                        { label: "上传间隔时间", value: "uploadIntervalTime" },
                        { label: "字符串长度限制", value: "stringLengthLimit" }
                    ]
                }, {
                    key: "value",
                    label: "为",
                    valueType: [ValueType.NUMBER, ValueType.STRING],
                    defaultValue: 0
                }
            ],
            blockOptions: {
                space: 40
            }
        } , {
            key: "variableGet",
            params: [
                {
                    key: "name",
                    valueType: ValueType.STRING,
                    defaultValue: "云变量"
                }
            ],
            valueType: VariableValueType
        }, {
            key: "variableSet",
            label: "设置",
            params: [
                {
                    key: "name",
                    labelAfter: "的值",
                    valueType: ValueType.STRING,
                    defaultValue: "云变量"
                }, {
                    key: "value",
                    label: "为",
                    valueType: VariableValueType,
                    defaultValue: "新的值"
                }
            ],
            blockOptions: {
                space: 40
            }
        }, {
            key: "getRankingList",
            params: [
                {
                    key: "name",
                    valueType: ValueType.STRING,
                    defaultValue: "私有云变量"
                }, {
                    key: "limit",
                    label: "前",
                    labelAfter: "名",
                    valueType: ValueType.NUMBER,
                    defaultValue: 31
                }, {
                    key: "order",
                    labelAfter: "排行榜",
                    dropdown: [
                        { label: "逆序", value: "-1" },
                        { label: "正序", value: "1" }
                    ]
                }
            ],
            valueType: ValueType.ARRAY
        }, {
            line: "用户信息",
            color: Color.RED
        }, {
            key: "isUserLogged",
            label: "用户已登录",
            params: [],
            valueType: ValueType.BOOLEAN
        }, {
            key: "getUserInfo",
            params: [
                {
                    key: "userID",
                    label: "ID 为",
                    labelAfter: "的用户",
                    valueType: ValueType.NUMBER,
                    defaultValue: 0
                }, {
                    key: "type",
                    label: "的",
                    dropdown: [
                        { label: "ID", value: "id" },
                        { label: "用户名", value: "username" },
                        { label: "昵称", value: "nickname" },
                        { label: "真实姓名", value: "realname" },
                        { label: "头像地址", value: "avatarURL" },
                        { label: "背景图片地址", value: "coverURL" },
                        { label: "描述", value: "description" },
                        { label: "正在做", value: "doing" },
                        { label: "邮箱", value: "email" },
                        { label: "级别", value: "level" },
                        { label: "等级", value: "grade" },
                        { label: "生日", value: "birthday" },
                        { label: "性别", value: "sex" },
                        { label: "总被浏览次数", value: "viewTimes" },
                        { label: "总被点赞次数", value: "praiseTimes" },
                        { label: "总被收藏次数", value: "collectTimes" },
                        { label: "总被再创作次数", value: "forkTimes" }
                    ]
                }
            ],
            valueType: [ ValueType.STRING, ValueType.NUMBER ]
        }, {
            key: "getOnlineUsersNumber",
            label: "在线用户数",
            params: [],
            valueType: ValueType.NUMBER
        }, {
            line: "云列表",
            color: Color.YELLOW
        }, {
            key: "getListList",
            label: "云列表列表",
            params: [],
            valueType: ValueType.ARRAY
        }, {
            key: "getListConfigValue",
            label: "获取云列表",
            params: [
                {
                    key: "type",
                    dropdown: [
                        { label: "本地预更新", value: "localPreupdate" },
                        { label: "缓存时间", value: "cacheTime" },
                        { label: "上传间隔时间", value: "uploadIntervalTime" },
                        { label: "字符串长度限制", value: "stringLengthLimit" },
                        { label: "列表长度限制", value: "listLengthLimit" }
                    ]
                }
            ],
            valueType: [ValueType.NUMBER, ValueType.STRING]
        }, {
            key: "setListConfig",
            label: "设置云列表",
            params: [
                {
                    key: "type",
                    dropdown: [
                        { label: "本地预更新", value: "localPreupdate" },
                        { label: "缓存时间", value: "cacheTime" },
                        { label: "上传间隔时间", value: "uploadIntervalTime" },
                        { label: "字符串长度限制", value: "stringLengthLimit" },
                        { label: "列表长度限制", value: "listLengthLimit" }
                    ]
                }, {
                    key: "value",
                    label: "为",
                    valueType: [ValueType.NUMBER, ValueType.STRING],
                    defaultValue: 0
                }
            ],
            blockOptions: {
                space: 40
            }
        }, {
            key: "getListCopy",
            params: [
                {
                    key: "name",
                    labelAfter: "副本",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }
            ],
            valueType: ValueType.ARRAY
        }, {
            key: "listAppend",
            label: "添加",
            params: [
                {
                    key: "value",
                    valueType: ValueType.STRING,
                    defaultValue: "值"
                }, {
                    key: "name",
                    label: "到",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }, {
                    key: "position",
                    dropdown: [
                        { label: "头部", value: "head" },
                        { label: "尾部", value: "tail" }
                    ]
                }
            ]
        }, {
            key: "listAdd",
            label: "添加",
            params: [
                {
                    key: "value",
                    valueType: ListItemValueType,
                    defaultValue: "值"
                }, {
                    key: "name",
                    label: "到",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }, {
                    key: "indexingMode",
                    dropdown: [
                        { label: "正数", value: "forward" },
                        { label: "倒数", value: "backward" }
                    ]
                }, {
                    key: "index",
                    label: "第",
                    labelAfter: "项",
                    valueType: ValueType.NUMBER,
                    defaultValue: 1
                }
            ]
        }, {
            key: "listRemove",
            label: "移除",
            params: [
                {
                    key: "name",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }, {
                    key: "indexingMode",
                    dropdown: [
                        { label: "正数", value: "forward" },
                        { label: "倒数", value: "backward" }
                    ]
                }, {
                    key: "index",
                    label: "第",
                    labelAfter: "项",
                    valueType: ValueType.NUMBER,
                    defaultValue: 1
                }
            ]
        }, {
            key: "listEmpty",
            label: "清空",
            params: [
                {
                    key: "name",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }
            ]
        }, {
            key: "listReplace",
            label: "替换",
            params: [
                {
                    key: "name",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }, {
                    key: "indexingMode",
                    dropdown: [
                        { label: "正数", value: "forward" },
                        { label: "倒数", value: "backward" }
                    ]
                }, {
                    key: "index",
                    label: "第",
                    labelAfter: "项",
                    valueType: ValueType.NUMBER,
                    defaultValue: 1
                }, {
                    key: "value",
                    label: "为",
                    valueType: ListItemValueType,
                    defaultValue: "值"
                }
            ]
        }, {
            key: "listCopy",
            label: "复制",
            params: [
                {
                    key: "list1name",
                    valueType: [ ValueType.STRING, ValueType.ARRAY ],
                    defaultValue: "列表（可放入本地列表）"
                }, {
                    key: "list2name",
                    label: "到",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }
            ],
            blockOptions: {
                space: 40
            }
        }, {
            key: "listGet",
            params: [
                {
                    key: "name",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }, {
                    key: "indexingMode",
                    dropdown: [
                        { label: "正数", value: "forward" },
                        { label: "倒数", value: "backward" }
                    ]
                }, {
                    key: "index",
                    label: "第",
                    labelAfter: "项",
                    valueType: ValueType.NUMBER,
                    defaultValue: 1
                }
            ],
            valueType: ListItemValueType
        }, {
            key: "listLength",
            params: [
                {
                    key: "name",
                    labelAfter: "的项数",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }
            ],
            valueType: ValueType.NUMBER
        }, {
            key: "listFind",
            params: [
                {
                    key: "name",
                    labelAfter: "中",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }, {
                    key: "countingMode",
                    dropdown: [
                        { label: "正数", value: "forward" },
                        { label: "倒数", value: "backward" }
                    ]
                }, {
                    key: "count",
                    label: "第",
                    labelAfter: "个",
                    valueType: ValueType.NUMBER,
                    defaultValue: 1
                }, {
                    key: "value",
                    labelAfter: "的位置",
                    valueType: ValueType.STRING,
                    defaultValue: "值"
                }

            ],
            valueType: ValueType.NUMBER
        }, {
            key: "listContain",
            params: [
                {
                    key: "name",
                    labelAfter: "中",
                    valueType: ValueType.STRING,
                    defaultValue: "云列表"
                }, {
                    key: "value",
                    label: "包含",
                    valueType: ValueType.STRING,
                    defaultValue: "值"
                }

            ],
            valueType: ValueType.BOOLEAN
        }
    ],
    events: [
        {
            key: "onOpen",
            label: "连接打开",
            params: []
        }, {
            key: "onClose",
            label: "连接关闭",
            params: []
        }, {
            key: "onError",
            label: "出现错误",
            params: [
                {
                    key: "message",
                    label: "信息",
                    valueType: ValueType.STRING
                }
            ]
        }, {
            key: "onPublicVariableValueChanged",
            label: "公有云变量值改变",
            params: [
                {
                    key: "name",
                    label: "名称",
                    valueType: ValueType.STRING
                }, {
                    key: "source",
                    label: "来源",
                    valueType: ValueType.STRING
                }, {
                    key: "originalValue",
                    label: "原值",
                    valueType: VariableValueType
                }, {
                    key: "newValue",
                    label: "新值",
                    valueType: VariableValueType
                }
            ]
        }, {
            key: "onOnlineUsersNumberChanged",
            label: "在线用户数改变",
            params: [
                {
                    key: "originalNumber",
                    label: "原数量",
                    valueType: ValueType.NUMBER
                }, {
                    key: "newNumber",
                    label: "新数量",
                    valueType: ValueType.NUMBER
                }
            ]
        }, {
            key: "onListPushed",
            label: "云列表添加到尾项",
            params: [
                {
                    key: "name",
                    label: "名称",
                    valueType: ValueType.STRING
                }, {
                    key: "source",
                    label: "来源",
                    valueType: ValueType.STRING
                }, {
                    key: "item",
                    label: "项",
                    valueType: ListItemValueType
                }
            ]
        }, {
            key: "onListUnshifted",
            label: "云列表添加到首项",
            params: [
                {
                    key: "name",
                    label: "名称",
                    valueType: ValueType.STRING
                }, {
                    key: "source",
                    label: "来源",
                    valueType: ValueType.STRING
                }, {
                    key: "item",
                    label: "项",
                    valueType: ListItemValueType
                }
            ]
        }, {
            key: "onListAdd",
            label: "云列表添加项",
            params: [
                {
                    key: "name",
                    label: "名称",
                    valueType: ValueType.STRING
                }, {
                    key: "source",
                    label: "来源",
                    valueType: ValueType.STRING
                }, {
                    key: "position",
                    label: "位置",
                    valueType: ValueType.STRING
                }, {
                    key: "item",
                    label: "项",
                    valueType: ListItemValueType
                }
            ]
        }, {
            key: "onListPopped",
            label: "云列表移除尾项",
            params: [
                {
                    key: "name",
                    label: "名称",
                    valueType: ValueType.STRING
                }, {
                    key: "source",
                    label: "来源",
                    valueType: ValueType.STRING
                }, {
                    key: "item",
                    label: "项",
                    valueType: ListItemValueType
                }
            ]
        }, {
            key: "onListRemove",
            label: "云列表移除项",
            params: [
                {
                    key: "name",
                    label: "名称",
                    valueType: ValueType.STRING
                }, {
                    key: "source",
                    label: "来源",
                    valueType: ValueType.STRING
                }, {
                    key: "position",
                    label: "位置",
                    valueType: ValueType.STRING
                }, {
                    key: "item",
                    label: "项",
                    valueType: ListItemValueType
                }
            ]
        }, {
            key: "onListEmptied",
            label: "云列表清空",
            params: [
                {
                    key: "name",
                    label: "名称",
                    valueType: ValueType.STRING
                }, {
                    key: "source",
                    label: "来源",
                    valueType: ValueType.STRING
                }, {
                    key: "list",
                    label: "列表",
                    valueType: ValueType.ARRAY
                }
            ]
        }, {
            key: "onListReplacedLast",
            label: "云列表替换尾项",
            params: [
                {
                    key: "name",
                    label: "名称",
                    valueType: ValueType.STRING
                }, {
                    key: "source",
                    label: "来源",
                    valueType: ValueType.STRING
                }, {
                    key: "originalItem",
                    label: "原项",
                    valueType: ListItemValueType
                }, {
                    key: "newItem",
                    label: "新项",
                    valueType: ListItemValueType
                }
            ]
        }, {
            key: "onListReplaced",
            label: "云列表替换项",
            params: [
                {
                    key: "name",
                    label: "名称",
                    valueType: ValueType.STRING
                }, {
                    key: "source",
                    label: "来源",
                    valueType: ValueType.STRING
                }, {
                    key: "position",
                    label: "位置",
                    valueType: ValueType.STRING
                }, {
                    key: "originalItem",
                    label: "原项",
                    valueType: ListItemValueType
                }, {
                    key: "newItem",
                    label: "新项",
                    valueType: ListItemValueType
                }
            ]
        }
    ]
}

const userMap = new Map<number, CodemaoUser>()
userMap.set(0, KittenCloudFunction.user)

class KittenCloudFunctionWidget extends SLIGHTNINGWidgetSuper(types, InvisibleWidget) {

    private connection: KittenCloudFunction | None
    private isOpened: boolean = false

    private getConnection(this: this): KittenCloudFunction {
        if (this.connection == None) {
            throw new Error("当前未连接，请连接后再试")
        }
        return this.connection
    }

    public connect(this: this, workID: number): void {
        if (this.connection != None) {
            this.close()
            this.warn("上一个连接未断开，已自动断开")
        }
        this.isOpened = false
        this.connection = new KittenCloudFunction(
            new CodemaoWork({ id: workID })
        )
        this.connection.publicVariable.getAll().then(
            (variableArray: KittenCloudPublicVariable[]): void => {
                for (const variable of variableArray) {
                    variable.changed.connect(
                        ({ source, originalValue, newValue }: KittenCloudVariableChangeMessageObject): void => {
                            this.emit("onPublicVariableValueChanged", variable.name, source.name, originalValue, newValue)
                        }
                    )
                }
            }
        )
        this.connection.onlineUserNumber.then(
            (onlineUserNumber: KittenCloudOnlineUserNumber): void => {
                onlineUserNumber.changed.connect(
                    ({ originalNumber, newNumber }: KittenCloudOnlineUserNumberChangObject): void => {
                        this.emit("onOnlineUsersNumberChanged", originalNumber, newNumber)
                    }
                )
            }
        )
        this.connection.list.getAll().then(
            (listArray: KittenCloudList[]): void => {
                for (const list of listArray) {
                    list.pushed.connect(
                        ({ source, item }: KittenCloudListPushMessageObject): void => {
                            this.emit("onListPushed", list.name, source.name, item)
                        }
                    )
                    list.unshifted.connect(
                        ({ source, item }: KittenCloudListUnshiftMessageObject): void => {
                            this.emit("onListUnshifted", list.name, source.name, item)
                        }
                    )
                    list.added.connect(
                        ({ source, index, item }: KittenCloudListAddMessageObject): void => {
                            this.emit("onListAdd", list.name, source.name, index, item)
                        }
                    )
                    list.popped.connect(
                        ({ source, item }: KittenCloudListPopMessageObject): void => {
                            this.emit("onListPopped", list.name, source.name, item)
                        }
                    )
                    list.removed.connect(
                        ({ source, index, item }: KittenCloudListRemoveMessageObject): void => {
                            this.emit("onListRemove", list.name, source.name, index, item)
                        }
                    )
                    list.emptied.connect(
                        ({ source, list: listValue }: KittenCloudListEmptyMessageObject): void => {
                            this.emit("onListEmptied", list.name, source.name, listValue)
                        }
                    )
                    list.replacedLast.connect(
                        ({ source, originalItem, newItem }: KittenCloudListReplaceLastMessageObject): void => {
                            this.emit("onListReplacedLast", list.name, source.name, originalItem, newItem)
                        }
                    )
                    list.replaced.connect(
                        ({ source, index, originalItem, newItem }: KittenCloudListReplaceMessageObject): void => {
                            this.emit("onListReplaced", list.name, source.name, index, originalItem, newItem)
                        }
                    )
                }
            }
        )
        this.connection.opened.connect((): void => {
            this.isOpened = true
            this.emit("onOpen")
        })
        this.connection.errored.connect((error): void => {
            if (!this.isOpened) {
                this.connection = None
            }
            this.error(error)
        })
        this.connection.closed.connect(this.handleClose)
    }

    private handleClose = (): void => {
        this.connection = None
        this.emit("onClose")
    }

    public close(this: this): void {
        const connection: KittenCloudFunction = this.getConnection()
        connection.close()
        connection.closed.disconnect(this.handleClose)
        this.connection = None
    }

    public async isConnected(this: this): Promise<boolean> {
        return this.connection != None
    }

    public async connectedWorkID(this: this): Promise<number> {
        return await this.getConnection().work.info.id
    }

    public getConnectionConfigValue(this: this, type: string): number | boolean {
        const connection: KittenCloudFunction = this.getConnection()
        switch (type) {
            case "autoReconnectIntervalTime": return connection.autoReconnectIntervalTime.value
            case "localPreupdate": return connection.localPreupdate.value
            case "cacheTime": return connection.cacheTime.value
            case "uploadIntervalTime": return connection.uploadIntervalTime.value
            case "stringLengthLimit": return connection.stringLengthLimit.value
            case "listLengthLimit": return connection.listLengthLimit.value
            default: throw new Error(`无法识别的连接配置类型：${type}`)
        }
    }

    public setConnectionConfig(this: this, type: string, value: number | boolean): void {
        const connection: KittenCloudFunction = this.getConnection()
        switch (type) {
            case "autoReconnectIntervalTime":
                connection.autoReconnectIntervalTime.value = value
                break
            case "localPreupdate":
                if (typeof value != "boolean") {
                    throw new Error("本地预更新值必须为布尔值")
                }
                connection.localPreupdate.config = value
                break
            case "cacheTime":
                connection.cacheTime.config = value
                break
            case "uploadIntervalTime":
                connection.uploadIntervalTime.config = value
                break
            case "stringLengthLimit":
                if (typeof value != "number") {
                    throw new Error("字符串长度限制值必须为数字")
                }
                connection.stringLengthLimit.config = value
                break
            case "listLengthLimit":
                if (typeof value != "number") {
                    throw new Error("列表长度限制值必须为数字")
                }
                connection.listLengthLimit.config = value
                break
            default: throw new Error(`无法识别的连接配置类型：${type}`)
        }
    }

    private async getVariable(this: this, index: string): Promise<KittenCloudVariable> {
        const data: KittenCloudData = await this.getConnection().get(index)
        if (!(data instanceof KittenCloudVariable)) {
            throw new Error(`${index} 不是云变量`)
        }
        return data
    }

    public async getPrivateVariableList(this: this): Promise<object[]> {
        return this.getConnection().privateVariable.getAll().then(
            (variableArray: KittenCloudPrivateVariable[]): object[] => {
                return variableArray.map(
                    (variable: KittenCloudPrivateVariable): object => {
                        return {
                            "名称": variable.name,
                            "值": variable.value
                        }
                    }
                )
            }
        )
    }

    public getPrivateVariableConfigValue(this: this, type: string): number | boolean {
        const group: KittenCloudPrivateVariableGroup = this.getConnection().privateVariable
        switch (type) {
            case "localPreupdate": return group.localPreupdate.value
            case "cacheTime": return group.cacheTime.value
            case "uploadIntervalTime": return group.uploadIntervalTime.value
            case "stringLengthLimit": return group.stringLengthLimit.value
            default: throw new Error(`无法识别的私有云变量配置类型：${type}`)
        }
    }

    public setPrivateVariableConfig(this: this, type: string, value: number | boolean): void {
        const group: KittenCloudPrivateVariableGroup = this.getConnection().privateVariable
        switch (type) {
            case "localPreupdate":
                if (typeof value != "boolean") {
                    throw new Error("本地预更新值必须为布尔值")
                }
                group.localPreupdate.config = value
                break
            case "cacheTime":
                group.cacheTime.config = value
                break
            case "uploadIntervalTime":
                group.uploadIntervalTime.config = value
                break
            case "stringLengthLimit":
                if (typeof value != "number") {
                    throw new Error("字符串长度限制值必须为数字")
                }
                group.stringLengthLimit.config = value
                break
            default: throw new Error(`无法识别的私有云变量配置类型：${type}`)
        }
    }

    public async getPublicVariableList(this: this): Promise<object[]> {
        return this.getConnection().publicVariable.getAll().then(
            (variableArray: KittenCloudPublicVariable[]): object[] => {
                return variableArray.map(
                    (variable: KittenCloudPublicVariable): object => {
                        return {
                            "名称": variable.name,
                            "值": variable.value
                        }
                    }
                )
            }
        )
    }

    public getPublicVariableConfigValue(this: this, type: string): number | boolean {
        const group: KittenCloudPublicVariableGroup = this.getConnection().publicVariable
        switch (type) {
            case "localPreupdate": return group.localPreupdate.value
            case "cacheTime": return group.cacheTime.value
            case "uploadIntervalTime": return group.uploadIntervalTime.value
            case "stringLengthLimit": return group.stringLengthLimit.value
            default: throw new Error(`无法识别的公有云变量配置类型：${type}`)
        }
    }

    public setPublicVariableConfig(this: this, type: string, value: number | boolean): void {
        const group: KittenCloudPublicVariableGroup = this.getConnection().publicVariable
        switch (type) {
            case "localPreupdate":
                if (typeof value != "boolean") {
                    throw new Error("本地预更新值必须为布尔值")
                }
                group.localPreupdate.config = value
                break
            case "cacheTime":
                group.cacheTime.config = value
                break
            case "uploadIntervalTime":
                group.uploadIntervalTime.config = value
                break
            case "stringLengthLimit":
                if (typeof value != "number") {
                    throw new Error("字符串长度限制值必须为数字")
                }
                group.stringLengthLimit.config = value
                break
            default: throw new Error(`无法识别的公有云变量配置类型：${type}`)
        }
    }

    public async variableGet(this: this, name: string): Promise<KittenCloudVariableValue> {
        return (await this.getVariable(name)).get()
    }

    public async variableSet(this: this, name: string, value: KittenCloudVariableValue): Promise<void> {
        (await this.getVariable(name)).set(value)
    }

    public async getRankingList(
        this: this, name: string, limit: number, order: string
    ): Promise<{ "值": number, "用户": number }[]> {
        const variable = await this.getVariable(name)
        if (!(variable instanceof KittenCloudPrivateVariable)) {
            throw new Error(`${name} 不是私有云变量`)
        }
        return Promise.all((await variable.getRankingList(limit, parseInt(order))).map(
            async (item: KittenCloudPrivateVariableRankingListItemObject): Promise<{ "值": number; "用户": number} > => {
                userMap.set(await item.user.info.id, item.user)
                return { "值": item.value, "用户": await item.user.info.id }
            }
        ))
    }

    public async isUserLogged(this: this): Promise<boolean> {
        try {
            await KittenCloudFunction.user.info.id
            return true
        } catch (error) {
            return false
        }
    }

    public async getUserInfo(this: this, userID: number, type: string): Promise<number | string> {
        let user: CodemaoUser | None = userMap.get(userID)
        if (user == None) {
            user = new CodemaoUser({ id: userID })
            userMap.set(userID, user)
        }
        switch (type) {
            case "id": return await user.info.id
            case "username": return await user.info.username
            case "nickname": return await user.info.nickname
            case "realname": return await user.info.realname
            case "avatarURL": return await user.info.avatarURL
            case "coverURL": return await user.info.coverURL
            case "description": return await user.info.description
            case "doing": return await user.info.doing
            case "email": return await user.info.email
            case "level": return await user.info.level
            case "grade": return await user.info.grade
            case "birthday": return (await user.info.birthday).toLocaleString()
            case "sex": return (await user.info.sex).name
            case "viewTimes": return await user.info.viewTimes
            case "praiseTimes": return await user.info.praiseTimes
            case "collectTimes": return await user.info.collectTimes
            case "forkTimes": return await user.info.forkTimes
            default: throw new Error(`无法识别的用户信息类型：${type}`)
        }
    }

    public async getOnlineUsersNumber(this: this): Promise<number> {
        return (await this.getConnection().onlineUserNumber).value
    }

    public async getList(this: this, index: string): Promise<KittenCloudList> {
        const data: KittenCloudData = await this.getConnection().get(index)
        if (!(data instanceof KittenCloudList)) {
            throw new Error(`${index} 不是云列表`)
        }
        return data
    }

    public getListConfigValue(this: this, type: string): number | boolean {
        const group: KittenCloudListGroup = this.getConnection().list
        switch (type) {
            case "localPreupdate": return group.localPreupdate.value
            case "cacheTime": return group.cacheTime.value
            case "uploadIntervalTime": return group.uploadIntervalTime.value
            case "stringLengthLimit": return group.stringLengthLimit.value
            case "listLengthLimit": return group.listLengthLimit.value
            default: throw new Error(`无法识别的列表配置类型：${type}`)
        }
    }

    public setListConfig(this: this, type: string, value: number | boolean): void {
        const group: KittenCloudListGroup = this.getConnection().list
        switch (type) {
            case "localPreupdate":
                if (typeof value != "boolean") {
                    throw new Error("本地预更新值必须为布尔值")
                }
                group.localPreupdate.config = value
                break
            case "cacheTime":
                group.cacheTime.config = value
                break
            case "uploadIntervalTime":
                group.uploadIntervalTime.config = value
                break
            case "stringLengthLimit":
                if (typeof value != "number") {
                    throw new Error("字符串长度限制值必须为数字")
                }
                group.stringLengthLimit.config = value
                break
            case "listLengthLimit":
                if (typeof value != "number") {
                    throw new Error("列表长度限制值必须为数字")
                }
                group.listLengthLimit.config = value
                break
            default: throw new Error(`无法识别的列表配置类型：${type}`)
        }
    }

    public async listIndex(this: this, list: KittenCloudList, indexingMode: string, index: number): Promise<number> {
        switch (indexingMode) {
            case "forward": return index - 1
            case "backward": return list.length - index
            default: throw new Error(`无法识别的索引模式：${indexingMode}`)
        }
    }

    public async getListList(this: this): Promise<object[]> {
        return this.getConnection().list.getAll().then(
            (listArray: KittenCloudList[]): object[] => {
                return listArray.map(
                    (list: KittenCloudList): object => {
                        return {
                            "名称": list.name,
                            "值": list.copy()
                        }
                    }
                )
            }
        )
    }

    public async getListCopy(this: this, name: string): Promise<KittenCloudListItemValue[]> {
        return (await this.getList(name)).copy()
    }

    public async listAppend(this: this, value: KittenCloudListItemValue, name: string, position: string): Promise<void> {
        switch (position) {
            case "head":
                (await this.getList(name)).push(value)
                break
            case "tail":
                (await this.getList(name)).unshift(value)
                break
            default: throw new Error(`无法识别的位置：${position}`)
        }
    }

    public async listAdd(
        this: this, value: KittenCloudListItemValue, name: string, indexingMode: string, index: number
    ): Promise<void> {
        const list: KittenCloudList = await this.getList(name)
        list.add(await this.listIndex(list, indexingMode, index), value)
    }

    public async listRemove(
        this: this, name: string, indexingMode: string, index: number
    ): Promise<void> {
        const list: KittenCloudList = await this.getList(name)
        if (indexingMode == "backward" && index == 1) {
            list.pop()
        } else {
            list.remove(await this.listIndex(list, indexingMode, index))
        }
    }

    public async listEmpty(this: this, name: string): Promise<void> {
        (await this.getList(name)).empty()
    }

    public async listReplace(
        this: this, name: string, indexingMode: string, index: number, value: KittenCloudListItemValue
    ): Promise<void> {
        const list: KittenCloudList = await this.getList(name)
        if (indexingMode == "backward" && index == 1) {
            list.replaceLast(value)
        } else {
            list.replace(await this.listIndex(list, indexingMode, index), value)
        }
    }

    public async listCopy(
        this: this, list1: string | KittenCloudListItemValue[], list2name: string
    ): Promise<void> {
        if (typeof list1 == "string") {
            list1 = (await this.getList(list1)).value
        }
        (await this.getList(list2name)).copyFrom(list1)
    }

    public async listGet(
        this: this, name: string, indexingMode: string, index: number
    ): Promise<KittenCloudListItemValue> {
        const list: KittenCloudList = await this.getList(name)
        return list.get(await this.listIndex(list, indexingMode, index)) ?? 0
    }

    public async listLength(this: this, name: string): Promise<number> {
        return (await this.getList(name)).length
    }

    public async listFind(
        this: this, name: string, countingMode: string, count: number, value: KittenCloudListItemValue
    ): Promise<number> {
        const list: KittenCloudList = await this.getList(name)
        switch (countingMode) {
            case "forward":
                let nowCount0: number = 0
                for (let i: number = 0; i < list.length; i++) {
                    if (list.get(i) == value) {
                        nowCount0++
                        if (nowCount0 == count) {
                            return i + 1
                        }
                    }
                }
                return 0
            case "backward":
                let nowCount1: number = 0
                for (let i: number = list.length - 1; i >= 0; i--) {
                    if (list.get(i) == value) {
                        nowCount1++
                        if (nowCount1 == count) {
                            return i + 1
                        }
                    }
                }
                return 0
            default: throw new Error(`无法识别的计数模式：${countingMode}`)
        }
    }

    public async listContain(this: this, name: string, value: KittenCloudListItemValue): Promise<boolean> {
        return (await this.getList(name)).includes(value)
    }
}

SLIGHTNINGExport(types, KittenCloudFunctionWidget)
