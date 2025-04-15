export class TranslateClient {

    // apiBase: string = "https://api.niutrans.com";
    apiBase: string = "https://p.deckz.fun";
    apiKey: string = "c0e5379394438203aabc9bd8dea9212e";

    constructor() {}

    async translate(fromText: string): Promise<string | null> {
        const request = {
            'from': "auto",
            "to": "zh",
            "apikey": this.apiKey,
            'src_text': fromText
          }
        const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                request
            )
          };
        const response = await fetch(`${this.apiBase}/translate/NiuTransServer/translation`, requestOptions)
        const translateData: TranslateResponse = await response.json()
        console.info(`currency rate Response for ${request}: ${JSON.stringify(translateData)}`)
        
        if (translateData.error_code != null) {
            return null;
        }
        return translateData.tgt_text;
    }
}

export interface TranslateResponse {
  error_code: string
  error_msg: string
  tgt_text: string
  from: string
  to: string
}

export const translateClient = new TranslateClient();

