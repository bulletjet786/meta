import { IPlugin } from "./plugin.tsx";

export class AssistantPlugin implements IPlugin {

    client: any

    Name(): string {
        return "assistant";
    }

    Init() {
      const sdkImportScriptElement = document.createElement('script');
      sdkImportScriptElement.src = "https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.3/libs/cn/index.js";
      document.body.appendChild(sdkImportScriptElement);
      
      sdkImportScriptElement.onload = function() {
        this.client=new CozeWebSDK.WebChatClient({
          config: {
            bot_id: '7477549753925419044',
          },
          componentProps: {
            title: 'Steam伴侣智能助手',
          },
          auth: {
            type: 'token',
            token: 'pat_v5h1acjI6OLFJNXdxtlPAbOLAm1V5gyssqjOvHvAZhNOwP1FO7T4lVPdrXXyoZl9',
            onRefreshToken: function () {
              return 'pat_v5h1acjI6OLFJNXdxtlPAbOLAm1V5gyssqjOvHvAZhNOwP1FO7T4lVPdrXXyoZl9'
            }
          }
        });
      };

    }

    getToken() {
      
    }
}
