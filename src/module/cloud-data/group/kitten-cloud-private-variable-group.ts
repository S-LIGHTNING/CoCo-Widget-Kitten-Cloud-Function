import { KittenCloudFunction } from "../../../kitten-cloud-function"
import { None } from "../../../utils/other"
import { KittenCloudSendMessageType } from "../../network/kitten-cloud-send-message-type"
import { KittenCloudPrivateVariable } from "../kitten-cloud-private-variable"
import { KittenCloudVariableValue } from "../kitten-cloud-variable"
import { KittenCloudDataUpdateCommandGroup } from "../update/command/kitten-cloud-data-update-command-group"
import { KittenCloudVariableGroup } from "./kitten-cloud-variable-group"

/**
 * 私有云变量组。
 */
export class KittenCloudPrivateVariableGroup extends KittenCloudVariableGroup<KittenCloudPrivateVariable> {

    private getRankingListArray: KittenCloudPrivateVariable[]

    public constructor(connection: KittenCloudFunction) {
        super(connection, {
            cacheTime: 100,
            uploadIntervalTime: 1500
        })
        this.getRankingListArray = []
    }

    public sendGetRankingList(this: this, variable: KittenCloudPrivateVariable, message: unknown): void {
        this.getRankingListArray.push(variable)
        this.connection.send(KittenCloudSendMessageType.GET_PRIVATE_VARIABLE_RANKING_LIST, message)
    }

    public handleReceiveRankingList(this: this, data: unknown): void {
        const first: KittenCloudPrivateVariable | None = this.getRankingListArray.shift()
        if (first == None) {
            throw new Error("没有请求排行榜，却收到了排行榜响应")
        }
        first.handleReceiveRankingList(data)
    }

    protected override dataTypeName: string = "私有云变量"
    protected override dataUpdateSendMessageType: KittenCloudSendMessageType = KittenCloudSendMessageType.UPDATE_PRIVATE_VARIABLE

    protected override createData(this: this, cvid: string, name: string, value: KittenCloudVariableValue): KittenCloudPrivateVariable {
        return new KittenCloudPrivateVariable(this.connection, this, cvid, name, value)
    }

    public override handleCloudUpdate(this: this, __cloudMessage: unknown): void {
        try {
            const firstUploadCount: number[] | None = this.uploadCount.shift()
            if (firstUploadCount == None) {
                throw new Error("不存在上传数据")
            }
            for (let i: number = 0; i < this.dataArray.length; i++) {
                for (;;) {
                    const count: number | None = firstUploadCount[i]
                    if (count == None || count <= 0) {
                        break
                    }
                    this.dataArray[i]?.updateManager.handleUploadingSuccess()
                    firstUploadCount[i] = count - 1
                }
            }
        } catch (error) {
            this.handleCloudUpdateError()
        }
    }

    public override toUploadMessage(this: this, message: unknown): Record<string, KittenCloudDataUpdateCommandGroup> {
        if (!(
            typeof message == "object" && message != null &&
            "code" in message && "msg" in message
        )) {
            throw new Error(`无法识别更新数据格式：${message}`)
        }
        if (message.code == 1 && message.msg == "ok") {
            return {}
        }
        throw new Error(`私有云变量更新失败：${JSON.stringify(message)}`)
    }
}
