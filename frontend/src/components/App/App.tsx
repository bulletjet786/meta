import './App.css';
import SteamConnectionGuide from "../SteamConnectionGuide/SteamConnectionGuide";
import {ConfigProvider, theme} from "antd";

function App() {

    return (
        <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
            <SteamConnectionGuide />
        </ConfigProvider>
    )
}

export default App

