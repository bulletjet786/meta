import './App.css';
import SteamConnectionGuide from "../SteamConnectionGuide/SteamConnectionGuide";
import {ConfigProvider, theme, Typography} from "antd";

function App() {

    return (
        <div id='app' style={{height: '100%', width: '100%'}}>
            <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
                <SteamConnectionGuide />
                <div>
                    <Typography.Title>设置</Typography.Title>
                </div>
            </ConfigProvider>
        </div>
    )
}

export default App

