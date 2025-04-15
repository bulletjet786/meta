import { TranslateProvider } from "./provider.ts";
import { translate } from "google-translate-api";

export class GoogleProvider implements TranslateProvider {

    constructor() {}

    async translate(fromText: string, to: string): Promise<string | null> {
        return await this.translate0(fromText, to);
    }

    async translateXML(fromText: string, to: string): Promise<string | null> {
      return await this.translate0(fromText, to);
  }

  async translate0(fromText: string, to: string): Promise<string | null> {
    try {
        const res = await translate(fromText, {to: to, corsUrl: "http://127.0.0.1:15637/proxy/translate/google/"})
        return res.text;
    } catch (err) {
        console.error("Google translate failed: ", err)
        return null
    }
  }
}

