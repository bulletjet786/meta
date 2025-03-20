import { IPlugin } from "./plugin";
import { defineCrystalTranslateControllerWc } from "../../components/CrystalTranslateController.tsx";

export class TranslatePluginOptions {
	constructor(
		public contentSelector: string = "#game_area_description",
	) {
	}
}

export class TranslatePlugin implements IPlugin {

    constructor(
        public options: TranslatePluginOptions
    ) {}

	name(): string {
		return "translate";
	}

	init(): void {
		// 加载Translate脚本
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.src = 'https://res.zvo.cn/translate/translate.js'
		const options = this.options
		script.onload = function () {
			console.log("Translate Script On Load")

			// 翻译属性
			window.translate.language.setLocal('chinese_simplified'); //设置本地语种（当前网页的语种）。如果不设置，默认就是 'chinese_simplified' 简体中文。 可填写如 'english'、'chinese_simplified' 等，具体参见文档下方关于此的说明
			window.translate.language.setDefaultTo('chinese_simplified') // 设置要翻译成的语言
			window.translate.language.translateLocal = true // 强制翻译
			window.translate.service.use('client.edge') //指定翻译服务为使用 translate.service
			window.translate.language.setUrlParamControl(); //url参数后可以加get方式传递 language 参数的方式控制当前网页以什么语种显示
			window.translate.selectLanguageTag.show = false; // 不显示语言选择UI

			// translate.selectionTranslate.start() // 滑词翻译无法和全局翻译同时开启
			// translate.execute();

			// translate.changeLanguage('chinese_simplified')
		}
		document.body.appendChild(script);

		// 加载翻译器控制组件
		defineCrystalTranslateControllerWc()
		const translateController = document.createElement('crystal-translate-controller');
		translateController.setAttribute('content-selector', this.options.contentSelector)
		const injectPoint = document.querySelector("#game_area_purchase > h2")
		if (injectPoint == null) {
			return;
		}
		injectPoint.appendChild(translateController);
	}
}

declare const window: {
	translate: any;
  } & Window;