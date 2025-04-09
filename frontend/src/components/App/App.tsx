import './App.css';
import SteamConnectionGuide from "../SteamConnectionGuide/SteamConnectionGuide";
import {ConfigProvider, Layout, theme} from "antd";

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
                <Layout style={layoutStyle}>
                    <Sider style={siderStyle}>
                        Sider
                    </Sider>
                    <Content style={contentStyle}>
                        <SteamConnectionGuide />
                    </Content>
                </Layout>
            </ConfigProvider>
        </div>
    )
}

export default App

