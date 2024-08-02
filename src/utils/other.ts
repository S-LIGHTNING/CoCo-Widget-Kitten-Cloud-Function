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
            for (let i = 0; i < a.length; i++) {
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
