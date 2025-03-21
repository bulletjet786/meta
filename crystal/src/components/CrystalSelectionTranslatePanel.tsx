// store.ts
import {create} from "zustand/react";
import r2wc from "@r2wc/react-to-web-component";
import {defineWc} from "./utils.ts";
import { useEffect } from "react";
import { Popover, Typography } from "antd";
import { CloseSquareOutlined, TranslationOutlined } from '@ant-design/icons';

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
    (set) => ({
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
            const result = "翻译结果"
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

    useEffect(() => {
        // 监听鼠标释放事件
        window.onmouseup = (e: MouseEvent): void => {
            // 获取选中的文本
            const raw = window.getSelection()?.toString().trim();
            if (!raw) return;

            // 获取鼠标位置
            const pos = {
                x: e.pageX,
                y: e.pageY,
            }

            // 设置翻译面板位置并显示
            select(pos, raw);
        };
    }, [])


    switch (state) {
        case PanelState.Hide:
            return <div></div>
        case PanelState.Selected:
            return (
                <div style={{ position: 'fixed', top: pos!.y, left: pos!.x }}>
                    <TranslationOutlined onClick={ () => translate() }/>
                </div>
            )
        case PanelState.Translated:
            const content = (
                <div>
                    <CloseSquareOutlined onClick={ () => close() }/>
                    <Typography.Text>${toText}</Typography.Text>
                </div>
            )

            return (
                <div style={{ position: 'fixed', top: pos!.y, left: pos!.x }}>
                    <Popover
                        content={ content }
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
