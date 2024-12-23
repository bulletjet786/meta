import {GameInfo, HistoryLogs, ItadClient, StoreLowestPrice} from "../client/itad"
import * as echarts from "echarts"
import dayjs from "dayjs"
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { GAClient, Event } from "../client/ga"

declare const window: {
    __crystal_injected: boolean;
} & Window;

dayjs.extend(timezone)
dayjs.extend(utc)

export function run(options: CrystalRunOptions) {
    const extension = new HuluLowestPriceExtension(options)
    extension.injectLowestPricePanel(options)
}

export class CrystalRunOptions {
    constructor(
        public useDebugAppId: string | null = null,
        public enableHistoryPriceCharts: boolean = true, // 是否启用价格图表
        public deckSN: string = "deck:Unknown"
    ) {
    }
}

export class HuluLowestPriceExtension {

    itadClient: ItadClient = new ItadClient();
    gaClient: GAClient = new GAClient();

    constructor(
        public options: CrystalRunOptions
    ) {

    }

    async injectLowestPricePanel(options: CrystalRunOptions) {

        if (window.__crystal_injected) {
            console.info(`injected for ${document.URL}, skipped`)
            return
        }
        window.__crystal_injected = true

        const appId = options.useDebugAppId != null? options.useDebugAppId :
            this.extractAppIdFromUrl(document.URL, "https://store.steampowered.com/app/")
        console.log(`Extract appId is ${appId}`)

        let aggGameInfo = await this.fetchAggGameInfo(appId)
        if (aggGameInfo == null) {
            console.warn(`Can't fetch lowest price for ${appId}`)
            return;
        }

        const injectPoint = document.getElementById("game_area_purchase")
        if (injectPoint == null) {
            return;
        }

        const panel = this.makeLowestPricePanel(aggGameInfo.storeLow.price, aggGameInfo.storeLow.cut)
        injectPoint.insertAdjacentHTML("afterbegin", panel)
        this.fillPriceCharts(aggGameInfo.historyLogs)
        this.onButtonClick(appId)
        console.info(`Inject for ${appId} Success`)
        await this.gaClient.sendEvents(this.options.deckSN, [this.makeHuluInjectEvent(appId, document.URL)])
    }

    extractAppIdFromUrl(url: string, storeUrlPrefix: string): string {
        // 移除前缀并分割路径
        const paths = url.replace(storeUrlPrefix, '').split('/');

        // 检查路径是否有效
        if (paths.length < 2) {
            throw new Error(`GetGameAppId failed, url=${url} invalid`);
        }

        // 检查 appId 是否为整数
        const appId = parseInt(paths[0], 10);
        if (isNaN(appId)) {
            throw new Error(`GetGameAppId failed, appId=${paths[0]} is not a valid integer`);
        }

        return appId.toString();
    }

    compileCss(css: any) {
        return Object.entries(css).map(line => line[0] + ": " + line[1]).join(";")
    }

    makeLowestPricePanel(price: number, cut: number) {
        const gameNameNode = document.querySelector(`span[itemprop="name"]`)
        let xbgameUrl = "https://www.xbgame.net"
        if (gameNameNode != null) {
            xbgameUrl = xbgameUrl + `?s=${(gameNameNode as HTMLSpanElement).innerText}`
        }
        let xianyudanjiUrl = "https://www.xianyudanji.net?aff=270876"
        if (gameNameNode != null) {
            xianyudanjiUrl = xianyudanjiUrl + `&s=${(gameNameNode as HTMLSpanElement).innerText}`
        }
        let kkyxUrl = "https://www.kkyx.net?aff=8119"
        if (gameNameNode != null) {
            kkyxUrl = kkyxUrl + `&s=${(gameNameNode as HTMLSpanElement).innerText}`
        }
        const huluButtonInfo = {
            "padding": "6px 12px",
            "color": "#fff",
            "background-color": "#1a9fff",
            "border-radius": "2px",
            "box-shadow": "0px 3px 6px 0px rgba(0,0,0,.32)",
            "transition-property": "color,background-color,border-radius",
            "transition-duration": ".1s",
            "transition-timing-function": "ease",
            "display": "flex"
        }
        const crystalPriceChartStyle = {
            "width": "100%",
            "height": "300px"
        }
        const cutDesc = cut > 0 ? ` ，优惠力度 <b>${cut}%</b>` : ""
        return `
            <div id="hulu-price-injector-panel" class="game_area_purchase_game_wrapper">
                <div class="game_area_purchase_game">
                    <h1>宝葫芦提醒您 </h1>
                    <div>Steam史低价格为 <b>¥${price}</b>${cutDesc}</b></div>
                    <div style="padding: 5px 0">
                        <a data-hulu-price-injector-panel-button class="Focusable" style="${this.compileCss(huluButtonInfo)}" href="${xbgameUrl}">搜索学习版: 小白游戏网</a>
                    </div>
                    <div style="padding: 5px 0">
                        <a data-hulu-price-injector-panel-button class="Focusable" style="${this.compileCss(huluButtonInfo)}" href="${xianyudanjiUrl}">搜索学习版: 咸鱼单机</a>
                    </div>
                    <div style="padding: 5px 0">
                        <a data-hulu-price-injector-panel-button class="Focusable" style="${this.compileCss(huluButtonInfo)}" href="${kkyxUrl}">搜索学习版: 游戏仓库</a>
                    </div>
                    <div style="padding: 5px 0">
                        <a data-hulu-price-injector-panel-button class="Focusable" style="${this.compileCss(huluButtonInfo)}" href="https://2game.hk/cn">去 2Game 看看价格</a>
                    </div>
                    <div style="padding: 5px 0">
                        <a data-hulu-price-injector-panel-button class="Focusable" style="${this.compileCss(huluButtonInfo)}" href="https://www.sonkwo.cn">去 杉果 看看价格</a>
                    </div>
                    <div id="crystal-price-chart-ctr-btn" style="padding: 5px 0">
                        <a class="Focusable" style="${this.compileCss(huluButtonInfo)}">查看最近一年历史价格图表</a>
                    </div>
                </div>
                <div>
                    <div id="crystal-price-chart" style="${this.compileCss(crystalPriceChartStyle)}"></div>
                </div>
            </div>
        `
    }

    onButtonClick(appId: string) {
        let buttons = document.querySelectorAll("a[data-hulu-price-injector-panel-button]")
        if (buttons == null) {
            return
        }
        const self = this;
        buttons.forEach(button => {
            button.addEventListener('click', function(event) {
                self.gaClient.sendEvents(
                    self.options.deckSN,
                    [self.makeHuluClickEvent(appId, (event.target as HTMLAnchorElement).href)]
                )
            });
          });
    }

    onCrystalPriceChartButton() {
        const crystalPriceChartContainer = document.querySelector("#crystal-price-chart")
        if (crystalPriceChartContainer == null) {
            return
        }
        const crystalPriceChart = crystalPriceChartContainer as HTMLElement
        if (crystalPriceChart.style.display == "none") {
            crystalPriceChart.style.display = "block"
        } else {
            crystalPriceChart.style.display = "none"
        }
    }

    fillPriceCharts(historyLogs: HistoryLogs) {
        const xAxisData: Array<string> = [];
        const priceSeriesData: Array<number> = [];
        historyLogs.reverse().forEach(function(stage) {
            xAxisData.push(dayjs(stage.timestamp).tz("Asia/Shanghai").format("YYYY-MM-DD"))
            priceSeriesData.push(stage.deal.price.amount)
        })
        console.debug(`xAxisData: ${xAxisData}`)
        console.debug(`priceSeriesData: ${priceSeriesData}`)
        // const yMin = this.minPrice(priceSeriesData) > 20 ? this.minPrice(priceSeriesData) : 0
        const options: any = {
            tooltip: {},
            xAxis: {
              show: false,
              type: 'category',
              data: xAxisData,
            },
            yAxis: {
                type: 'value',
                // min: yMin,
            },
            series: [
              {
                name: '价格',
                type: 'line',
                step: 'end',
                data: priceSeriesData,
              },
            ],
          };
        const crystalPriceChartContainer =  document.querySelector("#crystal-price-chart")
        if (crystalPriceChartContainer == null) {
            return;
        }
        // init
        const priceCharts = echarts.init(crystalPriceChartContainer as HTMLElement, 'dark');
        priceCharts.setOption(options);
        const crystalPriceChartCtrButtonElement =  document.querySelector("#crystal-price-chart-ctr-btn")
        if (crystalPriceChartCtrButtonElement == null) {
            return;
        }
        const crystalPriceChartCtrButton = crystalPriceChartCtrButtonElement as HTMLElement
        crystalPriceChartCtrButton.addEventListener("click", this.onCrystalPriceChartButton);
        this.onCrystalPriceChartButton();
    }

    minPrice(arr: Array<number>) {
        return arr.reduce(function (p, v) {
            return ( p < v ? p : v );
        });
    }

    makeHuluInjectEvent(appId: string, targetUrl: string): Event {
        return {
            "name": "extensionLowestPriceDomainEvent",
            "params": {
                "type": "extensionLowestPriceDomainEvent",
                "actionType": "Inject",
                "appId": appId,
                "target": targetUrl,
                "occurAt": new Date().toISOString()
            }
        }
    }

    makeHuluClickEvent(appId: string, targetUrl: string): Event {
        return {
            "name": "extensionLowestPriceDomainEvent",
            "params": {
                "type": "extensionLowestPriceDomainEvent",
                "actionType": "Click",
                "appId": appId,
                "target": targetUrl,
                "occurAt": new Date().toISOString()
            }
        }
    }

    async fetchAggGameInfo(appId: string): Promise<AggGameInfo | null>  {
        try {
            // 获取游戏信息
            const gameInfo = await this.itadClient.lookup(appId);
            if (!gameInfo) {
                return null
            }
            const itadId = gameInfo.id;

            const storeLowData = await this.itadClient.storeLowestPrice(itadId);
            const start = dayjs().subtract(1, "year").tz("UTC").format()
            console.debug(`dayjs utc time: ${start}`)
            const historyLogsData = await this.itadClient.historyLogs(itadId, start)
            if (!storeLowData || !historyLogsData) {
                return null
            }
            return {
                basic: gameInfo,
                storeLow: storeLowData,
                historyLogs: historyLogsData
            }
        } catch (e) {
            console.error(`Found store page with appId ${appId}, but fetch AggGameInfo failed, ${e}`);
            return null
        }
    }
}

interface AggGameInfo {
    basic: GameInfo,
    storeLow: StoreLowestPrice,
    historyLogs: HistoryLogs
}
