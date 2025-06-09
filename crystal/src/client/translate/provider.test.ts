import { createProvider } from "./provider";

test("google translate", () => {
    const trans = createProvider("google");
    trans.translate("Hello", "zh").then(res => {
        expect(res).toBe("你好");
    })
})