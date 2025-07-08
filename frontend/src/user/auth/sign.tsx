import { Button } from "antd";
import React, {useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import { userService } from '../../service/user'

// userService.signInWithGoogleOAuth()

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <Page/>
    </React.StrictMode>
)

export default function Page() {
    useEffect(() => {
        userService.signInWithGoogleOAuth()
    }, []);
    return (
        <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center p-4">
            <div className="card w-full max-w-md shadow-xl bg-base-100 text-center transition hover:shadow-2xl">
                <div className="card-body items-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>

                    <h1 className="text-2xl font-bold mt-4">Signing in...</h1>
                </div>
            </div>
        </div>
    )
}