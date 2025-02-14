import React, {useEffect, useReducer, useState} from 'react';
import {Button, Card, Steps, Typography} from 'antd';
import {EnableSteamCEFRemoteDebugging, Status} from "../../../wailsjs/go/steam/Service";
import { EventsOff, EventsOn } from "../../../wailsjs/runtime";

const {Title, Paragraph} = Typography;
const {Step} = Steps;

const SteamConnectionStatusEventName = "steam.connection.status"

function guideStateReducer(state: any, action: any): any {
    switch (action.type) {
        case 'enableSteamCEFDebugging':
            EnableSteamCEFRemoteDebugging()
        case 'load':
            Status().then(status => {state.status = status.state});
            return state;
    }
    return state
}


const SteamConnectionGuide = () => {

    const [state, dispatch] = useReducer(guideStateReducer, { state: 'Disconnected' });

    useEffect(
        () => { 
            dispatch( { type: 'load'} );
            EventsOn(SteamConnectionStatusEventName, (status) => {
                dispatch( { type: 'load'} )
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
            <Paragraph strong>状态：{state.status}</Paragraph>
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