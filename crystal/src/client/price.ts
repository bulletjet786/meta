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
    if (!gameOverview) return null;
    const currentPriceOriginCurrency = gameOverview.current.price.currency
    const lowestPriceOriginCurrency = gameOverview.lowest.price.currency
    const currentExchangeRate = await currencyClient.rate(currentPriceOriginCurrency, CountryInfo.CN.currencyCode);
    const lowestExchangeRate = await currencyClient.rate(lowestPriceOriginCurrency, CountryInfo.CN.currencyCode);
    if (!currentExchangeRate || !lowestExchangeRate) return null;
    return {
      country: country,
      currentPrice: gameOverview.current.price.amount * currentExchangeRate,
      currentPriceOrigin: gameOverview.current.price.amount,
      currentPriceCut: gameOverview.current.cut,
      currentPriceOriginCurrency: gameOverview.current.price.currency,
      lowestPrice: gameOverview.lowest.price.amount * lowestExchangeRate,
      lowestPriceOrigin: gameOverview.lowest.price.amount,
      lowestPriceOriginCurrency: gameOverview.lowest.price.currency,
      lowestPriceCut: gameOverview.lowest.price.amount,
    };
  } catch (e) {
    console.error(`Error fetching LowestGamePriceInfo for itadId ${itadId}:`, e);
    return null;
  }
};

export interface LowestGamePriceInfo {
  country: CountryInfo; // 国家
  currentPrice: number; // 当前价格
  currentPriceOrigin: number; // 当前区域价格
  currentPriceOriginCurrency: string; // 当前区域的当前价格货币代码
  currentPriceCut: number; // 当前折扣
  lowestPrice: number;  // 最低价格
  lowestPriceOrigin: number; // 最低区域价格
  lowestPriceOriginCurrency: string; // 当前区域的最低价格货币代码
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
