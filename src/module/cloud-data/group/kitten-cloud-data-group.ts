import { KittenCloudFunction } from "../../../kitten-cloud-function"
import { None } from "../../../utils/other"
import { Signal } from "../../../utils/signal"
import { KittenCloudFunctionConfigLayer, ConfigObject } from "../../kitten-cloud-function-config-layer"
import { KittenCloudSendMessageType } from "../../network/kitten-cloud-send-message-type"
import { KittenCloudData } from "../kitten-cloud-data"
import { KittenCloudDataUpdateCommand } from "../update/command/kitten-cloud-data-update-command"
import { KittenCloudDataUpdateCommandGroup } from "../update/command/kitten-cloud-data-update-command-group"

export type KittenCloudDataInfoObject = {
    cvid: string,
    name: string,
    value: unknown
}

/**
 * 云数据组，用于管理云数据实例。
 */
export abstract class KittenCloudDataGroup<DATA_TYPE extends KittenCloudData = KittenCloudData>
    extends KittenCloudFunctionConfigLayer {

    private connecting: boolean = true
    private readonly connected: Signal<void>

    public readonly array: DATA_TYPE[]

    protected readonly dataArray: DATA_TYPE[]
    protected readonly dataMap: Map<string, DATA_TYPE>

    protected readonly uploadCount: number[][]

    protected abstract readonly dataTypeName: string
    protected abstract readonly dataUpdateSendMessageType: KittenCloudSendMessageType

    public constructor(
        public readonly connection: KittenCloudFunction,
        config: ConfigObject
    ) {
        super(connection, config)
        this.connected = new Signal()
        this.dataArray = []
        this.dataMap = new Map()
        this.array = this.dataArray
        this.uploadCount = []
    }

    public update(this: this, data: KittenCloudDataInfoObject[]): void {
        this.connecting = false
        for (const item of data) {
            const data: DATA_TYPE | None = this.dataMap.get(item.cvid)
            if (data == null) {
                const newData: DATA_TYPE = this.createData(
                    item.cvid, item.name, item.value
                )
                this.dataArray.push(newData)
                this.dataMap.set(item.name, newData)
                this.dataMap.set(item.cvid, newData)
                newData.updateManager.neededToUpload.connect((): void => {
                    this.handleUpload()
                })
            } else {
                data.update(item.value)
            }
        }
        this.connected.emit()
    }

    protected abstract createData(
        this: this, cvid: string, name: string, value: unknown
    ): DATA_TYPE

    /**
     * 获取该云数据组指定的云数据实例。
     *
     * @param index 索引，可以是云数据的名称或 cvid
     * @returns 对应的云数据实例
     * @throws 如果不存在该云数据实例，则抛出异常
     */
    public async get(this: this, index: string): Promise<DATA_TYPE> {
        if (this.connecting) {
            await this.connected.wait()
        }
        const data: DATA_TYPE | None = this.dataMap.get(index)
        if (data == null) {
            throw new Error(`获取${this.dataTypeName}失败：${this.dataTypeName} ${index} 不存在`)
        }
        return data
    }

    /**
     * 获取该云数据组中的所有云数据。
     *
     * @returns 由所有云数据组成的数组
     */
    public async getAll(this: this): Promise<DATA_TYPE[]> {
        if (this.connecting) {
            await this.connected.wait()
        }
        return this.dataArray
    }

    public handleUpload(this: this): void {
        const uploadCount: number[] = []
        const uploadMessage: Record<string, KittenCloudDataUpdateCommandGroup> = {}
        for (const data of this.dataArray) {
            const singleUploadMessage: KittenCloudDataUpdateCommandGroup = data.updateManager.upload()
            uploadMessage[data.cvid] = singleUploadMessage
            uploadCount.push(singleUploadMessage.length)
        }
        this.uploadCount.push(uploadCount)
        this.connection.send(this.dataUpdateSendMessageType, this.toCloudUploadMessage(uploadMessage))
    }

    public handleCloudUpdate(this: this, cloudMessage: unknown): void {
        const errorArray: Error[] = []
        let message: Record<string, KittenCloudDataUpdateCommandGroup>
        try {
            message = this.toUploadMessage(cloudMessage)
        } catch (error) {
            if (!Array.isArray(error)) {
                this.handleCloudUpdateError()
                let message: string
                if (error instanceof Error) {
                    message = error.message
                } else if (typeof error == "string") {
                    message = error
                } else {
                    message = JSON.stringify(error)
                }
                throw new Error(`更新${this.dataTypeName}失败：${message}`)
            }
            for (const singleError of error) {
                errorArray.push(singleError)
            }
            if (typeof error != "object" || !("message" in error)) {
                errorArray.push(new Error(`更新${this.dataTypeName}失败：找不到更新数据`))
            }
            message = (error as unknown as { message: Record<string, KittenCloudDataUpdateCommandGroup> }).message
        }
        for (const data of this.dataArray) {
            const singleMessage: KittenCloudDataUpdateCommandGroup | None = message[data.cvid]
            if (singleMessage == None) {
                continue
            }
            let updateCommand: KittenCloudDataUpdateCommand | None
            while ((updateCommand = singleMessage.shift()) != None) {
                data.updateManager.addUpdateCommand(updateCommand)
            }
        }
        this.uploadCount.shift()
    }

    public handleCloudUpdateError(this: this): void {
        const firstUploadCount: number[] | None = this.uploadCount.shift()
        if (firstUploadCount == None) {
            throw new Error("不存在上传数据")
        }
        for (let i: number = 0; i < this.dataArray.length; i++) {
            for (;;) {
                const count: number | None = firstUploadCount[i]
                if (count == None || count <= 0) {
                    break
                }
                this.dataArray[i]?.updateManager.handleUploadingError()
                firstUploadCount[i] = count - 1
            }
        }
    }

    public abstract toCloudUploadMessage(
        this: this, message: Record<string, KittenCloudDataUpdateCommandGroup>
    ): unknown

    public abstract toUploadMessage(
        this: this, message: unknown
    ): Record<string, KittenCloudDataUpdateCommandGroup>
}
