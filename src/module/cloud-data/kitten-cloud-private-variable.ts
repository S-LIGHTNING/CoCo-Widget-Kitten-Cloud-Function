import { KittenCloudPrivateVariableGroup } from "./group/kitten-cloud-private-variable-group"
import { KittenCloudVariable, KittenCloudVariableValue } from "./kitten-cloud-variable"
import { KittenCloudDataUpdateSource } from "./update/kitten-cloud-data-update-source"
import { KittenCloudPrivateVariableSetCommand } from "./update/command/kitten-cloud-private-variable-set-command"
import { KittenCloudFunction } from "../../kitten-cloud-function"
import { CodemaoUser } from "../../codemao/user/codemao-user"
import { None } from "../../utils/other"

export type KittenCloudPrivateVariableUpdateMessageObject = {
    cvid: string,
    value: KittenCloudVariableValue
}

export type KittenCloudPrivateVariableRankingListItemObject = {
    value: number,
    user: CodemaoUser
}

/**
 * 私有云变量。
 */
export class KittenCloudPrivateVariable extends KittenCloudVariable {

    private getRankingListResolveArray: ((value: KittenCloudPrivateVariableRankingListItemObject[] | PromiseLike<KittenCloudPrivateVariableRankingListItemObject[]>) => void)[]
    private getRankingListRejectArray: ((reason?: any) => void)[]

    public constructor(
        connection: KittenCloudFunction,
        public override readonly group: KittenCloudPrivateVariableGroup,
        cvid: string,
        name: string,
        value: KittenCloudVariableValue
    ) {
        super(connection, group, cvid, name, value)
        this.getRankingListResolveArray = []
        this.getRankingListRejectArray = []
    }

    public override update(this: this, value: KittenCloudVariableValue): void {
        this.updateManager.addUpdateCommand(
            new KittenCloudPrivateVariableSetCommand(
                KittenCloudDataUpdateSource.CLOUD, this, value
            )
        )
    }

    /**
     * 设置私有云变量的值。
     *
     * @param value 要设置的值
     */
    public set(this: this, value: KittenCloudVariableValue): Promise<void> {
        value = this.singleValueProcess(value)
        const command = new KittenCloudPrivateVariableSetCommand(
            KittenCloudDataUpdateSource.LOCAL, this, value
        )
        this.updateManager.addUpdateCommand(command)
        command.promise.catch((error: Error): void => {
            this.connection.errored.emit(error)
        })
        return command.promise
    }

    /**
     * 获取排名列表。
     *
     * @param limit 限制数量，列表的长度不超过限制数量
     * @param order 排名顺序，1 为顺序，-1 为逆序
     * @returns 排名列表
     */
    public getRankingList(
        this: this, limit: number, order: number
    ): Promise<KittenCloudPrivateVariableRankingListItemObject[]> {
        if (!Number.isInteger(limit)) {
            throw new Error(`限制必须为整数，得到${limit}`)
        }
        if (limit <= 0) {
            throw new Error(`限制必须大于 0，得到${limit}`)
        }
        if (order != 1 && order != -1) {
            throw new Error("顺序只能为 1（顺序） 或 -1（逆序）")
        }
        this.group.sendGetRankingList(this, {
            cvid: this.cvid,
            limit: limit,
            order_type: order
        })
        return new Promise((resolve, reject) => {
            this.getRankingListResolveArray.push(resolve)
            this.getRankingListRejectArray.push(reject)
        })
    }

    public handleReceiveRankingList(this: this, data: unknown): void {
        const resolve = this.getRankingListResolveArray.shift()!,
            reject = this.getRankingListRejectArray.shift()!
        if (data == None) {
            reject(new Error("收到了空排名数据"))
            return
        }
        if (typeof data != "object") {
            reject(new Error("无法识别的排名数据：" + data))
            return
        }
        if (!(
            "items" in data && Array.isArray(data.items)
        )) {
            reject(new Error("无法识别的排名数据：" + JSON.stringify(data)))
            return
        }
        const list: unknown[] = data.items
        const result: KittenCloudPrivateVariableRankingListItemObject[] = []
        const errorArray: Error[] = []
        for (const item of list) {
            if (item == None) {
                errorArray.push(new Error("排名数据为空"))
            } else if (typeof item != "object") {
                errorArray.push(new Error("无法识别的排名数据：" + item))
            } else if (!(
                "value" in item && typeof item.value == "number" &&
                "nickname" in item && typeof item.nickname == "string" &&
                "avatar_url" in item && typeof item.avatar_url == "string" &&
                "identifier" in item && typeof item.identifier == "string"
            )) {
                errorArray.push(new Error("无法识别的排名数据：" + JSON.stringify(item)))
            } else {
                result.push({
                    value: item.value,
                    user: new CodemaoUser({
                        id: parseInt(item.identifier),
                        nickname: item.nickname,
                        avatarURL: item.avatar_url,
                    })
                })
            }
        }
        resolve(result)
        if (errorArray.length > 0) {
            reject(errorArray)
        }
    }
}
