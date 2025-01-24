import Promise_any from "@ungap/promise-any"

import { enumerable, None } from "../../utils/other"
import { getThisUserDetail, getUserProfile, getUserDetail, getUserHonor } from "../codemao-community-api"
import { CodemaoUserSex } from "./codemao-user-sex"

/**
 * 用户信息对象。
 */
export type CodemaoUserInfoObject = {
    authorization?: string | None
    id?: number
    username?: string
    nickname?: string
    realname?: string
    avatarURL?: string
    coverURL?: string
    description?: string
    doing?: string
    email?: string
    level?: number
    grade?: number
    birthday?: Date
    sex?: CodemaoUserSex
    viewTimes?: number
    praiseTimes?: number
    collectTimes?: number
    forkTimes?: number
}

type UserProfileObject = Pick<Required<CodemaoUserInfoObject>,
    "id" |
    "nickname" |
    "avatarURL" |
    "description" |
    "grade" |
    "birthday"
>

type ThisUserDetailObject = Pick<Required<CodemaoUserInfoObject>,
    "id" |
    "username" |
    "nickname" |
    "realname" |
    "avatarURL" |
    "description" |
    "email" |
    "birthday" |
    "sex"
>

type UserDetailObject = Pick<Required<CodemaoUserInfoObject>,
    "id" |
    "nickname" |
    "avatarURL" |
    "description" |
    "doing" |
    "level" |
    "sex" |
    "viewTimes" |
    "praiseTimes" |
    "forkTimes"
>

type UserHonorObject = Pick<Required<CodemaoUserInfoObject>,
    "id" |
    "nickname" |
    "avatarURL" |
    "coverURL" |
    "description" |
    "doing" |
    "level" |
    "viewTimes" |
    "praiseTimes" |
    "collectTimes" |
    "forkTimes"
>

/**
 * 编程猫用户信息类。
 *
 * - 用于获取编程猫用户信息。
 * - 所有属性均为`Promise`对象，当属性获取失败时访问该属性的值会被拒绝。
 *
 * 提供的用户信息详见类属性。
 *
 * ### 具有以下特性：
 * - 集成多个API接口，以确保在部分API接口信息获取失败时仍能提供尽可能完整的用户信息。
 * - 内置懒加载和缓存机制，以减少不必要的请求。
 *
 * ### 集成API接口
 *
 * #### 已经集成的API接口
 * - {@link getUserProfile}
 * - {@link getThisUserDetail}
 * - {@link getUserDetail}
 * - {@link getUserHonor}
 *
 * #### 将来可能集成的API接口：
 * - {@link searchUserByName}
 *
 * #### API优先级：
 * {@link getUserProfile} > {@link getThisUserDetail} > {@link getUserDetail} > {@link getUserHonor}
 */
export class CodemaoUserInfo {

    private __profile?: Promise<UserProfileObject>
    private __thisDetail?: Promise<ThisUserDetailObject>
    private __detail?: Promise<UserDetailObject>
    private __honor?: Promise<UserHonorObject>

    private get profile(): Promise<UserProfileObject> {
        return (async (): Promise<UserProfileObject> => {
            if (this.__profile == None) {
                Object.defineProperty(this, "__profile", {
                    value: (async (): Promise<UserProfileObject> => {
                        const profile = await getUserProfile(await this.authorization)
                        return {
                            id: profile.id,
                            nickname: profile.nickname,
                            avatarURL: profile.avatar_url,
                            description: profile.description,
                            grade: profile.grade,
                            birthday: new Date(profile.birthday * 1000),
                        }
                    })(),
                    enumerable: false,
                    configurable: true
                })
                this.setCache(await this.__profile!)
            }
            return this.__profile!
        })()
    }

    private get thisDetail(): Promise<ThisUserDetailObject> {
        return (async (): Promise<ThisUserDetailObject> => {
            if (this.__thisDetail == None) {
                Object.defineProperty(this, "__thisDetail", {
                    value: (async (): Promise<ThisUserDetailObject> => {
                        const userDetail = await getThisUserDetail(await this.authorization)
                        return {
                            id: parseInt(userDetail.id),
                            username: userDetail.username,
                            nickname: userDetail.nickname,
                            realname: userDetail.real_name,
                            avatarURL: userDetail.avatar_url,
                            description: userDetail.description,
                            email: userDetail.email,
                            birthday: new Date(userDetail.birthday * 1000),
                            sex: CodemaoUserSex.from(userDetail.sex),
                        }
                    })(),
                    enumerable: false,
                    configurable: true
                })
                this.setCache(await this.__thisDetail!)
            }
            return this.__thisDetail!
        })()
    }

    private get detail(): Promise<UserDetailObject> {
        return (async (): Promise<UserDetailObject> => {
            if (this.__detail == None) {
                Object.defineProperty(this, "__detail", {
                    value: (async (): Promise<UserDetailObject> => {
                        const userDetail = await getUserDetail(await this.id)
                        return {
                            id: userDetail.user.id,
                            nickname: userDetail.user.nickname,
                            avatarURL: userDetail.user.avatar,
                            description: userDetail.user.description,
                            doing: userDetail.user.doing,
                            level: userDetail.user.level,
                            sex: CodemaoUserSex.from(userDetail.user.sex),
                            viewTimes: userDetail.viewTimes,
                            praiseTimes: userDetail.praiseTimes,
                            forkTimes: userDetail.forkedTimes,
                        }
                    })(),
                    enumerable: false,
                    configurable: true
                })
                this.setCache(await this.__detail!)
            }
            return this.__detail!
        })()
    }

    private get honor(): Promise<UserHonorObject> {
        return (async (): Promise<UserHonorObject> => {
            if (this.__honor == None) {
                Object.defineProperty(this, "__honor", {
                    value: (async (): Promise<UserHonorObject> => {
                        const honor = await getUserHonor(await this.id)
                        return {
                            id: honor.user_id,
                            nickname: honor.nickname,
                            avatarURL: honor.avatar_url,
                            coverURL: honor.user_cover,
                            description: honor.user_description,
                            doing: honor.doing,
                            level: honor.author_level,
                            viewTimes: honor.view_times,
                            praiseTimes: honor.liked_total,
                            collectTimes: honor.collect_times,
                            forkTimes: honor.re_created_total,
                        }
                    })(),
                    enumerable: false,
                    configurable: true
                })
                this.setCache(await this.__honor!)
            }
            return this.__honor!
        })()
    }

    private __authorization?: Promise<string | None>
    private __id?: Promise<number>
    private __username?: Promise<string>
    private __nickname?: Promise<string>
    private __realname?: Promise<string>
    private __avatarURL?: Promise<string>
    private __coverURL?: Promise<string>
    private __description?: Promise<string>
    private __doing?: Promise<string>
    private __email?: Promise<string>
    private __level?: Promise<number>
    private __grade?: Promise<number>
    private __birthday?: Promise<Date>
    private __sex?: Promise<CodemaoUserSex>
    private __viewTimes?: Promise<number>
    private __praiseTimes?: Promise<number>
    private __collectTimes?: Promise<number>
    private __forkTimes?: Promise<number>

    /**
     * 身份信息。
     */
    @enumerable(true)
    public get authorization(): Promise<string | None> {
        if (this.__authorization == None) {
            this.__authorization = Promise.reject(new Error("没有提供身份信息"))
        }
        return this.__authorization
    }

    /**
     * 用户ID。
     */
    @enumerable(true)
    public get id(): Promise<number> {
        if (this.__id == None) {
            this.__id = Promise_any([
                Promise.reject(new Error("没有提供用户ID")),
                this.profile
                   .catch((error0) =>
                        this.thisDetail.catch((error1) => Promise.reject([error0, error1])))
                   .then((info) => info.id),
            ]).catch(({ errors }) => Promise.reject(["获取用户ID失败", errors[0], ...errors[1]]))
        }
        return this.__id
    }

    /**
     * 用户名，用户名可以用于登录编程猫账号。如果用户没有设置用户名，则返回空字符串。
     */
    @enumerable(true)
    public get username(): Promise<string> {
        if (this.__username == None) {
            this.__username = Promise_any([
                Promise.reject(new Error("没有提供用户名")),
                this.thisDetail.then((info) => info.username),
            ]).catch(({ errors }) => Promise.reject(["获取用户名失败", ...errors]))
        }
        return this.__username
    }

    /**
     * 用户昵称。
     */
    @enumerable(true)
    public get nickname(): Promise<string> {
        if (this.__nickname == None) {
            this.__nickname = Promise_any([
                Promise.reject(new Error("没有提供用户昵称")),
                this.profile
                   .catch((error0) =>
                        this.thisDetail.catch((error1) =>
                            this.detail.catch((error2) =>
                                this.honor.catch((error3) =>
                                    Promise.reject([error0, error1, error2, error3])))))
                   .then((info) => info.nickname),
            ]).catch(({ errors }) => Promise.reject(["获取用户昵称失败", errors[0], ...errors[1]]))
        }
        return this.__nickname
    }

    /**
     * 用户真实姓名。如果用户没有填写真实姓名，则返回空字符串。
     */
    @enumerable(true)
    public get realname(): Promise<string> {
        if (this.__realname == None) {
            this.__realname = Promise_any([
                Promise.reject(new Error("没有提供用户真实姓名")),
                this.thisDetail.then((info) => info.realname),
            ]).catch(({ errors }) => Promise.reject(["获取用户真实姓名失败", ...errors]))
        }
        return this.__realname
    }

    /**
     * 用户头像地址。
     */
    @enumerable(true)
    public get avatarURL(): Promise<string> {
        if (this.__avatarURL == None) {
            this.__avatarURL = Promise_any([
                Promise.reject(new Error("没有提供用户头像地址")),
                this.profile
                   .catch((error0) =>
                        this.thisDetail.catch((error1) =>
                            this.detail.catch((error2) =>
                                this.honor.catch((error3) =>
                                    Promise.reject([error0, error1, error2, error3])))))
                   .then((info) => info.avatarURL),
            ]).catch(({ errors }) => Promise.reject(["获取用户头像地址失败", errors[0], ...errors[1]]))
        }
        return this.__avatarURL
    }

    /**
     * 用户背景图片地址。
     */
    @enumerable(true)
    public get coverURL(): Promise<string> {
        if (this.__coverURL == None) {
            this.__coverURL = Promise_any([
                Promise.reject(new Error("没有提供用户背景图片地址")),
                this.honor.then((info) => info.coverURL)
            ]).catch(({ errors }) => Promise.reject(["获取用户背景图片地址失败", ...errors]))
        }
        return this.__coverURL
    }

    /**
     * 用户描述。
     */
    @enumerable(true)
    public get description(): Promise<string> {
        if (this.__description == None) {
            this.__description = Promise_any([
                Promise.reject(new Error("没有提供用户描述")),
                this.profile
                   .catch((error0) =>
                        this.thisDetail.catch((error1) =>
                            this.detail.catch((error2) =>
                                this.honor.catch((error3) =>
                                    Promise.reject([error0, error1, error2, error3])))))
                   .then((info) => info.description),
            ]).catch(({ errors }) => Promise.reject(["获取用户描述失败", errors[0], ...errors[1]]))
        }
        return this.__description
    }

    /**
     * 用户正在做什么。
     */
    @enumerable(true)
    public get doing(): Promise<string> {
        if (this.__doing == None) {
            this.__doing = Promise_any([
                Promise.reject(new Error("没有提供用户正在做什么")),
                this.detail.then((info) => info.doing),
            ]).catch(({ errors }) => Promise.reject(["获取用户正在做什么失败", ...errors]))
        }
        return this.__doing
    }

    /**
     * 用户邮箱地址。
     */
    @enumerable(true)
    public get email(): Promise<string> {
        if (this.__email == None) {
            this.__email = Promise_any([
                Promise.reject(new Error("没有提供用户邮箱")),
                this.thisDetail.then((info) => info.email),
            ]).catch(({ errors }) => Promise.reject(["获取用户邮箱失败", ...errors]))
        }
        return this.__email
    }

    /**
     * 用户级别。
     */
    @enumerable(true)
    public get level(): Promise<number> {
        if (this.__level == None) {
            this.__level = Promise_any([
                Promise.reject(new Error("没有提供用户级别")),
                this.detail.then((info) => info.level),
            ]).catch(({ errors }) => Promise.reject(["获取用户级别失败", ...errors]))
        }
        return this.__level
    }

    /**
     * 用户等级。
     */
    @enumerable(true)
    public get grade(): Promise<number> {
        if (this.__grade == None) {
            this.__grade = Promise_any([
                Promise.reject(new Error("没有提供用户等级")),
                this.profile.then((info) => info.grade),
            ]).catch(({ errors }) => Promise.reject(["获取用户等级失败", ...errors]))
        }
        return this.__grade
    }

    /**
     * 用户生日。
     */
    @enumerable(true)
    public get birthday(): Promise<Date> {
        if (this.__birthday == None) {
            this.__birthday = Promise_any([
                Promise.reject(new Error("没有提供用户生日")),
                this.profile
                    .catch((error0) =>
                        this.thisDetail.catch((error1) =>
                            Promise.reject([error0, error1])))
                    .then((info) => info.birthday),
            ]).catch(({ errors }) => Promise.reject(["获取用户生日失败", errors[0], ...errors[1]]))
        }
        return this.__birthday
    }

    /**
     * 用户性别。详见 {@link CodemaoUserSex}。
     */
    @enumerable(true)
    public get sex(): Promise<CodemaoUserSex> {
        if (this.__sex == None) {
            this.__sex = Promise_any([
                Promise.reject(new Error("没有提供用户性别")),
                this.thisDetail
                    .catch((error0) =>
                        this.detail.catch((error1) =>
                            Promise.reject([error0, error1])))
                    .then((info) => info.sex),
            ]).catch(({ errors }) => Promise.reject(["获取用户性别失败", errors[0], ...errors[1]]))
        }
        return this.__sex
    }

    /**
     * 用户所有作品被浏览的次数总和。
     */
    @enumerable(true)
    public get viewTimes(): Promise<number> {
        if (this.__viewTimes == None) {
            this.__viewTimes = Promise_any([
                Promise.reject(new Error("没有提供用户被浏览次数")),
                this.detail
                    .catch((error0) =>
                        this.honor.catch((error1) =>
                            Promise.reject([error0, error1])))
                    .then((info) => info.viewTimes),
            ]).catch(({ errors }) => Promise.reject(["获取用户被浏览次数失败", errors[0], ...errors[1]]))
        }
        return this.__viewTimes
    }

    /**
     * 用户所有作品被点赞的次数总和。
     */
    @enumerable(true)
    public get praiseTimes(): Promise<number> {
        if (this.__praiseTimes == None) {
            this.__praiseTimes = Promise_any([
                Promise.reject(new Error("没有提供用户被点赞次数")),
                this.detail
                    .catch((error0) =>
                        this.honor.catch((error1) =>
                            Promise.reject([error0, error1])))
                    .then((info) => info.praiseTimes),
            ]).catch(({ errors }) => Promise.reject(["获取用户被点赞次数失败", errors[0], ...errors[1]]))
        }
        return this.__praiseTimes
    }

    /**
     * 用户所有作品被收藏的次数总和。
     */
    @enumerable(true)
    public get collectTimes(): Promise<number> {
        if (this.__collectTimes == None) {
            this.__collectTimes = Promise_any([
                Promise.reject(new Error("没有提供用户被收藏次数")),
                this.honor.then((info) => info.collectTimes),
            ]).catch(({ errors }) => Promise.reject(["获取用户被收藏次数失败", ...errors]))
        }
        return this.__collectTimes
    }

    /**
     * 用户所有作品被再创作的次数总和。
     */
    @enumerable(true)
    public get forkTimes(): Promise<number> {
        if (this.__forkTimes == None) {
            this.__forkTimes = Promise_any([
                Promise.reject(new Error("没有提供用户被再创作次数")),
                this.honor
                    .catch((error0) =>
                        this.detail.catch((error1) =>
                            Promise.reject([error0, error1])))
                    .then((info) => info.forkTimes),
            ]).catch(({ errors }) => Promise.reject(["获取用户被再创作次数失败", errors[0], ...errors[1]]))
        }
        return this.__forkTimes
    }

    /**
     * @param info 已知的用户信息。
     */
    constructor(info: CodemaoUserInfoObject) {
        if (Object.keys(info).length == 0) {
            this.__authorization = Promise.resolve(None)
        } else {
            this.setCache(info)
        }
    }

    public setCache(info: CodemaoUserInfoObject): void {
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
