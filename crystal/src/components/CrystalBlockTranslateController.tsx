import React from 'react';
import {Button, ConfigProvider, theme} from "antd";
import r2wc from '@r2wc/react-to-web-component'
import { defineWc } from './utils.ts'
import {create} from "zustand/react";

type CrystalTranslateControllerProps = {
    contentSelector: string,
}

interface BlockTranslateState {
  enabled: boolean,
  translate: (contentSelector: string) => void
}

const useTranslateStore = create<BlockTranslateState>()(
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
  
const CrystalBlockTranslateController: React.FC<CrystalTranslateControllerProps> = (props: CrystalTranslateControllerProps) => {
  
  const enabled = useTranslateStore(state => state.enabled)
  const translate = useTranslateStore(state => state.translate)

    return (
      <div>
        <ConfigProvider theme={{algorithm: [theme.darkAlgorithm, theme.compactAlgorithm]}}>
            <div style={{ width: "100%", display: "flex"}}>
                <div style={{ flex: 3  }}></div>
                <div style={{ flex: 1  }}>
                    <Button disabled= {!enabled} onClick={ () => { translate(props.contentSelector) } }> 翻译 </Button>
                </div>
            </div>
        </ConfigProvider>
      </div>
    )
};
  
export default CrystalBlockTranslateController;

export const CrystalBlockTranslateControllerWcName = "crystal-block-translate-controller"

export const CrystalTranslateControllerWc = r2wc(CrystalBlockTranslateController, {
    props: {
        contentSelector: "string"
    },
    // null: don't use shadow, ant design can inject styles to head.style 
    // open mode: we can inject styles
    // shadow: "open", 
})

export function defineCrystalTranslateControllerWc() {
    defineWc(CrystalBlockTranslateControllerWcName, CrystalTranslateControllerWc)
}

declare const window: {
  translate: any;
} & Window;
