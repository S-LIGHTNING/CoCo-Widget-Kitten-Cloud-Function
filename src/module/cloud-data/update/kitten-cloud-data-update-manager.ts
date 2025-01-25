import { Signal } from "../../../utils/signal"
import { ConfigChange } from "../../../utils/single-config"
import { KittenCloudLocalPreupdate } from "../../kitten-cloud-function-config-layer"
import { KittenCloudData } from "../kitten-cloud-data"
import { KittenCloudDataUpdateSource } from "./kitten-cloud-data-update-source"
import { KittenCloudDataUpdateCommand } from "./command/kitten-cloud-data-update-command"
import { KittenCloudDataUpdateCommandGroup } from "./command/kitten-cloud-data-update-command-group"
import { equal, None } from "../../../utils/other"
import { KittenCloudFunction } from "../../../kitten-cloud-function"

function configValueToNumber(value: number | boolean): number {
    if (typeof value == "boolean") {
        return 0
    }
    return value
}

export class KittenCloudDataUpdateManager {

    private unuploadedUpdateCommand: KittenCloudDataUpdateCommandGroup
    private uploadingUpdateCommand: KittenCloudDataUpdateCommandGroup

    private firstUnuploadedUpdateTime: number = 0
    private lastUploadTime: number = 0
    private uploadHandle: NodeJS.Timeout | None = None

    private pauseUpdate: boolean = false
    private pausedUpdateCommandArray: KittenCloudDataUpdateCommand[]

    public readonly neededToUpload: Signal<void>

    public constructor(
        public readonly connection: KittenCloudFunction,
        public readonly data: KittenCloudData
    ) {
        this.unuploadedUpdateCommand = new KittenCloudDataUpdateCommandGroup()
        this.uploadingUpdateCommand = new KittenCloudDataUpdateCommandGroup()
        this.neededToUpload = new Signal()
        this.data.cacheTime.changed.connect((): void => {
            this.setUploadHandle()
        })
        this.data.uploadIntervalTime.changed.connect((): void => {
            this.setUploadHandle()
        })
        this.data.localPreupdate.changed.connect(
            ({ newValue: LocalPreupdate }: ConfigChange<KittenCloudLocalPreupdate>): void => {
                this.withPauseUpdate((): void => {
                    if (LocalPreupdate) {
                        this.unuploadedUpdateCommand.execute()
                    } else {
                        this.unuploadedUpdateCommand.revoke()
                    }
                })
            }
        )
        this.pausedUpdateCommandArray = []
        this.connection.opened.connect((): void => {
            this.setUploadHandle()
        })
        this.connection.disconnected.connect((): void => {
            if (this.uploadHandle != None) {
                clearTimeout(this.uploadHandle)
                this.uploadHandle = None
            }
            this.uploadingUpdateCommand = new KittenCloudDataUpdateCommandGroup()
        })
    }

    private withPauseUpdate(this:this, func: () => void): void {
        this.pauseUpdate = true
        func()
        this.pauseUpdate = false
        for (let command of this.pausedUpdateCommandArray) {
            this.handleNewUpdateCommand(command)
        }
        this.pausedUpdateCommandArray = []
    }

    public addUpdateCommand(this:this, command: KittenCloudDataUpdateCommand): void {
        if (this.pauseUpdate) {
            this.pausedUpdateCommandArray.push(command)
            return
        }
        this.handleNewUpdateCommand(command)
    }

    public handleUploadingSuccess(this: this): void {
        const firstUpdateCommand: KittenCloudDataUpdateCommand | None = this.uploadingUpdateCommand.shift()
        if (firstUpdateCommand != None && !this.data.localPreupdate.value) {
            firstUpdateCommand.execute()
        }
    }

    public handleUploadingError(this: this): void {
        const firstUpdateCommand: KittenCloudDataUpdateCommand | None = this.uploadingUpdateCommand.shift()
        if (firstUpdateCommand != None && this.data.localPreupdate.value) {
            firstUpdateCommand.revoke()
        }
    }

    private handleNewUpdateCommand(this: this, command: KittenCloudDataUpdateCommand): void {
        this.withPauseUpdate((): void => {
            switch (command.source) {
                case KittenCloudDataUpdateSource.LOCAL:
                    if (!command.isLegal()) {
                        return
                    }
                    if (this.data.localPreupdate.value) {
                        if (!command.isEffective()) {
                            return
                        }
                        command.execute()
                    }
                    this.unuploadedUpdateCommand.add(command)
                    if (this.data.localPreupdate.value) {
                        this.unuploadedUpdateCommand.removeBackIneffective()
                    }
                    if (this.firstUnuploadedUpdateTime == 0) {
                        this.firstUnuploadedUpdateTime = Date.now()
                        this.setUploadHandle()
                    }
                    if (this.unuploadedUpdateCommand.isEmpty() && this.firstUnuploadedUpdateTime != 0) {
                        this.firstUnuploadedUpdateTime = 0
                        if (this.uploadHandle != None) {
                            clearTimeout(this.uploadHandle)
                        }
                    }
                    break
                case KittenCloudDataUpdateSource.CLOUD:
                    const firstUploadingCommand: KittenCloudDataUpdateCommand | None = this.uploadingUpdateCommand.first()
                    if (firstUploadingCommand == None) {
                        command.execute()
                    } else if (equal(command.toJSON(), firstUploadingCommand.toJSON())) {
                        this.uploadingUpdateCommand.shift()
                        if (!this.data.localPreupdate.value) {
                            firstUploadingCommand.execute()
                            this.uploadingUpdateCommand.removeFrontIneffective()
                        }
                    } else {
                        if (this.data.localPreupdate.value) {
                            this.unuploadedUpdateCommand.revoke()
                            this.uploadingUpdateCommand.revoke()
                            command.execute()
                            this.uploadingUpdateCommand.execute()
                            this.uploadingUpdateCommand.removeBackIneffective()
                            this.unuploadedUpdateCommand.execute()
                            this.unuploadedUpdateCommand.removeBackIneffective()
                        } else {
                            command.execute()
                        }
                    }
                    break
            }
        })
    }

    private setUploadHandle(this: this): void {
        if (this.uploadHandle != null) {
            clearTimeout(this.uploadHandle)
        }
        if (this.firstUnuploadedUpdateTime == 0) {
            return
        }
        let cacheTime = this.data.cacheTime.value
        let uploadIntervalTime = this.data.uploadIntervalTime.value
        let now: number = Date.now()
        let cacheNow: number = this.firstUnuploadedUpdateTime + configValueToNumber(cacheTime)
        let uploadIntervalNow: number = this.lastUploadTime + configValueToNumber(uploadIntervalTime)
        if (cacheTime === false && uploadIntervalTime === false) {
            this.neededToUpload.emit()
        } else if (cacheTime === false && uploadIntervalNow < now) {
            this.neededToUpload.emit()
        } else if (uploadIntervalTime === false && cacheNow < now) {
            this.neededToUpload.emit()
        } else {
            this.uploadHandle = setTimeout(
                (): void => { this.neededToUpload.emit() },
                Math.max(cacheNow, uploadIntervalNow) - now
            )
        }
    }

    public upload(this: this): KittenCloudDataUpdateCommandGroup {
        if (this.uploadHandle != None) {
            clearTimeout(this.uploadHandle)
            this.uploadHandle = None
        }
        this.firstUnuploadedUpdateTime = 0
        this.lastUploadTime = Date.now()
        const command: KittenCloudDataUpdateCommandGroup = this.unuploadedUpdateCommand
        this.unuploadedUpdateCommand = new KittenCloudDataUpdateCommandGroup()
        this.uploadingUpdateCommand.addAll(command)
        return command
    }
}
