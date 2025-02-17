import {useEffect, useReducer} from 'react'
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
        set(() => ({enabled: result}))
    },
    enableCEFDebugging: async () => {
        await EnableSteamCEFDebugging
        const result = await SteamCEFDebuggingEnabled()
        set(() => ({enabled: result}))
    },
    disableCEFDebugging: async () => {
        await DisableSteamCEFDebugging
        const result = await SteamCEFDebuggingEnabled()
        set(() => ({enabled: result}))
    },
}))

export default useCEFDebuggingStore

// const useCEFDebuggingState = () => {
//
//     function reducer(state: any, action: any): any {
//         console.log("Do state reducer for model: %s, with: %s", JSON.stringify(state), JSON.stringify(action))
//
//         const load = () => {
//             let enabled = false
//             SteamCEFDebuggingEnabled().then(
//                 result => {
//                     console.log("SteamCEFDebuggingEnabled result is ", result)
//                     enabled = result
//                 }
//             )
//             console.log("SteamCEFDebuggingEnabled enabled is ", enabled)
//             return enabled
//         }
//
//         switch (action.type) {
//             case 'enableSteamCEFDebugging':
//                 EnableSteamCEFDebugging()
//                 return load()
//             case 'disableSteamCEFDebugging':
//                 DisableSteamCEFDebugging()
//                 return load()
//             case 'load':
//                 return load()
//         }
//         return state;
//     }
//
//     const [state, dispatch] = useReducer(reducer, false);
//
//     useEffect(() => {
//         dispatch({ type: 'load' })
//     })
//
//     return [state, dispatch]
// }
//
// export default useCEFDebuggingState

