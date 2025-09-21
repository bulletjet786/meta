import React, {useEffect, useState} from "react";
import {Button, Divider, Input, message, Space, Typography} from "antd";
import {GetSetting, UpdateSetting} from "../../../wailsjs/go/setting/Service"
import {useTranslation} from "react-i18next";
import Paragraph from "antd/es/typography/Paragraph";
import supabaseClient from "../../integration/supabase";
import {EventsEmit} from "../../../wailsjs/runtime";

const {Title} = Typography;

const Beta = () => {

    const {t} = useTranslation();
    const [engineDeepLUnlocked, setEngineDeepLUnlocked] = useState<boolean>(false)
    const [unlockCode, setUnlockCode] = useState("")
    const [adminKey, setAdminKey] = useState("")

    useEffect(() => {
        GetSetting().then((setting) => {
            setEngineDeepLUnlocked(setting.Translate.DeepLUnlocked)
            setAdminKey(setting.AdminKey || "")
        })
    }, []);


    function handleDeepLUnlock() {
        if (engineDeepLUnlocked) {
            return;
        }
        if (unlockCode != "SteamMetaLovesYou") {
            return;
        }
        GetSetting().then((setting) => {
            setting.Translate.DeepLUnlocked = true
            UpdateSetting(setting).then(() => {
                setEngineDeepLUnlocked(true)
                setUnlockCode("")
            })
        })
    }

    async function handleSaveAdminKey() {
        const keyToSave = adminKey.trim();
        if (!keyToSave) {
            message.error("密钥不能为空。");
            return;
        }

        try {
            const { error } = await supabaseClient
                .from('admin_key')
                .select('admin_key')
                .eq('admin_key', keyToSave)
                .single();

            if (error) {
                console.error("Admin key verification error:", error)
                message.error("无效的管理密钥。");
                return;
            }
        } catch (e) {
            message.error("验证密钥时出错。" + e);
            return;
        }

        GetSetting().then((setting) => {
            setting.AdminKey = keyToSave
            UpdateSetting(setting).then(() => {
                setAdminKey(keyToSave)
                message.success("管理密钥已保存！")
                // Emit an event to notify other components that the key has changed
                EventsEmit("adminKeyUpdated");
            })
        })
    }

    return (
        <div style={{
            marginTop: 40,
            padding: 24,
            background: 'rgba(0,0,0,0.02)',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.06)'
        }}>
            <Title level={4}>{t('beta.title')}</Title>
            <Paragraph type="secondary">
                {t('beta.description')}
            </Paragraph>
            <Space.Compact style={{width: '100%'}}>
                <Input
                    placeholder={t('beta.input_placeholder')}
                    value={unlockCode}
                    onChange={(e) => setUnlockCode(e.target.value)}
                    onPressEnter={handleDeepLUnlock}
                />
                <Button type="primary"
                        onClick={handleDeepLUnlock}
                        disabled={engineDeepLUnlocked}>
                    {engineDeepLUnlocked ? t('beta.button_unlocked') : t('beta.button_unlock')}
                </Button>
            </Space.Compact>

            <Divider/>

            <Title level={4}>管理密钥</Title>
            <Paragraph type="secondary">
                设置用于激活管理功能的密钥。
            </Paragraph>
            <Space.Compact style={{width: '100%'}}>
                <Input
                    placeholder="请输入管理密钥"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    onPressEnter={handleSaveAdminKey}
                />
                <Button type="primary"
                        onClick={handleSaveAdminKey}>
                    保存
                </Button>
            </Space.Compact>
        </div>
    )
};

export default Beta;
