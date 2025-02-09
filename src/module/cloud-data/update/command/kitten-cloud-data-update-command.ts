import { RevocableCommand } from "../../../../utils/command/revocable-command"
import { None } from "../../../../utils/other"
import { KittenCloudData } from "../../kitten-cloud-data"
import { KittenCloudDataUpdateSource } from "../kitten-cloud-data-update-source"

export abstract class KittenCloudDataUpdateCommand implements RevocableCommand {
    private resolve!: () => void
    private reject!: (reason: Error) => void
    public readonly promise: Promise<void>
    public constructor(
        public readonly source: KittenCloudDataUpdateSource,
        public readonly data: KittenCloudData
    ) {
        this.promise = new Promise((resolve: () => void, reject: (reason: Error) => void): void => {
            this.resolve = resolve
            this.reject = reject
        })
    }
    public abstract execute(this: this): void
    public abstract revoke(this: this): void
    public finish(this: this): void {
        this.resolve()
    }
    public fail(this: this, error: Error): void {
        error.message = `${this.toString()}失败：${error.message}`
        if (error.stack != None) {
            error.stack = `${this.toString()}失败：${error.stack}`
        }
        this.reject(error)
    }
    public abstract isEffective(this: this): boolean
    public abstract isLegal(this: this): boolean
    public abstract toJSON(this: this): object
    public abstract toCloudJSON(this: this): object
    public toCloudString(this: this): string {
        return JSON.stringify(this.toCloudJSON())
    }
    public abstract toString(this: this): string
}
