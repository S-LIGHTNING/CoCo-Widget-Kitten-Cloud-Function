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
import { KittenCloudAutoReconnectIntervalTime, KittenCloudCacheTime, KittenCloudFunctionConfigLayer, KittenCloudLocalPreupdate, KittenCloudUploadIntervalTime } from "./kitten-cloud-function-package"
const { project } = require("../../project")

declare const KITTEN_CLOUD_FUNCTION_DEVELOP: boolean
declare const KITTEN_CLOUD_FUNCTION_ALLOW: {
    USER: string,
    USING_WORK: string,
    CONNECTING_WORK: string,
} | None

const VariableValueType: ValueType[] = [ ValueType.NUMBER, ValueType.STRING ]
const ListItemValueType: ValueType[] = [ ValueType.NUMBER, ValueType.STRING ]

const types: SLIGHTNINGTypesObject = {
    type: "SLIGHTNING_KITTEN_CLOUD_FUNCTION_WIDGET",
    title: project.name,
    author: project.author,
    category: "编程猫",
    icon: "icon-widget-cloud-room",
	version: project.version,
    license: project.license,
    docs: {
        url: project.docs
    },
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
            valueType: ValueType.NUMBER
        }, {
            line:  "云变量",
            color: Color.BROWN
        }, {
            key: "getPrivateVariableList",
            label: "私有云变量列表",
            params: [],
            valueType: ValueType.ARRAY
        }, {
            key: "getPublicVariableList",
            label: "公有云变量列表",
            params: [],
            valueType: ValueType.ARRAY,
            blockOptions: {
                space: 40
            }
        }, {
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
            line: "用户",
            color: Color.RED
        }, {
            key: "isUserLoggedIn",
            label: "用户已登录",
            params: [],
            valueType: ValueType.BOOLEAN
        }, {
            key: "userLogIn",
            label: "用户登录",
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
                        { label: "总被被浏览次数", value: "viewTimes" },
                        { label: "总被被点赞次数", value: "praiseTimes" },
                        { label: "总被被收藏次数", value: "collectTimes" },
                        { label: "总被被再创作次数", value: "forkTimes" }
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
            valueType: ValueType.ARRAY,
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
        }, {
            line: "配置",
            color: Color.PINK
        }, {
            key: "getAutoReconnectIntervalTime",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "自动重连间隔时间",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "type",
                    labelAfter: "的毫秒数",
                    dropdown: [
                        { label: "配置值", value: "config" },
                        { label: "生效值", value: "value" }
                    ]
                }
            ],
            valueType: [ ValueType.NUMBER, ValueType.BOOLEAN ]
        }, {
            key: "getLocalPreupdate",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "私有云变量组", value: "privateVariableGroup" },
                        { label: "公有云变量组", value: "publicVariableGroup" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云变量", value: "variable" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "本地预更新",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "type",
                    dropdown: [
                        { label: "配置值", value: "config" },
                        { label: "生效值", value: "value" }
                    ]
                }
            ],
            valueType: ValueType.BOOLEAN
        }, {
            key: "getCacheTime",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "私有云变量组", value: "privateVariableGroup" },
                        { label: "公有云变量组", value: "publicVariableGroup" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云变量", value: "variable" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "缓存时间",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "type",
                    labelAfter: "的毫秒数",
                    dropdown: [
                        { label: "配置值", value: "config" },
                        { label: "生效值", value: "value" }
                    ]
                }
            ],
            valueType: [ ValueType.NUMBER, ValueType.BOOLEAN ]
        }, {
            key: "getUploadIntervalTime",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "私有云变量组", value: "privateVariableGroup" },
                        { label: "公有云变量组", value: "publicVariableGroup" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云变量", value: "variable" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "上传间隔时间",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "type",
                    labelAfter: "的毫秒数",
                    dropdown: [
                        { label: "配置值", value: "config" },
                        { label: "生效值", value: "value" }
                    ]
                }
            ],
            valueType: [ ValueType.NUMBER, ValueType.BOOLEAN ]
        }, {
            key: "getUploadTimeout",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "私有云变量组", value: "privateVariableGroup" },
                        { label: "公有云变量组", value: "publicVariableGroup" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云变量", value: "variable" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "上传超时时间",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "type",
                    labelAfter: "的毫秒数",
                    dropdown: [
                        { label: "配置值", value: "config" },
                        { label: "生效值", value: "value" }
                    ]
                }
            ],
            valueType: ValueType.NUMBER
        }, {
            key: "getStringLengthLimit",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "私有云变量组", value: "privateVariableGroup" },
                        { label: "公有云变量组", value: "publicVariableGroup" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云变量", value: "variable" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "字符串长度限制",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "type",
                    dropdown: [
                        { label: "配置值", value: "config" },
                        { label: "生效值", value: "value" }
                    ]
                }
            ],
            valueType: ValueType.NUMBER
        }, {
            key: "getListLengthLimit",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "列表长度限制",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "type",
                    dropdown: [
                        { label: "配置值", value: "config" },
                        { label: "生效值", value: "value" }
                    ]
                }
            ],
            valueType: ValueType.NUMBER,
            blockOptions: {
                space: 40
            }
        }, {
            key: "setAutoReconnectIntervalTime",
            label: "设置",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "自动重连间隔时间",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "value",
                    label: "为",
                    labelAfter: "毫秒",
                    valueType: [ ValueType.NUMBER, ValueType.BOOLEAN ],
                    defaultValue: 8000
                }
            ]
        }, {
            key: "setLocalPreupdate",
            label: "设置",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "私有云变量组", value: "privateVariableGroup" },
                        { label: "公有云变量组", value: "publicVariableGroup" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云变量", value: "variable" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "本地预更新",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "value",
                    label: "为",
                    valueType: ValueType.BOOLEAN,
                    defaultValue: true
                }
            ]
        }, {
            key: "setCacheTime",
            label: "设置",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "私有云变量组", value: "privateVariableGroup" },
                        { label: "公有云变量组", value: "publicVariableGroup" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云变量", value: "variable" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "缓存时间",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "value",
                    label: "为",
                    labelAfter: "毫秒",
                    valueType: [ ValueType.NUMBER, ValueType.BOOLEAN ],
                    defaultValue: 0
                }
            ]
        }, {
            key: "setUploadIntervalTime",
            label: "设置",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "私有云变量组", value: "privateVariableGroup" },
                        { label: "公有云变量组", value: "publicVariableGroup" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云变量", value: "variable" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "上传间隔时间",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "value",
                    label: "为",
                    labelAfter: "毫秒",
                    valueType: [ ValueType.NUMBER, ValueType.BOOLEAN ],
                    defaultValue: 0
                }
            ]
        }, {
            key: "setUploadTimeout",
            label: "设置",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "私有云变量组", value: "privateVariableGroup" },
                        { label: "公有云变量组", value: "publicVariableGroup" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云变量", value: "variable" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "上传超时时间",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "value",
                    label: "为",
                    labelAfter: "毫秒",
                    valueType: ValueType.NUMBER,
                    defaultValue: 4000
                }
            ]
        }, {
            key: "setStringLengthLimit",
            label: "设置",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "私有云变量组", value: "privateVariableGroup" },
                        { label: "公有云变量组", value: "publicVariableGroup" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云变量", value: "variable" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "字符串长度限制",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "value",
                    label: "为",
                    valueType: ValueType.NUMBER,
                    defaultValue: 1024
                }
            ]
        }, {
            key: "setListLengthLimit",
            label: "设置",
            params: [
                {
                    key: "configLayerName",
                    dropdown: [
                        { label: "连接", value: "connection" },
                        { label: "云列表组", value: "listGroup" },
                        { label: "云列表", value: "list" }
                    ]
                }, {
                    key: "dataName",
                    labelAfter: "列表长度限制",
                    valueType: ValueType.STRING,
                    defaultValue: ""
                }, {
                    key: "value",
                    label: "为",
                    valueType: ValueType.NUMBER,
                    defaultValue: 1000
                }
            ]
        }, {
            line: "已弃用",
            deprecated: true
        }, {
            key: "isUserLogged",
            label: "用户已登录",
            params: [],
            valueType: ValueType.BOOLEAN
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
            ]
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
            ]
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
            ]
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

let hasOutputVersionInfo: boolean = false

const userRecord: Record<string, CodemaoUser> = {}
userRecord[0] = KittenCloudFunction.user

async function checkModifiable(work: CodemaoWork): Promise<void> {
    async function getString(index: number): Promise<string> {
        return [
            await "JUU1JUJEJTkzJUU1JTg5JThEJUU3JTg5JTg4JUU2JTlDJUFDJUU0JUI4JUJBJUU0JUJGJUFFJUU2JTk0JUI5JUU1JThGJTk3JUU5JTk5JTkwJUU3JTg5JTg4JUU3JTg5JTg4JUVGJUJDJThDJUU1JThGJUFBJUU4JTgzJUJEJUU0JUJGJUFFJUU2JTk0JUI5JUU4JTg3JUFBJUU1JUI3JUIxJUU0JUJEJTlDJUU1JTkzJTgxJUU3JTlBJTg0JUU0JUJBJTkxJUU2JTk1JUIwJUU2JThEJUFFJUVGJUJDJThDJUU0JUJEJTg2JUU2JTk4JUFGJUU2JUJBJTkwJUU3JUEwJTgxJUU0JUJBJTkxJUU1JThBJTlGJUU4JTgzJUJEJUU2JTk3JUEwJUU2JUIzJTk1JUU5JUFBJThDJUU4JUFGJTgxJUU0JUJEJUEwJUU3JTlBJTg0JUU4JUJBJUFCJUU0JUJCJUJE",
            await "JUU1JUJEJTkzJUU1JTg5JThEJUU3JTg5JTg4JUU2JTlDJUFDJUU0JUI4JUJBJUU0JUJGJUFFJUU2JTk0JUI5JUU1JThGJTk3JUU5JTk5JTkwJUU3JTg5JTg4JUU3JTg5JTg4JUVGJUJDJThDJUU1JThGJUFBJUU4JTgzJUJEJUU0JUJGJUFFJUU2JTk0JUI5JUU4JTg3JUFBJUU1JUI3JUIxJUU0JUJEJTlDJUU1JTkzJTgxJUU3JTlBJTg0JUU0JUJBJTkxJUU2JTk1JUIwJUU2JThEJUFFJUVGJUJDJThDJUU4JTgwJThDJTIw",
            await "JTIwJUU0JUI4JThEJUU2JTk4JUFGJUU0JUJEJUEwJUU3JTlBJTg0JUU0JUJEJTlDJUU1JTkzJTgx"
        ][await index]!
    }
    if (await KITTEN_CLOUD_FUNCTION_DEVELOP) {
        return
    } else if (KITTEN_CLOUD_FUNCTION_ALLOW != None) {
        let user: number, usingWork: number, connectingWork: number
        let message: string = await ""
        if (await (await (await location).protocol != await "file:")) {
            if (await (await (await location).pathname == await "/editor/editor-player.html" || await (await (await location).pathname == await "/player"))) {
                usingWork = await (await parseInt)(new URLSearchParams(await (await location).hash).get(await "#id") ?? await "")
                user = await (await (await (await KittenCloudFunction).user).info).id
            } else {
                usingWork = await (await parseInt)(await (await (await location).pathname).split(await "/").pop() ?? "")
                user = await (await (await (await new (await CodemaoWork)({ [await "id"]: await usingWork }).info).author).info).id
            }
            if (await !(await (await KITTEN_CLOUD_FUNCTION_ALLOW).USER).split(await ",").includes(await String(await user))) {
                message += await "，仅用户 " + await (await KITTEN_CLOUD_FUNCTION_ALLOW).USER + await " 可用"
            }
            if (await (await (await location).hostname != await "cp.cocotais.cn")) {
                if (await !(await (await (await KITTEN_CLOUD_FUNCTION_ALLOW).USING_WORK).split(await ",")).includes(await String(await usingWork))) {
                    message += await "，仅在 CoCo 作品 " + await (await KITTEN_CLOUD_FUNCTION_ALLOW).USING_WORK + await " 可用"
                }
            }
        }
        connectingWork = await (await (await work).info).id
        if (await !(await (await KITTEN_CLOUD_FUNCTION_ALLOW).CONNECTING_WORK).split(await ",").includes(await String(await connectingWork))) {
            message += await "，仅可连接作品 " + await (await KITTEN_CLOUD_FUNCTION_ALLOW).CONNECTING_WORK + await ""
        }
        if (await message != await "") {
            throw await new (await Error)(await `当前版本为专用版${await message}`)
        }
    } else {
        let expectedWorkAuthorID: number | None = await None
        if (await (await (await location).pathname == await "/editor/editor-player.html") || await (await (await location).pathname == await "/player")) {
            expectedWorkAuthorID = await (await (await (await KittenCloudFunction).user).info).id
        } else {
            const thisWorkID: number = await (await parseInt)(await (await (await (await location).pathname).split(await "/")).pop() ?? await "")
            if (await !(await (await Number).isNaN)(await thisWorkID)) {
                expectedWorkAuthorID = await (await (await (await new (await CodemaoWork)({ [await "id"]: await thisWorkID }).info).author).info).id
            }
        }
        if (await (await expectedWorkAuthorID == await None)) {
            throw await new (await Error)(await (await decodeURIComponent)((await atob)(await (await getString)(await 0)!)))
        }
        if (await (await (await (await (await (await work).info).author).info).id != await expectedWorkAuthorID)) {
            throw await new (await Error)(await `${await (await decodeURIComponent)(await (await atob)(await (await getString)(await 1)!))}${await (await (await work).info).name}${await (await decodeURIComponent)(await (await atob)(await (await getString)(await 2)!))}`)
        }
    }
}

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
        if (!hasOutputVersionInfo) {
            if (KITTEN_CLOUD_FUNCTION_DEVELOP) {
                this.log(`${project.name} ${project.version}（开发调试版）`)
                if (!/^https?:\/\/(coco\.codemao\.cn\/editor\/editor-player\.html|cp\.cocotais\.cn\/((pptui)\/?)?)$/.test(location.origin + location.pathname)) {
                    const message = `不要将 ${project.name} ${project.version}（开发调试版）用于生产环境中！`
                    this.error(new Error(message))
                    alert(message)
                }
            } else if (KITTEN_CLOUD_FUNCTION_ALLOW == None) {
                this.log(`${project.name} v${project.version}（修改受限版版）`)
            } else {
                this.log(`${project.name} v${project.version}（用户 ${KITTEN_CLOUD_FUNCTION_ALLOW.USER} 在 ${KITTEN_CLOUD_FUNCTION_ALLOW.USING_WORK} 中连接 ${KITTEN_CLOUD_FUNCTION_ALLOW.CONNECTING_WORK} 的专用版）`)
            }
            hasOutputVersionInfo = true
        }
        this.isOpened = false
        this.connection = new KittenCloudFunction(workID)
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

    private handleClose: () => void = (): void => {
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

    public async variableGet(this: this, name: string): Promise<KittenCloudVariableValue> {
        return (await this.getVariable(name)).get()
    }

    public async variableSet(this: this, name: string, value: KittenCloudVariableValue): Promise<void> {
        await checkModifiable(this.getConnection().work)
        ;(await this.getVariable(name)).set(value)
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
                const user: CodemaoUser = userRecord[await item.user.info.id] ?? new CodemaoUser()
                user.info.setCache({
                    id: await item.user.info.id,
                    nickname: await item.user.info.nickname,
                    avatarURL: await item.user.info.avatarURL
                })
                return { "值": item.value, "用户": await item.user.info.id }
            }
        ))
    }

    public async isUserLoggedIn(this: this): Promise<boolean> {
        try {
            await KittenCloudFunction.user.info.id
            return true
        } catch (__ignore) {
            return false
        }
    }

    public async userLogIn(this: this): Promise<boolean> {
        return CodemaoUser.userLogInInBrowser()
    }

    public async getUserInfo(this: this, userID: number, type: string): Promise<number | string> {
        let user: CodemaoUser | None = userRecord[userID]
        if (user == None) {
            user = new CodemaoUser({ id: userID })
            userRecord[userID] = user
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
            case "badge": return (await user.info.badge).name
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

    public async listIndex(
        this: this,
        list: KittenCloudList,
        indexingMode: string,
        index: number
    ): Promise<number> {
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

    public async listAppend(
        this: this,
        value: KittenCloudListItemValue,
        name: string,
        position: string
    ): Promise<void> {
        await checkModifiable(this.getConnection().work)
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
        this: this,
        value: KittenCloudListItemValue,
        name: string,
        indexingMode: string,
        index: number
    ): Promise<void> {
        await checkModifiable(this.getConnection().work)
        const list: KittenCloudList = await this.getList(name)
        list.add(await this.listIndex(list, indexingMode, index), value)
    }

    public async listRemove(
        this: this, name: string, indexingMode: string, index: number
    ): Promise<void> {
        await checkModifiable(this.getConnection().work)
        const list: KittenCloudList = await this.getList(name)
        if (indexingMode == "backward" && index == 1) {
            list.pop()
        } else {
            list.remove(await this.listIndex(list, indexingMode, index))
        }
    }

    public async listEmpty(this: this, name: string): Promise<void> {
        await checkModifiable(this.getConnection().work)
        ;(await this.getList(name)).empty()
    }

    public async listReplace(
        this: this,
        name: string,
        indexingMode: string,
        index: number,
        value: KittenCloudListItemValue
    ): Promise<void> {
        await checkModifiable(this.getConnection().work)
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
        await checkModifiable(this.getConnection().work)
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
        this: this,
        name: string,
        countingMode: string,
        count: number,
        value: KittenCloudListItemValue
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

    private async getConfigLayer(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string
    ): Promise<KittenCloudFunctionConfigLayer> {
        switch (configLayerName) {
            case "connection":
                return this.getConnection()
            case "privateVariableGroup":
                return this.getConnection().privateVariable
            case "publicVariableGroup":
                return this.getConnection().publicVariable
            case "listGroup":
                return this.getConnection().list
            case "variable":
                return await this.getVariable(dataName)
            case "list":
                return await this.getList(dataName)
            default:
                throw new Error(`未知的配置层：${configLayerName}`)
        }
    }

    public async getAutoReconnectIntervalTime(
        this: this,
        configLayerName: "connection",
        dataName: string,
        type: "config" | "value"
    ): Promise<KittenCloudAutoReconnectIntervalTime | None> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        return configLayer.autoReconnectIntervalTime[type]
    }

    public async getLocalPreupdate(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string,
        type: "config" | "value"
    ): Promise<KittenCloudLocalPreupdate | None> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        return configLayer.localPreupdate[type]
    }

    public async getCacheTime(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string,
        type: "config" | "value"
    ): Promise<KittenCloudCacheTime | None> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        return configLayer.cacheTime[type]
    }

    public async getUploadIntervalTime(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string,
        type: "config" | "value"
    ): Promise<KittenCloudUploadIntervalTime | None> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        return configLayer.uploadIntervalTime[type]
    }

    public async getUploadTimeout(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string,
        type: "config" | "value"
    ): Promise<number | None> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        return configLayer.uploadTimeout[type]
    }

    public async getStringLengthLimit(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string,
        type: "config" | "value"
    ): Promise<number | None> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        return configLayer.stringLengthLimit[type]
    }

    public async getListLengthLimit(
        this: this,
        configLayerName: "connection" | "listGroup" | "list",
        dataName: string,
        type: "config" | "value"
    ): Promise<number | None> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        return configLayer.listLengthLimit[type]
    }

    public async setAutoReconnectIntervalTime(
        this: this,
        configLayerName: "connection",
        dataName: string,
        value: KittenCloudAutoReconnectIntervalTime
    ): Promise<void> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        configLayer.autoReconnectIntervalTime.config = value
    }

    public async setLocalPreupdate(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string,
        value: KittenCloudLocalPreupdate
    ): Promise<void> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        configLayer.localPreupdate.config = value
    }

    public async setCacheTime(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string,
        value: KittenCloudCacheTime
    ): Promise<void> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        configLayer.cacheTime.config = value
    }

    public async setUploadIntervalTime(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string,
        value: KittenCloudUploadIntervalTime
    ): Promise<void> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        configLayer.uploadIntervalTime.config = value
    }

    public async setUploadTimeout(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string,
        value: number
    ): Promise<void> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        configLayer.uploadTimeout.config = value
    }

    public async setStringLengthLimit(
        this: this,
        configLayerName:
            "connection" |
            "privateVariableGroup" |
            "publicVariableGroup" |
            "listGroup" |
            "variable" |
            "list",
        dataName: string,
        value: number
    ): Promise<void> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        configLayer.stringLengthLimit.config = value
    }

    public async setListLengthLimit(
        this: this,
        configLayerName: "connection" | "listGroup" | "list",
        dataName: string,
        value: number
    ): Promise<void> {
        const configLayer: KittenCloudFunctionConfigLayer = await this.getConfigLayer(configLayerName, dataName)
        configLayer.listLengthLimit.config = value
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

    /**
     * @deprecated
     */
    public async isUserLogged(this: this): Promise<boolean> {
        try {
            await KittenCloudFunction.user.info.id
            return true
        } catch (error) {
            return false
        }
    }


    /**
     * @deprecated
     */
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


    /**
     * @deprecated
     */
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


    /**
     * @deprecated
     */
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


    /**
     * @deprecated
     */
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


    /**
     * @deprecated
     */
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


    /**
     * @deprecated
     */
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


    /**
     * @deprecated
     */
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
}

SLIGHTNINGExport(types, KittenCloudFunctionWidget)
