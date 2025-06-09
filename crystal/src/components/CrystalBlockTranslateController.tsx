import React, {useEffect, useState} from 'react';
import {Button, ConfigProvider} from "antd";
import r2wc from '@r2wc/react-to-web-component'
import { defineWc } from './utils.ts'
import {translateClient} from "../client/translate/translate.ts";
import IconFont from "../icon/icon.ts";

const pinkColorPrimary = "#722ed1"

type CrystalTranslateControllerProps = {
    translateNodeSelector: string,
    targetLanguage: string,
    containerStyle: Record<string, any>,
    provider: string
}

enum TranslateProcessingState {
    Untranslated,
    Translating,
    Translated,
}

class TranslateState {
    constructor(
        public translateProcessingState: TranslateProcessingState,
        public lastErr: boolean,
        public fromText: string,
        public toText: string,
        public translateNode: HTMLElement | null,
    ) {
    }
}
  
const CrystalBlockTranslateController: React.FC<CrystalTranslateControllerProps> = (props: CrystalTranslateControllerProps) => {
  
  const [state, setState] = useState(new TranslateState(TranslateProcessingState.Untranslated, false, "", "", null));
  useEffect(() => {
      init()
  }, []);

  function init() {
      console.log(`translateNodeSelector is ${props.translateNodeSelector}, targetLanguage is ${props.targetLanguage}`)
      const translateNode = document.querySelector(props.translateNodeSelector) as HTMLElement
      if (!translateNode) {
          console.log(`translateNode is null`)
          return
      }
      setState(new TranslateState(TranslateProcessingState.Untranslated, false, translateNode.innerHTML, state.toText, translateNode));
  }

  function handleClick() {
      if (state.translateProcessingState == TranslateProcessingState.Translated) {
          // 将已经翻译的内容还原
          setState(new TranslateState(TranslateProcessingState.Untranslated, false, state.fromText, state.toText, state.translateNode));
          state.translateNode!.innerHTML = state.fromText;
          return;
      } else {
          console.log(`translate will begin ... state is ${JSON.stringify(state)}`)
          if (state.toText != "" && !state.lastErr) {
              // 如果之前翻译过，并且没有出错，直接设置DOM元素为已经翻译的结果
              setState(new TranslateState(TranslateProcessingState.Translated, false, state.fromText, state.toText, state.translateNode))
              state.translateNode!.innerHTML = state.toText;
              return;
          } else {
              // 如果之前没有翻译过或者上次翻译出错了，则调用翻译接口进行翻译
              setState(new TranslateState(TranslateProcessingState.Translating, false, state.fromText, "......", state.translateNode))
              translateClient.translateXML(props.provider, state.fromText, props.targetLanguage).then((toText: string | null) => {
                  const result = toText == null ? "Translate Failed" : toText
                  setState(new TranslateState(TranslateProcessingState.Translated, true, state.fromText, result, state.translateNode))
                  state.translateNode!.innerHTML = result;
              });
          }
      }
  }

  return (
    <span>
      <ConfigProvider theme={
                {
                    token: {
                        colorPrimary: pinkColorPrimary,
                    },
                }
            }>
          <div style={ props.containerStyle }>
            <Button size="small" onClick={ () => { handleClick() } }>
                <IconFont type="icon-translate"></IconFont>
            </Button>
          </div>
      </ConfigProvider>
    </span>
  )
}

export const CrystalBlockTranslateControllerWcName = "crystal-block-translate-controller"

export const CrystalTranslateControllerWc = r2wc(CrystalBlockTranslateController, {
    props: {
        translateNodeSelector: "string",
        containerStyle: "json",
        targetLanguage: "string",
        provider: "string"
    },
    // null: don't use shadow, ant design can inject styles to head.style 
    // open mode: we can inject styles
    // shadow: "open", 
})

export function defineCrystalTranslateControllerWc() {
    defineWc(CrystalBlockTranslateControllerWcName, CrystalTranslateControllerWc)
}
