import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh_CN from './locales/zh_CN.json' with { type: "json" };
import en_US from './locales/en_US.json' with { type: "json" };
import {GetMachineInfo} from "../../wailsjs/go/machine/Service";
import {GetSetting} from "../../wailsjs/go/setting/Service";

const resources = {
	"zh_CN": {
        "translation": zh_CN
    },
	"en_US": {
        "translation": en_US
    },
}

i18n
  // 注入 react-i18next 实例
  .use(initReactI18next)
  // 初始化 i18next
  // 配置参数的文档: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: 'en_US',
    interpolation: {
      escapeValue: false,
    },
    resources: resources
  }, function (err, t) {
      GetSetting().then(res => {
          console.log(`detect user language tag: ${res.Regular.UI.Language}`)
          i18n.changeLanguage(res.Regular.UI.Language);
      })
  });

export default i18n;

