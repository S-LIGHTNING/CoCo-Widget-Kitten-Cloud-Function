import { None } from "../../../../utils/other"
import { KittenCloudList, KittenCloudListItemValue } from "../../kitten-cloud-list"
import { KittenCloudDataUpdateSource } from "../kitten-cloud-data-update-source"
import { KittenCloudListUpdateCommand } from "./kitten-cloud-list-update-command"

export class KittenCloudListEmptyCommand extends KittenCloudListUpdateCommand {

    private backup: KittenCloudListItemValue[] | None = None

    public constructor(
        source: KittenCloudDataUpdateSource,
        public list: KittenCloudList
    ) {
        super(source, list)
    }

    public override execute(this: this): void {
        if (this.backup != None) {
            throw new Error("无法执行命令：命令已被执行，不能重复执行")
        }
        this.backup = this.list.value
        this.list.value = []
        this.list.emptied.emit({
            source: this.source,
            list: this.backup.slice()
        })
    }

    public override revoke(this: this): void {
        if (this.backup == None) {
            throw new Error("无法撤销命令：命令尚未执行")
        }
        this.list.value = this.backup
        this.list.replacedAll.emit({
            source: KittenCloudDataUpdateSource.REVOKE,
            originalList: [],
            newList: this.backup.slice()
        })
        this.backup = None
    }

    public override isEffective(this: this): boolean {
        return true
    }

    public override isLegal(this: this): boolean {
        return true
    }

    public override toJSON(this: this): object {
        return {
            method: "empty"
        }
    }

    public override toCloudJSON(this: this): object {
        return {
            action: "delete",
            cvid: this.list.cvid,
            nth: "all"
        }
    }

    public override toString(this: this): string {
        return `清空云列表 ${this.data.name} `
    }
}
