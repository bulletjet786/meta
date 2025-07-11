import React, {useEffect, useReducer, useState} from "react";
import {Card, Row, Select, Switch, Typography} from "antd";
import {GetSetting, SupportedLanguageLabels, UpdateSetting} from "../../../wailsjs/go/setting/Service"
import i18n from "../../i18n/i18n";
import { useTranslation } from "react-i18next";
import {GetMachineInfo} from "../../../wailsjs/go/machine/Service";

const {Title, Paragraph} = Typography;

const About = () => {

    const [version, setVersion] = useState("?.?.?")
    const { t } = useTranslation();

    useEffect(() => {
        GetMachineInfo().then((info) => {
            setVersion(info.version)
        })
    }, []);

    return (<div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
        <Title level={3} style={{ marginBottom: 24 }}>📘 关于本软件</Title>

        <Paragraph strong>{ t('about.software_name') }</Paragraph>
        <Paragraph strong>{ t('about.current_version') + "：" + version }</Paragraph>
        {/*<Paragraph>构建时间：2025年4月5日</Paragraph>*/}
        {/*<Paragraph>开发者：张三 / MyCompany</Paragraph>*/}
        <Paragraph style={{ marginTop: 16 }}>
            { t('about.software_description') }
        </Paragraph>

        {/*<Paragraph style={{ marginTop: 24 }}>*/}
        {/*    官方网站：<a href="https://example.com" target="_blank">https://example.com</a>*/}
        {/*</Paragraph>*/}
        {/*<Paragraph>*/}
        {/*    源码地址：<a href="https://github.com/yourname/yourrepo" target="_blank">GitHub</a>*/}
        {/*</Paragraph>*/}

        {/*<Paragraph style={{ marginTop: 16 }}>许可证：MIT License</Paragraph>*/}
        {/*<Paragraph>© 2025 MyCompany. 保留所有权利。</Paragraph>*/}

        <Paragraph style={{ marginTop: 16 }}>
            加入我们的QQ群：<Typography.Text code>1044717281</Typography.Text>
        </Paragraph>
        <Paragraph style={{ marginTop: 16 }}>
            开发者电子邮件：<Typography.Text code>851234786@qq.com</Typography.Text>
        </Paragraph>
    </div>
    )
};

export default About;