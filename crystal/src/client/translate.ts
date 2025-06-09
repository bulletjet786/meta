export class TranslateClient {

    // apiBase: string = "https://api.niutrans.com";
    apiBase: string = "https://p.deckz.fun";
    apiKey: string = "c0e5379394438203aabc9bd8dea9212e";

    static languageCodeMap = new Map<string, string>([
        ["zh_CN", "zh"],
        ["zh_TW", "cht"],
        ["en_US", "en"],
        ["ja_JP", "ja"],
        ["ko_KR", "ko"]
    ])

    constructor() {}

    async translate(fromText: string, toLanguage: string): Promise<string | null> {
        const languageCode = TranslateClient.languageCodeMap.get(toLanguage);
        const request = {
            'from': "auto",
            "to": languageCode,
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
        console.info(`translate rate Response for ${request}: ${JSON.stringify(translateData)}`)
        
        if (translateData.error_code != null) {
            return null;
        }
        return translateData.tgt_text;
    }

    async translateXML(fromText: string, toLanguage: string): Promise<string | null> {
      // 在发送HTTP请求之前需要对src_text字段参数进行URL Encode。
      const languageCode = TranslateClient.languageCodeMap.get(toLanguage);
      const request = {
          'from': "auto",
          "to": languageCode,
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
      const response = await fetch(`${this.apiBase}/translate/NiuTransServer/translationXML`, requestOptions)
      const translateData: TranslateResponse = await response.json()
      console.info(`translate Response for ${request}: ${JSON.stringify(translateData)}`)
      
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

