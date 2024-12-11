import {useState} from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';
import {Greet} from "../wailsjs/go/main/App";

function App() {

    // const steamControllerState, setSteamControllerStateState = useState("Disconnected")

    return (
        <div id="App">
            <h1>Steam伴侣</h1>
            <p>状态：steamControllerState</p>
            <p>如何连接上Steam</p>
            <p>1. 在Steam快捷方式中添加启动选项：--，如图：</p>
            <p>2. 重新启动Steam。</p>
            <p>3. 启动Steam后等待半分钟，如果正常连接，则上面的按钮将会变为绿色。</p>
        </div>
    )
}

export default App
