import { KittenCloudFunction } from "../../../kitten-cloud-function"
import { None } from "../../../utils/other"
import { KittenCloudSendMessageType } from "../../network/kitten-cloud-send-message-type"
import { KittenCloudList, KittenCloudListItemValue } from "../kitten-cloud-list"
import { KittenCloudDataUpdateCommandGroup } from "../update/command/kitten-cloud-data-update-command-group"
import { KittenCloudListAddCommand } from "../update/command/kitten-cloud-list-add-command"
import { KittenCloudListEmptyCommand } from "../update/command/kitten-cloud-list-empty-command"
import { KittenCloudListPopCommand } from "../update/command/kitten-cloud-list-pop-command"
import { KittenCloudListPushCommand } from "../update/command/kitten-cloud-list-push-command"
import { KittenCloudListRemoveCommand } from "../update/command/kitten-cloud-list-remove-command"
import { KittenCloudListReplaceCommand } from "../update/command/kitten-cloud-list-replace-command"
import { KittenCloudListReplaceLastCommand } from "../update/command/kitten-cloud-list-replace-last-command"
import { KittenCloudListUnshiftCommand } from "../update/command/kitten-cloud-list-unshift-command"
import { KittenCloudDataUpdateSource } from "../update/kitten-cloud-data-update-source"
import { KittenCloudDataGroup } from "./kitten-cloud-data-group"

/**
 * 云列表组。
 */
export class KittenCloudListGroup extends KittenCloudDataGroup<KittenCloudList> {

    protected override dataTypeName: string = "云列表"
    protected override dataUpdateSendMessageType: KittenCloudSendMessageType = KittenCloudSendMessageType.UPDATE_LIST


    public constructor(connection: KittenCloudFunction) {
        super(connection, {
            localPreupdate: false
        })
    }

    protected override createData(this: this, cvid: string, name: string, value: KittenCloudListItemValue[]): KittenCloudList {
        return new KittenCloudList(this.connection, this, cvid, name, value)
    }

    public override toCloudUploadMessage(this: this, message: Record<string, KittenCloudDataUpdateCommandGroup>): unknown {
        const newMessage: Record<string, unknown> = {}
        for (const cvid in message) {
            if (message[cvid]?.isEmpty()) {
                continue
            }
            newMessage[cvid] = message[cvid]?.toCloudJSON()
        }
        return newMessage
    }

    public override toUploadMessage(this: this, message: unknown): Record<string, KittenCloudDataUpdateCommandGroup> {
        if (message == None) {
            throw new Error("更新数据为空")
        }
        if (!(typeof message == "object")) {
            throw new Error(`无法识别更新数据格式：${message}`)
        }
        const result: Record<string, KittenCloudDataUpdateCommandGroup> = {}
        const errorArray: Error[] = []
        for (const cvid in message) {
            const data: KittenCloudList | None = this.dataRecord[cvid]
            if (data == None) {
                errorArray.push(new Error(`未找到数据：${cvid}`))
                continue
            }
            const item: unknown = (message as Record<string, unknown>)[cvid]
            result[cvid] = new KittenCloudDataUpdateCommandGroup()
            if (item == None) {
                errorArray.push(new Error("更新数据为空"))
            } else if (!Array.isArray(item)) {
                errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(item)}`))
            } else {
                for (const singleMessage of item) {
                    if (singleMessage == None) {
                        errorArray.push(new Error("更新数据为空"))
                    } else if (!(
                        typeof singleMessage == "object" &&
                        "action" in singleMessage && typeof singleMessage.action == "string"
                    )) {
                        errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(singleMessage)}`))
                    } else {
                        switch (singleMessage.action) {
                            case "append":
                                if ("value" in singleMessage &&
                                    (
                                        typeof singleMessage.value == "number" ||
                                        typeof singleMessage.value == "string"
                                    )
                                ) {
                                    result[cvid].add(new KittenCloudListPushCommand(
                                        KittenCloudDataUpdateSource.CLOUD, data, singleMessage.value
                                    ))
                                } else {
                                    errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(singleMessage)}`))
                                }
                                break
                            case "unshift":
                                if ("value" in singleMessage &&
                                    (
                                        typeof singleMessage.value == "number" ||
                                        typeof singleMessage.value == "string"
                                    )
                                ) {
                                    result[cvid].add(new KittenCloudListUnshiftCommand(
                                        KittenCloudDataUpdateSource.CLOUD, data, singleMessage.value
                                    ))
                                } else {
                                    errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(singleMessage)}`))
                                }
                                break
                            case "insert":
                                if (
                                    "nth" in singleMessage && typeof singleMessage.nth == "number" &&
                                    "value" in singleMessage &&
                                    (
                                        typeof singleMessage.value == "number" ||
                                        typeof singleMessage.value == "string"
                                    )
                                ) {
                                    result[cvid].add(new KittenCloudListAddCommand(
                                        KittenCloudDataUpdateSource.CLOUD, data, singleMessage.nth - 1, singleMessage.value
                                    ))
                                } else {
                                    errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(singleMessage)}`))
                                }
                                break
                            case "delete":
                                if (!("nth" in singleMessage)) {
                                    errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(singleMessage)}`))
                                } else if (singleMessage.nth == "last") {
                                    result[cvid].add(new KittenCloudListPopCommand(
                                        KittenCloudDataUpdateSource.CLOUD, data
                                    ))
                                } else if (singleMessage.nth == "all") {
                                     result[cvid].add(new KittenCloudListEmptyCommand(
                                        KittenCloudDataUpdateSource.CLOUD, data
                                    ))
                                } else {
                                    if (typeof singleMessage.nth != "number") {
                                        errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(singleMessage)}`))
                                    }
                                    result[cvid].add(new KittenCloudListRemoveCommand(
                                        KittenCloudDataUpdateSource.CLOUD, data, singleMessage.nth - 1
                                    ))
                                }
                                break
                            case "replace":
                                if (!("nth" in singleMessage)) {
                                    errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(singleMessage)}`))
                                    break
                                }
                                if (!(
                                    "value" in singleMessage &&
                                    (
                                        typeof singleMessage.value == "number" ||
                                        typeof singleMessage.value == "string"
                                    )
                                )) {
                                    errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(singleMessage)}`))
                                    break
                                }
                                if (singleMessage.nth == "last") {
                                    result[cvid].add(new KittenCloudListReplaceLastCommand(
                                        KittenCloudDataUpdateSource.CLOUD, data, singleMessage.value
                                    ))
                                } else {
                                    if (typeof singleMessage.nth != "number") {
                                        errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(singleMessage)}`))
                                        break
                                    }
                                    result[cvid].add(new KittenCloudListReplaceCommand(
                                        KittenCloudDataUpdateSource.CLOUD, data, singleMessage.nth - 1, singleMessage.value
                                    ))
                                }
                                break
                            default:
                                errorArray.push(new Error(`无法识别更新数据格式：${JSON.stringify(singleMessage)}`))
                                break
                        }
                    }
                }
            }
        }
        return result
    }
}
