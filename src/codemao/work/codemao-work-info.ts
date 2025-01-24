import Promise_any from "@ungap/promise-any"

import { enumerable, None } from "../../utils/other"
import { getKittenNWorkPublicResource as getKitten_NWorkPublicResource, getKittenWorkPublicResource, getNemoWorkPublicResource, getWorkDetail, getWorkInfo } from "../codemao-community-api"
import { CodemaoUser } from "../user/codemao-user"
import { CodemaoUserInfoObject } from "../user/codemao-user-info"
import { CodemaoUserSex } from "../user/codemao-user-sex"
import { CodemaoWorkEditor } from "./codemao-work-editor"

/**
 * 作品信息对象。
 */
export type CodemaoWorkInfoObject = {
    id?: number,
    name?: string,
    author?: CodemaoUser
    editor?: CodemaoWorkEditor
    description?: string
    operationInstruction?: string
    publishTime?: Date
    playerURL?: string
    shareURL?: string
    coverURL?: string
    previewURL?: string
    viewTimes?: number
    likeTimes?: number
    collectTimes?: number
    shareTimes?: number
    commentTimes?: number
    openResource?: boolean
}

type WorkInfoObject = Required<CodemaoWorkInfoObject>

type WorkDetailObject = Pick<Required<CodemaoWorkInfoObject>,
    "id" |
    "name" |
    "author" |
    "description" |
    "publishTime" |
    "shareURL" |
    "previewURL" |
    "viewTimes" |
    "likeTimes" |
    "collectTimes" |
    "openResource"
>

type NemoPublicResourceObject = Pick<Required<CodemaoWorkInfoObject>,
    "id" |
    "name" |
    "author" |
    "editor" |
    "coverURL" |
    "previewURL" |
    "viewTimes" |
    "likeTimes"
>

type KittenPublicResourceObject = Pick<Required<CodemaoWorkInfoObject>,
    "name" |
    "editor" |
    "publishTime"
>

type Kitten_NPublicResourceObject = Pick<Required<CodemaoWorkInfoObject>,
    "name" |
    "author" |
    "editor" |
    "publishTime" |
    "previewURL"
>

async function testWorkEditorByKittenCloud(
    info: CodemaoWorkInfo, editor: CodemaoWorkEditor
): Promise<Pick<Required<CodemaoWorkInfoObject>, "editor">> {

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
            token: "获取失败",
            EIO: 3,
            transport: "websocket"
        },
    }

    const url: string = await (async (): Promise<string> => {
        const scheme: "wss" | "ws" = typeof global == "object" || window.location.protocol == "https:" ? "wss" : "ws"
        const host: string = ["socketcv", "codemao", "cn"].join(".")
        const port = 9096
        const path = "/cloudstorage/"
        const particularParams: object | None = KITTEN_WEB_SOCKET_URL_PARAMS[(await editor).symbol]
        if (particularParams == None) {
            throw new Error(`不支持的作品类型: ${(await editor).name}`)
        }
        const params = `session_id=${await info.id}&${
            Object.entries(particularParams)
            .map(([key, value]: [string, unknown]): string => `${key}=${value}`)
            .join("&")
        }`
        return `${scheme}://${host}:${port}${path}?${params}`
    })()
    const socket = new WebSocket(url)
    return new Promise((
        resolve: (value: Pick<Required<CodemaoWorkInfoObject>, "editor">) => void,
        reject: (reason: Event) => void
    ): void => {
        socket.addEventListener("open", (): void => {
            try {
                socket.close()
            } catch (error) {
                console.error(error)
            }
            resolve({ editor })
        })
        socket.addEventListener("error", (event: Event): void => {
            reject(event)
        })
    })
}

/**
 * ## 编程猫作品信息类
 *
 * - 用于获取编程猫作品信息。
 * - 所有属性均为`Promise`对象，当属性获取失败时访问该属性的值会被拒绝。
 *
 * 提供的作品信息详见类属性
 *
 * ### 具有以下特性：
 * - 集成多个API接口，以确保在部分API接口信息获取失败时仍能提供尽可能完整的作品信息。
 * - 内置懒加载和缓存机制，以减少不必要的请求。
 *
 * ### 集成API接口
 *
 * #### 已经集成的API接口
 * - {@link getWorkInfo}
 * - {@link getWorkDetail}
 * - {@link getNemoWorkPublicResource}
 * - {@link getKittenWorkPublicResource}
 * - {@link getKitten_NWorkPublicResource}
 *
 * #### 将来可能集成的API接口：
 * - {@link searchWorkByName}
 *
 * #### API优先级：
 * - 优先使用 {@link getWorkInfo} 接口获取作品信息，该接口包含了作品的全部信息，但是容易出错。
 * - 如果 {@link getWorkInfo} 接口获取失败，则使用 {@link getWorkDetail} 接口获取作品的大部分信息。
 * - 如果 {@link getWorkDetail} 接口获取失败，则使用 {@link getNemoWorkPublicResource}、{@link getKittenWorkPublicResource} 和 {@link getKitten_NWorkPublicResource} 接口获取作品的少部分信息。
 * - 对于作品编辑器类型而言，如果所有接口都获取失败，还会利用 {@link testWorkEditorByKittenCloud} 试探作品类型。
 * - 如果所有接口都获取失败，则抛出异常，对应属性的值会被拒绝。
 */
export class CodemaoWorkInfo {

    private __workInfo?: Promise<WorkInfoObject>
    private __workDetail?: Promise<WorkDetailObject>
    private __nemoPublicResource?: Promise<NemoPublicResourceObject>
    private __kittenPublicResource?: Promise<KittenPublicResourceObject>
    private __kittenNPublicResource?: Promise<Kitten_NPublicResourceObject>

    @enumerable(false)
    private get workInfo(): Promise<WorkInfoObject> {
        return (async (): Promise<WorkInfoObject> => {
            if (this.__workInfo == None) {
                Object.defineProperty(this, "__workInfo", {
                    value: (async (): Promise<WorkInfoObject> => {
                        const workInfo = await getWorkInfo(await this.id)
                        return {
                            id: workInfo.id,
                            name: workInfo.work_name,
                            author: new CodemaoUser({
                                id: workInfo.user_info.id,
                                nickname: workInfo.user_info.nickname,
                                avatarURL: workInfo.user_info.avatar,
                                description: workInfo.user_info.description,
                                level: workInfo.user_info.author_level
                            }),
                            editor: CodemaoWorkEditor.parse(workInfo.type),
                            description: workInfo.description,
                            operationInstruction: workInfo.operation,
                            publishTime: new Date(workInfo.publish_time * 1000),
                            playerURL: workInfo.player_url,
                            shareURL: workInfo.share_url,
                            coverURL: workInfo.preview,
                            previewURL: workInfo.screenshot_cover_url,
                            viewTimes: workInfo.view_times,
                            likeTimes: workInfo.praise_times,
                            collectTimes: workInfo.collect_times,
                            shareTimes: workInfo.share_times,
                            commentTimes: workInfo.comment_times,
                            openResource: workInfo.fork_enable
                        }
                    })(),
                    enumerable: false,
                    configurable: true
                })
                this.setCache(await this.__workInfo!)
            }
            return await this.__workInfo!
        })()
    }

    @enumerable(false)
    private get workDetail(): Promise<WorkDetailObject> {
        return (async(): Promise<WorkDetailObject> => {
            if (this.__workDetail == None) {
                Object.defineProperty(this, "__workDetail", {
                    value: (async (): Promise<WorkDetailObject> => {
                        const { workInfo, userInfo, qrcodeUrl, allowFork } = await getWorkDetail(await this.id)
                        return {
                            id: workInfo.id,
                            name: workInfo.name,
                            author: new CodemaoUser({
                                id: userInfo.id,
                                nickname: userInfo.nickname,
                                avatarURL: userInfo.avatar,
                                description: userInfo.description,
                                sex: CodemaoUserSex.parse(userInfo.sex)
                            }),
                            description: workInfo.description,
                            publishTime: new Date(workInfo.publish_time * 1000),
                            shareURL: qrcodeUrl,
                            previewURL: workInfo.preview,
                            viewTimes: workInfo.view_times,
                            likeTimes: workInfo.praise_times,
                            collectTimes: workInfo.collection_times,
                            openResource: Boolean(allowFork)
                        }
                    })(),
                    enumerable: false,
                    configurable: true
                })
                this.setCache(await this.__workDetail!)
            }
            return await this.__workDetail!
        })()
    }

    @enumerable(false)
    private get nemoWorkPublicResource(): Promise<NemoPublicResourceObject> {
        return (async(): Promise<NemoPublicResourceObject> => {
            if (this.__nemoPublicResource == None) {
                Object.defineProperty(this, "__nemoPublicResource", {
                    value: (async (): Promise<NemoPublicResourceObject> => {
                        const source = await getNemoWorkPublicResource(await this.id)
                        return {
                            id: source.work_id,
                            name: source.name,
                            author: new CodemaoUser({
                                id: source.user.id,
                                nickname: source.user.nickname,
                                avatarURL: source.user.avatar_url
                            }),
                            editor: CodemaoWorkEditor.NEMO,
                            coverURL: source.preview,
                            previewURL: source.preview,
                            viewTimes: source.view_times,
                            likeTimes: source.n_likes
                        }
                    })(),
                    enumerable: false,
                    configurable: true
                })
                this.setCache(await this.__nemoPublicResource!)
            }
            return await this.__nemoPublicResource!
        })()
    }

    @enumerable(false)
    private get kittenWorkPublicResource(): Promise<KittenPublicResourceObject> {
        return (async(): Promise<KittenPublicResourceObject> => {
            if (this.__kittenPublicResource == null) {
                Object.defineProperty(this, "__kittenPublicResource", {
                    value: (async (): Promise<KittenPublicResourceObject> => {
                        const source = await getKittenWorkPublicResource(await this.id)
                        return {
                            name: source.name,
                            editor: CodemaoWorkEditor.KITTEN,
                            publishTime: new Date(source.updated_time * 1000)
                        }
                    })(),
                    enumerable: false,
                    configurable: true
                })
                this.setCache(await this.__kittenPublicResource!)
            }
            return await this.__kittenPublicResource!
        })()
    }

    @enumerable(false)
    private get kitten_NWorkPublicResource(): Promise<Kitten_NPublicResourceObject> {
        return (async(): Promise<Kitten_NPublicResourceObject> => {
            if (this.__kittenNPublicResource == null) {
                Object.defineProperty(this, "__kittenNPublicResource", {
                    value: (async (): Promise<Kitten_NPublicResourceObject> => {
                        const source = await getKitten_NWorkPublicResource(await this.id)
                        return {
                            name: source.name,
                            author: new CodemaoUser({
                                id: parseInt(source.author_id)
                            }),
                            editor: CodemaoWorkEditor.KITTEN_N,
                            publishTime: new Date(source.update_time * 1000),
                            previewURL: source.preview_url
                        }
                    })(),
                    enumerable: false,
                    configurable: true
                })
                this.setCache(await this.__kittenNPublicResource!)
            }
            return await this.__kittenNPublicResource!
        })()
    }

    private __id?: Promise<number>
    private __name?: Promise<string>
    private __author?: Promise<CodemaoUser>
    private __editor?: Promise<CodemaoWorkEditor>
    private __description?: Promise<string>
    private __operationInstruction?: Promise<string>
    private __publishTime?: Promise<Date>
    private __playerURL?: Promise<string>
    private __shareURL?: Promise<string>
    private __coverURL?: Promise<string>
    private __previewURL?: Promise<string>
    private __viewTimes?: Promise<number>
    private __likeTimes?: Promise<number>
    private __collectTimes?: Promise<number>
    private __shareTimes?: Promise<number>
    private __commentTimes?: Promise<number>
    private __openResource?: Promise<boolean>

    /**
     * 作品 ID。
     */
    @enumerable(true)
    public get id(): Promise<number> {
        if (this.__id == null) {
            this.__id = Promise.reject(["获取作品ID失败", new Error("没有提供作品ID")])
        }
        return this.__id
    }

    /**
     * 作品名称。
     */
    @enumerable(true)
    public get name(): Promise<string> {
        if (this.__name == null) {
            this.__name = Promise_any([
                Promise.reject(new Error("没有提供作品名称")),
                this.workInfo
                    .catch((getWorkInfoError) =>
                        this.workDetail.catch((getWorkDetailError) =>
                            Promise.reject([getWorkInfoError, getWorkDetailError])
                        )
                    ).catch((error0) =>
                        Promise_any([
                            this.nemoWorkPublicResource,
                            this.kittenWorkPublicResource,
                            this.kitten_NWorkPublicResource
                        ]).catch((error1) =>
                            Promise.reject([...error0, ...error1.errors])
                        )
                    ).then((info) => info.name)
            ]).catch(({ errors }) => Promise.reject(["获取作品名称失败", errors[0], ...errors[1]]))
        }
        return this.__name
    }

    /**
     * 作品作者。
     */
    @enumerable(true)
    public get author(): Promise<CodemaoUser> {
        if (this.__author == null) {
            this.__author = Promise_any([
                Promise.reject(new Error("没有提供作品作者")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise_any([
                                this.nemoWorkPublicResource,
                                this.kitten_NWorkPublicResource
                            ]).catch((error2) =>
                                Promise.reject([error0, error1, ...error2.errors])
                            )
                        )
                    ).then((info) => info.author)
            ]).catch(({ errors }) => Promise.reject(["获取作品作者失败", errors[0], ...errors[1]]))
        }
        return this.__author
    }

    /**
     * 作品使用的编辑器类型，详见 {@link CodemaoWorkEditor}。
     */
    @enumerable(true)
    public get editor(): Promise<CodemaoWorkEditor> {
        if (this.__editor == null) {
            this.__editor = Promise_any([
                Promise.reject(new Error("没有提供作品类型")),
                this.workInfo
                    .catch((error0) =>
                        Promise_any([
                            this.nemoWorkPublicResource,
                            this.kittenWorkPublicResource,
                            this.kitten_NWorkPublicResource
                        ]).catch((error1) =>
                            Promise_any([
                                testWorkEditorByKittenCloud(this, CodemaoWorkEditor.NEMO),
                                testWorkEditorByKittenCloud(this, CodemaoWorkEditor.KITTEN),
                                testWorkEditorByKittenCloud(this, CodemaoWorkEditor.KITTENN)
                            ]).catch(error2 =>
                                Promise.reject([error0, ...error1.errors, ...error2.errors]))
                        )
                    ).then((info) => info.editor)
            ]).catch(({ errors }) => Promise.reject(["获取作品类型失败", errors[0], ...errors[1]]))
        }
        return this.__editor
    }

    /**
     * 作品描述。
     */
    @enumerable(true)
    public get description(): Promise<string> {
        if (this.__description == null) {
            this.__description = Promise_any([
                Promise.reject(new Error("没有提供作品描述")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).then((info) => info.description)
            ]).catch(({ errors }) => Promise.reject(["获取作品描述失败", errors[0], ...errors[1]]))
        }
        return this.__description
    }

    /**
     * 作品操作说明。
     */
    @enumerable(true)
    public get operationInstruction(): Promise<string> {
        if (this.__operationInstruction == null) {
            this.__operationInstruction = Promise_any([
                Promise.reject(new Error("没有提供作品操作说明")),
                this.workInfo.then((info) => info.operationInstruction)
            ]).catch(({ errors }) => Promise.reject(["获取作品操作说明失败", ...errors]))
        }
        return this.__operationInstruction
    }

    /**
     * 作品发布时间。
     */
    @enumerable(true)
    public get publishTime(): Promise<Date> {
        if (this.__publishTime == null) {
            this.__publishTime = Promise_any([
                Promise.reject(new Error("没有提供作品发布时间")),
                this.workInfo
                    .catch((error0) =>
                        Promise_any([
                            this.kittenWorkPublicResource,
                            this.kitten_NWorkPublicResource
                        ]).catch((error1) =>
                            Promise.reject([error0, ...error1.errors])
                        )
                    ).then((info) => info.publishTime)
            ]).catch(({ errors }) => Promise.reject(["获取作品发布时间失败", errors[0], ...errors[1]]))
        }
        return this.__publishTime
    }

    /**
     * 作品运行器（即 Player）地址。
     */
    @enumerable(true)
    public get playerURL(): Promise<string> {
        if (this.__playerURL == null) {
            this.__playerURL = Promise_any([
                Promise.reject(new Error("没有提供作品运行器地址")),
                this.workInfo.then((info) => info.playerURL)
            ]).catch(({ errors }) => Promise.reject(["获取作品运行器地址失败", ...errors]))
        }
        return this.__playerURL
    }

    /**
     * 作品分享地址。
     */
    @enumerable(true)
    public get shareURL(): Promise<string> {
        if (this.__shareURL == null) {
            this.__shareURL = Promise_any([
                Promise.reject(new Error("没有提供作品分享地址")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).then((info) => info.shareURL)
            ]).catch(({ errors }) => Promise.reject(["获取作品分享地址失败", errors[0], ...errors[1]]))
        }
        return this.__shareURL
    }

    /**
     * 作品封面地址。
     */
    @enumerable(true)
    public get coverURL(): Promise<string> {
        if (this.__coverURL == null) {
            this.__coverURL = Promise_any([
                Promise.reject(new Error("没有提供作品封面地址")),
                this.workInfo
                    .catch((error0) =>
                        this.nemoWorkPublicResource
                            .catch((error1) =>
                                Promise.reject([error0, error1])
                            )
                    ).then((info) => info.coverURL)
            ]).catch(({ errors }) => Promise.reject(["获取作品封面地址失败", errors[0], ...errors[1]]))
        }
        return this.__coverURL
    }

    /**
     * 作品预览地址。
     */
    @enumerable(true)
    public get previewURL(): Promise<string> {
        if (this.__previewURL == null) {
            this.__previewURL = Promise_any([
                Promise.reject(new Error("没有提供作品预览地址")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).catch((error0) =>
                        Promise_any([
                            this.nemoWorkPublicResource,
                            this.kitten_NWorkPublicResource
                        ]).catch((error1) =>
                            Promise.reject([...error0, ...error1.errors])
                        )
                    ).then((info) => info.previewURL)
            ]).catch(({ errors }) => Promise.reject(["获取作品预览地址失败", errors[0], ...errors[1]]))
        }
        return this.__previewURL
    }

    /**
     * 作品被浏览的次数。
     */
    @enumerable(true)
    public get viewTimes(): Promise<number> {
        if (this.__viewTimes == null) {
            this.__viewTimes = Promise_any([
                Promise.reject(new Error("没有提供作品浏览次数")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).catch((error0) =>
                        this.nemoWorkPublicResource
                            .catch((error1) =>
                                Promise.reject([...error0, error1])
                            )
                    ).then((info) => info.viewTimes)
            ]).catch(({ errors }) => Promise.reject(["获取作品浏览次数失败", errors[0], ...errors[1]]))
        }
        return this.__viewTimes
    }

    /**
     * 点赞该作品的人数。
     */
    @enumerable(true)
    public get likeTimes(): Promise<number> {
        if (this.__likeTimes == null) {
            this.__likeTimes = Promise_any([
                Promise.reject(new Error("没有提供作品点赞次数")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).catch((error0) =>
                        this.nemoWorkPublicResource
                            .catch((error1) =>
                                Promise.reject([...error0, error1])
                            )
                    ).then((info) => info.likeTimes)
            ]).catch(({ errors }) => Promise.reject(["获取作品点赞次数失败", errors[0], ...errors[1]]))
        }
        return this.__likeTimes
    }

    /**
     * 收藏该作品的人数。
     */
    @enumerable(true)
    public get collectTimes(): Promise<number> {
        if (this.__collectTimes == null) {
            this.__collectTimes = Promise_any([
                Promise.reject(new Error("没有提供作品收藏次数")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).then((info) => info.collectTimes)
            ]).catch(({ errors }) => Promise.reject(["获取作品收藏次数失败", errors[0], ...errors[1]]))
        }
        return this.__collectTimes
    }

    /**
     * 作品被分享的次数。
     */
    @enumerable(true)
    public get shareTimes(): Promise<number> {
        if (this.__shareTimes == null) {
            this.__shareTimes = Promise_any([
                Promise.reject(new Error("没有提供作品分享次数")),
                this.workInfo.then((info) => info.shareTimes)
            ]).catch(({ errors }) => Promise.reject(["获取作品分享次数失败", ...errors]))
        }
        return this.__shareTimes
    }

    /**
     * 作品的评论区中评论的数量，包括二级评论。
     */
    @enumerable(true)
    public get commentTimes(): Promise<number> {
        if (this.__commentTimes == null) {
            this.__commentTimes = Promise_any([
                Promise.reject(new Error("没有提供作品评论次数")),
                this.workInfo.then((info) => info.commentTimes)
            ]).catch(({ errors }) => Promise.reject(["获取作品分享次数失败", ...errors]))
        }
        return this.__commentTimes
    }

    /**
     * 作品是否是否开源。
     */
    @enumerable(true)
    public get openResource(): Promise<boolean> {
        if (this.__openResource == null) {
            this.__openResource = Promise_any([
                Promise.reject(new Error("没有提供作品开源状态")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).then((info) => info.openResource)
            ]).catch(({ errors }) => Promise.reject(["获取作品分享次数失败", errors[0], ...errors[1]]))
        }
        return this.__openResource
    }

    /**
     * @param info 已知的作品信息。
     */
    public constructor(info: CodemaoWorkInfoObject) {
        this.setCache(info)
    }

    public async setCache(info: CodemaoWorkInfoObject): Promise<void> {
        for (let key in info) {
            let value: typeof info[keyof typeof info] = info[key as keyof typeof info]
            if (value != None) {
                if (value instanceof CodemaoUser) {
                    if (!("__author" in this)) {
                        this.__author = Promise.resolve(new CodemaoUser({}))
                    }
                    const userInfoObject: CodemaoUserInfoObject = {}
                    for (const key in value) {
                        if (`__${key}` in value) {
                            try {
                                // @ts-ignore
                                userInfoObject[key] = await value[`__${key}`]
                            } catch (error) {
                                console.error(error)
                            }
                        }
                    }
                    ;(await this.__author).info.setCache(userInfoObject)
                } else {
                    Object.defineProperty(this, `__${key}`, {
                        value: Promise.resolve(value),
                        enumerable: false,
                        configurable: true
                    })
                }
            }
        }
    }
}
