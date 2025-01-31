import { None } from "../other"
import { Command } from "./command"

export class CommandGroup<COMMAND_TYPE extends Command = Command> implements Command {

    public constructor(protected commandArray: COMMAND_TYPE[] = []) {}

    public execute(this: this): void {
        for (const command of this.commandArray) {
            command.execute()
        }
    }

    public get(this: this, index: number): COMMAND_TYPE | None {
        return this.commandArray[index]
    }

    get length(): number {
        return this.commandArray.length
    }

    public add(this: this, command: COMMAND_TYPE): void {
        const lastCommand: COMMAND_TYPE | None = this.commandArray.slice(-1)[0]
        if (lastCommand != None && "merge" in lastCommand && typeof lastCommand.merge == "function") {
            try {
                lastCommand.merge(command)
            } catch (error) {
                this.commandArray.push(command)
            }
        } else {
            this.commandArray.push(command)
        }
    }

    public addAll(this: this, commands: CommandGroup<COMMAND_TYPE> | COMMAND_TYPE[]): void {
        if (commands instanceof CommandGroup) {
            commands = commands.commandArray
        }
        for (const command of commands) {
            this.add(command)
        }
    }

    public isEmpty(this: this): boolean {
        return this.commandArray.length == 0
    }

    public first(this: this): COMMAND_TYPE | None {
        return this.commandArray[0]
    }

    public last(this: this): COMMAND_TYPE | None {
        return this.commandArray.slice(-1)[0]
    }

    public shift(this: this): COMMAND_TYPE | None {
        return this.commandArray.shift()
    }

    public pop(this: this): COMMAND_TYPE | None {
        return this.commandArray.pop()
    }

    public [Symbol.iterator](this: this): Iterator<COMMAND_TYPE> {
        return this.commandArray[Symbol.iterator]()
    }
}
