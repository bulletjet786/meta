import React, {useEffect, useReducer, useState} from 'react';
import {Button, Card, Steps, Typography} from 'antd';
import {EnableSteamCEFRemoteDebugging, Status} from "../../../wailsjs/go/steam/Service";
import { EventsOff, EventsOn } from "../../../wailsjs/runtime";

const {Title, Paragraph} = Typography;
const {Step} = Steps;

const SteamConnectionStatusEventName = "steam.connection.status"

function guideStateReducer(state: any, action: any): any {
    switch (action.type) {
        case 'enableSteamCEFRemoteDebugging':
            EnableSteamCEFRemoteDebugging()
        case 'load':
            Status().then(status => {state.status = status.state});
            return state;
    }
    return state
}


const SteamConnectionGuide = () => {

    const [state, dispatch] = useReducer(guideStateReducer, { state: 'Disconnected' });
    const [guideCurrent, setGuideCurrent] = useState(0);

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
            <Steps direction="vertical">
                <Step title="启动CEF远程调试" description={
                    <>
                        <Button type="primary" onClick={e => handleEnabledButton(e)}>启动CEF远程调试</Button>
                    </>
                } />
                <Step title="重新启动Steam" description={
                    <>
                        点击Steam客户端的重启按钮或者关闭后手动启动Steam。
                    </>
                } />
                <Step title="等待半分钟" description={
                    <>
                        <p>启动Steam后请耐心等待大约30秒。</p>
                        <p>如果一切正常，连接成功后，您将看到上方按钮变为绿色。</p>
                    </>
                }/>
            </Steps>
        </Card>
    );
};

export default SteamConnectionGuide;