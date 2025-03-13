import { defineCrystalGamePanleWc } from "../../ui/wc/StoreGamePanelWc";
import { IPlugin } from "./plugin";

export class StoreGamePanelPluginOptions {
    constructor(
        public enable: boolean = true,
        public useDebugAppId: string | null = null,
        public useDebugGameName: string | null = null,
        public enableHistoryPriceCharts: boolean = true,
        public deckSN: string = "deck:Unknown",
        public deviceId: string = "Unknown",
    ) {
    }
}

export class StoreGamePanelPlugin implements IPlugin {

    constructor(
        public options: StoreGamePanelPluginOptions
    ) {}
 
    name(): string {
        return "StoreGamePanel";
    }
    init(): void {
        // Define the web component
        console.log("Injecting Crystal Extension ...")
        defineCrystalGamePanleWc()
        let appId = ""
        if (this.options.useDebugAppId) {
            appId = this.options.useDebugAppId
            console.log(`Inject Crystal Game Panel Wc for debug appId=${appId}`)
        } else {
            appId = this.extractAppIdFromUrl(document.URL, "https://store.steampowered.com/app/")
            console.log(`Inject Crystal Game Panel Wc for appId=${appId} from url=${document.URL}`)
        }

        let gameName = ""
        if (this.options.useDebugGameName) {
            gameName = this.options.useDebugGameName
            console.log(`Inject Crystal Game Panel Wc for debug gameName=${gameName}`)
        } else {
            const gameNameNode = document.querySelector(`span[itemprop="name"]`)
            gameName = `${(gameNameNode as HTMLSpanElement).innerText}`
            console.log(`Inject Crystal Game Panel Wc for gameName=${gameName} from context`)
        }
        const gamePanel = document.createElement('crystal-game-panel');
        gamePanel.setAttribute('app-id', appId)
        gamePanel.setAttribute('game-name', gameName)
        const injectPoint = document.getElementById("game_area_purchase")
        if (injectPoint == null) {
            return;
        }
        injectPoint.appendChild(gamePanel);
    }

    extractAppIdFromUrl(url: string, storeUrlPrefix: string): string {
        // 移除前缀并分割路径
        const paths = url.replace(storeUrlPrefix, '').split('/');
    
        // 检查路径是否有效
        if (paths.length < 2) {
            throw new Error(`GetGameAppId failed, url=${url} invalid`);
        }
    
        // 检查 appId 是否为整数
        const appId = parseInt(paths[0], 10);
        if (isNaN(appId)) {
            throw new Error(`GetGameAppId failed, appId=${paths[0]} is not a valid integer`);
        }
    
        return appId.toString();
    }
}