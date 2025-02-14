import './App.css';
import SteamConnectionGuide from "../SteamConnectionGuide/SteamConnectionGuide";
import {ConfigProvider, theme} from "antd";

function App() {

    return (
        <div id='app'>
            <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
                <SteamConnectionGuide />
            </ConfigProvider>
        </div>
    )
}

export default App

