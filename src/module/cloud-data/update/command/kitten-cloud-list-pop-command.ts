import { None } from "../../../../utils/other"
import { KittenCloudList, KittenCloudListItemValue } from "../../kitten-cloud-list"
import { KittenCloudDataUpdateSource } from "../kitten-cloud-data-update-source"
import { KittenCloudListUpdateCommand } from "./kitten-cloud-list-update-command"

export class KittenCloudListPopCommand extends KittenCloudListUpdateCommand {

    private effective: boolean | None = None
    private backup: KittenCloudListItemValue = 0

    public constructor(
        source: KittenCloudDataUpdateSource,
        public list: KittenCloudList
    ) {
        super(source, list)
    }

    public override execute(this: this): void {
        if (this.effective != None) {
            throw new Error("无法执行命令：命令已被执行，不能重复执行")
        }
        this.effective = this.list.length > 0
        if (this.effective) {
            this.backup = this.list.value.pop()!
            this.list.popped.emit({
                source: this.source,
                item: this.backup
            })
        }
    }

    public override revoke(this: this): void {
        if (this.effective == None) {
            throw new Error("无法撤销命令：命令尚未执行")
        }
        if (this.effective) {
            this.list.value.push(this.backup)
            this.list.pushed.emit({
                source: KittenCloudDataUpdateSource.REVOKE,
                item: this.backup
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
            method: "pop"
        }
    }

    public override toCloudJSON(this: this): object {
        return {
            action: "delete",
            nth: "last"
        }
    }

    public override toString(this: this): string {
        return `删除云列表 ${this.data.name} 最后一项`
    }
}
