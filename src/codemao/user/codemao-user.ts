import { getCodemaoIFrameElement, getCodemaoWindow, isCodemaoWindow } from "../codemao-environment"
import { CodemaoUserInfo, CodemaoUserInfoObject } from "./codemao-user-info"

/**
 * 编程猫用户。
 */
export class CodemaoUser {

    /**
     * 设置身份，仅在 Node 中可用。
     */
    public static async setAuthorization(authorization: string): Promise<void> {
        const path: typeof import("path") = await import("path")
        const { mkdir, writeFile } = (await import("fs")).promises
        const appDirs: typeof import("appdirsjs").default = (await import("appdirsjs")).default
        const configPath: string = appDirs({ appName: "SLIGHTNING/Codemao-Community" }).config
        await mkdir(configPath, { recursive: true })
        await writeFile(path.resolve(configPath, "authorization.txt"), authorization)
    }

    /**
     * 请求用户登录编程猫账号，仅在浏览器中可用。
     */
    public static async userLogInInBrowser(): Promise<boolean> {
        if (isCodemaoWindow) {
            location.replace("https://shequ.codemao.cn/mobile/login")
        }
        return new Promise((
            resolve: (value: boolean) => void,
            reject: (reason: unknown) => void
        ): void => {
            (async (): Promise<void> => {
                const codemaoWindow: Window = await getCodemaoWindow()
                const codemaoIFrameElement: HTMLIFrameElement | null = getCodemaoIFrameElement()
                if (codemaoIFrameElement != null) {
                    codemaoIFrameElement.style.width = "100%"
                    codemaoIFrameElement.style.height = "100%"
                    codemaoIFrameElement.style.display = "block"
                    codemaoIFrameElement.style.position = "fixed"
                    codemaoIFrameElement.style.left = "0px"
                    codemaoIFrameElement.style.top = "0px"
                    codemaoIFrameElement.style.right = "0px"
                    codemaoIFrameElement.style.bottom = "0px"
                    codemaoIFrameElement.style.border = "none"
                    codemaoIFrameElement.style.backgroundColor = "white"
                    codemaoIFrameElement.style.cursor = "pointer"
                    codemaoIFrameElement.style.zIndex = "10000"
                }
                codemaoWindow.postMessage({
                    type: "CODEMAO_ENVIRONMENT_LOGIN"
                }, "https://coco.codemao.cn")
                function listener(event: MessageEvent): void {
                    const { data } = event
                    if (data == null || typeof data != "object") {
                        return
                    }
                    if (
                        /^https?:\/\/coco\.codemao\.cn$/.test(event.origin) &&
                        data.type == "COCO_CODEMAO_API_ENVIRONMENT_SERVER_INIT"
                    ) {
                        window.removeEventListener("message", listener)
                        if (codemaoIFrameElement != null) {
                            codemaoIFrameElement.style.display = "none"
                        }
                        resolve(true)
                    }
                }
                window.addEventListener("message", listener)
            })().catch(reject)
        })
    }

    /**
     * 用户信息，详见{@link CodemaoUserInfo}。
     */
    public info: CodemaoUserInfo

    /**
     * @param info 已知用户信息，如果什么信息都不提供，则表示表示当前登录的用户。
     */
    public constructor(info: CodemaoUserInfoObject = {}) {
        this.info = new CodemaoUserInfo(info)
    }
}
