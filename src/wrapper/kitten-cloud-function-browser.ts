import * as KittenCloudFunction from "./kitten-cloud-function-npm-package"

declare global {
    interface Window {
        KittenCloudFunction: typeof KittenCloudFunction
    }
}

window.KittenCloudFunction = KittenCloudFunction
