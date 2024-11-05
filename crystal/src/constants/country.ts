
// http://tool.huiruisoft.com/country/currency.html
// https://www.ups.com/worldshiphelp/WSA/CHS/AppHelp/mergedProjects/CORE/Codes/Country_Territory_and_Currency_Codes.htm

export class CountryInfo {
    constructor(
      public code: string,
      public name: string,
      public currencyCode: string,
      public currencySymbol: string,
    ) {
    }

    static CN = new CountryInfo("CN", "中国", "CNY", "¥");
    static US = new CountryInfo("US", "美国", "USD", "$");
    static AR = new CountryInfo("AR", "阿根廷", "ARS", "");
    static RU = new CountryInfo("RU", "俄罗斯", "RUB", "руб");
    static TR = new CountryInfo("TR", "土耳其", "TRY", "");
    static UA = new CountryInfo("UA", "乌克兰", "UAH", "");
}
  

  