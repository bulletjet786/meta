import { IPlugin } from "./plugin.ts";
import { CrystalBlockTranslateControllerWcName, defineCrystalTranslateControllerWc } from "../../components/CrystalBlockTranslateController.tsx";

export class BlockTranslatePluginOptions {
	targetLanguage: string = "zh_CN"
}

export class BlockTranslatePlugin implements IPlugin {

	private state: Map<string, boolean> = new Map();
	private timeoutId: number | null = null;
	private static gameAreaDescription = "#game_area_description"

    constructor(
        public options: BlockTranslatePluginOptions
    ) {}

	name(): string {
		return "block-translate";
	}

	init(): void {
		defineCrystalTranslateControllerWc()

		const translateController = document.createElement(CrystalBlockTranslateControllerWcName);
		translateController.setAttribute('translate-node-selector', BlockTranslatePlugin.gameAreaDescription)
		translateController.setAttribute('container-style', '{ "display": "inline-block", "margin-left": "30px" }')
		translateController.setAttribute("target-language", this.options.targetLanguage)
		const injectPoint = document.querySelector(BlockTranslatePlugin.gameAreaDescription + " > h2")
		if (injectPoint == null) {
			return;
		}
		injectPoint.appendChild(translateController);

		// 发现评论区域
		window.addEventListener('scroll', () => {
			console.log('page scored! will inject translate controller');
			this.willInjectTranslateController()
		});

		// 处理过滤器选项变动
		const targetNode = document.getElementById('reviews_active_filters');
		if (targetNode) {
			const callback = () => {
				console.log("review_active filters changed, will inject")
				this.willInjectTranslateController()
			};
			const observer = new MutationObserver(callback);
			const config = {
				childList: true,      // 监听子节点变化
				attributes: true,     // 监听属性变化
				characterData: true,  // 监听文本内容变化
				subtree: true         // 监听目标节点及其所有后代节点
			};
			observer.observe(targetNode, config);
		}

		console.log("Translate controller inject finished.")
	}

	willInjectTranslateController() {
		// 清除之前的定时器
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}

		// 设置新的定时器
		this.timeoutId = setTimeout(() => {
			this.injectTranslateController();
		}, 500); // 500ms 防抖时间
	}

	injectTranslateController() {
		// 将所有的元素加入到
		// div[data-panel].content
		// div.postedDate
		document.querySelectorAll("div[data-panel].content").forEach(
			(node) => {
				const reviewNode = node.parentNode
				if (reviewNode == null) {
					return;
				}
				const reviewEle = (reviewNode as HTMLDivElement)
				const translateNodeSelector = "#" + reviewEle.id + " > div[data-panel].content"
				const postedDate = reviewNode.querySelector(".postedDate")
				if (postedDate == null) {
					return;
				}
				// 检查是否已经注入过翻译按钮
				const alreadyInjected = Array.from(postedDate.children).some(
					(child) =>
						child.tagName === CrystalBlockTranslateControllerWcName.toUpperCase() ||
						(child as HTMLElement).classList.contains('crystal-translate-controller')
				);

				if (!alreadyInjected) {
					const controller = document.createElement(CrystalBlockTranslateControllerWcName)
					controller.setAttribute('translate-node-selector', translateNodeSelector)
					controller.setAttribute('container-style', '{ "display": "inline-block", "margin-left": "30px" }')
					controller.setAttribute("target-language", this.options.targetLanguage)
					postedDate.appendChild(controller)
					console.debug("add button finished")
					this.state.set(translateNodeSelector, true)	// TODO: now state is not used
				}
			}
		)
		console.log("state size: ", this.state.size)
	}
}
