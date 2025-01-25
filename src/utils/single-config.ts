import { None } from "./other"
import { Signal } from "./signal"

export type ConfigChange<T> = {
    originalValue: T,
    newValue: T
}

/**
 * 单个配置。
 */
export class SingleConfig<T> {

    private upper: SingleConfig<T> | T

    private store: T | None
    private cache: T

    /**
     *
     */
    public changed: Signal<ConfigChange<T>> = new Signal()

    /**
     * 获取配置值。
     */
    public get config(): T | None {
        return this.store
    }
    /**
     * 设置配置值。
     *
     * 注意：设置配置值需要进行多级缓存更新，这是一个较慢的操作，建议不要频繁修改配置。
     */
    public set config(value: T | None) {
        const originalValue: T = this.getValue()
        this.store = value
        const newValue: T = this.getValue()
        if (originalValue != newValue) {
            this.cache = newValue
            this.changed.emit({ originalValue, newValue })
        }
    }

    /**
     * 获取配置的生效值。
     *
     * 当配置值非空时，该值为配置值，否则为上层或上层的生效值。
     */
    public get value(): T {
        return this.cache
    }
    public set value(value: T) {
        this.config = value
    }

    private getValue(): T {
        if (this.store != None) {
            return this.store
        } else if (this.upper instanceof SingleConfig) {
            return this.upper.value
        } else {
            return this.upper
        }
    }

    public constructor(upper: SingleConfig<T> | T, value: T | None) {
        this.upper = upper
        this.store = value

        this.cache = this.getValue()

        if (upper instanceof SingleConfig) {
            upper.changed.connect((change: ConfigChange<T>): void => {
                if (this.store == None) {
                    this.cache = upper.value
                    this.changed.emit(change)
                }
            })
        }
    }
}
