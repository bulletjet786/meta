import SteamConnectionGuide from "../SteamConnectionGuide/SteamConnectionGuide";
import {Button, ConfigProvider, Layout, Segmented, theme} from "antd";

const { Header, Footer, Sider, Content } = Layout;

function App() {

    const contentStyle: React.CSSProperties = {
        textAlign: 'center',
        minHeight: 120,
        lineHeight: '120px',
        color: '#fff',
        backgroundColor: '#0958d9',
    };

    const siderStyle: React.CSSProperties = {
        textAlign: 'center',
        lineHeight: '120px',
        color: '#fff',
        backgroundColor: '#1677ff',
    };
    const layoutStyle = {
        borderRadius: 8,
        overflow: 'hidden',
    };

    return (
        <div id='app' style={{height: '100%', width: '100%'}}>
            <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
                {/* <Layout style={{height: '100%', width: '100%'}}>
                    <Sider>
                        <Segmented
                            vertical
                            options={[
                                { value: 'List', label: <Button>引导</Button> },
                                { value: 'Kanban',  label: <Button>设置</Button> },
                            ]}
                        />
                    </Sider>
                    <Content>
                        <SteamConnectionGuide />
                    </Content>
                </Layout> */}
                <SteamConnectionGuide />
            </ConfigProvider>
        </div>
    )
}

export default App

