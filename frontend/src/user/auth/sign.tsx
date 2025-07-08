// import { userService } from "@/app/service/user";
import { Button } from "antd";
import React from 'react'
import {createRoot} from 'react-dom/client'

// userService.signInWithGoogleOAuth()

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <Page/>
    </React.StrictMode>
)

function Page() {
    return (
        <div>
            <Button onClick={() => {}}>
                Sign in with Google
            </Button>
        </div>
    )
}