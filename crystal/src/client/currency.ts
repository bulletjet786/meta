export class CurrencyClient {

    // curl 'https://p.deckz.fun/currency/exchange_rate/convert?fromCode=USD&toCode=CNY&money=1'
    apiBase: string = "https://p.deckz.fun";

    private cache = new Map<string, number>();

    constructor() {}

    async rate(fromCode: string, toCode: string): Promise<number | null> {
        if (fromCode == toCode) {
            return 1;
        }
        if (this.cache.has(this.cacheKey(fromCode, toCode))) {
            return this.cache.get(this.cacheKey(fromCode, toCode)) as number;
        }
        const response = await fetch(`${this.apiBase}/currency/exchange_rate/convert?fromCode=${fromCode}&toCode=${toCode}&money=1`)
        const rateData: CurrencyResponse = await response.json()
        console.info(`currency rate Response for ${fromCode} to ${toCode}: ${JSON.stringify(rateData)}`)
        
        if (!rateData.success) {
            return null;
        }
        this.cache.set(this.cacheKey(fromCode, toCode), rateData.data.money);
        return rateData.data.money;
    }

    cacheKey(fromCode: string, toCode: string) {
        return `${fromCode}-${toCode}`
    }
}

export interface CurrencyResponse {
  msg: string
  success: boolean
  code: number
  data: CurrencyResponseData
}

export interface CurrencyResponseData {
  orderNo: string
  ret_code: string
  money: number
}

export const currencyClient = new CurrencyClient();

