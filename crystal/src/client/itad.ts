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

    async gamePriceOverview(itadId: string, countryCode: string): Promise<GamePriceOverview | null> {
        const requestOptions = {
          method: 'POST',
          body: JSON.stringify([
            itadId
          ])
        };
     
        const gameOverviewResponse = await fetch(`https://${ItadClient.host}/games/overview/v2?key=${ItadClient.apiKey}&country=${countryCode}&shops=61&vouchers`, requestOptions)
        const gameOverviewData: GamePriceOverviewResponse = await gameOverviewResponse.json();
        console.info(`gamePriceOverview Response For itadId ${itadId}: ${JSON.stringify(gameOverviewData)}`);
        if (!gameOverviewData || gameOverviewData.prices.length === 0) {
          return null
        }

        return gameOverviewData.prices[0]
    }
}


export type GameInfo = ItadGameLookupResponseGame

export type HistoryLogs = ItadHistoryLogsResponse


// GameLookup API Model

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

// Game Price History Logs Api Model

type ItadHistoryLogsResponse = ItadHistoryLog[]

interface ItadHistoryLog {
  timestamp: string
  shop: Shop
  deal: ItadHistoryLogDeal
}

interface ItadHistoryLogDeal {
  price: Price
  regular: Price
  cut: number
}

// GameOverview API Model
export interface GamePriceOverviewResponse {
  prices: GamePriceOverview[]
  bundles: any[]
}

export interface GamePriceOverview {
  id: string
  current: Current
  lowest: Lowest
  bundled: number
}

export interface Current {
  shop: Shop
  price: Price
  regular: Price
  cut: number
  timestamp: string
  voucher: any
  flag: any
  drm: any[]
  platforms: Platform[]
  expiry: any
  url: string
}

export interface Platform {
  id: number
  name: string
}

export interface Lowest {
  shop: Shop
  price: Price
  regular: Price
  cut: number
  timestamp: string
}


// API Common Model

interface GameLowest {
  id: string
  lows: ShopLowest[]
}

interface ShopLowest {
  shop: Shop
  price: Price
  regular: Price
  cut: number
  timestamp: string
}

interface Shop {
  id: number
  name: string
}

interface Price {
  amount: number
  amountInt: number
  currency: string
}