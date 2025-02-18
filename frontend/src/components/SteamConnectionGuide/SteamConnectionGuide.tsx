import React, {useEffect, useReducer} from 'react';
import {Card, Switch, Typography} from 'antd';
import { EventsOff, EventsOn } from "../../../wailsjs/runtime";
import useCEFDebuggingStore from "../../context/cef_debugging";

const {Title, Paragraph} = Typography;

const SteamConnectionStatusEventName = "steam.connection.status"

function guideStateReducer(model: any, action: any): any {
    console.log("Do state reducer for model: %s, with: %s, ", JSON.stringify(model), JSON.stringify(action))
    switch (action.type) {
        case 'load':
            const payload = action.payload;
            if (model.state != payload.state) {
                let stateDesc = "未连接"
                switch (payload.state) {
                    case 'Disconnected':
                        stateDesc = "未连接"
                        break
                    case 'Connected':
                        stateDesc = "运行中"
                        break
                }
                return {
                    state: payload.state,
                    stateDesc: stateDesc
                }
            }
            break
    }
    return model;
}


const SteamConnectionGuide = () => {

    const [model, dispatch] = useReducer(guideStateReducer, { state: 'Disconnected', stateDesc: "未连接" });

    const cefState = useCEFDebuggingStore((state: any) => state.enabled)
    const cefLoad = useCEFDebuggingStore((state: any) => state.load)
    const cefEnable = useCEFDebuggingStore((state: any) => state.enableCEFDebugging)
    const cefDisable = useCEFDebuggingStore((state: any) => state.disableCEFDebugging)

    useEffect(
        () => { 
            EventsOn(SteamConnectionStatusEventName, (status) => {
                console.log("Received SteamConnectionStatus Event: " + JSON.stringify(status))
                dispatch( { type: 'load', payload: status} )
            });
            cefLoad()
            return () => {
                EventsOff(SteamConnectionStatusEventName);
            }
        }
    )

    function switchCEFDebuggingButton(e: any) {
        console.log("Cef state now is ", cefState)
        if (cefState) {
            cefDisable()
        } else {
            cefEnable()
        }
    }

    return (
        <Card title={<Title level={2}>Steam伴侣</Title>} style={{width: '100%'}}>
            <Paragraph strong>状态：{model.stateDesc}</Paragraph>
            <Title level={3}>如何连接上Steam</Title>
                <div>
                    <p>1. 启动CEF调试：</p>
                    <Switch defaultChecked={ cefState } onClick={ switchCEFDebuggingButton } />
                </div>
                <div>
                    <p>2. 重新Steam客户端，耐心等待大约30秒，连接成功后，您将看到上方状态变为 运行中。</p>
                </div>
        </Card>
    );
};

export default SteamConnectionGuide;