import { Signal } from "../../../utils/signal"
import { ConfigChange } from "../../../utils/single-config"
import { KittenCloudCacheTime, KittenCloudLocalPreupdate, KittenCloudUploadIntervalTime } from "../../kitten-cloud-function-config-layer"
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
    private uploadingStartTimeArray: number[]
    private uploadingTimeoutHandle: (NodeJS.Timeout | number)[]

    private firstUnuploadedUpdateTime: number = 0
    private lastUploadTime: number = 0
    private uploadHandle: NodeJS.Timeout | number | None = None

    private pauseUpdate: boolean = false
    private pausedUpdateCommandArray: KittenCloudDataUpdateCommand[]

    public readonly neededToUpload: Signal<void>

    public constructor(
        public readonly connection: KittenCloudFunction,
        public readonly data: KittenCloudData
    ) {
        this.unuploadedUpdateCommand = new KittenCloudDataUpdateCommandGroup()
        this.uploadingUpdateCommand = new KittenCloudDataUpdateCommandGroup()
        this.uploadingStartTimeArray = []
        this.uploadingTimeoutHandle = []
        this.neededToUpload = new Signal()
        this.data.cacheTime.changed.connect((): void => {
            this.setUploadHandle()
        })
        this.data.uploadIntervalTime.changed.connect((): void => {
            this.setUploadHandle()
        })
        this.data.uploadTimeout.changed.connect(
            ({ newValue: uploadTimeout }: ConfigChange<number>): void => {
                for (const handle of this.uploadingTimeoutHandle) {
                    clearTimeout(handle)
                }
                if (uploadTimeout > 0) {
                    for (let i: number = 0; i < this.uploadingTimeoutHandle.length; i++) {
                        this.uploadingTimeoutHandle[i] = setTimeout((): void => {
                            this.handleUploadingError(new Error("上传超时"))
                        }, uploadTimeout + (this.uploadingStartTimeArray[i] ?? 0) - Date.now())
                    }
                }
            }
        )
        this.data.localPreupdate.changed.connect(
            ({ newValue: LocalPreupdate }: ConfigChange<KittenCloudLocalPreupdate>): void => {
                if (LocalPreupdate) {
                    this.redoLocalPreUpdate()
                } else {
                    this.revokeLocalPreUpdate()
                }
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
            if (this.data.localPreupdate.value) {
                this.uploadingUpdateCommand.revoke()
            }
            for (const command of this.uploadingUpdateCommand) {
                command.fail(new Error("连接已断开"))
            }
            this.uploadingUpdateCommand = new KittenCloudDataUpdateCommandGroup()
            this.uploadingStartTimeArray = []
            for (const handle of this.uploadingTimeoutHandle) {
                clearTimeout(handle)
            }
            this.uploadingTimeoutHandle = []
        })
        this.connection.closed.connect((): void => {
            if (this.uploadHandle != None) {
                clearTimeout(this.uploadHandle)
                this.uploadHandle = None
            }
            if (this.data.localPreupdate.value) {
                this.redoLocalPreUpdate()
            }
            for (const command of this.uploadingUpdateCommand) {
                command.fail(new Error("连接已关闭"))
            }
            for (const command of this.unuploadedUpdateCommand) {
                command.fail(new Error("连接已关闭"))
            }
        })
    }

    private withPauseUpdate(this: this, func: () => void): void {
        if (this.pauseUpdate) {
            func()
            return
        }
        this.pauseUpdate = true
        func()
        this.pauseUpdate = false
        for (let command of this.pausedUpdateCommandArray) {
            this.handleNewUpdateCommand(command)
        }
        this.pausedUpdateCommandArray = []
    }

    private withRevokeLocalPreUpdate(this: this, func: () => void): void {
        this.revokeLocalPreUpdate()
        func()
        this.redoLocalPreUpdate()
    }

    private revokeLocalPreUpdate(this: this): void {
        this.withPauseUpdate((): void => {
            this.unuploadedUpdateCommand.revoke()
            this.uploadingUpdateCommand.revoke()
        })
    }

    private redoLocalPreUpdate(this: this): void {
        this.withPauseUpdate((): void => {
            this.uploadingUpdateCommand.execute()
            let count: number = this.uploadingUpdateCommand.removeBackIneffective()
            while (count--) {
                this.uploadingStartTimeArray.pop()
                clearTimeout(this.uploadingTimeoutHandle.pop())
            }
            this.unuploadedUpdateCommand.execute()
            this.unuploadedUpdateCommand.removeBackIneffective()
        })
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
        if (firstUpdateCommand == None) {
            throw new Error("不存在更新命令")
        }
        this.uploadingStartTimeArray.shift()
        clearTimeout(this.uploadingTimeoutHandle.shift())
        if (!this.data.localPreupdate.value) {
            firstUpdateCommand.execute()
        }
        firstUpdateCommand.finish()
    }

    public handleUploadingError(this: this, error?: Error | None): void {
        const firstUpdateCommand: KittenCloudDataUpdateCommand | None = this.uploadingUpdateCommand.shift()
        if (firstUpdateCommand == None) {
            throw new Error("不存在更新命令")
        }
        this.uploadingStartTimeArray.shift()
        clearTimeout(this.uploadingTimeoutHandle.shift())
        if (this.data.localPreupdate.value) {
            this.withRevokeLocalPreUpdate((): void => {
                firstUpdateCommand.revoke()
            })
        }
        firstUpdateCommand.fail(error ?? new Error("更新上传失败"))
    }

    private handleNewUpdateCommand(this: this, command: KittenCloudDataUpdateCommand): void {
        this.withPauseUpdate((): void => {
            switch (command.source) {
                case KittenCloudDataUpdateSource.LOCAL:
                    if (!command.isLegal()) {
                        command.fail(new Error("非法操作"))
                        return
                    }
                    if (this.data.localPreupdate.value) {
                        if (!command.isEffective()) {
                            command.finish()
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
                        if (command.isLegal() && command.isEffective()) {
                            command.execute()
                        }
                    } else if (equal(command.toJSON(), firstUploadingCommand.toJSON())) {
                        this.uploadingUpdateCommand.shift()
                        this.uploadingStartTimeArray.shift()
                        clearTimeout(this.uploadingTimeoutHandle.shift())
                        if (!this.data.localPreupdate.value) {
                            firstUploadingCommand.execute()
                            let count: number = this.uploadingUpdateCommand.removeFrontIneffective()
                            while (count--) {
                                this.uploadingStartTimeArray.shift()
                                clearTimeout(this.uploadingTimeoutHandle.shift())
                            }
                        }
                        firstUploadingCommand.finish()
                    } else {
                        if (this.data.localPreupdate.value) {
                            this.withRevokeLocalPreUpdate((): void => {
                                if (command.isLegal() && command.isEffective()) {
                                    command.execute()
                                }
                            })
                        } else {
                            if (command.isLegal() && command.isEffective()) {
                                command.execute()
                            }
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
        let cacheTime: KittenCloudCacheTime = this.data.cacheTime.value
        let uploadIntervalTime: KittenCloudUploadIntervalTime = this.data.uploadIntervalTime.value
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
        const commandGroup: KittenCloudDataUpdateCommandGroup = this.unuploadedUpdateCommand
        this.unuploadedUpdateCommand = new KittenCloudDataUpdateCommandGroup()
        this.uploadingUpdateCommand.addAll(commandGroup)
        for (const __command of commandGroup) {
            this.uploadingStartTimeArray.push(this.lastUploadTime)
            if (this.data.uploadTimeout.value > 0) {
                this.uploadingTimeoutHandle.push(setTimeout((): void => {
                    this.handleUploadingError(new Error("上传超时"))
                }, this.data.uploadTimeout.value))
            } else {
                this.uploadingTimeoutHandle.push(0)
            }
        }
        return commandGroup
    }
}
