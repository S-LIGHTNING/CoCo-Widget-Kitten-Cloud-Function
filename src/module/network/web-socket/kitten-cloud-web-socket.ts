import { WebSocketProxy } from "../../../utils/web-socket-proxy"
import { CodemaoWorkEditor } from "../../../codemao/work/codemao-work-editor"
import { CodemaoWork } from "../../../codemao/work/codemao-work"
import { Signal } from "../../../utils/signal"
import { KittenCloudWebSocketMessageType } from "./kitten-cloud-web-socket-message-type"
import { None } from "../../../utils/other"
import { CodemaoWebSocket } from "../../../codemao/codemao-environment"

const KITTEN_WEB_SOCKET_URL_PARAMS = {
    [CodemaoWorkEditor.NEMO.symbol]: {
        authorization_type: 5,
        stag: 2,
        EIO: 3,
        transport: "websocket"
    },
    [CodemaoWorkEditor.KITTEN.symbol]: {
        authorization_type: 1,
        stag: 1,
        EIO: 3,
        transport: "websocket"
    },
    [CodemaoWorkEditor.KITTEN_N.symbol]: {
        authorization_type: 5,
        stag: 3,
        token: "",
        EIO: 3,
        transport: "websocket"
    },
}

export class KittenCloudWebSocket {

    public readonly work: CodemaoWork

    private socket!: Promise<WebSocketProxy>
    private readonly manage: boolean

    public autoReconnect: boolean = true
    public autoReconnectIntervalTime: number = 8000

    private isOpened: boolean = false
    private socketResolve: ((value: WebSocketProxy | PromiseLike<WebSocketProxy>) => void) | None = None

    public readonly beforeSend: Signal<{ data: string | ArrayBufferLike | Blob | ArrayBufferView }> = new Signal()
    public readonly sended: Signal<string | ArrayBufferLike | Blob | ArrayBufferView>
    public readonly opened: Signal<void>
    public readonly disconnected: Signal<void>
    public readonly received: Signal<[string, unknown]>
    public readonly errored: Signal<unknown>
    public readonly closed: Signal<CloseEvent>

    private pingHandler: NodeJS.Timeout | None
    private pingHandlerArray: NodeJS.Timeout[]

    public constructor(argument: CodemaoWork | WebSocketProxy | WebSocket) {
        this.manage = argument instanceof CodemaoWork
        this.beforeSend = new Signal()
        this.sended = new Signal()
        this.opened = new Signal()
        this.disconnected = new Signal()
        this.received = new Signal()
        this.errored = new Signal()
        this.closed = new Signal()
        this.pingHandlerArray = []
        if (argument instanceof CodemaoWork) {
            this.work = argument
        } else {
            this.work = new CodemaoWork({
                id: parseInt(new URL(argument.url).searchParams.get("session_id") ?? "0")
            })
        }
        this.setSocket(argument)
    }

    public changeWebSocket(this: this, argument: CodemaoWork | WebSocketProxy | WebSocket): void {
        this.setSocket(argument)
    }

    private setSocket(this: this, argument: string | CodemaoWork | WebSocketProxy | WebSocket): void {
        this.socket = this.getSocket(argument)
        if (this.socketResolve != None) {
            this.socketResolve(this.socket)
            this.socketResolve = None
        }
        this.socket.then((socket: WebSocketProxy): void => {
            socket.beforeSend.connect((message: { data: string | ArrayBufferLike | Blob | ArrayBufferView }): void => { this.beforeSend.emit(message) })
            socket.sended.connect((message: string | ArrayBufferLike | Blob | ArrayBufferView): void => { this.sended.emit(message) })
            socket.received.connect((message: MessageEvent): void => { this.handleReceived(message.data) })
            socket.errored.connect((error: Event | Error): void => { this.errored.emit(error) })
            socket.closed.connect((event: CloseEvent): void => { this.handleClose(event) })
        }).catch((reason: unknown): void => {
            this.errored.emit(reason)
        })
    }

    private async getSocket(this: this, argument: string | CodemaoWork | WebSocketProxy | WebSocket): Promise<WebSocketProxy> {
        if (typeof argument == "string") {
            return new WebSocketProxy(await CodemaoWebSocket(argument))
        } else if (argument instanceof CodemaoWork) {
            const url: string = await (async (): Promise<string> => {
                const scheme: "wss" | "ws" = typeof global == "object" || window.location.protocol != "http:" ? "wss" : "ws"
                const host: string = ["socketcv", "codemao", "cn"].join(".")
                const port = 9096
                const path = "/cloudstorage/"
                const particularParams: object | None = KITTEN_WEB_SOCKET_URL_PARAMS[(await argument.info.editor).symbol]
                if (particularParams == None) {
                    throw new Error(`不支持的作品类型: ${(await argument.info.editor).name}`)
                }
                const params = `session_id=${await argument.info.id}&${
                    Object.entries(particularParams)
                    .map(([key, value]: [string, unknown]): string => `${key}=${value}`)
                    .join("&")
                }`
                return `${scheme}://${host}:${port}${path}?${params}`
            })()
            const socket = new WebSocketProxy(await CodemaoWebSocket(url))
            return socket
        } else if (argument instanceof WebSocket) {
            return new WebSocketProxy(argument)
        } else {
            return argument
        }
    }

    private handleReceived(this: this, message: string): void {
        try {
            const type: KittenCloudWebSocketMessageType =
                parseInt(/^[0-9]+/.exec(message)?.[0] ?? "-1")
            const data: unknown = message.length == type.toString().length ?
                None : JSON.parse(message.slice(type.toString().length))
            if (!this.manage && type != KittenCloudWebSocketMessageType.MESSAGE) {
                return
            }
            switch (type) {
                case KittenCloudWebSocketMessageType.UPGRADE:
                    if (data == None) {
                        throw new Error("升级数据为空")
                    }
                    if (
                        typeof data != "object" ||
                        !("pingInterval" in data) ||
                        !("pingTimeout" in data) ||
                        typeof data.pingInterval != "number" ||
                        typeof data.pingTimeout != "number"
                    ) {
                        throw new Error("无法识别的升级数据格式")
                    }
                    this.startPing(data.pingInterval, data.pingTimeout)
                    break
                case KittenCloudWebSocketMessageType.ERROR:
                    this.handleServerError()
                    break
                case KittenCloudWebSocketMessageType.PONG:
                    clearTimeout(this.pingHandlerArray.shift())
                    break
                case KittenCloudWebSocketMessageType.CONNECT:
                    this.opened.emit()
                    break
                case KittenCloudWebSocketMessageType.CLOSE:
                    this.handleServerClose()
                    break
                case KittenCloudWebSocketMessageType.MESSAGE:
                    if (data == None) {
                        throw new Error("消息数据为空")
                    }
                    if (
                        !Array.isArray(data) ||
                        data.length != 2 ||
                        typeof data[0] != "string"
                    ) {
                        throw new Error("无法识别的消息格式")
                    }
                    if (typeof data[1] == "string") {
                        try {
                            data[1] = JSON.parse(data[1])
                        } catch (error) {}
                    }
                    this.received.emit(data as [string, unknown])
                    break
                default:
                    throw new Error(`未知消息类型: ${type}`)
            }
        } catch (error) {
            this.errored.emit(error)
        }
    }

    private startPing(this: this, interval: number, timeout: number): void {
        if (this.pingHandler != None) {
            this.stopPing()
        }
        this.pingHandlerArray = []
        this.pingHandler = setInterval((): void => {
            this.socket.then((socket: WebSocketProxy): void => {
                socket.send(KittenCloudWebSocketMessageType.PING.toString())
                this.pingHandlerArray.push(setTimeout((): void => {
                    this.clientErrorClose(new Error("保活超时"))
                }, timeout))
            })
        }, interval)
    }

    private stopPing(this: this): void {
        if (this.pingHandler != None) {
            clearInterval(this.pingHandler)
        }
        for (const timeout of this.pingHandlerArray) {
            clearTimeout(timeout)
        }
    }

    public send(this: this, message: unknown): void {
        this.socket.then((socket: WebSocketProxy): void => {
            if (typeof message != "string") {
                message = JSON.stringify(message)
            }
            socket.send(`${KittenCloudWebSocketMessageType.MESSAGE.toString()}${message}`)
        }).catch((reason: unknown): void => {
            this.errored.emit(reason)
        })
    }

    private handleClose(this: this, event: CloseEvent): void {
        this.disconnected.emit()
        if (!this.isOpened || !this.autoReconnect) {
            this.closed.emit(event)
            return
        } else {
            this.isOpened = false
            if (this.manage) {
                let url: string
                this.socket.then((socket: WebSocketProxy): void => {
                    url = socket.url
                })
                this.socket = new Promise((resolve): void => {
                    setTimeout((): void => {
                        this.socketResolve = resolve
                        this.setSocket(url)
                    }, this.autoReconnectIntervalTime)
                })
            } else {
                this.socket = new Promise((resolve, reject): void => {
                    this.socketResolve = resolve
                    setTimeout((): void => {
                        this.closed.emit(event)
                        reject(new Error("重连等待超时"))
                    })
                })
            }
        }
    }

    private handleServerError(this: this): void {
        this.errored.emit(new Error("服务器错误"))
        this.socket.then((socket: WebSocketProxy): void => {
            try {
                socket.close()
            } catch (error) {}
        })
    }

    private clientErrorClose(this: this, error: Error): void {
        this.errored.emit(error)
        this.socket.then((socket: WebSocketProxy): void => {
            socket.send(KittenCloudWebSocketMessageType.ERROR.toString())
            socket.close()
        })
    }

    private handleServerClose(this: this): void {
        this.socket.then((socket: WebSocketProxy): void => {
            try {
                socket.close()
            } catch (error) {}
        })
    }

    public close(this: this): void {
        this.socket.then((socket: WebSocketProxy): void => {
            socket.send(KittenCloudWebSocketMessageType.CLOSE.toString())
            this.isOpened = false
            socket.close()
        }).catch((reason: unknown): void => {
            this.errored.emit(reason)
        })
    }
}
