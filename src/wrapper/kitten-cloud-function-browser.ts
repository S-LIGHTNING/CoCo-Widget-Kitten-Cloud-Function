import * as __KittenCloudFunction from "./kitten-cloud-function-package"

declare global {
    var KittenCloudFunction: typeof __KittenCloudFunction
}

if (typeof exports == "object" && typeof module != "undefined") {
    module.exports = __KittenCloudFunction
} else if (typeof globalThis != "undefined") {
    globalThis.KittenCloudFunction = __KittenCloudFunction
} else if (typeof self != "undefined") {
    self.KittenCloudFunction = __KittenCloudFunction
} else {
    window.KittenCloudFunction = __KittenCloudFunction
}
