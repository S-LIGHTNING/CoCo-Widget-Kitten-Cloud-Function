import type { AxiosRequestConfig } from "axios"

import { CodemaoUserSex } from "./user/codemao-user-sex"
import { LOWER_CASE_LETTER, NUMBER_CHAR, randomString } from "../utils/other"
import { CodemaoAxios, CodemaoLocalStorage } from "./codemao-environment"

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

/**
 * https://api.codemao.cn/coconut/clouddb/currentTime
 */
export async function getCurrentTime(): Promise<number> {
    return CodemaoAxios({
        method: "GET",
        url: "https://api.codemao.cn/coconut/clouddb/currentTime"
    })
}

let timeDifference: number | null = null

/**
 * 获取本地时间与 {@link getCurrentTime} 的差异
 */
export async function getTimeDifference(): Promise<number> {
    if (timeDifference == null) {
        timeDifference = Math.round(Date.now() / 1000) - await getCurrentTime()
    }
    return timeDifference
}

/**
 * 获取通过 {@link getTimeDifference} 校准过的时间戳
 */
export async function getCalibratedTimestamp(): Promise<number> {
    return Math.round(Date.now() / 1000) - await getTimeDifference()
}

export function getSignUUID(): string {
    let signUUID: string = CodemaoLocalStorage.getItem("sign_uuid") ??
        randomString(8, NUMBER_CHAR.concat(LOWER_CASE_LETTER))
    CodemaoLocalStorage.setItem("sign_uuid", signUUID)
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
        sign: (await import("crypto-js")).SHA256("pBlYqXbJDu" + timestamp + clientID).toString().toLocaleUpperCase(),
        timestamp,
        client_id: clientID
    })
    return argument
}

/**
 * https://api.codemao.cn/tiger/v3/web/accounts/profile
 *
 * @param authorization 用户凭证，留空则使用默认 Cookie
 *
 * @returns 用户信息
 */
export async function getUserProfile(authorization?: string | null): Promise<UserProfileObject> {
    const headers: { Cookie?: string } = authorization == null ? {} : { Cookie: `Authorization=${authorization}` }
    return CodemaoAxios({
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
 * @param authorization 用户凭证，留空则使用默认 Cookie
 */
export function getThisUserDetail(authorization?: string | null): Promise<ThisUserDetailObject> {
    const headers: { Cookie?: string } = authorization == null ? {} : { Cookie: `Authorization=${authorization}` }
    return CodemaoAxios({
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
    return (await CodemaoAxios<{ userInfo: UserDetailObject }>({
        method: "GET",
        url: `https://api.codemao.cn/api/user/info/detail/${userID}`,
        withCredentials: true
    })).userInfo
}

/**
 * https://api.codemao.cn/creation-tools/v1/user/center/honor?user_id=${userID}
 */
export function getUserHonor(userID: number): Promise<UserHonorObject> {
    return CodemaoAxios({
        method: "GET",
        url: `https://api.codemao.cn/creation-tools/v1/user/center/honor?user_id=${userID}`
    })
}

/**
 * https://api.codemao.cn/creation-tools/v1/works/${workID}
 */
export function getWorkInfo(workID: number): Promise<WorkInfoObject> {
    return CodemaoAxios({
        method: "GET",
        url: `https://api.codemao.cn/creation-tools/v1/works/${workID}`
    })
}

/**
 * https://api.codemao.cn/api/work/info/${workID}
 */
export async function getWorkDetail(workID: number): Promise<WorkDetailObject> {
    return (await CodemaoAxios<{ workDetail: WorkDetailObject }>({
        method: "GET",
        url: `https://api.codemao.cn/api/work/info/${workID}`
    })).workDetail
}

/**
 * https://api.codemao.cn/creation-tools/v1/works/${workID}/source/public
 */
export function getNemoWorkPublicResource(workID: number): Promise<NemoWorkPublicResourceObject> {
    return CodemaoAxios({
        method: "GET",
        url: `https://api.codemao.cn/creation-tools/v1/works/${workID}/source/public`
    })
}

/**
 * https://api-creation.codemao.cn/kitten/r2/work/player/load/${workID}
 */
export function getKittenWorkPublicResource(workID: number): Promise<KittenWorkPublicResourceObject> {
    return CodemaoAxios({
        method: "GET",
        url: `https://api-creation.codemao.cn/kitten/r2/work/player/load/${workID}`
    })
}

/**
 * https://api-creation.codemao.cn/neko/community/player/published-work-detail/${workID}
 */
export async function getKittenNWorkPublicResource(workID: number): Promise<KittenNWorkPublicResourceObject> {
    return CodemaoAxios(await setXCreationToolsDeviceAuth({
        method: "GET",
        url: `https://api-creation.codemao.cn/neko/community/player/published-work-detail/${workID}`
    }))
}
