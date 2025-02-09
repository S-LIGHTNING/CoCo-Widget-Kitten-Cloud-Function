import type { AxiosRequestConfig, AxiosResponse } from "axios"

export const isNode: boolean = typeof global == "object"
export const isBrowser: boolean = typeof window == "object"
export const isCodemaoWindow: boolean = isBrowser && location.hostname.endsWith("codemao.cn")

const dirs = isNode ? require("appdirsjs").default({ appName: "SLIGHTNING/Codemao-Community" }) : null

export async function getAuthorization(): Promise<string | null> {
    if (dirs == null) {
        throw new Error("当前环境不支持该方法")
    }
    try {
        return String(await (await import("fs")).promises.readFile((await import("path")).resolve(dirs.config, "authorization.txt")))
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code == "ENOENT") {
            return null
        } else {
            throw error
        }
    }
}

let codemaoIFrameElement: HTMLIFrameElement | null = null
let codemaoWindow: Promise<Window> | null = null

export function getCodemaoIFrameElement(): HTMLIFrameElement | null {
    return codemaoIFrameElement
}

export function getCodemaoWindow(): Promise<Window> {
    if (codemaoWindow != null) {
        return codemaoWindow
    }
    return codemaoWindow = new Promise((
        resolve: (value: Window) => void,
        reject: (reason: Error) => void
    ): void => {
        function startListen(codemaoWindow: Window | null): void {
            if (codemaoWindow == null) {
                reject(new Error("编程猫环境服务连接失败：窗口为空"))
                return
            }
            function listener(event: MessageEvent): void {
                const { data } = event
                if (data == null || typeof data != "object") {
                    return
                }
                if (
                    /^https?:\/\/coco\.codemao\.cn$/.test(event.origin) &&
                    data.type == "COCO_CODEMAO_ENVIRONMENT_SERVER_INIT"
                ) {
                    window.removeEventListener("message", listener)
                    resolve(codemaoWindow!)
                }
            }
            window.addEventListener("message", listener)
            codemaoWindow.addEventListener("beforeunload", (): void => {
                codemaoIFrameElement = null
                codemaoWindow = null
                reject(new Error("编程猫环境服务连接失败：窗口已被关闭"))
            })
            window.addEventListener("beforeunload", (): void => {
                codemaoWindow?.close()
                codemaoIFrameElement = null
                codemaoWindow = null
            })
        }

        if (location.protocol == "file:") {
            codemaoIFrameElement = document.createElement("iframe")
            codemaoIFrameElement.src = "https://coco.codemao.cn/editor/player/255051613?channel=h5"
            codemaoIFrameElement.style.display = "none"
            document.body.appendChild(codemaoIFrameElement)
            startListen(codemaoIFrameElement.contentWindow)
        } else {
            const buttonElement: HTMLElement = document.createElement("div")
            buttonElement.innerText = "点击打开编程猫环境服务\n打开后请不要关闭编程猫环境服务页面"
            buttonElement.style.width = "100%"
            buttonElement.style.height = "100%"
            buttonElement.style.fontSize = "2em"
            buttonElement.style.position = "fixed"
            buttonElement.style.left = "0px"
            buttonElement.style.top = "0px"
            buttonElement.style.right = "0px"
            buttonElement.style.bottom = "0px"
            buttonElement.style.backgroundColor = "white"
            buttonElement.style.cursor = "pointer"
            buttonElement.style.zIndex = "10000"
            buttonElement.addEventListener("click", (): void => {
                startListen(open("https://coco.codemao.cn/editor/player/255051613?channel=h5"))
                buttonElement.remove()
            })
            document.body.appendChild(buttonElement)
        }
    })
}

const CoCoCodemaoEnvironmentServerAxiosIDSet = new Set<number>()

export async function CoCoCodemaoEnvironmentServerAxios<T>(
    argument: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
    let id: number
    do {
        id = Math.floor(Math.random() * 90000000) + 10000000
    } while (CoCoCodemaoEnvironmentServerAxiosIDSet.has(id))
    CoCoCodemaoEnvironmentServerAxiosIDSet.add(id)
    return new Promise((
        resolve: (value: AxiosResponse<T>) => void,
        reject: (reason?: unknown) => void
    ): void => {
        function listener(event: MessageEvent): void {
            const { data } = event
            if (data == null || typeof data != "object") {
                return
            }
            if (data.type == "CODEMAO_ENVIRONMENT_AXIOS_RESULT" && data.id == id) {
                CoCoCodemaoEnvironmentServerAxiosIDSet.delete(id)
                window.removeEventListener("message", listener)
                if (data.success) {
                    resolve(data.response)
                } else {
                    reject(data.error)
                }
            }
        }
        window.addEventListener("message", listener)
        getCodemaoWindow().then((codemaoWindow: Window): void => {
            codemaoWindow.postMessage({
                type: "CODEMAO_ENVIRONMENT_AXIOS",
                id,
                argument
            }, "https://coco.codemao.cn")
        }).catch(reject)
    })
}

const CoCoCodemaoEnvironmentServerWebSocketIDSet = new Set<number>()

export class CoCoCodemaoEnvironmentServerWebSocket {

    public url: string

    private id: number

    public constructor(url: string) {
        this.url = url
        do {
            this.id = Math.floor(Math.random() * 90000000) + 10000000
        } while (CoCoCodemaoEnvironmentServerWebSocketIDSet.has(this.id))
        CoCoCodemaoEnvironmentServerWebSocketIDSet.add(this.id)
        const listener: (event: MessageEvent) => void = (event: MessageEvent): void => {
            const { data } = event
            if (data == null || typeof data != "object") {
                return
            }
            if (data.type == "CODEMAO_ENVIRONMENT_WEB_SOCKET_OPEN" && data.id == this.id) {
                this.onopen(data.event)
            }
            if (data.type == "CODEMAO_ENVIRONMENT_WEB_SOCKET_MESSAGE" && data.id == this.id) {
                this.onmessage(data.event)
            }
            if (data.type == "CODEMAO_ENVIRONMENT_WEB_SOCKET_CLOSE" && data.id == this.id) {
                this.onclose(data.event)
                CoCoCodemaoEnvironmentServerWebSocketIDSet.delete(this.id)
                window.removeEventListener("message", listener)
            }
            if (data.type == "CODEMAO_ENVIRONMENT_WEB_SOCKET_ERROR" && data.id == this.id) {
                this.onerror(data.error ?? data.event)
            }
        }
        window.addEventListener("message", listener)
        getCodemaoWindow().then((codemaoWindow: Window): void => {
            codemaoWindow.postMessage({
                type: "CODEMAO_ENVIRONMENT_WEB_SOCKET",
                id: this.id,
                url
            }, "https://coco.codemao.cn")
        }).catch(this.onerror)
    }

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        getCodemaoWindow().then((codemaoWindow: Window): void => {
            codemaoWindow.postMessage({
                type: "CODEMAO_ENVIRONMENT_WEB_SOCKET_SEND",
                id: this.id,
                data
            }, "https://coco.codemao.cn")
        }).catch(this.onerror)
    }

    public close(this: this): void {
        getCodemaoWindow().then((codemaoWindow: Window): void => {
            codemaoWindow.postMessage({
                type: "CODEMAO_ENVIRONMENT_WEB_SOCKET_CLOSE",
                id: this.id
            }, "https://coco.codemao.cn")
        }).catch(this.onerror)
    }

    public onopen(__event: Event): void {}
    public onmessage(__event: MessageEvent): void {}
    public onclose(__event: CloseEvent): void {}
    public onerror(__event: Event): void {}
}

export const CodemaoLocalStorage: Storage = ((): Storage => {
    if (isNode) {
        return new (class CodemaoLocalStorage implements Storage {

            private filePath: string
            private store: Record<string, string>

            [name: string]: any

            public constructor() {
                this.filePath = require("path").resolve(dirs!.config, "local-storage.json")
                try {
                    this.store = JSON.parse(String(require("fs").readFileSync(this.filePath)))
                } catch (error) {
                    if (error instanceof Error && "code" in error && error.code == "ENOENT") {
                        this.store = {}
                    } else {
                        throw error
                    }
                }
            }

            private save(): void {
                (async (): Promise<void> => {
                    (await import("fs")).promises.writeFile(this.filePath, JSON.stringify(this.store))
                })()
            }

            public get length(): number {
                return Object.keys(this.store).length
            }
            public clear(): void {
                this.store = {}
                this.save()
            }
            public getItem(key: string): string | null {
                return this.store[key] ?? null
            }
            public key(index: number): string | null {
                return Object.values(this.store)[index] ?? null
            }
            public removeItem(key: string): void {
                delete this.store[key]
                this.save()
            }
            public setItem(key: string, value: string): void {
                this.store[key] = value
                this.save()
            }
        })()
    } else if (isBrowser) {
        return localStorage
    } else {
        throw new Error("未知的运行平台")
    }
})()

export async function CodemaoAxios<T>(argument: AxiosRequestConfig): Promise<T> {
    const axios = await import("axios")
    const axiosDefault: <T>(
        argument: AxiosRequestConfig
    ) => Promise<AxiosResponse<T>> = isNode || isCodemaoWindow ? axios.default : CoCoCodemaoEnvironmentServerAxios
    if (isNode && argument.withCredentials) {
        const authorization: string | null = await getAuthorization()
        if (authorization != null) {
            argument.headers ??= {}
            argument.headers["Cookie"] ??= ""
            argument.headers["Cookie"] += `Authorization=${authorization};`
        }
    }
    const response: AxiosResponse<T> = await axiosDefault(argument)
    let { data } = response
    if (
        data != null && typeof data == "object" &&
        "status" in data && typeof data.status == "number" &&
        "text" in data && typeof data.text == "string"
    ) {
        data = JSON.parse(data.text)
    }
    if (
        data != null && typeof data == "object" &&
        "code" in data && typeof data.code == "number" &&
        "msg" in data && typeof data.msg == "string" &&
        "data" in data
    ) {
        if (data.code != 200) {
            throw new axios.AxiosError(
                data.msg,
                data.code.toString(),
                response.config,
                response.request,
                response
            )
        }
        return data.data as T
    }
    return data as T
}

export type CodemaoWebSocket = import("websocket").w3cwebsocket | WebSocket | CoCoCodemaoEnvironmentServerWebSocket

export async function CodemaoWebSocket(url: string): Promise<CodemaoWebSocket> {
    if (isNode) {
        const WebSocket: typeof import("websocket").w3cwebsocket  = (await import("websocket")).w3cwebsocket
        const authorization: string | null = await getAuthorization()
        if (authorization == null) {
            return new WebSocket(url)
        } else {
            return new WebSocket(url, undefined, undefined, {
                Cookie: `Authorization=${authorization};`
            })
        }
    } else if (isCodemaoWindow) {
        return new WebSocket(url)
    } else if (isBrowser) {
        return new CoCoCodemaoEnvironmentServerWebSocket(url)
    } else {
        throw new Error("未知的运行平台")
    }
}
