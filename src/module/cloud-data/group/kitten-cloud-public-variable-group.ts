import { None } from "../../../utils/other"
import { KittenCloudSendMessageType } from "../../network/kitten-cloud-send-message-type"
import { KittenCloudPublicVariable } from "../kitten-cloud-public-variable"
import { KittenCloudVariableValue } from "../kitten-cloud-variable"
import { KittenCloudDataUpdateCommandGroup } from "../update/command/kitten-cloud-data-update-command-group"
import { KittenCloudPublicVariableSetCommand } from "../update/command/kitten-cloud-public-variable-set-command"
import { KittenCloudDataUpdateSource } from "../update/kitten-cloud-data-update-source"
import { KittenCloudVariableGroup } from "./kitten-cloud-variable-group"

/**
 * 公有云变量组。
 */
export class KittenCloudPublicVariableGroup extends KittenCloudVariableGroup<KittenCloudPublicVariable> {

    protected override dataTypeName: string = "公有云变量"
    protected override dataUpdateSendMessageType: KittenCloudSendMessageType = KittenCloudSendMessageType.UPDATE_PUBLIC_VARIABLE

    protected override createData(
        cvid: string, name: string, value: KittenCloudVariableValue
    ): KittenCloudPublicVariable {
        return new KittenCloudPublicVariable(this.connection, this, cvid, name, value)
    }

    public override toUploadMessage(this: this, message: unknown): Record<string, KittenCloudDataUpdateCommandGroup> {
        if (message == "fail") {
            throw new Error("更新失败")
        }
        if (!Array.isArray(message)) {
            throw new Error(`无法识别更新数据格式：${message}`)
        }
        const errorArray: Error[] = []
        const result: Record<string, KittenCloudDataUpdateCommandGroup> = {}
        for (const singleMessage of message) {
            if (typeof singleMessage != "object") {
                errorArray.push(new Error(`无法识别更新数据格式：${message}`))
                continue
            }
            const data: KittenCloudPublicVariable | None = this.dataRecord[singleMessage.cvid]
            if (data == None) {
                errorArray.push(new Error(`找不到 cvid 为 ${singleMessage.cvid} 的公有云变量`))
                continue
            }
            result[singleMessage.cvid] = new KittenCloudDataUpdateCommandGroup([
                new KittenCloudPublicVariableSetCommand(
                    KittenCloudDataUpdateSource.CLOUD,
                    data,
                    singleMessage.value
                )
            ])
        }
        if (errorArray.length != 0) {
            Object.assign(errorArray, {
                message: result
            })
            throw errorArray
        }
        return result
    }
}
