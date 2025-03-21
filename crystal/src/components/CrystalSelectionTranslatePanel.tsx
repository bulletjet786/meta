// store.ts
import create from 'zustand';
import r2wc from "@r2wc/react-to-web-component";
import {defineWc} from "./utils.ts";
import CrystalGamePanel from "./CrystalGamePanel.tsx";

interface TranslationState {
    isVisible: boolean; // 翻译面板是否可见
    setIsVisible: (visible: boolean) => void;

    position: { x: number; y: number }; // 翻译面板位置
    setPosition: (pos: { x: number; y: number }) => void;

    sourceText: string; // 源文本
    setSourceText: (text: string) => void;

    translatedText: string; // 翻译后的文本
    setTranslatedText: (text: string) => void;

    languages: { sl: { key: string; value: string }; tl: { key: string; value: string } }; // 语言设置
    setLanguages: (languages: { sl: { key: string; value: string }; tl: { key: string; value: string } }) => void;
}

export const useTranslationStore = create<TranslationState>((set) => ({

    isVisible: false,
    setIsVisible: (visible) => set({ isVisible: visible }),

    position: { x: 0, y: 0 },
    setPosition: (pos) => set({ position: pos }),

    sourceText: '',
    setSourceText: (text) => set({ sourceText: text }),

    translatedText: '...',
    setTranslatedText: (text) => set({ translatedText: text }),

    languages: {
        sl: { key: '英语', value: 'en' },
        tl: { key: '简体中文', value: 'zh-Hans' },
    },
    setLanguages: (languages) => set({ languages }),
}));

const SelectionTranslationPanel: React.FC = () => {
    const { isVisible, position, sourceText, translatedText, setIsVisible, languages } = useTranslationStore();

    // 隐藏翻译面板
    const hidePanel = () => {
        setIsVisible(false);
    };

    return (
        <div
            className={`translate-panel ${isVisible ? 'show' : ''}`}
            style={{
                top: position.y,
                left: position.x,
            }}
        >
            <header>
                翻译
                <span className="close" onClick={hidePanel}>
                    X
                </span>
            </header>
            <main>
                <div className="source">
                    <div className="title">{languages.sl.key}</div>
                    <div className="content">{sourceText}</div>
                </div>
                <div className="dest">
                    <div className="title">{languages.tl.key}</div>
                    <div className="content">{translatedText}</div>
                </div>
            </main>
        </div>
    );
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
