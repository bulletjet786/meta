import { defineCrystalGamePanelWc } from "../../components/CrystalGamePanel.tsx";
import { IPlugin } from "./plugin";

export class StoreGamePanelPluginOptions {

    static debugAppId: string = "292030";
    static debugGameName: string = "巫师 3：狂猎";

    constructor(
        public debug: boolean = false,
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
        defineCrystalGamePanelWc()
        let appId = ""
        let gameName = ""
        if (this.options.debug) {
            appId = StoreGamePanelPluginOptions.debugAppId
            gameName = StoreGamePanelPluginOptions.debugGameName
        } else {
            appId = this.extractAppIdFromUrl(document.URL, "https://store.steampowered.com/app/")
            const gameNameNode = document.querySelector(`span[itemprop="name"]`)
            gameName = `${(gameNameNode as HTMLSpanElement).innerText}`
            console.log(`Inject Crystal Game Panel Wc for appId=${appId} from url=${document.URL}, gameName=${gameName} from context`)
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