import React, {useEffect, useState} from "react";
import {Col, Row, Select, Space, Switch, Typography} from "antd";
import {
    AutoRunDisable,
    AutoRunEnable,
    AutoRunEnabled,
    GetSetting,
    SupportedLanguageLabels,
    UpdateSetting
} from "../../../wailsjs/go/setting/Service"
import i18n from "../../i18n/i18n";
import {useTranslation} from "react-i18next";

const {Title} = Typography;

const Setting = () => {

    const {t} = useTranslation();
    const [uiLanguageOptions, setUiLanguageOptions] = useState<Array<any>>([])
    const [uiLanguageSelect, setUiLanguageSelect] = useState<string>("en_US")
    const [autoRunEnabled, setAutoRunEnabled] = useState<boolean>(false)
    const [targetLanguage, setTargetLanguage] = useState<string>("en_US")
    const [engineProvider, setEngineProvider] = useState<string>("BingFree")

    useEffect(() => {
        SupportedLanguageLabels().then((languages) => {
            setUiLanguageOptions(languages.map((language) => {
                return {
                    value: language.Language,
                    label: language.Label
                }
            }))
        })
        GetSetting().then((setting) => {
            setTargetLanguage(setting.Translate.TargetLanguage)
            setUiLanguageSelect(setting.Regular.UI.Language)
            setEngineProvider(setting.Translate.Provider)
        })
    }, []);

    useEffect(() => {
        AutoRunEnabled().then((enabled) => {
            setAutoRunEnabled(enabled)
        })
    }, []);

    function updateUiLanguage(select: string) {
        console.log(`update ui language: ${select}`)
        GetSetting().then((setting) => {
            setting.Regular.UI.Language = select
            UpdateSetting(setting).then(() => {
                i18n.changeLanguage(select).then(r => {
                    setUiLanguageSelect(select)
                })
            })
        })
    }

    function updateTargetLanguage(select: string) {
        console.log(`update target language: ${select}`)
        GetSetting().then((setting) => {
            setting.Translate.TargetLanguage = select
            UpdateSetting(setting).then(() => {
                setTargetLanguage(select)
            })
        })
    }

    function updateTranslateProvider(select: string) {
        console.log(`update translate provider: ${select}`)
        GetSetting().then((setting) => {
            setting.Translate.Provider = select
            UpdateSetting(setting).then(() => {
                setEngineProvider(select)
            })
        })
    }

    function switchAutoRun(checked: boolean) {
        console.log(`switch auto run: ${checked}`)
        if (checked) {
            AutoRunEnable().then(() => {
                setAutoRunEnabled(true)
            })
        } else {
            AutoRunDisable().then(() => {
                setAutoRunEnabled(false)
            })
        }
    }

    return (
        <div style={{marginLeft: 32, marginRight: 32, marginTop: 40}}>
            {/* 标题部分：强制居左 */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: '100%',
                marginBottom: 24
            }}>
                <Title level={3}>
                    🎨 {t('setting.regular.title')}
                </Title>
            </div>

            <Space direction="vertical" size="large" style={{width: '100%'}}>
                <Row gutter={32} align="middle">
                    <Col span={9}>

                        <div style={{fontWeight: 500, minWidth: 80}}>
                            {t('setting.regular.language')}
                        </div>
                    </Col>
                    <Col>

                        <Select
                            id="language-select"
                            value={uiLanguageSelect}
                            options={uiLanguageOptions}
                            style={{width: 200}}
                            onChange={(value) => updateUiLanguage(value)}
                        />
                    </Col>
                </Row>
                <Row gutter={32} align="middle">
                    <Col span={9}>
                        <div style={{fontWeight: 500, minWidth: 80}}>
                            {t('setting.regular.auto_run')}
                        </div>
                    </Col>
                    <Col span={9}>
                        <Switch
                            checked={autoRunEnabled}
                            onChange={(checked) => switchAutoRun(checked)}
                        />
                    </Col>
                </Row>
            </Space>

            {/* ========== 翻译设置 =========== */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: '100%',
                marginBottom: 24
            }}>
                <Title level={3}>
                    🌐 {t('setting.translation.title')}
                </Title>
            </div>

            <Space direction="vertical" size="large" style={{width: '100%'}}>
                <Row gutter={32} align="middle">
                    <Col span={9}>
                        <div style={{fontWeight: 500, minWidth: 80}}>
                            {t('setting.translation.target_language')}
                        </div>
                    </Col>

                    <Col span={9}>
                        <Select
                            style={{width: '100%'}}
                            value={targetLanguage}
                            options={[
                                {value: 'en_US', label: 'English'},
                                {value: 'zh_CN', label: '简体中文'},
                                {value: 'zh_TW', label: '繁體中文'},
                                {value: 'ja_JP', label: '日本語'},
                                {value: 'ko_KR', label: '한국어'},
                            ]}
                            onChange={(value) => updateTargetLanguage(value)}
                        />
                    </Col>
                </Row>

                <Row gutter={32} align="middle">
                    <Col span={9}>
                        <div style={{fontWeight: 500, minWidth: 80}}>
                            {t('setting.translation.engine_provider')}
                        </div>
                    </Col>

                    <Col span={9}>
                        <Select
                            style={{width: '100%'}}
                            value={engineProvider}
                            options={[
                                {value: 'Bing', label: 'Bing'},
                                {value: 'XiaoNiu', label: 'XiaoNiu'},
                            ]}
                            onChange={(value) => updateTranslateProvider(value)}
                        />
                    </Col>
                </Row>
            </Space>
        </div>
    );
};

export default Setting;
