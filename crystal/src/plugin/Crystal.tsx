import r2wc from '@r2wc/react-to-web-component'
import CrystalGamePanel from '../components/CrystalGamePanel.tsx'

export function run(options: CrystalRunOptions) {
    console.log("Start to inject crystal style ...")
    injectCrystal()
}

export class CrystalRunOptions {
    constructor(
        public useDebugAppId: string | null = null,
        public enableHistoryPriceCharts: boolean = true, // 是否启用价格图表
        public deckSN: string = "deck:Unknown",
    ) {
    }
}

declare const window: {
    __crystal_injected: boolean;
    __crystal_styles: any
} & Window;

export class CrystalGamePanelWc extends r2wc(CrystalGamePanel, {
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

function injectCrystalAppWc() {
    // 注入Web Component styles
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    CrystalGamePanelWc.initStyle(window.__crystal_styles)
    customElements.define("crystal-game-panel", CrystalGamePanelWc)

    const crystalHost = document.createElement('div');
    crystalHost.id = 'crystal-host'
    crystalHost.textContent = '<crystal-game-panel></crystal-game-panel>';
    const injectPoint = document.getElementById("game_area_purchase")
    if (injectPoint == null) {
        return;
    }
    injectPoint.appendChild(crystalHost);
}


export function injectCrystal() {
    if (document.readyState === 'loading') {
        // 如果文档还在加载中，等待 DOMContentLoaded 事件
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded event fired');
            injectCrystalAppWc();
        });
    } else {
        // 如果文档已经加载完成或处于 interactive 状态
        console.log('Document is already loaded or interactive');
        injectCrystalAppWc();
    }
}
