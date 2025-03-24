import { StoreExtension, StoreExtensionOptions } from "./store"
import { CommunityExtension, CommunityExtensionOptions } from "./community"
export function runStore(options: StoreExtensionOptions) {
    console.log("Start to Store Extension ...")
    const storeExtension = new StoreExtension(options)
    storeExtension.init()
}

export function runCommunity(options: CommunityExtensionOptions) {
    console.log("Start to Store Extension ...")
    const storeExtension = new CommunityExtension(options)
    storeExtension.init()
}