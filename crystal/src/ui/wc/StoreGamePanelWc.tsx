import r2wc from '@r2wc/react-to-web-component'
import CrystalGamePanel from '../../components/CrystalGamePanel.tsx'
import { defineWc } from '../../ui/wc/utils'

export const CrystalGamePanelWcName = "crystal-game-panel"

export const CrystalGamePanelWc = r2wc(CrystalGamePanel, {
    props: {
        appId: "string",
        gameName: "string"
    },
    // null: don't use shadow, ant design can inject styles to head.style 
    // open mode: we can inject styles
    // shadow: "open", 
})

export function defineCrystalGamePanleWc() {
    defineWc(CrystalGamePanelWcName, CrystalGamePanelWc)
}
