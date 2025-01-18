import * as __KittenCloudFunction from "./kitten-cloud-function-package"

declare global {
    var KittenCloudFunction: typeof __KittenCloudFunction
}

globalThis.KittenCloudFunction = __KittenCloudFunction
