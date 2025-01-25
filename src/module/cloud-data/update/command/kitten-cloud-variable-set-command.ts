import { MergableCommand } from "../../../../utils/command/mergable-command"
import { None } from "../../../../utils/other"
import { KittenCloudVariable, KittenCloudVariableValue } from "../../kitten-cloud-variable"
import { KittenCloudDataUpdateSource } from "../kitten-cloud-data-update-source"
import { KittenCloudVariableUpdateCommand } from "./kitten-cloud-variable-update-command"

export abstract class KittenCloudVariableSetCommand
extends KittenCloudVariableUpdateCommand
implements MergableCommand {

    public backup: KittenCloudVariableValue | None = None

    public constructor(
        source: KittenCloudDataUpdateSource,
        variable: KittenCloudVariable,
        public value: KittenCloudVariableValue
    ) {
        super(source, variable)
    }

    public override execute(this: this): void {
        if (this.backup != None) {
            throw new Error(`无法执行命令：命令已被执行，不能重复执行`)
        }
        this.backup = this.variable.value
        this.variable.value = this.value
        this.variable.changed.emit({
            source: this.source,
            originalValue: this.backup,
            newValue: this.value
        })
    }

    public override revoke(this: this): void {
        if (this.backup == None) {
            throw new Error(`无法撤销命令：命令尚未执行`)
        }
        this.variable.value = this.backup
        this.variable.changed.emit({
            source: KittenCloudDataUpdateSource.REVOKE,
            originalValue: this.value,
            newValue: this.backup
        })
        this.backup = None
    }

    public override isEffective(this: this): boolean {
        return this.backup == None ? this.value !== this.variable.value : this.value !== this.backup
    }

    public override toJSON(this: this): object {
        return {
            method: "set",
            value: this.value
        }
    }

    public override isLegal(this: this): boolean {
        return true
    }

    public merge(this: this, that: this): void {
        if ((this.backup == None) != (that.backup == None)) {
            throw new Error("命令执行状态不一致，不能合并")
        }
        this.value = that.value
    }

    public override toString(this: this): string {
        return `设置云变量 ${this.data.name} 的值为 ${JSON.stringify(this.value)} `
    }
}
