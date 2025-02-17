import React, {useEffect, useReducer} from 'react';
import {Button, Card, Typography} from 'antd';
import {EnableSteamCEFRemoteDebugging} from "../../../wailsjs/go/steam/Service";
import { EventsOff, EventsOn } from "../../../wailsjs/runtime";
import staticMethods from 'antd/es/message';

const {Title, Paragraph} = Typography;

const SteamConnectionStatusEventName = "steam.connection.status"

function guideStateReducer(model: any, action: any): any {
    switch (action.type) {
        case 'enableSteamCEFDebugging':
            EnableSteamCEFRemoteDebugging()
        case 'load':
            const payload = action.payload;
            if (model.state != payload.state) {
                let stateDesc = "未连接"
                switch (model.state) {
                    case 'Disconnected':
                        stateDesc = "未连接"
                    case 'Connected':
                        stateDesc = "运行中"
                }
                return {
                    state: payload.state,
                    stateDesc: stateDesc
                }
            }
    }
    return model;
}


const SteamConnectionGuide = () => {

    const [model, dispatch] = useReducer(guideStateReducer, { state: 'Disconnected', stateDesc: "未连接" });

    useEffect(
        () => { 
            EventsOn(SteamConnectionStatusEventName, (status) => {
                console.log("Received SteamConnectionStatus Event: $status")
                dispatch( { type: 'load', payload: status} )
            });
            return () => {
                EventsOff(SteamConnectionStatusEventName);
            }
        }
    )

    function handleEnabledButton(e: any) {
        return dispatch({type: 'enableSteamCEFDebugging'});
    }

    return (
        <Card title={<Title level={2}>Steam伴侣</Title>} style={{width: '100%'}}>
            <Paragraph strong>状态：{model.stateDesc}</Paragraph>
            <Title level={3}>如何连接上Steam</Title>
                <div>
                    <p>1. 启动CEF调试：</p>
                    <Button type="primary" onClick={e => handleEnabledButton(e)}>启动CEF调试</Button>
                </div>
                <div>
                    <p>2. 重新Steam客户端，耐心等待大约30秒，连接成功后，您将看到上方状态变为 运行中。</p>
                </div>
        </Card>
    );
};

export default SteamConnectionGuide;