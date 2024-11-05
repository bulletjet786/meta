import React, {useEffect, useReducer} from 'react';
import {Card, Space, Switch, Typography} from 'antd';
import {EventsOff, EventsOn} from "../../../wailsjs/runtime";
import useCEFDebuggingStore from "../../context/cef_debugging";
import { useTranslation } from "react-i18next";
import { SteamConnectionStatusEventName } from "../../constants/constants";

const {Title, Paragraph, Text} = Typography;

function guideStateReducer(model: any, action: any): any {
    console.log("Do state reducer for model: %s, with: %s, ", JSON.stringify(model), JSON.stringify(action))
    switch (action.type) {
        case 'load':
            const payload = action.payload;
            if (model.state != payload.state) {
                switch (payload.state) {
                    case 'Disconnected':
                        break
                    case 'Connected':
                        break
                }
                return {
                    state: payload.state,
                }
            }
            break
    }
    return model;
}


const Guide = () => {

    const { t } = useTranslation();

    const [model, dispatch] = useReducer(guideStateReducer, {state: 'Disconnected'});
    const cefStateChanged = useCEFDebuggingStore((state: any) => state.changed)
    const cefState = useCEFDebuggingStore((state: any) => state.enabled)
    const cefLoad = useCEFDebuggingStore((state: any) => state.load)

    useEffect(
        () => {
            EventsOn(SteamConnectionStatusEventName, (status) => {
                console.log("Received SteamConnectionStatus Event: " + JSON.stringify(status))
                dispatch({type: 'load', payload: status})
            });
            cefLoad()
            return () => {
                EventsOff(SteamConnectionStatusEventName);
            }
        }
    )

    const showRestartSteam = cefStateChanged && cefState && model.state == 'Disconnected'

    let content = <div></div>
    if (showRestartSteam) {
        content = <Paragraph style={{ marginBottom: 24 }}>
            { t('guide.tooltip.need_restart') }
        </Paragraph>
    } else if (cefState && model.state == 'Connected') {
        content = <Paragraph style={{ marginBottom: 24 }}>
            { t('guide.tooltip.connected') }
        </Paragraph>
    } else if (!cefState) {
        content = <Paragraph style={{ marginBottom: 24 }}>
            { t('guide.tooltip.cef_disabled') }
        </Paragraph>
    }

    return (
        <div style={{ padding: 40, maxWidth: 700, margin: '0 auto' }}>
            <Card
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 12 }}
            >
                <Paragraph strong style={{ fontSize: 16, marginBottom: 24 }}>
                    { t('guide.state.name') }
                    <Text style={{ color: '#1890ff' }}>
                        { model.state == 'Connected' ? t('guide.state.connected') : t('guide.state.disconnected') }
                    </Text>
                </Paragraph>

                { content }
            </Card>
        </div>
    );
};

export default Guide;