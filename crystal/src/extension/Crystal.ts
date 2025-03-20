import { StoreExtension, StoreExtensionOptions } from "./store"
export function run(options: StoreExtensionOptions) {
    console.log("Start to inject crystal style ...")
    const storeExtension = new StoreExtension(options)
    storeExtension.init()
}
