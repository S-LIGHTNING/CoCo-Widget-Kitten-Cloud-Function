import { enumerable, None } from "../../utils/other"
import { getKittenWorkPublicResource, getNemoWorkPublicResource, getWorkDetail, getWorkInfo } from "../codemao-community-api"
import { CodemaoWorkEditor } from "./codemao-work-editor"

/**
 * 作品信息对象。
 */
export type CodemaoWorkInfoObject = {
    id?: number,
    name?: string,
    type?: CodemaoWorkEditor,
    description?: string,
    operationInstruction?: string,
    publishTime?: Date,
    playerURL?: string,
    shareURL?: string,
    coverURL?: string,
    previewURL?: string,
    viewTimes?: number,
    likeTimes?: number,
    collectTimes?: number,
    shareTimes?: number,
    commentTimes?: number,
    openResource?: boolean
}

type WorkInfoObject = Required<CodemaoWorkInfoObject>

type WorkDetailObject = Pick<Required<CodemaoWorkInfoObject>,
    "id" |
    "name" |
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
    "type" |
    "coverURL" |
    "previewURL" |
    "viewTimes" |
    "likeTimes"
>

type KittenPublicResourceObject = Pick<Required<CodemaoWorkInfoObject>,
    "name" |
    "type" |
    "publishTime"
>

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
 *
 * #### 将来可能集成的API接口：
 * - {@link searchWorkByName}
 *
 * #### API优先级：
 * - 优先使用 {@link getWorkInfo} 接口获取作品信息，该接口包含了作品的全部信息，但是容易出错。
 * - 如果 {@link getWorkInfo} 接口获取失败，则使用 {@link getWorkDetail} 接口获取作品的大部分信息。
 * - 如果 {@link getWorkDetail} 接口获取失败，则使用 {@link getNemoWorkPublicResource} 和 {@link getKittenWorkPublicResource} 接口获取作品的少部分信息。
 * - 如果所有接口都获取失败，则抛出异常，对应属性的值会被拒绝。
 */
export class CodemaoWorkInfo {

    private __workInfo?: Promise<WorkInfoObject>
    private __workDetail?: Promise<WorkDetailObject>
    private __nemoPublicResource?: Promise<NemoPublicResourceObject>
    private __kittenPublicResource?: Promise<KittenPublicResourceObject>

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
                            type: CodemaoWorkEditor.parse(workInfo.type),
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
                        const { workInfo, qrcodeUrl, allowFork } = await getWorkDetail(await this.id)
                        return {
                            id: workInfo.id,
                            name: workInfo.name,
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
                            type: CodemaoWorkEditor.NEMO,
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
                            type: CodemaoWorkEditor.KITTEN,
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

    private __id?: Promise<number>
    private __name?: Promise<string>
    private __type?: Promise<CodemaoWorkEditor>
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
            this.__id = Promise.reject(new Error("没有提供ID"))
        }
        return this.__id
    }

    /**
     * 作品名称。
     */
    @enumerable(true)
    public get name(): Promise<string> {
        if (this.__name == null) {
            this.__name = Promise.any([
                Promise.reject(new Error("没有提供名称")),
                this.workInfo
                    .catch((getWorkInfoError) =>
                        this.workDetail.catch((getWorkDetailError) =>
                            Promise.reject([getWorkInfoError, getWorkDetailError])
                        )
                    ).catch((error0) =>
                        Promise.any([
                            this.nemoWorkPublicResource,
                            this.kittenWorkPublicResource
                        ]).catch((error1) =>
                            Promise.reject([...error0, ...error1.errors])
                        )
                    ).then((info) => info.name)
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__name
    }

    /**
     * 作品使用的编辑器类型，详见 {@link CodemaoWorkEditor}。
     */
    @enumerable(true)
    public get editor(): Promise<CodemaoWorkEditor> {
        if (this.__type == null) {
            this.__type = Promise.any([
                Promise.reject(new Error("没有提供类型")),
                this.workInfo
                    .catch((error0) =>
                        Promise.any([
                            this.nemoWorkPublicResource,
                            this.kittenWorkPublicResource
                        ]).catch((error1) =>
                            Promise.reject([error0, ...error1.errors])
                        )
                    ).then((info) => info.type)
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__type
    }

    /**
     * 作品描述。
     */
    @enumerable(true)
    public get description(): Promise<string> {
        if (this.__description == null) {
            this.__description = Promise.any([
                Promise.reject(new Error("没有提供描述")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).then((info) => info.description)
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__description
    }

    /**
     * 作品操作说明。
     */
    @enumerable(true)
    public get operationInstruction(): Promise<string> {
        if (this.__operationInstruction == null) {
            this.__operationInstruction = Promise.any([
                Promise.reject(new Error("没有提供操作说明")),
                this.workInfo.then((info) => info.operationInstruction)
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this.__operationInstruction
    }

    /**
     * 作品发布时间。
     */
    @enumerable(true)
    public get publishTime(): Promise<Date> {
        if (this.__publishTime == null) {
            this.__publishTime = Promise.any([
                Promise.reject(new Error("没有提供发布时间")),
                this.workInfo
                    .catch((error0) =>
                        this.kittenWorkPublicResource
                            .catch((error1) =>
                                Promise.reject([error0, error1])
                            )
                    ).then((info) => info.publishTime)
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__publishTime
    }

    /**
     * 作品运行器（即 Player）地址。
     */
    @enumerable(true)
    public get playerURL(): Promise<string> {
        if (this.__playerURL == null) {
            this.__playerURL = Promise.any([
                Promise.reject(new Error("没有提供运行器地址")),
                this.workInfo.then((info) => info.playerURL)
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this.__playerURL
    }

    /**
     * 作品分享地址。
     */
    @enumerable(true)
    public get shareURL(): Promise<string> {
        if (this.__shareURL == null) {
            this.__shareURL = Promise.any([
                Promise.reject(new Error("没有提供分享地址")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).then((info) => info.shareURL)
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__shareURL
    }

    /**
     * 作品封面地址。
     */
    @enumerable(true)
    public get coverURL(): Promise<string> {
        if (this.__coverURL == null) {
            this.__coverURL = Promise.any([
                Promise.reject(new Error("没有提供封面地址")),
                this.workInfo
                    .catch((error0) =>
                        this.nemoWorkPublicResource
                            .catch((error1) =>
                                Promise.reject([error0, error1])
                            )
                    ).then((info) => info.coverURL)
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__coverURL
    }

    /**
     * 作品预览地址。
     */
    @enumerable(true)
    public get previewURL(): Promise<string> {
        if (this.__previewURL == null) {
            this.__previewURL = Promise.any([
                Promise.reject(new Error("没有提供预览地址")),
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
                    ).then((info) => info.previewURL)
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__previewURL
    }

    /**
     * 作品被浏览的次数。
     */
    @enumerable(true)
    public get viewTimes(): Promise<number> {
        if (this.__viewTimes == null) {
            this.__viewTimes = Promise.any([
                Promise.reject(new Error("没有提供浏览次数")),
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
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__viewTimes
    }

    /**
     * 点赞该作品的人数。
     */
    @enumerable(true)
    public get likeTimes(): Promise<number> {
        if (this.__likeTimes == null) {
            this.__likeTimes = Promise.any([
                Promise.reject(new Error("没有提供点赞次数")),
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
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__likeTimes
    }

    /**
     * 收藏该作品的人数。
     */
    @enumerable(true)
    public get collectTimes(): Promise<number> {
        if (this.__collectTimes == null) {
            this.__collectTimes = Promise.any([
                Promise.reject(new Error("没有提供收藏次数")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).then((info) => info.collectTimes)
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__collectTimes
    }

    /**
     * 作品被分享的次数。
     */
    @enumerable(true)
    public get shareTimes(): Promise<number> {
        if (this.__shareTimes == null) {
            this.__shareTimes = Promise.any([
                Promise.reject(new Error("没有提供分享次数")),
                this.workInfo.then((info) => info.shareTimes)
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this.__shareTimes
    }

    /**
     * 作品的评论区中评论的数量，包括二级评论。
     */
    @enumerable(true)
    public get commentTimes(): Promise<number> {
        if (this.__commentTimes == null) {
            this.__commentTimes = Promise.any([
                Promise.reject(new Error("没有提供评论次数")),
                this.workInfo.then((info) => info.commentTimes)
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this.__commentTimes
    }

    /**
     * 作品是否是否开源。
     */
    @enumerable(true)
    public get openResource(): Promise<boolean> {
        if (this.__openResource == null) {
            this.__openResource = Promise.any([
                Promise.reject(new Error("没有提供开源状态")),
                this.workInfo
                    .catch((error0) =>
                        this.workDetail.catch((error1) =>
                            Promise.reject([error0, error1])
                        )
                    ).then((info) => info.openResource)
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this.__openResource
    }

    /**
     * @param info 已知的作品信息。
     */
    public constructor(info: CodemaoWorkInfoObject) {
        this.setCache(info)
    }

    public setCache(info: CodemaoWorkInfoObject): void {
        for (let key in info) {
            let value: typeof info[keyof typeof info] = info[key as keyof typeof info]
            if (value != None) {
                Object.defineProperty(this, `__${key}`, {
                    value: Promise.resolve(value),
                    enumerable: false,
                    configurable: true
                })
            }
        }
    }
}
