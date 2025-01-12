import {useState} from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';
import {Greet} from "../../../wailsjs/go/main/App";
import SteamConnectionGuide from "../SteamConnectionGuide/SteamConnectionGuide";

function App() {

    return (
        <SteamConnectionGuide />
    )
}

export default App


