import { StoreExtension, StoreExtensionOptions } from "./store"
import { CommunityExtension, CommunityExtensionOptions } from "./community"
function runStore(options: StoreExtensionOptions) {
    console.log("Start to Store Extension ...")
    const storeExtension = new StoreExtension(options)
    storeExtension.init()
}

function runCommunity(options: CommunityExtensionOptions) {
    console.log("Start to Store Extension ...")
    const storeExtension = new CommunityExtension(options)
    storeExtension.init()
}

export function run(extension: string, options: StoreExtensionOptions | CommunityExtensionOptions) {
    switch (extension) {
        case "store":
            runStore(options as StoreExtensionOptions)
            break
        case "community":
            runCommunity(options as CommunityExtensionOptions)
            break;
    }
}