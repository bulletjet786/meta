import { SelectionTranslatePluginOptions, SelectionTranslatePlugin } from "./plugin/selection-translate.ts";

export type CommunityExtensionOptions = {
    selectionTranslate: SelectionTranslatePluginOptions  | null
}

export class CommunityExtension {
    constructor(
        public options: CommunityExtensionOptions
    ) {}
    
    init(): void {
        console.log("Injecting Crystal Extension ...")
        this.tryInjectCrystal()
    }
    
    tryInjectCrystal() {
        if (document.readyState === 'loading') {
            // 如果文档还在加载中，等待 DOMContentLoaded 事件
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOMContentLoaded event fired');
                this.initCrystal();
            });
        } else {
            // 如果文档已经加载完成或处于 interactive 状态
            console.log('Document is already loaded or interactive');
            this.initCrystal();
        }
    }

    initCrystal() {
        if (window.__crystal_injected) {
            console.log("Crystal Extension has been injected")
            return;
        }
        window.__crystal_injected = true
    
        if (this.options.selectionTranslate) {
            console.log("Inject Comunity Selection Translate Plugin")
            const selectionTranslate = new SelectionTranslatePlugin(this.options.selectionTranslate)
            selectionTranslate.init()
        }

        console.log("Inject Crystal Community Extension Success")
    }
    
}

declare const window: {
    __crystal_injected: boolean;
} & Window;
