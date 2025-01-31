import { RevocableCommand } from "../../../../utils/command/revocable-command"
import { KittenCloudData } from "../../kitten-cloud-data"
import { KittenCloudDataUpdateSource } from "../kitten-cloud-data-update-source"

export abstract class KittenCloudDataUpdateCommand implements RevocableCommand {
    public constructor(
        public readonly source: KittenCloudDataUpdateSource,
        public readonly data: KittenCloudData
    ) {}
    public abstract execute(this: this): void
    public abstract revoke(this: this): void
    public abstract isEffective(this: this): boolean
    public abstract isLegal(this: this): boolean
    public abstract toJSON(this: this): object
    public abstract toCloudJSON(this: this): object
    public toCloudString(this: this): string {
        return JSON.stringify(this.toCloudJSON())
    }
    public abstract toString(this: this): string
}
