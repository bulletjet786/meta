export class ItadClient {

    private static apiKey: string = "4ffb6523746e26419984bbc220a373762d58ddcc";
    private static host: string = "https://api.isthereanydeal.com"

    async lookup(steamAppId: string): Promise<GameInfo | null> {
        const lookupResponse = await fetch(`${ItadClient.host}/games/lookup/v1?key=${ItadClient.apiKey}&title&appid=${steamAppId}`);
        const lookupData: ItadGameLookupResponse = await lookupResponse.json();
        console.debug(`lookup Response for ${steamAppId}: ${JSON.stringify(lookupData)}`)
        
        if (!lookupData.found) {
            return null;
        }
        return lookupData.game;
    }

    async historyLogs(itadId: string, since: string): Promise<ItadHistoryLogsResponse | null> {
        const requestOptions = {
            method: 'GET',
        };
        const historyLogsResponse = await fetch(`${ItadClient.host}/games/history/v2?key=${ItadClient.apiKey}&id=${itadId}&country=CN&shops=61&since=${since}`,
            requestOptions)
        const historyLogsData: ItadHistoryLogsResponse = await historyLogsResponse.json();
        console.debug(`historyLogsResponse Response for ${itadId}: ${JSON.stringify(historyLogsData)}`)
        
        if (historyLogsData == null || historyLogsData.length == 0) {
            return null
        }
        return historyLogsData
    }

    async storeLowestPrice(itadId: string, countryCode: string): Promise<StoreLowestPrice | null> {
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify([
                itadId
            ]),
        };
        const storeLowResponse = await fetch(`${ItadClient.host}/games/storelow/v2?key=${ItadClient.apiKey}&country=${countryCode}&shops=61`,
            requestOptions);
        const storeLowData: ItadStoreLowestPriceResponse = await storeLowResponse.json();
        console.info(`storeLowestPrice Response For itadId ${itadId}: ${JSON.stringify(storeLowData)}`);

        if (!storeLowData || storeLowData.length === 0) {
            return null
        }
        return {
            price: storeLowData[0].lows[0].price.amount,
            cut: storeLowData[0].lows[0].cut
        }
    }
}

export interface StoreLowestPrice {
    price: number;
    cut: number;
}

export type GameInfo = ItadGameLookupResponseGame

export type HistoryLogs = ItadHistoryLogsResponse


// Itad API Model

interface ItadGameLookupResponse {
    found: boolean
    game: ItadGameLookupResponseGame
}

interface ItadGameLookupResponseGame {
    id: string
    slug: string
    title: string
    type: string
    mature: boolean
}

type ItadHistoryLogsResponse = ItadHistoryLog[]

interface ItadHistoryLog {
  timestamp: string
  shop: ItadHistoryLogShop
  deal: ItadHistoryLogDeal
}

interface ItadHistoryLogShop {
  id: number
  name: string
}

interface ItadHistoryLogDeal {
  price: ItadHistoryLogPrice
  regular: ItadHistoryLogRegular
  cut: number
}

interface ItadHistoryLogPrice {
  amount: number
  amountInt: number
  currency: string
}

interface ItadHistoryLogRegular {
  amount: number
  amountInt: number
  currency: string
}

type ItadStoreLowestPriceResponse = ItadStoreLowestPrice[]

interface ItadStoreLowestPrice {
  id: string
  lows: ItadStoreLowestPriceLow[]
}

interface ItadStoreLowestPriceLow {
  shop: ItadStoreLowestPriceShop
  price: ItadStoreLowestPricePrice
  regular: ItadStoreLowestPriceRegular
  cut: number
  timestamp: string
}

interface ItadStoreLowestPriceShop {
  id: number
  name: string
}

interface ItadStoreLowestPricePrice {
  amount: number
  amountInt: number
  currency: string
}

interface ItadStoreLowestPriceRegular {
  amount: number
  amountInt: number
  currency: string
}
