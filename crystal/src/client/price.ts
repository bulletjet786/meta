import {GameInfo, GamePriceOverview, HistoryLogs, ItadClient} from "./itad";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { CurrencyClient } from "./currency";
import { CountryInfo } from "../constants/country";

dayjs.extend(utc);
dayjs.extend(timezone);

async function fetchLowestGamePriceInfo(itadId: string, country: CountryInfo): Promise<LowestGamePriceInfo | null> {
  const itadClient = new ItadClient();
  const currencyClient = new CurrencyClient();

  try {
    const gameOverview = await itadClient.gamePriceOverview(itadId, country.code);
    const exchangeRate = await currencyClient.rate(country.currencyCode, CountryInfo.CN.currencyCode);
    if (!gameOverview || !exchangeRate) return null;
    return {
      country: country,
      exchangeRate: exchangeRate,
      currentPrice: gameOverview.current.price.amount * exchangeRate,
      currentPriceOrigin: gameOverview.current.price.amount,
      currentPriceCut: gameOverview.current.cut,
      lowestPrice: gameOverview.lowest.price.amount * exchangeRate,
      lowestPriceOrigin: gameOverview.lowest.price.amount,
      lowestPriceCut: gameOverview.lowest.price.amount,
    };
  } catch (e) {
    console.error(`Error fetching LowestGamePriceInfo for itadId ${itadId}:`, e);
    return null;
  }
};

export interface LowestGamePriceInfo {
  country: CountryInfo; // 国家
  exchangeRate: number; // 从区域兑换成人民币后的汇率
  currentPrice: number; // 当前价格
  currentPriceOrigin: number; // 当前区域价格
  currentPriceCut: number; // 当前折扣
  lowestPrice: number;  // 最低价格
  lowestPriceOrigin: number; // 最低区域价格
  lowestPriceCut: number; // 最大折扣
}

async function fetchAggGameInfo(appId: string): Promise<AggGameInfo | null> {
  const itadClient = new ItadClient();

  try {
    const gameInfo = await itadClient.lookup(appId);
    if (!gameInfo) return null;
    const itadId = gameInfo.id;
    const gameOverviewData = await itadClient.gamePriceOverview(itadId, "CN");
    const start = dayjs().subtract(1, "year").tz("UTC").format();
    const historyLogsData = await itadClient.historyLogs(itadId, start);
    if (!gameOverviewData || !historyLogsData) return null;
    return {
      basic: gameInfo,
      gamePriceOverview: gameOverviewData,
      historyLogs: historyLogsData
    };
  } catch (e) {
    console.error(`Error fetching AggGameInfo for appId ${appId}:`, e);
    return null;
  }
}

class AggGameInfo {
  basic: GameInfo;
  gamePriceOverview: GamePriceOverview;
  historyLogs: HistoryLogs;

  constructor(basic: GameInfo, gamePriceOverview: GamePriceOverview, historyLogs: HistoryLogs) {
    this.basic = basic;
    this.gamePriceOverview = gamePriceOverview;
    this.historyLogs = historyLogs
  }
}

export {fetchAggGameInfo, AggGameInfo}
export {fetchLowestGamePriceInfo}
