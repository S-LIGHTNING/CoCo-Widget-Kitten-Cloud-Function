import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import SHA256 from "crypto-js/sha256"
import { CodemaoUserSex } from "./user/codemao-user-sex"
import { LOWER_CASE_LETTER, None, NUMBER_CHAR, randomString } from "../utils/other"

export type UserProfileObject = {
    id: number
    nickname: string
    avatar_url: string
    fullname: string
    sex: number
    birthday: number
    qq: string
    description: string
    grade: number
    programmingBasics: number
    robotBasics: number
    operatingSystem: string[]
    parentalExpectation: string[]
    parentalExpectationInput: string
    grade_desc: string
}

export type ThisUserDetailObject = {
    id: `${number}`,
    nickname: string,
    avatar_url: string,
    email: string,
    gold: number,
    qq: string,
    real_name: string,
    sex: "MALE" | "FEMALE",
    username: string,
    voice_forbidden: boolean,
    birthday: number,
    description: string,
    phone_number: string,
    create_time: number,
    oauths: {
            id: number,
            name: string,
            is_bound: boolean
    }[],
    has_password: boolean,
    user_type: number,
    show_guide_flag: number,
    has_signed: false,
    has_seen_primary_course: number,
    author_level: number
}

export type UserDetailObject = {
    user: {
        id: number,
        nickname: string,
        sex: CodemaoUserSex,
        description: string,
        doing: string,
        level: number,
        avatar: string
    },
    collectionTimes: number,
    forkedTimes: number,
    praiseTimes: number,
    viewTimes: number
}

export type UserHonorObject = {
    user_id: number,
    nickname: string,
    avatar_url: string,
    user_cover: string,
    user_description: string,
    doing: string,
    attention_status: boolean,
    block_total: number,
    re_created_total: number,
    attention_total: number,
    fans_total: number,
    collected_total: number,
    collect_times: number,
    liked_total: number,
    view_times: number,
    author_level: number,
    consume_level: number,
    is_official_certification: number,
    subject_id: number,
    work_shop_name: string,
    work_shop_level: number,
    like_score: number,
    collect_score: number,
    fork_score: number,
    head_frame_type: number,
    head_frame_name: string,
    head_frame_url: string,
    small_head_frame_url: string
}

export type WorkInfoObject = {
    id: number,
    work_name: string,
    type: string,
    ide_type: string,
    operation: string,
    description: string,
    orientation: number,
    parent_id: number,
    parent_user_name: string,
    player_url: string,
    share_url: string,
    unify_share_url: string,
    n_tree_nodes: number,
    view_times: number,
    praise_times: number,
    collect_times: number,
    share_times: number,
    fork_enable: boolean,
    fork_scope: number,
    preview: string,
    bcm_version: string,
    bcm_url: string,
    screenshot_cover_url: string,
    n_roles: number,
    n_brick: number,
    comment_times: number,
    publish_time: number,
    user_info: {
        id: number,
        avatar: string,
        nickname: string,
        fork_user: boolean,
        description: string,
        author_level: number,
        consume_level: number,
        is_official_certification: number,
        head_frame_type: number,
        head_frame_name: string,
        head_frame_url: string,
        small_head_frame_url: string
    },
    abilities: {
        is_collected: boolean,
        is_praised: boolean,
        is_owned: boolean
    },
    work_label_list: {
        label_type: string,
        label_id: number,
        label_name: string
    }[],
    player_display_type: number
}

export type WorkDetailObject = {
    ide_type: string,
    isOwner: boolean,
    isPublish: boolean,
    isFork: boolean,
    isCollection: boolean,
    isPraise: boolean,
    isAttentionUser: boolean,
    ideUrl: string,
    allowFork: number,
    workInfo: {
        id: number,
        user_id: number,
        description: string,
        name: string,
        preview: string,
        praise_times: number,
        collection_times: number,
        fork_times: number,
        view_times: number,
        publish_time: number,
        create_time: number,
        is_old: number,
        isallow_fork: number,
        type: number,
        sub_config: string
    },
    userInfo: {
        id: number,
        nickname: string,
        sex: number,
        avatar: string,
        description: string
    },
    workLabel: {
        id: number,
        name: string,
        type: string
    }[],
    workDisplayUrl: string,
    qrcodeUrl: string
}

export type NemoWorkPublicResourceObject = {
    bcm_version: string,
    n_likes: number,
    name: string,
    preview: string,
    view_times: number,
    work_id: number,
    work_urls: string[],
    user: {
        avatar_url: string,
        id: number,
        nickname: string
    }
}

export type KittenWorkPublicResourceObject = {
    name: string,
    preview: string,
    source_urls: string[],
    is_bcmc: boolean,
    ide_type: string,
    updated_time: number,
    version: string
}

export type KittenNWorkPublicResourceObject = {
    name: string,
    source_urls: string[],
    bcm_url: string,
    bcm_version: `${number}.${number}.${number}`
    preview_url: string,
    update_time: number,
    author_id: `${number}`
    hardware_mode: number
    blink_mode: string
}

async function codemaoAxios<T>(argument: AxiosRequestConfig): Promise<T> {
    try {
        const response: AxiosResponse = await axios(argument)
        let { data } = response
        if (
            data != None && typeof data == "object" &&
            "status" in data && typeof data.status == "number" &&
            "text" in data && typeof data.text == "string"
        ) {
            data = JSON.parse(data.text)
        }
        if (
            data != None && typeof data == "object" &&
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
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error
        }
        const { request, response } = error
        try {
            if (request == None) {
                throw new Error("请求发送失败")
            } else if (response == None) {
                throw new Error("请求已发出，但未收到响应")
            } else {
                const { statusText, data } = response
                if (!(
                    typeof data == "object" &&
                    ("error_message" in data || "error" in data || "msg" in data)
                )) {
                    throw new Error(statusText)
                }
                throw new Error(`${statusText}，${data.error_message ?? data.error ?? data.msg}`)
            }
        } catch (error) {
            if (!(error instanceof Error)) {
                throw error
            }
            throw new Error(`${argument.method} ${argument.url} 失败：${error.message}`)
        }
    }
}

/**
 * https://api.codemao.cn/coconut/clouddb/currentTime
 */
export async function getCurrentTime(): Promise<number> {
    return codemaoAxios({
        method: "GET",
        url: "https://api.codemao.cn/coconut/clouddb/currentTime"
    })
}

let timeDifference: number | None = None

/**
 * 获取本地时间与 {@link getCurrentTime} 的差异
 */
export async function getTimeDifference(): Promise<number> {
    if (timeDifference == None) {
        timeDifference = await getCurrentTime()
    }
    return Math.round(Date.now() / 1000) - timeDifference
}

/**
 * 获取通过 {@link getTimeDifference} 校准过的时间戳
 */
export async function getCalibratedTimestamp(): Promise<number> {
    return Math.round(Date.now() / 1000) - await getTimeDifference()
}

export function getSignUUID(): string {
    let signUUID: string = localStorage.getItem("sign_uuid") ??
        randomString(8, NUMBER_CHAR.concat(LOWER_CASE_LETTER))
    localStorage.setItem("sign_uuid", signUUID)
    return signUUID
}

export function getClientID(): string {
    return getSignUUID()
}

export async function setXCreationToolsDeviceAuth(argument: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    let timestamp: number = await getCalibratedTimestamp()
    let clientID: string = getClientID()
    argument.headers ??= {}
    argument.headers["X-Creation-Tools-Device-Auth"] = JSON.stringify({
        sign: SHA256("pBlYqXbJDu" + timestamp + clientID).toString().toLocaleUpperCase(),
        timestamp,
        client_id: clientID
    })
    return argument
}

/**
 * https://api.codemao.cn/tiger/v3/web/accounts/profile
 *
 * @param authorization 用户凭证，留空则使用浏览器 Cookie
 *
 * @returns 用户信息
 */
export async function getUserProfile(authorization?: string | None): Promise<UserProfileObject> {
    const headers = authorization == null ? {} : { Cookie: `Authorization=${authorization}` }
    return codemaoAxios({
        method: "GET",
        url: "https://api.codemao.cn/tiger/v3/web/accounts/profile",
        withCredentials: true,
        headers
    })
}

/**
 * https://api.codemao.cn/web/users/details
 *
 * 用户被封号时该 API 不可用。
 *
 * @param authorization 用户凭证，留空则使用浏览器 Cookie
 */
export function getThisUserDetail(authorization?: string | None): Promise<ThisUserDetailObject> {
    const headers = authorization == null ? {} : { Cookie: `Authorization=${authorization}` }
    return codemaoAxios({
        method: "GET",
        url: "https://api.codemao.cn/web/users/details",
        withCredentials: true,
        headers
    })
}

/**
 * https://api.codemao.cn/api/user/info/detail/${userID}
 */
export async function getUserDetail(userID: number): Promise<UserDetailObject> {
    return (await codemaoAxios<{ userInfo: UserDetailObject }>({
        method: "GET",
        url: `https://api.codemao.cn/api/user/info/detail/${userID}`,
        withCredentials: true
    })).userInfo
}

/**
 * https://api.codemao.cn/creation-tools/v1/user/center/honor?user_id=${userID}
 */
export function getUserHonor(userID: number): Promise<UserHonorObject> {
    return codemaoAxios({
        method: "GET",
        url: `https://api.codemao.cn/creation-tools/v1/user/center/honor?user_id=${userID}`
    })
}

/**
 * https://api.codemao.cn/creation-tools/v1/works/${workID}
 */
export function getWorkInfo(workID: number): Promise<WorkInfoObject> {
    return codemaoAxios({
        method: "GET",
        url: `https://api.codemao.cn/creation-tools/v1/works/${workID}`
    })
}

/**
 * https://api.codemao.cn/api/work/info/${workID}
 */
export async function getWorkDetail(workID: number): Promise<WorkDetailObject> {
    return (await codemaoAxios<{ workDetail: WorkDetailObject }>({
        method: "GET",
        url: `https://api.codemao.cn/api/work/info/${workID}`
    })).workDetail
}

/**
 * https://api.codemao.cn/creation-tools/v1/works/${workID}/source/public
 */
export function getNemoWorkPublicResource(workID: number): Promise<NemoWorkPublicResourceObject> {
    return codemaoAxios({
        method: "GET",
        url: `https://api.codemao.cn/creation-tools/v1/works/${workID}/source/public`
    })
}

/**
 * https://api-creation.codemao.cn/kitten/r2/work/player/load/${workID}
 */
export function getKittenWorkPublicResource(workID: number): Promise<KittenWorkPublicResourceObject> {
    return codemaoAxios({
        method: "GET",
        url: `https://api-creation.codemao.cn/kitten/r2/work/player/load/${workID}`
    })
}

/**
 * https://api-creation.codemao.cn/neko/community/player/published-work-detail/${workID}
 */
export async function getKittenNWorkPublicResource(workID: number): Promise<KittenNWorkPublicResourceObject> {
    return codemaoAxios(await setXCreationToolsDeviceAuth({
        method: "GET",
        url: `https://api-creation.codemao.cn/neko/community/player/published-work-detail/${workID}`
    }))
}
