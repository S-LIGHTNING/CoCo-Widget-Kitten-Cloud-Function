import * as __KittenCloudFunction from "./kitten-cloud-function-package"

declare global {
    var KittenCloudFunction: typeof __KittenCloudFunction
}

if (typeof module == "object" && typeof exports != "undefined") {
    module.exports = __KittenCloudFunction
} else if (typeof globalThis != "undefined") {
    globalThis.KittenCloudFunction = __KittenCloudFunction
} else if (typeof self != "undefined") {
    self.KittenCloudFunction = __KittenCloudFunction
} else {
    window.KittenCloudFunction = __KittenCloudFunction
}
