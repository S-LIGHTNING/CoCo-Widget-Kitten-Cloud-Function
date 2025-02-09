#!/usr/bin/env node
import fs from "fs"
import path from "path"
import { Command } from "commander"
import axios from "axios"
import chalk, { ChalkInstance } from "chalk"
import { ArrayChange, Change, diffArrays } from "diff"

import { CodemaoUser, CodemaoUserInfo, KittenCloudFunction, KittenCloudVariable, KittenCloudList, KittenCloudData, CodemaoWork, CodemaoWorkEditor, KittenCloudPrivateVariable, KittenCloudPublicVariable, KittenCloudListItemValue, KittenCloudOnlineUserNumberChangObject, KittenCloudVariableChangeMessageObject, KittenCloudListPushMessageObject, KittenCloudListUnshiftMessageObject, KittenCloudListAddMessageObject, KittenCloudListPopMessageObject, KittenCloudListRemoveMessageObject, KittenCloudListEmptyMessageObject, KittenCloudListReplaceLastMessageObject, KittenCloudListReplaceMessageObject } from "./kitten-cloud-function-package"
import { None } from "../utils/other"
import { dirs } from "../utils/app-dirs"
import * as stringify from "@slightning/anything-to-string"
import { CodemaoUserBadge } from "../codemao/user/codemao-user-badge"
const { project } = require("../../project")

const program = new Command()

const language = {
    outputVersionNumber: "输出版本号",
    displayCommandsHelp: "显示命令帮助",
    setAuthorization: "设置身份",
    pleaseTypeInAuthorization: "请输入身份：",
    showUserInfo: "显示用户信息",
    IDOfUserToShow: "要显示用户的 ID，默认显示当前登录的用户",
    userIDMustBeInteger: "用户 ID 必须是整数",
    infoNameOfUserToShow: "要显示用户的信息名称，默认显示一堆用户信息",
    setWorkToUse: "设置要使用的作品",
    IDOfWorkToUse: "要使用的作品的 ID",
    workIDMustBeInteger: "作品 ID 必须是整数",
    useWork: "使用作品",
    showUsingWork: "显示正在使用的作品",
    usingWorkIs: "正在使用的作品为",
    noUsingWorkNow: "当前没有使用作品",
    exit: "退出",
    pleaseSetWorkToUseFirst: "请先设置要使用的作品，使用 kcf use <work-id> 命令",
    onlineUserNumber: "在线用户数",
    listAllCloudDataNameAndValue: "列出所有云数据的名称和值",
    cloudVariableName: "云变量名",
    getCloudVariableValue: "获取云变量的值",
    setCloudVariableValue: "设置云变量的值",
    getPrivateCloudVariableRankingList: "获取私有云变量排名列表",
    privateCloudVariableName: "私有云变量名",
    rankingListLimit: "限制数量，列表的长度不超过限制数量",
    rankingListOrder: "排名列表顺序，positive 表示顺序，reverse 表示逆序，默认为逆序",
    cloudListName: "云列表名",
    zeroBasedIndex: "从 0 开始的索引",
    getCloudListAllItems: "获取云列表所有项",
    getCloudListItem: "获取云列表的项",
    cloudListLength: "云列表的长度",
    cloudListIndexOf: "指定项在云列表中第一次出现的位置，如果不存在则输出 `-1`",
    cloudListIncludes: "判断指定项是否在云列表中",
    cloudListPush: "添加新的项到云列表尾部",
    cloudListUnshift: "添加新的项到云列表头部",
    cloudListAdd: "添加新的项到云列表指定位置",
    cloudListPop: "移除云列表最后一项",
    cloudListRemove: "移除云列表指项",
    cloudListEmpty: "清空云列表",
    cloudListReplaceLast: "替换云列表最后一项",
    cloudListReplace: "替换云列表指定项",
    watchCloudDataAndOnlineUserNumberChange: "监视云数据和在线用户数变化",
    noWatchOnlineUserNumberChange: "监视在线用户数变化",
    testDataByRegExpMatchName: "通过正则表达式匹配数据名称筛选数据，默认监视所有数据",
    showOriginalValue: "显示原来的值",
    showDiff: "显示差异",
    watchStarted: "监视已启动"
}

program
    .name("Kitten-Cloud-Function")
    .alias("kcf")
    .description(project.description)
    .version(project.version, "-v, --version", language.outputVersionNumber)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .helpCommand("help [command]", language.displayCommandsHelp)

let errorExit: boolean = false
let opened: boolean = false
let connection: KittenCloudFunction | None = None

const workInfoFilePath: string = path.resolve(dirs.config, "work.json")

function simplifyErrorMessage(data: unknown): unknown {
    if (
        data == null ||
        typeof data == "string" ||
        typeof data == "number" ||
        typeof data == "boolean" ||
        typeof data == "bigint" ||
        typeof data == "symbol"
    ) {
        return data
    } else if (axios.isAxiosError(data)) {
        const { config, request, code, response } = data
        let requestDescription: string | null = null
        if (config?.method != null && config.url != null) {
            requestDescription = `HTTP 请求 ${config?.method} ${config?.url}`
        } else {
            requestDescription = "未知 HTTP 请求"
        }
        if (request == None) {
            data.message = `${requestDescription} 失败：请求发送失败`
        } else if (response == None) {
            if (code != null) {
                data.message = `${requestDescription} 失败：请求已发出，但未收到响应，状态码为：${code}`
            } else {
                data.message = `${requestDescription} 失败：请求已发出，但未收到响应，无状态码`
            }
        } else {
            const { config, status, data: responseData } = response
            if (config.method != null && config.url != null) {
                requestDescription = `HTTP 请求 ${config?.method} ${config?.url}`
            }

            let responseMessage: string | null = null
            if (responseData != null && typeof responseData == "object") {
                responseMessage = responseData.error_message ?? responseData.error_name ?? responseData.error ?? responseData.msg ?? null
            }
            if (responseMessage == null) {
                responseMessage = JSON.stringify(data)
            }
            data.message = `${requestDescription} 失败：${status}，${responseMessage}`
        }
        return data
    } else if (Array.isArray(data)) {
        const result: unknown[] = []
        for (const item of data) {
            result.push(simplifyErrorMessage(item))
        }
        return result
    } else if (
        data != null && typeof data == "object" &&
        Object.prototype.toString.call(data) == "[object Object]"
    ) {
        let result: Record<PropertyKey, unknown> = {}
        for (const [key, value] of Object.entries(data)) {
            result[key] = simplifyErrorMessage(value)
        }
        return result
    } else {
        return data
    }
}

function anythingToString(data: unknown): string {
    return stringify.stringify(simplifyErrorMessage(data), {
        rules: stringify.Rules.LESSER,
        depth: 0
    })
}


async function tryRun(func: () => void | Promise<void>): Promise<void> {
    try {
        await func()
    } catch (error) {
        console.error(chalk.red.bold(anythingToString(error)))
        if (opened && connection != None) {
            errorExit = true
            connection.close()
        } else {
            process.exit(1)
        }
    }
}

async function connect(): Promise<KittenCloudFunction> {
    let workInfo: {
        id: number,
        editor: string
    }
    try {
        workInfo = JSON.parse(String(await fs.promises.readFile(workInfoFilePath)))
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code == "ENOENT") {
            console.log(chalk.red.bold(language.pleaseSetWorkToUseFirst))
            process.exit(1)
        } else {
            throw error
        }
    }
    connection = new KittenCloudFunction(new CodemaoWork({
        id: workInfo.id,
        editor:  CodemaoWorkEditor.parse(workInfo.editor)
    }))
    connection.opened.connect((): void => {
        opened = true
    })
    connection.errored.connect((error: unknown): void => {
        if (!errorExit && opened) {
            console.error(chalk.red.bold(anythingToString(error)))
        }
    })
    connection.closed.connect((): void =>{
        process.exit(errorExit ? 1 : 0)
    })
    return connection
}

function processInputValue(value: string): string | number {
    const numberValue: number = Number(value)
    if (Number.isNaN(numberValue)) {
        return value
    } else {
        return numberValue
    }
}

async function getCloudVariable(
    connection: KittenCloudFunction,
    variableName: string
): Promise<KittenCloudVariable> {
    const data: KittenCloudData = await connection.get(variableName)
    if (!(data instanceof KittenCloudVariable)) {
        throw new Error(`${variableName} 不是云变量`)
    }
    return data
}

program
    .command("set-authorization")
    .description(language.setAuthorization)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .action((): void => {
        tryRun(async (): Promise<void> => {
            // @ts-ignore
            const readline = (await import("@johnls/readline-password")).default.createInstance(process.stdin, process.stdout)
            const authorization: string = await readline.passwordAsync(language.pleaseTypeInAuthorization)
            process.stdin.unref()
            CodemaoUser.setAuthorization(authorization)
        })
    })

const userCommand: Command = program
    .command("user")
    .description(language.showUserInfo)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .option("-i, --user-id [user-id]", language.IDOfUserToShow, parseInt)
    .option("-n, --info-name [info-name]", language.infoNameOfUserToShow)
    .action((): void => {
        tryRun(async (): Promise<void> => {
            const { userId: userID, infoName } = userCommand.opts<{
                userId?: number,
                infoName?: keyof CodemaoUserInfo
            }>()
            if (userID != None && (Number.isNaN(userID) || !Number.isInteger(userID))) {
                throw new Error(language.userIDMustBeInteger)
            }
            let user: CodemaoUser
            if (userID == None) {
                user = new CodemaoUser()
            } else {
                user = new CodemaoUser({ id: userID })
            }
            if (infoName == None) {
                const badge: CodemaoUserBadge = await user.info.badge
                let badgeChalk: ChalkInstance = chalk
                if (badge.color != (None as null)) {
                    badgeChalk = badgeChalk.hex("#FFFFFF")
                    badgeChalk = badgeChalk.bgHex(badge.color)
                }
                console.log(`${await user.info.nickname} ${badgeChalk(badge.name)}`)
                console.log(await user.info.description)
                console.log(`训练师编号: ${await user.info.id}`)
                console.log(`被浏览：${await user.info.viewTimes} 次`)
                console.log(`被点赞：${await user.info.praiseTimes} 次`)
                console.log(`被收藏：${await user.info.collectTimes} 次`)
                console.log(`被再创作：${await user.info.forkTimes} 次`)
            } else {
                console.log(await user.info[infoName])
            }
        })
    })

program
    .command("use")
    .description(language.setWorkToUse)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<work-id>", language.IDOfWorkToUse, parseInt)
    .action((workID: number): void => {
        tryRun(async (): Promise<void> => {
            if (Number.isNaN(workID) || !Number.isInteger(workID)) {
                throw new Error(language.workIDMustBeInteger)
            }
            const work = new CodemaoWork({ id: workID })
            tryRun(async (): Promise<void> => {
                await fs.promises.mkdir(path.dirname(workInfoFilePath), { recursive: true })
                await fs.promises.writeFile(workInfoFilePath, JSON.stringify({
                    id: workID,
                    editor: (await work.info.editor).code
                }))
            })
            let workName: string | None = None
            try {
                workName = await work.info.name
            } catch (__ignore) {}
            if (workName == None) {
                console.log(`${language.useWork} ${workID}`)
            } else {
                console.log(`${language.useWork} ${workName}(${workID})`)
            }
        })
    })

program
    .command("work")
    .description(language.showUsingWork)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .action((): void => {
        tryRun(async (): Promise<void> => {
            try {
                let workInfo: {
                    id: number,
                    editor: string
                }
                workInfo = JSON.parse(String(await fs.promises.readFile(workInfoFilePath)))
                const work = new CodemaoWork({
                    id: workInfo.id,
                    editor:  CodemaoWorkEditor.parse(workInfo.editor)
                })
                let workName: string | None = None
                try {
                    workName = await work.info.name
                } catch (__ignore) {}
                if (workName == None) {
                    console.log(`${language.usingWorkIs} ${workInfo.id}`)
                } else {
                    console.log(`${language.usingWorkIs} ${workName}(${workInfo.id})`)
                }
            } catch (error) {
                if (error instanceof Error && "code" in error && error.code == "ENOENT") {
                    console.log(chalk.green.bold(language.noUsingWorkNow))
                } else {
                    throw error
                }
            }
        })
    })

program
    .command("exit")
    .description(language.exit)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .action((): void => {
        tryRun(async (): Promise<void> => {
            await fs.promises.unlink(workInfoFilePath)
        })
    })

program
    .command("online-user-number")
    .description(language.onlineUserNumber)
    .description(language.listAllCloudDataNameAndValue)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .action((): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            console.log((await connection.onlineUserNumber).value)
            connection.close()
        })
    })

program
    .command("list")
    .description(language.listAllCloudDataNameAndValue)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .action((): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            for (const cloudData of await connection.getAll()) {
                let label, value
                if (cloudData instanceof KittenCloudVariable) {
                    if (cloudData instanceof KittenCloudPrivateVariable) {
                        label = `[私有]${cloudData.name}`
                    } else if (cloudData instanceof KittenCloudPublicVariable) {
                        label = cloudData.name
                    }
                    value = cloudData.get()
                    if (typeof value == "string" && value.length > 64) {
                        value = `${value.substring(0, 64)}……`
                    }
                } else if (cloudData instanceof KittenCloudList) {
                    label = cloudData.name
                    let array: (KittenCloudListItemValue | None)[] = cloudData.copy()
                    if (array.length > 4) {
                        array = [ ...array.slice(0, 4), None ]
                    }
                    value = stringify.default(array, {
                        rules: [ new (class implements stringify.Rule<None> {
                            public test(data: unknown): data is None {
                                return data == None
                            }
                            public toString(): string {
                                return "……"
                            }
                        })(), ...stringify.Rules.LESSER ]
                    })
                }
                console.log(`${label}：${value}`)
            }
            connection.close()
        })
    })

program
    .command("get")
    .description(language.getCloudVariableValue)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<variable-name>", language.cloudVariableName)
    .action((variableName: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const variable: KittenCloudVariable = await getCloudVariable(connection, variableName)
            console.log(variable.get())
            connection.close()
        })
    })

program
    .command("set")
    .description(language.setCloudVariableValue)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<variable-name>", language.cloudVariableName)
    .argument("<value>")
    .action((variableName: string, value: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const variable: KittenCloudVariable = await getCloudVariable(connection, variableName)
            await variable.set(processInputValue(value))
            connection.close()
        })
    })

const rankCommand: Command = program
    .command("rank")
    .description(language.getPrivateCloudVariableRankingList)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<variable-name>", language.privateCloudVariableName)
    .option("-l, --limit [limit]", language.rankingListLimit, (value: string): number => {
        return parseInt(value)
    }, 31)
    .option("-o, --order [order]", language.rankingListOrder, (value: string): number => {
        switch (value.toLowerCase()) {
            case "positive":
                return 1
            case "reverse":
                return -1
            default:
                throw new Error(`顺序必须为 positive 或 reverse，得到 ${value}`)
        }
    }, -1)
    .action((variableName: string): void => {
        tryRun(async (): Promise<void> => {
            const { limit, order } = rankCommand.opts<{
                limit: number
                order: number
            }>()
            const connection: KittenCloudFunction = await connect()
            const variable: KittenCloudPrivateVariable = await connection.privateVariable.get(variableName)
            let count: number = 0
            for (const item of await variable.getRankingList(limit, order)) {
                console.log(`${++count} ${item.value} ${await item.user.info.nickname}(${await item.user.info.id})`)
            }
            connection.close()
        })
    })

program
    .command("all")
    .description(language.getCloudListAllItems)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .action((listName: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            console.log(JSON.stringify(list.copy(), undefined, 4))
            connection.close()
        })
    })

program
    .command("item")
    .description(language.getCloudListItem)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .argument("<index>", language.zeroBasedIndex)
    .action((listName: string, index: number): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            console.log(list.get(index))
            connection.close()
        })
    })

program
    .command("length")
    .description(language.cloudListLength)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .action((listName: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            console.log(list.length)
            connection.close()
        })
    })

program
    .command("index-of")
    .description(language.cloudListIndexOf)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .argument("<value>")
    .action((listName: string, value: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            console.log(list.indexOf(processInputValue(value)))
            connection.close()
        })
    })

program
    .command("includes")
    .description(language.cloudListIncludes)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .argument("<value>")
    .action((listName: string, value: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            console.log(list.includes(processInputValue(value)))
            connection.close()
        })
    })

program
    .command("push")
    .description(language.cloudListPush)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .argument("<value>")
    .action((listName: string, value: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            await list.push(processInputValue(value))
            connection.close()
        })
    })

program
    .command("unshift")
    .description(language.cloudListUnshift)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .argument("<value>")
    .action((listName: string, value: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            await list.unshift(processInputValue(value))
            connection.close()
        })
    })

program
    .command("add")
    .description(language.cloudListAdd)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .argument("<index>", language.zeroBasedIndex, parseInt)
    .argument("<value>")
    .action((listName: string, index: number, value: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            await list.add(index, processInputValue(value))
            connection.close()
        })
    })

program
    .command("pop")
    .description(language.cloudListPush)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .action((listName: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            await list.pop()
            connection.close()
        })
    })

program
    .command("remove")
    .description(language.cloudListRemove)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .argument("<index>", language.zeroBasedIndex, parseInt)
    .action((listName: string, index: number): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            await list.remove(index)
            connection.close()
        })
    })

program
    .command("empty")
    .description(language.cloudListEmpty)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .action((listName: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            await list.empty()
            connection.close()
        })
    })

program
    .command("replaceLast")
    .description(language.cloudListEmpty)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .argument("<value>")
    .action((listName: string, value: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            await list.replaceLast(processInputValue(value))
            connection.close()
        })
    })

program
    .command("replace")
    .description(language.cloudListReplace)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .argument("<list-name>", language.cloudListName)
    .argument("<index>", language.zeroBasedIndex, parseInt)
    .argument("<value>")
    .action((listName: string, index: number, value: string): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const list: KittenCloudList = await connection.list.get(listName)
            await list.replace(index, processInputValue(value))
            connection.close()
        })
    })

function separateNumber(str: string): string[] {
    const result: string[] = []
    let lastIsNumber: boolean | None = None
    let last: string = ""
    for (const char of str) {
        const isNumber: boolean = "0123456789.-".includes(char)
        if (lastIsNumber != None && (!isNumber || !lastIsNumber)) {
            result.push(last)
            last = ""
        }
        last += char
        lastIsNumber = isNumber
    }
    result.push(last)
    return result
}

function getDiff(oldStr: string, newStr: string): Change[] {
    return diffArrays(separateNumber(oldStr), separateNumber(newStr))
        .map((change: ArrayChange<string>): Change => ({
            count: change.count,
            value: change.value.join(""),
            added: change.added ?? false,
            removed: change.removed ?? false
        }))
}

function diffLog(
    originalValue: string,
    newValue: string,
    showDiff: boolean,
    showOriginalValue: boolean
): void {
    if (showDiff) {
        const diff: Change[] = getDiff(String(originalValue), String(newValue))
        if (showOriginalValue) {
            console.log("  - " + diff.map((value: Change): string => {
                if (value.added) {
                    return ""
                } else if (value.removed) {
                    return chalk.bgRed(value.value)
                } else {
                    return value.value
                }
            }).join(""))
            console.log("  + " + diff.map((value: Change): string => {
                if (value.added) {
                    return chalk.bgGreen(value.value)
                } else if (value.removed) {
                    return ""
                } else {
                    return value.value
                }
            }).join(""))
        } else {
            console.log("    " + diff.map((value: Change): string => {
                if (value.added) {
                    return chalk.bgGreen(value.value)
                } else if (value.removed) {
                    return chalk.bgRed(value.value)
                } else {
                    return value.value
                }
            }).join(""))
        }
    } else {
        if (showOriginalValue) {
            console.log(`    ${originalValue} => ${newValue}`)
        } else {
            console.log(`    ${newValue}`)
        }
    }
}

const watchCommand: Command = program
    .command("watch")
    .description(language.watchCloudDataAndOnlineUserNumberChange)
    .helpOption("-h, --help", language.displayCommandsHelp)
    .option("-u, --no-watch-online-user-number", language.noWatchOnlineUserNumberChange)
    .option("-t, --test <reg-exp>", language.testDataByRegExpMatchName)
    .option("-o, --show-original-value", language.showOriginalValue)
    .option("-d, --show-diff", language.showDiff)
    .action((): void => {
        tryRun(async (): Promise<void> => {
            const connection: KittenCloudFunction = await connect()
            const {
                watchOnlineUserNumber, test, showOriginalValue, showDiff
            } = watchCommand.opts<{
                watchOnlineUserNumber: boolean
                test: string | None
                showOriginalValue: boolean
                showDiff: boolean
            }>()
            if (watchOnlineUserNumber) {
                (await connection.onlineUserNumber).changed.connect((
                        { originalNumber, newNumber }: KittenCloudOnlineUserNumberChangObject
                    ): void => {
                        if (showOriginalValue) {
                            if (showDiff) {
                                if (newNumber >= originalNumber) {
                                    console.log(`在线用户数改变：${originalNumber} => ${newNumber} ${chalk.bgGreen(`(+${newNumber - originalNumber})`)}`)
                                } else {
                                    console.log(`在线用户数改变：${originalNumber} => ${newNumber} ${chalk.bgRed(`(${newNumber - originalNumber})`)}`)
                                }
                            } else {
                                console.log(`在线用户数改变：${originalNumber} => ${newNumber}`)
                            }
                        } else {
                            console.log(`在线用户数改变：${originalNumber}`)
                        }
                    }
                )
            }
            let dataArray: KittenCloudData[] = await connection.getAll()
            dataArray = dataArray.filter((data: KittenCloudData): boolean => !(data instanceof KittenCloudPrivateVariable))
            if (test != None) {
                const testRegExp = new RegExp(test)
                dataArray = dataArray.filter((data: KittenCloudData): boolean => testRegExp.test(data.name))
            }
            for (const data of dataArray) {
                if (data instanceof KittenCloudPublicVariable) {
                    data.changed.connect((
                            { originalValue, newValue }: KittenCloudVariableChangeMessageObject
                        ): void => {
                            console.log(`云变量 ${chalk.green(data.name)} 改变：`)
                            diffLog(String(originalValue), String(newValue), showDiff, showOriginalValue)
                        }
                    )
                } else if (data instanceof KittenCloudList) {
                    data.pushed.connect((
                        { item }: KittenCloudListPushMessageObject
                    ): void => {
                        console.log(`云列表 ${chalk.green(data.name)} 添加尾项：`)
                        if (showDiff) {
                            console.log("  + " + chalk.bgGreen(item))
                        } else {
                            console.log("  " + item)
                        }
                    })
                    data.unshifted.connect((
                        { item }: KittenCloudListUnshiftMessageObject
                    ): void => {
                        console.log(`云列表 ${chalk.green(data.name)} 添加首项：`)
                        if (showDiff) {
                            console.log("  + " + chalk.bgGreen(item))
                        } else {
                            console.log("  " + item)
                        }
                    })
                    data.added.connect((
                        { index, item }: KittenCloudListAddMessageObject
                    ): void => {
                        console.log(`云列表 ${chalk.green(data.name)} 添加到第 ${index + 1} 项：`)
                        if (showDiff) {
                            console.log("  + " + chalk.bgGreen(item))
                        } else {
                            console.log("  " + item)
                        }
                    })
                    data.popped.connect((
                        { item }: KittenCloudListPopMessageObject
                    ): void => {
                        if (showOriginalValue || showDiff) {
                            console.log(`云列表 ${chalk.green(data.name)} 删除最后一项：`)
                            if (showDiff) {
                                console.log("  - " + chalk.bgRed(item))
                            } else {
                                console.log("  " + item)
                            }
                        } else {
                            console.log(`云列表 ${chalk.green(data.name)} 删除最后一项`)
                        }
                    })
                    data.removed.connect((
                        { index, item }: KittenCloudListRemoveMessageObject
                    ): void => {
                        if (showOriginalValue || showDiff) {
                            console.log(`云列表 ${chalk.green(data.name)} 删除第 ${index + 1} 项：`)
                            if (showDiff) {
                                console.log("  - " + chalk.bgRed(item))
                            } else {
                                console.log("  " + item)
                            }
                        } else {
                            console.log(`云列表 ${chalk.green(data.name)} 删除第 ${index + 1} 项`)
                        }
                    })
                    data.emptied.connect((
                        { list }: KittenCloudListEmptyMessageObject
                    ): void => {
                        if (showOriginalValue || showDiff) {
                            console.log(`云列表 ${chalk.green(data.name)} 清空：`)
                            if (showDiff) {
                                console.log(list.map((item: KittenCloudListItemValue): string =>
                                    ("  - " + chalk.bgRed(item)))
                                )
                            } else {
                                console.log(JSON.stringify(list, undefined, 2)
                                    .split("\n")
                                    .map((line: string): string => ("  " + line))
                                )
                            }
                        } else {
                            console.log(`云列表 ${chalk.green(data.name)} 清空`)
                        }
                    })
                    data.replacedLast.connect((
                        { originalItem, newItem }: KittenCloudListReplaceLastMessageObject
                    ): void => {
                        console.log(`云列表 ${chalk.green(data.name)} 替换最后一项`)
                        diffLog(String(originalItem), String(newItem), showDiff, showOriginalValue)
                    })
                    data.replaced.connect((
                        { index, originalItem, newItem }: KittenCloudListReplaceMessageObject
                    ): void => {
                        console.log(`云列表 ${chalk.green(data.name)} 替换第 ${index + 1} 项`)
                        diffLog(String(originalItem), String(newItem), showDiff, showOriginalValue)
                    })
                } else {
                    throw new Error("未知的云数据类型")
                }
            }
            console.log(language.watchStarted)
            if (watchOnlineUserNumber) {
                console.log("监视在线用户数变化")
            }
            console.log("监视云数据：" + dataArray.map((data: KittenCloudData): string =>
                chalk.green(data.name)).join("，")
            )
            process.on("SIGINT", (): void => {
                connection.close()
            })
        })
    })

program.parse(process.argv)
