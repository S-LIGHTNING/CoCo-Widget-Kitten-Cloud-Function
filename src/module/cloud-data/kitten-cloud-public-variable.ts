import { KittenCloudPublicVariableGroup } from "./group/kitten-cloud-public-variable-group"
import { KittenCloudVariable, KittenCloudVariableValue } from "./kitten-cloud-variable"
import { KittenCloudDataUpdateSource } from "./update/kitten-cloud-data-update-source"
import { KittenCloudPublicVariableSetCommand } from "./update/command/kitten-cloud-public-variable-set-command"
import { KittenCloudFunction } from "../../kitten-cloud-function"

export type KittenCloudPublicVariableUpdateMessage = {
    cvid: string,
    value: KittenCloudVariableValue
}

/**
 * 公有云变量。
 */
export class KittenCloudPublicVariable extends KittenCloudVariable {

    public constructor(
        connection: KittenCloudFunction,
        public override readonly group: KittenCloudPublicVariableGroup,
        cvid: string,
        name: string,
        value: KittenCloudVariableValue
    ) {
        super(connection, group, cvid, name, value)
    }

    public override update(this: this, value: KittenCloudVariableValue): void {
        value = this.singleValueProcess(value)
        this.updateManager.addUpdateCommand(
            new KittenCloudPublicVariableSetCommand(
                KittenCloudDataUpdateSource.CLOUD, this, value
            )
        )
    }

    /**
     * 设置公有云变量的值。
     *
     * @param value 要设置的值
     */
    public set(this: this, value: KittenCloudVariableValue): void {
        value = this.singleValueProcess(value)
        this.updateManager.addUpdateCommand(
            new KittenCloudPublicVariableSetCommand(
                KittenCloudDataUpdateSource.LOCAL, this, value
            )
        )
    }
}
