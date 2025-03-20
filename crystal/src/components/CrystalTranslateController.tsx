import React from 'react';
import {Button, ConfigProvider, theme} from "antd";
import r2wc from '@r2wc/react-to-web-component'
import { defineWc } from './utils.ts'
import {create} from "zustand/react";

type CrystalTranslateControllerProps = {
    contentSelector: string,
}

interface TranslateState {
  enabled: boolean,
  translate: (contentSelector: string) => void
}

const useTranslateStore = create<TranslateState>()(
  (set) => ({
    enabled: true,
    translate: (contentSelector: string) => {
      window.translate.setDocuments(document.querySelector(contentSelector))
      window.translate.execute()
      set(() => ({
        enabled: false,
      }))
    },
  })
)
  
const CrystalTranslateController: React.FC<CrystalTranslateControllerProps> = (props: CrystalTranslateControllerProps) => {
  
  const enabled = useTranslateStore(state => state.enabled)
  const translate = useTranslateStore(state => state.translate)

    return (
      <div>
        <ConfigProvider theme={{algorithm: [theme.darkAlgorithm, theme.compactAlgorithm]}}>
          <Button disabled= {!enabled} onClick={ () => { translate(props.contentSelector) } }> 翻译 </Button>
        </ConfigProvider>
      </div>
    )
};
  
export default CrystalTranslateController;

export const CrystalTranslateControllerName = "crystal-translate-controller"

export const CrystalTranslateControllerWc = r2wc(CrystalTranslateController, {
    props: {
        contentSelector: "string"
    },
    // null: don't use shadow, ant design can inject styles to head.style 
    // open mode: we can inject styles
    // shadow: "open", 
})

export function defineCrystalTranslateControllerWc() {
    defineWc(CrystalTranslateControllerName, CrystalTranslateControllerWc)
}

declare const window: {
  translate: any;
} & Window;
