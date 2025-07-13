import React, {useEffect, useState} from "react";
import {Button, Input, Space, Typography} from "antd";
import {GetSetting, UpdateSetting} from "../../../wailsjs/go/setting/Service"
import {useTranslation} from "react-i18next";
import Paragraph from "antd/es/typography/Paragraph";

const {Title} = Typography;

const Beta = () => {

    const {t} = useTranslation();
    const [engineDeepLUnlocked, setEngineDeepLUnlocked] = useState<boolean>(false)
    const [unlockCode, setUnlockCode] = useState("")

    useEffect(() => {
        GetSetting().then((setting) => {
            setEngineDeepLUnlocked(setting.Translate.DeepLUnlocked)
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
        </div>
    )
};

export default Beta;
