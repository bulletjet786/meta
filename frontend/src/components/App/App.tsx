import './App.css';
import SteamConnectionGuide from "../SteamConnectionGuide/SteamConnectionGuide";
import {ConfigProvider, Layout, theme} from "antd";

const { Header, Footer, Sider, Content } = Layout;

function App() {

    const headerStyle: React.CSSProperties = {
        textAlign: 'center',
        color: '#fff',
        height: 64,
        paddingInline: 48,
        lineHeight: '64px',
        backgroundColor: '#4096ff',
    };

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

    const footerStyle: React.CSSProperties = {
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#4096ff',
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
                    <Layout>
                        <Header style={headerStyle}>Header</Header>
                        <Content style={contentStyle}>
                            <SteamConnectionGuide />
                        </Content>
                        <Footer style={footerStyle}>Footer</Footer>
                    </Layout>
                </Layout>

            </ConfigProvider>
        </div>
    )
}

export default App

