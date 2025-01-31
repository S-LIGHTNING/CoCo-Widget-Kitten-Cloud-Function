import { None } from "../../../../utils/other"
import { KittenCloudList, KittenCloudListItemValue } from "../../kitten-cloud-list"
import { KittenCloudDataUpdateSource } from "../kitten-cloud-data-update-source"
import { KittenCloudListUpdateCommand } from "./kitten-cloud-list-update-command"

export class KittenCloudListUnshiftCommand extends KittenCloudListUpdateCommand {

    private overflow: boolean | None = None
    private overflowValue: KittenCloudListItemValue = 0

    public constructor(
        source: KittenCloudDataUpdateSource,
        public list: KittenCloudList,
        public value: KittenCloudListItemValue
    ) {
        super(source, list)
    }

    public override execute(this: this): void {
        if (this.overflow != None) {
            throw new Error("无法执行命令：命令已被执行，不能重复执行")
        }
        this.list.value.unshift(this.value)
        this.overflow = this.list.length > this.list.listLengthLimit.value
        if (this.overflow) {
            this.overflowValue = this.list.value.pop()!
        }
        this.list.unshifted.emit({
            source: this.source,
            item: this.value
        })
    }

    public override revoke(this: this): void {
        if (this.overflow == None) {
            throw new Error("无法撤销命令：命令尚未执行")
        }
        this.list.value.shift()
        this.overflow = None
        this.list.removed.emit({
            source: KittenCloudDataUpdateSource.REVOKE,
            index: 0,
            item: this.overflowValue
        })
        if (this.overflow) {
            this.list.value.push(this.overflowValue)
            this.list.pushed.emit({
                source: KittenCloudDataUpdateSource.REVOKE,
                item: this.overflowValue
            })
        }
    }

    public override isEffective(this: this): boolean {
        return true
    }

    public override isLegal(this: this): boolean {
        return true
    }

    public override toJSON(this: this): object {
        return {
            method: "unshift",
            value: this.value
        }
    }

    public override toCloudJSON(this: this): object {
        return {
            action: "unshift",
            cvid: this.list.cvid,
            value: this.value
        }
    }

    public override toString(this: this): string {
        return `添加 ${JSON.stringify(this.value)} 到云列表 ${this.data.name} 首项`
    }
}
