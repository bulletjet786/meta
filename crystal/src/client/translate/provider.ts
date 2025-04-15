import { BingProvider } from "./bing";
import { GoogleProvider } from "./google";
import { XiaoNiuProvider } from "./xiaoniu";

export interface TranslateProvider{
    translate(fromText: string): Promise<string | null>;
    translateXML(fromText: string): Promise<string | null>
}

export function createProvider(type: string): TranslateProvider {
    switch (type) {
        case "google":
            return new GoogleProvider();
        case "bing":
            return new BingProvider();
        case "xiaoniu":
            return new XiaoNiuProvider();
        default:
            return new BingProvider();
    }
}