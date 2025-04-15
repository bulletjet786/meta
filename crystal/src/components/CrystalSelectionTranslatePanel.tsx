// store.ts
import {create} from "zustand/react";
import r2wc from "@r2wc/react-to-web-component";
import {defineWc} from "./utils.ts";
import React, { useEffect, useRef} from "react";
import {Button, Popover, Typography} from "antd";
import { translateClient } from "../client/translate.ts";

enum PanelState {
    Hide,        // 隐藏状态
    Selected,    // 选中文本
    Translated,  // 翻译状态
}

interface Pos {
    x: number; // 鼠标位置 X
    y: number; // 鼠标位置 Y
}

interface SelectionTranslationPanelState {
    state: PanelState
    fromText: string,
    toText: string,
    pos: Pos | null,
    select: (pos: Pos, fromText: string) => void,
    translate: () => void,
    close: () => void,
 }

export const useSelectionTranslationPanelStore = create<SelectionTranslationPanelState>(
    (set, get) => ({
        state: PanelState.Hide,
        fromText: "",
        toText: "...",
        pos: null,
        select: (pos: Pos, fromText: string) => {
            set({ state: PanelState.Selected, pos: pos, fromText: fromText })
        },
        translate: async () => {
            set({ state: PanelState.Translated })
            // 获取翻译的结果
            let result = await translateClient.translate(get().fromText)
            if (result == null) {
                result = "翻译出错啦..."
            }
            set({
                state: PanelState.Translated,
                toText: result,
            })
        },
        close: () => {
            set({ state: PanelState.Hide, fromText: "", toText: "..." })
        }
    })
);

const SelectionTranslationPanel: React.FC = () => {
    const { state, pos, select, toText, translate, close } = useSelectionTranslationPanelStore();
    const panelRef = useRef<HTMLDivElement>(null);

    function handleMouseUp(e: MouseEvent) {
        // 获取选中的文本
        const raw = window.getSelection()?.toString().trim();
        console.debug(`receive mouseup event: ${e}, and selected text: ${raw}`)
        if (!raw) return;

        // 获取鼠标位置
        const pos = {
            x: e.pageX,
            y: e.pageY,
        }

        // 设置翻译面板位置并显示
        select(pos, raw);
    }

    function handleMouseDown(e: MouseEvent) {
        console.debug(`receive mousedown event: ${e}`)
        if (
            panelRef.current && // 确保 ref 已正确绑定
            !panelRef.current.contains(e.target as HTMLDivElement)
        ) {
            console.debug("receive mousedown event: ${e} and click outside of panel");
            close();
        }
    }

    useEffect(() => {
        // 监听鼠标释放事件
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleMouseDown);
        }
    }, [])

    switch (state) {
        case PanelState.Hide:
            return <div></div>
        case PanelState.Selected:
            return (
                <div ref={panelRef} style={{ position: 'absolute', top: pos!.y, left: pos!.x, zIndex: 9999 }}>
                    <Button color="purple" variant="filled" onClick={ () => translate() }>翻译</Button>
                    {/*<TranslationOutlined onClick={ () => translate() }/>*/}
                </div>
            )
        case PanelState.Translated:
            return (
                <div ref={panelRef} style={{ position: 'absolute', top: pos!.y, left: pos!.x, zIndex: 9999 }}>
                    <Popover
                        content={ (
                            <div style={{ maxWidth: '400px' }}>
                                <Typography.Text>{ toText }</Typography.Text>
                                {/*<CloseSquareOutlined onClick={ () => close() }/>*/}
                            </div>
                        ) }
                        open={true}
                    >
                        {/* 占位元素 */}
                        <div style={{ height: '100vh' }} />
                    </Popover>
                </div>
            )
    }
};

export default SelectionTranslationPanel;

export const CrystalSelectionTranslatePanelWcName = "crystal-selection-translate-panel"

export const CrystalSelectionTranslatePanelWc = r2wc(SelectionTranslationPanel, {
    props: {

    },
    // null: don't use shadow, ant design can inject styles to head.style
    // open mode: we can inject styles
    // shadow: "open",
})

export function defineSelectionTranslatePanelWc() {
    defineWc(CrystalSelectionTranslatePanelWcName, CrystalSelectionTranslatePanelWc)
}
