import { None } from "../../../../utils/other"
import { KittenCloudList, KittenCloudListItemValue } from "../../kitten-cloud-list"
import { KittenCloudDataUpdateSource } from "../kitten-cloud-data-update-source"
import { KittenCloudListUpdateCommand } from "./kitten-cloud-list-update-command"

export class KittenCloudListReplaceLastCommand extends KittenCloudListUpdateCommand {

    private effective: boolean | None = None
    private backup: KittenCloudListItemValue = 0

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
        this.effective = this.list.length > 0
        if (this.effective) {
            this.backup = this.list.value.splice(-1, 1, this.value)[0]!
            this.list.replacedLast.emit({
                source: this.source,
                originalItem: this.backup,
                newItem: this.value
            })
        }
    }

    public override revoke(this: this): void {
        if (this.effective == None) {
            throw new Error("无法撤销命令：命令尚未执行")
        }
        if (this.effective) {
            this.list.value.splice(-1, 1, this.backup)
            this.list.replacedLast.emit({
                source: KittenCloudDataUpdateSource.REVOKE,
                originalItem: this.value,
                newItem: this.backup
            })
        }
        this.effective = None
    }
    public override isEffective(this: this): boolean {
        return this.effective == None ? this.list.length > 0 : this.effective
    }

    public override isLegal(this: this): boolean {
        return true
    }

    public override toJSON(this: this): object {
        return {
            method: "replaceLast",
            value: this.value
        }
    }

    public override toCloudJSON(this: this): object {
        return {
            action: "replace",
            nth: "last",
            value: this.value
        }
    }

    public override toString(): string {
        return `替换云列表 ${this.data.name} 最后一项为 ${JSON.stringify(this.value)} `
    }
}
