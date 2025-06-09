
import supabaseClient from "../supabase.ts"

export const TranslateProvider = {
  XiaoNiu: "XiaoNiu",
  DeepL: "DeepL",
  Google: "Google",
  BingFree: "BingFree",
  Bing: "Bing"
} as const;

export class TranslateClient {

  static bingAuthUrl = "https://edge.microsoft.com/translate/auth"
  static bingTranslateUrl = "https://api.cognitive.microsofttranslator.com/translate"

  // https://api.cognitive.microsofttranslator.com/languages?api-version=3.0
  languageMap = new Map<string, string>([
      ["zh_CN", "zh-Hans"],
      ["zh_TW", "zh-Hant"],
      ["en_US", "en"],
      ["ja_JP", "ja"],
      ["ko_KR", "ko"]
  ])

  async translate(provider: string, fromText: string, toLanguage: string): Promise<string | null> {
    if (provider == TranslateProvider.BingFree) {
      const bingToLanguage = this.languageMap.get(toLanguage)
      if (bingToLanguage == null) {
        return null
      }
      return await this.translateForBingFree(fromText, bingToLanguage);
    }

    const body = {
      provider: provider,
      toLanguage: toLanguage,
      type: "Text",
      text: { 
        from: fromText
      }
    }
    const { data, error } = await supabaseClient.functions.invoke('translation/translate', {
      body: body
    })
    if (error) {
      console.error(error)
      return null
    }
    return data.text.to;
  }

  async translateXML(provider: string, fromText: string, toLanguage: string): Promise<string | null> {
    if (provider == TranslateProvider.BingFree) {
      const bingToLanguage = this.languageMap.get(toLanguage)
      if (bingToLanguage == null) {
        return null
      }
      return await this.translateForBingFree(fromText, toLanguage);
    }

    const body = {
      provider: provider,
      toLanguage: toLanguage,
      type: "Html",
      html: { 
        from: fromText 
      }
    }
    const { data, error } = await supabaseClient.functions.invoke('translation/translate', {
      body: JSON.stringify(body)
    })
    if (error) {
      console.error(error)
      return null
    }
    return data.html.to;
  }

  async translateForBingFree(fromText: string, toLanguage: string): Promise<string | null> {
    const response = await fetch(`${TranslateClient.bingAuthUrl}`)
    const authString: string = await response.text()

    const requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "Authorization": `Bearer ${authString}`
      },
      body: JSON.stringify([{
        "Text": fromText
      }])
    };
    const translateDataResponse = await fetch(`${TranslateClient.bingTranslateUrl}?api-version=3.0&to=${toLanguage}`, requestOptions)
    const translateData: TranslateData[] = await translateDataResponse.json()
    if (translateData.length == 0 || translateData[0].translations.length == 0 || translateData[0].translations[0].text == "") {
      return null
    }
    return translateData[0].translations[0].text;
  }
}

export interface TranslateData {
  detectedLanguage: DetectedLanguage
  translations: Translation[]
}

export interface DetectedLanguage {
  language: string
  score: number
}

export interface Translation {
  text: string
  to: string
  sentLen: SentLen
}

export interface SentLen {
  srcSentLen: number[]
  transSentLen: number[]
}

export const translateClient = new TranslateClient();
