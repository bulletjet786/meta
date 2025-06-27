import { IPlugin } from "./plugin";
import {CrystalSelectionTranslatePanelWcName, defineSelectionTranslatePanelWc} from "../../components/CrystalSelectionTranslatePanel.tsx";

export class SelectionTranslatePluginOptions {
    targetLanguage: string = "zh_CN"
    provider: string = "BingFree"
}

export class SelectionTranslatePlugin implements IPlugin {
    constructor(
        public options: SelectionTranslatePluginOptions
    ) {
    }

    name(): string {
        return "selection-translate"
    }

    init(): void {
        // 创建划词翻译面板
        defineSelectionTranslatePanelWc()

        const selectionTranslatePanel = document.createElement(CrystalSelectionTranslatePanelWcName);
        selectionTranslatePanel.setAttribute("target-language", this.options.targetLanguage)
        selectionTranslatePanel.setAttribute("provider", this.options.provider)
        document.body.appendChild(selectionTranslatePanel);
        console.log("Selection translate panel inject finished.")
    }

}
