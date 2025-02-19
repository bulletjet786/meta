import r2wc from '@r2wc/react-to-web-component'
import CrystalGamePanel from '../components/CrystalGamePanel.tsx'

export function run(options: CrystalRunOptions) {
    console.log("Start to inject crystal style ...")
    injectCrystal(options)
}

export class CrystalRunOptions {
    constructor(
        public useDebugAppId: string | null = null,
        public enableHistoryPriceCharts: boolean = true, // 是否启用价格图表
        public deckSN: string = "deck:Unknown",
        public deviceId: string = "Unknown",
    ) {
    }
}

declare const window: {
    __crystal_injected: boolean;
    __crystal_styles: any
} & Window;

export class CrystalGamePanelWc extends r2wc(CrystalGamePanel, {
    props: {
        appId: "string"
    },
    shadow: "open", // must be open to inject styles
}) {

    private static styles: string = ""

    static initStyle(styles: string) {
        CrystalGamePanelWc.styles = styles
    }

    static webComponentName() {
        return "crystal-game-panel"
    }

    connectedCallback() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        super.connectedCallback();
        console.log("App Wc has been connected")
        if (CrystalGamePanelWc.styles) {
            console.log("App Wc Styles start injecting ...")
            const template = document.createElement("template");
            template.innerHTML = `<style id="app-wc-crystal-style">${CrystalGamePanelWc.styles}</style>`;
            this.shadowRoot?.appendChild(template.content.cloneNode(true));
        }
    }
}

function injectCrystalGamePanelWc(options: CrystalRunOptions) {
    if (window.__crystal_injected) {
        console.log("Crystal Game Panel Wc has been injected")
        return;
    }

    // Define the web component
    if (customElements.get("crystal-game-panel")) {
        console.log("Crystal Game Panel Wc has been defined, skiped")
        return;
    } else {
        console.log("Crystal Game Panel Wc will be defined ...")
        CrystalGamePanelWc.initStyle(window.__crystal_styles)
        customElements.define("crystal-game-panel", CrystalGamePanelWc)
        console.log("Crystal Game Panel Wc has been defined")
    }

    console.log("Injecting Crystal Game Panel Wc ...")
    let appId = ""
    if (options.useDebugAppId) {
        appId = options.useDebugAppId
        console.log(`Inject Crystal Game Panel Wc for debug appId=${appId}`)
    } else {
        appId = extractAppIdFromUrl(document.URL, "https://store.steampowered.com/app/")
        console.log(`Inject Crystal Game Panel Wc for appId=${appId} from url=${document.URL}`)
    }

    const gamePanel = document.createElement('crystal-game-panel');
    gamePanel.setAttribute('app-id', appId)
    const injectPoint = document.getElementById("game_area_purchase")
    if (injectPoint == null) {
        return;
    }
    injectPoint.appendChild(gamePanel);
    console.log("Inject Crystal Game Panel Wc Success")
}

function injectCrystal(options: CrystalRunOptions) {
    if (document.readyState === 'loading') {
        // 如果文档还在加载中，等待 DOMContentLoaded 事件
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded event fired');
            injectCrystalGamePanelWc(options);
        });
    } else {
        // 如果文档已经加载完成或处于 interactive 状态
        console.log('Document is already loaded or interactive');
        injectCrystalGamePanelWc(options);
    }
}

function extractAppIdFromUrl(url: string, storeUrlPrefix: string): string {
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