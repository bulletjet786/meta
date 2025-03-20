import { IPlugin } from "./plugin";

export class TranslatePluginOptions {
	constructor(
		public contentXPath: string,
	) {
	}
}

export class TranslatePlugin implements IPlugin {

	name(): string {
		return "translate";
	}

	init(): void {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://res.zvo.cn/translate/translate.js';
		script.onload = function () {
			console.log("Translate Script On Load")
			// @ts-ignore
			console.log(`Translate translate: ${translate}`)

			translate.setDocuments(document.querySelector("#game_area_description"))

			// 翻译属性
			translate.language.setLocal('chinese_simplified'); //设置本地语种（当前网页的语种）。如果不设置，默认就是 'chinese_simplified' 简体中文。 可填写如 'english'、'chinese_simplified' 等，具体参见文档下方关于此的说明
			translate.language.setDefaultTo('chinese_simplified') // 设置要翻译成的语言
			translate.language.translateLocal = true // 强制翻译
			translate.service.use('client.edge') //指定翻译服务为使用 translate.service
			translate.language.setUrlParamControl(); //url参数后可以加get方式传递 language 参数的方式控制当前网页以什么语种显示
			translate.selectLanguageTag.show = false; // 不显示语言选择UI

			// translate.selectionTranslate.start() // 滑词翻译无法和全局翻译同时开启
			translate.execute();

			// translate.changeLanguage('chinese_simplified')
		}
		document.body.appendChild(script);
	}
}