export class TranslateClient {

    apiBase: string = "https://api.niutrans.com";
    apiKey: string = "c0e5379394438203aabc9bd8dea9212e";

    constructor() {}

    async translate(fromText: string): Promise<string | null> {
        const request = {
            'from': "en",
            "to": "zh",
            "apikey": this.apiKey,
            'srcText': fromText
          }
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify(
                request
            )
          };
        const response = await fetch(`${this.apiBase}/NiuTransServer/translation`, requestOptions)
        const translateData: TranslateResponse = await response.json()
        console.info(`currency rate Response for ${request}: ${JSON.stringify(rateData)}`)
        
        if (translateData.errorCode != "") {
            return null;
        }
        return translateData.tgtText;
    }
}

export interface TranslateResponse {
  errorCode: string
  errorMsg: string
  tgtText: string
  from: string
  to: string
}

export const translateClient = new TranslateClient();

