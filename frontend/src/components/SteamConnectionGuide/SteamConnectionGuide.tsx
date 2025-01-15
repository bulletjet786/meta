import React, {useEffect, useReducer, useState} from 'react';
import {Button, Card, Steps, Typography} from 'antd';
import {EnableSteamCEFRemoteDebugging, Status} from "../../../wailsjs/go/steam/Service";
import { EventsOff, EventsOn } from "../../../wailsjs/runtime/runtime";

const {Title, Paragraph} = Typography;
const {Step} = Steps;

const SteamConnectionStatusEventName = "steam.connection.status"

function guideStateReducer(state: any, action: any): any {
    switch (action.type) {
        case 'enableSteamCEFRemoteDebugging':
            EnableSteamCEFRemoteDebugging()
                .then()
            return {
                ...state,
            };
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
        }
    )

    function handleEnabledButton(e: any) {
        return dispatch({type: 'enableSteamCEFRemoteDebugging'});
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
                <Step title="重新启动Steam" description="点击Steam客户端的重启按钮或者关闭后手动开启。"/>
                <Step title="等待半分钟" description={
                    <>
                        <p>启动Steam后请耐心等待大约30秒。</p>
                        <p>如果一切正常，连接成功后，您将看到上方按钮变为绿色。</p>
                    </>
                }/>
            </Steps>
            {/* 这里可以根据实际情况添加更多交互元素，比如检查连接状态的按钮 */}
            <Button type="primary" style={{marginTop: '24px'}}>检查连接状态</Button>
        </Card>
    );
};

export default SteamConnectionGuide;