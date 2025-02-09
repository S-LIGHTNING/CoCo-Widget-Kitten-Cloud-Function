import { CodemaoWebSocket } from "../codemao/codemao-environment"
import { Signal } from "./signal"

export class WebSocketProxy {

    private readonly socket: CodemaoWebSocket
    public readonly url: string

    public readonly beforeSend: Signal<{ data: string | ArrayBufferLike | Blob | ArrayBufferView }>
    public readonly sended: Signal<string | ArrayBufferLike | Blob | ArrayBufferView>
    public readonly opened: Signal<Event>
    public readonly received: Signal<MessageEvent>
    public readonly errored: Signal<Event | Error>
    public readonly closed: Signal<CloseEvent>

    public constructor(argument: CodemaoWebSocket) {
        this.url = argument.url
        this.socket = argument

        this.beforeSend = new Signal()
        this.sended = new Signal()
        this.opened = new Signal()
        this.received = new Signal()
        this.errored = new Signal()
        this.closed = new Signal()

        const originalSend = this.socket.send
        const originalOnOpen = this.socket.onopen ?? ((): void => {})
        const originalOnMessage = this.socket.onmessage ?? ((): void => {})
        const originalOnError = this.socket.onerror ?? ((): void => {})
        const originalOnClose = this.socket.onclose ?? ((): void => {})

        this.socket.send = (data: string | ArrayBufferLike | Blob | ArrayBufferView): void => {
            const message = { data }
            this.beforeSend.emit(message)
            originalSend.call(this.socket, message.data)
            this.sended.emit(message.data)
        }
        this.socket.onopen = (event: Event): void => {
            // @ts-ignore
            originalOnOpen.call(this.socket, event)
            this.opened.emit(event)
        }
        this.socket.onmessage = (event: MessageEvent): void => {
            // @ts-ignore
            originalOnMessage.call(this.socket, event)
            this.received.emit(event)
        }
        this.socket.onerror = (event: Event | Error): void => {
            // @ts-ignore
            originalOnError.call(this.socket, event)
            this.errored.emit(event)
        }
        this.socket.onclose = (event: CloseEvent): void => {
            // @ts-ignore
            originalOnClose.call(this.socket, event)
            this.closed.emit(event)
        }
    }

    public send(this: this, message: string): void {
        this.socket.send(message)
    }

    public close(this: this): void {
        // @ts-ignore
        this.socket.close()
    }
}
