import {GameInfo, HistoryLogs, ItadClient, StoreLowestPrice} from "./itad";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

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
