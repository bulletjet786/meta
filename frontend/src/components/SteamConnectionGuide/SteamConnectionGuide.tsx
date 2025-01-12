import React, {useState} from 'react';
import {Button, Card, Steps, Typography} from 'antd';

const {Title, Paragraph} = Typography;
const {Step} = Steps;

const SteamConnectionGuide = () => {

    const [steamControllerState, setSteamControllerStateState] = useState("Disconnected")
    const os = "Windows"

    return (
        <Card title={<Title level={2}>Steam伴侣</Title>} style={{width: '100%'}}>
            <Paragraph strong>状态：${steamControllerState}</Paragraph>
            <Title level={3}>如何连接上Steam</Title>
            <Steps direction="vertical">
                {os === 'Windows' && (
                    <>
                        <Step title="添加启动选项" description={
                            <p>在Steam快捷方式中添加启动选项：<code>--</code>。</p>
                        } />
                        <Step title="重新启动Steam" description="点击Steam客户端的重启按钮或者关闭后手动开启。" />
                        <Step title="等待半分钟" description={
                            <p>启动Steam后请耐心等待大约30秒。如果一切正常，连接成功后，您将看到上方按钮变为绿色。</p>
                        } />
                    </>
                )}
                {os === 'SteamOS' && (
                    <>
                        <Step title="打开终端" description="使用Spotlight搜索快速打开终端。" />
                        <Step title="输入命令" description={
                            <p>在终端中输入您的特定启动命令，例如：<code>open /Applications/Steam.app --args --</code></p>
                        } />
                        <Step title="等待半分钟" description="启动Steam后请耐心等待大约30秒。检查连接状态。" />
                    </>
                )}
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