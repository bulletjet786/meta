import { translateClient, TranslateProvider } from "./translate.ts";

test("bing translate", () => {
    translateClient.translate(TranslateProvider.Bing, "Hello", "zh_CN").then(res => {
        expect(res).toBe("你好");
    })
})