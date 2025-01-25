import { None } from "../../../../utils/other"
import { KittenCloudList, KittenCloudListItemValue } from "../../kitten-cloud-list"
import { KittenCloudDataUpdateSource } from "../kitten-cloud-data-update-source"
import { KittenCloudListUpdateCommand } from "./kitten-cloud-list-update-command"

export class KittenCloudListAddCommand extends KittenCloudListUpdateCommand {

    private effective: boolean | None = None

    public constructor(
        source: KittenCloudDataUpdateSource,
        public list: KittenCloudList,
        public index: number,
        public value: KittenCloudListItemValue
    ) {
        super(source, list)
    }

    public override execute(this: this): void {
        if (this.effective != None) {
            throw new Error("无法执行命令：命令已被执行，不能重复执行")
        }
        this.effective = 0 <= this.index && this.index <= this.list.length
        if (this.effective) {
            this.list.value.splice(this.index, 0, this.value)
            this.effective = true
            this.list.added.emit({
                source: this.source,
                index: this.index,
                item: this.value
            })
        }
    }

    public override revoke(this: this): void {
        if (this.effective == None) {
            throw new Error("无法撤销命令：命令尚未执行")
        }
        if (this.effective) {
            this.list.value.splice(this.index, 1)
            this.list.removed.emit({
                source: KittenCloudDataUpdateSource.REVOKE,
                index: this.index,
                item: this.value
            })
        }
        this.effective = None
    }

    public override isEffective(this: this): boolean {
        return this.effective == None ? 0 <= this.index && this.index <= this.list.length : this.effective
    }

    public override isLegal(this: this): boolean {
        return 0 <= this.index && this.index < this.data.listLengthLimit.value
    }

    public override toJSON(this: this): object {
        return {
            method: "add",
            index: this.index
        }
    }

    public override toCloudJSON(this: this): object {
        return {
            action: "insert",
            cvid: this.list.cvid,
            nth: this.index + 1,
            value: this.value
        }
    }

    public override toString(this: this): string {
        return `添加 ${JSON.stringify(this.value)} 到云列表 ${this.data.name} 第 ${this.index + 1} 项`
    }
}
