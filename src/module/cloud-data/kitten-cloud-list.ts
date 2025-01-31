import { __diff, KittenCloudFunction } from "../../kitten-cloud-function"
import { None } from "../../utils/other"
import { Signal } from "../../utils/signal"
import { KittenCloudListGroup } from "./group/kitten-cloud-list-group"
import { KittenCloudData } from "./kitten-cloud-data"
import { KittenCloudListAddCommand } from "./update/command/kitten-cloud-list-add-command"
import { KittenCloudListEmptyCommand } from "./update/command/kitten-cloud-list-empty-command"
import { KittenCloudListPopCommand } from "./update/command/kitten-cloud-list-pop-command"
import { KittenCloudListPushCommand } from "./update/command/kitten-cloud-list-push-command"
import { KittenCloudListRemoveCommand } from "./update/command/kitten-cloud-list-remove-command"
import { KittenCloudListReplaceCommand } from "./update/command/kitten-cloud-list-replace-command"
import { KittenCloudListReplaceLastCommand } from "./update/command/kitten-cloud-list-replace-last-command"
import { KittenCloudListUnshiftCommand } from "./update/command/kitten-cloud-list-unshift-command"
import { KittenCloudListUpdateCommand } from "./update/command/kitten-cloud-list-update-command"
import { KittenCloudDataUpdateSource } from "./update/kitten-cloud-data-update-source"

import { ArrayChange } from "diff"

/**
 * 云列表项的值的类型。
 */
export type KittenCloudListItemValue = number | string

/**
 * 云列表添加尾项消息的类型，当云列表添加尾项时会收到此消息，详见 {@link KittenCloudList.pushed}。
 */
export type KittenCloudListPushMessageObject = {
    source: KittenCloudDataUpdateSource,
    item: KittenCloudListItemValue
}
/**
 * 云列表添加首项消息的类型，当云列表添加首项时会收到此消息，详见 {@link KittenCloudList.unshifted}。
 */
export type KittenCloudListUnshiftMessageObject = {
    source: KittenCloudDataUpdateSource,
    item: KittenCloudListItemValue
}
/**
 * 云列表添加项到指定位置消息的类型，当云列表添加项到指定位置时会收到此消息，详见 {@link KittenCloudList.added}。
 */
export type KittenCloudListAddMessageObject = {
    source: KittenCloudDataUpdateSource,
    index: number,
    item: KittenCloudListItemValue
}
/**
 * 云列表移除最后一项消息的类型，当云列表删除最后一项时会收到此消息，详见 {@link KittenCloudList.popped}。
 */
export type KittenCloudListPopMessageObject = {
    source: KittenCloudDataUpdateSource,
    item: KittenCloudListItemValue
}
/**
 * 云列表移除指定项消息的类型，当云列表删除指定项时会收到此消息，详见 {@link KittenCloudList.removed}。
 */
export type KittenCloudListRemoveMessageObject = {
    source: KittenCloudDataUpdateSource,
    index: number,
    item: KittenCloudListItemValue
}
/**
 * 云列表清空消息的类型，当云列表清空时会收到此消息，详见 {@link KittenCloudList.emptied}。
 */
export type KittenCloudListEmptyMessageObject = {
    source: KittenCloudDataUpdateSource,
    list: KittenCloudListItemValue[]
}
/**
 * 云列替换最后一项消息的类型，当云列表替换最后一项时会收到此消息，详见 {@link KittenCloudList.replacedLast}。
 */
export type KittenCloudListReplaceLastMessageObject = {
    source: KittenCloudDataUpdateSource,
    originalItem: KittenCloudListItemValue,
    newItem: KittenCloudListItemValue
}
/**
 * 云列替换指定项消息的类型，当云列表替换指定项时会收到此消息，详见 {@link KittenCloudList.replaced}。
 */
export type KittenCloudListReplaceMessageObject = {
    source: KittenCloudDataUpdateSource,
    index: number,
    originalItem: KittenCloudListItemValue,
    newItem: KittenCloudListItemValue
}
/**
 * 云列替换所有项消息的类型，当云列表替换所有项时会收到此消息，详见 {@link KittenCloudList.replacedAll}。
 */
export type KittenCloudListReplaceAllMessageObject = {
    source: KittenCloudDataUpdateSource,
    originalList: KittenCloudListItemValue[],
    newList: KittenCloudListItemValue[]
}

/**
 * 云列表。
 */
export class KittenCloudList extends KittenCloudData {

    /**
     * 添加尾项信号，当云列表添加尾项时触发此信号。
     *
     * 添加尾项消息类型详见 {@link KittenCloudListPushMessageObject}。
     */
    public pushed: Signal<KittenCloudListPushMessageObject>
    /**
     * 添加首项信号，当云列表添加首项时触发此信号。
     *
     * 添加首项消息类型详见 {@link KittenCloudListUnshiftMessageObject}。
     */
    public unshifted: Signal<KittenCloudListUnshiftMessageObject>
    /**
     * 添加项到指定位置信号，当云列表添加项到指定位置时触发此信号。
     *
     * 添加项到指定位置消息类型详见 {@link KittenCloudListAddMessageObject}。
     */
    public added: Signal<KittenCloudListAddMessageObject>
    /**
     * 移除最后一项信号，当云列表删除最后一项时触发此信号。
     *
     * 移除最后一项消息类型详见 {@link KittenCloudListPopMessageObject}。
     */
    public popped: Signal<KittenCloudListPopMessageObject>
    /**
     * 移除指定项信号，当云列表删除指定项时触发此信号。
     *
     * 移除指定项消息类型详见 {@link KittenCloudListRemoveMessageObject}。
     */
    public removed: Signal<KittenCloudListRemoveMessageObject>
    /**
     * 清空信号，当云列表清空时触发此信号。
     *
     * 清空消息类型详见 {@link KittenCloudListEmptyMessageObject}。
     */
    public emptied: Signal<KittenCloudListEmptyMessageObject>
    /**
     * 替换最后一项信号，当云列表替换最后一项时触发此信号。
     *
     * 替换最后一项消息类型详见 {@link KittenCloudListReplaceLastMessageObject}。
     */
    public replacedLast: Signal<KittenCloudListReplaceLastMessageObject>
    /**
     * 替换指定项信号，当云列表替换指定项时触发此信号。
     *
     * 替换指定项消息类型详见 {@link KittenCloudListReplaceMessageObject}。
     */
    public replaced: Signal<KittenCloudListReplaceMessageObject>
    /**
     * 替换所有项信号，当云列表替换所有项时触发此信号。
     *
     * 替换所有项消息类型详见 {@link KittenCloudListReplaceAllMessageObject}。
     */
    public replacedAll: Signal<KittenCloudListReplaceAllMessageObject>

    public constructor(
        connection: KittenCloudFunction,
        public override readonly group: KittenCloudListGroup,
        cvid: string,
        name: string,
        public value: KittenCloudListItemValue[]
    ) {
        super(connection, group, cvid, name)
        this.pushed = new Signal()
        this.unshifted = new Signal()
        this.added = new Signal()
        this.popped = new Signal()
        this.removed = new Signal()
        this.emptied = new Signal()
        this.replacedLast = new Signal()
        this.replaced = new Signal()
        this.replacedAll = new Signal()
    }

    public override update(this: this, value: KittenCloudListItemValue[]): void {
        const diff: KittenCloudListUpdateCommand[] =
            this.compareTo(KittenCloudDataUpdateSource.CLOUD, value)
        for (const command of diff) {
            this.updateManager.addUpdateCommand(command)
        }
    }

    private compareTo(
        this: this, source: KittenCloudDataUpdateSource, value: KittenCloudListItemValue[]
    ): KittenCloudListUpdateCommand[] {
        if (__diff == null) {
            throw new Error("diff 未导入")
        }
        const diff: ArrayChange<KittenCloudListItemValue>[] = __diff.diffArrays(this.value, value)
        let position: number = 0
        const result: KittenCloudListUpdateCommand[] = []
        for (const change of diff) {
            if (!change.removed && !change.added) {
                position += change.value.length
            } else if (change.removed) {
                for (let i: number = 0; i < change.value.length; i++) {
                    result.push(new KittenCloudListRemoveCommand(
                        source, this, position
                    ))
                }
            } else if (change.added) {
                let value: KittenCloudListItemValue | None = None
                const { length } = change.value
                while ((value = change.value.pop()) != None) {
                    result.push(new KittenCloudListAddCommand(
                        source, this, position, value
                    ))
                }
                position += length
            } else {
                throw new Error("未预期的数组差异")
            }
        }
        return result
    }

    /**
     * 添加新的项到云列表尾部。
     *
     * @param value 添加的新的项的值
     */
    public push(this: this, value: KittenCloudListItemValue): void {
        value = this.singleValueProcess(value)
        this.updateManager.addUpdateCommand(new KittenCloudListPushCommand(
            KittenCloudDataUpdateSource.LOCAL, this, value
        ))
    }

    /**
     * 添加新的项到云列表头部。
     *
     * @param value 添加的新的项的值
     */
    public unshift(this: this, value: KittenCloudListItemValue): void {
        value = this.singleValueProcess(value)
        this.updateManager.addUpdateCommand(new KittenCloudListUnshiftCommand(
            KittenCloudDataUpdateSource.LOCAL, this, value
        ))
    }

    /**
     * 添加新的项到云列表指定位置。
     *
     * @param index 位置索引，从 0 开始
     * @param value 添加的新的项的值
     */
    public add(this: this, index: number, value: KittenCloudListItemValue): void {
        value = this.singleValueProcess(value)
        this.updateManager.addUpdateCommand(new KittenCloudListAddCommand(
            KittenCloudDataUpdateSource.LOCAL, this, index, value
        ))
    }

    /**
     * 移除云列表最后一项。
     */
    public pop(this: this): void {
        this.updateManager.addUpdateCommand(new KittenCloudListPopCommand(
            KittenCloudDataUpdateSource.LOCAL, this
        ))
    }

    /**
     * 移除云列表指项。
     *
     * @param index 位置索引，从 0 开始
     */
    public remove(index: number): void {
        this.updateManager.addUpdateCommand(new KittenCloudListRemoveCommand(
            KittenCloudDataUpdateSource.LOCAL, this, index
        ))
    }

    /**
     * 清空云列表。
     */
    public empty(this: this): void {
        this.updateManager.addUpdateCommand(new KittenCloudListEmptyCommand(
            KittenCloudDataUpdateSource.LOCAL, this
        ))
    }

    /**
     * 替换云列表最后一项。
     *
     * @param value 新的值
     */
    public replaceLast(this: this, value: KittenCloudListItemValue): void {
        value = this.singleValueProcess(value)
        this.updateManager.addUpdateCommand(new KittenCloudListReplaceLastCommand(
            KittenCloudDataUpdateSource.LOCAL, this, value
        ))
    }

    /**
     * 替换云列表指定项。
     *
     * @param index 位置索引，从 0 开始
     * @param value 新的值
     */
    public replace(index: number, value: KittenCloudListItemValue): void {
        value = this.singleValueProcess(value)
        this.updateManager.addUpdateCommand(new KittenCloudListReplaceCommand(
            KittenCloudDataUpdateSource.LOCAL, this, index, value
        ))
    }

    /**
     * 从源列表复制所有项到云列表。
     *
     * 该操作会对比源列表和云列表，并将差异应用到云列表。
     *
     * @param source 源列表
     */
    public copyFrom(this: this, source: KittenCloudList | KittenCloudListItemValue[]): void {
        if (source instanceof KittenCloudList) {
            source = source.value
        }
        source = source.map(
            (item: KittenCloudListItemValue): KittenCloudListItemValue =>
                this.singleValueProcess(item)
        )
        const diff: KittenCloudListUpdateCommand[] =
            this.compareTo(KittenCloudDataUpdateSource.LOCAL, source)
        for (const command of diff) {
            this.updateManager.addUpdateCommand(command)
        }
    }

    /**
     * 获取一份云列表当前状态的副本数组。
     *
     * @returns 云列表当前状态的副本数组
     */
    public copy(this: this): KittenCloudListItemValue[] {
        return this.value.slice()
    }

    /**
     * 获取云列表指定位置的项。
     *
     * @param index 位置索引，从 0 开始
     * @returns 指定位置的项，如果索引越界则返回 `None`
     */
    public get(this: this, index: number): KittenCloudListItemValue | None {
        return this.value[index]
    }

    /**
     * 获取云列表的长度。
     *
     * @returns 云列表的长度
     */
    public get length(): number {
        return this.value.length
    }

    /**
     * 获取指定项在云列表中第一次出现的位置。
     *
     * @param item 要查找的项
     * @returns 指定项在云列表中第一次出现的位置，如果不存在则返回 `-1`
     */
    public indexOf(this: this, item: KittenCloudListItemValue): number {
        return this.value.indexOf(item)
    }

    /**
     * 获取指定项在云列表中最后一次出现的位置。
     *
     * @param item 要查找的项
     * @returns 指定项在云列表中最后一次出现的位置，如果不存在则返回 `-1`
     */
    public lastIndexOf(this: this, item: KittenCloudListItemValue): number {
        return this.value.lastIndexOf(item)
    }

    /**
     * 判断指定项是否在云列表中。
     *
     * @param item 要查找的项
     * @returns 指定项是否在云列表中
     */
    public includes(this: this, item: KittenCloudListItemValue): boolean {
        return this.value.includes(item)
    }

    /**
     * 用指定字符串连接云列表中的所有项。
     *
     * @param separator 项之间的分隔符
     * @returns 连接后的字符串
     */
    public join(this: this, separator: string): string {
        return this.value.join(separator)
    }
}
