import {GameInfo, HistoryLogs, ItadClient, StoreLowestPrice} from "../client/itad"
import * as echarts from "echarts"
import dayjs from "dayjs"
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { GAClient, Event } from "../client/ga"

declare const window: {
    __crystal_injected: boolean;
} & Window;

export function run(options: CrystalRunOptions) {
    HuluLowestPriceExtension.injectLowestPricePanel(options)
}

export class CrystalRunOptions {
    constructor(
        public useDebugAppId: string | null = null,
        public enableHistoryPriceCharts: boolean = true, // 是否启用价格图表
    ) {
    }
}

export class HuluLowestPriceExtension {

    static itadClient: ItadClient = new ItadClient();
    static gaClient: GAClient = new GAClient();

    static async injectLowestPricePanel(options: CrystalRunOptions) {
        dayjs.extend(timezone)
        dayjs.extend(utc)

        if (window.__crystal_injected) {
            console.info(`injected for ${document.URL}, skipped`)
            return
        }
        window.__crystal_injected = true

        let appId = options.useDebugAppId != null? options.useDebugAppId : 
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
        console.info(`Inject for ${appId} Success`)
        await this.gaClient.sendEvents("Deck:Unknown", [this.makeHuluInjectEvent(appId)])
    }

    static extractAppIdFromUrl(url: string, storeUrlPrefix: string): string {
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

    static compileCss(css: any) {
        return Object.entries(css).map(line => line[0] + ": " + line[1]).join(";")
    }

    static makeLowestPricePanel(price: number, cut: number) {
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
                        <a class="Focusable" style="${this.compileCss(huluButtonInfo)}" href="https://2game.hk/cn">去 2Game 看看价格</a>
                    </div>
                    <div style="padding: 5px 0">
                        <a class="Focusable" style="${this.compileCss(huluButtonInfo)}" href="https://www.sonkwo.cn">去 杉果 看看价格</a>
                    </div>
                    <div style="padding: 5px 0">
                        <a class="Focusable" style="${this.compileCss(huluButtonInfo)}" href="https://www.xbgame.net">去 小白游戏网 找找学习版</a>
                    </div>
                    <div style="padding: 5px 0">
                        <a class="Focusable" style="${this.compileCss(huluButtonInfo)}" href="https://www.xianyudanji.net?aff=270876">去 咸鱼单机 找找学习版</a>
                    </div>
                    <div style="padding: 5px 0">
                        <a class="Focusable" style="${this.compileCss(huluButtonInfo)}" href="https://www.kkyx.net?aff=8119">去 游戏仓库 找找学习版</a>
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

    static onCrystalPriceChartButton() {
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

    static fillPriceCharts(historyLogs: HistoryLogs) {
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

    static minPrice(arr: Array<number>) {
        return arr.reduce(function (p, v) {
            return ( p < v ? p : v );
        });
    }

    static makeHuluInjectEvent(appId: string): Event {
        return {
            "name": "extensionLowestPriceDomainEvent",
            "params": {
                "type": "extensionLowestPriceDomainEvent",
                "actionType": "Inject",
                "appId": appId,
                "target": null,
                "occurAt": new Date().toISOString()
            }
        }
    }

    static makeHuluClickEvent(appId: string, targetUrl: string): Event {
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

    static async fetchAggGameInfo(appId: string): Promise<AggGameInfo | null>  {
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
