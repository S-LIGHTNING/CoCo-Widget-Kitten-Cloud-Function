import { KittenCloudFunction } from "../../../kitten-cloud-function"
import { ConfigObject } from "../../kitten-cloud-function-config-layer"
import { KittenCloudVariable } from "../kitten-cloud-variable"
import { KittenCloudDataUpdateCommandGroup } from "../update/command/kitten-cloud-data-update-command-group"
import { KittenCloudDataGroup } from "./kitten-cloud-data-group"

export abstract class KittenCloudVariableGroup<DATA_TYPE extends KittenCloudVariable = KittenCloudVariable>
    extends KittenCloudDataGroup<DATA_TYPE> {

    public constructor(connection: KittenCloudFunction, config: ConfigObject = {}) {
        super(connection, config)
    }

    public override toCloudUploadMessage(this: this, message: Record<string, KittenCloudDataUpdateCommandGroup>): unknown {
        const result: object[] = []
        for (const singleDataMessage of Object.values(message)) {
            for (const singleMessage of singleDataMessage.toCloudJSON()) {
                result.push(singleMessage)
            }
        }
        return result
    }
}
