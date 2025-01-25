import { CodemaoWork } from "./codemao/work/codemao-work"
import { KittenCloudOnlineUserNumber } from "./module/kitten-cloud-online-user-number"
import { KittenCloudWebSocket } from "./module/network/web-socket/kitten-cloud-web-socket"
import { Signal } from "./utils/signal"
import { WebSocketProxy } from "./utils/web-socket-proxy"
import { KittenCloudFunctionConfigLayer } from "./module/kitten-cloud-function-config-layer"
import { KittenCloudPublicVariableGroup } from "./module/cloud-data/group/kitten-cloud-public-variable-group"
import { KittenCloudDataType } from "./module/cloud-data/kitten-cloud-data-type"
import { KittenCloudDataGroup, KittenCloudDataInfoObject } from "./module/cloud-data/group/kitten-cloud-data-group"
import { KittenCloudSendMessageType } from "./module/network/kitten-cloud-send-message-type"
import { KittenCloudReceiveMessageType } from "./module/network/kitten-cloud-receive-message-type"
import { KittenCloudData } from "./module/cloud-data/kitten-cloud-data"
import { KittenCloudPrivateVariableGroup } from "./module/cloud-data/group/kitten-cloud-private-variable-group"
import { ConfigChange } from "./utils/single-config"
import { CodemaoUser } from "./codemao/user/codemao-user"
import { None } from "./utils/other"
import { KittenCloudListGroup } from "./module/cloud-data/group/kitten-cloud-list-group"

export let __diff: typeof import("diff") | None = None
let __importDiff: Promise<typeof import("diff")> | None = None

/**
 * 源码云功能主类，用于管理源码云的连接、数据、事件等。
 */
export class KittenCloudFunction extends KittenCloudFunctionConfigLayer {

    private static __caughtInstance: Map<number, KittenCloudFunction> = new Map()
    private static __caught?: Signal<KittenCloudFunction>

    /**
     * 当从全局 WebSocket 中捕获到源码云的连接，会将其转换为 KittenCloudFunction 实例并通过该信号通知。
     *
     * 该功能会污染全局 WebSocket，仅在该信号被访问时才会启用。
     */
    public static get caught(): Signal<KittenCloudFunction> {
        if (KittenCloudFunction.__caught == null) {
            KittenCloudFunction.__caught = new Signal()
            KittenCloudFunction.startCatch()
        }
        return KittenCloudFunction.__caught
    }

    private static startCatch(): void {
        let originalWebSocket: typeof WebSocket = WebSocket
        new Function("newWebSocket", `
            newWebSocket.prototype = WebSocket.prototype;
            window.WebSocket = newWebSocket;
        `)(function (url: string | URL): WebSocket {
            let socket: WebSocket = new originalWebSocket(url)
            if (typeof url == "string") {
                url = new URL(url)
            }
            if (
                !KittenCloudFunction.caught.isEmpty() &&
                url.hostname == ["socketcv", "codemao", "cn"].join(".") &&
                url.pathname == "/cloudstorage/"
            ) {
                let workID = parseInt(url.searchParams.get("session_id") ?? "0")
                let instance: KittenCloudFunction | undefined = KittenCloudFunction.__caughtInstance.get(workID)
                if (instance == null) {
                    instance = new KittenCloudFunction(socket)
                    KittenCloudFunction.__caughtInstance.set(workID, instance)
                } else {
                    instance.socket.changeWebSocket(socket)
                }
                KittenCloudFunction.caught.emit(instance)
            }
            return socket
        })
    }

    /**
     * 当前连接的作品。
     */
    public readonly work: CodemaoWork

    private readonly socket: KittenCloudWebSocket

    /**
     * 源码云连接打开时触发该信号。
     *
     * 源码云连接打开是指 WebSocket 连接成功，并且源码云功能完成了云功能初始化操作，这意味着在此之后可以正常使用云功能。
     */
    public readonly opened: Signal<void>
    /**
     * 源码云连接断开时触发该信号。
     *
     * 源码云连接断开是指 WebSocket 连接断开，如果不是客户端主动断开且配置了自动重连，会自动重新连接。
     */
    public readonly disconnected: Signal<void>
    /**
     * 源码云连接关闭时触发该信号。
     *
     * 源码云连接关闭是指 WebSocket 连接断开且之后不会再自动重连。
     */
    public readonly closed: Signal<void>
    /**
     * 源码云连接发生错误时触发该信号。
     */
    public readonly errored: Signal<unknown>

    /**
     * 该 Promise 实例会在源码云连接成功时被 resolve，并提供一个 {@link KittenCloudOnlineUserNumber} 实例作为参数。
     *
     * 如果源码云连接失败，则该 Promise 实例会被 reject。
     */
    public onlineUserNumber: Promise<KittenCloudOnlineUserNumber>
    private onlineUserNumberResolve?: (value: KittenCloudOnlineUserNumber) => void
    private onlineUserNumberReject?: (error: unknown) => void

    /** 用于管理云私有变量。*/public privateVariable: KittenCloudPrivateVariableGroup
    /** 用于管理云公有变量。*/public publicVariable: KittenCloudPublicVariableGroup
    /** 用于管理云列表。*/public list: KittenCloudListGroup

    /**
     * 创建一个新的 KittenCloudFunction 实例，当实例被创建时，会自动连接到源码云。
     *
     * @param work 一个数字，表示要连接的作品的 ID。
     */
    public constructor(workID: number)

    /**
     * 创建一个新的 KittenCloudFunction 实例，当实例被创建时，会自动连接到源码云。
     *
     * @param work 一个 {@link CodemaoWork} 实例，表示要连接的作品。
     */
    public constructor(work: CodemaoWork)

    public constructor(argument: CodemaoWork | KittenCloudWebSocket | WebSocketProxy | WebSocket)
    public constructor(
        argument: number | CodemaoWork | KittenCloudWebSocket | WebSocketProxy | WebSocket
    ) {
        super()
        if (typeof argument == "number") {
            argument = new CodemaoWork({ id: argument })
        }
        const work: CodemaoWork | null =
            argument instanceof CodemaoWork? argument : null
        if (!(argument instanceof KittenCloudWebSocket)) {
            argument = new KittenCloudWebSocket(argument)
        }
        this.socket = argument
        this.work = this.socket.work
        this.autoReconnectIntervalTime.changed.connect(
            ({ newValue }: ConfigChange<number | boolean>): void => {
                if (typeof newValue == "boolean") {
                    this.socket.autoReconnect = newValue
                    return
                }
                this.socket.autoReconnect = true
                this.socket.autoReconnectIntervalTime = newValue
            }
        )
        this.socket.opened.connect(async (): Promise<void> => {
            if (work != null) {
                this.send(KittenCloudSendMessageType.JOIN, (await work.info.id).toString())
            }
        })
        this.socket.received.connect((message: [string, unknown]): void => {
            this.handleReceived(message)
        })
        this.opened = new Signal()
        this.disconnected = new Signal()
        this.closed = new Signal()
        this.errored = new Signal()
        this.socket.disconnected.connect((): void => {
            this.disconnected.emit()
        })
        this.socket.closed.connect((): void => {
            this.closed.emit()
        })
        this.socket.errored.connect((error: unknown): void => {
            this.errored.emit(error)
        })
        this.onlineUserNumber = new Promise((resolve, reject) => {
            this.onlineUserNumberResolve = resolve
            this.onlineUserNumberReject = reject
        })
        this.socket.errored.connect((error: unknown): void => {
            this.onlineUserNumberReject?.(error)
        })
        this.privateVariable = new KittenCloudPrivateVariableGroup(this)
        this.publicVariable = new KittenCloudPublicVariableGroup(this)
        this.list = new KittenCloudListGroup(this)
        if (__importDiff == None) {
            __importDiff = (async (): Promise<typeof import("diff")> => {
                return __diff = await import("diff")
            })()
        }
    }

    public close(this: this): void {
        this.socket.close()
    }

    public send(this: this, type: KittenCloudSendMessageType, message: unknown): void {
        this.socket.send([type, message])
    }

    private handleReceived(this: this, message: [string, unknown]): void {
        (async (): Promise<void> => {
            const [type, data] = message
            switch (type) {
                case KittenCloudReceiveMessageType.JOIN:
                    this.send(KittenCloudSendMessageType.GET_ALL_DATA, {})
                    break
                case KittenCloudReceiveMessageType.RECEIVE_ALL_DATA:
                    if (data == null) {
                        throw new Error("获取全部数据数据为空")
                    }
                    if (typeof data != "object" || !Array.isArray(data)) {
                        throw new Error(`无法识别的获取全部数据数据：${data}`)
                    }
                    const dataArray: unknown[] = data
                    const privateVariableArray: KittenCloudDataInfoObject[] = [],
                        publicVariableArray: KittenCloudDataInfoObject[] = [],
                        listArray: KittenCloudDataInfoObject[] = []
                    for (const item of dataArray) {
                        if (item == null) {
                            continue
                        }
                        if (typeof item != "object") {
                            throw new Error(`无法识别的获取全部数据数据中的数据：${item}`)
                        }
                        if (!(
                            "cvid" in item && typeof item.cvid == "string" &&
                            "name" in item && typeof item.name == "string" &&
                            "value" in item && typeof (item.value == "string" || item.value == "number" || Array.isArray(item.value)) &&
                            "type" in item && typeof item.type == "number"
                        )) {
                            throw new Error(`无法识别的获取全部数据数据中的数据：${item}`)
                        }
                        const { cvid, name, value, type } = item
                        if (type == KittenCloudDataType.PRIVATE_VARIABLE) {
                            privateVariableArray.push({ cvid, name, value })
                        } else if (type == KittenCloudDataType.PUBLIC_VARIABLE) {
                            publicVariableArray.push({ cvid, name, value })
                        } else if (type == KittenCloudDataType.LIST) {
                            listArray.push({ cvid, name, value })
                        } else {
                            throw new Error(`无法识别的获取全部数据数据中的数据数据：${item}，数据类型 ${type} 不支持`)
                        }
                    }
                    this.privateVariable.update(privateVariableArray)
                    this.publicVariable.update(publicVariableArray)
                    this.list.update(listArray)
                    if (listArray.length != 0) {
                        if (__diff == None) {
                            await __importDiff
                        }
                        this.opened.emit()
                    }
                    break
                case KittenCloudReceiveMessageType.UPDATE_PRIVATE_VARIABLE:
                    this.privateVariable.handleCloudUpdate(data)
                    break
                case KittenCloudReceiveMessageType.RECEIVE_PRIVATE_VARIABLE_RANKING_LIST:
                    this.privateVariable.handleReceiveRankingList(data)
                    break
                case KittenCloudReceiveMessageType.UPDATE_PUBLIC_VARIABLE:
                    this.publicVariable.handleCloudUpdate(data)
                    break
                case KittenCloudReceiveMessageType.UPDATE_LIST:
                    this.list.handleCloudUpdate(data)
                    break
                case KittenCloudReceiveMessageType.UPDATE_ONLINE_USER_NUMBER:
                    if (data == null) {
                        throw new Error("在线用户数量数据为空")
                    }
                    if (
                        typeof data != "object" ||
                        !("total" in data) ||
                        typeof data.total != "number"
                    ) {
                        throw new Error(`无法识别的在线用户数量数据：${data}`)
                    }
                    if (this.onlineUserNumberResolve != null) {
                        this.onlineUserNumberResolve(
                            new KittenCloudOnlineUserNumber(data.total)
                        )
                        delete this.onlineUserNumberResolve
                    } else {
                        (await this.onlineUserNumber).update({ total: data.total })
                    }
                    break
                default:
                    throw new Error(`无法识别的消息类型：${type}`)
            }
        })().catch((error: unknown): void => { this.errored.emit(error) })
    }

    /**
     * 获取云数据实例。
     *
     * @param index 该数据的名称或 cvid
     * @returns 对应云数据实例
     * @throws 如果不存在该云数据实例，则抛出异常
     */
    public async get(this: this, index: string): Promise<KittenCloudData> {
        const groupArray: KittenCloudDataGroup[] = [
            this.privateVariable, this.publicVariable, this.list
        ]
        for (const group of groupArray) {
            try {
                return await group.get(index)
            } catch (error) {}
        }
        throw new Error(`云数据 ${index} 不存在`)
    }

    public async getAll(this: this): Promise<KittenCloudData[]> {
        const groupArray: KittenCloudDataGroup[] = [
            this.privateVariable, this.publicVariable, this.list
        ]
        const result: KittenCloudData[] = []
        for (const group of groupArray) {
            result.push(...await group.getAll())
        }
        return result
    }

    private static _user: CodemaoUser | None = None

    /**
     * 当前用户。
     *
     * @returns CodemaoUser
     */
    public static get user(): CodemaoUser {
        if (KittenCloudFunction._user == None) {
            KittenCloudFunction._user = new CodemaoUser()
        }
        return KittenCloudFunction._user
    }
}
