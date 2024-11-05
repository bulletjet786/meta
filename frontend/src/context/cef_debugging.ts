import {
    EnableSteamCEFDebugging,
    SteamCEFDebuggingEnabled
} from "../../wailsjs/go/steam/Service";
import {create} from "zustand/react";

const useCEFDebuggingStore = create((set) => ({
    enabled: false,
    changed: false,
    load: async () => {
        const result = await SteamCEFDebuggingEnabled()
        if (!result) {
            await EnableSteamCEFDebugging()
            const enabledResult = await SteamCEFDebuggingEnabled()
            const changed = result != enabledResult
            console.log("load: changed result is ", changed)
            set(() => ({enabled: result, changed: changed }))
        }
        console.log("load: enabled result is ", result)
        set(() => ({enabled: result}))
    },
}))

export default useCEFDebuggingStore

