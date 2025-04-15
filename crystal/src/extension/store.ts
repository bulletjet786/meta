import { StoreGamePanelPluginOptions, StoreGamePanelPlugin } from "./plugin/game-panel";
import { BlockTranslatePluginOptions, BlockTranslatePlugin } from "./plugin/block-translate.ts";
import { SelectionTranslatePluginOptions, SelectionTranslatePlugin } from "./plugin/selection-translate.ts";

export type StoreExtensionOptions = {
    gamePanel: StoreGamePanelPluginOptions | null,
    blockTranslate: BlockTranslatePluginOptions  | null,
    selectionTranslate: SelectionTranslatePluginOptions | null,
}

export class StoreExtension {
    constructor(
        public options: StoreExtensionOptions
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

        console.log(`Inject Crystal Store With ${JSON.stringify(this.options)}`)

        if (this.options.selectionTranslate) {
            console.log("Inject Store Selection Translate Plugin")
            const selectionTranslate = new SelectionTranslatePlugin(this.options.selectionTranslate)
            selectionTranslate.init()
        }

        if (this.options.gamePanel) {
            console.log("Inject Store Game Panel Plugin")
            const storeGamePanel = new StoreGamePanelPlugin(this.options.gamePanel)
            storeGamePanel.init()
        }

        if (this.options.blockTranslate) {
            console.log("Inject Store Block Translate Plugin")
            const blockTranslate = new BlockTranslatePlugin(this.options.blockTranslate)
            blockTranslate.init()
        }

        console.log("Inject Crystal Store Success")
    }
    
}

declare const window: {
    __crystal_injected: boolean;
} & Window;

