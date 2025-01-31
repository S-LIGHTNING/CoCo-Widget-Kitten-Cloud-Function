import { RevocableCommandGroup } from "../../../../utils/command/revocable-command-group"
import { None } from "../../../../utils/other"
import { KittenCloudDataUpdateCommand } from "./kitten-cloud-data-update-command"

export class KittenCloudDataUpdateCommandGroup
    extends RevocableCommandGroup<KittenCloudDataUpdateCommand> {

    public removeFrontIneffective(this: this): number {
        let count: number = 0
        let firstCommand: KittenCloudDataUpdateCommand | None
        while ((firstCommand = this.first()) != None) {
            if (firstCommand.isEffective()) {
                break
            } else {
                this.shift()
                count++
            }
        }
        return count
    }

    public removeBackIneffective(this: this): number {
        let count: number = 0
        let lastCommand: KittenCloudDataUpdateCommand | None
        while ((lastCommand = this.last()) != None) {
            if (lastCommand.isEffective()) {
                break
            } else {
                this.pop()
                count++
            }
        }
        return count
    }

    public toCloudJSON(this: this): object[] {
        const result: object[] = []
        for (const command of this.commandArray) {
            if (command.isLegal()) {
                result.push(command.toCloudJSON())
            }
        }
        return result
    }

    public toCloudString(this: this): string {
        return JSON.stringify(this.toCloudJSON())
    }
}
