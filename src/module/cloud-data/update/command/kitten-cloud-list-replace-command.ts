import { None } from "../../../../utils/other"
import { KittenCloudList, KittenCloudListItemValue } from "../../kitten-cloud-list"
import { KittenCloudDataUpdateSource } from "../kitten-cloud-data-update-source"
import { KittenCloudListUpdateCommand } from "./kitten-cloud-list-update-command"

export class KittenCloudListReplaceCommand extends KittenCloudListUpdateCommand {

    private effective: boolean | None = None
    private backup: KittenCloudListItemValue = 0

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
        this.effective = 0 <= this.index && this.index < this.list.length
        if (this.effective) {
            this.backup = this.list.value[this.index]!
            this.list.value[this.index] = this.value
            this.effective = true
            this.list.replaced.emit({
                source: this.source,
                index: this.index,
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
            this.list.value[this.index] = this.backup
            this.list.replaced.emit({
                source: KittenCloudDataUpdateSource.REVOKE,
                index: this.index,
                originalItem: this.value,
                newItem: this.backup
            })
        }
        this.effective = None
    }

    public override isEffective(this: this): boolean {
        return 0 <= this.index && this.index < this.list.length
    }

    public override isLegal(this: this): boolean {
        return 0 <= this.index && this.index < this.data.listLengthLimit.value
    }

    public override toJSON(this: this): object {
        return {
            method: "replace",
            index: this.index,
            value: this.value
        }
    }

    public override toCloudJSON(this: this): object {
        return {
            action: "replace",
            cvid: this.list.cvid,
            nth: this.index + 1,
            value: this.value
        }
    }

    public override toString(): string {
        return `替换云列表 ${this.data.name} 第 ${this.index + 1} 项为 ${JSON.stringify(this.value)} `
    }
}
