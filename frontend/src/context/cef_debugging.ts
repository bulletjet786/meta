import {
    DisableSteamCEFDebugging,
    EnableSteamCEFDebugging,
    SteamCEFDebuggingEnabled
} from "../../wailsjs/go/steam/Service";
import {create} from "zustand/react";

const useCEFDebuggingStore = create((set) => ({
    enabled: false,
    load: async () => {
        const result = await SteamCEFDebuggingEnabled()
        console.log("load: enabled result is ", result)
        set(() => ({enabled: result}))
    },
    enableCEFDebugging: async () => {
        await EnableSteamCEFDebugging()
        const result = await SteamCEFDebuggingEnabled()
        console.log("enableCEFDebugging: enabled result is ", result)
        set(() => ({enabled: result}))
    },
    disableCEFDebugging: async () => {
        await DisableSteamCEFDebugging()
        const result = await SteamCEFDebuggingEnabled()
        console.log("DisableSteamCEFDebugging: enabled result is ", result)
        set(() => ({enabled: result}))
    },
}))

export default useCEFDebuggingStore

