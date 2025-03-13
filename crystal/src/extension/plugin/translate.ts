import { IPlugin } from "./plugin";

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
			// const translateDoc = document.querySelector('#test-translate')
			// translate.setDocuments([translateDoc]);
			// translate.language.setLocal('chinese_simplified');

			//SELECT 修改 onchange 事件
			// translate.selectLanguageTag.selectOnChange = function (event: any) {
			// 	//判断是否是第一次翻译，如果是，那就不用刷新页面了。 true则是需要刷新，不是第一次翻译
			// 	const isReload = translate.to != null && translate.to.length > 0;
			// 	if (isReload) {
			// 		//如果要刷新页面的话，弹出友好提示
			// 		alert('您好，快速体验暂时只能切换其中一种语言进行体验，只是提供效果展示，您可参考接入文档来接入您的项目中进行完整体验及使用。详细文档参考： http://translate.zvo.cn');
			// 	} else {
			// 		const language = event.target.value;
			// 		translate.changeLanguage(language);
			// 	}
			// }
			// translate.setUseVersion2();
			// translate.service.use('client.edge');
			// translate.listener.start();	//开启html页面变化的监控，对变化部分会进行自动翻译。注意，这里变化区域，是指使用 translate.setDocuments(...) 设置的区域。如果未设置，那么为监控整个网页的变化
			translate.execute();
		}
		document.body.appendChild(script);
	}
}