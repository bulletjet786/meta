import r2wc from "@r2wc/react-to-web-component"
import App from "../components/GamePanel/GamePanel.tsx"

declare const window: {
    __crystal_injected: boolean;
    __cyrstal_styles: any
} & Window;

export class AppWc extends r2wc(App, {
    shadow: "open", // must be open to inject styles
}) {

    private static styles: string = ""

    static initStyle(styles: string) {
        AppWc.styles = styles
    }

    static name() {
        return "app-wc"
    }

    connectedCallback() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        super.connectedCallback();
        console.log("App Wc has been connected")
        if (AppWc.styles) {
            console.log("App Wc Styles start injecting ...")
            const template = document.createElement("template");
            template.innerHTML = `<style id="app-wc-crystal-style">${AppWc.styles}</style>`;
            this.shadowRoot?.appendChild(template.content.cloneNode(true));
        }
    }
}

function injectCrystalAppWc() {
    // 注入Web Component styles
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    AppWc.initStyle(window.__crystal_styles)
    customElements.define("app-wc", AppWc)

    const crystalHost = document.createElement('div');
    crystalHost.id = 'crystal-host'
    crystalHost.textContent = '<app-wc></app-wc>';
    document.body.appendChild(crystalHost);
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
