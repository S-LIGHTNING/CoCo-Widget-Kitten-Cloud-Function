/** 更新来源。*/ export class KittenCloudDataUpdateSource {

    /** 更新来源于本地。*/ static readonly LOCAL: KittenCloudDataUpdateSource = new KittenCloudDataUpdateSource("本地")
    /** 更新来源于云端。*/ static readonly CLOUD: KittenCloudDataUpdateSource = new KittenCloudDataUpdateSource("云端")
    /** 更新来源于撤销。*/ static readonly REVOKE: KittenCloudDataUpdateSource = new KittenCloudDataUpdateSource("撤销")

    /** 更新来源名称。*/ public readonly name: string
    /** 更新来源符号。*/ public readonly symbol: symbol

    private constructor(name: string) {
        this.name = name
        this.symbol = Symbol(name)
    }

    public toString(): string {
        return this.name
    }
}
