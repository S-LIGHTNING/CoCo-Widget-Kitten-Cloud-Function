import { None } from "../../utils/other"
import { getThisUserDetail, getUserProfile, getUserDetail, getUserHonor } from "../codemao-community-api"
import { CodemaoUserSex } from "./codemao-user-sex"

/**
 * 用户信息对象。
 */
export type CodemaoUserInfoObject = {
    authorization?: string | None,
    id?: number,
    username?: string,
    nickname?: string,
    realname?: string,
    avatarURL?: string,
    coverURL?: string,
    description?: string,
    doing?: string,
    email?: string,
    level?: number,
    grade?: number,
    birthday?: Date,
    sex?: CodemaoUserSex,
    viewTimes?: number,
    praiseTimes?: number,
    collectTimes?: number,
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

    private _profile: Promise<UserProfileObject> | None = None
    private _thisDetail: Promise<ThisUserDetailObject> | None = None
    private _detail: Promise<UserDetailObject> | None = None
    private _honor: Promise<UserHonorObject> | None = None

    private get profile(): Promise<UserProfileObject> {
        return (async (): Promise<UserProfileObject> => {
            if (this._profile == None) {
                this._profile = (async (): Promise<UserProfileObject> => {
                    const profile = await getUserProfile(await this.authorization)
                    return {
                        id: profile.id,
                        nickname: profile.nickname,
                        avatarURL: profile.avatar_url,
                        description: profile.description,
                        grade: profile.grade,
                        birthday: new Date(profile.birthday * 1000),
                    }
                })()
                this.set(await this._profile)
            }
            return this._profile
        })()
    }

    private get thisDetail(): Promise<ThisUserDetailObject> {
        return (async (): Promise<ThisUserDetailObject> => {
            if (this._thisDetail == None) {
                this._thisDetail = (async (): Promise<ThisUserDetailObject> => {
                    const userDetail = await getThisUserDetail(await this.authorization)
                    return {
                        id: userDetail.id,
                        username: userDetail.username,
                        nickname: userDetail.nickname,
                        realname: userDetail.real_name,
                        avatarURL: userDetail.avatar_url,
                        description: userDetail.description,
                        email: userDetail.email,
                        birthday: new Date(userDetail.birthday * 1000),
                        sex: CodemaoUserSex.from(userDetail.sex),
                    }
                })()
                this.set(await this._thisDetail)
            }
            return this._thisDetail
        })()
    }

    private get detail(): Promise<UserDetailObject> {
        return (async (): Promise<UserDetailObject> => {
            if (this._detail == None) {
                this._detail = (async (): Promise<UserDetailObject> => {
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
                })()
                this.set(await this._detail)
            }
            return this._detail
        })()
    }

    private get honor(): Promise<UserHonorObject> {
        return (async (): Promise<UserHonorObject> => {
            if (this._honor == None) {
                this._honor = (async (): Promise<UserHonorObject> => {
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
                })()
                this.set(await this._honor)
            }
            return this._honor
        })()
    }

    private _authorization: Promise<string | None> | None = None
    private _id: Promise<number> | None = None
    private _username: Promise<string> | None = None
    private _nickname: Promise<string> | None = None
    private _realname: Promise<string> | None = None
    private _avatarURL: Promise<string> | None = None
    private _coverURL: Promise<string> | None = None
    private _description: Promise<string> | None = None
    private _doing: Promise<string> | None = None
    private _email: Promise<string> | None = None
    private _level: Promise<number> | None = None
    private _grade: Promise<number> | None = None
    private _birthday: Promise<Date> | None = None
    private _sex: Promise<CodemaoUserSex> | None = None
    private _viewTimes: Promise<number> | None = None
    private _praiseTimes: Promise<number> | None = None
    private _collectTimes: Promise<number> | None = None
    private _forkTimes: Promise<number> | None = None

    /**
     * 身份信息。
     */
    public get authorization(): Promise<string | None> {
        if (this._authorization == None) {
            this._authorization = Promise.reject(new Error("没有提供身份信息"))
        }
        return this._authorization
    }

    /**
     * 用户ID。
     */
    public get id(): Promise<number> {
        if (this._id == None) {
            this._id = Promise.any([
                Promise.reject(new Error("没有提供ID")),
                this.profile
                   .catch((error0) =>
                        this.thisDetail.catch((error1) => Promise.reject([error0, error1])))
                   .then((info) => info.id),
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this._id
    }

    /**
     * 用户名，用户名可以用于登录编程猫账号。如果用户没有设置用户名，则返回空字符串。
     */
    public get username(): Promise<string> {
        if (this._username == None) {
            this._username = Promise.any([
                Promise.reject(new Error("没有提供用户名")),
                this.thisDetail.then((info) => info.username),
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this._username
    }

    /**
     * 用户昵称。
     */
    public get nickname(): Promise<string> {
        if (this._nickname == None) {
            this._nickname = Promise.any([
                Promise.reject(new Error("没有提供昵称")),
                this.profile
                   .catch((error0) =>
                        this.thisDetail.catch((error1) =>
                            this.detail.catch((error2) =>
                                this.honor.catch((error3) =>
                                    Promise.reject([error0, error1, error2, error3])))))
                   .then((info) => info.nickname),
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this._nickname
    }

    /**
     * 用户真实姓名。如果用户没有填写真实姓名，则返回空字符串。
     */
    public get realname(): Promise<string> {
        if (this._realname == None) {
            this._realname = Promise.any([
                Promise.reject(new Error("没有提供真实姓名")),
                this.thisDetail.then((info) => info.realname),
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this._realname
    }

    /**
     * 用户头像地址。
     */
    public get avatarURL(): Promise<string> {
        if (this._avatarURL == None) {
            this._avatarURL = Promise.any([
                Promise.reject(new Error("没有提供头像地址")),
                this.profile
                   .catch((error0) =>
                        this.thisDetail.catch((error1) =>
                            this.detail.catch((error2) =>
                                this.honor.catch((error3) =>
                                    Promise.reject([error0, error1, error2, error3])))))
                   .then((info) => info.avatarURL),
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this._avatarURL
    }

    /**
     * 用户背景图片地址。
     */
    public get coverURL(): Promise<string> {
        if (this._coverURL == None) {
            this._coverURL = Promise.any([
                Promise.reject(new Error("没有提供背景图片地址")),
                this.honor.then((info) => info.coverURL)
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this._coverURL
    }

    /**
     * 用户描述。
     */
    public get description(): Promise<string> {
        if (this._description == None) {
            this._description = Promise.any([
                Promise.reject(new Error("没有提供描述")),
                this.profile
                   .catch((error0) =>
                        this.thisDetail.catch((error1) =>
                            this.detail.catch((error2) =>
                                this.honor.catch((error3) =>
                                    Promise.reject([error0, error1, error2, error3])))))
                   .then((info) => info.description),
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this._description
    }

    /**
     * 用户正在做什么。
     */
    public get doing(): Promise<string> {
        if (this._doing == None) {
            this._doing = Promise.any([
                Promise.reject(new Error("没有提供正在做什么")),
                this.detail.then((info) => info.doing),
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this._doing
    }

    /**
     * 用户邮箱地址。
     */
    public get email(): Promise<string> {
        if (this._email == None) {
            this._email = Promise.any([
                Promise.reject(new Error("没有提供邮箱")),
                this.thisDetail.then((info) => info.email),
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this._email
    }

    /**
     * 用户级别。
     */
    public get level(): Promise<number> {
        if (this._level == None) {
            this._level = Promise.any([
                Promise.reject(new Error("没有提供级别")),
                this.detail.then((info) => info.level),
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this._level
    }

    /**
     * 用户等级。
     */
    public get grade(): Promise<number> {
        if (this._grade == None) {
            this._grade = Promise.any([
                Promise.reject(new Error("没有提供等级")),
                this.profile.then((info) => info.grade),
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this._grade
    }

    /**
     * 用户生日。
     */
    public get birthday(): Promise<Date> {
        if (this._birthday == None) {
            this._birthday = Promise.any([
                Promise.reject(new Error("没有提供生日")),
                this.profile
                    .catch((error0) =>
                        this.thisDetail.catch((error1) =>
                            Promise.reject([error0, error1])))
                    .then((info) => info.birthday),
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this._birthday
    }

    /**
     * 用户性别。详见 {@link CodemaoUserSex}。
     */
    public get sex(): Promise<CodemaoUserSex> {
        if (this._sex == None) {
            this._sex = Promise.any([
                Promise.reject(new Error("没有提供性别")),
                this.thisDetail
                    .catch((error0) =>
                        this.detail.catch((error1) =>
                            Promise.reject([error0, error1])))
                    .then((info) => info.sex),
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this._sex
    }

    /**
     * 用户所有作品被浏览的次数总和。
     */
    public get viewTimes(): Promise<number> {
        if (this._viewTimes == None) {
            this._viewTimes = Promise.any([
                Promise.reject(new Error("没有提供浏览次数")),
                this.detail
                    .catch((error0) =>
                        this.honor.catch((error1) =>
                            Promise.reject([error0, error1])))
                    .then((info) => info.viewTimes),
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this._viewTimes
    }

    /**
     * 用户所有作品被点赞的次数总和。
     */
    public get praiseTimes(): Promise<number> {
        if (this._praiseTimes == None) {
            this._praiseTimes = Promise.any([
                Promise.reject(new Error("没有提供点赞次数")),
                this.detail
                    .catch((error0) =>
                        this.honor.catch((error1) =>
                            Promise.reject([error0, error1])))
                    .then((info) => info.praiseTimes),
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this._praiseTimes
    }

    /**
     * 用户所有作品被收藏的次数总和。
     */
    public get collectTimes(): Promise<number> {
        if (this._collectTimes == None) {
            this._collectTimes = Promise.any([
                Promise.reject(new Error("没有提供收藏次数")),
                this.honor.then((info) => info.collectTimes),
            ]).catch(({ errors }) => Promise.reject(errors))
        }
        return this._collectTimes
    }

    /**
     * 用户所有作品被再创作的次数总和。
     */
    public get forkTimes(): Promise<number> {
        if (this._forkTimes == None) {
            this._forkTimes = Promise.any([
                Promise.reject(new Error("没有提供再创作次数")),
                this.honor
                    .catch((error0) =>
                        this.detail.catch((error1) =>
                            Promise.reject([error0, error1])))
                    .then((info) => info.forkTimes),
            ]).catch(({ errors }) => Promise.reject([errors[0], ...errors[1]]))
        }
        return this._forkTimes
    }

    /**
     * @param info 已知的用户信息。
     */
    constructor(info: CodemaoUserInfoObject) {
        if (Object.keys(info).length == 0) {
            this._authorization = Promise.resolve(None)
        } else {
            this.set(info)
        }
    }

    public set(info: CodemaoUserInfoObject): void {
        if (info.authorization != None) this._authorization = Promise.resolve(info.authorization)
        if (info.id != None) this._id = Promise.resolve(info.id)
        if (info.username != None) this._username = Promise.resolve(info.username)
        if (info.nickname != None) this._nickname = Promise.resolve(info.nickname)
        if (info.realname != None) this._nickname = Promise.resolve(info.realname)
        if (info.avatarURL != None) this._avatarURL = Promise.resolve(info.avatarURL)
        if (info.coverURL != None) this._coverURL = Promise.resolve(info.coverURL)
        if (info.description != None) this._description = Promise.resolve(info.description)
        if (info.doing != None) this._doing = Promise.resolve(info.doing)
        if (info.email != None) this._email = Promise.resolve(info.email)
        if (info.level != None) this._level = Promise.resolve(info.level)
        if (info.grade != None) this._grade = Promise.resolve(info.grade)
        if (info.birthday != None) this._birthday = Promise.resolve(info.birthday)
        if (info.sex != None) this._sex = Promise.resolve(info.sex)
        if (info.viewTimes != None) this._viewTimes = Promise.resolve(info.viewTimes)
        if (info.praiseTimes != None) this._praiseTimes = Promise.resolve(info.praiseTimes)
        if (info.collectTimes != None) this._collectTimes = Promise.resolve(info.collectTimes)
        if (info.forkTimes != None) this._forkTimes = Promise.resolve(info.forkTimes)
    }
}
