import { create } from 'zustand';
import React, { useEffect } from 'react';
import { Button, Input, message, Modal, Space, Spin, Table } from 'antd';
import { ChangeLibraries, GetDisplayApps, RevertLibraries } from '../../../wailsjs/go/steam/Service';
import { steam } from '../../../wailsjs/go/models';
import { connectClient } from '../../integration/supabase';
import { TranslateRequest } from '../../gen/library/v1/library_pb';
import DisplayAppInfo = steam.DisplayAppInfo;
import LibraryChange = steam.LibraryChange;

const { confirm } = Modal;

interface GameLibraryData {
    appId: number;
    currentName: string;
    targetName?: string;
}

interface GameLibraryState {
    games: GameLibraryData[];
    isEditMode: boolean;
    selectedRowKeys: React.Key[];
    loadingText: string | null;

    load: () => void;
    enterEditMode: () => void;
    exitEditMode: () => void;
    setSelectedRowKeys: (keys: React.Key[]) => void;
    updateTargetName: (id: number, newName: string) => void;
    translateSelected: () => void;
    revertSelected: () => void;
    applyChanges: () => Promise<{ success: boolean, count: number }>;
}

export const useGameLibraryState = create<GameLibraryState>((set, get) => ({
    games: [],
    isEditMode: false,
    selectedRowKeys: [],
    loadingText: null,

    load: async () => {
        set({ loadingText: '加载中...' });
        try {
            const apps = await GetDisplayApps();
            set({
                games: apps.map((app: DisplayAppInfo) => ({
                    appId: app.app_id,
                    currentName: app.display_name,
                })),
            });
        } catch (error) {
            console.error("Failed to load games:", error);
            message.error(`加载游戏列表失败: ${error}`);
        } finally {
            set({ loadingText: null });
        }
    },

    enterEditMode: () => set({ isEditMode: true }),

    exitEditMode: () => set(state => {
        const newGames = state.games.map(game => {
            const { targetName, ...rest } = game;
            return rest;
        });
        return {
            isEditMode: false,
            games: newGames,
            selectedRowKeys: [],
        };
    }),

    setSelectedRowKeys: (keys: React.Key[]) => set({ selectedRowKeys: keys }),

    updateTargetName: (id: number, newName: string) => set(state => ({
        games: state.games.map(game =>
            game.appId === id ? { ...game, targetName: newName } : game
        ),
    })),

    translateSelected: async () => {
        const { selectedRowKeys, games } = get();
        if (selectedRowKeys.length === 0) {
            message.info("请先选择需要翻译的游戏");
            return;
        }

        set({ loadingText: 'AI翻译中，可能时间较长，请耐心等待。' });
        try {
            const gamesToTranslate = games
                .filter(game => selectedRowKeys.includes(game.appId))
                .map(game => ({ appId: game.appId, name: game.currentName }));

            const request: TranslateRequest = {
                // @ts-ignore
                libraries: gamesToTranslate,
                targetLanguage: "zh_CN"
            };

            const response = await connectClient.translate(request);

            const translations = new Map(response.translated.map(l => [l.appId, l.translatedName]));

            set(state => ({
                games: state.games.map(game => {
                    if (translations.has(game.appId)) {
                        const translatedName = translations.get(game.appId)!;
                        if (translatedName !== game.currentName) {
                            return { ...game, targetName: translatedName };
                        }
                    }
                    return game;
                }),
            }));

            message.success(`成功翻译了 ${response.translated.length} 个游戏`);
        } catch (error) {
            console.error("Failed to translate games:", error);
            message.error(`翻译失败: ${(error as Error).message}`);
        } finally {
            set({ loadingText: null });
        }
    },

    revertSelected: () => {
        const { selectedRowKeys } = get();
        if (selectedRowKeys.length === 0) {
            return;
        }

        set(state => ({
            games: state.games.map(game => {
                if (selectedRowKeys.includes(game.appId)) {
                    const { targetName, ...rest } = game;
                    return rest;
                }
                return game;
            }),
        }));
    },

    applyChanges: async () => {
        const { games, exitEditMode } = get();
        const changesToApply: LibraryChange[] = games
            .filter(game => game.targetName !== undefined && game.currentName !== game.targetName)
            .map(game => new LibraryChange({ app_id: game.appId, display_name: game.targetName! }));

        const changeCount = changesToApply.length;

        if (changeCount === 0) {
            message.info("没有检测到任何更改");
            exitEditMode();
            return { success: true, count: 0 };
        }

        set({ loadingText: '正在应用更改...' });
        try {
            await ChangeLibraries(changesToApply);
            set(state => ({
                games: state.games.map(game => {
                    if (game.targetName !== undefined) {
                        return { ...game, currentName: game.targetName, targetName: undefined };
                    }
                    return game;
                }).map(g => { const { targetName, ...rest } = g; return rest; }),
                isEditMode: false,
                selectedRowKeys: [],
            }));
            return { success: true, count: changeCount };
        } catch (error) {
            console.error("Failed to apply changes:", error);
            return { success: false, count: 0 };
        } finally {
            set({ loadingText: null });
        }
    },
}));

export const Library = () => {
    const {
        games,
        isEditMode,
        selectedRowKeys,
        loadingText,
        load,
        enterEditMode,
        exitEditMode,
        setSelectedRowKeys,
        updateTargetName,
        translateSelected,
        revertSelected,
        applyChanges,
    } = useGameLibraryState();

    useEffect(() => {
        load();
    }, []);

    const handleExitEditMode = () => {
        const hasChanges = games.some(g => g.targetName !== undefined);
        if (hasChanges) {
            confirm({
                title: '您有未应用的更改',
                content: '确定要退出吗？所有未应用的修改都将丢失。',
                onOk() {
                    exitEditMode();
                },
                okText: '确定退出',
                cancelText: '取消',
            });
        } else {
            exitEditMode();
        }
    };

    const handleApplyChanges = async () => {
        const result = await applyChanges();
        if (result.success && result.count > 0) {
            message.success(`成功应用了 ${result.count} 项更改！重启Steam后生效。为防止Steam自动还原，建议开启本程序开机自启。`);
        } else if (!result.success) {
            message.error('应用更改失败，请重试。');
        }
    };

    const columns = [
        {
            title: 'AppID',
            dataIndex: 'appId',
            key: 'appId',
            width: '15%',
        },
        {
            title: '游戏名',
            dataIndex: 'currentName',
            key: 'name',
            width: '85%',
            render: (text: string, record: GameLibraryData) => {
                if (isEditMode) {
                    const isModified = record.targetName !== undefined;
                    const displayValue = isModified ? record.targetName : record.currentName;
                    return (
                        <Input
                            value={displayValue}
                            onChange={(e) => updateTargetName(record.appId, e.target.value)}
                            style={{
                                backgroundColor: isModified ? '#fffbe6' : 'transparent',
                                borderColor: isModified ? '#ffe58f' : '#d9d9d9',
                            }}
                        />
                    );
                }
                return text;
            },
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    };

    const handleRevertAll = () => {
        confirm({
            title: '确认要恢复所有游戏名为默认设置吗？',
            content: '此操作将移除所有已保存的修改，并将所有游戏名称恢复为Steam官方默认名称。此过程不可逆，操作完成后需要重启Steam才能生效。',
            okText: '确认恢复',
            cancelText: '取消',
            okButtonProps: { danger: true },
            async onOk() {
                try {
                    await RevertLibraries();
                    message.success('已恢复默认设置！请重启Steam，然后回到此页面刷新列表。', 5);
                    useGameLibraryState.setState({ games: [] });
                } catch (error) {
                    console.error("Failed to revert all libraries:", error);
                    message.error('恢复默认失败，请重试。');
                }
            },
        });
    };

    const renderActionBar = () => (
        <div style={{marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Space>
                {isEditMode && (
                    <>
                        <Button
                            type="primary"
                            onClick={translateSelected}
                            disabled={selectedRowKeys.length === 0}
                        >
                            AI翻译
                        </Button>
                        <Button
                            onClick={revertSelected}
                            disabled={selectedRowKeys.length === 0}
                        >
                            撤销修改
                        </Button>
                    </>
                )}
            </Space>
            <Space>
                {isEditMode ? (
                    <>
                        <Button type="primary" onClick={handleApplyChanges}>
                            应用更改
                        </Button>
                        <Button danger onClick={handleExitEditMode}>
                            退出编辑
                        </Button>
                    </>
                ) : (
                    <>
                        <Button type="primary" onClick={enterEditMode}>
                            进入编辑模式
                        </Button>
                        <Button danger onClick={handleRevertAll}>恢复默认</Button>
                    </>
                )}
            </Space>
        </div>
    );

    return (
        <div style={{ padding: '24px', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
            <Spin spinning={loadingText !== null} tip={loadingText} size={'large'}>
                {renderActionBar()}
                <Table
                    rowKey="appId"
                    rowSelection={isEditMode ? rowSelection : undefined}
                    columns={columns}
                    dataSource={games}
                    pagination={false}
                    size={'small'}
                    bordered
                />
            </Spin>
        </div>
    );
}
