import React, {useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import { userService } from '../../../service/user'
import Signing from "./signing.tsx";

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <Page/>
    </React.StrictMode>
)

export default function Page() {
    useEffect(() => {
        // 触发 OAuth 登录
        userService.signInWithGoogleOAuth();
    }, []);

    return <Signing/>;
}