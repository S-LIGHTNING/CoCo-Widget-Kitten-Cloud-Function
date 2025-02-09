export type None = null | undefined
export const None = null

export function equal(a: any, b: any): boolean {
    if (a === b) {
        return true
    }
    if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor != b.constructor) {
            return false
        }
        if (Array.isArray(a)) {
            if (a.length != b.length) {
                return false
            }
            for (let i: number = 0; i < a.length; i++) {
                if (!equal(a[i], b[i])) {
                    return false
                }
            }
            return true
        }
        let keys = Object.keys(a)
        if (keys.length != Object.keys(b).length) {
            return false
        }
        for (const key of keys) {
            if (!(key in b) || !equal(a[key], b[key])) {
                return false
            }
        }
        return true
    }
    return false
}

export function merge<T extends Exclude<object, None>>(target: T, source: T): T {
    for (const key in source) {
        if (typeof source[key] == "object" && source[key] != None) {
            if (!(key in target)) {
                target[key] = {} as T[Extract<keyof T, string>]
            }
            if (typeof target[key] == "object" && target[key] != None) {
                merge(target[key], source[key])
            }
        } else if (!(key in target)) {
            target[key] = source[key]
        }
    }
    return target
}

export function enumerable(value: boolean): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void {
    return function (__target: unknown, __propertyKey: string, descriptor: PropertyDescriptor): void {
        descriptor.enumerable = value
    }
}

export const
    NUMBER_CHAR: string = "0123456789",
    LOWER_CASE_LETTER: string = "abcdefghijklmnopqrstuvwxyz",
    UPPER_CASE_LETTER: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    LETTER: string = LOWER_CASE_LETTER.concat(UPPER_CASE_LETTER)

export function randomString(
    length: number = 32,
    charset: string = NUMBER_CHAR.concat(LETTER)
): string {
    let result: string = ""
    for (let i: number = 0; i < length; i++) {
        result += charset[Math.floor(Math.random() * charset.length)]
    }
    return result
}
