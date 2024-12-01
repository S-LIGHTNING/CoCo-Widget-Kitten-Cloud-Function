import { KittenCloudFunction } from "../../kitten-cloud-function"
import { Signal } from "../../utils/signal"
import { KittenCloudVariableGroup } from "./group/kitten-cloud-variable-group"
import { KittenCloudData } from "./kitten-cloud-data"
import { KittenCloudDataUpdateSource } from "./update/kitten-cloud-data-update-source"

/**
 * 云变量的值的类型。
 */
export type KittenCloudVariableValue = number | string

/**
 * 云变量变化消息的类型，当云变量的值被改变时会收到此消息，详见{@link KittenCloudVariable.changed}。
 */
export type KittenCloudVariableChangeMessageObject = {
    source: KittenCloudDataUpdateSource,
    originalValue: KittenCloudVariableValue,
    newValue: KittenCloudVariableValue
}

/**
 * 云变量
 */
export abstract class KittenCloudVariable extends KittenCloudData {

    /**
     * 云变量的值改变信号，当云变量的值发生改变时触发此信号。
     *
     * 变化消息类型详见{@link KittenCloudVariableChangeMessageObject}。
     */
    public readonly changed: Signal<KittenCloudVariableChangeMessageObject>

    public constructor(
        connection: KittenCloudFunction,
        public override readonly group: KittenCloudVariableGroup,
        cvid: string,
        name: string,
        public value: KittenCloudVariableValue
    ) {
        super(connection, group, cvid, name)
        this.changed = new Signal()
    }

    public abstract set(value: KittenCloudVariableValue): void

    /**
     * 获取云变量的值。
     *
     * @returns 云变量的值
     */
    public get(this: this): KittenCloudVariableValue {
        return this.value
    }
}
