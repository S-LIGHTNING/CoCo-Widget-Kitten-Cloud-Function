import { None } from "../../../../utils/other"
import { KittenCloudList, KittenCloudListItemValue } from "../../kitten-cloud-list"
import { KittenCloudDataUpdateSource } from "../kitten-cloud-data-update-source"
import { KittenCloudListUpdateCommand } from "./kitten-cloud-list-update-command"

export class KittenCloudListPushCommand extends KittenCloudListUpdateCommand {

    private effective: boolean | None = None

    public constructor(
        source: KittenCloudDataUpdateSource,
        public list: KittenCloudList,
        public value: KittenCloudListItemValue
    ) {
        super(source, list)
    }

    public override execute(this: this): void {
        if (this.effective != None) {
            throw new Error("无法执行命令：命令已被执行，不能重复执行")
        }
        this.effective = this.list.length < this.list.listLengthLimit.value
        if (this.effective) {
            this.list.value.push(this.value)
            this.list.pushed.emit({
                source: this.source,
                item: this.value
            })
        }
    }

    public override revoke(this: this): void {
        if (this.effective == None) {
            throw new Error("无法撤销命令：命令尚未执行")
        }
        if (this.effective) {
            this.list.value.pop()
            this.list.popped.emit({
                source: KittenCloudDataUpdateSource.REVOKE,
                item: this.value
            })
        }
        this.effective = None
    }

    public override isEffective(this: this): boolean {
        return this.effective == None ? this.list.length < this.list.listLengthLimit.value : this.effective
    }

    public override isLegal(this: this): boolean {
        return true
    }

    public override toJSON(this: this): object {
        return {
            method: "push",
            value: this.value
        }
    }

    public override toCloudJSON(this: this): object {
        return {
            action: "append",
            cvid: this.list.cvid,
            value: this.value
        }
    }

    public override toString(): string {
        return `添加 ${JSON.stringify(this.value)} 到云列表 ${this.data.name} 末项`
    }
}
