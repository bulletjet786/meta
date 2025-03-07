export class CurrencyClient {

    // curl 'https://p.deckz.fun/currency/exchange_rate/convert?fromCode=USD&toCode=CNY&money=1'
    apiBase: string = "https://p.deckz.fun"; 

    constructor() {}

    async rate(fromCode: string, toCode: string): Promise<number | null> {
        if (fromCode == toCode) {
            return 1;
        }
        const response = await fetch(`${this.apiBase}/currency/exchange_rate/convert?fromCode=${fromCode}&toCode=${toCode}&money=1`)
        const rateData: CurrencyResponse = await response.json()
        console.debug(`currency rate Response for ${fromCode} to ${toCode}: ${JSON.stringify(this.rate)}`)
        
        if (!rateData.success) {
            return null;
        }
        return rateData.data.money;
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
  


