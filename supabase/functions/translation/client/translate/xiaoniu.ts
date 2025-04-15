import { TranslateProvider } from "./provider.ts";

export class XiaoNiuClient implements TranslateProvider {

    apiBase: string = "https://api.niutrans.com";
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
        const response = await fetch(`${this.apiBase}/NiuTransServer/translation`, requestOptions)
        const translateData: TranslateResponse = await response.json()
        console.info(`currency rate Response for ${request}: ${JSON.stringify(translateData)}`)
        
        if (translateData.error_code != null) {
            return null;
        }
        return translateData.tgt_text;
    }

    async translateXML(fromText: string): Promise<string | null> {
      // 在发送HTTP请求之前需要对src_text字段参数进行URL Encode。
      // 
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
      const response = await fetch(`${this.apiBase}/NiuTransServer/translationXML`, requestOptions)
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

export const xiaoNiuClient = new XiaoNiuClient();

