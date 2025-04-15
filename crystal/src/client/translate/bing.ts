import { TranslateProvider } from "./provider.ts";

export class BingProvider implements TranslateProvider {

    constructor() {}

    async translate(fromText: string, to: string): Promise<string | null> {
        return await this.translate0(fromText, to);
    }

    async translateXML(fromText: string, to: string): Promise<string | null> {
      return await this.translate0(fromText, to);
  }

  async translate0(fromText: string, to: string): Promise<string | null> {
    try {
        const res = await translate(fromText, {to: to})
        return res.text;
    } catch (err) {
        console.error("Google translate failed: ", err)
        return null
    }
  }
}


