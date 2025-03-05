import {GameInfo, HistoryLogs, ItadClient, StoreLowestPrice} from "./itad";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

async function fetchLowestGamePriceInfo(appId: string): Promise<LowestPriceDataType | null> {
  const itadClient = new ItadClient();

  try {
    const gameInfo = await itadClient.lookup(appId);
    if (!gameInfo) return null;
    const itadId = gameInfo.id;
    const storeLowData = await itadClient.storeLowestPrice(itadId);
    const start = dayjs().subtract(1, "year").tz("UTC").format();
    const historyLogsData = await itadClient.historyLogs(itadId, start);
    if (!storeLowData || !historyLogsData) return null;
    return {
      basic: gameInfo,
      storeLow: storeLowData,
      historyLogs: historyLogsData
    };
  } catch (e) {
    console.error(`Error fetching AggGameInfo for appId ${appId}:`, e);
    return null;
  }
};

interface LowestPriceDataType {
  countryCode: string; // 国家代码
  countryName: string; // 国家名称
  countryIcon: string; // 国家图标
  currentPrice: number; // 当前价格
  currentPriceOrigin: number; // 当前区域价格
  currentPriceCut: number; // 当前折扣：
  lowestPrice: number;  // 最低价格
  lowestPriceOrigin: number; // 最低区域价格
  lowestPriceCut: number; // 最大折扣
  exchangeRate: number; // 从区域兑换成人民币后的汇率
}

async function fetchAggGameInfo(appId: string): Promise<AggGameInfo | null> {
  const itadClient = new ItadClient();

  try {
    const gameInfo = await itadClient.lookup(appId);
    if (!gameInfo) return null;
    const itadId = gameInfo.id;
    const storeLowData = await itadClient.storeLowestPrice(itadId);
    const start = dayjs().subtract(1, "year").tz("UTC").format();
    const historyLogsData = await itadClient.historyLogs(itadId, start);
    if (!storeLowData || !historyLogsData) return null;
    return {
      basic: gameInfo,
      storeLow: storeLowData,
      historyLogs: historyLogsData
    };
  } catch (e) {
    console.error(`Error fetching AggGameInfo for appId ${appId}:`, e);
    return null;
  }
};


class AggGameInfo {
  basic: GameInfo;
  storeLow: StoreLowestPrice;
  historyLogs: HistoryLogs;

  constructor(basic: GameInfo, storeLow: StoreLowestPrice, historyLogs: HistoryLogs) {
    this.basic = basic;
    this.storeLow = storeLow;
    this.historyLogs = historyLogs
  }
}

export {fetchAggGameInfo, AggGameInfo}
export {fetchLowestGamePriceInfo, LowestPriceDataType}
