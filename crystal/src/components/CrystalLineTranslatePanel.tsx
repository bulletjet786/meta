// store.ts
import create from 'zustand';

interface TranslationState {
    selectState: 'on' | 'off'; // 划词翻译开关状态
    setSelectState: (state: 'on' | 'off') => void;

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
    selectState: 'off',
    setSelectState: (state) => set({ selectState: state }),

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


// App.tsx
import React, { useEffect } from 'react';
import { useTranslationStore } from './store';
import './App.css'; // 引入样式文件

const App: React.FC = () => {
    const {
        selectState,
        setSelectState,
        isVisible,
        setIsVisible,
        setPosition,
        setSourceText,
        setTranslatedText,
        languages,
        setLanguages,
    } = useTranslationStore();

    // 监听 Chrome 存储中的开关状态
    useEffect(() => {
        chrome.storage.sync.get(['switch'], (result: { switch?: 'on' | 'off' }) => {
            if (result.switch) {
                setSelectState(result.switch);
            }
        });

        // 监听来自扩展的消息
        const messageListener = (request: { switch?: 'on' | 'off' }) => {
            if (request.switch) {
                setSelectState(request.switch);
            }
        };
        chrome.runtime.onMessage.addListener(messageListener);

        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, [setSelectState]);

    // 监听鼠标释放事件
    useEffect(() => {
        const handleMouseUp = async (e: MouseEvent) => {
            if (selectState === 'off') return;

            const rawText = window.getSelection()?.toString().trim();
            if (!rawText) return;

            const pos = { x: e.pageX, y: e.pageY };
            setPosition(pos); // 设置面板位置
            setSourceText(rawText); // 设置源文本
            setIsVisible(true); // 显示面板

            // 调用谷歌翻译接口
            try {
                const response = await fetch(
                    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${languages.sl.value}&tl=${languages.tl.value}&dt=t&q=${encodeURIComponent(rawText)}`
                );
                const data = await response.json();
                setTranslatedText(data[0][0][0]); // 提取翻译结果
            } catch (error) {
                console.error('翻译失败:', error);
                setTranslatedText('翻译失败');
            }
        };

        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [selectState, setPosition, setSourceText, setIsVisible, setTranslatedText, languages]);

    return (
        <div>
            <TranslationPanel />
        </div>
    );
};

export default App;

// TranslationPanel.tsx
import React from 'react';
import { useTranslationStore } from './store';

const TranslationPanel: React.FC = () => {
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

export default TranslationPanel;
