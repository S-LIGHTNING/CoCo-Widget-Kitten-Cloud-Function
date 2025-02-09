/** 编程猫用户创作者等级。*/ export class CodemaoUserBadge {

    /** 准创作者。*/
    public static readonly QUASI_CREATOR: CodemaoUserBadge =
        new CodemaoUserBadge({
            name: "准创作者"
        })

    /** 积木小白。*/
    public static readonly BLOCK_BEGINNER: CodemaoUserBadge =
        new CodemaoUserBadge({
            name: "积木小白",
            shortName: "小白"
        })

    /** ⭐ 潜力新星。*/
    public static readonly PROMISING_NEW_STAR: CodemaoUserBadge =
        new CodemaoUserBadge({
            name: "⭐ 潜力新星",
            shortName: "⭐ 新星",
            color: "#35699F",
            description: "恭喜你在源码世界中崭露头角\n加油，未来可期",
            imageURL: "https://cdn-community.codemao.cn/community_frontend/asset/badge1_6c95b.png",
            shortImageURL: "https://cdn-community.codemao.cn/community_frontend/asset/badge1-lite_7b1a1.png",
            iconURL: "https://cdn-community.codemao.cn/community_frontend/asset/step_1_a2963.png"
        })

    /** 💎 进阶高手。*/
    public static readonly ADVANCED_MASTER: CodemaoUserBadge =
        new CodemaoUserBadge({
            name: "💎 进阶高手",
            shortName: "💎 高手",
            color: "#206ACB",
            description: "领先源码世界90%的创作者\n拥有卓尔不凡的编程水平",
            imageURL: "https://cdn-community.codemao.cn/community_frontend/asset/badge2_92044.png",
            shortImageURL: "https://cdn-community.codemao.cn/community_frontend/asset/badge2-lite_ad3f7.png",
            iconURL: "https://cdn-community.codemao.cn/community_frontend/asset/step_2_ef50a.png"
        })

    /** 👑 编程大佬。*/
    public static readonly PROGRAMMING_BIG_SHOT: CodemaoUserBadge =
        new CodemaoUserBadge({
            name: "👑 编程大佬",
            shortName: "👑 大佬",
            color: "#DA6627",
            description: "领先源码世界99%的创作者\n拥有出神入化的编程水平",
            imageURL: "https://cdn-community.codemao.cn/community_frontend/asset/badge3_09b3a.png",
            shortImageURL: "https://cdn-community.codemao.cn/community_frontend/asset/dalao_13224.gif",
            iconURL: "https://cdn-community.codemao.cn/community_frontend/asset/step_3_11280.png"
        })

    /** 👑 源码传说。*/
    public static readonly CODE_LEGEND: CodemaoUserBadge =
        new CodemaoUserBadge({
            name: "👑 源码传说",
            shortName: "👑 传说",
            color: "#9F3DCF",
            description: "源码世界巅峰\n传说级别人物",
            imageURL: "https://cdn-community.codemao.cn/community_frontend/asset/badge4_3d2da.png",
            shortImageURL: "https://cdn-community.codemao.cn/community_frontend/asset/chuanshuo_8a57e.gif",
            iconURL: "https://cdn-community.codemao.cn/community_frontend/asset/step_4_4a172.png"
        })

    /** 用户勋章名称。*/ public readonly name: string
    /** 用户勋章短名称。*/ public readonly shortName: string
    /** 用户勋章颜色。*/ public readonly color?: string | undefined
    /** 用户勋章描述。*/ public readonly description?: string | undefined
    /** 用户勋章图像链接。*/ public readonly imageURL?: string | undefined
    /** 用户勋章短图像链接。*/ public readonly shortImageURL?: string | undefined
    /** 用户勋章图标链接。*/ public readonly iconURL?: string | undefined
    /** 用户勋章符号。*/ public readonly symbol: symbol

    public static from(value: number | CodemaoUserBadge): CodemaoUserBadge {
        if (value instanceof CodemaoUserBadge) {
            return value
        }
        return CodemaoUserBadge.parse(value)
    }

    public static parse(value: number): CodemaoUserBadge {
        if (!(value in badgeMap)) {
            throw new Error(`无法识别的创作者勋章：${value}`)
        }
        return badgeMap[value as keyof typeof badgeMap]
    }

    private constructor({
        name, shortName, color, description, imageURL, shortImageURL, iconURL
    }: {
        name: string
        shortName?: string | undefined
        color?: string | undefined
        description?: string | undefined
        imageURL?: string | undefined
        shortImageURL?: string | undefined
        iconURL?: string | undefined
    }) {
        this.name = name
        this.shortName = shortName ?? name
        this.color = color
        this.description = description
        this.imageURL = imageURL
        this.shortImageURL = shortImageURL
        this.iconURL = iconURL
        this.symbol = Symbol(description)
    }
}

const badgeMap = {
    0: CodemaoUserBadge.QUASI_CREATOR,
    1: CodemaoUserBadge.BLOCK_BEGINNER,
    2: CodemaoUserBadge.PROMISING_NEW_STAR,
    3: CodemaoUserBadge.ADVANCED_MASTER,
    4: CodemaoUserBadge.PROGRAMMING_BIG_SHOT,
    5: CodemaoUserBadge.CODE_LEGEND
}
