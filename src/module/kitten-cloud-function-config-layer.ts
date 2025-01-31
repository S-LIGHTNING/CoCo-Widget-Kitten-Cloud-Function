import { None } from "../utils/other"
import { SingleConfig } from "../utils/single-config"

export type KittenCloudAutoReconnectIntervalTime = number | boolean
export type KittenCloudLocalPreupdate = boolean
export type KittenCloudCacheTime = number | boolean
export type KittenCloudUploadIntervalTime = number | boolean
export type KittenCloudConfigObject = {
    autoReconnectIntervalTime?: KittenCloudAutoReconnectIntervalTime,
    localPreupdate?: KittenCloudLocalPreupdate,
    cacheTime?: KittenCloudCacheTime,
    uploadIntervalTime?: KittenCloudUploadIntervalTime,
    uploadTimeout?: number,
    stringLengthLimit?: number,
    listLengthLimit?: number
}

/**
 * 源码云功能的配置层，用于管理源码云功能的配置项。
 */
export abstract class KittenCloudFunctionConfigLayer {

    /**
     * 自动重连间隔时间（毫秒），填 `false` 表示禁用自动重连。
     *
     * 默认值：`8000`。
     */
    public readonly autoReconnectIntervalTime: SingleConfig<KittenCloudAutoReconnectIntervalTime>

    /**
     * 本地预更新。
     *
     * 在没有开启本地预更新时，每次在本地执行数据更新操作时，都会等到该操作同步到云端并收到来自服务器的反馈后再更新本地的数据，这与普通的变量在修改后立即更新其值并不相同。
     *
     * 开启本地预更新后，本地执行数据更新操作时，会假定该操作同步到云端之前没有其它用户对该数据进行操作，并基于此提前更新本地的数据，如果假定不成立，则会修正本地数据。具体而言，本地执行数据更新操作时，会立即更新本地的数据，如果在当前操作被同步到云端之前收到了来自服务器的反馈的其它更新数据，则会撤销本地对数据的更改，并执行来自云端的更改，最后再执行本地对数据的更改。
     *
     * 默认值：对于云变量开启，对于云列表关闭。
     */
    public readonly localPreupdate: SingleConfig<KittenCloudLocalPreupdate>
    /**
     * 缓存时间（毫秒），填 `false` 表示绝对关闭。
     *
     * 默认值：`0`
     */
    public readonly cacheTime: SingleConfig<KittenCloudCacheTime>
    /**
     * 上传间隔时间（毫秒），填 `false` 表示绝对关闭。
     *
     * 默认值：对于私有云变量为 `1500`，对于其它为 `0`。
     *
     * @warning 私有云变量的上传间隔时间必须不少于 1500 毫秒。
     */
    public readonly uploadIntervalTime: SingleConfig<KittenCloudUploadIntervalTime>
    /**
     * 上传超时时间（毫秒），填 `0` 表示永不超时。
     *
     * 默认值：`4000`
     */
    public readonly uploadTimeout: SingleConfig<number>

    /**
     * 字符串长度限制，字符串量的长度不能超过此限制，超出部分会被丢弃。
     *
     * 默认值：`1024`。
     *
     * @warning 字符串长度限制必须不大于 1024.
     */
    public readonly stringLengthLimit: SingleConfig<number>
    /**
     * 列表长度限制，列表的长度不能超过此限制，超出部分会被丢弃。
     *
     * 默认值：1000。
     *
     * @warning 列表长度限制必须不大于 1000
     */
    public readonly listLengthLimit: SingleConfig<number>

    public constructor(upper: KittenCloudFunctionConfigLayer | None = None, {
        autoReconnectIntervalTime,
        localPreupdate, cacheTime,
        uploadIntervalTime,
        uploadTimeout,
        stringLengthLimit,
        listLengthLimit
    }: KittenCloudConfigObject = {}) {
        this.autoReconnectIntervalTime = new SingleConfig(upper?.autoReconnectIntervalTime ?? autoReconnectIntervalTime ?? 8000, autoReconnectIntervalTime)

        this.localPreupdate = new SingleConfig(upper?.localPreupdate ?? localPreupdate ?? true, localPreupdate)
        this.cacheTime = new SingleConfig(upper?.cacheTime ?? cacheTime ?? 0, cacheTime)
        this.uploadIntervalTime = new SingleConfig(upper?.uploadIntervalTime ?? uploadIntervalTime ?? 0, uploadIntervalTime)
        this.uploadTimeout = new SingleConfig(upper?.uploadTimeout ?? uploadTimeout ?? 4000, uploadTimeout)

        this.stringLengthLimit = new SingleConfig(upper?.stringLengthLimit ?? stringLengthLimit ?? 1024, stringLengthLimit)
        this.listLengthLimit = new SingleConfig(upper?.listLengthLimit ?? listLengthLimit ?? 1000, listLengthLimit)
    }
}
