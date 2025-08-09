import { StoreExtension, StoreExtensionOptions } from "./store"
import { CommunityExtension, CommunityExtensionOptions } from "./community"
import { SteamExtension, SteamExtensionOptions} from "./steam.ts";

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

function runSteam(options: SteamExtensionOptions) {
    console.log("Start to Steam Extension ...")
    const storeExtension = new SteamExtension(options)
    storeExtension.init()
}

export function run(extension: string, options: StoreExtensionOptions | CommunityExtensionOptions) {
    console.log(`Start to Crystal Extension with options: ${JSON.stringify(options)}`)

    switch (extension) {
        case "store":
            runStore(options as StoreExtensionOptions)
            break
        case "community":
            runCommunity(options as CommunityExtensionOptions)
            break;
        case "steam":
            runSteam(options as SteamExtensionOptions)
    }
}