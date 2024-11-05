import r2wc from "@r2wc/react-to-web-component"
import App from "../components/App/App.tsx"

declare const window: {
    __crystal_injected: boolean;
    __cyrstal_styles: any
} & Window;

export class AppWc extends r2wc(App, {
    shadow: "open", // must be open to inject styles
}) {

    private static styles: string = ""

    static initStyle(style: string) {
        AppWc.styles = style
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

// 注入Web Component styles
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
AppWc.initStyle(window.__crystal_styles)

export function loadAppWcOn(element: HTMLElement) {
    customElements.define("app-wc", AppWc)

    element.innerHTML = `
    <app-wc></app-wc>
  `
}

export function loadAppWcOnElementId(elementId: string): boolean {
    const loadPoint = document.getElementById(elementId)
    if (!loadPoint) {
        return false
    }

    loadAppWcOn(loadPoint)
    return true
}